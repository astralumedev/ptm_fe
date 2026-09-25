import { uploadPresigned } from '@vercel/blob/client';
import { adminApi, MediaRecord } from './http';

/**
 * Everything is shrunk in the browser before it touches Blob storage:
 * resized to the largest size the site ever shows, re-encoded as WebP, plus a small thumbnail
 * for the admin grid. Files are named by content hash, so re-uploading the same image is free.
 */
export type ImagePreset = 'logo' | 'cover' | 'content';

const MAX_EDGE: Record<ImagePreset, number> = { logo: 512, cover: 1920, content: 1600 };
const QUALITY = 0.8;
const THUMB_EDGE = 400;
const MAX_INPUT_BYTES = 30 * 1024 * 1024;

interface Encoded { blob: Blob; width: number; height: number }

async function encode(source: ImageBitmap, maxEdge: number, quality: number): Promise<Encoded> {
  const scale = Math.min(1, maxEdge / Math.max(source.width, source.height));
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser cannot process images');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, width, height);
  const toBlob = (type: string) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, quality));
  // Older Safari cannot encode WebP and silently returns PNG; fall back to JPEG there.
  let blob = await toBlob('image/webp');
  if (!blob || blob.type !== 'image/webp') blob = await toBlob('image/jpeg');
  if (!blob) throw new Error('Could not compress this image');
  return { blob, width, height };
}

async function hashOf(blob: Blob) {
  const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
  return Array.from(new Uint8Array(digest).slice(0, 16), (b) => b.toString(16).padStart(2, '0')).join('');
}

const extOf = (type: string) => (type === 'image/webp' ? 'webp' : type === 'image/avif' ? 'avif' : 'jpg');

export interface UploadProgress { stage: 'compressing' | 'uploading' | 'done'; percent: number }

export async function uploadImage(file: File, preset: ImagePreset, onProgress?: (p: UploadProgress) => void): Promise<MediaRecord> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') throw new Error('Please choose a JPG, PNG, WebP or AVIF image');
  if (file.size > MAX_INPUT_BYTES) throw new Error('That image is over 30 MB. Please pick a smaller one.');

  onProgress?.({ stage: 'compressing', percent: 0 });
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => {
    throw new Error('This image format could not be read. Try saving it as JPG or PNG.');
  });

  let large = await encode(bitmap, MAX_EDGE[preset], QUALITY);
  // Keep an already-optimised original if our re-encode would be bigger.
  const fitsAlready = Math.max(bitmap.width, bitmap.height) <= MAX_EDGE[preset];
  if (fitsAlready && (file.type === 'image/webp' || file.type === 'image/avif') && file.size < large.blob.size) {
    large = { blob: file, width: bitmap.width, height: bitmap.height };
  }
  const thumb = Math.max(large.width, large.height) > THUMB_EDGE ? await encode(bitmap, THUMB_EDGE, 0.72) : null;
  bitmap.close();

  const hash = await hashOf(large.blob);
  const existing = await adminApi.mediaByHash(hash);
  if (existing.media) {
    onProgress?.({ stage: 'done', percent: 100 });
    return existing.media;
  }

  onProgress?.({ stage: 'uploading', percent: 0 });
  const total = large.blob.size + (thumb?.blob.size || 0);
  let sentLarge = 0;
  const put = (pathname: string, blob: Blob, offset: () => number) =>
    uploadPresigned(pathname, blob, {
      access: 'public',
      handleUploadUrl: '/api/admin/media',
      contentType: blob.type,
      onUploadProgress: (e) => onProgress?.({ stage: 'uploading', percent: Math.round(((offset() + e.loaded) / total) * 100) }),
    });

  const main = await put(`media/${hash}.${extOf(large.blob.type)}`, large.blob, () => 0);
  sentLarge = large.blob.size;
  const small = thumb ? await put(`media/${hash}-t.${extOf(thumb.blob.type)}`, thumb.blob, () => sentLarge) : null;

  const { media } = await adminApi.registerMedia({
    hash,
    url: main.url,
    pathname: main.pathname,
    thumb_url: small?.url || null,
    thumb_pathname: small?.pathname || null,
    width: large.width,
    height: large.height,
    size: total,
    name: file.name,
  } as Partial<MediaRecord>);
  onProgress?.({ stage: 'done', percent: 100 });
  return media;
}

export function formatBytes(n: number | null | undefined) {
  if (!n) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
