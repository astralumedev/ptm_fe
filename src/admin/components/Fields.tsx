import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Field, getPath, imageUrlOf, toAsset } from '../schema';
import { FieldShell, Toggle } from './ui';
import { ImageInput, GalleryInput } from './media';
import { RichText } from './RichText';

type Data = Record<string, any>;

export function FieldGrid({ fields, data, onChange, errors }: {
  fields: Field[]; data: Data; onChange: (path: string, value: unknown) => void; errors?: Record<string, string>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
      {fields.map((f) => (
        <div key={f.key} className={f.half ? '' : 'sm:col-span-2'}>
          <FieldInput field={f} value={getPath(data, f.key)} onChange={(v) => onChange(f.key, v)} error={errors?.[f.key]} />
        </div>
      ))}
    </div>
  );
}

function FieldInput({ field: f, value, onChange, error }: { field: Field; value: any; onChange: (v: unknown) => void; error?: string }) {
  const id = `f-${f.key.replace(/\./g, '-')}`;
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
          {!f.options?.some((o) => o.value === value) && <option value={value ?? ''}>{value || 'Choose…'}</option>}
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
    case 'url':
      return shell(<input id={id} type="url" inputMode="url" className="adm-input" value={value ?? ''} placeholder={f.placeholder || 'https://'} onChange={(e) => onChange(e.target.value || null)} aria-invalid={!!error} />);
    default:
      return shell(<input id={id} type="text" className="adm-input" value={value ?? ''} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} />);
  }
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
        placeholder={value.length ? '' : 'Add a tag'} className="flex-1 min-w-24 h-6 bg-transparent focus:outline-none" />
    </div>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
