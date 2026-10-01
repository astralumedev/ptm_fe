import type { FloorData, FloorId, MapPoint, PathResult, RouteLeg, RouteStep, WayfindingLocation } from '../types/wayfinding';
import { FLOOR_LABELS } from '../types/wayfinding';
import { distanceToOutline, isFreeform, labelCenter, nearestOnOutline, pointInPolygon } from './unitShape';

/**
 * Walking directions straight from the floor plan.
 *
 * Nobody draws corridors: every floor becomes a fine grid, the space inside the building outline
 * that no unit covers is walkable, and routes are searched on that grid (A*, preferring the middle
 * of corridors), then straightened into a few clean lines. Moving, merging or splitting a unit in the
 * editor changes the routes automatically. Floors connect through lifts and stairs that share a name
 * (or a "connects to" link set in the editor), falling back to the nearest one of the same kind.
 */

export const FLOOR_ORDER = Object.keys(FLOOR_LABELS) as FloorId[];
export const PX_PER_METRE = 31.8; // plans are ~9.7 px per foot
const CELL = 16;
const INFLATE = 8; // closes hairline gaps between neighbouring units
const WALK_SPEED = 1.1; // metres per second, window-shopping pace

/** Unit kinds people walk through rather than around. */
export const WALKABLE_CATS = new Set(['atrium', 'corridor', 'walkway', 'entrance', 'open']);
export const TRANSIT_CATS = new Set(['elevator', 'stairs']);
export const isTransitCat = (cat?: string) => !!cat && TRANSIT_CATS.has(cat);

export function silhouettePoints(sil?: FloorData['silhouette']): MapPoint[] {
  if (!Array.isArray(sil)) return [];
  return sil
    .map((p: any) => (Array.isArray(p) ? { x: Number(p[0]), y: Number(p[1]) } : { x: Number(p?.x), y: Number(p?.y) }))
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
}

export const unitCenter = (u: { x: number; y: number; w: number; h: number; points?: [number, number][] }): MapPoint => labelCenter(u);

// ---------------------------------------------------------------------------------------------
// Grid

interface Grid {
  cols: number;
  rows: number;
  walk: Uint8Array; // 1 = open floor
  owner: Int16Array; // unit index covering the cell, or -1
  cost: Float32Array; // step cost: higher next to walls, so routes keep to the middle
  clear: Uint8Array; // cells to the nearest wall (capped)
  /** Open cells in a pocket too small to be a real corridor (gaps between units). */
  pocket: Uint8Array;
  units: WayfindingLocation[];
}

