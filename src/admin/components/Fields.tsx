import { useEffect, useMemo, useState, KeyboardEvent } from 'react';
import { X, ChevronDown, ChevronUp, ArrowUp, ArrowDown, Copy, Trash2, Plus, EyeOff, CalendarClock, Search } from 'lucide-react';
import { Field, getPath, imageUrlOf, setPath, toAsset } from '../schema';
import { FieldShell, Toggle } from './ui';
import { ImageInput, GalleryInput } from './media';
import { RichText } from './RichText';
import { CmsIcon, ICON_OPTIONS } from '@/content/icons';
import { isLive } from '@/content/visibility';
import { useAdminCategories } from '../lib/useAdminCategories';
import { useCollection } from '../lib/useCollection';

type Data = Record<string, any>;

export function FieldGrid({ fields, data, onChange, errors, idPrefix = 'f' }: {
  fields: Field[]; data: Data; onChange: (path: string, value: unknown) => void; errors?: Record<string, string>; idPrefix?: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
      {fields.map((f) => (
        <div key={f.key} className={f.half ? '' : 'sm:col-span-2'}>
          <FieldInput field={f} value={getPath(data, f.key)} data={data} onChange={(v) => onChange(f.key, v)} error={errors?.[f.key]} idPrefix={idPrefix} />
        </div>
      ))}
    </div>
  );
}

function FieldInput({ field: f, value, data, onChange, error, idPrefix }: {
  field: Field; value: any; data: Data; onChange: (v: unknown) => void; error?: string; idPrefix: string;
}) {
  const id = `${idPrefix}-${f.key.replace(/\./g, '-')}`;
  const shell = (children: React.ReactNode) => (
    <FieldShell label={f.label} help={f.help} error={error} htmlFor={id}>{children}</FieldShell>
  );

  switch (f.type) {
    case 'textarea':
      return shell(<textarea id={id} className="adm-input" rows={4} value={value ?? ''} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} />);
    case 'richtext':
      return shell(<RichText id={id} value={value ?? ''} onChange={onChange} />);
    case 'select':
      return shell(
        <select id={id} className="adm-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          {!f.options?.some((o) => o.value === (value ?? '')) && <option value={value ?? ''}>{value || 'Choose…'}</option>}
          {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>,
      );
    case 'toggle':
      return (
        <div className="flex flex-col gap-1.5 sm:pt-[22px]">
          <Toggle id={id} checked={Boolean(value)} onChange={onChange} label={f.label} />
          {f.help && <p className="text-[12.5px] text-[var(--adm-ink-3)]">{f.help}</p>}
        </div>
      );
    case 'number':
      return shell(<input id={id} type="number" inputMode="decimal" className="adm-input" value={value ?? ''} placeholder={f.placeholder}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} aria-invalid={!!error} />);
    case 'date':
      return shell(
        <div className="flex gap-1.5">
          <input id={id} type="date" className="adm-input" value={(value || '').slice(0, 10)} onChange={(e) => onChange(e.target.value || '')} />
          {value && <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm !h-9 !px-2" onClick={() => onChange('')} aria-label={`Clear ${f.label}`}><X className="size-4" /></button>}
        </div>,
      );
    case 'color':
      return shell(
        <div className="flex gap-2 items-center">
          <input type="color" aria-label={`${f.label} picker`} value={/^#[0-9a-f]{6}$/i.test(value || '') ? value : '#888888'} onChange={(e) => onChange(e.target.value)}
            className="h-9 w-11 shrink-0 rounded-md border border-[var(--adm-line-strong)] bg-white p-1 cursor-pointer" />
          <input id={id} className="adm-input font-mono text-[13px]" value={value ?? ''} placeholder="#3b82f6" onChange={(e) => onChange(e.target.value)} />
        </div>,
      );
    case 'icon':
      return shell(
        <div className="flex gap-2 items-center">
          <span className="grid place-items-center size-9 shrink-0 rounded-md border border-[var(--adm-line)] bg-[var(--adm-panel)] text-[var(--adm-ink-2)]"><CmsIcon name={value} className="size-4" /></span>
          <select id={id} className="adm-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
            {!value && <option value="">Choose…</option>}
            {(f.options || ICON_OPTIONS).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>,
      );
    case 'tags':
      return shell(<TagsInput id={id} value={Array.isArray(value) ? value : []} onChange={onChange} />);
    case 'datetime': {
      const local = value ? toLocalInput(value) : '';
      return shell(<input id={id} type="datetime-local" className="adm-input" value={local} onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : '')} />);
    }
    case 'asset':
      return shell(<ImageInput id={id} preset={f.preset || 'content'} value={imageUrlOf(value)} onChange={(url, m) => onChange(url ? toAsset(url, m?.thumb_url) : toAsset(''))} />);
    case 'imageUrl':
      return shell(<ImageInput id={id} preset={f.preset || 'content'} value={value || ''} onChange={(url) => onChange(url)} />);
    case 'gallery': {
      const urls: string[] = (Array.isArray(value) ? value : []).map((g: any) => g?.directus_files_id?.data?.full_url).filter(Boolean);
      return shell(
        <GalleryInput preset={f.preset || 'content'} urls={urls}
          onChange={(next) => onChange(next.map((u) => ({ directus_files_id: { data: toAsset(u).data } })))} />,
      );
    }
    case 'category':
      return shell(<CategorySelect id={id} value={value} onChange={onChange} sector={f.sector} />);
    case 'store':
      return shell(<StoreSelect id={id} value={value} onChange={onChange} />);
    case 'mapUnits':
      return shell(<MapUnitsInput id={id} floor={getPath(data, f.floorKey || 'mapFloor')} value={Array.isArray(value) ? value : []} onChange={onChange} ownSlug={data?.slug} />);
    case 'list':
      return <ListInput field={f} value={Array.isArray(value) ? value : []} onChange={onChange} idPrefix={id} />;
    case 'url':
      return shell(<input id={id} type="text" inputMode="url" className="adm-input" value={value ?? ''} placeholder={f.placeholder || 'https://'} onChange={(e) => onChange(e.target.value || null)} aria-invalid={!!error} />);
    default:
      return shell(<input id={id} type="text" className="adm-input" value={value ?? ''} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} />);
  }
}

