import { neon, NeonQueryFunction } from '@neondatabase/serverless';

let client: NeonQueryFunction<false, false> | null = null;

// HTTP driver: no pooled connections to keep warm, one round trip per query.
export function sql() {
  if (!client) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new Error('DATABASE_URL is not set');
    client = neon(url);
  }
  return client;
}

export const COLLECTIONS = ['stores', 'blogs', 'pages', 'events', 'offers', 'settings'] as const;
export type Collection = (typeof COLLECTIONS)[number];

export function isCollection(v: unknown): v is Collection {
  return typeof v === 'string' && (COLLECTIONS as readonly string[]).includes(v);
}

export const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS content (
    id SERIAL PRIMARY KEY,
    collection TEXT NOT NULL,
    slug TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'published',
    sort INTEGER NOT NULL DEFAULT 0,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (collection, slug)
  )`,
  `CREATE INDEX IF NOT EXISTS content_public_idx ON content (collection, status, sort)`,
  `CREATE TABLE IF NOT EXISTS media (
    id SERIAL PRIMARY KEY,
    hash TEXT UNIQUE NOT NULL,
    url TEXT NOT NULL,
    pathname TEXT NOT NULL,
    thumb_url TEXT,
    thumb_pathname TEXT,
    width INTEGER,
    height INTEGER,
    size INTEGER,
    name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    must_change BOOLEAN NOT NULL DEFAULT true,
    pw_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
];
