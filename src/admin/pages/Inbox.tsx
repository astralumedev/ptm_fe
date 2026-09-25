import { useCallback, useEffect, useMemo, useState } from 'react';
import { Mail, Phone, Trash2, MailOpen, Inbox as InboxIcon, RotateCw } from 'lucide-react';
import { adminApi, Submission } from '../lib/http';
import { Dialog, ErrorNote, relativeTime, useToast } from '../components/ui';
import { PageHead } from './Layout';

const KIND_LABEL: Record<string, string> = { contact: 'Contact message', rsvp: 'Event RSVP', leasing: 'Leasing enquiry' };
const FIELD_LABEL: Record<string, string> = {
  name: 'Name', email: 'Email', phone: 'Phone', subject: 'Subject', message: 'Message', guests: 'Guests',
  eventTitle: 'Event', eventId: 'Event code', note: 'Note', business: 'Business', category: 'Category', size: 'Space needed',
};
type Filter = 'all' | 'contact' | 'rsvp' | 'leasing';

export default function InboxPage({ onUnreadChange }: { onUnreadChange: (n: number) => void }) {
  const [items, setItems] = useState<Submission[] | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<Submission | null>(null);
  const [confirm, setConfirm] = useState<Submission | null>(null);
  const toast = useToast();

  const load = useCallback(() => {
    setError('');
    adminApi.submissions().then((r) => setItems(r.items)).catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);
  useEffect(() => { if (items) onUnreadChange(items.filter((i) => !i.read).length); }, [items, onUnreadChange]);

  const rows = useMemo(() => (items || []).filter((i) => filter === 'all' || i.kind === filter), [items, filter]);

  const markRead = async (s: Submission, read = true) => {
    setItems((list) => list?.map((x) => (x.id === s.id ? { ...x, read } : x)) || null);
    await adminApi.markSubmission(s.id, read).catch(() => toast('error', 'Could not update the message'));
  };
  const openItem = (s: Submission) => {
    setOpen(s);
    if (!s.read) markRead(s);
  };
  const remove = async () => {
    if (!confirm) return;
    try {
      await adminApi.removeSubmission(confirm.id);
      setItems((list) => list?.filter((x) => x.id !== confirm.id) || null);
      setConfirm(null);
      setOpen(null);
      toast('ok', 'Deleted');
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Could not delete');
    }
  };

  const counts: Record<Filter, number> = {
    all: items?.length || 0,
    contact: items?.filter((i) => i.kind === 'contact').length || 0,
    rsvp: items?.filter((i) => i.kind === 'rsvp').length || 0,
    leasing: items?.filter((i) => i.kind === 'leasing').length || 0,
  };

  return (
    <>
      <PageHead title="Inbox" lead="Messages, event RSVPs and leasing enquiries sent from the website."
        actions={<button className="adm-btn" onClick={load}><RotateCw className="size-4" /> Refresh</button>} />
      <div role="tablist" className="inline-flex flex-wrap p-0.5 rounded-lg bg-[var(--adm-panel)] border border-[var(--adm-line)] mb-4">
        {(['all', 'contact', 'rsvp', 'leasing'] as Filter[]).map((f) => (
          <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}
            className={`h-8 px-3 rounded-md text-[13px] font-medium cursor-pointer transition-colors duration-150 ${filter === f ? 'bg-white text-[var(--adm-ink)] shadow-[0_1px_2px_rgb(22_24_29/0.1)]' : 'text-[var(--adm-ink-3)] hover:text-[var(--adm-ink)]'}`}>
            {f === 'all' ? 'All' : f === 'contact' ? 'Messages' : f === 'rsvp' ? 'RSVPs' : 'Leasing'} <span className="font-normal text-[var(--adm-ink-3)]">{counts[f]}</span>
          </button>
        ))}
      </div>
      {error && <div className="mb-4"><ErrorNote>{error}</ErrorNote></div>}
      <div className="rounded-xl border border-[var(--adm-line)] overflow-hidden bg-white">
        {!items && !error ? (
          <ul>{Array.from({ length: 5 }, (_, i) => <li key={i} className="px-4 h-16 flex items-center border-b last:border-0 border-[var(--adm-line)]"><div className="h-3 w-1/2 adm-skeleton" /></li>)}</ul>
        ) : rows.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <InboxIcon className="size-5 mx-auto text-[var(--adm-ink-3)]" />
            <p className="mt-2 text-[14px] font-medium">Nothing here yet</p>
            <p className="mt-1 text-[13px] text-[var(--adm-ink-3)]">When visitors use the contact form, RSVP to an event or ask about leasing, it appears here.</p>
          </div>
        ) : (
          <ul>
            {rows.map((s) => (
              <li key={s.id} className="border-b last:border-0 border-[var(--adm-line)]">
                <button onClick={() => openItem(s)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--adm-panel)] transition-colors duration-150 cursor-pointer">
                  <span className={`size-2 rounded-full shrink-0 ${s.read ? 'bg-transparent' : 'bg-[var(--adm-accent)]'}`} aria-label={s.read ? undefined : 'Unread'} />
                  <span className="flex-1 min-w-0">
                    <span className={`block truncate text-[14px] ${s.read ? '' : 'font-semibold'}`}>{s.data.name || 'Anonymous'}</span>
                    <span className="block truncate text-[12.5px] text-[var(--adm-ink-3)]">
                      {KIND_LABEL[s.kind] || s.kind} · {s.data.subject || s.data.eventTitle || s.data.business || s.data.message || ''}
                    </span>
                  </span>
                  <span className="text-[12.5px] text-[var(--adm-ink-3)] whitespace-nowrap">{relativeTime(s.created_at)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={!!open && !confirm} onClose={() => setOpen(null)} title={open ? KIND_LABEL[open.kind] || 'Message' : ''}
        footer={open && <>
          <button className="adm-btn adm-btn-danger mr-auto" onClick={() => setConfirm(open)}><Trash2 className="size-4" /> Delete</button>
          <button className="adm-btn" onClick={() => { markRead(open, false); setOpen(null); }}><MailOpen className="size-4" /> Mark unread</button>
          {open.data.email && <a className="adm-btn adm-btn-primary" href={`mailto:${open.data.email}?subject=${encodeURIComponent('Re: ' + (open.data.subject || open.data.eventTitle || 'Pokhara Trade Mall'))}`}><Mail className="size-4" /> Reply</a>}
        </>}>
        {open && (
          <div className="flex flex-col gap-3">
            <p className="text-[12.5px] text-[var(--adm-ink-3)]">Received {new Date(open.created_at).toLocaleString()}</p>
            <dl className="flex flex-col gap-3">
              {Object.entries(open.data).filter(([k]) => k !== 'eventId').map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[12.5px] text-[var(--adm-ink-3)]">{FIELD_LABEL[k] || k}</dt>
                  <dd className="text-[14px] whitespace-pre-wrap break-words">
                    {k === 'email' ? <a className="text-[var(--adm-accent)] hover:underline" href={`mailto:${v}`}>{v}</a>
                      : k === 'phone' ? <a className="inline-flex items-center gap-1 text-[var(--adm-accent)] hover:underline" href={`tel:${v}`}><Phone className="size-3.5" />{v}</a>
                      : v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Dialog>
      <Dialog open={!!confirm} onClose={() => setConfirm(null)} title="Delete this message?"
        footer={<>
          <button className="adm-btn" onClick={() => setConfirm(null)}>Cancel</button>
          <button className="adm-btn adm-btn-primary !bg-[var(--adm-danger)] !border-[var(--adm-danger)]" onClick={remove}>Delete</button>
        </>}>
        <p className="text-[14px] text-[var(--adm-ink-2)]">This cannot be undone.</p>
      </Dialog>
    </>
  );
}
