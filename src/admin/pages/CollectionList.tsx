import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Search, ImageOff, RotateCw, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { collectionByKey, getPath, imageUrlOf } from '../schema';
import { useCollection } from '../lib/useCollection';
import { adminApi, ItemRow } from '../lib/http';
import { ErrorNote, Spinner, StatusPill, relativeTime, useToast } from '../components/ui';
import { PageHead } from './Layout';

type Filter = 'all' | 'published' | 'draft';

export default function CollectionList() {
  const { collection } = useParams();
  const def = collectionByKey(collection);
  const navigate = useNavigate();
  const { items, error, reload, replaceAll } = useCollection(def?.key || '');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [ordering, setOrdering] = useState<ItemRow[] | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const toast = useToast();
  // Blog posts are always listed newest first on the site, so manual order would do nothing.
  const canReorder = def?.key !== 'blogs';

  const moveRow = (i: number, d: number) => setOrdering((list) => {
    if (!list) return list;
    const next = [...list];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    return next;
  });
  const saveOrder = async () => {
    if (!ordering || !def) return;
    setSavingOrder(true);
    try {
      await adminApi.reorder(def.key, ordering.map((r) => r.id));
      replaceAll(ordering.map((r, i) => ({ ...r, sort: i })));
      setOrdering(null);
      toast('ok', 'New order saved. Live within a minute.');
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Could not save the order');
    } finally {
      setSavingOrder(false);
    }
  };

  const rows = useMemo(() => {
    if (!items || !def) return [];
    const needle = q.trim().toLowerCase();
    return items.filter((r) => {
      if (filter !== 'all' && r.status !== filter) return false;
      if (!needle) return true;
      return [getPath(r.data, def.titleKey), def.subtitleKey && getPath(r.data, def.subtitleKey), r.slug]
        .some((v) => String(v || '').toLowerCase().includes(needle));
    });
  }, [items, def, q, filter]);

  if (!def) return <ErrorNote>Unknown section.</ErrorNote>;
  const counts = { all: items?.length || 0, published: items?.filter((r) => r.status === 'published').length || 0, draft: items?.filter((r) => r.status === 'draft').length || 0 };

  return (
    <>
      <PageHead title={def.label} lead={ordering ? 'Move items up or down to set the order they appear on the website.' : undefined} actions={
        ordering ? (
          <>
            <button className="adm-btn" onClick={() => setOrdering(null)} disabled={savingOrder}>Cancel</button>
            <button className="adm-btn adm-btn-primary" onClick={saveOrder} disabled={savingOrder}>{savingOrder && <Spinner />} Save order</button>
          </>
        ) : (
          <>
            {canReorder && items && items.length > 1 && (
              <button className="adm-btn" onClick={() => { setQ(''); setFilter('all'); setOrdering(items); }}><ArrowUpDown className="size-4" /> Reorder</button>
            )}
            <Link to={`/admin/${def.key}/new`} className="adm-btn adm-btn-primary"><Plus className="size-4" /> New {def.singular}</Link>
          </>
        )
      } />

      {ordering ? (
        <ul className="rounded-xl border border-[var(--adm-line)] overflow-hidden bg-white">
          {ordering.map((r, i) => (
            <li key={r.id} className="flex items-center gap-3 px-4 h-14 border-b last:border-0 border-[var(--adm-line)]">
              <span className="w-6 text-right text-[12.5px] text-[var(--adm-ink-3)]">{i + 1}</span>
              <span className="flex-1 min-w-0 truncate font-medium text-[14px]">{getPath(r.data, def.titleKey) || 'Untitled'}</span>
              <StatusPill status={r.status} />
              <button className="adm-btn adm-btn-sm adm-btn-ghost !px-1.5" disabled={i === 0} onClick={() => moveRow(i, -1)} aria-label="Move up"><ArrowUp className="size-4" /></button>
              <button className="adm-btn adm-btn-sm adm-btn-ghost !px-1.5" disabled={i === ordering.length - 1} onClick={() => moveRow(i, 1)} aria-label="Move down"><ArrowDown className="size-4" /></button>
            </li>
          ))}
        </ul>
      ) : (<>

      <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center mb-4">
        <div className="relative sm:w-72">
          <Search className="absolute left-2.5 top-2.5 size-4 text-[var(--adm-ink-3)] pointer-events-none" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${def.label.toLowerCase()}`} className="adm-input !pl-8" aria-label="Search" />
        </div>
        <div role="tablist" className="inline-flex p-0.5 rounded-lg bg-[var(--adm-panel)] border border-[var(--adm-line)] self-start">
          {(['all', 'published', 'draft'] as Filter[]).map((f) => (
            <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}
              className={`h-8 px-3 rounded-md text-[13px] font-medium cursor-pointer transition-colors duration-150 ${filter === f ? 'bg-white text-[var(--adm-ink)] shadow-[0_1px_2px_rgb(22_24_29/0.1)]' : 'text-[var(--adm-ink-3)] hover:text-[var(--adm-ink)]'}`}>
              {f === 'all' ? 'All' : f === 'published' ? 'Live' : 'Drafts'} <span className="text-[var(--adm-ink-3)] font-normal">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4"><ErrorNote>{error} <button className="underline ml-1 cursor-pointer" onClick={reload}>Try again</button></ErrorNote></div>
      )}

      <div className="rounded-xl border border-[var(--adm-line)] overflow-hidden bg-white">
        {!items && !error ? (
          <ul>{Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="flex items-center gap-3 px-4 h-16 border-b last:border-0 border-[var(--adm-line)]">
              <div className="size-10 adm-skeleton" /><div className="flex-1 space-y-2"><div className="h-3 w-1/3 adm-skeleton" /><div className="h-2.5 w-1/5 adm-skeleton" /></div>
            </li>
          ))}</ul>
        ) : rows.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-[14px] font-medium">{q || filter !== 'all' ? 'Nothing matches' : `No ${def.label.toLowerCase()} yet`}</p>
            <p className="mt-1 text-[13px] text-[var(--adm-ink-3)]">
              {q || filter !== 'all' ? 'Try a different search or filter.' : `Create the first ${def.singular} and it will appear on the website once it is live.`}
            </p>
          </div>
        ) : (
          <ul>
            {rows.map((r) => {
              const img = def.imageKey ? imageUrlOf(getPath(r.data, def.imageKey)) : '';
              const sub = def.subtitleKey ? getPath(r.data, def.subtitleKey) : '';
              return (
                <li key={r.id} className="border-b last:border-0 border-[var(--adm-line)]">
                  <button onClick={() => navigate(`/admin/${def.key}/${r.id}`)} className="w-full flex items-center gap-3 px-4 h-16 text-left hover:bg-[var(--adm-panel)] transition-colors duration-150 cursor-pointer">
                    <span className={`grid place-items-center size-10 shrink-0 rounded-md overflow-hidden border border-[var(--adm-line)] ${def.imageKey === 'logo' ? 'bg-white' : 'bg-[var(--adm-panel)]'}`}>
                      {img ? <img src={img} alt="" loading="lazy" className={`size-full ${def.imageKey === 'logo' ? 'object-contain p-0.5' : 'object-cover'}`} /> : <ImageOff className="size-4 text-[#a5aab4]" />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block truncate font-medium text-[14px]">{getPath(r.data, def.titleKey) || <span className="text-[var(--adm-ink-3)]">Untitled</span>}</span>
                      <span className="block truncate text-[12.5px] text-[var(--adm-ink-3)]">{sub || r.slug}</span>
                    </span>
                    <span className="hidden md:block w-28 text-[12.5px] text-[var(--adm-ink-3)] text-right">{relativeTime(r.updated_at)}</span>
                    <span className="w-16 flex justify-end"><StatusPill status={r.status} /></span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      </>)}
      {items && !ordering && (
        <button onClick={reload} className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] text-[var(--adm-ink-3)] hover:text-[var(--adm-ink)] cursor-pointer">
          <RotateCw className="size-3.5" /> Refresh
        </button>
      )}
    </>
  );
}
