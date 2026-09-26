import { sql, isCollection, ensureSchema } from '../_lib/db';
import { route, body, noStore } from '../_lib/http';
import { requireAdmin } from '../_lib/auth';

const SLUG = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;

/** Retries once after creating tables that a newer deploy introduced. */
async function withSchema<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (!/does not exist/.test(String(e))) throw e;
    await ensureSchema();
    return fn();
  }
}

/** CRUD for every content collection, list ordering, and the form-submission inbox. */
export default route(async (req, res) => {
  noStore(res);
  if (!(await requireAdmin(req, res))) return;
  const db = sql();
  const collection = req.query.collection;

  // ---- Inbox (form submissions) ----
  if (collection === 'submissions') {
    if (req.method === 'GET') {
      const items = await withSchema(() => db`SELECT id, kind, data, read, created_at FROM submissions ORDER BY created_at DESC LIMIT 500`);
      return res.json({ items });
    }
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'Missing id' });
    if (req.method === 'PATCH') {
      const b = body<{ read?: boolean }>(req);
      await db`UPDATE submissions SET read = ${b.read !== false} WHERE id = ${id}`;
      return res.json({ ok: true });
    }
    if (req.method === 'DELETE') {
      await db`DELETE FROM submissions WHERE id = ${id}`;
      return res.json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.method === 'GET') {
    // Full backup of everything staff have entered (content, inbox, media index).
    if (collection === 'export') {
      const [content, submissions, media] = await Promise.all([
        db`SELECT collection, slug, status, sort, data, created_at, updated_at FROM content ORDER BY collection, sort, id`,
        withSchema(() => db`SELECT kind, data, read, created_at FROM submissions ORDER BY created_at`),
        db`SELECT url, thumb_url, width, height, size, name, created_at FROM media ORDER BY created_at`,
      ]);
      const stamp = new Date().toISOString().slice(0, 10);
      res.setHeader('Content-Disposition', `attachment; filename="ptm-backup-${stamp}.json"`);
      return res.json({ exportedAt: new Date().toISOString(), content, submissions, media });
    }
    if (collection === 'counts') {
      const counts = await db`SELECT collection, status, count(*)::int AS n FROM content GROUP BY 1, 2`;
      const unread = (await withSchema(() => db`SELECT count(*)::int AS n FROM submissions WHERE read = false`)) as { n: number }[];
      return res.json({ counts, unread: unread[0]?.n || 0 });
    }
    if (!isCollection(collection)) return res.status(400).json({ error: 'Unknown collection' });
    const items = await db`SELECT id, slug, status, sort, data, updated_at FROM content
      WHERE collection = ${collection} ORDER BY sort ASC, id ASC`;
    return res.json({ items });
  }

  if (req.method === 'POST') {
    const b = body<{ action?: string; ids?: number[]; collection?: string; id?: number; slug?: string; status?: string; data?: Record<string, unknown> }>(req);
    if (!isCollection(b.collection)) return res.status(400).json({ error: 'Unknown collection' });

    // Persist a new order for a whole collection in one statement.
    if (b.action === 'reorder') {
      const ids = (Array.isArray(b.ids) ? b.ids : []).map(Number).filter(Boolean);
      if (!ids.length) return res.status(400).json({ error: 'Missing ids' });
      await db`UPDATE content c SET sort = o.ord - 1
        FROM unnest(${ids}::int[]) WITH ORDINALITY AS o(id, ord)
        WHERE c.id = o.id AND c.collection = ${b.collection}`;
      return res.json({ ok: true });
    }

    const slug = String(b.slug || '').trim();
    if (!SLUG.test(slug)) return res.status(400).json({ error: 'The web address may only use lowercase letters, numbers, hyphens and underscores' });
    const status = b.status === 'draft' ? 'draft' : 'published';
    if (!b.data || typeof b.data !== 'object') return res.status(400).json({ error: 'Missing data' });
    const data = JSON.stringify(b.data);
    if (data.length > 900_000) return res.status(413).json({ error: 'This item is too large to save' });

    const clash = (await db`SELECT id FROM content WHERE collection = ${b.collection} AND slug = ${slug}`) as { id: number }[];
    if (clash[0] && clash[0].id !== b.id) {
      // Site sections are singletons: saving one that already exists updates it.
      if (b.collection !== 'blocks') return res.status(409).json({ error: `Another item already uses the web address "${slug}"` });
      b.id = clash[0].id;
    }

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
