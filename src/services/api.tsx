import { Blog, BlogResponse } from '@/data/models/Blog';
import { Store, StoreResponse } from '@/data/models/Store';
import { SiteSettings, SiteSettingsResponse } from '@/data/models/SiteSettings';
import type { PageData } from '@/data/models/Page';
import type { MallEvent, MallOffer } from '@/data/models/Latest';
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


export interface ContentBundle {
  stores: Store[];
  /** Non-store spaces on the mall map (food court, ticket counters…). */
  places?: Array<Record<string, any>>;
  blogs: Blog[];
  pages: PageData[];
  events: MallEvent[];
  offers: MallOffer[];
  settings: SiteSettings[];
  /** Saved site sections, keyed by slug. */
  blocks: Array<Record<string, any> & { slug: string }>;
  /** True when the content service could not be reached; the site renders empty states. */
  unavailable?: boolean;
}

const EMPTY_BUNDLE: ContentBundle = { stores: [], blogs: [], pages: [], events: [], offers: [], settings: [], blocks: [], unavailable: true };

async function fetchBundle(): Promise<ContentBundle> {
  const res = await fetch('/api/content', { headers: { Accept: 'application/json' } });
  if (!res.ok || !res.headers.get('content-type')?.includes('json')) throw new Error(`content ${res.status}`);
  return (await res.json()) as ContentBundle;
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
    // One retry covers a cold start or a flaky mobile connection; after that the site shows
    // its empty states and a notice rather than stale or invented content.
    bundlePromise = fetchBundle()
      .catch(() => new Promise<ContentBundle>((resolve) => setTimeout(() => fetchBundle().then(resolve, () => resolve(EMPTY_BUNDLE)), 1500)))
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
    // A store in several categories shows on every matching section page (e.g. Shop and Dine).
    if (f?.type) result = result.filter((s) => s.type === f.type || s.types?.includes(f.type!));
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
