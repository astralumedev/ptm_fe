import { memo, ReactNode, useMemo } from 'react';
import type { FloorData, WayfindingLocation } from '../../../types/wayfinding';
import { silhouettePoints } from '../../../lib/mapRouter';
import { CategoryIcon } from '../wayfinding/CategoryIcon';

export interface UnitOccupant {
  name: string;
  cat: string;
  /** Every unit the store occupies on this floor (a store over two units is drawn as one shop). */
  units: string[];
}

export interface UnitStyle {
  fill: string;
  stroke: string;
  opacity?: number;
  labelColor?: string;
  strokeWidth?: number;
  glow?: boolean;
}

interface Props {
  floor: FloorData;
  k: number;
  occupantOf: (unitId: string) => UnitOccupant | null;
  styleOf: (unit: WayfindingLocation, occ: UnitOccupant | null) => UnitStyle;
  theme: { plate: string; plateStroke: string; label: string; labelHalo: string };
  onUnitDown?: (unit: WayfindingLocation, e: React.PointerEvent) => void;
  onUnitClick?: (unit: WayfindingLocation, e: React.MouseEvent) => void;
  /** Hide labels/icons (the editor draws its own while dragging). */
  showLabels?: boolean;
  showIds?: boolean;
  /** Editor only: draw the traced floor-plan image under the units. Visitors never see it. */
  showUnderlay?: boolean;
  children?: ReactNode;
}

const AMENITY = new Set(['restroom', 'elevator', 'stairs', 'service', 'void', 'atrium']);
const ICON_ONLY = new Set(['restroom', 'elevator', 'stairs']);

/**
 * Outline and fill of several touching rectangles as one shape (a shop over two units).
 * Rectangles are grown by `tol` so hairline gaps between neighbouring units close up.
 */
export function unionShape(rects: { x: number; y: number; w: number; h: number }[], tol = 6) {
  const rs = rects.map((r) => ({ x0: r.x - tol, y0: r.y - tol, x1: r.x + r.w + tol, y1: r.y + r.h + tol }));
  const xs = [...new Set(rs.flatMap((r) => [r.x0, r.x1]))].sort((a, b) => a - b);
  const ys = [...new Set(rs.flatMap((r) => [r.y0, r.y1]))].sort((a, b) => a - b);
  const cov = (i: number, j: number) => {
    if (i < 0 || j < 0 || i >= xs.length - 1 || j >= ys.length - 1) return false;
    const cx = (xs[i] + xs[i + 1]) / 2, cy = (ys[j] + ys[j + 1]) / 2;
    return rs.some((r) => cx > r.x0 && cx < r.x1 && cy > r.y0 && cy < r.y1);
  };
  // Outer edges are pulled back by `tol` so the outline lines up with the neighbouring units.
  let fill = '', edge = '';
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
    if (!cov(i, j)) continue;
    const x0 = cov(i - 1, j) ? xs[i] : xs[i] + tol, x1 = cov(i + 1, j) ? xs[i + 1] : xs[i + 1] - tol;
    const y0 = cov(i, j - 1) ? ys[j] : ys[j] + tol, y1 = cov(i, j + 1) ? ys[j + 1] : ys[j + 1] - tol;
    fill += `M${x0} ${y0}H${x1}V${y1}H${x0}Z`;
    if (!cov(i - 1, j)) edge += `M${x0} ${y0}V${y1}`;
    if (!cov(i + 1, j)) edge += `M${x1} ${y0}V${y1}`;
    if (!cov(i, j - 1)) edge += `M${x0} ${y0}H${x1}`;
    if (!cov(i, j + 1)) edge += `M${x0} ${y1}H${x1}`;
  }
  return { fill, edge };
}

/** Splits a store name over at most two balanced lines. */
function lines(name: string): string[] {
  const clean = name.replace(/\s+/g, ' ').trim();
  if (clean.length <= 12) return [clean];
  const words = clean.split(' ');
  if (words.length === 1) return [clean];
  let best = [clean], bestScore = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
    const score = Math.max(a.length, b.length);
    if (score < bestScore) { bestScore = score; best = [a, b]; }
  }
  return best;
}

