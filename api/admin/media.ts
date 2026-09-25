import { handleUploadPresigned, type HandleUploadPresignedBody } from '@vercel/blob/client';
import { del, issueSignedToken } from '@vercel/blob';
import { sql } from '../_lib/db';
import { route, body, noStore } from '../_lib/http';
import { currentAdmin, requireAdmin } from '../_lib/auth';

const ALLOWED = ['image/webp', 'image/jpeg', 'image/avif'];
const MAX_BYTES = 4 * 1024 * 1024;

/**
 * Media library. Images are compressed to WebP in the browser, uploaded straight to Blob
 * (the file never passes through this function), then registered here by content hash so
 * the same image is never stored twice.
 */
export default route(async (req, res) => {
  noStore(res);
  const db = sql();

  if (req.method === 'POST') {
    const b = body<Record<string, unknown>>(req);

    // Presigned URL exchange for @vercel/blob/client uploadPresigned(). Works with the
    // OIDC-connected store (BLOB_STORE_ID), no read-write token needed.
    if (typeof b.type === 'string' && b.type.startsWith('blob.')) {
      const result = await handleUploadPresigned({
        body: b as unknown as HandleUploadPresignedBody,
        request: req,
        getSignedToken: async (pathname) => {
          if (!(await currentAdmin(req))) throw new Error('Not signed in');
          if (!/^media\/[a-f0-9]{32}(-t)?\.(webp|jpg|avif)$/.test(pathname)) throw new Error('Invalid path');
          const limits = { allowedContentTypes: ALLOWED, maximumSizeInBytes: MAX_BYTES };
          const token = await issueSignedToken({ pathname, operations: ['put'], validUntil: Date.now() + 10 * 60_000, ...limits });
          return {
            token,
            urlOptions: {
              ...limits,
              addRandomSuffix: false,
              allowOverwrite: true, // pathname is the content hash, so an overwrite is the same bytes
              cacheControlMaxAge: 60 * 60 * 24 * 365,
            },
          };
        },
      });
      return res.json(result);
    }

    if (!(await requireAdmin(req, res))) return;
    const hash = String(b.hash || '');
    if (!/^[a-f0-9]{16,64}$/.test(hash) || typeof b.url !== 'string' || typeof b.pathname !== 'string') {
      return res.status(400).json({ error: 'Invalid media record' });
    }
    const rows = await db`INSERT INTO media (hash, url, pathname, thumb_url, thumb_pathname, width, height, size, name)
      VALUES (${hash}, ${b.url}, ${b.pathname}, ${(b.thumb_url as string) || null}, ${(b.thumb_pathname as string) || null},
        ${Number(b.width) || null}, ${Number(b.height) || null}, ${Number(b.size) || null}, ${String(b.name || '').slice(0, 200)})
      ON CONFLICT (hash) DO UPDATE SET name = COALESCE(NULLIF(EXCLUDED.name, ''), media.name)
      RETURNING *`;
    return res.json({ media: rows[0] });
  }

  if (!(await requireAdmin(req, res))) return;

  if (req.method === 'GET') {
    if (typeof req.query.hash === 'string') {
      const rows = await db`SELECT * FROM media WHERE hash = ${req.query.hash}`;
      return res.json({ media: rows[0] || null });
    }
    return res.json({ items: await db`SELECT * FROM media ORDER BY created_at DESC LIMIT 500` });
  }

  if (req.method === 'DELETE') {
    const id = Number(req.query.id);
    const rows = (await db`DELETE FROM media WHERE id = ${id} RETURNING url, thumb_url`) as { url: string; thumb_url: string | null }[];
    if (rows[0]) {
      const urls = [rows[0].url, rows[0].thumb_url].filter(Boolean) as string[];
      await del(urls).catch((e) => console.error('blob delete failed', e));
    }
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
});
