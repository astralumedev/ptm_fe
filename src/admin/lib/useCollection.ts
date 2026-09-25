import { useCallback, useEffect, useState } from 'react';
import { adminApi, ItemRow } from './http';

// Per-session cache so moving between list and editor never refetches.
const cache = new Map<string, ItemRow[]>();

export function useCollection(key: string) {
  const [items, setItems] = useState<ItemRow[] | null>(cache.get(key) || null);
  const [error, setError] = useState('');

  const reload = useCallback(() => {
    setError('');
    adminApi.list(key).then((r) => { cache.set(key, r.items); setItems(r.items); }).catch((e) => setError(e.message));
  }, [key]);

  useEffect(() => {
    setItems(cache.get(key) || null);
    if (!cache.has(key)) reload();
  }, [key, reload]);

  const upsert = (row: ItemRow) => {
    const list = cache.get(key) || [];
    const next = list.some((r) => r.id === row.id) ? list.map((r) => (r.id === row.id ? row : r)) : [row, ...list];
    cache.set(key, next);
    setItems(next);
  };
  const remove = (id: number) => {
    const next = (cache.get(key) || []).filter((r) => r.id !== id);
    cache.set(key, next);
    setItems(next);
  };

  return { items, error, reload, upsert, remove };
}

export const clearCollectionCache = () => cache.clear();
