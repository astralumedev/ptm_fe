import { useEffect, useMemo, useRef, useState } from 'react';
import type { RouteLeg, WayfindingLocation } from '../../../types/wayfinding';
import { roundedPath } from '../../../lib/mapRouter';
import { Fixed } from './MapCanvas';
import './map.css';

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** A small person walking, drawn around the feet at (0,0) in screen pixels. */
export function Walker({ accent = '#e0314b' }: { accent?: string }) {
  return (
    <g style={{ filter: 'drop-shadow(0 0 1.2px rgba(255,255,255,0.95)) drop-shadow(0 2px 3px rgba(0,0,0,0.45))' }}>
      <ellipse className="pm-shadow" cx={0} cy={1} rx={8} ry={2.6} fill="rgba(0,0,0,0.35)" />
      <g transform="translate(0 -1)">
        <line className="pm-limb pm-leg-b" x1={1.6} y1={-12.5} x2={1.6} y2={0} stroke="#1f2170" strokeWidth={3.3} strokeLinecap="round" />
        <line className="pm-limb pm-arm-b" x1={2.6} y1={-22} x2={2.6} y2={-14} stroke="#b8243a" strokeWidth={2.6} strokeLinecap="round" />
        <g className="pm-body">
          <rect x={-4.8} y={-24.5} width={9.6} height={13} rx={4} fill={accent} />
          <circle cx={0.4} cy={-29.2} r={4.4} fill="#f2c6a0" />
          <path d="M-4.1 -30.1 A4.5 4.5 0 0 1 4.6 -30.6 L 4.4 -29.3 Q 1 -31.6 -3.9 -28.6 Z" fill="#2b1d16" />
        </g>
        <line className="pm-limb pm-leg-a" x1={-1.6} y1={-12.5} x2={-1.6} y2={0} stroke="#2e3094" strokeWidth={3.3} strokeLinecap="round" />
        <line className="pm-limb pm-arm-a" x1={-2.4} y1={-22} x2={-2.4} y2={-14} stroke={accent} strokeWidth={2.6} strokeLinecap="round" />
      </g>
    </g>
  );
}

/** Pin with a soft landing, used for the destination once the shutter is up. */
export function DestinationPin({ label, color = '#e0314b' }: { label?: string; color?: string }) {
  const w = label ? Math.min(220, 26 + label.length * 7.2) : 0;
  return (
    <g className="pm-pop">
      <ellipse cx={0} cy={1} rx={7} ry={2.4} fill="rgba(0,0,0,0.35)" />
      <path d="M0 0 C -3 -8 -12 -13 -12 -23 A12 12 0 1 1 12 -23 C 12 -13 3 -8 0 0 Z" fill={color} stroke="#fff" strokeWidth={2} />
      <circle cx={0} cy={-23} r={4.6} fill="#fff" />
      {label && (
        <g transform="translate(0 -46)">
          <rect x={-w / 2} y={-14} width={w} height={26} rx={13} fill="rgba(12,14,34,0.94)" stroke={color} strokeWidth={1.4} />
          <text x={0} y={0} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={12.5} fontWeight={700} style={{ fontFamily: 'Montserrat, system-ui, sans-serif' }}>{label}</text>
        </g>
      )}
    </g>
  );
}

