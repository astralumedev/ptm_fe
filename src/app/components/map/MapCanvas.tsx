import { forwardRef, ReactNode, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { MapPoint } from '../../../types/wayfinding';

export interface View { x: number; y: number; k: number }
export interface Box { x: number; y: number; w: number; h: number }

export interface MapCanvasHandle {
  /** Animate to show a box (map units), keeping `pad` screen pixels around it. */
  flyToBox(b: Box, opts?: { pad?: number; maxK?: number; ms?: number; offsetY?: number }): void;
  flyTo(center: MapPoint, k?: number, ms?: number): void;
  zoomBy(factor: number): void;
  toMap(clientX: number, clientY: number): MapPoint;
  view(): View;
  /** True while (or just after) the pointer moved enough to count as a drag, not a tap. */
  dragged(): boolean;
  svg(): SVGSVGElement | null;
}

interface Props {
  children: ReactNode | ((k: number) => ReactNode);
  /** Initial framing; re-applied whenever `fitKey` changes. */
  fit?: Box | null;
  fitKey?: string;
  fitPad?: number;
  minK?: number;
  maxK?: number;
  className?: string;
  /** Left-drag pans (visitor map). The editor turns it off and pans with space / middle / right drag. */
  panWithLeft?: boolean;
  onTap?: (p: MapPoint, e: PointerEvent) => void;
  onViewChange?: (v: View) => void;
  defs?: ReactNode;
  cursor?: string;
  ariaLabel?: string;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Pan/zoom surface for the floor plans. The transform is written straight to the DOM on every
 * frame (no React re-render while dragging), and children re-render only when the zoom level
 * moves enough to change what labels should show. Elements that must keep a constant on-screen
 * size use `style={{ transform: 'scale(var(--ik))' }}`.
 */
export const MapCanvas = forwardRef<MapCanvasHandle, Props>(function MapCanvas(
  { children, fit, fitKey, fitPad = 32, minK = 0.08, maxK = 4, className, panWithLeft = true, onTap, onViewChange, defs, cursor, ariaLabel },
  ref,
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const view = useRef<View>({ x: 0, y: 0, k: 0.2 });
  const [k, setK] = useState(0.2);
  const committedK = useRef(0.2);
  const anim = useRef<number | null>(null);
  const draggedRef = useRef(false);
  const spaceDown = useRef(false);
  const onViewRef = useRef(onViewChange);
  onViewRef.current = onViewChange;
  const onTapRef = useRef(onTap);
  onTapRef.current = onTap;

  const apply = useCallback((v: View) => {
    view.current = v;
    gRef.current?.setAttribute('transform', `translate(${v.x.toFixed(2)} ${v.y.toFixed(2)}) scale(${v.k.toFixed(5)})`);
    svgRef.current?.style.setProperty('--ik', String(1 / v.k));
    if (Math.abs(Math.log(v.k / committedK.current)) > 0.12) { committedK.current = v.k; setK(v.k); }
    onViewRef.current?.(v);
  }, []);

  const settle = useCallback(() => {
    if (committedK.current !== view.current.k) { committedK.current = view.current.k; setK(view.current.k); }
  }, []);

  const stop = () => { if (anim.current) cancelAnimationFrame(anim.current); anim.current = null; };

  const animateTo = useCallback((to: View, ms = 650) => {
    stop();
    if (reducedMotion() || ms <= 0) { apply(to); settle(); return; }
    const from = { ...view.current };
    const t0 = performance.now();
    const lk0 = Math.log(from.k), lk1 = Math.log(to.k);
    // Keep the point under the screen centre moving in a straight line while zoom changes smoothly.
    const rect = svgRef.current?.getBoundingClientRect();
    const cx = (rect?.width || 0) / 2, cy = (rect?.height || 0) / 2;
    const m0 = { x: (cx - from.x) / from.k, y: (cy - from.y) / from.k };
    const m1 = { x: (cx - to.x) / to.k, y: (cy - to.y) / to.k };
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / ms);
      const e = ease(t);
      const kk = Math.exp(lk0 + (lk1 - lk0) * e);
      const mx = m0.x + (m1.x - m0.x) * e, my = m0.y + (m1.y - m0.y) * e;
      apply({ k: kk, x: cx - mx * kk, y: cy - my * kk });
      if (t < 1) anim.current = requestAnimationFrame(step);
      else { anim.current = null; settle(); }
    };
    anim.current = requestAnimationFrame(step);
  }, [apply, settle]);

  const boxView = useCallback((b: Box, pad = fitPad, cap = maxK, offsetY = 0): View | null => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height) return null;
    const kk = clamp(Math.min((rect.width - pad * 2) / Math.max(1, b.w), (rect.height - pad * 2 - Math.abs(offsetY)) / Math.max(1, b.h)), minK, cap);
    return { k: kk, x: rect.width / 2 - (b.x + b.w / 2) * kk, y: (rect.height - offsetY) / 2 - (b.y + b.h / 2) * kk };
  }, [fitPad, maxK, minK]);

  useImperativeHandle(ref, () => ({
    flyToBox(b, o = {}) { const v = boxView(b, o.pad, o.maxK, o.offsetY); if (v) animateTo(v, o.ms); },
    flyTo(c, kk = view.current.k, ms) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const k2 = clamp(kk, minK, maxK);
      animateTo({ k: k2, x: rect.width / 2 - c.x * k2, y: rect.height / 2 - c.y * k2 }, ms);
    },
    zoomBy(f) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const v = view.current;
      const k2 = clamp(v.k * f, minK, maxK);
      const cx = rect.width / 2, cy = rect.height / 2;
      animateTo({ k: k2, x: cx - ((cx - v.x) * k2) / v.k, y: cy - ((cy - v.y) * k2) / v.k }, 320);
    },
    toMap(clientX, clientY) {
      const rect = svgRef.current!.getBoundingClientRect();
      const v = view.current;
      return { x: (clientX - rect.left - v.x) / v.k, y: (clientY - rect.top - v.y) / v.k };
    },
    view: () => view.current,
    dragged: () => draggedRef.current,
    svg: () => svgRef.current,
  }), [animateTo, boxView, minK, maxK]);

  // Frame the floor on first paint and whenever the caller asks (floor change).
  const fitRef = useRef(fit);
  fitRef.current = fit;
  const firstFit = useRef(true);
  useEffect(() => {
    const b = fitRef.current;
    if (!b) return;
    const v = boxView(b);
    if (!v) return;
    if (firstFit.current) { apply(v); settle(); firstFit.current = false; } else animateTo(v, 500);
  }, [fitKey, boxView, apply, animateTo, settle]);

  // Keep the same spot centred when the container resizes (drawer opening, rotation).
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    let last = el.getBoundingClientRect();
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      if (!last.width || !last.height) { last = r; const b = fitRef.current; const v = b && boxView(b); if (v) { apply(v); settle(); } return; }
      const v = view.current;
      apply({ ...v, x: v.x + (r.width - last.width) / 2, y: v.y + (r.height - last.height) / 2 });
      last = r;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [apply, boxView, settle]);

  // Wheel: zoom at the cursor (trackpad pinch arrives as ctrl+wheel); plain two-finger scroll pans.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    let idle: number | undefined;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      stop();
      const rect = el.getBoundingClientRect();
      const v = view.current;
      // Mouse wheels send big line-sized steps; trackpads send small pixel deltas (pan) or ctrl+wheel (pinch).
      const zoom = e.ctrlKey || e.deltaMode !== 0 || (Math.abs(e.deltaY) >= 40 && e.deltaX === 0);
      if (!zoom) {
        apply({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY });
      } else {
        const f = Math.exp(-e.deltaY * (e.ctrlKey ? 0.012 : 0.0022));
        const k2 = clamp(v.k * f, minK, maxK);
        const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        apply({ k: k2, x: mx - ((mx - v.x) * k2) / v.k, y: my - ((my - v.y) * k2) / v.k });
      }
      window.clearTimeout(idle);
      idle = window.setTimeout(settle, 140);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [apply, settle, minK, maxK]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.code === 'Space' && !(e.target as HTMLElement)?.closest?.('input,textarea,select,[contenteditable]')) { spaceDown.current = true; if (svgRef.current) svgRef.current.style.cursor = 'grab'; } };
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') { spaceDown.current = false; if (svgRef.current) svgRef.current.style.cursor = ''; } };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // Pointer gestures: drag to pan (with inertia), two fingers to pinch, tap, double-tap to zoom.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ startX: number; startY: number; view: View; pinch?: { d: number; mx: number; my: number; view: View }; t: number; vx: number; vy: number; lx: number; ly: number; lt: number; panning: boolean } | null>(null);
  const lastTap = useRef({ t: 0, x: 0, y: 0 });

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const pan = e.pointerType !== 'mouse' || (panWithLeft && e.button === 0) || e.button === 1 || e.button === 2 || spaceDown.current;
    stop();
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    draggedRef.current = false;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const rect = svgRef.current!.getBoundingClientRect();
      gesture.current = { ...(gesture.current || { startX: e.clientX, startY: e.clientY, t: performance.now(), vx: 0, vy: 0, lx: e.clientX, ly: e.clientY, lt: performance.now(), view: view.current }), panning: true,
        pinch: { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2 - rect.left, my: (a.y + b.y) / 2 - rect.top, view: { ...view.current } } };
      draggedRef.current = true;
      return;
    }
    gesture.current = { startX: e.clientX, startY: e.clientY, view: { ...view.current }, t: performance.now(), vx: 0, vy: 0, lx: e.clientX, ly: e.clientY, lt: performance.now(), panning: pan };
    if (e.button === 1 || e.button === 2 || spaceDown.current) e.preventDefault();
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const g = gesture.current;
    if (!g || !pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (g.pinch && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const rect = svgRef.current!.getBoundingClientRect();
      const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const mx = (a.x + b.x) / 2 - rect.left, my = (a.y + b.y) / 2 - rect.top;
      const v0 = g.pinch.view;
      const k2 = clamp(v0.k * (d / g.pinch.d), minK, maxK);
      const px = (g.pinch.mx - v0.x) / v0.k, py = (g.pinch.my - v0.y) / v0.k;
      apply({ k: k2, x: mx - px * k2, y: my - py * k2 });
      return;
    }
    const dx = e.clientX - g.startX, dy = e.clientY - g.startY;
    if (!draggedRef.current && Math.hypot(dx, dy) > 6) {
      draggedRef.current = true;
      if (g.panning) try { svgRef.current?.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    }
    if (!g.panning || !draggedRef.current) return;
    const now = performance.now();
    const dt = Math.max(1, now - g.lt);
    g.vx = 0.8 * ((e.clientX - g.lx) / dt) + 0.2 * g.vx;
    g.vy = 0.8 * ((e.clientY - g.ly) / dt) + 0.2 * g.vy;
    g.lx = e.clientX; g.ly = e.clientY; g.lt = now;
    apply({ ...g.view, x: g.view.x + dx, y: g.view.y + dy });
  };

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    try { svgRef.current?.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
    if (pointers.current.size === 1 && g) {
      // One finger lifted from a pinch: continue as a pan from here.
      const [p] = [...pointers.current.values()];
      gesture.current = { ...g, pinch: undefined, startX: p.x, startY: p.y, view: { ...view.current }, lx: p.x, ly: p.y, lt: performance.now(), vx: 0, vy: 0, panning: true };
      return;
    }
    if (pointers.current.size > 0 || !g) return;
    gesture.current = null;

    if (!draggedRef.current && e.type === 'pointerup') {
      const now = performance.now();
      const isDouble = now - lastTap.current.t < 300 && Math.hypot(e.clientX - lastTap.current.x, e.clientY - lastTap.current.y) < 24;
      lastTap.current = { t: isDouble ? 0 : now, x: e.clientX, y: e.clientY };
      const rect = svgRef.current!.getBoundingClientRect();
      const v = view.current;
      if (isDouble && panWithLeft) {
        const k2 = clamp(v.k * 1.8, minK, maxK);
        const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        animateTo({ k: k2, x: mx - ((mx - v.x) * k2) / v.k, y: my - ((my - v.y) * k2) / v.k }, 300);
        return;
      }
      onTapRef.current?.({ x: (e.clientX - rect.left - v.x) / v.k, y: (e.clientY - rect.top - v.y) / v.k }, e.nativeEvent);
      return;
    }
    // Glide to a stop after a flick.
    if (g.panning && !g.pinch && performance.now() - g.lt < 60 && !reducedMotion()) {
      let vx = g.vx * 16, vy = g.vy * 16;
      const step = () => {
        vx *= 0.92; vy *= 0.92;
        const v = view.current;
        apply({ ...v, x: v.x + vx, y: v.y + vy });
        if (Math.hypot(vx, vy) > 0.4) anim.current = requestAnimationFrame(step);
        else { anim.current = null; settle(); }
      };
      anim.current = requestAnimationFrame(step);
    } else settle();
  };

  return (
    <svg
      ref={svgRef}
      className={className}
      style={{ touchAction: 'none', width: '100%', height: '100%', display: 'block', cursor, userSelect: 'none', WebkitUserSelect: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
      onClickCapture={(e) => { if (draggedRef.current) { e.stopPropagation(); e.preventDefault(); } }}
      role="application"
      aria-label={ariaLabel}
    >
      {defs && <defs>{defs}</defs>}
      <g ref={gRef}>{typeof children === 'function' ? children(k) : children}</g>
    </svg>
  );
});

/** Group that keeps its content the same size on screen at any zoom. */
export function Fixed({ x, y, children, className, style }: { x: number; y: number; children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <g transform={`translate(${x} ${y})`} className={className} style={style}>
      <g style={{ transform: 'scale(var(--ik))' }}>{children}</g>
    </g>
  );
}

export function boundsOf(pts: MapPoint[], pad = 0): Box | null {
  if (!pts.length) return null;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of pts) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  return { x: x0 - pad, y: y0 - pad, w: x1 - x0 + pad * 2, h: y1 - y0 + pad * 2 };
}
