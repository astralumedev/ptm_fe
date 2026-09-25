import { sql } from './_lib/db';
import { route, body, noStore } from './_lib/http';
import { currentAdmin, verifyPassword, hashPassword, setSession, clearSession, Admin } from './_lib/auth';

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default route(async (req, res) => {
  noStore(res);

  if (req.method === 'GET') {
    const admin = await currentAdmin(req);
    return res.json({ admin: admin ? { username: admin.username, mustChange: admin.must_change } : null });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const b = body<{ action?: string; username?: string; password?: string; current?: string; next?: string }>(req);

  if (b.action === 'login') {
    const username = String(b.username || '').trim().toLowerCase();
    const rows = (await sql()`SELECT id, username, must_change, pw_version, password_hash FROM admins WHERE username = ${username}`) as Admin[];
    const admin = rows[0];
    if (!admin || !(await verifyPassword(String(b.password || ''), admin.password_hash))) {
      await pause(600); // slows down guessing
      return res.status(401).json({ error: 'Username or password is incorrect' });
    }
    setSession(res, admin.id, admin.pw_version);
    return res.json({ admin: { username: admin.username, mustChange: admin.must_change } });
  }

  if (b.action === 'logout') {
    clearSession(res);
    return res.json({ ok: true });
  }

  if (b.action === 'password') {
    const admin = await currentAdmin(req);
    if (!admin) return res.status(401).json({ error: 'Not signed in' });
    if (!(await verifyPassword(String(b.current || ''), admin.password_hash))) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    const next = String(b.next || '');
    const renameOnly = !next && b.username !== undefined && !admin.must_change;
    if (!renameOnly) {
      if (next.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });
      if (next === b.current) return res.status(400).json({ error: 'New password must be different from the current one' });
    }
    const username = b.username === undefined ? admin.username : String(b.username).trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,32}$/.test(username)) return res.status(400).json({ error: 'Username must be 3–32 characters: letters, numbers, dots, dashes or underscores' });
    const taken = (await sql()`SELECT id FROM admins WHERE username = ${username} AND id <> ${admin.id}`) as { id: number }[];
    if (taken.length) return res.status(400).json({ error: 'That username is already taken' });
    const hash = renameOnly ? admin.password_hash : await hashPassword(next);
    const rows = (await sql()`UPDATE admins SET username = ${username}, password_hash = ${hash}, must_change = false, pw_version = pw_version + 1
      WHERE id = ${admin.id} RETURNING pw_version`) as { pw_version: number }[];
    setSession(res, admin.id, rows[0].pw_version);
    return res.json({ admin: { username, mustChange: false } });
  }

  res.status(400).json({ error: 'Unknown action' });
});
