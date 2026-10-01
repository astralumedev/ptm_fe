import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight, Inbox, PanelsTopLeft, Map as MapIcon } from 'lucide-react';
import { COLLECTIONS } from '../schema';
import { adminApi } from '../lib/http';
import { ErrorNote } from '../components/ui';
import { PageHead } from './Layout';

export default function Overview({ username }: { username: string }) {
  const [counts, setCounts] = useState<Record<string, { live: number; draft: number }> | null>(null);
  const [error, setError] = useState('');
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    adminApi.counts().then(({ counts, unread }) => {
      setUnread(unread || 0);
      const map: Record<string, { live: number; draft: number }> = {};
      for (const c of counts) {
        map[c.collection] ??= { live: 0, draft: 0 };
        map[c.collection][c.status === 'published' ? 'live' : 'draft'] += c.n;
      }
      setCounts(map);
    }).catch((e) => setError(e.message));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <PageHead title={`${greeting}, ${username}`} lead="Everything you publish here shows on the website within about a minute." />
      {error && <div className="mb-4"><ErrorNote>{error}</ErrorNote></div>}
      {unread > 0 && (
        <Link to="/admin/inbox" className="flex items-center gap-3 mb-4 px-4 h-12 rounded-xl bg-[var(--adm-accent-soft)] text-[var(--adm-accent)] font-medium hover:underline">
          <Inbox className="size-4" /> {unread} new {unread === 1 ? 'message' : 'messages'} from the website <ChevronRight className="size-4 ml-auto" />
        </Link>
      )}
      <Link to="/admin/content" className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl border border-[var(--adm-line)] hover:bg-[var(--adm-panel)] transition-colors group">
        <PanelsTopLeft className="size-4 text-[var(--adm-ink-3)] group-hover:text-[var(--adm-accent)]" />
        <span className="flex-1">
          <span className="block font-medium group-hover:text-[var(--adm-accent)]">Site content</span>
          <span className="block text-[12.5px] text-[var(--adm-ink-3)]">Home page banners, menus, opening hours, categories, page text and more</span>
        </span>
        <ChevronRight className="size-4 text-[var(--adm-ink-3)]" />
      </Link>

      <Link to="/admin/map" className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl border border-[var(--adm-line)] hover:bg-[var(--adm-panel)] transition-colors group">
        <MapIcon className="size-4 text-[var(--adm-ink-3)] group-hover:text-[var(--adm-accent)]" />
        <span className="flex-1">
          <span className="block font-medium group-hover:text-[var(--adm-accent)]">Map management</span>
          <span className="block text-[12.5px] text-[var(--adm-ink-3)]">Floor plans, shutters, QR codes and walking directions</span>
        </span>
        <ChevronRight className="size-4 text-[var(--adm-ink-3)]" />
      </Link>

      <div className="rounded-xl border border-[var(--adm-line)] bg-white overflow-hidden">
        <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_64px_64px_auto] items-center gap-3 px-4 h-10 text-[12px] font-medium text-[var(--adm-ink-3)] bg-[var(--adm-panel)] border-b border-[var(--adm-line)]">
          <span>Section</span><span className="text-right">Live</span><span className="text-right">Drafts</span><span className="w-[92px]" />
        </div>
        {COLLECTIONS.map((c) => {
          const live = counts?.[c.key]?.live || 0, draft = counts?.[c.key]?.draft || 0;
          return (
            <div key={c.key} className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_64px_64px_auto] items-center gap-3 px-4 min-h-14 py-2 sm:py-0 border-b last:border-0 border-[var(--adm-line)]">
              <Link to={`/admin/${c.key}`} className="flex items-center gap-2.5 min-w-0 font-medium hover:text-[var(--adm-accent)] group">
                <c.icon className="size-4 shrink-0 text-[var(--adm-ink-3)] group-hover:text-[var(--adm-accent)]" />
                <span className="min-w-0">
                  <span className="block truncate">{c.label}</span>
                  <span className="sm:hidden block text-[12.5px] font-normal text-[var(--adm-ink-3)]">
                    {counts ? `${live} live${draft ? ` · ${draft} draft${draft > 1 ? 's' : ''}` : ''}` : 'Loading…'}
                  </span>
                </span>
                <ChevronRight className="hidden sm:block size-3.5 text-[var(--adm-ink-3)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <span className="hidden sm:block text-right">{counts ? live : <span className="inline-block h-3 w-5 adm-skeleton" />}</span>
              <span className="hidden sm:block text-right text-[var(--adm-ink-3)]">{counts ? draft : <span className="inline-block h-3 w-5 adm-skeleton" />}</span>
              <Link to={`/admin/${c.key}/new`} className="adm-btn adm-btn-sm sm:w-[92px]" aria-label={`New ${c.label}`}><Plus className="size-3.5" /> New</Link>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid sm:grid-cols-2 gap-6 text-[13.5px] text-[var(--adm-ink-2)]">
        <div>
          <h2 className="font-semibold text-[var(--adm-ink)] mb-1">Drafts stay private</h2>
          <p>Save a draft to keep working on it. Only items marked <b>Live</b> appear on the website.</p>
        </div>
        <div>
          <h2 className="font-semibold text-[var(--adm-ink)] mb-1">Photos are optimised for you</h2>
          <p>Upload straight from your phone or camera. Images are resized and compressed before upload, so pages stay fast.</p>
        </div>
      </div>
    </>
  );
}
