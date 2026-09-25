import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import './admin.css';
import { adminApi, AdminUser, ApiError } from './lib/http';
import { clearCollectionCache } from './lib/useCollection';
import { collectionByKey } from './schema';
import { ErrorNote, Logo, Spinner, ToastProvider } from './components/ui';
import { LoginPage, SetupPage, ForcedPasswordPage } from './pages/Auth';
import { Shell } from './pages/Layout';
import Overview from './pages/Overview';
import CollectionList from './pages/CollectionList';
import ItemEditor from './pages/ItemEditor';
import MediaPage from './pages/MediaPage';
import { SettingsPage, AccountPage } from './pages/SettingsPage';

type Phase = { kind: 'loading' } | { kind: 'setup' } | { kind: 'login' } | { kind: 'error'; message: string } | { kind: 'in'; admin: AdminUser };

function KnownCollection({ children }: { children: React.ReactNode }) {
  const { collection } = useParams();
  return collectionByKey(collection) ? <>{children}</> : <Navigate to="/admin" replace />;
}

export default function AdminApp() {
  const [phase, setPhase] = useState<Phase>({ kind: 'loading' });

  const boot = async () => {
    setPhase({ kind: 'loading' });
    try {
      const { ready } = await adminApi.setupStatus();
      if (!ready) return setPhase({ kind: 'setup' });
      const { admin } = await adminApi.me();
      setPhase(admin ? { kind: 'in', admin } : { kind: 'login' });
    } catch (e) {
      if (e instanceof ApiError && e.needsSetup) return setPhase({ kind: 'setup' });
      setPhase({ kind: 'error', message: e instanceof Error ? e.message : 'Could not reach the server' });
    }
  };

  useEffect(() => { boot(); }, []);

  // Any 401 from a later request (session expired, password changed elsewhere) returns to sign in.
  useEffect(() => {
    const orig = window.fetch;
    window.fetch = async (...args) => {
      const res = await orig(...args);
      const url = String(args[0] instanceof Request ? args[0].url : args[0]);
      if (res.status === 401 && url.includes('/api/admin/')) setPhase((p) => (p.kind === 'in' ? { kind: 'login' } : p));
      return res;
    };
    return () => { window.fetch = orig; };
  }, []);

  const logout = async () => {
    await adminApi.logout().catch(() => {});
    clearCollectionCache();
    setPhase({ kind: 'login' });
  };

  let body: React.ReactNode;
  if (phase.kind === 'loading') {
    body = (
      <div className="min-h-screen grid place-items-center">
        <div className="flex flex-col items-center gap-4 text-[var(--adm-ink-3)]"><Logo className="h-9" /><Spinner /></div>
      </div>
    );
  } else if (phase.kind === 'error') {
    body = (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="max-w-md w-full flex flex-col gap-4">
          <Logo className="h-9 self-center" />
          <ErrorNote>{phase.message}</ErrorNote>
          <button className="adm-btn self-center" onClick={boot}>Try again</button>
        </div>
      </div>
    );
  } else if (phase.kind === 'setup') {
    body = <SetupPage onDone={() => setPhase({ kind: 'login' })} />;
  } else if (phase.kind === 'login') {
    body = <LoginPage onDone={(admin) => setPhase({ kind: 'in', admin })} />;
  } else if (phase.admin.mustChange) {
    body = <ForcedPasswordPage onDone={(admin) => setPhase({ kind: 'in', admin })} />;
  } else {
    const admin = phase.admin;
    body = (
      <Routes>
        <Route element={<Shell username={admin.username} onLogout={logout} />}>
          <Route index element={<Overview username={admin.username} />} />
          <Route path="media" element={<MediaPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="account" element={<AccountPage admin={admin} onChange={(a) => setPhase({ kind: 'in', admin: a })} />} />
          <Route path=":collection" element={<KnownCollection><CollectionList /></KnownCollection>} />
          <Route path=":collection/:id" element={<KnownCollection><ItemEditorKeyed /></KnownCollection>} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    );
  }

  return (
    <div className="adm">
      <ToastProvider>{body}</ToastProvider>
    </div>
  );
}

// Remount the editor per item so drafts never bleed between records.
function ItemEditorKeyed() {
  const { collection, id } = useParams();
  return <ItemEditor key={`${collection}/${id}`} />;
}
