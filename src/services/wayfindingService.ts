import { FloorId, FloorData, WayfindingStore } from '../types/wayfinding';
import { mockStores } from '../data/mockMallData';

export interface WayfindingStoresResponse {
  stores: WayfindingStore[];
}

const STORE_SHUTTER_MAP: Record<string, { floor: FloorId; shutter: string }> = {
  'levis-store': { floor: 'first_floor', shutter: 'A201' },
  'fone-decor-tech': { floor: 'ground_floor', shutter: 'A104' },
  'obsession-cosmetics': { floor: 'first_floor', shutter: 'A212' },
  'woven-nepali-handicrafts': { floor: 'ground_floor', shutter: 'A115' },
  'dadybird-fashion': { floor: 'second_floor', shutter: 'A305' },
  'cube-gaming-tech': { floor: 'ground_floor', shutter: 'A108' },
  'malabar-gold-diamonds': { floor: 'ground_floor', shutter: 'A101' },
  'himalayan-outfitters': { floor: 'first_floor', shutter: 'A202' },
  'himalayan-java-coffee': { floor: 'second_floor', shutter: 'A310' },
  'mantra-thakali-kitchen': { floor: 'fourth_floor', shutter: 'A501' },
  'aura-luxury-spa': { floor: 'third_floor', shutter: 'A404' },
  'machhapuchhre-fashion': { floor: 'second_floor', shutter: 'A308' },
  'fewa-lakeside-bistro': { floor: 'ground_floor', shutter: 'A118' },
  'qfx-cinemas': { floor: 'fifth_floor', shutter: 'L501' },
  '4d-game-zone': { floor: 'fifth_floor', shutter: 'L502' },
  'miniso-lifestyle': { floor: 'first_floor', shutter: 'A215' },
  'nabil-bank-ptm': { floor: 'ground_floor', shutter: 'A102' },
  'global-ime-bank': { floor: 'first_floor', shutter: 'A220' },
  'kangaroo-education-foundation': { floor: 'third_floor', shutter: 'A402' },
  'edwise-overseas-education': { floor: 'third_floor', shutter: 'A406' },
  'apex-architectural-studio': { floor: 'fourth_floor', shutter: 'A508' },
  'annapurna-survey-consultants': { floor: 'fourth_floor', shutter: 'A510' },
  'sweet-treats-gelato': { floor: 'ground_floor', shutter: 'A112' },
  'crispy-crunch-burgers': { floor: 'fourth_floor', shutter: 'A503' },
  'everest-momo-house': { floor: 'fourth_floor', shutter: 'A506' },
  'enamor-lingerie-boutique': { floor: 'second_floor', shutter: 'A309' },
  'solemate-footwear-bags': { floor: 'first_floor', shutter: 'A210' },
  'home-haven-decor': { floor: 'second_floor', shutter: 'A314' },
  'vertex-it-solutions': { floor: 'fourth_floor', shutter: 'A512' },
  'pulse-fitness-gym': { floor: 'fifth_floor', shutter: 'L506' },
};

class WayfindingService {
  private baseUrl: string;

  constructor() {
    const envApiUrl = import.meta.env.VITE_WAYFINDING_API_URL;
    this.baseUrl = envApiUrl ? envApiUrl.replace(/\/$/, '') : '';
  }

  /**
   * Fetches full store directory combined with rich mockStores data.
   */
  async getStores(): Promise<WayfindingStore[]> {
    try {
      const endpoint = this.baseUrl
        ? `${this.baseUrl}/api/stores`
        : '/wayfinding/data/stores.json';
      
      const response = await fetch(endpoint);
      let jsonStores: WayfindingStore[] = [];
      if (response.ok) {
        const data = await response.json();
        jsonStores = data.stores || (Array.isArray(data) ? data : []);
      }

      // Convert mockStores to WayfindingStore format with taxonomy categories
      const officialStores: WayfindingStore[] = mockStores.map((ms) => {
        const mapping = STORE_SHUTTER_MAP[ms.slug] || { floor: 'ground_floor', shutter: 'A101' };
        return {
          id: ms.slug,
          name: ms.name,
          slug: ms.slug,
          cat: ms.categorySlug || 'shop',
          desc: (ms.store_description || ms.subtitle) || undefined,
          hours: ms.operation_hours || '10:00 AM - 8:30 PM',
          phone: ms.contact_number || '+977 61-520000',
          floor: mapping.floor,
          shutters: [`${mapping.floor}:${mapping.shutter}`],
          logo: ms.logo?.data?.full_url,
          image: ms.cover?.data?.full_url,
        };
      });

      // Filter out duplicate ids from jsonStores and merge
      const officialIds = new Set(officialStores.map((s) => s.id));
      const officialSlugs = new Set(officialStores.map((s) => s.slug));

      const merged = [
        ...officialStores,
        ...jsonStores.filter((s) => !officialIds.has(s.id) && !officialSlugs.has(s.slug)),
      ];

      return merged;
    } catch (error) {
      console.error('WayfindingService: Error loading store directory', error);
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
