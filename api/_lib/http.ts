import type { VercelRequest, VercelResponse } from '@vercel/node';

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<unknown>;

export function route(handler: Handler) {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      await handler(req, res);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(err);
      if (!res.headersSent) {
        const missingTables = /relation "[^"]+" does not exist/.test(message);
        res.status(missingTables ? 503 : 500).json({ error: missingTables ? 'Database not initialised' : message, needsSetup: missingTables || undefined });
      }
    }
  };
}

export function body<T = Record<string, unknown>>(req: VercelRequest): T {
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body) as T; } catch { return {} as T; }
  }
  return (req.body || {}) as T;
}

export function noStore(res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
}
