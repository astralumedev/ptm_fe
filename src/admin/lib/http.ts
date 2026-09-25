export class ApiError extends Error {
  constructor(message: string, public status: number, public needsSetup = false) {
    super(message);
  }
}

export async function request<T>(url: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  const res = await fetch(url, {
    credentials: 'same-origin',
    ...rest,
    headers: { ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...rest.headers },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  const isJson = res.headers.get('content-type')?.includes('json');
  const data = isJson ? await res.json() : null;
  if (!res.ok) {
    const message = data?.error || (res.status === 404 ? 'The API is not reachable. Run the site with `vercel dev` or deploy it.' : `Request failed (${res.status})`);
    throw new ApiError(message, res.status, Boolean(data?.needsSetup));
  }
  if (!isJson) throw new ApiError('The API is not reachable. Run the site with `vercel dev` or deploy it.', 502);
  return data as T;
}

export interface AdminUser {
  username: string;
  mustChange: boolean;
}

export interface ItemRow<T = Record<string, any>> {
  id: number;
  slug: string;
  status: 'published' | 'draft';
  sort: number;
  data: T;
  updated_at: string;
}

export interface MediaRecord {
  id: number;
  hash: string;
  url: string;
  pathname: string;
  thumb_url: string | null;
  width: number | null;
  height: number | null;
  size: number | null;
  name: string | null;
  created_at: string;
}

export const adminApi = {
  me: () => request<{ admin: AdminUser | null }>('/api/auth'),
  login: (username: string, password: string) =>
    request<{ admin: AdminUser }>('/api/auth', { method: 'POST', json: { action: 'login', username, password } }),
  logout: () => request('/api/auth', { method: 'POST', json: { action: 'logout' } }),
  changePassword: (current: string, next: string) =>
    request<{ admin: AdminUser }>('/api/auth', { method: 'POST', json: { action: 'password', current, next } }),

  setupStatus: () => request<{ ready: boolean }>('/api/admin/setup'),
  runSetup: () => request<{ createdAdmin: boolean; seeded: number }>('/api/admin/setup', { method: 'POST' }),

  counts: () => request<{ counts: { collection: string; status: string; n: number }[] }>('/api/admin/items?collection=counts'),
  list: (collection: string) => request<{ items: ItemRow[] }>(`/api/admin/items?collection=${collection}`),
  save: (collection: string, row: { id?: number; slug: string; status: string; data: Record<string, unknown> }) =>
    request<{ item: ItemRow }>('/api/admin/items', { method: 'POST', json: { collection, ...row } }),
  remove: (id: number) => request(`/api/admin/items?id=${id}`, { method: 'DELETE' }),

  media: () => request<{ items: MediaRecord[] }>('/api/admin/media'),
  mediaByHash: (hash: string) => request<{ media: MediaRecord | null }>(`/api/admin/media?hash=${hash}`),
  registerMedia: (m: Partial<MediaRecord>) => request<{ media: MediaRecord }>('/api/admin/media', { method: 'POST', json: m }),
  removeMedia: (id: number) => request(`/api/admin/media?id=${id}`, { method: 'DELETE' }),
};
