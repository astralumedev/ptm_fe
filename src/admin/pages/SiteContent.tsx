import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useBlocker, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ExternalLink, RotateCcw, Search } from 'lucide-react';
import { ALL_BLOCKS, blockByKey } from '@/content/blocks';
import { mergeBlock } from '@/content/block';
import { setPath } from '../schema';
import { adminApi } from '../lib/http';
import { useCollection } from '../lib/useCollection';
import { FieldGrid } from '../components/Fields';
import { Dialog, ErrorNote, Spinner, relativeTime, useToast } from '../components/ui';
import { PageHead } from './Layout';

const SITE_WIDE = ['Header & navigation', 'Footer'];

export function SiteContentIndex() {
  const { items, error } = useCollection('blocks');
  const [params, setParams] = useSearchParams();
  const onPage = params.get('page');
  const [q, setQ] = useState('');
  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const map = new Map<string, typeof ALL_BLOCKS>();
    // From "Edit this page" on the website: that page's sections plus the site-wide ones.
    const pageBlocks = onPage ? ALL_BLOCKS.filter((b) => b.page === onPage) : null;
    for (const b of ALL_BLOCKS) {
      if (pageBlocks && !pageBlocks.includes(b) && !SITE_WIDE.includes(b.group)) continue;
      if (needle && ![b.label, b.group, b.description].some((t) => t?.toLowerCase().includes(needle))) continue;
      map.set(b.group, [...(map.get(b.group) || []), b]);
    }
    return [...map.entries()];
  }, [q, onPage]);

  return (
    <>
      <PageHead title="Site content" lead="Every heading, banner, menu and section of the website. Changes go live within a minute of saving." />
      {onPage && (
        <div className="flex flex-wrap items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-[var(--adm-accent-soft)] text-[13.5px] text-[var(--adm-accent)]">
          Showing the sections on <code className="font-mono">{onPage}</code> and the site-wide header and footer.
          <button className="underline cursor-pointer" onClick={() => setParams({})}>Show everything</button>
        </div>
      )}
      <div className="relative sm:w-80 mb-6">
        <Search className="absolute left-2.5 top-2.5 size-4 text-[var(--adm-ink-3)] pointer-events-none" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a section, e.g. hero, FAQ, parking" className="adm-input !pl-8" aria-label="Find a section" />
      </div>
      {error && <div className="mb-4"><ErrorNote>{error}</ErrorNote></div>}
      <div className="flex flex-col gap-7">
        {groups.map(([group, blocks]) => (
          <section key={group}>
            <h2 className="text-[13px] font-semibold mb-2">{group}</h2>
            <ul className="rounded-xl border border-[var(--adm-line)] bg-white overflow-hidden">
              {blocks.map((b) => {
                const row = items?.find((r) => r.slug === b.key);
                return (
                  <li key={b.key} className="border-b last:border-0 border-[var(--adm-line)]">
                    <Link to={`/admin/content/${b.key}`} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--adm-panel)] transition-colors duration-150 group">
                      <span className="flex-1 min-w-0">
                        <span className="block font-medium text-[14px] group-hover:text-[var(--adm-accent)]">{b.label}</span>
                        {b.description && <span className="block text-[12.5px] text-[var(--adm-ink-3)] line-clamp-1">{b.description}</span>}
                      </span>
                      <span className="hidden sm:block text-[12.5px] text-[var(--adm-ink-3)] whitespace-nowrap">
                        {!items ? '' : row ? `Edited ${relativeTime(row.updated_at)}` : 'Original content'}
                      </span>
                      <ChevronRight className="size-4 text-[var(--adm-ink-3)] shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        {groups.length === 0 && <p className="text-[13.5px] text-[var(--adm-ink-3)]">No section matches “{q}”.</p>}
      </div>
    </>
  );
}

export function SiteContentEditor() {
  const { block: key } = useParams();
  const def = blockByKey(key);
  const { items, error: loadError, upsert, remove } = useCollection('blocks');
  const toast = useToast();
  const row = items?.find((r) => r.slug === key);
  const initial = useMemo(() => (def && items ? (mergeBlock(def, row?.data) as Record<string, any>) : null), [def, items, row]);
  const [draft, setDraft] = useState<Record<string, any> | null>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => { setDraft(initial); }, [initial]);
  const dirty = !!draft && !!initial && JSON.stringify(draft) !== JSON.stringify(initial);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && !saving && currentLocation.pathname !== nextLocation.pathname);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const save = useCallback(async () => {
    if (!def || !draft || saving) return;
    const missing = findMissing(def.fields, draft);
    if (missing) { setError(`${missing} is required.`); return; }
    setSaving(true);
    setError('');
    try {
      const { item } = await adminApi.save('blocks', { id: row?.id, slug: def.key, status: 'published', data: changedFromDefaults(draft, def.defaults) });
      upsert(item);
      toast('ok', 'Saved. Live on the website within a minute.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }, [def, draft, row, saving, upsert, toast]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  const reset = async () => {
    if (!row) return;
    try {
      await adminApi.remove(row.id);
      remove(row.id);
      setConfirmReset(false);
      toast('ok', 'Restored the original content');
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Could not reset');
    }
  };

  if (!def) return <ErrorNote>This section does not exist. <Link className="underline" to="/admin/content">Back to site content</Link></ErrorNote>;
  if (!draft) return loadError ? <ErrorNote>{loadError}</ErrorNote> : <div className="space-y-4 max-w-3xl"><div className="h-7 w-1/3 adm-skeleton" /><div className="h-64 adm-skeleton" /></div>;

  return (
    <div className="max-w-3xl">
      <div className="sticky top-0 z-20 -mx-4 sm:-mx-8 px-4 sm:px-8 bg-white/95 backdrop-blur-[2px] border-b border-[var(--adm-line)] mb-6">
        <div className="flex items-center gap-3 h-14">
          <Link to="/admin/content" className="adm-btn adm-btn-ghost adm-btn-sm !px-1.5" aria-label="Back to site content"><ArrowLeft className="size-4" /></Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-semibold">{def.label}</h1>
          </div>
          {dirty && <span className="hidden sm:inline text-[12.5px] text-[var(--adm-warn)]">Unsaved changes</span>}
          <button className="adm-btn adm-btn-primary" disabled={saving || !dirty} onClick={save}>{saving && <Spinner />} Save</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-[13px] text-[var(--adm-ink-3)]">
        <span>{def.group}</span>
        <span>{row ? `Edited ${relativeTime(row.updated_at)}` : 'Showing the original content'}</span>
        {def.page && (
          <a href={def.page} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[var(--adm-accent)] hover:underline">
            View on website <ExternalLink className="size-3.5" />
          </a>
        )}
        {row && (
          <button onClick={() => setConfirmReset(true)} className="inline-flex items-center gap-1 hover:text-[var(--adm-ink)] cursor-pointer">
            <RotateCcw className="size-3.5" /> Restore original
          </button>
        )}
      </div>
      {def.description && <p className="-mt-3 mb-6 text-[13.5px] text-[var(--adm-ink-2)]">{def.description}</p>}
      {error && <div className="mb-4"><ErrorNote>{error}</ErrorNote></div>}

      <FieldGrid fields={def.fields} data={draft} onChange={(p, v) => setDraft((d) => setPath(d || {}, p, v))} idPrefix={def.key} />

      <Dialog open={confirmReset} onClose={() => setConfirmReset(false)} title="Restore the original content?"
        footer={<>
          <button className="adm-btn" onClick={() => setConfirmReset(false)}>Cancel</button>
          <button className="adm-btn adm-btn-primary" onClick={reset}>Restore original</button>
        </>}>
        <p className="text-[14px] text-[var(--adm-ink-2)]">Your edits to “{def.label}” will be discarded and the website goes back to the content it launched with.</p>
      </Dialog>
      <Dialog open={blocker.state === 'blocked'} onClose={() => blocker.reset?.()} title="Leave without saving?"
        footer={<>
          <button className="adm-btn" onClick={() => blocker.reset?.()}>Keep editing</button>
          <button className="adm-btn adm-btn-danger" onClick={() => blocker.proceed?.()}>Discard changes</button>
        </>}>
        <p className="text-[14px] text-[var(--adm-ink-2)]">Your changes to this section have not been saved.</p>
      </Dialog>
    </div>
  );
}

/**
 * Only the values staff changed are stored; everything else keeps following the built-in defaults,
 * so later wording changes in the code still reach sections that have been saved before.
 */
function changedFromDefaults(draft: Record<string, any>, defaults: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(draft)) {
    if (JSON.stringify(v) !== JSON.stringify(defaults[k])) out[k] = v;
  }
  return out;
}

function findMissing(fields: import('@/content/fields').Field[], data: Record<string, any>, prefix = ''): string | null {
  for (const f of fields) {
    const v = data?.[f.key];
    if (f.required && (v === undefined || v === null || String(v).trim() === '')) return prefix + f.label;
    if (f.type === 'list' && Array.isArray(v) && f.fields) {
      for (let i = 0; i < v.length; i++) {
        const m = findMissing(f.fields, v[i], `${f.itemName || 'Item'} ${i + 1}: `);
        if (m) return m;
      }
    }
  }
  return null;
}
