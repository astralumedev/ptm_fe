import { useCallback, useMemo, useRef, useState } from 'react';
import type { FloorData, FloorId, QrPoint, WayfindingLocation } from '../../../types/wayfinding';
import { FLOOR_ORDER } from '../../../lib/mapRouter';

/** Where a store sits on the map (mirrors the store's mapFloor / mapUnits fields). */
export interface Placement { floor: string; units: string[] }

/** Everything Map management edits, saved together with one button. */
export interface MapDoc {
  floors: Partial<Record<FloorId, FloorData>>;
  /** Store row id -> placement. */
  place: Record<number, Placement>;
  /** Keyed by the code the point was loaded with (or a temporary key for new points). */
  qr: Record<string, QrPoint>;
}

export type Rect = { x: number; y: number; w: number; h: number };

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

// ---------------------------------------------------------------------------------------------
// Pure edits. Each returns a new document; untouched floors keep their identity (cheap undo, and
// the save only sends floors that really changed).

export function updateFloor(doc: MapDoc, floor: FloorId, fn: (f: FloorData) => FloorData): MapDoc {
  const cur = doc.floors[floor];
  if (!cur) return doc;
  return { ...doc, floors: { ...doc.floors, [floor]: fn(cur) } };
}

export function patchUnits(doc: MapDoc, floor: FloorId, ids: string[], fn: (u: WayfindingLocation) => WayfindingLocation): MapDoc {
  return updateFloor(doc, floor, (f) => ({ ...f, locations: f.locations.map((u) => (ids.includes(u.id) ? fn(u) : u)) }));
}

/** Stores placed on `floor` in any of `units`. */
export function storesIn(doc: MapDoc, floor: string, units: string[]): number[] {
  return Object.entries(doc.place).filter(([, p]) => p.floor === floor && p.units.some((u) => units.some((x) => same(u, x)))).map(([id]) => Number(id));
}

export function renameUnit(doc: MapDoc, floor: FloorId, from: string, to: string): MapDoc {
  let next = patchUnits(doc, floor, [from], (u) => ({ ...u, id: to }));
  const place = { ...next.place };
  for (const [id, p] of Object.entries(place)) {
    if (p.floor === floor && p.units.some((u) => same(u, from))) place[Number(id)] = { ...p, units: p.units.map((u) => (same(u, from) ? to : u)) };
  }
  next = { ...next, place };
  return next;
}

export function deleteUnits(doc: MapDoc, floor: FloorId, ids: string[]): MapDoc {
  const next = updateFloor(doc, floor, (f) => ({ ...f, locations: f.locations.filter((u) => !ids.includes(u.id)) }));
  return { ...next, place: dropUnits(next.place, floor, ids) };
}

function dropUnits(place: MapDoc['place'], floor: string, ids: string[]) {
  const out = { ...place };
  for (const [id, p] of Object.entries(out)) {
    if (p.floor !== floor || !p.units.some((u) => ids.some((x) => same(u, x)))) continue;
    const units = p.units.filter((u) => !ids.some((x) => same(u, x)));
    out[Number(id)] = units.length ? { ...p, units } : { floor: '', units: [] };
  }
  return out;
}

/** Puts a store in exactly these units (moving it off wherever it was). Anyone else in them is moved out. */
export function assignStore(doc: MapDoc, storeId: number, floor: FloorId, units: string[]): MapDoc {
  const place = dropUnits(doc.place, floor, units);
  place[storeId] = { floor, units: [...units] };
  return { ...doc, place };
}

export function vacate(doc: MapDoc, floor: FloorId, units: string[]): MapDoc {
  return { ...doc, place: dropUnits(doc.place, floor, units) };
}

export function nextUnitId(floor: FloorData, base = 'U'): string {
  const taken = new Set(floor.locations.map((l) => l.id.toLowerCase()));
  for (let i = 1; i < 10000; i++) {
    const id = `${base}${String(i).padStart(2, '0')}`;
    if (!taken.has(id.toLowerCase())) return id;
  }
  return `${base}${Date.now()}`;
}

export function addUnit(doc: MapDoc, floor: FloorId, unit: WayfindingLocation): MapDoc {
  return updateFloor(doc, floor, (f) => ({ ...f, locations: [...f.locations, unit] }));
}

