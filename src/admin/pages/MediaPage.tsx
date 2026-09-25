import { useState } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { adminApi, MediaRecord } from '../lib/http';
import { formatBytes } from '../lib/images';
import { Dropzone, MediaGrid, useMediaLibrary } from '../components/media';
import { Dialog, ErrorNote, relativeTime, useToast } from '../components/ui';
import { PageHead } from './Layout';

export default function MediaPage() {
  const { items, error, add, drop } = useMediaLibrary();
  const [selected, setSelected] = useState<MediaRecord | null>(null);
  const [confirm, setConfirm] = useState(false);
  const toast = useToast();
  const total = items?.reduce((n, m) => n + (m.size || 0), 0) || 0;

  const remove = async () => {
    if (!selected) return;
    try {
      await adminApi.removeMedia(selected.id);
      drop(selected.id);
      setConfirm(false);
      setSelected(null);
      toast('ok', 'Image deleted');
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Could not delete');
    }
  };

  return (
    <>
      <PageHead title="Media library" lead={items ? `${items.length} images · ${formatBytes(total)} stored` : undefined} />
      <div className="mb-6"><Dropzone preset="content" multiple onUploaded={(m) => { add(m); toast('ok', m.length > 1 ? `${m.length} images uploaded` : 'Image uploaded'); }} /></div>
      {error && <div className="mb-4"><ErrorNote>{error}</ErrorNote></div>}
      {!items ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">{Array.from({ length: 10 }, (_, i) => <div key={i} className="aspect-square adm-skeleton" />)}</div>
      ) : items.length ? (
        <MediaGrid items={items} selected={selected?.url} onPick={setSelected} />
      ) : (
        <p className="text-[13.5px] text-[var(--adm-ink-3)] py-10 text-center">Images you upload anywhere in the panel collect here, ready to reuse.</p>
      )}

      <Dialog open={!!selected && !confirm} onClose={() => setSelected(null)} title={selected?.name || 'Image'} wide
        footer={selected && <>
          <button className="adm-btn adm-btn-danger mr-auto" onClick={() => setConfirm(true)}><Trash2 className="size-4" /> Delete</button>
          <button className="adm-btn" onClick={() => { navigator.clipboard.writeText(selected.url); toast('ok', 'Link copied'); }}><Copy className="size-4" /> Copy link</button>
        </>}>
        {selected && (
          <div className="flex flex-col gap-3">
            <img src={selected.url} alt="" className="max-h-[60vh] w-full object-contain rounded-lg bg-[var(--adm-panel)]" />
            <dl className="grid grid-cols-3 gap-3 text-[13px]">
              <div><dt className="text-[var(--adm-ink-3)]">Size</dt><dd>{selected.width}×{selected.height}</dd></div>
              <div><dt className="text-[var(--adm-ink-3)]">File</dt><dd>{formatBytes(selected.size)}</dd></div>
              <div><dt className="text-[var(--adm-ink-3)]">Uploaded</dt><dd>{relativeTime(selected.created_at)}</dd></div>
            </dl>
          </div>
        )}
      </Dialog>
      <Dialog open={confirm} onClose={() => setConfirm(false)} title="Delete this image?"
        footer={<>
          <button className="adm-btn" onClick={() => setConfirm(false)}>Cancel</button>
          <button className="adm-btn adm-btn-primary !bg-[var(--adm-danger)] !border-[var(--adm-danger)]" onClick={remove}>Delete image</button>
        </>}>
        <p className="text-[14px] text-[var(--adm-ink-2)]">If a store, post or page still uses it, the picture will disappear from that page. This cannot be undone.</p>
      </Dialog>
    </>
  );
}
