import { FloorId, WayfindingStore, FLOOR_LABELS } from '../types/wayfinding';
import { loadBundle } from './api';
import type { Store } from '../data/models/Store';

export interface WayfindingStoresResponse {
  stores: WayfindingStore[];
}

type CmsStore = Store & { mapFloor?: string | null; mapUnits?: string[] | string | null };
type CmsPlace = Record<string, any> & { slug: string; name: string; mapFloor?: string | null; mapUnits?: string[] | string | null };

/** Map code every place shares, so "Places" works as a filter like a store category. */
export const PLACE_CAT = 'place';

const isFloor = (f: unknown): f is FloorId => typeof f === 'string' && f in FLOOR_LABELS;

/** Map placement of a CMS record from its Mall map floor / units; unplaced when not set. */
function placement(rec: { mapFloor?: string | null; mapUnits?: string[] | string | null }): { floor?: FloorId; units: string[] } {
  const units = (Array.isArray(rec.mapUnits) ? rec.mapUnits : String(rec.mapUnits || '').split(','))
    .map((u) => String(u).trim())
    .filter(Boolean);
  return isFloor(rec.mapFloor) ? { floor: rec.mapFloor, units } : { units: [] };
}

const plain = (html?: string) => html?.replace(/<[^>]*>/g, '').trim() || undefined;

function toMapStore(store: CmsStore): WayfindingStore {
  const { floor, units } = placement(store);
  return {
    id: store.slug || String(store.id),
    kind: 'store',
    name: store.name,
    slug: store.slug,
    cat: store.categorySlug || store.category || 'shop',
    desc: plain(store.store_description) || store.subtitle || undefined,
    hours: store.operation_hours || undefined,
    phone: store.contact_number || undefined,
    floor,
    shutters: floor ? units.map((u) => `${floor}:${u}`) : [],
    logo: store.logo?.data?.full_url,
    image: store.cover?.data?.full_url,
  };
}

function toMapPlace(place: CmsPlace, stores: CmsStore[]): WayfindingStore {
  const { floor, units } = placement(place);
  const parent = place.storeSlug ? stores.find((s) => s.slug === place.storeSlug) : undefined;
  return {
    id: `place-${place.slug}`,
    kind: 'place',
    name: place.name,
    slug: place.slug,
    cat: PLACE_CAT,
    subtitle: place.subtitle || undefined,
    desc: plain(place.store_description) || undefined,
    hours: place.operation_hours || undefined,
    phone: place.contact_number || undefined,
    floor,
    shutters: floor ? units.map((u) => `${floor}:${u}`) : [],
    image: place.cover?.data?.full_url || undefined,
    icon: place.icon || 'pin',
    color: place.color || '#2e3094',
    partOf: parent ? { name: parent.name, slug: parent.slug } : undefined,
  };
}

class WayfindingService {
  /**
   * Everything a visitor can look up on the map: published stores, plus places (food court,
   * ticket counters…). Unplaced entries are kept so visitors can still find them in search.
   */
  async getStores(): Promise<WayfindingStore[]> {
    try {
      const bundle = await loadBundle();
      const stores = (bundle.stores as CmsStore[]).filter((s) => s && s.name && s.status === 'published');
      const places = ((bundle.places || []) as CmsPlace[]).filter((p) => p && p.name && p.status === 'published');
      return [...stores.map(toMapStore), ...places.map((p) => toMapPlace(p, stores))];
    } catch (error) {
      console.error('WayfindingService: Error loading stores', error);
      return [];
    }
  }
}

export const wayfindingService = new WayfindingService();
export default wayfindingService;