/** Two or more units become one (bounding box). The originals are kept so it can be undone later. */
export function mergeUnits(doc: MapDoc, floor: FloorId, ids: string[]): { doc: MapDoc; id: string } | null {
  const f = doc.floors[floor];
  if (!f || ids.length < 2) return null;
  const parts = f.locations.filter((u) => ids.includes(u.id));
  const x0 = Math.min(...parts.map((u) => u.x)), y0 = Math.min(...parts.map((u) => u.y));
  const x1 = Math.max(...parts.map((u) => u.x + u.w)), y1 = Math.max(...parts.map((u) => u.y + u.h));
  const first = parts[0];
  // Re-joining halves of a split ("A108-A" + "A108-B") gets the original id back.
  const stem = parts.every((u) => /-[A-Z0-9]$/i.test(u.id)) ? parts[0].id.replace(/-[A-Z0-9]$/i, '') : '';
  const stemFree = stem && parts.every((u) => u.id.startsWith(stem + '-')) && !f.locations.some((l) => !ids.includes(l.id) && same(l.id, stem));
  const mergedId = stemFree ? stem : first.id;
  const originals = parts.flatMap((u) => (u.mergedFrom?.length ? u.mergedFrom : [{ ...u, mergedFrom: undefined }]));
  const merged: WayfindingLocation = {
    id: mergedId, cat: first.cat, x: x0, y: y0, w: x1 - x0, h: y1 - y0,
    ...(first.block ? { block: first.block } : {}),
    area: sumArea(parts),
    mergedFrom: originals.map(({ mergedFrom: _m, ...u }) => u),
  };
  let next = updateFloor(doc, floor, (fl) => {
    const idx = fl.locations.findIndex((u) => u.id === first.id);
    const rest = fl.locations.filter((u) => !ids.includes(u.id));
    rest.splice(Math.min(idx, rest.length), 0, stemFree ? { ...merged, mergedFrom: undefined } : merged);
    return { ...fl, locations: rest };
  });
  // Whoever occupied any part now occupies the merged unit.
  const owners = storesIn(doc, floor, ids);
  const place = dropUnits(next.place, floor, ids);
  if (owners[0] != null) place[owners[0]] = { floor, units: [...(place[owners[0]]?.floor === floor ? place[owners[0]].units : []), merged.id] };
  next = { ...next, place };
  return { doc: next, id: merged.id };
}

function sumArea(parts: WayfindingLocation[]) {
  const nums = parts.map((u) => parseFloat(String(u.area || '').replace(/,/g, ''))).filter((n) => Number.isFinite(n));
  return nums.length === parts.length && nums.length ? `${Math.round(nums.reduce((a, b) => a + b, 0) * 100) / 100} sq.ft` : undefined;
}

export function unmergeUnit(doc: MapDoc, floor: FloorId, id: string): { doc: MapDoc; ids: string[] } | null {
  const f = doc.floors[floor];
  const u = f?.locations.find((l) => l.id === id);
  if (!f || !u?.mergedFrom?.length) return null;
  const taken = new Set(f.locations.filter((l) => l.id !== id).map((l) => l.id.toLowerCase()));
  const parts = u.mergedFrom.map((p) => (taken.has(p.id.toLowerCase()) ? { ...p, id: `${p.id}-${Math.random().toString(36).slice(2, 5)}` } : p));
  let next = updateFloor(doc, floor, (fl) => {
    const idx = fl.locations.findIndex((l) => l.id === id);
    const rest = fl.locations.filter((l) => l.id !== id);
    rest.splice(idx, 0, ...parts);
    return { ...fl, locations: rest };
  });
  // The store stays in all the parts.
  const owners = storesIn(doc, floor, [id]);
  const place = dropUnits(next.place, floor, [id]);
  if (owners[0] != null) place[owners[0]] = { floor, units: parts.map((p) => p.id) };
  next = { ...next, place };
  return { doc: next, ids: parts.map((p) => p.id) };
}

