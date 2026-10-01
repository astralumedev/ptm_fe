import { ReactNode, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Images, Settings2, UserRound, LogOut, Menu, X, ExternalLink, PanelsTopLeft, Inbox, Map as MapIcon } from 'lucide-react';
import { COLLECTIONS } from '../schema';
import { Logo } from '../components/ui';

export function PageHead({ title, lead, actions }: { title: string; lead?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="text-[20px] font-semibold tracking-[-0.01em]">{title}</h1>
        {lead && <p className="mt-0.5 text-[13.5px] text-[var(--adm-ink-3)]">{lead}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

const linkCls = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2.5 h-9 px-2.5 rounded-md text-[13.5px] transition-colors duration-150 ${isActive
    ? 'bg-white text-[var(--adm-accent)] font-medium shadow-[0_1px_2px_rgb(22_24_29/0.08)]'
    : 'text-[var(--adm-ink-2)] hover:bg-[#eceef2] hover:text-[var(--adm-ink)]'}`;

function Nav({ username, onLogout, unread }: { username: string; onLogout: () => void; unread: number }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-4">
        <Logo className="h-8" />
        <p className="mt-2 text-[12px] text-[var(--adm-ink-3)]">Website manager</p>
      </div>
      <nav className="flex-1 overflow-y-auto adm-scroll px-2.5 flex flex-col gap-0.5" aria-label="Admin">
        <NavLink to="/admin" end className={linkCls}><LayoutDashboard className="size-4" /> Overview</NavLink>
        <NavLink to="/admin/inbox" className={linkCls}>
          <Inbox className="size-4" /> <span className="flex-1">Inbox</span>
          {unread > 0 && <span className="min-w-5 h-5 px-1.5 grid place-items-center rounded-full bg-[var(--adm-accent)] text-white text-[11.5px] font-semibold" aria-label={`${unread} unread`}>{unread > 99 ? '99+' : unread}</span>}
        </NavLink>
        <NavLink to="/admin/map" className={linkCls}><MapIcon className="size-4" /> Map management</NavLink>
        <p className="mt-4 mb-1 px-2.5 text-[12px] font-medium text-[var(--adm-ink-3)]">Content</p>
        <NavLink to="/admin/content" className={linkCls}><PanelsTopLeft className="size-4" /> Site content</NavLink>
        {COLLECTIONS.map((c) => (
          <NavLink key={c.key} to={`/admin/${c.key}`} className={linkCls}><c.icon className="size-4" /> {c.label}</NavLink>
        ))}
        <p className="mt-4 mb-1 px-2.5 text-[12px] font-medium text-[var(--adm-ink-3)]">Site</p>
        <NavLink to="/admin/media" className={linkCls}><Images className="size-4" /> Media library</NavLink>
        <NavLink to="/admin/settings" className={linkCls}><Settings2 className="size-4" /> Contact & social</NavLink>
      </nav>
      <div className="p-2.5 border-t border-[var(--adm-line)] flex flex-col gap-0.5">
        <a href="/" target="_blank" rel="noreferrer" className={linkCls({ isActive: false })}><ExternalLink className="size-4" /> View website</a>
        <NavLink to="/admin/account" className={linkCls}><UserRound className="size-4" /> {username}</NavLink>
        <button onClick={onLogout} className={`${linkCls({ isActive: false })} w-full cursor-pointer`}><LogOut className="size-4" /> Sign out</button>
      </div>
    </div>
  );
}

export function Shell({ username, onLogout, unread }: { username: string; onLogout: () => void; unread: number }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => { document.title = 'PTM Admin'; }, []);

  return (
    <div className="lg:grid lg:grid-cols-[232px_minmax(0,1fr)] min-h-screen">
      <aside className="hidden lg:block sticky top-0 h-screen bg-[var(--adm-panel)] border-r border-[var(--adm-line)]">
        <Nav username={username} onLogout={onLogout} unread={unread} />
      </aside>

      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-white border-b border-[var(--adm-line)]">
        <Logo className="h-7" />
        <button className="adm-btn adm-btn-ghost adm-btn-sm !px-2.5" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="size-5" /></button>
      </header>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-[rgb(22_24_29/0.4)]" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[260px] bg-[var(--adm-panel)] shadow-xl adm-toast">
            <button className="absolute right-2 top-4 adm-btn adm-btn-ghost adm-btn-sm !px-1.5" onClick={() => setOpen(false)} aria-label="Close menu"><X className="size-4" /></button>
            <Nav username={username} onLogout={onLogout} unread={unread} />
          </div>
        </div>
      )}

      {/* The map editor uses the whole screen; everything else is a readable column. */}
      <main className={pathname.startsWith('/admin/map') ? 'min-w-0 w-full' : 'min-w-0 px-4 sm:px-8 py-6 lg:py-8 max-w-[1120px] w-full'}>
        <Outlet />
      </main>
    </div>
  );
}
