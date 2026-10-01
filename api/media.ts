import { Readable } from 'stream';
import { get } from '@vercel/blob';
import { route } from './_lib/http';
import { MEDIA_PATH } from './_lib/media';

/**
 * GET /media/<hash>.webp — serves an uploaded image from the private Blob store.
 * Files are named by their content hash, so they never change: the browser and Vercel's CDN keep
 * them for a year and this function only runs the first time each image is requested.
 */
export default route(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(405).end();
  const pathname = String(req.query.p || '');
  if (!MEDIA_PATH.test(pathname)) return res.status(404).end();

  const file = await get(pathname, { access: 'private' });
  if (!file || file.statusCode !== 200) {
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(404).end();
  }
  res.setHeader('Content-Type', file.blob.contentType || 'image/webp');
  if (file.blob.size) res.setHeader('Content-Length', String(file.blob.size));
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('CDN-Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method === 'HEAD') return res.status(200).end();
  res.status(200);
  Readable.fromWeb(file.stream as unknown as import('stream/web').ReadableStream).pipe(res);
});