/** Cuts a unit in two, vertically (side by side) or horizontally (one above the other). */
export function splitUnit(doc: MapDoc, floor: FloorId, id: string, dir: 'vertical' | 'horizontal', ratio: number, names: [string, string]): { doc: MapDoc; ids: [string, string] } | null {
  const f = doc.floors[floor];
  const u = f?.locations.find((l) => l.id === id);
  if (!f || !u) return null;
  const r = Math.max(0.1, Math.min(0.9, ratio));
  const { mergedFrom: _m, ...base } = u;
  const a: WayfindingLocation = dir === 'vertical'
    ? { ...base, id: names[0], w: Math.round(u.w * r) }
    : { ...base, id: names[0], h: Math.round(u.h * r) };
  const b: WayfindingLocation = dir === 'vertical'
    ? { ...base, id: names[1], x: u.x + a.w, w: u.w - a.w }
    : { ...base, id: names[1], y: u.y + a.h, h: u.h - a.h };
  delete a.area; delete b.area; delete a.dims; delete b.dims;
  let next = updateFloor(doc, floor, (fl) => {
    const idx = fl.locations.findIndex((l) => l.id === id);
    const rest = fl.locations.filter((l) => l.id !== id);
    rest.splice(idx, 0, a, b);
    return { ...fl, locations: rest };
  });
  // The current tenant keeps the first half; the second half is vacant.
  const owners = storesIn(doc, floor, [id]);
  const place = dropUnits(next.place, floor, [id]);
  if (owners[0] != null) place[owners[0]] = { floor, units: [...(place[owners[0]]?.floor === floor ? place[owners[0]].units : []), a.id] };
  next = { ...next, place };
  return { doc: next, ids: [a.id, b.id] };
}

export function splitNames(floor: FloorData, id: string): [string, string] {
  const taken = new Set(floor.locations.filter((l) => l.id !== id).map((l) => l.id.toLowerCase()));
  for (const [p, q] of [['A', 'B'], ['1', '2'], ['X', 'Y']]) {
    const a = `${id}-${p}`, b = `${id}-${q}`;
    if (!taken.has(a.toLowerCase()) && !taken.has(b.toLowerCase())) return [a, b];
  }
  return [`${id}-${Date.now() % 1000}`, `${id}-${(Date.now() + 1) % 1000}`];
}

// ---------------------------------------------------------------------------------------------
// Undoable document state

export function useMapDoc(initial: MapDoc) {
  const [doc, setDoc] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const past = useRef<MapDoc[]>([]);
  const future = useRef<MapDoc[]>([]);
  const [, bump] = useState(0);

  const commit = useCallback((next: MapDoc | ((d: MapDoc) => MapDoc)) => {
    setDoc((cur) => {
      const n = typeof next === 'function' ? next(cur) : next;
      if (n === cur) return cur;
      past.current.push(cur);
      if (past.current.length > 150) past.current.shift();
      future.current = [];
      bump((x) => x + 1);
      return n;
    });
  }, []);

  const undo = useCallback(() => {
    setDoc((cur) => {
      const p = past.current.pop();
      if (!p) return cur;
      future.current.push(cur);
      bump((x) => x + 1);
      return p;
    });
  }, []);
  const redo = useCallback(() => {
    setDoc((cur) => {
      const n = future.current.pop();
      if (!n) return cur;
      past.current.push(cur);
      bump((x) => x + 1);
      return n;
    });
  }, []);

  const changes = useMemo(() => {
    const floors = FLOOR_ORDER.filter((f) => doc.floors[f] !== saved.floors[f]);
    const stores = Object.keys(doc.place).map(Number).filter((id) => {
      const a = doc.place[id], b = saved.place[id];
      return !b || a.floor !== b.floor || a.units.join('|') !== b.units.join('|');
    });
    const qrKeys = new Set([...Object.keys(doc.qr), ...Object.keys(saved.qr)]);
    const qr = [...qrKeys].filter((k) => doc.qr[k] !== saved.qr[k]);
    return { floors, stores, qr, count: floors.length + stores.length + qr.length };
  }, [doc, saved]);

  return {
    doc, saved, commit, undo, redo,
    canUndo: past.current.length > 0, canRedo: future.current.length > 0,
    changes,
    markSaved: (d: MapDoc) => setSaved(d),
    reset: (d: MapDoc) => { past.current = []; future.current = []; setDoc(d); setSaved(d); },
  };
}
