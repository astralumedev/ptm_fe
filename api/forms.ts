import { createHash } from 'crypto';
import { sql, ensureSchema, SUBMISSION_KINDS } from './_lib/db';
import { route, body, noStore } from './_lib/http';

type Kind = (typeof SUBMISSION_KINDS)[number];

// Only these fields are stored per form, each trimmed and length-capped.
const FIELDS: Record<Kind, Record<string, number>> = {
  contact: { name: 120, email: 160, phone: 40, subject: 160, message: 4000 },
  rsvp: { name: 120, email: 160, phone: 40, guests: 4, eventId: 120, eventTitle: 200, note: 1000 },
  leasing: { name: 120, email: 160, phone: 40, business: 160, category: 120, size: 60, message: 4000 },
};
const REQUIRED: Record<Kind, string[]> = {
  contact: ['name', 'email', 'message'],
  rsvp: ['name', 'eventId'],
  leasing: ['name', 'phone', 'business'],
};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LIMIT_PER_10_MIN = 5;

/** Public form submissions (contact, event RSVP, leasing enquiries), read in the admin Inbox. */
export default route(async (req, res) => {
  noStore(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const b = body<Record<string, unknown>>(req);
  const kind = b.kind as Kind;
  if (!SUBMISSION_KINDS.includes(kind)) return res.status(400).json({ error: 'Unknown form' });
  // Honeypot: real visitors never see or fill this field.
  if (b.website) return res.json({ ok: true });

  const input = (b.data && typeof b.data === 'object' ? b.data : {}) as Record<string, unknown>;
  const data: Record<string, string> = {};
  for (const [key, max] of Object.entries(FIELDS[kind])) {
    const v = input[key];
    if (v !== undefined && v !== null && String(v).trim()) data[key] = String(v).trim().slice(0, max);
  }
  const missing = REQUIRED[kind].filter((k) => !data[k]);
  if (missing.length) return res.status(400).json({ error: `Please fill in: ${missing.join(', ')}` });
  if (data.email && !EMAIL.test(data.email)) return res.status(400).json({ error: 'Please enter a valid email address' });
  if (kind === 'rsvp' && !data.email && !data.phone) return res.status(400).json({ error: 'Please add an email or phone number' });

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  const ipHash = createHash('sha256').update('ptm-forms:' + ip).digest('hex').slice(0, 24);

  const insert = async () => {
    const db = sql();
    const recent = (await db`SELECT count(*)::int AS n FROM submissions
      WHERE ip_hash = ${ipHash} AND created_at > now() - interval '10 minutes'`) as { n: number }[];
    if (recent[0].n >= LIMIT_PER_10_MIN) return false;
    await db`INSERT INTO submissions (kind, data, ip_hash) VALUES (${kind}, ${JSON.stringify(data)}::jsonb, ${ipHash})`;
    return true;
  };

  let ok: boolean;
  try {
    ok = await insert();
  } catch (e) {
    // First submission after a deploy that added the table.
    if (!/does not exist/.test(String(e))) throw e;
    await ensureSchema();
    ok = await insert();
  }
  if (!ok) return res.status(429).json({ error: 'Too many submissions. Please try again in a few minutes.' });
  res.json({ ok: true });
});
