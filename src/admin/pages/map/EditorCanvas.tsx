import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { FloorData, FloorId, MapPoint, QrPoint, RouteLeg, WayfindingLocation } from '../../../types/wayfinding';
import { MapCanvas, MapCanvasHandle, Fixed, boundsOf } from '../../../app/components/map/MapCanvas';
import { FloorPlan, UnitOccupant, UnitStyle } from '../../../app/components/map/FloorPlan';
import { MapDefs, RouteLayer, YouAreHere } from '../../../app/components/map/RouteLayer';
import { silhouettePoints } from '../../../lib/mapRouter';
import { hexRgb } from '../../../lib/color';
import type { MapDoc, Rect } from './mapDoc';

export type Tool = 'select' | 'draw' | 'outline' | 'qr' | 'route';
export type Selection = { kind: 'units'; ids: string[] } | { kind: 'qr'; key: string } | null;

export interface StoreMeta { id: number; name: string; cat: string; slug: string; logo?: string }

interface Props {
  floorId: FloorId;
  floor: FloorData;
  doc: MapDoc;
  stores: Map<number, StoreMeta>;
  colorOf: (cat: string) => string;
  tool: Tool;
  selection: Selection;
  onSelect: (s: Selection) => void;
  onMoveUnits: (moves: { id: string; rect: Rect }[]) => void;
  onDrawn: (r: Rect) => void;
  onSilhouette: (pts: [number, number][]) => void;
  onPlaceQr: (p: MapPoint) => void;
  onMoveQr: (key: string, p: Partial<QrPoint>) => void;
  onRouteClick: (p: MapPoint, unit: WayfindingLocation | null) => void;
  /** Clicking a unit places this store (from the Stores panel). */
  placing: StoreMeta | null;
  onPlaceStore: (unit: WayfindingLocation) => void;
  route: { start: MapPoint | null; leg: RouteLeg | null; key: string; destLabel?: string; transitText?: string };
  problemUnits: Set<string>;
  /** Extra drawing on top of the plan (e.g. the split preview). */
  extra?: React.ReactNode;
  /** Show the traced floor-plan image under the units. */
  showUnderlay: boolean;
  /** Align mode: the floor-plan image can be dragged and resized to line up with the units. */
  aligning: boolean;
  onUnderlay: (u: NonNullable<FloorData['underlay']>) => void;
}

export interface EditorCanvasHandle extends MapCanvasHandle { fitFloor(): void }

const THEME = { plate: '#ffffff', plateStroke: '#8a93a3', label: '#1b1e27', labelHalo: 'rgba(255,255,255,0.9)' };
const ACCENT = '#2e3094';
type Handle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
const HANDLES: Handle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

type Drag =
  | { mode: 'move'; ids: string[]; start: MapPoint; orig: Map<string, Rect>; dx: number; dy: number; guides: Guide[] }
  | { mode: 'resize'; id: string; handle: Handle; start: MapPoint; orig: Rect; rect: Rect; guides: Guide[] }
  | { mode: 'draw'; start: MapPoint; rect: Rect; guides: Guide[] }
  | { mode: 'marquee'; start: MapPoint; rect: Rect; additive: boolean }
  | { mode: 'vertex'; index: number; pts: [number, number][] }
  | { mode: 'qr'; key: string; start: MapPoint; orig: MapPoint; dx: number; dy: number }
  | { mode: 'heading'; key: string; center: MapPoint; heading: number }
  | { mode: 'ulmove'; start: MapPoint; orig: Rect; rect: Rect }
  | { mode: 'ulsize'; corner: 'nw' | 'ne' | 'se' | 'sw'; start: MapPoint; orig: Rect; rect: Rect };

type Guide = { axis: 'x' | 'y'; at: number };

const norm = (a: MapPoint, b: MapPoint): Rect => ({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) });

