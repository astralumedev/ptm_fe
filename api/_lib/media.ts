/**
 * The project's Blob store is private, so its file URLs (https://<store>.private.blob.vercel-storage.com/…)
 * answer 403 to browsers. Images are served through /media/<file> instead (see api/media.ts), and any
 * private URL that reaches a response is rewritten to that address.
 */
const PRIVATE_BLOB = /https:\/\/[a-z0-9]+\.private\.blob\.vercel-storage\.com\/(media\/)/gi;

export const MEDIA_PATH = /^media\/[a-f0-9]{32}(-t)?\.(webp|jpg|avif)$/;

/** "https://x.private.blob.vercel-storage.com/media/a.webp" -> "/media/a.webp" (works on strings and JSON text). */
export const publicMedia = (text: string) => text.replace(PRIVATE_BLOB, '/$1');

/** SQL that rewrites stored private URLs in place (idempotent). */
export const PRIVATE_BLOB_SQL = 'https://[a-z0-9]+\.private\.blob\.vercel-storage\.com/media/';
