import { Blog, BlogResponse } from '@/data/models/Blog';
import { Store, StoreResponse } from '@/data/models/Store';
import { SiteSettings, SiteSettingsResponse } from '@/data/models/SiteSettings';
import type { PageData } from '@/data/mockMallData';
import type { MallEvent, MallOffer } from '@/data/latestData';
import { liveOnly } from '@/content/visibility';

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

interface ContentBundle {
  stores: Store[];
  blogs: Blog[];
  pages: PageData[];
  events: MallEvent[];
  offers: MallOffer[];
  settings: SiteSettings[];
  /** Saved site sections, keyed by slug. Missing ones fall back to their defaults. */
  blocks: Array<Record<string, any> & { slug: string }>;
}

/** Bundled content used when the API is unreachable (e.g. plain `vite` dev without `vercel dev`). */
async function fallbackBundle(): Promise<ContentBundle> {
  const [mall, latest] = await Promise.all([import('@/data/mockMallData'), import('@/data/latestData')]);
  return {
    stores: mall.mockStores,
    blogs: mall.mockBlogs,
    pages: mall.mockPages,
    settings: mall.mockSiteSettings,
    events: latest.mockEvents,
    offers: latest.mockOffers,
    blocks: [],
  };
}

let bundlePromise: Promise<ContentBundle> | null = null;
let snapshot: ContentBundle | null = null;
const listeners = new Set<() => void>();

/** Synchronous view of the loaded content (null until the first load finishes). */
export const getBundleSnapshot = () => snapshot;
export function subscribeBundle(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/**
 * The whole published site is one small, edge-cached JSON document. It is fetched once per
 * page load and every getter filters it in memory, so navigation costs no further requests.
 */
export function loadBundle(): Promise<ContentBundle> {
  if (!bundlePromise) {
    bundlePromise = fetch('/api/content', { headers: { Accept: 'application/json' } })
      .then(async (res) => {
        if (!res.ok || !res.headers.get('content-type')?.includes('json')) throw new Error(`content ${res.status}`);
        const data = (await res.json()) as ContentBundle;
        if (!data.stores?.length && !data.pages?.length) throw new Error('empty content');
        return data;
      })
      .catch((err) => {
        console.warn('Using bundled content:', err);
        return fallbackBundle();
      })
      .then((data) => {
        snapshot = { ...data, blocks: data.blocks || [] };
        listeners.forEach((l) => l());
        return snapshot;
      });
  }
  return bundlePromise;
}

function byStatus<T extends { status?: string }>(items: T[], status?: string) {
  return status ? items.filter((i) => i.status === status) : items;
}

function limit<T>(items: T[], n?: number) {
  return n ? items.slice(0, n) : items;
}

class ApiService {
  async getBlogs(params?: BlogParams): Promise<BlogResponse> {
    let result = [...(await loadBundle()).blogs];
    const f = params?.filter;
    if (f?.slug) result = result.filter((b) => b.slug === f.slug);
    result = byStatus(result, f?.status);
    if (params?.sort?.includes('-created_on')) {
      result.sort((a, b) => (b.created_on || '').localeCompare(a.created_on || ''));
    }
    return { data: limit(result, params?.limit), public: true };
  }

  async getStores(params?: StoreParams): Promise<StoreResponse> {
    let result = [...(await loadBundle()).stores];
    const f = params?.filter;
    if (f?.slug) result = result.filter((s) => s.slug === f.slug);
    if (f?.type) result = result.filter((s) => s.type === f.type);
    if (f?.featured !== undefined) result = result.filter((s) => Boolean(s.featured) === Boolean(f.featured));
    result = byStatus(result, f?.status);
    return { data: limit(result, params?.limit), public: true };
  }

  async getSiteSettings(): Promise<SiteSettingsResponse> {
    return { data: (await loadBundle()).settings, public: true };
  }

  async getPages(params?: PageParams): Promise<PageResponse> {
    let result = [...(await loadBundle()).pages];
    const f = params?.filter;
    if (f?.slug) result = result.filter((p) => p.slug === f.slug);
    result = byStatus(result, f?.status);
    return { data: limit(result, params?.limit), public: true };
  }

  async getEvents(): Promise<MallEvent[]> {
    return liveOnly((await loadBundle()).events as (MallEvent & { hidden?: boolean })[]);
  }

  async getOffers(): Promise<MallOffer[]> {
    return liveOnly((await loadBundle()).offers as (MallOffer & { hidden?: boolean })[]);
  }
}

export const api = new ApiService();

export default api;