/** Repeatable items (slides, FAQs, menu links…): collapsible cards with reorder, duplicate and remove. */
function ListInput({ field: f, value, onChange, idPrefix }: { field: Field; value: Data[]; onChange: (v: Data[]) => void; idPrefix: string }) {
  const [open, setOpen] = useState<number | null>(value.length === 1 ? 0 : null);
  const noun = f.itemName || 'item';
  const full = f.max !== undefined && value.length >= f.max;

  const update = (i: number, path: string, v: unknown) => onChange(value.map((item, j) => (j === i ? setPath(item || {}, path, v) : item)));
  const move = (i: number, d: number) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
    setOpen((o) => (o === i ? i + d : o === i + d ? i : o));
  };
  const add = () => {
    onChange([...value, structuredClone(f.itemDefaults || {})]);
    setOpen(value.length);
  };

  const titleOf = (item: Data, i: number) => {
    const t = f.itemTitle ? getPath(item, f.itemTitle) : '';
    return (typeof t === 'string' && t.trim()) || `${noun[0].toUpperCase() + noun.slice(1)} ${i + 1}`;
  };
  const hasSchedule = f.fields?.some((x) => x.key === 'hideAfter');

  return (
    <fieldset className="flex flex-col gap-2 min-w-0">
      <legend className="text-[13px] font-medium text-[var(--adm-ink-2)] mb-1.5">
        {f.label} <span className="font-normal text-[var(--adm-ink-3)]">· {value.length}</span>
      </legend>
      {f.help && <p className="text-[12.5px] text-[var(--adm-ink-3)] -mt-1 mb-1">{f.help}</p>}
      {value.length === 0 && (
        <p className="px-3 py-4 rounded-lg border border-dashed border-[var(--adm-line-strong)] text-[13px] text-[var(--adm-ink-3)] text-center">
          No {noun}s yet. This part of the page stays hidden until you add one.
        </p>
      )}
      {value.map((item, i) => {
        const expanded = open === i;
        const offline = hasSchedule && !isLive(item);
        return (
          <div key={i} className={`rounded-lg border bg-white ${expanded ? 'border-[var(--adm-line-strong)] shadow-[0_1px_3px_rgb(22_24_29/0.06)]' : 'border-[var(--adm-line)]'}`}>
            <div className="flex items-center gap-1 pl-3 pr-1.5 h-11">
              <button type="button" onClick={() => setOpen(expanded ? null : i)} aria-expanded={expanded}
                className="flex-1 min-w-0 flex items-center gap-2 text-left h-full cursor-pointer">
                {expanded ? <ChevronUp className="size-4 shrink-0 text-[var(--adm-ink-3)]" /> : <ChevronDown className="size-4 shrink-0 text-[var(--adm-ink-3)]" />}
                <span className={`truncate text-[13.5px] font-medium ${offline ? 'text-[var(--adm-ink-3)]' : ''}`}>{titleOf(item, i)}</span>
                {offline && (
                  <span className="inline-flex items-center gap-1 shrink-0 text-[11.5px] text-[var(--adm-ink-3)]">
                    {item?.hidden ? <EyeOff className="size-3" /> : <CalendarClock className="size-3" />} {item?.hidden ? 'Hidden' : 'Not showing today'}
                  </span>
                )}
              </button>
              <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm !px-1.5" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp className="size-3.5" /></button>
              <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm !px-1.5" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown className="size-3.5" /></button>
              <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm !px-1.5 hidden sm:inline-flex" disabled={full} onClick={() => { const next = [...value]; next.splice(i + 1, 0, structuredClone(item)); onChange(next); setOpen(i + 1); }} aria-label="Duplicate"><Copy className="size-3.5" /></button>
              <button type="button" className="adm-btn adm-btn-ghost adm-btn-sm adm-btn-danger !px-1.5" onClick={() => { onChange(value.filter((_, j) => j !== i)); setOpen(null); }} aria-label={`Remove ${noun}`}><Trash2 className="size-3.5" /></button>
            </div>
            {expanded && (
              <div className="px-3 pb-4 pt-1 border-t border-[var(--adm-line)]">
                <div className="pt-3">
                  <FieldGrid fields={f.fields || []} data={item || {}} onChange={(p, v) => update(i, p, v)} idPrefix={`${idPrefix}-${i}`} />
                </div>
              </div>
            )}
          </div>
        );
      })}
      <button type="button" className="adm-btn adm-btn-sm self-start" onClick={add} disabled={full}>
        <Plus className="size-3.5" /> Add {noun}
      </button>
    </fieldset>
  );
}

