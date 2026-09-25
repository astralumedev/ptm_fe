import { sql, isCollection } from '../_lib/db';
import { route, body, noStore } from '../_lib/http';
import { requireAdmin } from '../_lib/auth';

const SLUG = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;

/** CRUD for every content collection. */
export default route(async (req, res) => {
  noStore(res);
  if (!(await requireAdmin(req, res))) return;
  const db = sql();

  if (req.method === 'GET') {
    const collection = req.query.collection;
    if (collection === 'counts') {
      return res.json({ counts: await db`SELECT collection, status, count(*)::int AS n FROM content GROUP BY 1, 2` });
    }
    if (!isCollection(collection)) return res.status(400).json({ error: 'Unknown collection' });
    const items = await db`SELECT id, slug, status, sort, data, updated_at FROM content
      WHERE collection = ${collection} ORDER BY sort ASC, id ASC`;
    return res.json({ items });
  }

  if (req.method === 'POST') {
    const b = body<{ collection?: string; id?: number; slug?: string; status?: string; data?: Record<string, unknown> }>(req);
    if (!isCollection(b.collection)) return res.status(400).json({ error: 'Unknown collection' });
    const slug = String(b.slug || '').trim();
    if (!SLUG.test(slug)) return res.status(400).json({ error: 'Slug may only use lowercase letters, numbers, hyphens and underscores' });
    const status = b.status === 'draft' ? 'draft' : 'published';
    if (!b.data || typeof b.data !== 'object') return res.status(400).json({ error: 'Missing data' });
    const data = JSON.stringify(b.data);

    const clash = (await db`SELECT id FROM content WHERE collection = ${b.collection} AND slug = ${slug}`) as { id: number }[];
    if (clash[0] && clash[0].id !== b.id) return res.status(409).json({ error: `Another item already uses the slug "${slug}"` });

    const rows = b.id
      ? await db`UPDATE content SET slug = ${slug}, status = ${status}, data = ${data}::jsonb, updated_at = now()
          WHERE id = ${b.id} AND collection = ${b.collection} RETURNING id, slug, status, sort, data, updated_at`
      : await db`INSERT INTO content (collection, slug, status, sort, data)
          VALUES (${b.collection}, ${slug}, ${status},
            (SELECT COALESCE(MIN(sort), 0) - 1 FROM content WHERE collection = ${b.collection}), ${data}::jsonb)
          RETURNING id, slug, status, sort, data, updated_at`;
    if (!rows[0]) return res.status(404).json({ error: 'Item not found' });
    return res.json({ item: rows[0] });
  }

  if (req.method === 'DELETE') {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'Missing id' });
    await db`DELETE FROM content WHERE id = ${id} AND collection <> 'settings'`;
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
});