function buildGrid(data: FloorData): Grid {
  const W = data.imageSize?.w || 3508;
  const H = data.imageSize?.h || 4962;
  const cols = Math.ceil(W / CELL);
  const rows = Math.ceil(H / CELL);
  const n = cols * rows;
  const walk = new Uint8Array(n);
  const owner = new Int16Array(n).fill(-1);
  const units = data.locations || [];

  const sil = silhouettePoints(data.silhouette);
  if (sil.length >= 3) {
    // Scanline fill of the building outline.
    const xs: number[] = [];
    for (let r = 0; r < rows; r++) {
      const y = (r + 0.5) * CELL;
      xs.length = 0;
      for (let i = 0, j = sil.length - 1; i < sil.length; j = i++) {
        const a = sil[i], b = sil[j];
        if ((a.y > y) !== (b.y > y)) xs.push(a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x));
      }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const c0 = Math.max(0, Math.ceil(xs[k] / CELL - 0.5));
        const c1 = Math.min(cols - 1, Math.floor(xs[k + 1] / CELL - 0.5));
        for (let c = c0; c <= c1; c++) walk[r * cols + c] = 1;
      }
    }
  } else if (units.length) {
    // No outline yet: treat the units' bounding box (plus a margin) as the building.
    const pad = 160;
    const x0 = Math.min(...units.map((u) => u.x)) - pad, y0 = Math.min(...units.map((u) => u.y)) - pad;
    const x1 = Math.max(...units.map((u) => u.x + u.w)) + pad, y1 = Math.max(...units.map((u) => u.y + u.h)) + pad;
    for (let r = Math.max(0, Math.floor(y0 / CELL)); r < Math.min(rows, Math.ceil(y1 / CELL)); r++)
      for (let c = Math.max(0, Math.floor(x0 / CELL)); c < Math.min(cols, Math.ceil(x1 / CELL)); c++) walk[r * cols + c] = 1;
  }

  units.forEach((u, i) => {
    if (WALKABLE_CATS.has(u.cat)) return;
    const poly = isFreeform(u) ? u.points! : null;
    const c0 = Math.max(0, Math.ceil((u.x - INFLATE) / CELL - 0.5));
    const c1 = Math.min(cols - 1, Math.floor((u.x + u.w + INFLATE) / CELL - 0.5));
    const r0 = Math.max(0, Math.ceil((u.y - INFLATE) / CELL - 0.5));
    const r1 = Math.min(rows - 1, Math.floor((u.y + u.h + INFLATE) / CELL - 0.5));
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const k = r * cols + c;
        const cx = (c + 0.5) * CELL, cy = (r + 0.5) * CELL;
        // Free-form units block what's inside the outline (plus the same small margin as rectangles).
        const inside = poly ? pointInPolygon(poly, cx, cy) : cx >= u.x && cx <= u.x + u.w && cy >= u.y && cy <= u.y + u.h;
        if (poly && !inside && distanceToOutline(poly, cx, cy) > INFLATE) continue;
        walk[k] = 0;
        if (inside || owner[k] < 0) owner[k] = i;
      }
    }
  });

  // Distance to the nearest wall (multi-source BFS), capped: 1 = touching a wall.
  const CAP = 10;
  const clear = new Uint8Array(n);
  const queue = new Int32Array(n);
  let head = 0, tail = 0;
  for (let k = 0; k < n; k++) {
    if (!walk[k]) { clear[k] = 0; queue[tail++] = k; } else clear[k] = 255;
  }
  while (head < tail) {
    const k = queue[head++];
    const d = clear[k] + 1;
    if (d > CAP) continue;
    const r = (k / cols) | 0, c = k - r * cols;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const rr = r + dr, cc = c + dc;
      if (rr < 0 || cc < 0 || rr >= rows || cc >= cols) continue;
      const m = rr * cols + cc;
      if (clear[m] > d) { clear[m] = d; queue[tail++] = m; }
    }
  }
  const cost = new Float32Array(n);
  for (let k = 0; k < n; k++) {
    const c = Math.min(clear[k], CAP);
    cost[k] = 1 + 1.4 / Math.max(1, c);
  }
  // Label connected open areas; tiny ones are leftover slivers a start point should never snap into.
  const comp = new Int32Array(n).fill(-1);
  const sizes: number[] = [];
  for (let k0 = 0; k0 < n; k0++) {
    if (!walk[k0] || comp[k0] >= 0) continue;
    const id = sizes.length;
    head = 0; tail = 0; queue[tail++] = k0; comp[k0] = id;
    while (head < tail) {
      const k = queue[head++];
      const r = (k / cols) | 0, c = k - r * cols;
      const nb = [c > 0 ? k - 1 : -1, c < cols - 1 ? k + 1 : -1, r > 0 ? k - cols : -1, r < rows - 1 ? k + cols : -1];
      for (const m of nb) if (m >= 0 && walk[m] && comp[m] < 0) { comp[m] = id; queue[tail++] = m; }
    }
    sizes.push(tail);
  }
  const big = Math.max(0, ...sizes);
  const pocket = new Uint8Array(n);
  for (let k = 0; k < n; k++) if (walk[k] && sizes[comp[k]] < Math.max(60, big * 0.08)) pocket[k] = 1;
  return { cols, rows, walk, owner, cost, clear, pocket, units };
}

const gridCache = new WeakMap<FloorData, Grid>();
function gridFor(data: FloorData) {
  let g = gridCache.get(data);
  if (!g) { g = buildGrid(data); gridCache.set(data, g); }
  return g;
}

// ---------------------------------------------------------------------------------------------
// Search

class Heap {
  private k: number[] = [];
  private p: number[] = [];
  get size() { return this.k.length; }
  push(key: number, pri: number) {
    const k = this.k, p = this.p;
    let i = k.length;
    k.push(key); p.push(pri);
    while (i > 0) {
      const up = (i - 1) >> 1;
      if (p[up] <= pri) break;
      k[i] = k[up]; p[i] = p[up]; i = up;
    }
    k[i] = key; p[i] = pri;
  }
  pop(): number {
    const k = this.k, p = this.p;
    const top = k[0];
    const lk = k.pop()!, lp = p.pop()!;
    if (k.length) {
      let i = 0;
      const n = k.length;
      for (;;) {
        const l = 2 * i + 1;
        if (l >= n) break;
        const r = l + 1;
        const m = r < n && p[r] < p[l] ? r : l;
        if (p[m] >= lp) break;
        k[i] = k[m]; p[i] = p[m]; i = m;
      }
      k[i] = lk; p[i] = lp;
    }
    return top;
  }
}