/** Rolling shutter drawn over a unit; rolls up when `open` turns true. */
export function Shutter({ unit, open }: { unit: WayfindingLocation; open: boolean }) {
  const id = `sh-${unit.id.replace(/[^a-z0-9]/gi, '')}`;
  const slats = Math.max(4, Math.round(unit.h / 14));
  return (
    <g style={{ pointerEvents: 'none' }}>
      <defs>
        <clipPath id={id}><rect x={unit.x} y={unit.y} width={unit.w} height={unit.h} rx={7} /></clipPath>
        <linearGradient id={`${id}-g`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#dfe3ea" />
          <stop offset="1" stopColor="#9aa3b2" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id})`}>
        <g className={`pm-shutter ${open ? 'is-open' : ''}`} style={{ transform: open ? `translateY(${-unit.h - 4}px)` : 'none' }}>
          <rect x={unit.x} y={unit.y} width={unit.w} height={unit.h} fill={`url(#${id}-g)`} />
          {Array.from({ length: slats }, (_, i) => (
            <line key={i} x1={unit.x} x2={unit.x + unit.w} y1={unit.y + ((i + 1) * unit.h) / (slats + 1)} y2={unit.y + ((i + 1) * unit.h) / (slats + 1)} stroke="rgba(60,66,80,0.45)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          ))}
          <rect x={unit.x + unit.w * 0.42} y={unit.y + unit.h - 7} width={unit.w * 0.16} height={3} rx={1.5} fill="#5b6475" />
        </g>
      </g>
    </g>
  );
}

interface Props {
  leg: RouteLeg;
  /** Changing this replays the walk. */
  playKey: string;
  animate: boolean;
  destUnit?: WayfindingLocation | null;
  transitUnit?: WayfindingLocation | null;
  /** Walker starts by stepping out of a lift. */
  fromTransit?: boolean;
  transitText?: string;
  destLabel?: string;
  accent?: string;
  onFinished?: () => void;
}

/**
 * One floor of a route: the line draws itself in behind a walking figure; at a lift the figure
 * steps in and a badge says where to go; at the destination the shutter rolls up and a pin drops.
 */
export function RouteLayer({ leg, playKey, animate, destUnit, transitUnit, fromTransit, transitText, destLabel, accent = '#e0314b', onFinished }: Props) {
  const d = useMemo(() => roundedPath(leg.points), [leg.points]);
  const progRef = useRef<SVGPathElement>(null);
  const walkerRef = useRef<SVGGElement>(null);
  const flipRef = useRef<SVGGElement>(null);
  const [phase, setPhase] = useState<'walking' | 'done'>(animate ? 'walking' : 'done');
  const finished = useRef(onFinished);
  finished.current = onFinished;

  useEffect(() => {
    const path = progRef.current;
    if (!path) return;
    const L = path.getTotalLength();
    const place = (t: number) => {
      const p = path.getPointAtLength(L * t);
      walkerRef.current?.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
      path.style.strokeDashoffset = String(L * (1 - t));
      const q = path.getPointAtLength(Math.min(L, L * t + 24));
      const back = path.getPointAtLength(Math.max(0, L * t - 24));
      const dx = q.x - back.x;
      if (Math.abs(dx) > 2) flipRef.current?.setAttribute('transform', dx < 0 ? 'scale(-1 1)' : '');
    };
    path.style.strokeDasharray = `${L} ${L}`;

    if (!animate || reducedMotion()) {
      place(1);
      setPhase('done');
      return;
    }
    setPhase('walking');
    place(0);
    const delay = fromTransit ? 450 : 250;
    const duration = Math.max(3000, Math.min(7500, 1800 + L * 1.1));
    let raf = 0;
    const t0 = performance.now() + delay;
    const tick = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - t0) / duration));
      // Gentle start and stop, steady in the middle.
      const e = t < 0.12 ? (t / 0.12) ** 2 * 0.06 : t > 0.9 ? 1 - ((1 - t) / 0.1) ** 2 * 0.05 : 0.06 + ((t - 0.12) / 0.78) * 0.89;
      place(e);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setPhase('done');
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playKey, d, animate, fromTransit]);

  // Tell the page when this floor's part is over (after the lift badge / shutter have had a moment).
  useEffect(() => {
    if (phase !== 'done' || !animate) return;
    const t = window.setTimeout(() => finished.current?.(), leg.end.kind === 'transit' ? 1500 : 1400);
    return () => window.clearTimeout(t);
  }, [phase, animate, leg.end.kind, playKey]);

  const start = leg.points[0];
  const end = leg.points[leg.points.length - 1];
  const walking = phase === 'walking';
  const atTransit = leg.end.kind === 'transit';

  return (
    <g style={{ pointerEvents: 'none' }}>
      {destUnit && !atTransit && <Shutter unit={destUnit} open={!walking} />}
      {destUnit && !atTransit && !walking && (
        <rect className="pm-dest-glow" x={destUnit.x - 4} y={destUnit.y - 4} width={destUnit.w + 8} height={destUnit.h + 8} rx={10} fill="none" stroke={accent} strokeWidth={3} vectorEffect="non-scaling-stroke" />
      )}

      {/* Route ahead (dotted) and travelled (solid, drawn in behind the walker). */}
      <path d={d} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path className="pm-route-ahead" d={d} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={3} strokeDasharray="1 13" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path ref={progRef} d={d} fill="none" stroke={accent} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />

      <Fixed x={start.x} y={start.y}>
        <circle r={6} fill="#fff" stroke={accent} strokeWidth={3} />
      </Fixed>

      {atTransit && transitUnit && (
        <Fixed x={transitUnit.x + transitUnit.w / 2} y={transitUnit.y + transitUnit.h / 2}>
          <circle className="pm-pulse" r={26} fill="none" stroke="#f5b93a" strokeWidth={2.5} />
          <circle className="pm-pulse pm-delay" r={26} fill="none" stroke="#f5b93a" strokeWidth={2.5} />
          {!walking && transitText && (
            <g className="pm-badge" transform="translate(0 -30)">
              <rect x={-(24 + transitText.length * 3.7)} y={-15} width={48 + transitText.length * 7.4} height={30} rx={15} fill="rgba(12,14,34,0.95)" stroke="#f5b93a" strokeWidth={1.5} />
              <text x={0} y={0} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={13} fontWeight={700} style={{ fontFamily: 'Montserrat, system-ui, sans-serif' }}>{transitText}</text>
            </g>
          )}
        </Fixed>
      )}

      {!atTransit && !walking && (
        <Fixed x={end.x} y={end.y}><DestinationPin label={destLabel} color={accent} /></Fixed>
      )}

      <g ref={walkerRef}>
        <g style={{ transform: 'scale(var(--ik))' }}>
          <g className={`pm-walker ${walking ? 'is-walking' : ''} ${!walking && atTransit ? 'is-leaving' : ''} ${fromTransit && walking ? 'is-arriving' : ''} ${!walking && !atTransit ? 'is-arrived' : ''}`}>
            <g transform="scale(1.35)"><g ref={flipRef}><Walker accent={accent} /></g></g>
          </g>
        </g>
      </g>
    </g>
  );
}

