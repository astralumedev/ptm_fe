import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useBlock } from '../../content/block';
import { promotionsBlock, contentKey, Promotion } from '../../content/blocks/promotions';
import { liveOnly } from '../../content/visibility';

const WINDOW_MS: Record<Promotion['frequency'], number> = { visit: 0, day: 86_400_000, week: 7 * 86_400_000, once: Infinity };

function seenRecently(key: string, frequency: Promotion['frequency']) {
  try {
    if (frequency === 'visit') return sessionStorage.getItem(key) !== null;
    const at = Number(localStorage.getItem(key));
    return at > 0 && Date.now() - at < WINDOW_MS[frequency];
  } catch {
    return false;
  }
}

function markSeen(key: string, frequency: Promotion['frequency']) {
  try {
    (frequency === 'visit' ? sessionStorage : localStorage).setItem(key, String(Date.now()));
  } catch { /* storage blocked */ }
}

/** Shows the first live promotion once per visit/day/week, as configured in the CMS. */
export default function PromoPopup() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { items } = useBlock(promotionsBlock);
  const [open, setOpen] = useState<Promotion | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Never on the mall map: someone who just scanned a QR code in the mall wants directions, not an ad.
  const onMap = pathname.startsWith('/mall-map') || pathname.startsWith('/q/');
  const promo = onMap ? undefined : liveOnly(items).find((p) => p.title?.trim() && (p.pages !== 'home' || pathname === '/'));
  const key = promo ? 'ptm-promo:' + contentKey([promo.title, promo.text, promo.image, promo.buttonLink]) : '';

  useEffect(() => {
    if (!promo || open || seenRecently(key, promo.frequency || 'day')) return;
    const t = setTimeout(() => setOpen(promo), Math.max(0, Number(promo.delaySeconds) || 0) * 1000);
    return () => clearTimeout(t);
    // Re-evaluate when the promotion or page changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, pathname]);

  const close = () => {
    if (open) markSeen(key, open.frequency || 'day');
    setOpen(null);
  };

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const go = () => {
    const link = open?.buttonLink?.trim();
    close();
    if (!link) return;
    if (link.startsWith('/')) navigate(link);
    else window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <motion.div
            role="dialog" aria-modal="true" aria-labelledby="promo-title"
            className="relative w-full max-w-md max-h-[calc(100dvh-32px)] overflow-y-auto bg-white rounded-3xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
            initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              ref={closeRef} type="button" onClick={close} aria-label="Close"
              className="absolute top-3 right-3 z-10 grid place-items-center w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md cursor-pointer transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {open.image && (
              <button type="button" onClick={go} className="block w-full cursor-pointer" aria-label={open.buttonLabel || open.title}>
                <img src={open.image} alt="" decoding="async" className="w-full max-h-[45vh] sm:max-h-[55vh] object-cover" />
              </button>
            )}
            <div className="p-6 sm:p-7 text-center">
              <h2 id="promo-title" className="text-xl sm:text-2xl font-bold text-gray-900 uppercase tracking-wide font-arizona-flare">{open.title}</h2>
              <div className="flex items-center justify-center gap-2 my-3">
                <div className="w-8 h-0.5 bg-[#801424] rounded-full" />
                <div className="w-2 h-2 rotate-45 bg-[#801424] rounded-xs" />
                <div className="w-8 h-0.5 bg-[#801424] rounded-full" />
              </div>
              {open.text && <p className="text-sm text-gray-600 leading-relaxed mb-5" style={{ fontFamily: "'Montserrat', sans-serif" }}>{open.text}</p>}
              <div className="flex items-center justify-center gap-3">
                {open.buttonLabel && open.buttonLink && (
                  <button type="button" onClick={go} className="btn-primary"><span>{open.buttonLabel}</span></button>
                )}
                <button type="button" onClick={close} className="px-2 py-3 text-xs font-semibold text-gray-500 hover:text-gray-900 tracking-wide cursor-pointer" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  No thanks
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