interface SearchResult {
  prev: Int32Array;
  dist: Float32Array;
  /** Goal unit index -> first cell reached inside it. */
  reached: Map<number, number>;
}

const SQRT2 = Math.SQRT2;
const DIRS = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, SQRT2], [1, -1, SQRT2], [-1, 1, SQRT2], [-1, -1, SQRT2]];

/**
 * Dijkstra / A* from `sources` until every unit in `goals` is reached. Units in `open` can be
 * walked into (the start and the destination); every other unit is a wall.
 */
function search(g: Grid, sources: number[], goals: Set<number>, open: Set<number>, target?: MapPoint): SearchResult {
  const n = g.cols * g.rows;
  const dist = new Float32Array(n).fill(Infinity);
  const prev = new Int32Array(n).fill(-1);
  const done = new Uint8Array(n);
  const heap = new Heap();
  const reached = new Map<number, number>();
  const pass = (k: number) => g.walk[k] === 1 || (g.owner[k] >= 0 && open.has(g.owner[k]));
  const tc = target ? target.x / CELL - 0.5 : 0, tr = target ? target.y / CELL - 0.5 : 0;
  const h = (k: number) => {
    if (!target) return 0;
    const r = (k / g.cols) | 0, c = k - r * g.cols;
    const dx = Math.abs(c - tc), dy = Math.abs(r - tr);
    return (Math.max(dx, dy) + (SQRT2 - 1) * Math.min(dx, dy)) * 1.14; // min step cost is ~1.14
  };
  for (const s of sources) { dist[s] = 0; heap.push(s, h(s)); }

  while (heap.size) {
    const k = heap.pop();
    if (done[k]) continue;
    done[k] = 1;
    const own = g.owner[k];
    if (own >= 0 && goals.has(own) && !reached.has(own) && !g.walk[k]) {
      reached.set(own, k);
      if (reached.size === goals.size) break;
      continue; // don't walk through a goal unit to reach another one
    }
    const r = (k / g.cols) | 0, c = k - r * g.cols;
    for (const [dc, dr, len] of DIRS) {
      const rr = r + dr, cc = c + dc;
      if (rr < 0 || cc < 0 || rr >= g.rows || cc >= g.cols) continue;
      const m = rr * g.cols + cc;
      if (done[m] || !pass(m)) continue;
      if (len !== 1 && (!pass(r * g.cols + cc) || !pass(rr * g.cols + c))) continue; // no corner cutting
      const nd = dist[k] + len * (g.cost[k] + g.cost[m]) * 0.5;
      if (nd < dist[m]) { dist[m] = nd; prev[m] = k; heap.push(m, nd + h(m)); }
    }
  }
  return { prev, dist, reached };
}

const cellOf = (g: Grid, p: MapPoint) => {
  const c = Math.max(0, Math.min(g.cols - 1, Math.floor(p.x / CELL)));
  const r = Math.max(0, Math.min(g.rows - 1, Math.floor(p.y / CELL)));
  return r * g.cols + c;
};
const centerOf = (g: Grid, k: number): MapPoint => {
  const r = (k / g.cols) | 0, c = k - r * g.cols;
  return { x: (c + 0.5) * CELL, y: (r + 0.5) * CELL };
};

/** Nearest open-floor cell to a point (a QR code may sit just inside a shop front). */
function snap(g: Grid, p: MapPoint): number {
  const start = cellOf(g, p);
  if (g.walk[start] && !g.pocket[start]) return start;
  const r0 = (start / g.cols) | 0, c0 = start - r0 * g.cols;
  for (let rad = 1; rad < 60; rad++) {
    let best = -1, bestD = Infinity;
    for (let dr = -rad; dr <= rad; dr++) for (let dc = -rad; dc <= rad; dc++) {
      if (Math.max(Math.abs(dr), Math.abs(dc)) !== rad) continue;
      const r = r0 + dr, c = c0 + dc;
      if (r < 0 || c < 0 || r >= g.rows || c >= g.cols) continue;
      const k = r * g.cols + c;
      if (!g.walk[k] || g.pocket[k]) continue;
      const d = dr * dr + dc * dc;
      if (d < bestD) { bestD = d; best = k; }
    }
    if (best >= 0) return best;
  }
  return start;
}

