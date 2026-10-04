import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import type { FloorData, FloorId, RouteLeg, WayfindingLocation, WayfindingStore } from '../../../types/wayfinding';
import { hexRgb } from '../../../lib/color';
import { silhouettePoints } from '../../../lib/mapRouter';
import { MapCanvas, MapCanvasHandle, boundsOf } from '../map/MapCanvas';
import { FloorPlan, UnitOccupant, UnitStyle } from '../map/FloorPlan';
import { MapDefs, RouteLayer, YouAreHere } from '../map/RouteLayer';
import { useMapCategories } from './useMapContent';

export interface StartPoint {
  name: string;
  floorId: FloorId;
  x: number;
  y: number;
  heading?: number | null;
  code?: string;
}

interface Props {
  floorId: FloorId;
  floor: FloorData | null;
  stores: WayfindingStore[];
  activeCategory: string | null;
  selectedUnitId: string | null;
  start: StartPoint | null;
  youAreHereLabel: string;
  leg: RouteLeg | null;
  legFromTransit: boolean;
  playKey: string;
  animate: boolean;
  transitText?: string;
  destLabel?: string;
  /** Floor change direction, for the slide-in. */
  enterFrom: 'up' | 'down' | null;
  onSelectUnit: (unit: WayfindingLocation | null, store: WayfindingStore | null) => void;
  onLegFinished: () => void;
}

const THEME = { plate: '#151a2c', plateStroke: 'rgba(148,163,184,0.42)', label: '#f4f6fb', labelHalo: 'rgba(7,9,20,0.85)' };
const ACCENT = '#e0314b';
const AMENITY = new Set(['restroom', 'elevator', 'stairs', 'service', 'void', 'atrium']);

export function floorBounds(floor: FloorData | null) {
  if (!floor) return null;
  const pts = silhouettePoints(floor.silhouette);
  const all = pts.length >= 3 ? pts : floor.locations.flatMap((l) => [{ x: l.x, y: l.y }, { x: l.x + l.w, y: l.y + l.h }]);
  return boundsOf(all, 40);
}

