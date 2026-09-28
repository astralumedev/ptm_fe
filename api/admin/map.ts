import { sql, ensureSchema } from '../_lib/db';
import { route, body, noStore } from '../_lib/http';
import { requireAdmin } from '../_lib/auth';
import { cleanFloor, cleanQr, isFloorId, isQrCode, seedMap } from '../_lib/map';

const KEEP_VERSIONS = 40;

interface SaveBody {
  action: 'save';
  floors?: Record<string, unknown>;
  stores?: { id: number; mapFloor: string; mapUnits: string[] }[];
  note?: string;
}

/**
 * Map management.
 * GET                      floors, QR points (with scan counts)
 * GET ?history=<floor>     saved versions of a floor (newest first)
 * GET ?version=<id>        one saved version
 * POST {action:'save'}     saves floors (each save is kept as a version) and store placements, atomically
 * POST {action:'qr'}       creates, updates or renames a QR point
 * POST {action:'deleteQr'} removes a QR point
 */
export default route(async (req, res) => {
  noStore(res);
  if (!(await requireAdmin(req, res))) return;
  const db = sql();

  if (req.method === 'GET') {
    if (req.query.history) {
      const floor = String(req.query.history);
      if (!isFloorId(floor)) return res.status(400).json({ error: 'Unknown floor' });
      const items = await db`SELECT id, note, created_at FROM map_history WHERE floor_id = ${floor} ORDER BY created_at DESC LIMIT ${KEEP_VERSIONS}`;
      return res.json({ items });
    }
    if (req.query.version) {
      const rows = (await db`SELECT id, floor_id, data, note, created_at FROM map_history WHERE id = ${Number(req.query.version)}`) as unknown[];
      if (!rows[0]) return res.status(404).json({ error: 'Version not found' });
      return res.json({ version: rows[0] });
    }
    let floors = (await db`SELECT id, data, updated_at FROM map_floors`.catch(() => null)) as { id: string }[] | null;
    if (!floors || !floors.length) {
      await ensureSchema();
      await seedMap();
      floors = (await db`SELECT id, data, updated_at FROM map_floors`) as { id: string }[];
    }
    const qr = await db`SELECT code, data, scans, last_scan_at, created_at FROM map_qr ORDER BY code`;
    return res.json({ floors, qr });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const b = body<Record<string, any>>(req);

  if (b.action === 'save') {
    const { floors = {}, stores = [], note } = b as SaveBody;
    const queries = [];
    const saved: string[] = [];
    for (const [id, raw] of Object.entries(floors)) {
      if (!isFloorId(id)) return res.status(400).json({ error: `Unknown floor ${id}` });
      const data = JSON.stringify(cleanFloor(raw));
      if (data.length > 800_000) return res.status(413).json({ error: 'This floor is too large to save' });
      queries.push(db`INSERT INTO map_floors (id, data, updated_at) VALUES (${id}, ${data}::jsonb, now())
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`);
      queries.push(db`INSERT INTO map_history (floor_id, data, note) VALUES (${id}, ${data}::jsonb, ${String(note || '').slice(0, 200) || null})`);
      queries.push(db`DELETE FROM map_history WHERE floor_id = ${id} AND id NOT IN
        (SELECT id FROM map_history WHERE floor_id = ${id} ORDER BY created_at DESC LIMIT ${KEEP_VERSIONS})`);
      saved.push(id);
    }
    for (const s of Array.isArray(stores) ? stores : []) {
      const id = Number(s?.id);
      if (!id) continue;
      const floor = isFloorId(s.mapFloor) ? s.mapFloor : '';
      const units = floor && Array.isArray(s.mapUnits) ? s.mapUnits.map((u) => String(u).slice(0, 40)).filter(Boolean).slice(0, 20) : [];
      const patch = JSON.stringify({ mapFloor: floor, mapUnits: units });
      queries.push(db`UPDATE content SET data = data || ${patch}::jsonb, updated_at = now() WHERE id = ${id} AND collection = 'stores'`);
    }
    if (!queries.length) return res.json({ ok: true, saved });
    await db.transaction(queries);
    return res.json({ ok: true, saved });
  }

  if (b.action === 'qr') {
    const code = String(b.code || '').toUpperCase();
    if (!isQrCode(code)) return res.status(400).json({ error: 'Codes use capital letters, numbers and hyphens (up to 24)' });
    const data = JSON.stringify(cleanQr(b.data));
    const prev = b.previousCode ? String(b.previousCode).toUpperCase() : '';
    if (prev && prev !== code) {
      const clash = (await db`SELECT code FROM map_qr WHERE code = ${code}`) as unknown[];
      if (clash.length) return res.status(409).json({ error: `Code ${code} is already used` });
      const rows = await db`UPDATE map_qr SET code = ${code}, data = ${data}::jsonb WHERE code = ${prev}
        RETURNING code, data, scans, last_scan_at, created_at`;
      return res.json({ item: rows[0] });
    }
    const rows = await db`INSERT INTO map_qr (code, data) VALUES (${code}, ${data}::jsonb)
      ON CONFLICT (code) DO UPDATE SET data = EXCLUDED.data
      RETURNING code, data, scans, last_scan_at, created_at`;
    return res.json({ item: rows[0] });
  }

  if (b.action === 'deleteQr') {
    await db`DELETE FROM map_qr WHERE code = ${String(b.code || '').toUpperCase()}`;
    return res.json({ ok: true });
  }

  res.status(400).json({ error: 'Unknown action' });
});
