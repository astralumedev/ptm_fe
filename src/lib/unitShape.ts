import type { MapPoint, WayfindingLocation } from '../types/wayfinding';

/**
 * Units are rectangles (x, y, w, h) unless they carry `points`: then they are a free-form polygon and
 * x/y/w/h is its bounding box. Everything that only needs "roughly where" uses the box; drawing,
 * routing and the shutter use the real outline.
 */
type Shape = Pick<WayfindingLocation, 'x' | 'y' | 'w' | 'h' | 'points'>;

export const isFreeform = (u: Shape) => Array.isArray(u.points) && u.points.length >= 3;

export function unitPoints(u: Shape): [number, number][] {
  if (isFreeform(u)) return u.points!;
  return [[u.x, u.y], [u.x + u.w, u.y], [u.x + u.w, u.y + u.h], [u.x, u.y + u.h]];
}

export function unitPath(u: Shape): string {
  return unitPoints(u).map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('') + 'Z';
}

export function boxOf(pts: [number, number][]) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x = Math.min(...xs), y = Math.min(...ys);
  return { x, y, w: Math.max(4, Math.max(...xs) - x), h: Math.max(4, Math.max(...ys) - y) };
}

/** Shape with new points; the bounding box follows. */
export function withPoints<T extends Shape>(u: T, pts: [number, number][]): T {
  const r = pts.map(([x, y]) => [Math.round(x), Math.round(y)] as [number, number]);
  return { ...u, points: r, ...boxOf(r) };
}

/** Moved / resized to a new bounding box; free-form points are scaled along with it. */
export function withBox<T extends Shape>(u: T, b: { x: number; y: number; w: number; h: number }): T {
  if (!isFreeform(u)) return { ...u, ...b };
  const sx = b.w / Math.max(1, u.w), sy = b.h / Math.max(1, u.h);
  return withPoints(u, u.points!.map(([x, y]) => [b.x + (x - u.x) * sx, b.y + (y - u.y) * sy]));
}

export function pointInPolygon(pts: [number, number][], x: number, y: number) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Distance from a point to the outline (0 when inside a rectangle unit's edge band is not needed). */
export function distanceToOutline(pts: [number, number][], x: number, y: number) {
  let best = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const q = nearestOnSegment(pts[i], pts[(i + 1) % pts.length], x, y);
    best = Math.min(best, Math.hypot(q.x - x, q.y - y));
  }
  return best;
}

function nearestOnSegment(a: [number, number], b: [number, number], x: number, y: number): MapPoint {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return { x: a[0] + t * dx, y: a[1] + t * dy };
}

/** Closest point on the unit's outline: where a route meets the shutter. */
export function nearestOnOutline(u: Shape, p: MapPoint): MapPoint {
  const pts = unitPoints(u);
  let best = { x: pts[0][0], y: pts[0][1] }, bestD = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const q = nearestOnSegment(pts[i], pts[(i + 1) % pts.length], p.x, p.y);
    const d = Math.hypot(q.x - p.x, q.y - p.y);
    if (d < bestD) { bestD = d; best = q; }
  }
  return best;
}

/** Visual centre for the label: the polygon centroid, or the box centre for rectangles. */
export function labelCenter(u: Shape): MapPoint {
  if (!isFreeform(u)) return { x: u.x + u.w / 2, y: u.y + u.h / 2 };
  const pts = u.points!;
  let a = 0, cx = 0, cy = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const f = pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1];
    a += f; cx += (pts[j][0] + pts[i][0]) * f; cy += (pts[j][1] + pts[i][1]) * f;
  }
  if (Math.abs(a) < 1e-6) return { x: u.x + u.w / 2, y: u.y + u.h / 2 };
  const c = { x: cx / (3 * a), y: cy / (3 * a) };
  return pointInPolygon(pts, c.x, c.y) ? c : { x: u.x + u.w / 2, y: u.y + u.h / 2 };
}