export const EditorCanvas = forwardRef<EditorCanvasHandle, Props>(function EditorCanvas(p, ref) {
  const { floorId, floor, doc, stores, tool, selection } = p;
  const canvas = useRef<MapCanvasHandle>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  dragRef.current = drag;
  const props = useRef(p);
  props.current = p;

  const fit = useMemo(() => {
    const pts = silhouettePoints(floor.silhouette);
    const all = pts.length >= 3 ? pts : floor.locations.flatMap((l) => [{ x: l.x, y: l.y }, { x: l.x + l.w, y: l.y + l.h }]);
    return boundsOf(all.length ? all : [{ x: 0, y: 0 }, { x: floor.imageSize?.w || 3508, y: floor.imageSize?.h || 4962 }], 60);
  }, [floor]);

  useImperativeHandle(ref, () => ({
    ...(canvas.current as MapCanvasHandle),
    flyToBox: (...a) => canvas.current?.flyToBox(...a),
    flyTo: (...a) => canvas.current?.flyTo(...a),
    zoomBy: (f) => canvas.current?.zoomBy(f),
    toMap: (x, y) => canvas.current!.toMap(x, y),
    view: () => canvas.current!.view(),
    dragged: () => canvas.current?.dragged() || false,
    svg: () => canvas.current?.svg() || null,
    fitFloor: () => { if (fit) canvas.current?.flyToBox(fit, { ms: 450 }); },
  }), [fit]);

  // ---- who is where on this floor
  const occupant = useMemo(() => {
    const m = new Map<string, UnitOccupant & { storeIds: number[] }>();
    for (const [id, pl] of Object.entries(doc.place)) {
      if (pl.floor !== floorId || !pl.units.length) continue;
      const s = stores.get(Number(id));
      if (!s) continue;
      for (const u of pl.units) {
        const k = u.toLowerCase();
        const prev = m.get(k);
        if (prev) prev.storeIds.push(s.id);
        else m.set(k, { name: s.name, cat: s.cat, units: pl.units, storeIds: [s.id] });
      }
    }
    return m;
  }, [doc.place, floorId, stores]);
  const occupantOf = useCallback((id: string) => occupant.get(id.toLowerCase()) || null, [occupant]);

  const selectedIds = useMemo(() => new Set(selection?.kind === 'units' ? selection.ids : []), [selection]);

  // ---- live geometry while dragging
  const shown = useMemo<FloorData>(() => {
    if (!drag) return floor;
    if (drag.mode === 'move') {
      return { ...floor, locations: floor.locations.map((u) => { const o = drag.orig.get(u.id); return o ? { ...u, x: o.x + drag.dx, y: o.y + drag.dy } : u; }) };
    }
    if (drag.mode === 'resize') return { ...floor, locations: floor.locations.map((u) => (u.id === drag.id ? { ...u, ...drag.rect } : u)) };
    if (drag.mode === 'vertex') return { ...floor, silhouette: drag.pts };
    if ((drag.mode === 'ulmove' || drag.mode === 'ulsize') && floor.underlay) return { ...floor, underlay: { ...floor.underlay, ...drag.rect } };
    return floor;
  }, [floor, drag]);

  const { problemUnits, colorOf, placing } = p;
  const styleOf = useCallback((u: WayfindingLocation, occ: UnitOccupant | null): UnitStyle => {
    const sel = selectedIds.has(u.id);
    const problem = problemUnits.has(u.id.toLowerCase());
    const color = colorOf(occ?.cat || u.cat);
    const [r, g, b] = hexRgb(color);
    const base: UnitStyle = !occ && u.cat === 'shop'
      ? { fill: '#f4f5f8', stroke: '#b9bfca', labelColor: '#8a909c' }
      : u.cat === 'void' ? { fill: '#e7e9ee', stroke: '#c6cad3', labelColor: '#8a909c' }
      : u.cat === 'atrium' || u.cat === 'corridor' || u.cat === 'walkway' || u.cat === 'entrance' ? { fill: 'rgba(232,161,58,0.08)', stroke: 'rgba(200,140,40,0.45)', labelColor: '#a16207' }
      : { fill: `rgba(${r},${g},${b},0.2)`, stroke: `rgba(${r},${g},${b},0.85)`, labelColor: '#1b1e27' };
    if (problem) { base.stroke = '#d92d20'; base.strokeWidth = 2; }
    if (sel) return { ...base, stroke: ACCENT, strokeWidth: 2.6, fill: occ ? `rgba(${r},${g},${b},0.38)` : 'rgba(46,48,148,0.08)' };
    if (placing) return { ...base, opacity: !occ && u.cat === 'shop' ? 1 : 0.55 };
    return base;
  }, [selectedIds, colorOf, problemUnits, placing]);

  // ---- snapping: edges of other units + the building outline's corners
  const edges = useMemo(() => {
    const xs: number[] = [], ys: number[] = [];
    for (const u of floor.locations) { xs.push(u.x, u.x + u.w); ys.push(u.y, u.y + u.h); }
    for (const q of silhouettePoints(floor.silhouette)) { xs.push(q.x); ys.push(q.y); }
    return { xs, ys };
  }, [floor]);

  const snapTol = () => 7 / (canvas.current?.view().k || 1);

  const snapRect = (r: Rect, exclude: Set<string>, sides: { l?: boolean; r?: boolean; t?: boolean; b?: boolean } = { l: true, r: true, t: true, b: true }, move = false) => {
    const tol = snapTol();
    const own = new Set<number>();
    floor.locations.forEach((u) => { if (exclude.has(u.id)) { own.add(u.x); own.add(u.x + u.w); own.add(u.y); own.add(u.y + u.h); } });
    const xs = edges.xs.filter((x) => !own.has(x) || !move), ys = edges.ys.filter((y) => !own.has(y) || !move);
    const best = (vals: number[], cands: number[]) => {
      let d = Infinity, at = 0, off = 0;
      for (const v of vals) for (const c of cands) { const dd = Math.abs(c - v); if (dd < d) { d = dd; at = c; off = c - v; } }
      return d <= tol ? { at, off } : null;
    };
    const guides: Guide[] = [];
    let { x, y, w, h } = r;
    if (move) {
      const bx = best([x, x + w], xs), by = best([y, y + h], ys);
      if (bx) { x += bx.off; guides.push({ axis: 'x', at: bx.at }); }
      if (by) { y += by.off; guides.push({ axis: 'y', at: by.at }); }
    } else {
      if (sides.l) { const s = best([x], xs); if (s) { w -= s.off; x += s.off; guides.push({ axis: 'x', at: s.at }); } }
      if (sides.r) { const s = best([x + w], xs); if (s) { w += s.off; guides.push({ axis: 'x', at: s.at }); } }
      if (sides.t) { const s = best([y], ys); if (s) { h -= s.off; y += s.off; guides.push({ axis: 'y', at: s.at }); } }
      if (sides.b) { const s = best([y + h], ys); if (s) { h += s.off; guides.push({ axis: 'y', at: s.at }); } }
    }
    return { rect: { x: Math.round(x), y: Math.round(y), w: Math.max(8, Math.round(w)), h: Math.max(8, Math.round(h)) }, guides };
  };

  const toMap = (e: { clientX: number; clientY: number }) => canvas.current!.toMap(e.clientX, e.clientY);

  // ---- global move/up while a drag is active
  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const m = toMap(e);
      if (d.mode === 'move') {
        const ids = new Set(d.ids);
        const bb = [...d.orig.values()];
        const x0 = Math.min(...bb.map((r) => r.x)), y0 = Math.min(...bb.map((r) => r.y));
        const x1 = Math.max(...bb.map((r) => r.x + r.w)), y1 = Math.max(...bb.map((r) => r.y + r.h));
        const raw = { x: x0 + m.x - d.start.x, y: y0 + m.y - d.start.y, w: x1 - x0, h: y1 - y0 };
        const s = e.altKey ? { rect: { ...raw, x: Math.round(raw.x), y: Math.round(raw.y) }, guides: [] } : snapRect(raw, ids, undefined, true);
        setDrag({ ...d, dx: s.rect.x - x0, dy: s.rect.y - y0, guides: s.guides });
      } else if (d.mode === 'resize') {
        const o = d.orig, dx = m.x - d.start.x, dy = m.y - d.start.y;
        let { x, y, w, h } = o;
        if (d.handle.includes('w')) { x = Math.min(o.x + o.w - 8, o.x + dx); w = o.x + o.w - x; }
        if (d.handle.includes('e')) w = Math.max(8, o.w + dx);
        if (d.handle.includes('n')) { y = Math.min(o.y + o.h - 8, o.y + dy); h = o.y + o.h - y; }
        if (d.handle.includes('s')) h = Math.max(8, o.h + dy);
        const s = e.altKey ? { rect: { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) }, guides: [] }
          : snapRect({ x, y, w, h }, new Set([d.id]), { l: d.handle.includes('w'), r: d.handle.includes('e'), t: d.handle.includes('n'), b: d.handle.includes('s') });
        setDrag({ ...d, rect: s.rect, guides: s.guides });
      } else if (d.mode === 'draw') {
        const r = norm(d.start, m);
        const s = e.altKey ? { rect: r, guides: [] } : snapRect(r, new Set(), { l: m.x < d.start.x, r: m.x >= d.start.x, t: m.y < d.start.y, b: m.y >= d.start.y });
        setDrag({ ...d, rect: s.rect, guides: s.guides });
      } else if (d.mode === 'marquee') {
        setDrag({ ...d, rect: norm(d.start, m) });
      } else if (d.mode === 'vertex') {
        const pts = d.pts.slice();
        let x = Math.round(m.x), y = Math.round(m.y);
        if (!e.altKey) {
          const tol = snapTol();
          const prev = pts[(d.index - 1 + pts.length) % pts.length], next = pts[(d.index + 1) % pts.length];
          for (const q of [prev, next]) { if (Math.abs(q[0] - x) < tol) x = q[0]; if (Math.abs(q[1] - y) < tol) y = q[1]; }
        }
        pts[d.index] = [x, y];
        setDrag({ ...d, pts });
      } else if (d.mode === 'qr') {
        setDrag({ ...d, dx: m.x - d.start.x, dy: m.y - d.start.y });
      } else if (d.mode === 'ulmove') {
        setDrag({ ...d, rect: { ...d.orig, x: Math.round(d.orig.x + m.x - d.start.x), y: Math.round(d.orig.y + m.y - d.start.y) } });
      } else if (d.mode === 'ulsize') {
        // Corners scale the drawing about the opposite corner, keeping its proportions (Shift = free).
        const o = d.orig;
        const ax = d.corner.includes('w') ? o.x + o.w : o.x, ay = d.corner.includes('n') ? o.y + o.h : o.y;
        let w = Math.max(50, Math.abs(m.x - ax)), h = Math.max(50, Math.abs(m.y - ay));
        if (!e.shiftKey) { const sc = Math.max(w / o.w, h / o.h); w = o.w * sc; h = o.h * sc; }
        const x = d.corner.includes('w') ? ax - w : ax, y = d.corner.includes('n') ? ay - h : ay;
        setDrag({ ...d, rect: { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) } });
      } else if (d.mode === 'heading') {
        let deg = (Math.atan2(m.x - d.center.x, -(m.y - d.center.y)) * 180) / Math.PI;
        if (!e.altKey) deg = Math.round(deg / 15) * 15;
        setDrag({ ...d, heading: ((Math.round(deg) % 360) + 360) % 360 });
      }
    };
    const up = () => {
      const d = dragRef.current;
      setDrag(null);
      if (!d) return;
      const P = props.current;
      if (d.mode === 'move' && (d.dx || d.dy)) P.onMoveUnits(d.ids.map((id) => { const o = d.orig.get(id)!; return { id, rect: { ...o, x: o.x + d.dx, y: o.y + d.dy } }; }));
      if (d.mode === 'resize' && (d.rect.w !== d.orig.w || d.rect.h !== d.orig.h || d.rect.x !== d.orig.x || d.rect.y !== d.orig.y)) P.onMoveUnits([{ id: d.id, rect: d.rect }]);
      if (d.mode === 'draw' && d.rect.w >= 16 && d.rect.h >= 16) P.onDrawn(d.rect);
      if (d.mode === 'marquee') {
        const r = d.rect;
        const hit = P.floor.locations.filter((u) => u.x < r.x + r.w && u.x + u.w > r.x && u.y < r.y + r.h && u.y + u.h > r.y).map((u) => u.id);
        const prev = d.additive && P.selection?.kind === 'units' ? P.selection.ids : [];
        const ids = [...new Set([...prev, ...hit])];
        if (r.w > 4 || r.h > 4) P.onSelect(ids.length ? { kind: 'units', ids } : null);
        else if (!d.additive) P.onSelect(null);
      }
      if (d.mode === 'vertex') P.onSilhouette(d.pts);
      if (d.mode === 'qr' && (Math.abs(d.dx) > 1 || Math.abs(d.dy) > 1)) P.onMoveQr(d.key, { x: Math.round(d.orig.x + d.dx), y: Math.round(d.orig.y + d.dy) });
      if (d.mode === 'heading') P.onMoveQr(d.key, { heading: d.heading });
      if ((d.mode === 'ulmove' || d.mode === 'ulsize') && P.floor.underlay) P.onUnderlay({ ...P.floor.underlay, ...d.rect });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag !== null]);

  // Space held = hand tool (the canvas pans), so presses then must not start edits.
  const space = useRef(false);
  useEffect(() => {
    const d = (e: KeyboardEvent) => { if (e.code === 'Space') space.current = true; };
    const u = (e: KeyboardEvent) => { if (e.code === 'Space') space.current = false; };
    window.addEventListener('keydown', d);
    window.addEventListener('keyup', u);
    return () => { window.removeEventListener('keydown', d); window.removeEventListener('keyup', u); };
  }, []);
  const isLeft = (e: React.PointerEvent) => e.button === 0 && !space.current;

  // ---- pointer entry points
  const onUnitDown = (u: WayfindingLocation, e: React.PointerEvent) => {
    if (!isLeft(e)) return;
    if (tool === 'route') { e.stopPropagation(); p.onRouteClick(toMap(e), u); return; }
    if (p.placing) { e.stopPropagation(); p.onPlaceStore(u); return; }
    if (tool !== 'select') return;
    // Touch: a drag that starts on an unselected unit pans the plan; tap first to pick it, then drag to move.
    if (e.pointerType === 'touch' && !selectedIds.has(u.id)) return;
    e.stopPropagation();
    let ids = selection?.kind === 'units' ? selection.ids : [];
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      ids = ids.includes(u.id) ? ids.filter((x) => x !== u.id) : [...ids, u.id];
      p.onSelect(ids.length ? { kind: 'units', ids } : null);
      return;
    }
    if (!ids.includes(u.id)) { ids = [u.id]; p.onSelect({ kind: 'units', ids }); }
    const orig = new Map(floor.locations.filter((l) => ids.includes(l.id)).map((l) => [l.id, { x: l.x, y: l.y, w: l.w, h: l.h }]));
    setDrag({ mode: 'move', ids, start: toMap(e), orig, dx: 0, dy: 0, guides: [] });
  };

  const onBackgroundDown = (e: React.PointerEvent) => {
    if (!isLeft(e)) return;
    const m = toMap(e);
    if (tool === 'draw') { e.stopPropagation(); setDrag({ mode: 'draw', start: m, rect: { x: m.x, y: m.y, w: 0, h: 0 }, guides: [] }); return; }
    // Select tool: a plain drag moves around the plan (handled by the canvas); Shift-drag picks units in a box.
    if (tool === 'select' && e.shiftKey) { e.stopPropagation(); setDrag({ mode: 'marquee', start: m, rect: { x: m.x, y: m.y, w: 0, h: 0 }, additive: true }); return; }
  };

  const onTap = (m: MapPoint, e: PointerEvent) => {
    if ((e.target as Element)?.closest?.('[data-handle]')) return;
    const tapped = (e.target as Element)?.closest?.('[data-unit]') as HTMLElement | SVGElement | null;
    if (tool === 'select' && tapped && e.pointerType === 'touch') p.onSelect({ kind: 'units', ids: [tapped.dataset.unit!] });
    else if (tool === 'select' && !tapped && !e.shiftKey) p.onSelect(null);
    else if (tool === 'qr') p.onPlaceQr({ x: Math.round(m.x), y: Math.round(m.y) });
    else if (tool === 'route' && !(e.target as Element)?.closest?.('[data-unit]')) p.onRouteClick(m, null);
    else if (tool === 'outline') {
      const pts = silhouettePoints(floor.silhouette).map((q) => [Math.round(q.x), Math.round(q.y)] as [number, number]);
      const pt: [number, number] = [Math.round(m.x), Math.round(m.y)];
      if (pts.length < 3) { p.onSilhouette([...pts, pt]); return; }
      // Insert on the nearest edge.
      let best = 0, bestD = Infinity;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        const dx = b[0] - a[0], dy = b[1] - a[1];
        const t = Math.max(0, Math.min(1, ((pt[0] - a[0]) * dx + (pt[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
        const d = Math.hypot(a[0] + t * dx - pt[0], a[1] + t * dy - pt[1]);
        if (d < bestD) { bestD = d; best = i; }
      }
      const next = pts.slice();
      next.splice(best + 1, 0, pt);
      p.onSilhouette(next);
    }
  };

  const single = selection?.kind === 'units' && selection.ids.length === 1 ? shown.locations.find((u) => u.id === selection.ids[0]) : null;
  const multiBox = selection?.kind === 'units' && selection.ids.length > 1 ? boundsOf(shown.locations.filter((u) => selectedIds.has(u.id)).flatMap((u) => [{ x: u.x, y: u.y }, { x: u.x + u.w, y: u.y + u.h }])) : null;
  const guides = drag && 'guides' in drag ? drag.guides : [];
  const sil = drag?.mode === 'vertex' ? drag.pts.map(([x, y]) => ({ x, y })) : silhouettePoints(floor.silhouette);
  const qrs = Object.entries(doc.qr).filter(([, q]) => q.floorId === floorId);
  const cursor = tool === 'draw' ? 'crosshair' : tool === 'qr' ? 'copy' : tool === 'route' ? 'pointer' : tool === 'outline' ? 'cell' : 'grab';

  return (
    <MapCanvas
      ref={canvas}
      fit={fit}
      fitKey={floorId}
      fitPad={24}
      minK={0.04}
      maxK={6}
      panWithLeft
      cursor={cursor}
      defs={<>
        <MapDefs />
        <pattern id="ed-dots" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1.6" fill="#d5d9e0" /></pattern>
      </>}
      onTap={onTap}
      ariaLabel="Floor plan editor"
    >
      {(k) => (
        <g>
          <rect x={-6000} y={-6000} width={16000} height={18000} fill="url(#ed-dots)" onPointerDown={onBackgroundDown} />
          <g onPointerDown={(e) => { if ((e.target as Element).closest('[data-unit]')) return; onBackgroundDown(e); }}>
            <FloorPlan floor={shown} k={k} occupantOf={occupantOf} styleOf={styleOf} theme={THEME} onUnitDown={p.aligning ? undefined : onUnitDown} showIds showUnderlay={p.showUnderlay} />
          </g>

          {/* Align the floor-plan image: drag it, pull a corner to scale it */}
          {p.aligning && shown.underlay && (() => {
            const u = shown.underlay;
            const rect = { x: u.x, y: u.y, w: u.w, h: u.h };
            return (
              <g>
                <rect data-handle x={u.x} y={u.y} width={u.w} height={u.h} fill="rgba(46,48,148,0.04)" stroke={ACCENT} strokeWidth={2} strokeDasharray="8 6" vectorEffect="non-scaling-stroke" style={{ cursor: 'move' }}
                  onPointerDown={(e) => { if (e.button !== 0) return; e.stopPropagation(); setDrag({ mode: 'ulmove', start: toMap(e), orig: rect, rect }); }} />
                {(['nw', 'ne', 'se', 'sw'] as const).map((c) => (
                  <Fixed key={c} x={c.includes('w') ? u.x : u.x + u.w} y={c.includes('n') ? u.y : u.y + u.h}>
                    <rect data-handle x={-7} y={-7} width={14} height={14} rx={3} fill="#fff" stroke={ACCENT} strokeWidth={2.5} style={{ cursor: c === 'nw' || c === 'se' ? 'nwse-resize' : 'nesw-resize' }}
                      onPointerDown={(e) => { if (e.button !== 0) return; e.stopPropagation(); setDrag({ mode: 'ulsize', corner: c, start: toMap(e), orig: rect, rect }); }} />
                  </Fixed>
                ))}
              </g>
            );
          })()}

          {/* Outline editing */}
          {tool === 'outline' && (
            <g>
              {sil.length > 0 && sil.length < 3 && <polyline points={sil.map((q) => `${q.x},${q.y}`).join(' ')} fill="none" stroke={ACCENT} strokeWidth={2} strokeDasharray="6 5" vectorEffect="non-scaling-stroke" />}
              {sil.length >= 3 && <polygon points={sil.map((q) => `${q.x},${q.y}`).join(' ')} fill="none" stroke={ACCENT} strokeWidth={2} vectorEffect="non-scaling-stroke" style={{ pointerEvents: 'none' }} />}
              {sil.map((q, i) => (
                <Fixed key={i} x={q.x} y={q.y}>
                  <circle data-handle r={7} fill="#fff" stroke={ACCENT} strokeWidth={2.5} style={{ cursor: 'move' }}
                    onPointerDown={(e) => {
                      if (e.button !== 0) return;
                      e.stopPropagation();
                      const pts = sil.map((s) => [s.x, s.y] as [number, number]);
                      if (e.altKey && pts.length > 3) { pts.splice(i, 1); p.onSilhouette(pts); return; }
                      setDrag({ mode: 'vertex', index: i, pts });
                    }}
                    onDoubleClick={(e) => { e.stopPropagation(); const pts = sil.map((s) => [s.x, s.y] as [number, number]); if (pts.length > 3) { pts.splice(i, 1); p.onSilhouette(pts); } }} />
                </Fixed>
              ))}
            </g>
          )}

          {/* Snapping guides */}
          {guides.map((g, i) => g.axis === 'x'
            ? <line key={i} x1={g.at} x2={g.at} y1={-3000} y2={9000} stroke="#e0314b" strokeWidth={1} strokeDasharray="4 4" vectorEffect="non-scaling-stroke" style={{ pointerEvents: 'none' }} />
            : <line key={i} y1={g.at} y2={g.at} x1={-3000} x2={9000} stroke="#e0314b" strokeWidth={1} strokeDasharray="4 4" vectorEffect="non-scaling-stroke" style={{ pointerEvents: 'none' }} />)}

          {/* Selection frame + resize handles */}
          {tool === 'select' && single && drag?.mode !== 'move' && (
            <g>
              {HANDLES.map((h) => {
                const x = single.x + (h.includes('w') ? 0 : h.includes('e') ? single.w : single.w / 2);
                const y = single.y + (h.includes('n') ? 0 : h.includes('s') ? single.h : single.h / 2);
                const cur = { n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize', ne: 'nesw-resize', sw: 'nesw-resize', nw: 'nwse-resize', se: 'nwse-resize' }[h];
                return (
                  <Fixed key={h} x={x} y={y}>
                    <rect data-handle x={-14} y={-14} width={28} height={28} fill="transparent" style={{ cursor: cur }}
                      onPointerDown={(e) => { if (e.button !== 0) return; e.stopPropagation(); setDrag({ mode: 'resize', id: single.id, handle: h, start: toMap(e), orig: { x: single.x, y: single.y, w: single.w, h: single.h }, rect: { x: single.x, y: single.y, w: single.w, h: single.h }, guides: [] }); }} />
                    <rect data-handle x={-5} y={-5} width={10} height={10} rx={2} fill="#fff" stroke={ACCENT} strokeWidth={2} style={{ cursor: cur, pointerEvents: 'none' }}
                      onPointerDown={(e) => { if (e.button !== 0) return; e.stopPropagation(); setDrag({ mode: 'resize', id: single.id, handle: h, start: toMap(e), orig: { x: single.x, y: single.y, w: single.w, h: single.h }, rect: { x: single.x, y: single.y, w: single.w, h: single.h }, guides: [] }); }} />
                  </Fixed>
                );
              })}
              {drag?.mode === 'resize' && (
                <Fixed x={drag.rect.x + drag.rect.w / 2} y={drag.rect.y + drag.rect.h}>
                  <g transform="translate(0 22)"><rect x={-44} y={-11} width={88} height={22} rx={6} fill="#16181d" /><text textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={11.5} fontWeight={600}>{drag.rect.w} × {drag.rect.h}</text></g>
                </Fixed>
              )}
            </g>
          )}
          {multiBox && <rect x={multiBox.x - 6} y={multiBox.y - 6} width={multiBox.w + 12} height={multiBox.h + 12} fill="none" stroke={ACCENT} strokeWidth={1.5} strokeDasharray="6 4" vectorEffect="non-scaling-stroke" style={{ pointerEvents: 'none' }} />}

          {/* New unit / marquee */}
          {drag?.mode === 'draw' && <rect x={drag.rect.x} y={drag.rect.y} width={drag.rect.w} height={drag.rect.h} rx={6} fill="rgba(46,48,148,0.12)" stroke={ACCENT} strokeWidth={2} strokeDasharray="6 4" vectorEffect="non-scaling-stroke" />}
          {drag?.mode === 'marquee' && <rect x={drag.rect.x} y={drag.rect.y} width={drag.rect.w} height={drag.rect.h} fill="rgba(46,48,148,0.07)" stroke={ACCENT} strokeWidth={1} vectorEffect="non-scaling-stroke" />}

          {/* QR points */}
          {qrs.map(([key, q]) => {
            const sel = selection?.kind === 'qr' && selection.key === key;
            const pos = drag?.mode === 'qr' && drag.key === key ? { x: drag.orig.x + drag.dx, y: drag.orig.y + drag.dy } : q;
            const heading = drag?.mode === 'heading' && drag.key === key ? drag.heading : q.heading;
            return (
              <g key={key}>
                {sel && <YouAreHere x={pos.x} y={pos.y} heading={heading ?? 0} />}
                <Fixed x={pos.x} y={pos.y}>
                  <g data-handle style={{ cursor: tool === 'select' || tool === 'qr' ? 'grab' : 'default' }}
                    onPointerDown={(e) => {
                      if (e.button !== 0 || tool === 'route') return;
                      e.stopPropagation();
                      p.onSelect({ kind: 'qr', key });
                      setDrag({ mode: 'qr', key, start: toMap(e), orig: { x: q.x, y: q.y }, dx: 0, dy: 0 });
                    }}>
                    <rect x={-13} y={-13} width={26} height={26} rx={7} fill={sel ? ACCENT : '#fff'} stroke={ACCENT} strokeWidth={2} />
                    <path d="M-6 -6h4v4h-4zM2 -6h4v4h-4zM-6 2h4v4h-4zM2 2h1.5v1.5h-1.5zM4.5 4.5h1.5v1.5h-1.5z" fill={sel ? '#fff' : ACCENT} />
                    <text y={26} textAnchor="middle" fontSize={11} fontWeight={700} fill="#16181d" style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 3 }}>{q.code}</text>
                  </g>
                  {sel && (
                    <g data-handle transform={`rotate(${heading ?? 0})`} style={{ cursor: 'grab' }}
                      onPointerDown={(e) => { if (e.button !== 0) return; e.stopPropagation(); setDrag({ mode: 'heading', key, center: { x: q.x, y: q.y }, heading: q.heading ?? 0 }); }}>
                      <line x1={0} y1={-16} x2={0} y2={-62} stroke={ACCENT} strokeWidth={2} strokeDasharray="3 3" />
                      <circle cy={-66} r={7} fill="#fff" stroke={ACCENT} strokeWidth={2.5} />
                      <path d="M-3 -65 L0 -69 L3 -65" fill="none" stroke={ACCENT} strokeWidth={1.8} />
                    </g>
                  )}
                </Fixed>
              </g>
            );
          })}

          {p.extra}

          {/* Test route */}
          {p.route.start && <YouAreHere x={p.route.start.x} y={p.route.start.y} label="Start" />}
          {p.route.leg && p.route.leg.floorId === floorId && (
            <RouteLayer key={p.route.key} leg={p.route.leg} playKey={p.route.key} animate
              destUnit={p.route.leg.end.kind === 'destination' ? floor.locations.find((l) => l.id === (p.route.leg!.end as { unitId?: string }).unitId) : null}
              transitUnit={p.route.leg.end.kind === 'transit' ? floor.locations.find((l) => l.id === (p.route.leg!.end as { unitId: string }).unitId) : null}
              transitText={p.route.transitText} destLabel={p.route.destLabel} accent="#e0314b" />
          )}
        </g>
      )}
    </MapCanvas>
  );
});