function unitCells(g: Grid, idx: number): number[] {
  const u = g.units[idx];
  const out: number[] = [];
  const c0 = Math.max(0, Math.floor(u.x / CELL)), c1 = Math.min(g.cols - 1, Math.floor((u.x + u.w) / CELL));
  const r0 = Math.max(0, Math.floor(u.y / CELL)), r1 = Math.min(g.rows - 1, Math.floor((u.y + u.h) / CELL));
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (g.owner[r * g.cols + c] === idx) out.push(r * g.cols + c);
  return out;
}

/** Straight line between two cells that stays on walkable floor and off the walls. */
function lineClear(g: Grid, a: number, b: number, open: Set<number>): boolean {
  const pa = centerOf(g, a), pb = centerOf(g, b);
  const need = Math.min(2, g.clear[a] || 2, g.clear[b] || 2);
  const len = Math.hypot(pb.x - pa.x, pb.y - pa.y);
  const steps = Math.ceil(len / (CELL / 3));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const k = cellOf(g, { x: pa.x + (pb.x - pa.x) * t, y: pa.y + (pb.y - pa.y) * t });
    const own = g.owner[k];
    if (g.walk[k]) { if (g.clear[k] < need) return false; continue; }
    if (!(own >= 0 && open.has(own))) return false;
  }
  return true;
}

function cellsToPoints(g: Grid, cells: number[], open: Set<number>): MapPoint[] {
  if (cells.length < 2) return cells.map((k) => centerOf(g, k));
  const out: MapPoint[] = [centerOf(g, cells[0])];
  let i = 0;
  while (i < cells.length - 1) {
    let j = i + 1;
    while (j + 1 < cells.length && lineClear(g, cells[i], cells[j + 1], open)) j++;
    out.push(centerOf(g, cells[j]));
    i = j;
  }
  return out;
}

function walkBack(prev: Int32Array, end: number): number[] {
  const cells: number[] = [];
  for (let k = end; k >= 0; k = prev[k]) cells.push(k);
  return cells.reverse();
}

/** Last point moved onto the unit's edge: the route stops at the shutter, not inside the shop. */
function toDoor(pts: MapPoint[], u: WayfindingLocation): MapPoint[] {
  if (pts.length < 2) return pts;
  const before = pts[pts.length - 2];
  const door = nearestOnOutline(u, before);
  // If the approach point is itself inside the unit, step back to the last point outside it.
  return [...pts.slice(0, -1), door];
}

const pathMetres = (pts: MapPoint[]) => {
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return d / PX_PER_METRE;
};

/** Which side the destination is on, relative to the direction of the last stretch of walking. */
function sideOf(pts: MapPoint[], u: WayfindingLocation): 'left' | 'right' | 'ahead' {
  if (pts.length < 2) return 'ahead';
  const b = pts[pts.length - 1];
  let a = pts[pts.length - 2];
  for (let i = pts.length - 2; i >= 0 && Math.hypot(b.x - pts[i].x, b.y - pts[i].y) < 40; i--) a = pts[i];
  const c = unitCenter(u);
  const dx = b.x - a.x, dy = b.y - a.y;
  const ex = c.x - b.x, ey = c.y - b.y;
  const cross = dx * ey - dy * ex;
  const dot = dx * ex + dy * ey;
  const len = Math.hypot(dx, dy) * Math.hypot(ex, ey) || 1;
  if (dot / len > 0.7) return 'ahead';
  return cross > 0 ? 'right' : 'left'; // screen y points down
}

// ---------------------------------------------------------------------------------------------
// Lifts and stairs between floors

interface ShaftStop { floorId: FloorId; idx: number; unit: WayfindingLocation }
interface Shaft { key: string; cat: 'elevator' | 'stairs'; stops: ShaftStop[] }

const norm = (s: string) => s.trim().toUpperCase().replace(/\s+/g, '');

