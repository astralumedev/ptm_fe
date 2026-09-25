import { sql, SCHEMA, COLLECTIONS } from '../_lib/db';
import { route, noStore } from '../_lib/http';
import { currentAdmin, hashPassword } from '../_lib/auth';
import seed from '../_lib/seed.json';

async function tablesExist() {
  const rows = (await sql()`SELECT to_regclass('public.admins') AS t`) as { t: string | null }[];
  return rows[0]?.t != null;
}

/**
 * GET: reports whether the database is initialised.
 * POST: creates tables, the default `admin` user and seeds content from the bundled data.
 * Open while no admin exists (first run); afterwards requires a signed-in admin. Idempotent.
 */
export default route(async (req, res) => {
  noStore(res);
  const db = sql();
  const ready = await tablesExist();
  const adminCount = ready ? Number(((await db`SELECT count(*)::int AS n FROM admins`) as { n: number }[])[0].n) : 0;

  if (req.method === 'GET') return res.json({ ready: ready && adminCount > 0 });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (adminCount > 0 && !(await currentAdmin(req))) return res.status(401).json({ error: 'Not signed in' });

  for (const stmt of SCHEMA) await db.query(stmt);

  let createdAdmin = false;
  if (adminCount === 0) {
    const hash = await hashPassword(process.env.ADMIN_PASSWORD || 'admin');
    await db`INSERT INTO admins (username, password_hash, must_change) VALUES (${process.env.ADMIN_USERNAME || 'ptm'}, ${hash}, true) ON CONFLICT (username) DO NOTHING`;
    createdAdmin = true;
  }

  const existing = Number(((await db`SELECT count(*)::int AS n FROM content`) as { n: number }[])[0].n);
  let seeded = 0;
  if (existing === 0) {
    const data = seed as unknown as Record<string, Record<string, unknown>[]>;
    for (const collection of COLLECTIONS) {
      const items = data[collection] || [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const slug = collection === 'settings' ? 'site' : String(item.slug || item.id);
        const status = String(item.status || 'published');
        await db`INSERT INTO content (collection, slug, status, sort, data)
          VALUES (${collection}, ${slug}, ${status}, ${i}, ${JSON.stringify(item)}::jsonb)
          ON CONFLICT (collection, slug) DO NOTHING`;
        seeded++;
      }
    }
  }

  res.json({ ok: true, createdAdmin, seeded });
});
