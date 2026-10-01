import { FormEvent, useState } from 'react';
import { Eye, EyeOff, Database } from 'lucide-react';
import { adminApi, AdminUser } from '../lib/http';
import { ErrorNote, FieldShell, Logo, Spinner } from '../components/ui';

function AuthFrame({ children, title, lead }: { children: React.ReactNode; title: string; lead?: string }) {
  return (
    <div className="min-h-screen grid place-items-center px-4 py-10 bg-[var(--adm-panel)]">
      <div className="w-full max-w-[380px]">
        <div className="flex justify-center mb-8"><Logo className="h-10" /></div>
        <div className="bg-white rounded-xl border border-[var(--adm-line)] shadow-[0_1px_3px_rgb(22_24_29/0.06)] p-6 sm:p-7">
          <h1 className="text-[18px] font-semibold tracking-[-0.01em]">{title}</h1>
          {lead && <p className="mt-1 text-[13.5px] text-[var(--adm-ink-3)]">{lead}</p>}
          <div className="mt-5">{children}</div>
        </div>
        <p className="mt-6 text-center text-[12.5px] text-[var(--adm-ink-3)]">
          <a href="/" className="hover:text-[var(--adm-ink)] hover:underline">Back to the website</a>
        </p>
      </div>
    </div>
  );
}

function PasswordInput({ id, value, onChange, autoComplete, autoFocus, required = true }: { id: string; value: string; onChange: (v: string) => void; autoComplete: string; autoFocus?: boolean; required?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id} type={show ? 'text' : 'password'} className="adm-input !pr-10" value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} autoFocus={autoFocus} required={required} />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-1 top-1/2 -translate-y-1/2 grid place-items-center size-9 rounded-md text-[var(--adm-ink-3)] hover:text-[var(--adm-ink)] hover:bg-[var(--adm-panel)] cursor-pointer" aria-label={show ? 'Hide password' : 'Show password'}>
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function LoginPage({ onDone }: { onDone: (a: AdminUser) => void }) {
  const [username, setUsername] = useState('ptm');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      onDone((await adminApi.login(username, password)).admin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame title="Sign in" lead="Manage the Pokhara Trade Mall website.">
      <form onSubmit={submit} className="flex flex-col gap-4">
        {error && <ErrorNote>{error}</ErrorNote>}
        <FieldShell label="Username" htmlFor="u">
          <input id="u" className="adm-input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" required />
        </FieldShell>
        <FieldShell label="Password" htmlFor="p">
          <PasswordInput id="p" value={password} onChange={setPassword} autoComplete="current-password" autoFocus />
        </FieldShell>
        <button className="adm-btn adm-btn-primary w-full mt-1" disabled={busy}>{busy && <Spinner />} Sign in</button>
      </form>
    </AuthFrame>
  );
}

export function SetupPage({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const run = async () => {
    setBusy(true);
    setError('');
    try {
      await adminApi.runSetup();
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Setup failed');
      setBusy(false);
    }
  };
  return (
    <AuthFrame title="Set up the database" lead="First run: this creates the tables, copies the current website content into the database and creates the admin account.">
      <div className="flex flex-col gap-4">
        {error && <ErrorNote>{error}</ErrorNote>}
        <div className="flex gap-3 p-3 rounded-lg bg-[var(--adm-panel)] text-[13px] text-[var(--adm-ink-2)]">
          <Database className="size-4 mt-0.5 shrink-0" />
          <p>You will sign in as <b>ptm</b> with the starter password <b>admin</b> (or the <code>ADMIN_USERNAME</code> / <code>ADMIN_PASSWORD</code> environment variables, if set), and be asked to choose a new password.</p>
        </div>
        <button className="adm-btn adm-btn-primary w-full" onClick={run} disabled={busy}>{busy && <Spinner />} {busy ? 'Setting up…' : 'Set up now'}</button>
      </div>
    </AuthFrame>
  );
}

export function PasswordForm({ onDone, forced, username: initialUsername }: { onDone: (a: AdminUser) => void; forced?: boolean; username?: string }) {
  const [username, setUsername] = useState(initialUsername || '');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const renameOnly = !!initialUsername && !next && !confirm;
    if (!renameOnly) {
      if (next !== confirm) return setError('The two new passwords do not match');
      if (next.length < 8) return setError('Use at least 8 characters');
    }
    setBusy(true);
    setError('');
    try {
      onDone((await adminApi.changePassword(current, next, initialUsername ? username : undefined)).admin);
      setCurrent(''); setNext(''); setConfirm('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change the password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {error && <ErrorNote>{error}</ErrorNote>}
      {initialUsername && (
        <FieldShell label="Username" htmlFor="un" help="Letters, numbers, dots, dashes or underscores.">
          <input id="un" className="adm-input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" required />
        </FieldShell>
      )}
      <FieldShell label="Current password" htmlFor="pc">
        <PasswordInput id="pc" value={current} onChange={setCurrent} autoComplete="current-password" autoFocus={forced} />
      </FieldShell>
      <FieldShell label="New password" htmlFor="pn" help={initialUsername ? 'At least 8 characters. Leave empty to keep the current password.' : 'At least 8 characters.'}>
        <PasswordInput id="pn" value={next} onChange={setNext} autoComplete="new-password" required={!initialUsername} />
      </FieldShell>
      <FieldShell label="Repeat new password" htmlFor="pr">
        <PasswordInput id="pr" value={confirm} onChange={setConfirm} autoComplete="new-password" required={!initialUsername} />
      </FieldShell>
      <button className={`adm-btn adm-btn-primary mt-1 ${forced ? 'w-full' : 'self-start'}`} disabled={busy}>{busy && <Spinner />} {initialUsername ? 'Save changes' : 'Change password'}</button>
    </form>
  );
}

export function ForcedPasswordPage({ onDone }: { onDone: (a: AdminUser) => void }) {
  return (
    <AuthFrame title="Choose a new password" lead="You signed in with the starter password. Set your own before continuing.">
      <PasswordForm forced onDone={onDone} />
    </AuthFrame>
  );
}
