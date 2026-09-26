import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useBlock } from '../../content/block';
import { announcementsBlock, contentKey } from '../../content/blocks/promotions';
import { liveOnly } from '../../content/visibility';
import { CmsLink } from '../../content/CmsLink';

const STYLES = {
  brand: 'bg-[#801424] text-white',
  dark: 'bg-gray-900 text-white',
  info: 'bg-[#2e3094] text-white',
  alert: 'bg-amber-400 text-gray-950',
} as const;

const read = (k: string) => { try { return sessionStorage.getItem(k); } catch { return null; } };
const write = (k: string) => { try { sessionStorage.setItem(k, '1'); } catch { /* storage blocked */ } };

/** The first live announcement, as a slim bar above the header. Closing hides it for the visit. */
export default function AnnouncementBar() {
  const { pathname } = useLocation();
  const { items } = useBlock(announcementsBlock);
  const [closed, setClosed] = useState<string | null>(null);

  const item = liveOnly(items).find((a) => a.text?.trim() && (a.pages !== 'home' || pathname === '/'));
  if (!item) return null;
  const key = 'ptm-notice:' + contentKey([item.text, item.link, item.linkLabel]);
  if (closed === key || (item.dismissible && read(key))) return null;

  return (
    <div role="region" aria-label="Announcement" className={`relative z-[60] ${STYLES[item.style] || STYLES.brand}`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-10 sm:px-12 py-2 text-center text-xs sm:text-[13px] font-medium leading-snug">
        <span>{item.text}</span>
        {item.linkLabel && item.link && (
          <CmsLink href={item.link} className="ml-2 font-bold underline underline-offset-2 whitespace-nowrap hover:opacity-80">
            {item.linkLabel} →
          </CmsLink>
        )}
      </div>
      {item.dismissible && (
        <button
          type="button"
          onClick={() => { write(key); setClosed(key); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-7 h-7 rounded-full hover:bg-black/10 cursor-pointer"
          aria-label="Close announcement"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  );
}
