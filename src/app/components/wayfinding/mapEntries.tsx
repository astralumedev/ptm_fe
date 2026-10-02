import { useState } from 'react';
import type { WayfindingStore } from '../../../types/wayfinding';
import { CmsIcon } from '../../../content/icons';
import { useMapCategories } from './useMapContent';

type MapCategories = ReturnType<typeof useMapCategories>;

/** Colour of a store or place on the map: a place's own colour, otherwise its category's. */
export function entryColor(entry: WayfindingStore, categories: MapCategories): string {
  return (entry.kind === 'place' && entry.color) || categories.info(entry.cat, categories.info('shop')).color;
}

/** Icon key for an entry: a place's own icon, otherwise its store category's CMS icon. */
export function entryIcon(entry: WayfindingStore, categories: MapCategories): string | undefined {
  return entry.kind === 'place' ? entry.icon : categories.find(entry.cat)?.icon;
}

/** Small label under a name: the place's description or the store's category. */
export function entryKindLabel(entry: WayfindingStore, categories: MapCategories): string {
  if (entry.kind === 'place') return entry.partOf ? entry.partOf.name : entry.subtitle || categories.info('place').label;
  return categories.info(entry.cat, categories.info('shop')).label;
}

/**
 * Stores and places matching what a visitor typed, best first: names that start with it,
 * then names that contain it, then matches on category, description or unit number.
 */
export function searchEntries(entries: WayfindingStore[], query: string, categories: MapCategories, max = 8): WayfindingStore[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored: { e: WayfindingStore; score: number }[] = [];
  for (const e of entries) {
    const name = e.name.toLowerCase();
    let score = name.startsWith(q) ? 0 : name.split(/[\s&-]+/).some((w) => w.startsWith(q)) ? 1 : name.includes(q) ? 2 : -1;
    if (score < 0) {
      const extra = [e.subtitle, e.partOf?.name, e.cat, categories.info(e.cat).label, ...(e.shutters || []).map((s) => s.split(':')[1])];
      if (extra.some((t) => t?.toLowerCase().includes(q))) score = 3;
    }
    if (score >= 0) scored.push({ e, score });
  }
  return scored.sort((a, b) => a.score - b.score || a.e.name.localeCompare(b.e.name)).slice(0, max).map((s) => s.e);
}

/**
 * Logo of a store, or, when it has none (and always for places), its icon on a tint of its
 * colour. Used for every thumbnail on the map so the list never mixes broken and filled tiles.
 */
export function EntryMark({ entry, size = 32, radius = 10, className = '' }: { entry: WayfindingStore; size?: number; radius?: number; className?: string }) {
  const categories = useMapCategories();
  const [failed, setFailed] = useState(false);
  const box = { width: size, height: size, borderRadius: radius };
  if (entry.kind !== 'place' && entry.logo && !failed) {
    return (
      <img
        src={entry.logo}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={`shrink-0 object-contain bg-white p-[3px] ${className}`}
        style={box}
      />
    );
  }
  const color = entryColor(entry, categories);
  return (
    <span
      aria-hidden="true"
      className={`shrink-0 grid place-items-center ${className}`}
      style={{ ...box, color, background: `${color}26`, boxShadow: `inset 0 0 0 1px ${color}55` }}
    >
      <CmsIcon name={entryIcon(entry, categories)} fallback={entry.kind === 'place' ? 'pin' : 'store'} className="w-[46%] h-[46%]" />
    </span>
  );
}