/** Shop label sized to fit its box; hidden when it would be unreadably small on screen. */
function Label({ box, text, k, color, halo, sub, max = 46, weight = 650 }: { box: { x: number; y: number; w: number; h: number }; text: string; k: number; color: string; halo: string; sub?: string; max?: number; weight?: number }) {
  const ls = lines(text.length > 34 ? text.slice(0, 32) + '…' : text);
  const longest = Math.max(...ls.map((l) => l.length), 3);
  const size = Math.min((box.w * 0.86) / (longest * 0.56), (box.h * 0.62) / (ls.length + (sub ? 0.7 : 0)), max);
  if (size * k < 6.5) return null;
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  const total = ls.length * size * 1.1 + (sub ? size * 0.8 : 0);
  const y0 = cy - total / 2 + size * 0.55;
  return (
    <text x={cx} textAnchor="middle" fill={color} fontSize={size} fontWeight={weight}
      style={{ fontFamily: 'Montserrat, system-ui, sans-serif', paintOrder: 'stroke', stroke: halo, strokeWidth: size * 0.16, strokeLinejoin: 'round', pointerEvents: 'none', letterSpacing: '-0.01em' }}>
      {ls.map((l, i) => <tspan key={i} x={cx} y={y0 + i * size * 1.1} dominantBaseline="central">{l}</tspan>)}
      {sub && <tspan x={cx} y={y0 + ls.length * size * 1.1 - size * 0.05} dominantBaseline="central" fontSize={size * 0.62} fontWeight={500} opacity={0.75}>{sub}</tspan>}
    </text>
  );
}