function CategorySelect({ id, value, onChange, sector }: { id: string; value?: string; onChange: (v: string) => void; sector?: string }) {
  const { categories } = useAdminCategories();
  const opts = categories.filter((c) => !sector || c.sector === sector);
  const known = opts.some((c) => c.slug === value);
  const groups = ['retail', 'dine', 'entertain', 'service'];
  const names: Record<string, string> = { retail: 'Shop', dine: 'Dine', entertain: 'Entertain', service: 'Services' };
  return (
    <select id={id} className="adm-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">No category</option>
      {value && !known && <option value={value}>{value} (not in the category list)</option>}
      {groups.map((g) => {
        const inGroup = opts.filter((c) => c.sector === g);
        return inGroup.length ? (
          <optgroup key={g} label={names[g]}>
            {inGroup.map((c) => <option key={c.slug} value={c.slug}>{c.name}{c.hidden ? ' (hidden)' : ''}</option>)}
          </optgroup>
        ) : null;
      })}
    </select>
  );
}

function StoreSelect({ id, value, onChange }: { id: string; value?: string; onChange: (v: string) => void }) {
  const { items } = useCollection('stores');
  const stores = useMemo(() => [...(items || [])].sort((a, b) => String(a.data.name).localeCompare(String(b.data.name))), [items]);
  return (
    <select id={id} className="adm-input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} disabled={!items}>
      <option value="">{items ? 'Choose a store…' : 'Loading stores…'}</option>
      {value && items && !stores.some((s) => s.slug === value) && <option value={value}>{value} (missing)</option>}
      {stores.map((s) => <option key={s.id} value={s.slug}>{s.data.name}{s.status === 'draft' ? ' (draft)' : ''}</option>)}
    </select>
  );
}

interface MapUnit { id: string; block?: string; area?: string; cat: string }
const floorCache = new Map<string, Promise<MapUnit[]>>();
function loadFloorUnits(floor: string) {
  if (!floorCache.has(floor)) {
    floorCache.set(floor, fetch(`/wayfinding/data/${floor}.json`)
      .then((r) => (r.ok ? r.json() : { locations: [] }))
      .then((d) => (d.locations || []).filter((l: MapUnit) => l.cat === 'shop').map((l: MapUnit) => ({ id: l.id, block: l.block, area: l.area, cat: l.cat })))
      .catch(() => []));
  }
  return floorCache.get(floor)!;
}