function buildShafts(floors: Partial<Record<FloorId, FloorData>>): Shaft[] {
  const groups = new Map<string, Shaft>();
  for (const f of FLOOR_ORDER) {
    (floors[f]?.locations || []).forEach((u, idx) => {
      if (!isTransitCat(u.cat)) return;
      const cat = u.cat as Shaft['cat'];
      const key = `${cat}|${norm(u.link || u.id)}`;
      if (!groups.has(key)) groups.set(key, { key, cat, stops: [] });
      const g = groups.get(key)!;
      if (!g.stops.some((s) => s.floorId === f)) g.stops.push({ floorId: f, idx, unit: u });
    });
  }
  // A lift that exists on one floor only is joined to the nearest lift of the same kind above/below.
  const all = [...groups.values()];
  for (const lone of all.filter((s) => s.stops.length === 1)) {
    const stop = lone.stops[0];
    if (stop.unit.link) continue; // explicitly named: trust the editor
    const c = unitCenter(stop.unit);
    let best: Shaft | null = null, bestD = 420;
    for (const other of all) {
      if (other === lone || other.cat !== lone.cat || !other.stops.length || other.stops.some((s) => s.floorId === stop.floorId)) continue;
      for (const s of other.stops) {
        const d = Math.hypot(unitCenter(s.unit).x - c.x, unitCenter(s.unit).y - c.y);
        if (d < bestD) { bestD = d; best = other; }
      }
    }
    if (best) { best.stops.push(stop); lone.stops = []; }
  }
  return all.filter((s) => s.stops.length > 1);
}

const floorIndex = (f: FloorId) => FLOOR_ORDER.indexOf(f);

function rideMetres(cat: Shaft['cat'], a: FloorId, b: FloorId, avoidStairs: boolean) {
  const floors = Math.abs(floorIndex(a) - floorIndex(b));
  if (cat === 'elevator') return 28 + 4 * floors; // waiting for the lift counts
  return (avoidStairs ? 400 : 14) * floors;
}

// ---------------------------------------------------------------------------------------------
// Public API

export interface RouteStart { floorId: FloorId; x: number; y: number }
export interface RouteTarget { floorId: FloorId; unitId: string }

export interface RouteTexts {
  floorName: (f: FloorId) => string;
  sameFloor: string; // {m} {name} {side}
  toTransit: string; // {m} {transit} {direction} {floor}
  arrive: string; // {m} {name} {side} {floor}
  sides: { left: string; right: string; ahead: string };
  lift: string;
  stairs: string;
  up: string;
  down: string;
}

export const DEFAULT_ROUTE_TEXTS: RouteTexts = {
  floorName: (f) => FLOOR_LABELS[f],
  sameFloor: 'Walk about {m} m to {name}, {side}.',
  toTransit: 'Walk about {m} m to the {transit} and go {direction} to {floor}.',
  arrive: 'On {floor}, walk about {m} m to {name}, {side}.',
  sides: { left: 'on your left', right: 'on your right', ahead: 'straight ahead' },
  lift: 'lift',
  stairs: 'stairs',
  up: 'up',
  down: 'down',
};

const fillT = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (m, k) => (k in v ? String(v[k]) : m));
const roundM = (m: number) => (m < 20 ? Math.max(5, Math.round(m / 5) * 5) : Math.round(m / 10) * 10);

interface LegPlan { floorId: FloorId; cells: number[]; open: Set<number>; endUnit: WayfindingLocation; end: RouteLeg['end'] }

/**
 * Shortest walk from a point to a unit, across floors when needed.
 * Returns null when the destination can't be reached (e.g. a floor with no lift or stairs yet).
 */
