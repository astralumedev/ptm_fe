import { useLocation } from 'react-router-dom';
import { ALL_BLOCKS } from './blocks';

/** Where the admin edits what is on a given public page. */
function editTarget(pathname: string) {
  const store = pathname.match(/^\/(?:stores?|shops?\/details)\/([^/]+)/);
  if (store) return `/admin/stores?q=${encodeURIComponent(store[1])}`;
  const blog = pathname.match(/^\/blogs\/([^/]+)/);
  if (blog) return `/admin/blogs?q=${encodeURIComponent(blog[1])}`;
  const page = pathname.match(/^\/page\/([^/]+)/);
  if (page && !ALL_BLOCKS.some((b) => b.page === pathname)) return `/admin/pages?q=${encodeURIComponent(page[1])}`;
  const path = pathname.replace(/\/+$/, '') || '/';
  return ALL_BLOCKS.some((b) => b.page === path) ? `/admin/content?page=${encodeURIComponent(path)}` : '/admin/content';
}

/**
 * A small shortcut for staff who have signed in to the admin on this browser.
 * Visitors never see it: it only appears when the admin panel set the local flag.
 */
export default function StaffEditButton() {
  const { pathname } = useLocation();
  let staff = false;
  try { staff = localStorage.getItem('ptm-staff') === '1'; } catch { /* storage blocked */ }
  if (!staff) return null;
  return (
    <a
      href={editTarget(pathname)}
      className="fixed left-4 bottom-4 z-[90] inline-flex items-center gap-2 h-10 px-4 rounded-full bg-gray-900/90 text-white text-xs font-semibold tracking-wide shadow-xl hover:bg-black transition-colors"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
      Edit this page
    </a>
  );
}
