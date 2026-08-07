import { BlogResponse } from '@/data/models/Blog';
import { StoreResponse } from '@/data/models/Store';
import { SiteSettingsResponse } from '@/data/models/SiteSettings';
import { mockStores, mockBlogs, mockSiteSettings, mockPages } from '@/data/mockMallData';

interface ApiConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}

interface BlogFilter {
  status?: 'published' | 'draft';
  slug?: string;
}

interface StoreFilter {
  status?: 'published' | 'draft';
  type?: 'retail' | 'eatery' | 'service' | 'hotel' | 'wellness';
  featured?: number | boolean;
  slug?: string;
}

interface PageFilter {
  status?: 'published' | 'draft';
  slug?: string;
}

interface BlogParams {
  fields?: string;
  filter?: BlogFilter;
  sort?: string[];
  limit?: number;
}

interface StoreParams {
  fields?: string;
  filter?: StoreFilter;
  sort?: string[];
  limit?: number;
}

interface PageParams {
  fields?: string;
  filter?: PageFilter;
  sort?: string[];
  limit?: number;
}

export interface PageResponse {
  data: any[];
  public: boolean;
}

class ApiService {
  constructor(_config?: ApiConfig) {}

  // Blog endpoints - Mock implementation
  async getBlogs(params?: BlogParams): Promise<BlogResponse> {
    let result = [...mockBlogs];

    if (params?.filter) {
      if (params.filter.slug) {
        result = result.filter((b) => b.slug === params.filter?.slug);
      }
      if (params.filter.status) {
        result = result.filter((b) => b.status === params.filter?.status);
      }
    }

    if (params?.limit) {
      result = result.slice(0, params.limit);
    }

    return {
      data: result,
      public: true,
    };
  }

  // Store endpoints - Mock implementation
  async getStores(params?: StoreParams): Promise<StoreResponse> {
    let result = [...mockStores];

    if (params?.filter) {
      if (params.filter.slug) {
        result = result.filter((s) => s.slug === params.filter?.slug);
      }
      if (params.filter.type) {
        result = result.filter((s) => s.type === params.filter?.type);
      }
      if (params.filter.featured !== undefined) {
        const isFeatured = Boolean(params.filter.featured);
        result = result.filter((s) => Boolean(s.featured) === isFeatured);
      }
      if (params.filter.status) {
        result = result.filter((s) => s.status === params.filter?.status);
      }
    }

    if (params?.limit) {
      result = result.slice(0, params.limit);
    }

    return {
      data: result,
      public: true,
    };
  }

  // Site Settings endpoint - Mock implementation
  async getSiteSettings(): Promise<SiteSettingsResponse> {
    return {
      data: mockSiteSettings,
      public: true,
    };
  }

  // Page endpoints - Mock implementation
  async getPages(params?: PageParams): Promise<PageResponse> {
    let result = [...mockPages];

    if (params?.filter) {
      if (params.filter.slug) {
        result = result.filter((p) => p.slug === params.filter?.slug);
      }
      if (params.filter.status) {
        result = result.filter((p) => p.status === params.filter?.status);
      }
    }

    if (params?.limit) {
      result = result.slice(0, params.limit);
    }

    return {
      data: result,
      public: true,
    };
  }
}

// Create and export a singleton instance
export const api = new ApiService({
  baseUrl: '',
});

export default api;