export function planRoute(
  floors: Partial<Record<FloorId, FloorData>>,
  start: RouteStart,
  target: RouteTarget,
  destName: string,
  texts: RouteTexts = DEFAULT_ROUTE_TEXTS,
  opts: { avoidStairs?: boolean } = {},
): PathResult | null {
  const S = floors[start.floorId], D = floors[target.floorId];
  if (!S || !D) return null;
  const gS = gridFor(S), gD = gridFor(D);
  const destIdx = D.locations.findIndex((l) => l.id.toLowerCase() === target.unitId.toLowerCase());
  if (destIdx < 0) return null;
  const dest = D.locations[destIdx];

  const startCell = (() => {
    const k = cellOf(gS, start);
    return gS.owner[k] >= 0 && !gS.walk[k] ? k : snap(gS, start);
  })();
  const startOwner = gS.walk[startCell] ? -1 : gS.owner[startCell];
  const openStart = new Set<number>(startOwner >= 0 ? [startOwner] : []);

  const legs: LegPlan[] = [];

  if (start.floorId === target.floorId) {
    const open = new Set([...openStart, destIdx]);
    const res = search(gS, [startCell], new Set([destIdx]), open, unitCenter(dest));
    const end = res.reached.get(destIdx);
    if (end == null) return null;
    legs.push({ floorId: start.floorId, cells: walkBack(res.prev, end), open, endUnit: dest, end: { kind: 'destination', unitId: dest.id } });
  } else {
    const shafts = buildShafts(floors);
    const avoid = !!opts.avoidStairs;
    const onFloor = (f: FloorId) => shafts.flatMap((s) => s.stops.filter((x) => x.floorId === f).map((x) => ({ shaft: s, stop: x })));

    // Walk from the start to every lift/stair on this floor, and from the destination back to every one on its floor.
    const sStops = onFloor(start.floorId), dStops = onFloor(target.floorId);
    if (!sStops.length || !dStops.length) return null;
    const fromStart = search(gS, [startCell], new Set(sStops.map((x) => x.stop.idx)), new Set([...openStart, ...sStops.map((x) => x.stop.idx)]));
    const destCells = unitCells(gD, destIdx);
    const fromDest = search(gD, destCells.length ? destCells : [snap(gD, unitCenter(dest))], new Set(dStops.map((x) => x.stop.idx)), new Set([destIdx, ...dStops.map((x) => x.stop.idx)]));
    const costAt = (r: SearchResult, idx: number) => { const k = r.reached.get(idx); return k == null ? Infinity : r.dist[k] * CELL / PX_PER_METRE; };

    type Plan = { cost: number; hops: { shaft: Shaft; from: ShaftStop; to: ShaftStop }[]; mid?: { floorId: FloorId; res: SearchResult; endIdx: number } };
    let best: Plan | null = null;

    // One ride.
    for (const s of sStops) {
      const to = s.shaft.stops.find((x) => x.floorId === target.floorId);
      if (!to) continue;
      const cost = costAt(fromStart, s.stop.idx) + rideMetres(s.shaft.cat, start.floorId, target.floorId, avoid) + costAt(fromDest, to.idx);
      if (cost < (best?.cost ?? Infinity)) best = { cost, hops: [{ shaft: s.shaft, from: s.stop, to }] };
    }

    // Change lifts once when no single lift/stair links the two floors.
    if (!best) {
      for (const s of sStops) {
        if (!Number.isFinite(costAt(fromStart, s.stop.idx))) continue;
        for (const mid of s.shaft.stops) {
          if (mid.floorId === start.floorId || mid.floorId === target.floorId) continue;
          const F = floors[mid.floorId];
          if (!F) continue;
          const gF = gridFor(F);
          const outs = dStops.filter((d) => d.shaft !== s.shaft && d.shaft.stops.some((x) => x.floorId === mid.floorId));
          if (!outs.length) continue;
          const outStops = outs.map((d) => d.shaft.stops.find((x) => x.floorId === mid.floorId)!);
          const res = search(gF, unitCells(gF, mid.idx), new Set(outStops.map((x) => x.idx)), new Set([mid.idx, ...outStops.map((x) => x.idx)]));
          outs.forEach((d, i) => {
            const midTo = outStops[i];
            const cost = costAt(fromStart, s.stop.idx) + rideMetres(s.shaft.cat, start.floorId, mid.floorId, avoid)
              + costAt(res, midTo.idx) + rideMetres(d.shaft.cat, mid.floorId, target.floorId, avoid) + costAt(fromDest, d.stop.idx);
            if (cost < (best?.cost ?? Infinity)) {
              best = { cost, hops: [{ shaft: s.shaft, from: s.stop, to: mid }, { shaft: d.shaft, from: midTo, to: d.stop }], mid: { floorId: mid.floorId, res, endIdx: midTo.idx } };
            }
          });
        }
      }
    }
    if (!best || !Number.isFinite(best.cost)) return null;
    const plan: Plan = best;

    const first = plan.hops[0];
    legs.push({
      floorId: start.floorId,
      cells: walkBack(fromStart.prev, fromStart.reached.get(first.from.idx)!),
      open: new Set([...openStart, first.from.idx]),
      endUnit: first.from.unit,
      end: { kind: 'transit', unitId: first.from.unit.id, cat: first.shaft.cat, toFloor: first.to.floorId },
    });
    if (plan.mid) {
      const second = plan.hops[1];
      legs.push({
        floorId: plan.mid.floorId,
        cells: walkBack(plan.mid.res.prev, plan.mid.res.reached.get(plan.mid.endIdx)!),
        open: new Set([first.to.idx, plan.mid.endIdx]),
        endUnit: second.from.unit,
        end: { kind: 'transit', unitId: second.from.unit.id, cat: second.shaft.cat, toFloor: target.floorId },
      });
    }
    const last = plan.hops[plan.hops.length - 1];
    legs.push({
      floorId: target.floorId,
      cells: walkBack(fromDest.prev, fromDest.reached.get(last.to.idx)!).reverse(),
      open: new Set([destIdx, last.to.idx]),
      endUnit: dest,
      end: { kind: 'destination', unitId: dest.id },
    });
  }

  // Turn grid cells into a few straight lines ending at the shutter.
  const outLegs: RouteLeg[] = legs.map((leg, i) => {
    const g = gridFor(floors[leg.floorId]!);
    let pts = cellsToPoints(g, leg.cells, leg.open);
    if (i === 0) pts[0] = { x: start.x, y: start.y };
    else {
      // Leave the lift from its door rather than its middle.
      const from = legs[i - 1];
      const shaftUnit = g.units[g.owner[leg.cells[0]]] || from.endUnit;
      if (pts.length > 1) pts[0] = nearestOnOutline(shaftUnit, pts[1]);
    }
    pts = toDoor(pts, leg.endUnit);
    const end = leg.end.kind === 'destination' ? { ...leg.end, side: sideOf(pts, leg.endUnit) } : leg.end;
    return { floorId: leg.floorId, points: pts.map((p) => ({ x: Math.round(p.x), y: Math.round(p.y) })), metres: pathMetres(pts), end };
  });

  const steps: RouteStep[] = outLegs.map((leg, i) => {
    const m = roundM(leg.metres);
    if (leg.end.kind === 'transit') {
      const up = floorIndex(leg.end.toFloor) > floorIndex(leg.floorId);
      return {
        text: fillT(texts.toTransit, { m, transit: leg.end.cat === 'elevator' ? texts.lift : texts.stairs, direction: up ? texts.up : texts.down, floor: texts.floorName(leg.end.toFloor) }),
        floorId: leg.floorId, type: 'floor_change', icon: leg.end.cat, legIndex: i,
      };
    }
    const side = texts.sides[leg.end.side || 'ahead'];
    return {
      text: fillT(i === 0 ? texts.sameFloor : texts.arrive, { m, name: destName, side, floor: texts.floorName(leg.floorId) }),
      floorId: leg.floorId, type: 'destination', legIndex: i,
    };
  });

  const totalDistance = outLegs.reduce((a, l) => a + l.metres, 0);
  const rides = outLegs.filter((l) => l.end.kind === 'transit').length;
  const estTimeMinutes = Math.max(1, Math.round((totalDistance / WALK_SPEED + rides * 45) / 60));
  return { steps, legs: outLegs, totalDistance, estTimeMinutes };
}

