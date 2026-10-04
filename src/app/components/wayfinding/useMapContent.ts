import { useCallback, useMemo } from 'react';
import { useBlock } from '../../../content/block';
import { mapPageBlock, type MapFloorText } from '../../../content/blocks/map';
import { useCategories } from '../../../content/blocks/categories';
import { CATEGORIES, CategoryInfo, FLOOR_LABELS, FloorId } from '../../../types/wayfinding';

export const ALL_FLOORS = Object.keys(FLOOR_LABELS) as FloorId[];

/** Fills {placeholders} in CMS text. */
export function fill(template: string | undefined, vars: Record<string, string | number>): string {
  return (template || '').replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

export function useMapCopy() {
  return useBlock(mapPageBlock);
}

/** Floor texts for every fixed floor id, in floor order; missing/blank CMS values fall back to defaults. */
export function useFloorTexts() {
  const { floors } = useMapCopy();
  return useMemo(() => {
    const defaults = mapPageBlock.defaults.floors;
    const items = ALL_FLOORS.map((id) => {
      const def = defaults.find((f) => f.id === id) || { id, short: id, label: FLOOR_LABELS[id], name: FLOOR_LABELS[id], desc: '' };
      const saved = (Array.isArray(floors) ? floors : []).find((f: MapFloorText) => f?.id === id);
      return {
        id,
        short: saved?.short?.trim() || def.short,
        label: saved?.label?.trim() || def.label,
        name: saved?.name?.trim() || def.name,
        desc: saved?.desc?.trim() ?? def.desc,
      };
    });
    const names = Object.fromEntries(items.map((f) => [f.id, f.name])) as Record<FloorId, string>;
    return { items, names };
  }, [floors]);
}

const FALLBACK: CategoryInfo = CATEGORIES.service;

/**
 * Category label/colour for map codes: canonical store categories (CMS) first, then the
 * built-in table for amenities (stairs, lifts, restrooms…) and unknown codes.
 */
export function useMapCategories() {
  const cats = useCategories();

  const canonical = useCallback((code?: string | null) => cats.find(code)?.slug || code || '', [cats]);

  const info = useCallback(
    (code?: string | null, fallback: CategoryInfo = FALLBACK): CategoryInfo => {
      const cat = cats.find(code);
      if (cat) return { label: cat.shortName || cat.name, color: cat.color || fallback.color };
      return (code && CATEGORIES[code]) || fallback;
    },
    [cats],
  );

  const matches = useCallback(
    (code: string | null | undefined, active: string | null) => !!code && canonical(code) === canonical(active),
    [canonical],
  );

  /** True when a store or place is in the active category (any of its categories). */
  const entryMatches = useCallback(
    (e: { cat: string; cats?: string[] }, active: string | null) => (e.cats?.length ? e.cats : [e.cat]).some((c) => matches(c, active)),
    [matches],
  );

  return { ...cats, info, canonical, matches, entryMatches };
}

/** Unit id of a store's first shutter ("floor:A101" -> "A101"), if placed. */
export const firstUnit = (shutters?: string[]) => shutters?.[0]?.split(':')[1];
