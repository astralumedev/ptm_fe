import { FloorId, FloorData, WayfindingStore } from '../types/wayfinding';

export interface WayfindingStoresResponse {
  stores: WayfindingStore[];
}

class WayfindingService {
  private baseUrl: string;

  constructor() {
    // Configurable API base URL for future Express backend integration.
    // Defaults to empty string to serve from local static public directory `/wayfinding/data/`
    const envApiUrl = import.meta.env.VITE_WAYFINDING_API_URL;
    this.baseUrl = envApiUrl ? envApiUrl.replace(/\/$/, '') : '';
  }

  /**
   * Fetches full store directory.
   * If VITE_WAYFINDING_API_URL is configured, fetches from `${baseUrl}/api/stores`,
   * otherwise fetches static asset `/wayfinding/data/stores.json`.
   */
  async getStores(): Promise<WayfindingStore[]> {
    try {
      const endpoint = this.baseUrl
        ? `${this.baseUrl}/api/stores`
        : '/wayfinding/data/stores.json';
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch stores data: ${response.statusText}`);
      }

      const data = await response.json();
      return data.stores || (Array.isArray(data) ? data : []);
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