/** Floors with no lift or stairs that links them to the rest of the building (shown as warnings in the editor). */
export function unreachableFloors(floors: Partial<Record<FloorId, FloorData>>): FloorId[] {
  const shafts = buildShafts(floors);
  const present = FLOOR_ORDER.filter((f) => floors[f]);
  const linked = new Set<FloorId>();
  for (const s of shafts) for (const x of s.stops) linked.add(x.floorId);
  return present.length > 1 ? present.filter((f) => !linked.has(f)) : [];
}

/** SVG path through the points with softly rounded corners. */
export function roundedPath(pts: MapPoint[], radius = 70): string {
  if (!pts.length) return '';
  if (pts.length < 3) return pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1], b = pts[i], c = pts[i + 1];
    const l1 = Math.hypot(b.x - a.x, b.y - a.y), l2 = Math.hypot(c.x - b.x, c.y - b.y);
    const r = Math.min(radius, l1 / 2, l2 / 2);
    const p1 = { x: b.x - ((b.x - a.x) / l1) * r, y: b.y - ((b.y - a.y) / l1) * r };
    const p2 = { x: b.x + ((c.x - b.x) / l2) * r, y: b.y + ((c.y - b.y) / l2) * r };
    d += ` L${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Q${b.x} ${b.y} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  const z = pts[pts.length - 1];
  return `${d} L${z.x} ${z.y}`;
}