/** Picks units from the real floor plan, showing which ones other stores already occupy. */
function MapUnitsInput({ id, floor, value, onChange, ownSlug }: { id: string; floor?: string; value: string[]; onChange: (v: string[]) => void; ownSlug?: string }) {
  const [units, setUnits] = useState<MapUnit[] | null>(null);
  const [q, setQ] = useState('');
  const { items: stores } = useCollection('stores');

  useEffect(() => {
    setUnits(null);
    if (floor) loadFloorUnits(floor).then(setUnits);
  }, [floor]);

  const takenBy = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of stores || []) {
      if (s.slug === ownSlug || s.data.mapFloor !== floor) continue;
      for (const u of s.data.mapUnits || []) m.set(u, s.data.name);
    }
    return m;
  }, [stores, floor, ownSlug]);

  if (!floor) return <p className="text-[13px] text-[var(--adm-ink-3)] py-2">Choose a mall map floor first.</p>;
  const list = (units || []).filter((u) => !q || u.id.toLowerCase().includes(q.toLowerCase()) || u.block?.toLowerCase().includes(q.toLowerCase()));
  const toggle = (u: string) => onChange(value.includes(u) ? value.filter((x) => x !== u) : [...value, u]);

  return (
    <div id={id} className="flex flex-col gap-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((u) => (
            <span key={u} className="inline-flex items-center gap-1 h-7 pl-2.5 pr-1 rounded-md bg-[var(--adm-accent-soft)] text-[var(--adm-accent)] text-[13px] font-medium">
              {u}
              <button type="button" onClick={() => toggle(u)} className="grid place-items-center size-5 rounded hover:bg-white cursor-pointer" aria-label={`Remove unit ${u}`}><X className="size-3" /></button>
            </span>
          ))}
        </div>
      )}
      <div className="rounded-lg border border-[var(--adm-line)]">
        <div className="relative border-b border-[var(--adm-line)]">
          <Search className="absolute left-2.5 top-2.5 size-4 text-[var(--adm-ink-3)] pointer-events-none" />
          <input className="w-full h-9 pl-8 pr-3 bg-transparent rounded-t-lg focus:outline-none text-[13.5px]" placeholder="Find a unit, e.g. A104" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Find a unit" />
        </div>
        <div className="max-h-48 overflow-y-auto adm-scroll p-1.5 grid grid-cols-3 sm:grid-cols-5 gap-1">
          {!units ? <p className="col-span-full text-[13px] text-[var(--adm-ink-3)] p-2">Loading floor plan…</p>
            : list.length === 0 ? <p className="col-span-full text-[13px] text-[var(--adm-ink-3)] p-2">No units match.</p>
            : list.map((u) => {
              const on = value.includes(u.id);
              const other = takenBy.get(u.id);
              return (
                <button key={u.id} type="button" onClick={() => toggle(u.id)} title={[u.block, u.area, other && `Used by ${other}`].filter(Boolean).join(' · ')}
                  className={`h-8 px-1.5 rounded-md text-[12.5px] font-medium truncate cursor-pointer transition-colors duration-150 ${on ? 'bg-[var(--adm-accent)] text-white' : other ? 'bg-[var(--adm-warn-soft)] text-[var(--adm-warn)] hover:bg-[#fef0c7]' : 'hover:bg-[var(--adm-panel)]'}`}>
                  {u.id}
                </button>
              );
            })}
        </div>
      </div>
      {value.some((u) => takenBy.has(u)) && (
        <p className="text-[12.5px] text-[var(--adm-warn)]">
          {value.filter((u) => takenBy.has(u)).map((u) => `${u} is also assigned to ${takenBy.get(u)}`).join('. ')}.
        </p>
      )}
    </div>
  );
}

function TagsInput({ value, onChange, id }: { value: string[]; onChange: (v: string[]) => void; id: string }) {
  const [draft, setDraft] = useState('');
  const commit = () => {
    const parts = draft.split(',').map((s) => s.trim()).filter(Boolean).filter((s) => !value.includes(s));
    if (parts.length) onChange([...value, ...parts]);
    setDraft('');
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); }
    if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
  };
  return (
    <div className="adm-input !h-auto min-h-9 flex flex-wrap items-center gap-1.5 !py-1.5 focus-within:!border-[var(--adm-accent)] focus-within:shadow-[0_0_0_3px_rgb(46_48_148/0.14)]">
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 h-6 pl-2 pr-1 rounded-md bg-[var(--adm-panel)] border border-[var(--adm-line)] text-[12.5px]">
          {t}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} className="grid place-items-center size-4 rounded hover:bg-[#e4e6eb] cursor-pointer" aria-label={`Remove ${t}`}>
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input id={id} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onKey} onBlur={commit}
        placeholder={value.length ? '' : 'Type and press Enter'} className="flex-1 min-w-24 h-6 bg-transparent focus:outline-none" />
    </div>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
