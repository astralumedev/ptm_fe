import { sql } from './db';
import mapSeed from './mapSeed.json';
import { publicMedia } from './media';

export const FLOOR_IDS = [
  'lower_ground_floor', 'ground_floor', 'first_floor', 'second_floor', 'third_floor', 'fourth_floor', 'fifth_floor',
] as const;
export type FloorId = (typeof FLOOR_IDS)[number];
export const isFloorId = (v: unknown): v is FloorId => typeof v === 'string' && (FLOOR_IDS as readonly string[]).includes(v);

const QR_CODE = /^[A-Z0-9][A-Z0-9-]{0,23}$/;
export const isQrCode = (v: unknown): v is string => typeof v === 'string' && QR_CODE.test(v);

const num = (v: unknown, lo = -20000, hi = 20000) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : 0;
};
const str = (v: unknown, max = 120) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Keeps only the fields the map understands, so a floor document can never carry junk. */
export function cleanFloor(raw: any) {
  const locations: Record<string, unknown>[] = [];
  const seen = new Set<string>();
  for (const l of Array.isArray(raw?.locations) ? raw.locations : []) {
    const id = str(l?.id, 40);
    if (!id || seen.has(id.toLowerCase())) continue;
    seen.add(id.toLowerCase());
    const out: Record<string, unknown> = {
      id, cat: str(l.cat, 40) || 'shop',
      x: num(l.x), y: num(l.y), w: Math.max(4, num(l.w, 0)), h: Math.max(4, num(l.h, 0)),
    };
    for (const k of ['name', 'dims', 'area', 'block', 'link']) if (str(l[k])) out[k] = str(l[k]);
    // Original units behind a merge, so it can be undone later.
    if (Array.isArray(l.mergedFrom) && l.mergedFrom.length) out.mergedFrom = cleanFloor({ locations: l.mergedFrom }).locations;
    locations.push(out);
  }
  const silhouette = (Array.isArray(raw?.silhouette) ? raw.silhouette : [])
    .map((p: any) => (Array.isArray(p) ? [num(p[0]), num(p[1])] : [num(p?.x), num(p?.y)]))
    .slice(0, 400);
  const yah = raw?.youAreHere && Number.isFinite(Number(raw.youAreHere.x)) ? { x: num(raw.youAreHere.x), y: num(raw.youAreHere.y) } : null;
  const underlayUrl = publicMedia(str(raw?.underlay?.url, 600));
  const underlay = underlayUrl && /^(https:\/\/|\/media\/)/.test(underlayUrl)
    ? { url: underlayUrl, x: num(raw.underlay.x), y: num(raw.underlay.y), w: Math.max(10, num(raw.underlay.w, 0)), h: Math.max(10, num(raw.underlay.h, 0)), opacity: Math.max(0, Math.min(1, Number(raw.underlay.opacity) || 0.5)) }
    : null;
  return {
    imageSize: { w: Math.max(100, num(raw?.imageSize?.w, 0)) || 3508, h: Math.max(100, num(raw?.imageSize?.h, 0)) || 4962 },
    youAreHere: yah,
    silhouette,
    locations,
    ...(underlay ? { underlay } : {}),
  };
}

export function cleanQr(raw: any) {
  const heading = Number(raw?.heading);
  return {
    name: str(raw?.name, 80) || 'QR point',
    floorId: isFloorId(raw?.floorId) ? raw.floorId : 'ground_floor',
    x: num(raw?.x), y: num(raw?.y),
    heading: Number.isFinite(heading) ? ((Math.round(heading) % 360) + 360) % 360 : null,
    note: str(raw?.note, 200),
  };
}

const SHORT: Record<FloorId, string> = {
  lower_ground_floor: 'LG', ground_floor: 'GF', first_floor: 'F1', second_floor: 'F2', third_floor: 'F3', fourth_floor: 'F4', fifth_floor: 'F5',
};
export const qrPrefix = (f: FloorId) => SHORT[f];

/**
 * First run: loads the floor plans that shipped with the site into the database, and turns the
 * old "entrance points" list into QR points. Only fills what is empty, so it never overwrites edits.
 */
export async function seedMap() {
  const db = sql();
  const floors = mapSeed as Record<string, unknown>;
  let floorsAdded = 0;
  for (const id of FLOOR_IDS) {
    if (!floors[id]) continue;
    const rows = await db`INSERT INTO map_floors (id, data) VALUES (${id}, ${JSON.stringify(cleanFloor(floors[id]))}::jsonb)
      ON CONFLICT (id) DO NOTHING RETURNING id`;
    floorsAdded += rows.length;
  }

  let qrAdded = 0;
  const qrCount = (await db`SELECT count(*)::int AS n FROM map_qr`) as { n: number }[];
  if (!qrCount[0]?.n) {
    const block = (await db`SELECT data FROM content WHERE collection = 'blocks' AND slug = 'map-page'`) as { data: any }[];
    const entrances: { name?: string; floorId?: string; locationId?: string }[] = Array.isArray(block[0]?.data?.entrances) ? block[0].data.entrances : [];
    const floorRows = (await db`SELECT id, data FROM map_floors`) as { id: string; data: any }[];
    const byFloor = new Map(floorRows.map((r) => [r.id, r.data]));
    const perFloor = new Map<string, number>();
    for (const e of entrances) {
      if (!isFloorId(e.floorId)) continue;
      const loc = (byFloor.get(e.floorId)?.locations || []).find((l: any) => String(l.id).toLowerCase() === String(e.locationId || '').toLowerCase());
      if (!loc) continue;
      const n = (perFloor.get(e.floorId) || 0) + 1;
      perFloor.set(e.floorId, n);
      const code = `${qrPrefix(e.floorId)}-${String(n).padStart(2, '0')}`;
      const qr = cleanQr({ name: String(e.name || '').replace(/\s*\([^)]*\)\s*$/, ''), floorId: e.floorId, x: loc.x + loc.w / 2, y: loc.y + loc.h / 2 });
      const rows = await db`INSERT INTO map_qr (code, data) VALUES (${code}, ${JSON.stringify(qr)}::jsonb) ON CONFLICT (code) DO NOTHING RETURNING code`;
      qrAdded += rows.length;
    }
  }
  return { floorsAdded, qrAdded };
}
