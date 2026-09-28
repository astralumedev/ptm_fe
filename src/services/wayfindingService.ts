import { FloorId, WayfindingStore, FLOOR_LABELS } from '../types/wayfinding';
import api from './api';
import type { Store } from '../data/models/Store';

export interface WayfindingStoresResponse {
  stores: WayfindingStore[];
}

type CmsStore = Store & { mapFloor?: string | null; mapUnits?: string[] | string | null };

const isFloor = (f: unknown): f is FloorId => typeof f === 'string' && f in FLOOR_LABELS;

/** Map placement of a CMS store from its Mall map floor / units; unplaced when not set. */
function placement(store: CmsStore): { floor?: FloorId; units: string[] } {
  const units = (Array.isArray(store.mapUnits) ? store.mapUnits : String(store.mapUnits || '').split(','))
    .map((u) => String(u).trim())
    .filter(Boolean);
  return isFloor(store.mapFloor) ? { floor: store.mapFloor, units } : { units: [] };
}

function toMapStore(store: CmsStore): WayfindingStore {
  const { floor, units } = placement(store);
  return {
    id: store.slug || String(store.id),
    name: store.name,
    slug: store.slug,
    cat: store.categorySlug || store.category || 'shop',
    desc: store.store_description?.replace(/<[^>]*>/g, '').trim() || store.subtitle || undefined,
    hours: store.operation_hours || undefined,
    phone: store.contact_number || undefined,
    floor,
    shutters: floor ? units.map((u) => `${floor}:${u}`) : [],
    logo: store.logo?.data?.full_url,
    image: store.cover?.data?.full_url,
  };
}

class WayfindingService {
  /**
   * Map stores: published CMS stores placed by their Mall map floor / units. Stores without
   * units are returned too, so visitors can still find them in search.
   */
  async getStores(): Promise<WayfindingStore[]> {
    try {
      const res = await api.getStores({ filter: { status: 'published' } });
      return (res.data as CmsStore[]).filter((s) => s && s.name).map(toMapStore);
    } catch (error) {
      console.error('WayfindingService: Error loading stores', error);
      return [];
    }
  }
}

export const wayfindingService = new WayfindingService();
export default wayfindingService;
