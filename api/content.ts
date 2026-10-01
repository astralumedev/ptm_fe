import { createHash } from 'crypto';
import { sql, COLLECTIONS } from './_lib/db';
import { route } from './_lib/http';
import { publicMedia } from './_lib/media';

interface Row { id: number; collection: string; slug: string; status: string; data: Record<string, unknown> }

// Collections whose records use the DB row id as their numeric id.
const NUMERIC_IDS = new Set(['stores', 'blogs', 'pages', 'settings', 'blocks']);

/**
 * Public, read-only bundle of every published record in one response.
 * One query, cached at Vercel's edge, so the database only wakes when the cache refreshes.
 */
export default route(async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const rows = (await sql()`
    SELECT id, collection, slug, status, data FROM content
    WHERE status = 'published' ORDER BY sort ASC, id ASC`) as Row[];

  const bundle: Record<string, unknown[]> = Object.fromEntries(COLLECTIONS.map((c) => [c, []]));
  for (const r of rows) {
    const item = { ...r.data, slug: r.slug, status: r.status, id: NUMERIC_IDS.has(r.collection) ? r.id : r.slug };
    bundle[r.collection]?.push(item);
  }

  const json = publicMedia(JSON.stringify(bundle));
  const etag = '"' + createHash('sha1').update(json).digest('base64url') + '"';
  res.setHeader('ETag', etag);
  // Browser revalidates; the edge serves for 60s and keeps serving stale for a day while refreshing.
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.setHeader('CDN-Cache-Control', 'public, s-maxage=60, stale-while-revalidate=86400');
  if (req.headers['if-none-match'] === etag) return res.status(304).end();
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).send(json);
});
