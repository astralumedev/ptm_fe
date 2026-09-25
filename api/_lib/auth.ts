import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual, createHash } from 'crypto';
import { promisify } from 'util';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './db';

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;
const COOKIE = 'ptm_admin';
const MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  // Falls back to a key derived from the DB URL so the panel works before SESSION_SECRET is set.
  const s = process.env.SESSION_SECRET || createHash('sha256').update('ptm:' + (process.env.DATABASE_URL || process.env.POSTGRES_URL || '')).digest('hex');
  return s;
}

export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const key = await scrypt(pw, salt, 64);
  return `${salt.toString('hex')}:${key.toString('hex')}`;
}

export async function verifyPassword(pw: string, stored: string) {
  const [saltHex, keyHex] = stored.split(':');
  if (!saltHex || !keyHex) return false;
  const key = await scrypt(pw, Buffer.from(saltHex, 'hex'), 64);
  const expected = Buffer.from(keyHex, 'hex');
  return expected.length === key.length && timingSafeEqual(expected, key);
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function setSession(res: VercelResponse, id: number, pwVersion: number) {
  const payload = Buffer.from(JSON.stringify({ id, v: pwVersion, exp: Date.now() + MAX_AGE * 1000 })).toString('base64url');
  const token = `${payload}.${sign(payload)}`;
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${MAX_AGE}${process.env.VERCEL ? '; Secure' : ''}`);
}

export function clearSession(res: VercelResponse) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0`);
}

function readToken(req: VercelRequest) {
  const raw = req.headers.cookie || '';
  const match = raw.split(/;\s*/).find((c) => c.startsWith(COOKIE + '='));
  if (!match) return null;
  const [payload, sig] = match.slice(COOKIE.length + 1).split('.');
  if (!payload || !sig) return null;
  const good = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (good.length !== given.length || !timingSafeEqual(good, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return null;
    return data as { id: number; v: number };
  } catch {
    return null;
  }
}

export interface Admin {
  id: number;
  username: string;
  must_change: boolean;
  pw_version: number;
  password_hash: string;
}

export async function currentAdmin(req: VercelRequest): Promise<Admin | null> {
  const tok = readToken(req);
  if (!tok) return null;
  const rows = (await sql()`SELECT id, username, must_change, pw_version, password_hash FROM admins WHERE id = ${tok.id}`) as Admin[];
  const admin = rows[0];
  // Changing the password bumps pw_version, which signs out every other session.
  if (!admin || admin.pw_version !== tok.v) return null;
  return admin;
}

/** Returns the admin or sends 401 and returns null. */
export async function requireAdmin(req: VercelRequest, res: VercelResponse) {
  const admin = await currentAdmin(req);
  if (!admin) {
    res.status(401).json({ error: 'Not signed in' });
    return null;
  }
  return admin;
}
