export type FormKind = 'contact' | 'rsvp' | 'leasing';

/**
 * Sends a public form to /api/forms; submissions land in the admin Inbox.
 * Throws an Error with a visitor-friendly message on failure.
 */
export async function submitForm(kind: FormKind, data: Record<string, unknown>, honeypot = ''): Promise<void> {
  let res: Response;
  try {
    res = await fetch('/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, data, website: honeypot }),
    });
  } catch {
    throw new Error('Could not reach the server. Please check your connection and try again.');
  }
  if (res.ok) return;
  const body = await res.json().catch(() => null);
  throw new Error(body?.error || 'Something went wrong. Please try again.');
}
