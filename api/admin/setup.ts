import { sql, ensureSchema, COLLECTIONS } from '../_lib/db';
import { route, noStore } from '../_lib/http';
import { currentAdmin, hashPassword } from '../_lib/auth';
import seed from '../_lib/seed.json';
import { seedMap } from '../_lib/map';

type SeedItem = Record<string, unknown>;

// Pages whose addresses are served by dedicated, block-driven pages; their rows edit nothing.
const SUPERSEDED_PAGES = ['about_us', 'privacy_policy', 'homepage_intro'];

async function tablesExist() {
  const rows = (await sql()`SELECT to_regclass('public.admins') AS t`) as { t: string | null }[];
  return rows[0]?.t != null;
}

/**
 * GET: reports whether the database is initialised.
 * POST: brings the database up to date. Idempotent and safe to run on every sign-in:
 *   - creates missing tables
 *   - creates the first admin when there is none
 *   - seeds every collection that is still empty
 *   - adds any site section (block) the database does not have yet, so all content lives in the CMS
 *   - removes page rows superseded by dedicated pages
 *   - loads the mall map floors and QR points on first run
 * Open while no admin exists (first run); afterwards requires a signed-in admin.
 */
export default route(async (req, res) => {
  noStore(res);
  const db = sql();
  const ready = await tablesExist();
  const adminCount = ready ? Number(((await db`SELECT count(*)::int AS n FROM admins`) as { n: number }[])[0].n) : 0;

  if (req.method === 'GET') return res.json({ ready: ready && adminCount > 0 });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (adminCount > 0 && !(await currentAdmin(req))) return res.status(401).json({ error: 'Not signed in' });

  await ensureSchema();

  let createdAdmin = false;
  if (adminCount === 0) {
    const hash = await hashPassword(process.env.ADMIN_PASSWORD || 'admin');
    await db`INSERT INTO admins (username, password_hash, must_change) VALUES (${process.env.ADMIN_USERNAME || 'ptm'}, ${hash}, true) ON CONFLICT (username) DO NOTHING`;
    createdAdmin = true;
  }

  const data = seed as unknown as Record<string, SeedItem[]>;
  const counts = (await db`SELECT collection, count(*)::int AS n FROM content GROUP BY 1`) as { collection: string; n: number }[];
  const has = new Map(counts.map((c) => [c.collection, c.n]));
  let seeded = 0;

  for (const collection of COLLECTIONS) {
    const items = data[collection] || [];
    // Blocks are topped up individually; other collections only seed when empty,
    // so content staff deleted on purpose never comes back.
    if (collection !== 'blocks' && has.get(collection)) continue;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const slug = collection === 'settings' ? 'site' : String(item.slug || item.id);
      const status = String(item.status || 'published');
      const rows = await db`INSERT INTO content (collection, slug, status, sort, data)
        VALUES (${collection}, ${slug}, ${status}, ${i}, ${JSON.stringify(item)}::jsonb)
        ON CONFLICT (collection, slug) DO NOTHING RETURNING id`;
      seeded += rows.length;
    }
  }

  const removed = await db`DELETE FROM content WHERE collection = 'pages' AND slug = ANY(${SUPERSEDED_PAGES}) RETURNING id`;

  const map = await seedMap();

  res.json({ ok: true, createdAdmin, seeded, removed: removed.length, map });
});
