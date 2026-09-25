import { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, Upload, Trash2, Images, ArrowLeft, ArrowRight } from 'lucide-react';
import { adminApi, MediaRecord } from '../lib/http';
import { uploadImage, ImagePreset, formatBytes } from '../lib/images';
import { Dialog, Spinner, useToast } from './ui';

/** Upload queue with progress; shared by dropzones, pickers and the rich text editor. */
export function useUploader(preset: ImagePreset) {
  const toast = useToast();
  const [progress, setProgress] = useState<{ name: string; label: string; percent: number } | null>(null);

  const run = useCallback(async (files: File[]): Promise<MediaRecord[]> => {
    const done: MediaRecord[] = [];
    for (const [i, file] of files.entries()) {
      const prefix = files.length > 1 ? `${i + 1}/${files.length} · ` : '';
      try {
        const media = await uploadImage(file, preset, (p) =>
          setProgress({ name: file.name, label: prefix + (p.stage === 'compressing' ? 'Optimising' : 'Uploading'), percent: p.percent }));
        done.push(media);
      } catch (e) {
        toast('error', `${file.name}: ${e instanceof Error ? e.message : 'upload failed'}`);
      }
    }
    setProgress(null);
    return done;
  }, [preset, toast]);

  return { run, progress, busy: progress !== null };
}

export function Dropzone({ preset, onUploaded, compact, multiple }: {
  preset: ImagePreset; onUploaded: (m: MediaRecord[]) => void; compact?: boolean; multiple?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const { run, progress, busy } = useUploader(preset);

  const take = async (list: FileList | null) => {
    const files = Array.from(list || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    const done = await run(multiple ? files : files.slice(0, 1));
    if (done.length) onUploaded(done);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files); }}
      className={`relative flex items-center justify-center text-center rounded-lg border border-dashed transition-colors duration-150 ${over ? 'border-[var(--adm-accent)] bg-[var(--adm-accent-soft)]' : 'border-[var(--adm-line-strong)] bg-[var(--adm-panel)]'} ${compact ? 'h-24 px-3' : 'h-36 px-6'}`}
    >
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple={multiple} className="sr-only" onChange={(e) => { take(e.target.files); e.target.value = ''; }} />
      {busy && progress ? (
        <div className="w-full max-w-60">
          <div className="flex justify-between text-[12.5px] text-[var(--adm-ink-2)] mb-1.5">
            <span>{progress.label}</span>
            <span>{progress.percent}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#e4e6eb] overflow-hidden">
            <div className="h-full bg-[var(--adm-accent)] transition-[width] duration-200" style={{ width: `${Math.max(4, progress.percent)}%` }} />
          </div>
          <p className="mt-1.5 text-[12px] text-[var(--adm-ink-3)] truncate">{progress.name}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1.5">
          <button type="button" onClick={() => input.current?.click()} className="adm-btn adm-btn-sm">
            <Upload className="size-3.5" /> {multiple ? 'Upload images' : 'Upload image'}
          </button>
          <p className="text-[12.5px] text-[var(--adm-ink-3)]">or drop {multiple ? 'files' : 'a file'} here · compressed automatically</p>
        </div>
      )}
    </div>
  );
}

let cache: MediaRecord[] | null = null;

export function useMediaLibrary() {
  const [items, setItems] = useState<MediaRecord[] | null>(cache);
  const [error, setError] = useState('');
  const reload = useCallback(() => {
    adminApi.media().then((r) => { cache = r.items; setItems(r.items); }).catch((e) => setError(e.message));
  }, []);
  useEffect(() => { if (!cache) reload(); }, [reload]);
  const add = (m: MediaRecord[]) => {
    const next = [...m, ...(cache || []).filter((x) => !m.some((n) => n.id === x.id))];
    cache = next;
    setItems(next);
  };
  const drop = (id: number) => {
    cache = (cache || []).filter((x) => x.id !== id);
    setItems(cache);
  };
  return { items, error, add, drop, reload };
}

export function MediaGrid({ items, onPick, selected }: { items: MediaRecord[]; onPick: (m: MediaRecord) => void; selected?: string }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
      {items.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onPick(m)}
          title={m.name || ''}
          className={`group relative aspect-square rounded-lg overflow-hidden bg-[var(--adm-panel)] border transition-shadow duration-150 cursor-pointer ${selected === m.url ? 'border-[var(--adm-accent)] ring-2 ring-[var(--adm-accent)]' : 'border-[var(--adm-line)] hover:shadow-[0_2px_8px_rgb(22_24_29/0.12)]'}`}
        >
          <img src={m.thumb_url || m.url} alt={m.name || ''} loading="lazy" className="size-full object-cover" />
        </button>
      ))}
    </div>
  );
}

export function MediaPicker({ open, onClose, onPick, preset, selected }: {
  open: boolean; onClose: () => void; onPick: (m: MediaRecord) => void; preset: ImagePreset; selected?: string;
}) {
  const { items, error, add } = useMediaLibrary();
  return (
    <Dialog open={open} onClose={onClose} title="Choose an image" wide>
      <div className="flex flex-col gap-4">
        <Dropzone preset={preset} compact onUploaded={(m) => { add(m); onPick(m[0]); }} />
        {error && <p className="text-[13px] text-[var(--adm-danger)]">{error}</p>}
        {!items ? (
          <div className="grid grid-cols-5 gap-2.5">{Array.from({ length: 10 }, (_, i) => <div key={i} className="aspect-square adm-skeleton" />)}</div>
        ) : items.length ? (
          <MediaGrid items={items} selected={selected} onPick={onPick} />
        ) : (
          <p className="text-[13.5px] text-[var(--adm-ink-3)] py-6 text-center">No uploads yet. Your first upload will appear here and can be reused anywhere.</p>
        )}
      </div>
    </Dialog>
  );
}