export const VisitorMapStage = forwardRef<MapCanvasHandle, Props>(function VisitorMapStage(
  { floorId, floor, stores, activeCategory, selectedUnitId, start, youAreHereLabel, leg, legFromTransit, playKey, animate, transitText, destLabel, enterFrom, onSelectUnit, onLegFinished },
  ref,
) {
  const categories = useMapCategories();
  // Floor buttons float over the top of the map, and on phones the store sheet over the bottom.
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
  useEffect(() => {
    const on = () => setNarrow(window.innerWidth < 1024);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  // unit id (lowercase) -> the store in it, for this floor.
  const byUnit = useMemo(() => {
    const m = new Map<string, { store: WayfindingStore; occ: UnitOccupant }>();
    for (const s of stores) {
      const units = (s.shutters || []).filter((k) => k.startsWith(`${floorId}:`)).map((k) => k.slice(floorId.length + 1));
      if (!units.length) continue;
      const occ = { name: s.name, cat: s.cat, cats: s.cats, units, color: s.kind === 'place' ? s.color : undefined };
      for (const u of units) m.set(u.toLowerCase(), { store: s, occ });
    }
    return m;
  }, [stores, floorId]);

  const occupantOf = useCallback((id: string) => byUnit.get(id.toLowerCase())?.occ || null, [byUnit]);

  const routeUnits = useMemo(() => {
    const s = new Set<string>();
    if (leg) { if (leg.end.kind === 'transit') s.add(leg.end.unitId.toLowerCase()); else if (leg.end.unitId) s.add(leg.end.unitId.toLowerCase()); }
    return s;
  }, [leg]);
  const selectedStoreUnits = useMemo(() => {
    const occ = selectedUnitId ? occupantOf(selectedUnitId) : null;
    return new Set((occ?.units || (selectedUnitId ? [selectedUnitId] : [])).map((u) => u.toLowerCase()));
  }, [selectedUnitId, occupantOf]);

  const styleOf = useCallback((u: WayfindingLocation, occ: UnitOccupant | null): UnitStyle => {
    const cat = occ?.cat || u.cat;
    const color = occ?.color || categories.info(cat).color;
    const [r, g, b] = hexRgb(color);
    const id = u.id.toLowerCase();
    const selected = selectedStoreUnits.has(id);
    const onRoute = routeUnits.has(id);
    const vacant = !occ && u.cat === 'shop';
    let opacity = 1;
    if (activeCategory) opacity = (occ && categories.entryMatches(occ, activeCategory)) || categories.matches(u.cat, activeCategory) ? 1 : 0.14;
    else if (leg) opacity = onRoute || selected ? 1 : 0.42;
    else if (selectedUnitId) opacity = selected ? 1 : 0.55;

    if (selected || onRoute) {
      return { fill: `rgba(${r},${g},${b},0.78)`, stroke: '#ffffff', strokeWidth: 2.4, opacity, glow: true, labelColor: '#fff' };
    }
    if (vacant) return { fill: 'rgba(255,255,255,0.035)', stroke: 'rgba(255,255,255,0.13)', opacity, labelColor: 'rgba(226,232,240,0.38)' };
    if (AMENITY.has(u.cat) && !occ) {
      if (u.cat === 'void') return { fill: 'rgba(7,9,20,0.75)', stroke: 'rgba(255,255,255,0.08)', opacity };
      if (u.cat === 'atrium') return { fill: 'rgba(232,161,58,0.07)', stroke: 'rgba(232,161,58,0.25)', opacity };
      return { fill: `rgba(${r},${g},${b},0.2)`, stroke: `rgba(${r},${g},${b},0.75)`, opacity, labelColor: color };
    }
    return { fill: `rgba(${r},${g},${b},0.24)`, stroke: `rgba(${r},${g},${b},0.8)`, opacity };
  }, [categories, selectedStoreUnits, routeUnits, activeCategory, leg, selectedUnitId]);

  const fit = useMemo(() => floorBounds(floor), [floor]);
  const destUnit = leg && leg.end.kind === 'destination' && leg.end.unitId ? floor?.locations.find((l) => l.id.toLowerCase() === (leg.end as { unitId: string }).unitId.toLowerCase()) : null;
  const transitUnit = leg && leg.end.kind === 'transit' ? floor?.locations.find((l) => l.id === (leg.end as { unitId: string }).unitId) : null;

  const onUnitClick = useCallback((u: WayfindingLocation) => {
    if (u.cat === 'void' || u.cat === 'atrium') return;
    onSelectUnit(u, byUnit.get(u.id.toLowerCase())?.store || null);
  }, [byUnit, onSelectUnit]);

  return (
    <MapCanvas
      ref={ref}
      fit={fit}
      fitKey={floorId}
      fitPad={28}
      minK={0.06}
      maxK={3}
      defs={<MapDefs />}
      ariaLabel="Mall floor map"
      insets={narrow ? { top: 60, bottom: 84 } : { top: 64, bottom: 0 }}
      onTap={(_, e) => { if (!(e.target as Element)?.closest?.('[data-unit]')) onSelectUnit(null, null); }}
    >
      {(k) => floor && (
        <g key={floorId} className={`pm-floor-enter ${enterFrom === 'up' ? 'pm-up' : enterFrom === 'down' ? 'pm-down' : ''}`}>
          <FloorPlan floor={floor} k={k} occupantOf={occupantOf} styleOf={styleOf} theme={THEME} onUnitClick={onUnitClick} />
          {start && start.floorId === floorId && <YouAreHere x={start.x} y={start.y} heading={start.heading} label={youAreHereLabel} />}
          {leg && leg.floorId === floorId && (
            <RouteLayer
              key={playKey}
              leg={leg}
              playKey={playKey}
              animate={animate}
              destUnit={destUnit}
              transitUnit={transitUnit}
              fromTransit={legFromTransit}
              transitText={transitText}
              destLabel={destLabel}
              accent={ACCENT}
              onFinished={onLegFinished}
            />
          )}
        </g>
      )}
    </MapCanvas>
  );
});
