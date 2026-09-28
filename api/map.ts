import { createHash } from 'crypto';
import { sql } from './_lib/db';
import { route, body } from './_lib/http';
import { cleanFloor, isQrCode } from './_lib/map';
import mapSeed from './_lib/mapSeed.json';

interface FloorRow { id: string; data: Record<string, unknown> }
interface QrRow { code: string; data: Record<string, unknown> }

/**
 * Public mall map: every floor plan plus the QR "you are here" points, in one cached response.
 * POST ?scan=CODE counts a QR scan (fire-and-forget from the visitor's phone).
 */
export default route(async (req, res) => {
  const db = sql();

  if (req.method === 'POST') {
    const code = String(req.query.scan || body<{ code?: string }>(req).code || '').toUpperCase();
    res.setHeader('Cache-Control', 'no-store');
    if (!isQrCode(code)) return res.status(400).json({ error: 'Unknown code' });
    await db`UPDATE map_qr SET scans = scans + 1, last_scan_at = now() WHERE code = ${code}`.catch(() => {});
    return res.json({ ok: true });
  }
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  let floors: Record<string, unknown> = {};
  let qr: unknown[] = [];
  try {
    const [f, q] = await Promise.all([
      db`SELECT id, data FROM map_floors` as unknown as Promise<FloorRow[]>,
      db`SELECT code, data FROM map_qr ORDER BY code` as unknown as Promise<QrRow[]>,
    ]);
    floors = Object.fromEntries(f.map((r) => [r.id, r.data]));
    qr = q.map((r) => ({ ...r.data, code: r.code }));
  } catch (e) {
    // Before the first admin sign-in creates the tables, serve the plans that shipped with the site.
    if (!/does not exist/.test(String(e))) throw e;
  }
  if (!Object.keys(floors).length) {
    floors = Object.fromEntries(Object.entries(mapSeed as Record<string, unknown>).map(([id, d]) => [id, cleanFloor(d)]));
  }

  const json = JSON.stringify({ floors, qr });
  const etag = '"' + createHash('sha1').update(json).digest('base64url') + '"';
  res.setHeader('ETag', etag);
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.setHeader('CDN-Cache-Control', 'public, s-maxage=30, stale-while-revalidate=86400');
  if (req.headers['if-none-match'] === etag) return res.status(304).end();
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(json);
});