/** "You are here" dot, with a soft beam showing which way the QR code faces. */
export function YouAreHere({ x, y, heading, label }: { x: number; y: number; heading?: number | null; label?: string }) {
  return (
    <Fixed x={x} y={y} style={{ pointerEvents: 'none' }}>
      {heading != null && (
        <g style={{ transform: `rotate(${heading}deg)` }} className="pm-beam">
          <path d="M0 0 L-26 -58 A64 64 0 0 1 26 -58 Z" fill="url(#pm-beam)" />
        </g>
      )}
      <circle className="pm-pulse" r={30} fill="rgba(59,130,246,0.35)" />
      <circle r={11} fill="#fff" />
      <circle r={7.5} fill="#2f7bf6" />
      {label && (
        <g transform="translate(0 32)">
          <rect x={-(18 + label.length * 3.4)} y={-12} width={36 + label.length * 6.8} height={24} rx={12} fill="rgba(12,14,34,0.92)" stroke="rgba(96,165,250,0.9)" strokeWidth={1.2} />
          <text x={0} y={0} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={11.5} fontWeight={700} style={{ fontFamily: 'Montserrat, system-ui, sans-serif', letterSpacing: '0.02em' }}>{label}</text>
        </g>
      )}
    </Fixed>
  );
}

/** Gradient used by the "you are here" beam; place once inside the map's <defs>. */
export const MapDefs = () => (
  <radialGradient id="pm-beam" cx="0.5" cy="1" r="1" fx="0.5" fy="1">
    <stop offset="0" stopColor="rgba(59,130,246,0.55)" />
    <stop offset="1" stopColor="rgba(59,130,246,0)" />
  </radialGradient>
);
