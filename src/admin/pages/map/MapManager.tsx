import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MousePointer2, Square, Hexagon, QrCode, Route, Undo2, Redo2, Save, ZoomIn, ZoomOut, Maximize, Layers, Image as ImageIcon, AlertTriangle, Store as StoreIcon, SlidersHorizontal,
} from 'lucide-react';
import type { FloorData, FloorId, MapPoint, QrPoint, RouteLeg, WayfindingLocation } from '../../../types/wayfinding';
import { CATEGORIES, FLOOR_LABELS } from '../../../types/wayfinding';
import { FLOOR_ORDER, isTransitCat, planRoute, unreachableFloors } from '../../../lib/mapRouter';
import { useCollection } from '../../lib/useCollection';
import { useAdminCategories } from '../../lib/useAdminCategories';
import { mapApi, MapVersion } from '../../lib/mapApi';
import { ErrorNote, Spinner, useToast } from '../../components/ui';
import type { ItemRow } from '../../lib/http';
import { EditorCanvas, EditorCanvasHandle, Selection, StoreMeta, Tool } from './EditorCanvas';
import {
  MapDoc, Placement, Rect, addUnit, assignStore, deleteUnits, mergeUnits, nextUnitId, patchUnits, renameUnit, splitNames, splitUnit,
  unmergeUnit, updateFloor, useMapDoc, vacate,
} from './mapDoc';
import { ChecksPanel, FloorPanel, MultiPanel, Problem, QrDetail, QrListPanel, StoresPanel, UnitPanel } from './Panels';
import { loadMap } from '../../../services/mapData';

const TOOLS: { id: Tool; label: string; key: string; icon: typeof Square; hint: string }[] = [
  { id: 'select', label: 'Select & move', key: 'V', icon: MousePointer2, hint: 'Drag the empty plan to move around. Click a unit to edit it, drag it to move, pull its corners to resize. Shift-click or Shift-drag to pick several.' },
  { id: 'draw', label: 'Draw unit', key: 'R', icon: Square, hint: 'Drag on the plan to draw a new unit. Edges snap to neighbours (hold Alt to stop snapping).' },
  { id: 'outline', label: 'Building outline', key: 'O', icon: Hexagon, hint: 'Drag corners to reshape. Click the plan to add a corner, double-click a corner to remove it.' },
  { id: 'qr', label: 'Place QR code', key: 'Q', icon: QrCode, hint: 'Click where a QR sign will hang. Drag it to move; drag the round handle to set which way people face.' },
  { id: 'route', label: 'Test directions', key: 'T', icon: Route, hint: 'Click a starting spot, then click a shop, to see the route visitors get.' },
];

type Tab = 'edit' | 'stores' | 'qr' | 'checks';

function useNarrow() {
  const q = '(max-width: 1023.98px)';
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setNarrow(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return narrow;
}

const toMeta = (r: ItemRow): StoreMeta => ({
  id: r.id, name: String(r.data.name || r.slug), slug: r.slug, cat: String(r.data.categorySlug || r.data.category || 'shop'),
  logo: r.data.logo?.data?.full_url || (typeof r.data.logo === 'string' ? r.data.logo : undefined),
});

export default function MapManager() {
  const { items: storeRows, error: storeError, replaceAll } = useCollection('stores');
  const [loaded, setLoaded] = useState<{ floors: Partial<Record<FloorId, FloorData>>; qr: Record<string, QrPoint>; scans: Record<string, number> } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    mapApi.load().then((r) => {
      const floors: Partial<Record<FloorId, FloorData>> = {};
      for (const f of r.floors) floors[f.id] = f.data;
      const qr: Record<string, QrPoint> = {};
      const scans: Record<string, number> = {};
      for (const q of r.qr) { qr[q.code] = { ...q.data, code: q.code }; scans[q.code] = q.scans; }
      setLoaded({ floors, qr, scans });
    }).catch((e) => setError(e.message));
  }, []);

  if (error || storeError) return <div className="p-6"><ErrorNote>{error || storeError}</ErrorNote></div>;
  if (!loaded || !storeRows) return <div className="h-[calc(100vh-56px)] lg:h-screen grid place-items-center"><Spinner className="size-5" /></div>;

  const place: Record<number, Placement> = {};
  for (const r of storeRows) place[r.id] = { floor: String(r.data.mapFloor || ''), units: Array.isArray(r.data.mapUnits) ? r.data.mapUnits.map(String) : [] };
  return <Editor initial={{ floors: loaded.floors, place, qr: loaded.qr }} scans={loaded.scans} storeRows={storeRows} onStoresSaved={replaceAll} />;
}