/** Single image field: preview, replace from library/upload, remove. */
export function ImageInput({ value, onChange, preset, id }: { value: string; onChange: (url: string, media?: MediaRecord) => void; preset: ImagePreset; id?: string }) {
  const [picking, setPicking] = useState(false);
  const { run, progress } = useUploader(preset);
  const input = useRef<HTMLInputElement>(null);
  const isLogo = preset === 'logo';

  return (
    <div id={id}>
      {value ? (
        <div className="group relative rounded-lg overflow-hidden border border-[var(--adm-line)] bg-[var(--adm-panel)]">
          <img src={value} alt="" className={`w-full ${isLogo ? 'h-32 object-contain p-4 bg-white' : 'aspect-[16/9] object-cover'}`} />
          {progress && (
            <div className="absolute inset-0 grid place-items-center bg-white/80 text-[13px] text-[var(--adm-ink-2)]">
              <span className="flex items-center gap-2"><Spinner /> {progress.label} {progress.percent}%</span>
            </div>
          )}
          <div className="flex gap-1.5 p-2 border-t border-[var(--adm-line)] bg-white">
            <button type="button" className="adm-btn adm-btn-sm" onClick={() => setPicking(true)}><Images className="size-3.5" /> Replace</button>
            <button type="button" className="adm-btn adm-btn-sm" onClick={() => input.current?.click()}><Upload className="size-3.5" /> Upload</button>
            <button type="button" className="adm-btn adm-btn-sm adm-btn-ghost adm-btn-danger ml-auto" onClick={() => onChange('')} aria-label="Remove image"><Trash2 className="size-3.5" /></button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setPicking(true)}
          className={`w-full flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--adm-line-strong)] bg-[var(--adm-panel)] text-[var(--adm-ink-2)] hover:border-[var(--adm-accent)] hover:text-[var(--adm-accent)] transition-colors duration-150 cursor-pointer ${isLogo ? 'h-32' : 'aspect-[16/9] max-h-56'}`}
        >
          {progress ? <span className="flex items-center gap-2 text-[13px]"><Spinner /> {progress.label} {progress.percent}%</span> : (
            <>
              <ImagePlus className="size-5" />
              <span className="text-[13px] font-medium">Add image</span>
            </>
          )}
        </button>
      )}
      <input ref={input} type="file" accept="image/*" className="sr-only" onChange={async (e) => {
        const f = e.target.files?.[0];
        e.target.value = '';
        if (!f) return;
        const [m] = await run([f]);
        if (m) onChange(m.url, m);
      }} />
      <MediaPicker open={picking} onClose={() => setPicking(false)} preset={preset} selected={value}
        onPick={(m) => { onChange(m.url, m); setPicking(false); }} />
    </div>
  );
}

export function GalleryInput({ urls, onChange, preset }: { urls: string[]; onChange: (urls: string[], media?: MediaRecord[]) => void; preset: ImagePreset }) {
  const [picking, setPicking] = useState(false);
  const move = (i: number, d: number) => {
    const next = [...urls];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-2.5">
      {urls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {urls.map((u, i) => (
            <div key={u + i} className="group relative aspect-square rounded-lg overflow-hidden border border-[var(--adm-line)] bg-[var(--adm-panel)]">
              <img src={u} alt="" className="size-full object-cover" loading="lazy" />
              <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-100 sm:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150">
                <div className="flex gap-1">
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="adm-btn adm-btn-sm !h-7 !px-1.5" aria-label="Move left"><ArrowLeft className="size-3.5" /></button>
                  <button type="button" disabled={i === urls.length - 1} onClick={() => move(i, 1)} className="adm-btn adm-btn-sm !h-7 !px-1.5" aria-label="Move right"><ArrowRight className="size-3.5" /></button>
                </div>
                <button type="button" onClick={() => onChange(urls.filter((_, j) => j !== i))} className="adm-btn adm-btn-sm adm-btn-danger !h-7 !px-1.5" aria-label="Remove"><Trash2 className="size-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <button type="button" className="adm-btn adm-btn-sm" onClick={() => setPicking(true)}><Images className="size-3.5" /> Add from library</button>
      </div>
      <Dropzone preset={preset} compact multiple onUploaded={(m) => onChange([...urls, ...m.map((x) => x.url)], m)} />
      <MediaPicker open={picking} onClose={() => setPicking(false)} preset={preset}
        onPick={(m) => { onChange([...urls, m.url], [m]); setPicking(false); }} />
    </div>
  );
}

export function MediaMeta({ m }: { m: MediaRecord }) {
  return (
    <span className="text-[12px] text-[var(--adm-ink-3)]">
      {m.width && m.height ? `${m.width}×${m.height} · ` : ''}{formatBytes(m.size)}
    </span>
  );
}
