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

// 'blocks' holds one document per editable site section (hero, menus, page copy…), keyed by slug.
export const COLLECTIONS = ['stores', 'blogs', 'pages', 'events', 'offers', 'settings', 'blocks'] as const;
export type Collection = (typeof COLLECTIONS)[number];

export function isCollection(v: unknown): v is Collection {
  return typeof v === 'string' && (COLLECTIONS as readonly string[]).includes(v);
}

export const SUBMISSION_KINDS = ['contact', 'rsvp', 'leasing'] as const;

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
  `CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    kind TEXT NOT NULL,
    data JSONB NOT NULL,
    ip_hash TEXT,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS submissions_recent_idx ON submissions (created_at DESC)`,
  // Mall map: one document per floor (units, outline, "you are here"), edited in Map management.
  `CREATE TABLE IF NOT EXISTS map_floors (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  // Every saved version of a floor, so a bad edit can be rolled back.
  `CREATE TABLE IF NOT EXISTS map_history (
    id SERIAL PRIMARY KEY,
    floor_id TEXT NOT NULL,
    data JSONB NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS map_history_floor_idx ON map_history (floor_id, created_at DESC)`,
  // QR codes placed around the building: each one is a fixed "you are here" point.
  `CREATE TABLE IF NOT EXISTS map_qr (
    code TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    scans INTEGER NOT NULL DEFAULT 0,
    last_scan_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
];

/** Runs the idempotent schema. Cheap: every statement is IF NOT EXISTS. */
export async function ensureSchema() {
  const db = sql();
  for (const stmt of SCHEMA) await db.query(stmt);
}
