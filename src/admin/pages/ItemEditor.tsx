import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useBlocker, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Trash2 } from 'lucide-react';
import { collectionByKey, getPath, setPath, slugify } from '../schema';
import { adminApi } from '../lib/http';
import { useAdminCategories } from '../lib/useAdminCategories';
import { SECTOR_STORE_TYPE } from '@/content/blocks/categories';
import { useCollection } from '../lib/useCollection';
import { FieldGrid } from '../components/Fields';
import { Dialog, ErrorNote, FieldShell, Spinner, StatusPill, useToast } from '../components/ui';

interface Draft { slug: string; status: 'published' | 'draft'; data: Record<string, any> }

export default function ItemEditor() {
  const { collection, id } = useParams();
  const def = collectionByKey(collection)!;
  const isNew = id === 'new';
  const navigate = useNavigate();
  const toast = useToast();
  const { items, error: loadError, upsert, remove } = useCollection(def.key);
  const { find: findCategory } = useAdminCategories();
  const { items: stores } = useCollection('stores');
  const row = useMemo(() => (isNew ? null : items?.find((r) => String(r.id) === id) || null), [items, id, isNew]);

  const initial = useMemo<Draft | null>(() => {
    if (isNew) return { slug: '', status: 'draft', data: def.blank() };
    return row ? { slug: row.slug, status: row.status, data: row.data } : null;
  }, [isNew, row, def]);

  const [draft, setDraft] = useState<Draft | null>(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => { setDraft(initial); setSlugTouched(!isNew); setErrors({}); setError(''); }, [initial, isNew]);

  const dirty = !!draft && !!initial && JSON.stringify(draft) !== JSON.stringify(initial);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && !saving && currentLocation.pathname !== nextLocation.pathname);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const title = draft ? String(getPath(draft.data, def.titleKey) || '') : '';

  const change = (path: string, value: unknown) => {
    setDraft((d) => {
      if (!d) return d;
      const next = { ...d, data: setPath(d.data, path, value) };
      if (path === def.titleKey && !slugTouched) next.slug = slugify(String(value));
      // An offer's store details follow the store picked, so they never drift from the store record.
      if (def.key === 'offers' && path === 'storeSlug') {
        const store = stores?.find((s) => s.slug === value)?.data;
        if (store) {
          next.data = {
            ...next.data,
            storeName: store.name || '',
            storeCategory: store.category || '',
            storeLogo: store.logo?.data?.full_url || '',
            storeLink: `/stores/${value}`,
          };
        }
      }
      return next;
    });
    if (errors[path]) setErrors((e) => ({ ...e, [path]: '' }));
  };

  const save = useCallback(async (status?: Draft['status']) => {
    if (!draft) return;
    const nextStatus = status || draft.status;
    const fieldErrors: Record<string, string> = {};
    for (const s of def.sections) for (const f of s.fields) {
      if (f.required && !String(getPath(draft.data, f.key) ?? '').trim()) fieldErrors[f.key] = `${f.label} is required`;
    }
    if (!draft.slug) fieldErrors.__slug = 'Add a web address';
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) { setError('Some fields need attention.'); return; }

    setSaving(true);
    setError('');
    try {
      let data = setPath(draft.data, def.slugKey, draft.slug);
      if (def.key === 'blogs' && !isNew) data = setPath(data, 'updated_on', new Date().toISOString());
      if (def.key === 'stores') {
        // The category decides which section of the site lists the store and the label it shows.
        const cat = findCategory(data.categorySlug);
        if (cat) data = { ...data, category: cat.name, type: SECTOR_STORE_TYPE[cat.sector] };
      }
      const { item } = await adminApi.save(def.key, { id: row?.id, slug: draft.slug, status: nextStatus, data });
      upsert(item);
      setDraft({ slug: item.slug, status: item.status, data: item.data });
      toast('ok', nextStatus === 'published' ? 'Saved. Live on the website within a minute.' : 'Saved as draft');
      if (isNew) navigate(`/admin/${def.key}/${item.id}`, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }, [draft, def, row, isNew, upsert, toast, navigate, findCategory]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  const doDelete = async () => {
    if (!row) return;
    try {
      await adminApi.remove(row.id);
      remove(row.id);
      toast('ok', `${def.singular[0].toUpperCase() + def.singular.slice(1)} deleted`);
      navigate(`/admin/${def.key}`);
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Could not delete');
    }
  };

  if (!draft) {
    if (loadError) return <ErrorNote>{loadError}</ErrorNote>;
    if (items && !row) return <ErrorNote>This {def.singular} no longer exists. <Link className="underline" to={`/admin/${def.key}`}>Back to {def.label.toLowerCase()}</Link></ErrorNote>;
    return <div className="space-y-4 max-w-3xl"><div className="h-7 w-1/3 adm-skeleton" /><div className="h-64 adm-skeleton" /></div>;
  }

  const publicUrl = def.publicUrl && row?.status === 'published' ? def.publicUrl(row.slug) : null;

  return (
    <div className="pb-24 lg:pb-0">
      {/* Sticky action bar: always one tap from save. */}
      <div className="sticky top-0 z-20 -mx-4 sm:-mx-8 px-4 sm:px-8 bg-white/95 backdrop-blur-[2px] border-b border-[var(--adm-line)] mb-6">
        <div className="flex items-center gap-3 h-14">
          <Link to={`/admin/${def.key}`} className="adm-btn adm-btn-ghost adm-btn-sm !px-1.5" aria-label={`Back to ${def.label}`}><ArrowLeft className="size-4" /></Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-semibold">{title || (isNew ? `New ${def.singular}` : 'Untitled')}</h1>
          </div>
          {dirty && <span className="hidden sm:inline text-[12.5px] text-[var(--adm-warn)]">Unsaved changes</span>}
          <div className="hidden lg:flex items-center gap-2">
            {draft.status === 'published' ? (
              <button className="adm-btn" disabled={saving} onClick={() => save('draft')}>Unpublish</button>
            ) : (
              <button className="adm-btn" disabled={saving} onClick={() => save('draft')}>Save draft</button>
            )}
            <button className="adm-btn adm-btn-primary" disabled={saving} onClick={() => save('published')}>
              {saving && <Spinner />} {draft.status === 'published' ? 'Save' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-8 items-start">
        <div className="flex flex-col gap-8 min-w-0">
          {error && <ErrorNote>{error}</ErrorNote>}
          {def.sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-[13px] font-semibold text-[var(--adm-ink)] mb-3">{s.title}</h2>
              <FieldGrid fields={s.fields} data={draft.data} onChange={change} errors={errors} />
            </section>
          ))}
        </div>

        <aside className="lg:sticky lg:top-20 flex flex-col gap-5 p-4 rounded-xl border border-[var(--adm-line)] bg-[var(--adm-panel)]">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[var(--adm-ink-2)]">Status</span>
            <StatusPill status={draft.status} />
          </div>
          <FieldShell label="Web address" htmlFor="slug" error={errors.__slug}
            help={def.publicUrl ? `${def.publicUrl(draft.slug || '…')}` : undefined}>
            <input id="slug" className="adm-input font-mono text-[13px]" value={draft.slug}
              onChange={(e) => { setSlugTouched(true); setDraft({ ...draft, slug: slugify(e.target.value) || e.target.value.toLowerCase() }); }}
              aria-invalid={!!errors.__slug} />
          </FieldShell>
          {publicUrl && (
            <a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--adm-accent)] hover:underline">
              View on website <ExternalLink className="size-3.5" />
            </a>
          )}
          {row && (
            <div className="pt-4 border-t border-[var(--adm-line)]">
              <button className="adm-btn adm-btn-sm adm-btn-danger w-full" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="size-3.5" /> Delete {def.singular}
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile action bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 flex gap-2 p-3 bg-white border-t border-[var(--adm-line)]">
        <button className="adm-btn flex-1" disabled={saving} onClick={() => save('draft')}>{draft.status === 'published' ? 'Unpublish' : 'Save draft'}</button>
        <button className="adm-btn adm-btn-primary flex-1" disabled={saving} onClick={() => save('published')}>{saving && <Spinner />} {draft.status === 'published' ? 'Save' : 'Publish'}</button>
      </div>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title={`Delete this ${def.singular}?`}
        footer={<>
          <button className="adm-btn" onClick={() => setConfirmDelete(false)}>Cancel</button>
          <button className="adm-btn adm-btn-primary !bg-[var(--adm-danger)] !border-[var(--adm-danger)]" onClick={doDelete}>Delete</button>
        </>}>
        <p className="text-[14px] text-[var(--adm-ink-2)]">“{title || 'Untitled'}” will be removed from the website. This cannot be undone. To hide it temporarily, unpublish it instead.</p>
      </Dialog>

      <Dialog open={blocker.state === 'blocked'} onClose={() => blocker.reset?.()} title="Leave without saving?"
        footer={<>
          <button className="adm-btn" onClick={() => blocker.reset?.()}>Keep editing</button>
          <button className="adm-btn adm-btn-danger" onClick={() => blocker.proceed?.()}>Discard changes</button>
        </>}>
        <p className="text-[14px] text-[var(--adm-ink-2)]">Your changes to this {def.singular} have not been saved.</p>
      </Dialog>
    </div>
  );
}
