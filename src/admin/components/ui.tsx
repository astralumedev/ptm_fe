import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export function Logo({ className = 'h-7' }: { className?: string }) {
  return <img src="/tm_logo_nobg.png" alt="Pokhara Trade Mall" className={`${className} w-auto select-none`} draggable={false} />;
}

export function FieldShell({ label, help, error, htmlFor, children, optionalHint }: {
  label: string; help?: string; error?: string; htmlFor?: string; children: ReactNode; optionalHint?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-[var(--adm-ink-2)]">
        {label}
        {optionalHint && <span className="font-normal text-[var(--adm-ink-3)]"> · optional</span>}
      </label>
      {children}
      {error ? (
        <p className="text-[12.5px] text-[var(--adm-danger)]">{error}</p>
      ) : help ? (
        <p className="text-[12.5px] text-[var(--adm-ink-3)]">{help}</p>
      ) : null}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const live = status === 'published';
  return (
    <span className={`inline-flex items-center gap-1.5 h-6 px-2 rounded-full text-[12px] font-medium ${live ? 'bg-[var(--adm-ok-soft)] text-[var(--adm-ok)]' : 'bg-[#f2f3f5] text-[var(--adm-ink-2)]'}`}>
      <span className={`size-1.5 rounded-full ${live ? 'bg-[var(--adm-ok)]' : 'bg-[#9aa0ab]'}`} />
      {live ? 'Live' : 'Draft'}
    </span>
  );
}

export function Toggle({ checked, onChange, id, label }: { checked: boolean; onChange: (v: boolean) => void; id?: string; label: string }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group inline-flex items-center gap-2.5 h-9 cursor-pointer"
    >
      <span className={`relative w-9 h-5 rounded-full transition-colors duration-150 ${checked ? 'bg-[var(--adm-accent)]' : 'bg-[#cfd3db] group-hover:bg-[#bcc1cb]'}`}>
        <span className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.2)] transition-transform duration-150 ${checked ? 'translate-x-4' : ''}`} />
      </span>
      <span className="text-[13.5px] text-[var(--adm-ink)]">{label}</span>
    </button>
  );
}

export function Spinner({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Native <dialog>: proper focus trapping and Escape handling for free. */
export function Dialog({ open, onClose, title, children, footer, wide }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={`m-auto p-0 rounded-xl border border-[var(--adm-line)] shadow-[0_20px_50px_-12px_rgb(22_24_29/0.35)] w-[calc(100%-32px)] ${wide ? 'max-w-4xl' : 'max-w-md'} max-h-[calc(100vh-48px)] bg-white text-[var(--adm-ink)]`}
    >
      {open && (
        <div className="flex flex-col max-h-[calc(100vh-48px)]">
          <div className="flex items-center justify-between gap-4 px-5 h-14 border-b border-[var(--adm-line)] shrink-0">
            <h2 className="text-[15px] font-semibold">{title}</h2>
            <button type="button" onClick={onClose} className="adm-btn adm-btn-ghost adm-btn-sm !px-1.5" aria-label="Close">
              <X className="size-4" />
            </button>
          </div>
          <div className="overflow-y-auto adm-scroll px-5 py-4">{children}</div>
          {footer && <div className="flex justify-end gap-2 px-5 py-3 border-t border-[var(--adm-line)] shrink-0">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}

type Toast = { id: number; kind: 'ok' | 'error'; text: string };
const ToastCtx = createContext<(kind: Toast['kind'], text: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((kind: Toast['kind'], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'error' ? 6000 : 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed z-50 bottom-4 right-4 left-4 sm:left-auto flex flex-col gap-2 items-stretch sm:items-end pointer-events-none" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="adm-toast pointer-events-auto flex items-start gap-2.5 max-w-sm px-3.5 py-2.5 rounded-lg bg-[var(--adm-ink)] text-white text-[13.5px] shadow-[0_8px_24px_-6px_rgb(22_24_29/0.4)]">
            {t.kind === 'ok' ? <CheckCircle2 className="size-4 mt-0.5 text-[#75e0a7] shrink-0" /> : <AlertCircle className="size-4 mt-0.5 text-[#fda29b] shrink-0" />}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-[var(--adm-danger-soft)] text-[var(--adm-danger)] text-[13.5px]">
      <AlertCircle className="size-4 mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

export function relativeTime(iso?: string) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
