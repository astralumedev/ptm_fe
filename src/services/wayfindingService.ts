import { FloorId, FloorData, WayfindingStore, FLOOR_LABELS } from '../types/wayfinding';
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
  private baseUrl: string;

  constructor() {
    const envApiUrl = import.meta.env.VITE_WAYFINDING_API_URL;
    this.baseUrl = envApiUrl ? envApiUrl.replace(/\/$/, '') : '';
  }

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
