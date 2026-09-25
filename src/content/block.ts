import { useMemo, useSyncExternalStore } from 'react';
import type { Field } from './fields';
import { getBundleSnapshot, subscribeBundle } from '@/services/api';

/**
 * A block is one editable section of the site (a hero, a menu, a page's copy).
 * `defaults` is what the site shows until staff save their own version in the CMS,
 * and doubles as the starting point in the editor.
 */
export interface BlockDef<T extends object = Record<string, any>> {
  key: string; // stable id; also the CMS slug (lowercase, hyphens)
  group: string; // admin grouping, e.g. "Home page"
  label: string;
  description?: string;
  /** Public page where the block appears, for the admin's "View on website" link. */
  page?: string;
  fields: Field[];
  defaults: T;
}

export function defineBlock<T extends object>(def: BlockDef<T>): BlockDef<T> {
  return def;
}

const META_KEYS = new Set(['id', 'slug', 'status']);

export function mergeBlock<T extends object>(def: BlockDef<T>, saved: Record<string, any> | undefined): T {
  if (!saved) return def.defaults;
  const out: Record<string, any> = { ...def.defaults };
  for (const [k, v] of Object.entries(saved)) if (!META_KEYS.has(k) && v !== undefined) out[k] = v;
  return out as T;
}

/** Current content of a block: the CMS version when saved, otherwise the defaults. */
export function useBlock<T extends object>(def: BlockDef<T>): T {
  const bundle = useSyncExternalStore(subscribeBundle, getBundleSnapshot, getBundleSnapshot);
  const saved = bundle?.blocks?.find((b) => b.slug === def.key);
  return useMemo(() => mergeBlock(def, saved), [def, saved]);
}

/** The whole published bundle (stores, events, blocks…) for components that render synchronously. */
export function useBundle() {
  return useSyncExternalStore(subscribeBundle, getBundleSnapshot, getBundleSnapshot);
}