function FloorPlanImpl({ floor, k, occupantOf, styleOf, theme, onUnitDown, onUnitClick, showLabels = true, showIds, showUnderlay, children }: Props) {
  const traced = !!(showUnderlay && floor.underlay);
  const sil = useMemo(() => silhouettePoints(floor.silhouette).map((p) => `${p.x},${p.y}`).join(' '), [floor.silhouette]);

  // Stores spread over several units get one label over the whole shop.
  const groups = useMemo(() => {
    const byUnit = new Map<string, { key: string; box: { x: number; y: number; w: number; h: number }; occ: UnitOccupant }>();
    const seen = new Map<string, { key: string; box: { x: number; y: number; w: number; h: number }; occ: UnitOccupant }>();
    for (const u of floor.locations) {
      const occ = occupantOf(u.id);
      if (!occ || occ.units.length < 2) continue;
      const key = occ.units.map((x) => x.toLowerCase()).sort().join('+');
      let g = seen.get(key);
      if (!g) {
        const rects = floor.locations.filter((l) => occ.units.some((x) => x.toLowerCase() === l.id.toLowerCase()));
        const x0 = Math.min(...rects.map((r) => r.x)), y0 = Math.min(...rects.map((r) => r.y));
        const x1 = Math.max(...rects.map((r) => r.x + r.w)), y1 = Math.max(...rects.map((r) => r.y + r.h));
        g = { key, box: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, occ };
        seen.set(key, g);
      }
      byUnit.set(u.id, g);
    }
    return { byUnit, list: [...seen.values()] };
  }, [floor.locations, occupantOf]);

  return (
    <g>
      {traced && floor.underlay && (
        <image href={floor.underlay.url} x={floor.underlay.x} y={floor.underlay.y} width={floor.underlay.w} height={floor.underlay.h} opacity={floor.underlay.opacity} preserveAspectRatio="none" style={{ pointerEvents: 'none' }} />
      )}
      {sil && <polygon points={sil} fill={traced ? 'rgba(255,255,255,0.12)' : theme.plate} stroke={theme.plateStroke} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />}

      {/* Shops over several units are drawn as one space, without the inner walls. */}
      {groups.list.map((g) => {
        const rects = floor.locations.filter((l) => g.occ.units.some((x) => x.toLowerCase() === l.id.toLowerCase()));
        const s = styleOf(rects[0], g.occ);
        const shape = unionShape(rects);
        return (
          <g key={g.key} style={{ pointerEvents: 'none', opacity: s.opacity ?? 1, transition: 'opacity 260ms ease' }}>
            <path d={shape.fill} fill={s.fill} style={{ transition: 'fill 220ms ease', filter: s.glow ? `drop-shadow(0 0 10px ${s.stroke})` : undefined }} />
            <path d={shape.edge} fill="none" stroke={s.stroke} strokeWidth={s.strokeWidth ?? 1.3} strokeLinecap="square" vectorEffect="non-scaling-stroke" style={{ transition: 'stroke 220ms ease' }} />
          </g>
        );
      })}

      {floor.locations.map((u) => {
        const occ = occupantOf(u.id);
        const s = styleOf(u, occ);
        const merged = groups.byUnit.has(u.id);
        return (
          <g key={u.id} data-unit={u.id} style={{ opacity: (s.opacity ?? 1) * (traced ? 0.72 : 1), transition: 'opacity 260ms ease', cursor: onUnitClick || onUnitDown ? 'pointer' : undefined }}
            onPointerDown={onUnitDown ? (e) => onUnitDown(u, e) : undefined}
            onClick={onUnitClick ? (e) => onUnitClick(u, e) : undefined}>
            {merged
              ? <rect x={u.x} y={u.y} width={Math.max(1, u.w)} height={Math.max(1, u.h)} fill="transparent" />
              : <rect x={u.x} y={u.y} width={Math.max(1, u.w)} height={Math.max(1, u.h)} rx={7}
                  fill={s.fill} stroke={s.stroke} strokeWidth={s.strokeWidth ?? 1.3} vectorEffect="non-scaling-stroke"
                  style={{ transition: 'fill 220ms ease, stroke 220ms ease', filter: s.glow ? `drop-shadow(0 0 10px ${s.stroke})` : undefined }} />}
          </g>
        );
      })}

      {showLabels && floor.locations.map((u) => {
        if (groups.byUnit.has(u.id)) return null;
        const occ = occupantOf(u.id);
        const s = styleOf(u, occ);
        const cat = occ?.cat || u.cat;
        const cx = u.x + u.w / 2, cy = u.y + u.h / 2;
        if (!occ && AMENITY.has(u.cat)) {
          if (!ICON_ONLY.has(u.cat) && u.cat !== 'service') return null;
          const size = Math.min(u.w, u.h) * 0.5;
          if (size * k < 9) return null;
          const px = Math.max(12, Math.min(28, size * k));
          return (
            <g key={u.id} transform={`translate(${cx} ${cy})`} style={{ pointerEvents: 'none', opacity: s.opacity ?? 1, transition: 'opacity 260ms ease' }}>
              <g style={{ transform: 'scale(var(--ik))' }}>
                <g transform={`translate(${-px / 2} ${-px / 2})`}><CategoryIcon category={cat} size={px} color={s.labelColor || s.stroke} /></g>
              </g>
            </g>
          );
        }
        const name = occ?.name || u.name || (showIds || u.cat === 'shop' ? u.id : '');
        if (!name) return null;
        return (
          <g key={u.id} style={{ opacity: s.opacity ?? 1, transition: 'opacity 260ms ease' }}>
            <Label box={u} text={name} k={k} color={s.labelColor || theme.label} halo={theme.labelHalo} sub={showIds && occ ? u.id : undefined}
              {...(!occ && !u.name ? { max: 20, weight: 500 } : {})} />
          </g>
        );
      })}
      {showLabels && groups.list.map((g) => {
        const first = floor.locations.find((l) => g.occ.units.some((x) => x.toLowerCase() === l.id.toLowerCase()))!;
        const s = styleOf(first, g.occ);
        return (
          <g key={g.key} style={{ opacity: s.opacity ?? 1, transition: 'opacity 260ms ease' }}>
            <Label box={g.box} text={g.occ.name} k={k} color={s.labelColor || theme.label} halo={theme.labelHalo} sub={showIds ? g.occ.units.join(' + ') : undefined} />
          </g>
        );
      })}
      {children}
    </g>
  );
}

export const FloorPlan = memo(FloorPlanImpl);
