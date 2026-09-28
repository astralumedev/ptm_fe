import { useEffect, useState } from 'react';
import type { FloorData, FloorId, QrPoint } from '../types/wayfinding';

export interface MapBundle {
  floors: Partial<Record<FloorId, FloorData>>;
  qr: QrPoint[];
}

let cached: MapBundle | null = null;
let inflight: Promise<MapBundle> | null = null;

/** Floor plans and QR points, fetched once per page load (the edge caches /api/map). */
export function loadMap(force = false): Promise<MapBundle> {
  if (cached && !force) return Promise.resolve(cached);
  if (!inflight || force) {
    inflight = fetch('/api/map', { headers: { Accept: 'application/json' } })
      .then((r) => {
        if (!r.ok) throw new Error(`Map unavailable (${r.status})`);
        return r.json();
      })
      .then((b: MapBundle) => {
        cached = { floors: b.floors || {}, qr: Array.isArray(b.qr) ? b.qr : [] };
        return cached;
      })
      .finally(() => { inflight = null; });
  }
  return inflight;
}

export function useMapData() {
  const [data, setData] = useState<MapBundle | null>(cached);
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    loadMap().then((b) => live && setData(b)).catch((e) => live && setError(e.message));
    return () => { live = false; };
  }, []);
  return { data, error };
}

/** Counts a QR scan; never blocks or fails the page. */
export function countScan(code: string) {
  try {
    const url = `/api/map?scan=${encodeURIComponent(code)}`;
    if (navigator.sendBeacon?.(url)) return;
    fetch(url, { method: 'POST', keepalive: true }).catch(() => {});
  } catch { /* offline */ }
}
