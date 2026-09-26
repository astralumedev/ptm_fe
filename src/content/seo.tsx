import { useEffect, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router-dom';
import { useBlock } from './block';
import { seoBlock } from './blocks/seo';

export interface PageMeta {
  title?: string;
  description?: string;
  image?: string;
}

// Detail pages (a store, a blog post) register their own meta; the manager applies it.
let override: { path: string; meta: PageMeta } | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Lets a page describe itself (e.g. a store's name and photo) for search and sharing. */
export function usePageMeta(meta: PageMeta | null) {
  const { pathname } = useLocation();
  const key = meta ? JSON.stringify(meta) : '';
  useEffect(() => {
    if (!meta) return;
    override = { path: pathname, meta };
    emit();
    return () => {
      if (override?.path === pathname) { override = null; emit(); }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, key]);
}

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}

const clip = (s: string, n = 160) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
const plain = (s = '') => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const absolute = (url: string) => (!url ? '' : /^https?:\/\//.test(url) ? url : window.location.origin + url);

/** Keeps the document title, description and sharing tags in sync with the current page. */
export function SeoManager() {
  const { pathname } = useLocation();
  const seo = useBlock(seoBlock);
  const current = useSyncExternalStore((l) => { listeners.add(l); return () => { listeners.delete(l); }; }, () => override);

  useEffect(() => {
    const path = pathname.replace(/\/+$/, '') || '/';
    const entry = seo.pages.find((p) => (p.path.replace(/\/+$/, '') || '/') === path);
    const own = current?.path === pathname ? current.meta : null;
    const pageTitle = own?.title || entry?.title || '';
    const isHome = path === '/';
    const title = !pageTitle || (isHome && pageTitle === seo.siteName)
      ? seo.siteName
      : (seo.titleTemplate || '{page}').replace('{page}', pageTitle);
    const description = clip(plain(own?.description || entry?.description || seo.description));
    const image = absolute(own?.image || entry?.image || seo.shareImage);

    document.title = title;
    setMeta('name', 'description', description);
    setMeta('property', 'og:site_name', seo.siteName);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:url', window.location.origin + pathname);
    if (image) setMeta('property', 'og:image', image);
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + pathname;
  }, [pathname, seo, current]);

  return null;
}