function Editor({ initial, scans, storeRows, onStoresSaved }: { initial: MapDoc; scans: Record<string, number>; storeRows: ItemRow[]; onStoresSaved: (rows: ItemRow[]) => void }) {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const { doc, saved, commit, undo, redo, canUndo, canRedo, changes, markSaved, reset } = useMapDoc(initial);
  const floorId = (FLOOR_ORDER.includes(params.get('floor') as FloorId) ? params.get('floor') : 'ground_floor') as FloorId;
  const setFloor = (f: FloorId) => { const n = new URLSearchParams(params); n.set('floor', f); setParams(n, { replace: true }); setSelection(null); setAligning(false); };
  const floor = doc.floors[floorId];
  const [tool, setTool] = useState<Tool>('select');
  const [showUnderlay, setShowUnderlay] = useState(true);
  const [aligning, setAligning] = useState(false);
  const [selection, setSelection] = useState<Selection>(null);
  const [tab, setTab] = useState<Tab>('edit');
  // Phones and small tablets: the side panel becomes a bottom sheet over the plan.
  const narrow = useNarrow();
  const [sheet, setSheet] = useState<'peek' | 'half' | 'full'>('peek');
  const openSheet = (to: 'half' | 'full' = 'half') => setSheet((s) => (s === 'full' ? s : to));
  const [placing, setPlacing] = useState<StoreMeta | null>(null);
  const [saving, setSaving] = useState(false);
  const [versions, setVersions] = useState<{ floor: FloorId; items: MapVersion[] } | null>(null);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [splitPreview, setSplitPreview] = useState<{ dir: 'vertical' | 'horizontal'; ratio: number } | null>(null);
  const NO_ROUTE = { start: null, startFloor: null, legs: [], key: '' };
  const [routeTest, setRouteTest] = useState<{ start: MapPoint | null; startFloor: FloorId | null; legs: RouteLeg[]; key: string; destLabel?: string }>(NO_ROUTE);
  const canvas = useRef<EditorCanvasHandle>(null);
  const cats = useAdminCategories();

  const stores = useMemo(() => storeRows.map(toMeta).sort((a, b) => a.name.localeCompare(b.name)), [storeRows]);
  const storeById = useMemo(() => new Map(stores.map((s) => [s.id, s])), [stores]);
  const colorOf = useCallback((cat: string) => cats.find(cat)?.color || CATEGORIES[cat]?.color || '#6b7280', [cats]);
  const floorName = useCallback((f: string) => FLOOR_LABELS[f as FloorId] || f, []);

  // ---- problems
  const problems = useMemo<Problem[]>(() => {
    const out: Problem[] = [];
    const unitsOn = (f: string) => new Set((doc.floors[f as FloorId]?.locations || []).map((l) => l.id.toLowerCase()));
    const cache = new Map<string, Set<string>>();
    const has = (f: string, u: string) => { if (!cache.has(f)) cache.set(f, unitsOn(f)); return cache.get(f)!.has(u.toLowerCase()); };
    const owners = new Map<string, number[]>();
    for (const s of stores) {
      const pl = doc.place[s.id];
      if (!pl?.floor) continue;
      const missing = pl.units.filter((u) => !has(pl.floor, u));
      if (missing.length) out.push({ level: 'error', text: `${s.name} is placed at ${missing.join(', ')} on ${floorName(pl.floor)}, which doesn't exist. Visitors can't get directions to it.`, storeId: s.id, floor: pl.floor as FloorId });
      for (const u of pl.units) { const k = `${pl.floor}:${u.toLowerCase()}`; owners.set(k, [...(owners.get(k) || []), s.id]); }
    }
    for (const [k, ids] of owners) if (ids.length > 1) {
      const [f, u] = k.split(':');
      out.push({ level: 'error', text: `${ids.map((i) => storeById.get(i)?.name).join(' and ')} share unit ${u.toUpperCase()} on ${floorName(f)}.`, floor: f as FloorId, units: [doc.floors[f as FloorId]?.locations.find((l) => l.id.toLowerCase() === u)?.id || u] });
    }
    for (const f of unreachableFloors(doc.floors)) out.push({ level: 'error', text: `${floorName(f)} has no lift or stairs linked to another floor, so nobody can be routed there. Set a unit's type to Lift or Stairs and give it the same name as on the floor below.`, floor: f });
    for (const f of FLOOR_ORDER) {
      const fl = doc.floors[f];
      if (fl && (fl.silhouette?.length || 0) < 3) out.push({ level: 'warn', text: `${floorName(f)} has no building outline. Draw one with the outline tool so routes stay inside the building.`, floor: f });
    }
    const unplaced = stores.filter((s) => !doc.place[s.id]?.floor || !doc.place[s.id].units.length).length;
    if (unplaced) out.push({ level: 'warn', text: `${unplaced} store${unplaced > 1 ? 's are' : ' is'} not on the map yet. Open Stores to place them.` });
    return out;
  }, [doc, stores, storeById, floorName]);
  const problemUnits = useMemo(() => new Set(problems.filter((p) => p.floor === floorId).flatMap((p) => p.units || []).map((u) => u.toLowerCase())), [problems, floorId]);
  const errorCount = problems.filter((p) => p.level === 'error').length;

  // ---- edits
  const selUnits = selection?.kind === 'units' ? selection.ids : [];
  const selectedUnit = selUnits.length === 1 && floor ? floor.locations.find((u) => u.id === selUnits[0]) || null : null;

  const onMoveUnits = (moves: { id: string; rect: Rect }[]) => commit((d) => updateFloor(d, floorId, (f) => ({ ...f, locations: f.locations.map((u) => { const m = moves.find((x) => x.id === u.id); return m ? { ...u, ...m.rect } : u; }) })));

  const onDrawn = (r: Rect) => {
    if (!floor) return;
    const id = nextUnitId(floor, 'U');
    commit((d) => addUnit(d, floorId, { id, cat: 'shop', ...r }));
    setSelection({ kind: 'units', ids: [id] });
    setTool('select');
    setTab('edit');
  };

  const onPlaceQr = (p: MapPoint) => {
    const prefix = ({ lower_ground_floor: 'LG', ground_floor: 'GF', first_floor: 'F1', second_floor: 'F2', third_floor: 'F3', fourth_floor: 'F4', fifth_floor: 'F5' } as const)[floorId];
    const used = new Set(Object.values(doc.qr).map((q) => q.code));
    let n = 1;
    while (used.has(`${prefix}-${String(n).padStart(2, '0')}`)) n++;
    const code = `${prefix}-${String(n).padStart(2, '0')}`;
    const key = `new:${Date.now()}`;
    commit((d) => ({ ...d, qr: { ...d.qr, [key]: { code, name: `${floorName(floorId)} point ${n}`, floorId, x: p.x, y: p.y, heading: null, note: '' } } }));
    setSelection({ kind: 'qr', key });
    setTool('select');
    setTab('qr');
  };

  const assignTo = (storeId: number, units: string[]) => {
    const prev = doc.place[storeId];
    commit((d) => assignStore(d, storeId, floorId, units));
    const s = storeById.get(storeId);
    if (s) toast('ok', prev?.floor && (prev.floor !== floorId || prev.units.join() !== units.join()) ? `${s.name} moved to ${units.join(' + ')} (was ${floorName(prev.floor)} ${prev.units.join(' + ')})` : `${s.name} is now in ${units.join(' + ')}`);
  };

  const deleteSelection = () => {
    if (selection?.kind === 'units' && selection.ids.length) {
      const occupied = selection.ids.filter((id) => Object.values(doc.place).some((pl) => pl.floor === floorId && pl.units.some((u) => u.toLowerCase() === id.toLowerCase())));
      if (occupied.length && !window.confirm(`${occupied.join(', ')} ${occupied.length > 1 ? 'have' : 'has'} a store assigned. Delete anyway? The store will show as "not on the map".`)) return;
      commit((d) => deleteUnits(d, floorId, selection.ids));
      setSelection(null);
    } else if (selection?.kind === 'qr') {
      const q = doc.qr[selection.key];
      if (q && !selection.key.startsWith('new:') && !window.confirm(`Delete QR point ${q.code}? Printed signs with this code will stop working.`)) return;
      commit((d) => { const qr = { ...d.qr }; delete qr[selection.key]; return { ...d, qr }; });
      setSelection(null);
    }
  };

  const nudge = (dx: number, dy: number) => {
    if (selection?.kind === 'units') commit((d) => patchUnits(d, floorId, selection.ids, (u) => ({ ...u, x: u.x + dx, y: u.y + dy })));
    if (selection?.kind === 'qr') commit((d) => ({ ...d, qr: { ...d.qr, [selection.key]: { ...d.qr[selection.key], x: d.qr[selection.key].x + dx, y: d.qr[selection.key].y + dy } } }));
  };

  const duplicate = () => {
    if (!floor || selection?.kind !== 'units') return;
    const ids: string[] = [];
    commit((d) => {
      let next = d;
      for (const id of selection.ids) {
        const u = next.floors[floorId]!.locations.find((l) => l.id === id);
        if (!u) continue;
        const nid = nextUnitId(next.floors[floorId]!, 'U');
        const { mergedFrom: _m, ...rest } = u;
        next = addUnit(next, floorId, { ...rest, id: nid, x: u.x + 30, y: u.y + 30 });
        ids.push(nid);
      }
      return next;
    });
    setTimeout(() => setSelection({ kind: 'units', ids }), 0);
  };

  // ---- test directions
  const onRouteClick = (p: MapPoint, unit: WayfindingLocation | null) => {
    if (!routeTest.start || routeTest.legs.length || !unit) {
      setRouteTest({ start: p, startFloor: floorId, legs: [], key: '' });
      return;
    }
    const occ = Object.entries(doc.place).find(([, pl]) => pl.floor === floorId && pl.units.some((u) => u.toLowerCase() === unit.id.toLowerCase()));
    const name = (occ && storeById.get(Number(occ[0]))?.name) || unit.name || unit.id;
    const r = planRoute(doc.floors, { floorId: routeTest.startFloor || floorId, ...routeTest.start }, { floorId, unitId: unit.id }, name);
    if (!r) { toast('error', `No walking route to ${name}. Check that it touches a corridor and that the floors are linked by lifts or stairs.`); return; }
    setRouteTest({ ...routeTest, legs: r.legs, key: String(Date.now()), destLabel: name });
    if (r.legs.length > 1) toast('ok', `Route uses ${r.legs.length} floors: ${r.legs.map((l) => floorName(l.floorId)).join(' → ')}. Switch floors to see each part.`);
  };

  // ---- save
  const save = useCallback(async () => {
    if (saving || !changes.count) return;
    setSaving(true);
    try {
      const floors: Partial<Record<FloorId, FloorData>> = {};
      for (const f of changes.floors) if (doc.floors[f]) floors[f] = doc.floors[f];
      const storeUpdates = changes.stores.map((id) => ({ id, mapFloor: doc.place[id].floor, mapUnits: doc.place[id].units }));
      if (changes.floors.length || storeUpdates.length) await mapApi.save(floors, storeUpdates);

      // QR points: create, update, rename, delete.
      const qr = { ...doc.qr };
      const newScans = { ...scans };
      for (const key of changes.qr) {
        const cur = doc.qr[key], old = saved.qr[key];
        if (!cur && old) { await mapApi.deleteQr(old.code); continue; }
        if (!cur) continue;
        const { code, ...data } = cur;
        await mapApi.saveQr(code, data, old && old.code !== code ? old.code : undefined);
        if (key !== code) { delete qr[key]; qr[code] = cur; newScans[code] = scans[key] ?? 0; }
      }
      const next = { ...doc, qr };
      if (selection?.kind === 'qr' && !qr[selection.key]) setSelection({ kind: 'qr', key: doc.qr[selection.key]?.code || selection.key });
      // Keep the Stores list elsewhere in the admin in step with the new placements.
      if (storeUpdates.length) onStoresSaved(storeRows.map((r) => (doc.place[r.id] && changes.stores.includes(r.id) ? { ...r, data: { ...r.data, mapFloor: doc.place[r.id].floor, mapUnits: doc.place[r.id].units } } : r)));
      if (Object.keys(qr).join() !== Object.keys(doc.qr).join()) reset(next); else markSaved(next);
      Object.assign(scans, newScans);
      setVersions(null);
      loadMap(true).catch(() => {});
      toast('ok', 'Saved. The live map updates within a minute.');
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }, [saving, changes, doc, saved, scans, selection, storeRows, onStoresSaved, reset, markSaved, toast]);

  // ---- keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t?.closest?.('input,textarea,select,[contenteditable]')) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); save(); return; }
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
      if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
      if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); duplicate(); return; }
      if (mod) return;
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelection(); return; }
      if (e.key === 'Escape') { setAligning(false); setSelection(null); setPlacing(null); setTool('select'); setRouteTest(NO_ROUTE); return; }
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowLeft') { e.preventDefault(); nudge(-step, 0); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); nudge(step, 0); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); nudge(0, -step); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); nudge(0, step); return; }
      const tl = TOOLS.find((x) => x.key.toLowerCase() === e.key.toLowerCase());
      if (tl) { setTool(tl.id); if (tl.id !== 'route') setRouteTest(NO_ROUTE); return; }
      if (e.key === '0') canvas.current?.fitFloor();
      if (e.key === '=' || e.key === '+') canvas.current?.zoomBy(1.4);
      if (e.key === '-') canvas.current?.zoomBy(1 / 1.4);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Don't lose work by closing the tab.
  useEffect(() => {
    if (!changes.count) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [changes.count]);

  const focusUnits = (f: FloorId, ids: string[]) => {
    if (f !== floorId) setFloor(f);
    setTimeout(() => {
      setSelection(ids.length ? { kind: 'units', ids } : null);
      const us = doc.floors[f]?.locations.filter((l) => ids.some((i) => i.toLowerCase() === l.id.toLowerCase())) || [];
      if (us.length) {
        const x0 = Math.min(...us.map((u) => u.x)), y0 = Math.min(...us.map((u) => u.y));
        const x1 = Math.max(...us.map((u) => u.x + u.w)), y1 = Math.max(...us.map((u) => u.y + u.h));
        const pad = 500;
        canvas.current?.flyToBox({ x: x0 - pad, y: y0 - pad, w: x1 - x0 + pad * 2, h: y1 - y0 + pad * 2 }, { ms: 550 });
      }
    }, f !== floorId ? 120 : 0);
  };

  // Phones: when the sheet opens over the plan, glide the picked unit into the part still visible.
  useEffect(() => {
    if (!narrow || sheet === 'peek' || selection?.kind !== 'units' || selection.ids.length !== 1) return;
    const u = doc.floors[floorId]?.locations.find((l) => l.id === selection.ids[0]);
    const svg = canvas.current?.svg();
    if (!u || !svg) return;
    const h = svg.getBoundingClientRect().height;
    const visible = h * (sheet === 'half' ? 0.48 : 0.15);
    const v = canvas.current!.view();
    const top = u.y * v.k + v.y, bottom = (u.y + u.h) * v.k + v.y;
    if (top > 64 && bottom < visible - 12) return;
    const c = { x: u.x + u.w / 2, y: u.y + u.h / 2 };
    canvas.current!.flyTo({ x: c.x, y: c.y + (h - visible) / 2 / v.k }, v.k, 420);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection, sheet, narrow]);

  const shaftNames = useMemo(() => [...new Set(FLOOR_ORDER.flatMap((f) => (doc.floors[f]?.locations || []).filter((l) => isTransitCat(l.cat)).map((l) => l.link || l.id)))].sort(), [doc.floors]);

  if (!floor) return <div className="p-6"><ErrorNote>This floor has no plan yet.</ErrorNote></div>;

  const splitOverlay = splitPreview && selectedUnit ? (() => {
    const u = selectedUnit;
    const x = u.x + u.w * splitPreview.ratio, y = u.y + u.h * splitPreview.ratio;
    return splitPreview.dir === 'vertical'
      ? <line x1={x} x2={x} y1={u.y - 10} y2={u.y + u.h + 10} stroke="#e0314b" strokeWidth={2.5} strokeDasharray="8 5" vectorEffect="non-scaling-stroke" />
      : <line y1={y} y2={y} x1={u.x - 10} x2={u.x + u.w + 10} stroke="#e0314b" strokeWidth={2.5} strokeDasharray="8 5" vectorEffect="non-scaling-stroke" />;
  })() : null;

  const qrSel = selection?.kind === 'qr' ? doc.qr[selection.key] : null;
  const activeTool = TOOLS.find((t) => t.id === tool)!;

  return (
    <div className="flex flex-col h-[calc(100dvh-56px)] lg:h-screen bg-[var(--adm-panel)]">
      {/* Top bar */}
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 h-14 bg-white border-b border-[var(--adm-line)] shrink-0">
        <h1 className="text-[15px] font-semibold whitespace-nowrap hidden xl:block">Map management</h1>
        <select className="md:hidden adm-input h-9 w-auto min-w-0 flex-1 font-medium" value={floorId} onChange={(e) => setFloor(e.target.value as FloorId)} aria-label="Floor">
          {FLOOR_ORDER.map((f) => {
            const bad = problems.some((p) => p.floor === f && p.level === 'error');
            return <option key={f} value={f}>{FLOOR_LABELS[f]}{changes.floors.includes(f) ? ' •' : ''}{bad ? ' ⚠' : ''}</option>;
          })}
        </select>
        <div className="hidden md:flex gap-0.5 p-0.5 rounded-lg bg-[var(--adm-panel)] overflow-x-auto adm-scroll min-w-0" role="tablist" aria-label="Floor">
          {FLOOR_ORDER.map((f) => {
            const dirty = changes.floors.includes(f);
            const bad = problems.some((p) => p.floor === f && p.level === 'error');
            return (
              <button key={f} role="tab" aria-selected={f === floorId} onClick={() => setFloor(f)}
                className={`relative h-8 px-3 rounded-md text-[12.5px] font-medium whitespace-nowrap transition-colors cursor-pointer ${f === floorId ? 'bg-white text-[var(--adm-ink)] shadow-[0_1px_2px_rgb(22_24_29/0.1)]' : 'text-[var(--adm-ink-2)] hover:text-[var(--adm-ink)]'}`}>
                {FLOOR_LABELS[f].replace(' Floor', '')}
                {(dirty || bad) && <span className={`absolute top-1 right-1 size-1.5 rounded-full ${bad ? 'bg-[var(--adm-danger)]' : 'bg-[var(--adm-accent)]'}`} />}
              </button>
            );
          })}
        </div>
        <div className="hidden md:block flex-1" />
        <button className="adm-btn adm-btn-ghost adm-btn-sm !px-2" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)" aria-label="Undo"><Undo2 className="size-4" /></button>
        <button className="adm-btn adm-btn-ghost adm-btn-sm !px-2" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)" aria-label="Redo"><Redo2 className="size-4" /></button>
        <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={save} disabled={!changes.count || saving} title="Save (Ctrl+S)">
          {saving ? <Spinner className="size-3.5" /> : <Save className="size-3.5" />}
          <span className="sm:hidden">{changes.count ? `Save (${changes.count})` : 'Saved'}</span>
          <span className="hidden sm:inline">{changes.count ? `Save ${changes.count} change${changes.count > 1 ? 's' : ''}` : 'Saved'}</span>
        </button>
      </div>

      <div className="relative flex-1 min-h-0 flex">
        {/* Tools: a rail on the left on desktop, a floating bar over the plan on phones */}
        <div className="z-20 bg-white flex items-center gap-1 lg:w-12 lg:shrink-0 lg:border-r lg:border-[var(--adm-line)] lg:flex-col lg:py-2 max-lg:absolute max-lg:top-2.5 max-lg:left-1/2 max-lg:-translate-x-1/2 max-lg:p-1 max-lg:rounded-xl max-lg:border max-lg:border-[var(--adm-line)] max-lg:shadow-[0_4px_14px_rgb(22_24_29/0.12)]">
          {TOOLS.map((t) => (
            <button key={t.id} onClick={() => { setTool(t.id); if (t.id !== 'route') setRouteTest(NO_ROUTE); }} title={`${t.label} (${t.key})`} aria-label={t.label} aria-pressed={tool === t.id}
              className={`grid place-items-center size-10 lg:size-9 rounded-lg transition-colors cursor-pointer ${tool === t.id ? 'bg-[var(--adm-accent)] text-white' : 'text-[var(--adm-ink-2)] hover:bg-[var(--adm-panel)]'}`}>
              <t.icon className="size-[18px]" />
            </button>
          ))}
          <div className="lg:flex-1 max-lg:w-px max-lg:h-6 max-lg:bg-[var(--adm-line)] max-lg:mx-0.5" />
          <button onClick={() => canvas.current?.zoomBy(1.4)} className="max-lg:hidden grid place-items-center size-9 rounded-lg text-[var(--adm-ink-2)] hover:bg-[var(--adm-panel)]" title="Zoom in (+)" aria-label="Zoom in"><ZoomIn className="size-[18px]" /></button>
          <button onClick={() => canvas.current?.zoomBy(1 / 1.4)} className="max-lg:hidden grid place-items-center size-9 rounded-lg text-[var(--adm-ink-2)] hover:bg-[var(--adm-panel)]" title="Zoom out (-)" aria-label="Zoom out"><ZoomOut className="size-[18px]" /></button>
          {floor?.underlay && (
            <button onClick={() => { setShowUnderlay((v) => !v); setAligning(false); }} aria-pressed={showUnderlay} title={showUnderlay ? 'Hide floor plan image' : 'Show floor plan image'} aria-label="Toggle floor plan image"
              className={`grid place-items-center size-9 rounded-lg transition-colors cursor-pointer ${showUnderlay ? 'bg-[var(--adm-accent-soft)] text-[var(--adm-accent)]' : 'text-[var(--adm-ink-2)] hover:bg-[var(--adm-panel)]'}`}><ImageIcon className="size-[18px]" /></button>
          )}
          <button onClick={() => canvas.current?.fitFloor()} className="grid place-items-center size-9 rounded-lg text-[var(--adm-ink-2)] hover:bg-[var(--adm-panel)]" title="Fit floor (0)" aria-label="Fit floor"><Maximize className="size-[18px]" /></button>
        </div>

        {/* Canvas */}
        <div className="relative flex-1 min-w-0 bg-[#eef0f4]">
          <EditorCanvas
            ref={canvas}
            floorId={floorId}
            floor={floor}
            doc={doc}
            stores={storeById}
            colorOf={colorOf}
            tool={tool}
            selection={selection}
            onSelect={(s) => { setSelection(s); if (s) { setTab(s.kind === 'qr' ? 'qr' : 'edit'); openSheet(); } else if (narrow) setSheet('peek'); }}
            onMoveUnits={onMoveUnits}
            onDrawn={onDrawn}
            onSilhouette={(pts) => commit((d) => updateFloor(d, floorId, (f) => ({ ...f, silhouette: pts })))}
            onPlaceQr={onPlaceQr}
            onMoveQr={(key, patch) => commit((d) => ({ ...d, qr: { ...d.qr, [key]: { ...d.qr[key], ...patch } } }))}
            onRouteClick={onRouteClick}
            placing={placing}
            onPlaceStore={(u) => {
              if (!placing) return;
              if (u.cat !== 'shop') { toast('error', `${u.id} isn't a shop unit.`); return; }
              assignTo(placing.id, [u.id]);
              setPlacing(null);
              setSelection({ kind: 'units', ids: [u.id] });
              setTab('edit');
            }}
            route={{ start: routeTest.startFloor === floorId ? routeTest.start : null, leg: routeTest.legs.find((l) => l.floorId === floorId) || null, key: `${routeTest.key}-${floorId}`, destLabel: routeTest.destLabel }}
            problemUnits={problemUnits}
            extra={splitOverlay}
            showUnderlay={showUnderlay}
            aligning={aligning && showUnderlay && !!floor.underlay}
            onUnderlay={(u) => commit((d) => updateFloor(d, floorId, (f) => ({ ...f, underlay: u })))}
          />
          {/* Phones: only show a hint when the next tap does something special. */}
          {(placing || aligning || tool !== 'select') && (
            <div className="lg:hidden absolute left-3 right-3 top-[64px] z-10 flex items-start gap-2 px-3 py-2 rounded-lg bg-[var(--adm-ink)]/90 text-white text-[12.5px] shadow-lg">
              <span className="flex-1">{aligning ? 'Drag the image to move it, pull a corner to scale it.' : placing ? `Tap a shop unit to place ${placing.name}.` : tool === 'route' ? (routeTest.start && !routeTest.legs.length ? 'Now tap the shop to walk to.' : 'Tap a starting spot, then a shop.') : tool === 'draw' ? 'Drag on the plan to draw a unit.' : tool === 'qr' ? 'Tap where the QR sign will hang.' : 'Drag corners to reshape; tap the plan to add a corner.'}</span>
              <button className="underline underline-offset-2 shrink-0" onClick={() => { setPlacing(null); setAligning(false); setTool('select'); setRouteTest(NO_ROUTE); }}>Done</button>
            </div>
          )}
          <div className="hidden lg:block pointer-events-none absolute left-3 bottom-3 max-w-md px-3 py-2 rounded-lg bg-white/95 border border-[var(--adm-line)] shadow-sm text-[12.5px] text-[var(--adm-ink-2)]">
            <b className="text-[var(--adm-ink)]">{activeTool.label}.</b> {aligning ? 'Aligning the floor plan image: drag it to move, pull a corner to scale it (Shift = stretch freely). Press Done when it lines up.' : placing ? `Click a shop unit to place ${placing.name}.` : tool === 'route' && routeTest.start && !routeTest.legs.length ? 'Now click the shop to walk to.' : activeTool.hint}
          </div>
        </div>

        {/* Side panel */}
        <aside
          className="bg-white flex flex-col min-h-0 max-lg:overflow-hidden lg:w-[300px] xl:w-[340px] lg:shrink-0 lg:border-l lg:border-[var(--adm-line)] max-lg:absolute max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-30 max-lg:rounded-t-2xl max-lg:border-t max-lg:border-[var(--adm-line)] max-lg:shadow-[0_-10px_30px_rgb(22_24_29/0.14)] max-lg:transition-[height] max-lg:duration-300 max-lg:ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={narrow ? { height: sheet === 'peek' ? 64 : sheet === 'half' ? '52%' : 'calc(100% - 8px)' } : undefined}
        >
          <button type="button" className="lg:hidden shrink-0 h-4 grid place-items-center cursor-pointer" onClick={() => setSheet((v) => (v === 'peek' ? 'half' : v === 'half' ? 'full' : 'peek'))} aria-label={sheet === 'peek' ? 'Open panel' : sheet === 'half' ? 'Expand panel' : 'Collapse panel'}>
            <span className="block w-10 h-1 rounded-full bg-[var(--adm-line-strong)]" />
          </button>
          <div className="flex border-b border-[var(--adm-line)] shrink-0" role="tablist">
            {([['edit', 'Edit', SlidersHorizontal], ['stores', 'Stores', StoreIcon], ['qr', 'QR codes', QrCode], ['checks', 'Checks', AlertTriangle]] as const).map(([k, l, Icon]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => { setTab(k); if (narrow) setSheet((v) => (v === 'peek' || tab === k ? (v === 'peek' ? 'half' : 'peek') : v)); }}
                className={`flex-1 flex items-center justify-center gap-1.5 h-11 text-[12.5px] font-medium border-b-2 -mb-px transition-colors cursor-pointer ${tab === k ? 'border-[var(--adm-accent)] text-[var(--adm-accent)]' : 'border-transparent text-[var(--adm-ink-2)] hover:text-[var(--adm-ink)]'}`}>
                <Icon className="size-4 lg:size-3.5" /> <span className="max-[359px]:sr-only">{l}</span>
                {k === 'checks' && errorCount > 0 && <span className="min-w-4 h-4 px-1 rounded-full bg-[var(--adm-danger)] text-white text-[10.5px] grid place-items-center">{errorCount}</span>}
              </button>
            ))}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto adm-scroll">
            {tab === 'edit' && (selectedUnit ? (
              <UnitPanel
                floorId={floorId} floor={floor} unit={selectedUnit} doc={doc} stores={stores} storeById={storeById} floorName={floorName} shaftNames={shaftNames}
                onPatch={(patch) => commit((d) => patchUnits(d, floorId, [selectedUnit.id], (u) => ({ ...u, ...patch })))}
                onRename={(to) => { commit((d) => renameUnit(d, floorId, selectedUnit.id, to)); setSelection({ kind: 'units', ids: [to] }); }}
                onAssign={(sid) => assignTo(sid, [selectedUnit.id])}
                onVacate={() => commit((d) => vacate(d, floorId, [selectedUnit.id]))}
                onSplit={(dir, ratio) => { const r = splitUnit(doc, floorId, selectedUnit.id, dir, ratio, splitNames(floor, selectedUnit.id)); if (r) { commit(r.doc); setSelection({ kind: 'units', ids: [r.ids[0]] }); toast('ok', `Split into ${r.ids.join(' and ')}`); } }}
                onSplitPreview={setSplitPreview}
                onUnmerge={() => { const r = unmergeUnit(doc, floorId, selectedUnit.id); if (r) { commit(r.doc); setSelection({ kind: 'units', ids: r.ids }); } }}
                onDuplicate={duplicate}
                onDelete={deleteSelection}
              />
            ) : selUnits.length > 1 ? (
              <MultiPanel
                units={floor.locations.filter((u) => selUnits.includes(u.id))} stores={stores}
                onMerge={() => { const r = mergeUnits(doc, floorId, selUnits); if (r) { commit(r.doc); setSelection({ kind: 'units', ids: [r.id] }); toast('ok', `Merged into ${r.id}`); } }}
                onGiveTo={(sid) => assignTo(sid, selUnits)}
                onDelete={deleteSelection}
                onClear={() => setSelection(null)}
              />
            ) : qrSel && selection?.kind === 'qr' ? (
              <QrDetail qrKey={selection.key} point={qrSel} scans={scans[selection.key]} floorName={floorName(qrSel.floorId)} dirty={changes.qr.includes(selection.key)}
                codeTaken={(c) => Object.entries(doc.qr).some(([k, q]) => k !== selection.key && q.code === c)}
                onChange={(patch) => commit((d) => ({ ...d, qr: { ...d.qr, [selection.key]: { ...d.qr[selection.key], ...patch } } }))}
                onDelete={deleteSelection} />
            ) : (
              <FloorPanel floorId={floorId} floor={floor} doc={doc} floorName={floorName(floorId)}
                versions={versions?.floor === floorId ? versions.items : null} loadingVersions={loadingVersions}
                onLoadVersions={() => { setLoadingVersions(true); mapApi.history(floorId).then((r) => setVersions({ floor: floorId, items: r.items })).catch((e) => toast('error', e.message)).finally(() => setLoadingVersions(false)); }}
                onRestore={async (id) => {
                  try {
                    const { version } = await mapApi.version(id);
                    commit((d) => ({ ...d, floors: { ...d.floors, [version.floor_id]: version.data } }));
                    toast('ok', 'Version loaded. Save to make it live.');
                  } catch (e) { toast('error', e instanceof Error ? e.message : 'Could not load'); }
                }}
                onUnderlay={(u) => { commit((d) => updateFloor(d, floorId, (f) => { const n = { ...f }; if (u) n.underlay = u; else delete n.underlay; return n; })); if (u) setShowUnderlay(true); else setAligning(false); }}
                aligning={aligning} onAlign={(v) => { setAligning(v); if (v) { setShowUnderlay(true); setTool('select'); setSelection(null); } }}
              />
            ))}
            {tab === 'stores' && (
              <StoresPanel stores={stores} doc={doc} floorName={floorName} placing={placing}
                unitExists={(f, u) => !!doc.floors[f as FloorId]?.locations.some((l) => l.id.toLowerCase() === u.toLowerCase())}
                onFocus={(s) => { const pl = doc.place[s.id]; if (pl?.floor) focusUnits(pl.floor as FloorId, pl.units); setTab('edit'); }}
                onPlace={(s) => { setPlacing(s); setTool('select'); if (s && narrow) setSheet('peek'); }} />
            )}
            {tab === 'qr' && (qrSel && selection?.kind === 'qr' ? (
              <>
                <button className="m-3 mb-0 adm-btn adm-btn-ghost adm-btn-sm" onClick={() => setSelection(null)}>← All QR codes</button>
                <QrDetail qrKey={selection.key} point={qrSel} scans={scans[selection.key]} floorName={floorName(qrSel.floorId)} dirty={changes.qr.includes(selection.key)}
                  codeTaken={(c) => Object.entries(doc.qr).some(([k, q]) => k !== selection.key && q.code === c)}
                  onChange={(patch) => commit((d) => ({ ...d, qr: { ...d.qr, [selection.key]: { ...d.qr[selection.key], ...patch } } }))}
                  onDelete={deleteSelection} />
              </>
            ) : (
              <QrListPanel doc={doc} scans={scans} floorName={floorName} dirty={changes.qr.length > 0}
                onAdd={() => { setTool('qr'); if (narrow) setSheet('peek'); toast('ok', narrow ? 'Tap the plan where the QR sign will hang.' : 'Click on the map where the QR sign will hang.'); }}
                onFocus={(key) => {
                  const q = doc.qr[key];
                  if (q.floorId !== floorId) setFloor(q.floorId);
                  setTimeout(() => { setSelection({ kind: 'qr', key }); canvas.current?.flyTo({ x: q.x, y: q.y }, 0.45, 550); }, q.floorId !== floorId ? 120 : 0);
                }} />
            ))}
            {tab === 'checks' && (
              <ChecksPanel problems={problems} onGo={(p) => {
                // A store pointing at a missing unit: go to its floor and let staff click the right unit.
                if (p.storeId != null) { const s = storeById.get(p.storeId); if (p.floor) setFloor(p.floor); if (s) setPlacing(s); setTool('select'); setTab('stores'); return; }
                if (p.floor) { if (p.units?.length) focusUnits(p.floor, p.units); else setFloor(p.floor); }
              }} />
            )}
          </div>
          <div className="max-lg:hidden shrink-0 border-t border-[var(--adm-line)] px-4 py-2 text-[11.5px] text-[var(--adm-ink-3)] flex items-center gap-1.5">
            <Layers className="size-3.5" /> {floor.locations.length} units on {floorName(floorId)} · changes go live when you save
          </div>
        </aside>
      </div>
    </div>
  );
}
