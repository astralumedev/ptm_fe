import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { SETTINGS_FIELDS, setPath } from '../schema';
import { adminApi, AdminUser } from '../lib/http';
import { useCollection } from '../lib/useCollection';
import { FieldGrid } from '../components/Fields';
import { ErrorNote, Spinner, useToast } from '../components/ui';
import { PasswordForm } from './Auth';
import { PageHead } from './Layout';

export function SettingsPage() {
  const { items, error: loadError, upsert } = useCollection('settings');
  const row = items?.[0];
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => { if (items) setData(row?.data || {}); }, [items, row]);
  const dirty = !!data && JSON.stringify(data) !== JSON.stringify(row?.data || {});

  const save = async () => {
    if (!data) return;
    const missing = SETTINGS_FIELDS.find((f) => f.required && !String(data[f.key] ?? '').trim());
    if (missing) { setError(`${missing.label} is required: it is shown in the footer and on the contact page.`); return; }
    setSaving(true);
    setError('');
    try {
      const { item } = await adminApi.save('settings', { id: row?.id, slug: 'site', status: 'published', data: { ...data, modified_on: new Date().toISOString() } });
      upsert(item);
      toast('ok', 'Contact details saved');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHead title="Contact & social" lead="Shown in the website footer and on the contact page."
        actions={<button className="adm-btn adm-btn-primary" disabled={!dirty || saving} onClick={save}>{saving && <Spinner />} Save changes</button>} />
      {(error || loadError) && <div className="mb-4"><ErrorNote>{error || loadError}</ErrorNote></div>}
      {data ? (
        <FieldGrid fields={SETTINGS_FIELDS} data={data} onChange={(k, v) => setData((d) => setPath(d || {}, k, v))} />
      ) : (
        <div className="h-72 adm-skeleton" />
      )}
    </div>
  );
}

export function AccountPage({ admin, onChange }: { admin: AdminUser; onChange: (a: AdminUser) => void }) {
  const toast = useToast();
  return (
    <div className="max-w-md">
      <PageHead title="Account" lead="Change the username or password used to sign in. Saving signs out every other device." />
      <PasswordForm username={admin.username} onDone={(a) => { onChange(a); toast('ok', 'Account updated'); }} />
      <section className="mt-10 pt-6 border-t border-[var(--adm-line)]">
        <h2 className="text-[15px] font-semibold">Backup</h2>
        <p className="mt-1 mb-3 text-[13.5px] text-[var(--adm-ink-3)]">Download everything on the website (stores, posts, sections, settings, inbox and the image list) as one file. Keep a copy before big changes.</p>
        <a className="adm-btn" href="/api/admin/items?collection=export" download><Download className="size-4" /> Download backup</a>
      </section>
    </div>
  );
}
