import type { FloorId } from '../types/wayfinding';

/**
 * The visitor's current trip, kept on their phone only. A printed QR code can't know where someone
 * is going, so the destination lives here: scan code A, pick Zara, walk, scan code B, and the map
 * picks up the same trip from B.
 */
export interface Trip {
  floorId: FloorId;
  unitId: string;
  storeSlug?: string;
  name: string;
  startedAt: number;
}

const KEY = 'ptm-map-trip';
const MAX_AGE = 3 * 60 * 60 * 1000; // a mall visit, not forever

export function getTrip(): Trip | null {
  try {
    const t = JSON.parse(localStorage.getItem(KEY) || 'null') as Trip | null;
    if (!t || !t.unitId || Date.now() - t.startedAt > MAX_AGE) return null;
    return t;
  } catch {
    return null;
  }
}

export function saveTrip(t: Omit<Trip, 'startedAt'>) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...t, startedAt: Date.now() })); } catch { /* private mode */ }
}

export function clearTrip() {
  try { localStorage.removeItem(KEY); } catch { /* private mode */ }
}
