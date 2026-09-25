import { FloorId, FloorData, WayfindingStore, FLOOR_LABELS } from '../types/wayfinding';
import api from './api';
import type { Store } from '../data/models/Store';
import legacyUnits from '../data/storeMapUnits.json';

export interface WayfindingStoresResponse {
  stores: WayfindingStore[];
}

export interface GetStoresOptions {
  /** Fill units no real store has claimed with the sample stores from stores.json. */
  includeDemo?: boolean;
}

type CmsStore = Store & { mapFloor?: string | null; mapUnits?: string[] | string | null };

const LEGACY_UNITS = legacyUnits as Record<string, { floor: string; shutter: string }>;
const isFloor = (f: unknown): f is FloorId => typeof f === 'string' && f in FLOOR_LABELS;

/** Map placement of a CMS store: its own map fields, else the pre-CMS table, else unplaced. */
function placement(store: CmsStore): { floor?: FloorId; units: string[] } {
  const units = (Array.isArray(store.mapUnits) ? store.mapUnits : String(store.mapUnits || '').split(','))
    .map((u) => String(u).trim())
    .filter(Boolean);
  if (isFloor(store.mapFloor)) return { floor: store.mapFloor, units };
  const legacy = LEGACY_UNITS[store.slug];
  if (legacy && isFloor(legacy.floor)) return { floor: legacy.floor, units: [legacy.shutter] };
  return { units: [] };
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
  private baseUrl: string;

  constructor() {
    const envApiUrl = import.meta.env.VITE_WAYFINDING_API_URL;
    this.baseUrl = envApiUrl ? envApiUrl.replace(/\/$/, '') : '';
  }

  private async getDemoStores(): Promise<WayfindingStore[]> {
    try {
      const endpoint = this.baseUrl ? `${this.baseUrl}/api/stores` : '/wayfinding/data/stores.json';
      const response = await fetch(endpoint);
      if (!response.ok) return [];
      const data = await response.json();
      const list: WayfindingStore[] = data.stores || (Array.isArray(data) ? data : []);
      return list.map((s) => ({ ...s, slug: '', floor: s.floor || s.shutters?.[0]?.split(':')[0] })); // demo stores have no store page
    } catch (error) {
      console.error('WayfindingService: Error loading demo stores', error);
      return [];
    }
  }

  /**
   * Map stores: published CMS stores placed by their Map floor/Units. Stores without units are
   * returned too (searchable, not drawn). Optional demo stores only fill unclaimed units.
   */
  async getStores({ includeDemo = true }: GetStoresOptions = {}): Promise<WayfindingStore[]> {
    let official: WayfindingStore[] = [];
    try {
      const res = await api.getStores({ filter: { status: 'published' } });
      official = (res.data as CmsStore[]).filter((s) => s && s.name).map(toMapStore);
    } catch (error) {
      console.error('WayfindingService: Error loading stores', error);
    }
    if (!includeDemo) return official;

    const claimed = new Set(official.flatMap((s) => s.shutters || []).map((k) => k.toLowerCase()));
    const ids = new Set(official.map((s) => s.id));
    const demo = (await this.getDemoStores()).filter(
      (s) => !ids.has(s.id) && s.shutters?.length && !s.shutters.some((k) => claimed.has(k.toLowerCase())),
    );
    return [...official, ...demo];
  }

  /**
   * Fetches floor locations and geometry for a specific floor.
   * If VITE_WAYFINDING_API_URL is configured, fetches from `${baseUrl}/api/floors/${floorId}`,
   * otherwise fetches static asset `/wayfinding/data/${floorId}.json`.
   */
  async getFloorData(floorId: FloorId): Promise<FloorData | null> {
    try {
      const endpoint = this.baseUrl
        ? `${this.baseUrl}/api/floors/${floorId}`
        : `/wayfinding/data/${floorId}.json`;

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch floor data for ${floorId}: ${response.statusText}`);
      }

      const data: FloorData = await response.json();
      return data;
    } catch (error) {
      console.error(`WayfindingService: Error loading floor data for ${floorId}`, error);
      return null;
    }
  }

  /**
   * Batch fetches floor data for all specified floors.
   */
  async getAllFloorsData(floors: FloorId[]): Promise<Record<FloorId, FloorData>> {
    const results: Record<string, FloorData> = {};
    
    await Promise.all(
      floors.map(async (f) => {
        const data = await this.getFloorData(f);
        if (data) {
          results[f] = data;
        }
      })
    );

    return results as Record<FloorId, FloorData>;
  }
}

export const wayfindingService = new WayfindingService();
export default wayfindingService;
