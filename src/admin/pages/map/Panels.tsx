import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowRightLeft, Combine, Copy, Download, ExternalLink, Link2, MapPin, Printer, QrCode,
  RotateCcw, RotateCw, Scissors, Search, Split, Store, Trash2, Ungroup, X, History, Check,
} from 'lucide-react';
import type { FloorData, FloorId, QrPoint, WayfindingLocation } from '../../../types/wayfinding';
import { isTransitCat } from '../../../lib/mapRouter';
import type { MapDoc } from './mapDoc';
import type { StoreMeta } from './EditorCanvas';
import { downloadPng, downloadSvg, printSigns, qrSvg, qrUrl } from '../../lib/qr';
import type { MapVersion } from '../../lib/mapApi';
import { relativeTime, Spinner } from '../../components/ui';
import { ImageInput } from '../../components/media';

export const UNIT_TYPES: { value: string; label: string; hint?: string }[] = [
  { value: 'shop', label: 'Shop unit' },
  { value: 'restroom', label: 'Restroom' },
  { value: 'elevator', label: 'Lift' },
  { value: 'stairs', label: 'Stairs' },
  { value: 'service', label: 'Service / staff area' },
  { value: 'atrium', label: 'Atrium (walkable)', hint: 'Visitors can walk through it.' },
  { value: 'corridor', label: 'Open walkway (walkable)', hint: 'Visitors can walk through it.' },
  { value: 'entrance', label: 'Entrance lobby (walkable)', hint: 'Visitors can walk through it.' },
  { value: 'void', label: 'Void / opening to floor below' },
];

// ---------------------------------------------------------------------------------------------
// Small building blocks

export function Section({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="px-4 py-4 border-b border-[var(--adm-line)] last:border-b-0">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--adm-ink-3)]">{title}</h3>
        {actions}
      </div>
      {children}
    </section>
  );
}

function Row({ label, children, htmlFor }: { label: string; children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1 text-[12.5px] text-[var(--adm-ink-2)] font-medium">
      {label}
      {children}
    </label>
  );
}

/** Text input that only reports on blur/Enter, so typing an id doesn't rename on every key. */
function LazyInput({ value, onCommit, validate, ...rest }: { value: string; onCommit: (v: string) => void; validate?: (v: string) => string | null } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  const [v, setV] = useState(value);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { setV(value); setErr(null); }, [value]);
  const commit = () => {
    const t = v.trim();
    if (t === value) return;
    const e = validate?.(t) ?? null;
    setErr(e);
    if (!e) onCommit(t);
  };
  return (
    <>
      <input {...rest} className="adm-input h-8 text-[13px]" value={v} aria-invalid={!!err}
        onChange={(e) => setV(e.target.value)} onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') { commit(); (e.target as HTMLInputElement).blur(); } if (e.key === 'Escape') { setV(value); setErr(null); (e.target as HTMLInputElement).blur(); } e.stopPropagation(); }} />
      {err && <span className="text-[12px] text-[var(--adm-danger)] font-normal">{err}</span>}
    </>
  );
}

function NumInput({ value, onCommit, label }: { value: number; onCommit: (v: number) => void; label: string }) {
  return (
    <label className="flex items-center gap-1.5 h-8 px-2 rounded-[7px] border border-[var(--adm-line-strong)] bg-white focus-within:border-[var(--adm-accent)] text-[12px] text-[var(--adm-ink-3)]">
      <span className="w-3 font-semibold">{label}</span>
      <LazyNum value={value} onCommit={onCommit} />
    </label>
  );
}
function LazyNum({ value, onCommit }: { value: number; onCommit: (v: number) => void }) {
  const [v, setV] = useState(String(value));
  useEffect(() => setV(String(value)), [value]);
  const commit = () => { const n = Math.round(Number(v)); if (Number.isFinite(n) && n !== value) onCommit(n); else setV(String(value)); };
  return <input className="w-full min-w-0 bg-transparent outline-none text-[13px] text-[var(--adm-ink)] tabular-nums" inputMode="numeric" value={v}
    onChange={(e) => setV(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); e.stopPropagation(); }} />;
}

/** Searchable store picker. */
export function StorePicker({ stores, onPick, placeholder = 'Find a store…', exclude, autoFocus }: { stores: StoreMeta[]; onPick: (s: StoreMeta) => void; placeholder?: string; exclude?: number[]; autoFocus?: boolean }) {
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return stores.filter((s) => !exclude?.includes(s.id) && (!t || s.name.toLowerCase().includes(t))).slice(0, 40);
  }, [q, stores, exclude]);
  return (
    <div className="rounded-lg border border-[var(--adm-line)] bg-white">
      <div className="relative border-b border-[var(--adm-line)]">
        <Search className="absolute left-2.5 top-2.5 size-4 text-[var(--adm-ink-3)] pointer-events-none" />
        <input autoFocus={autoFocus} className="w-full h-9 pl-8 pr-3 bg-transparent rounded-t-lg focus:outline-none text-[13px]" placeholder={placeholder} value={q}
          onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter' && list[0]) onPick(list[0]); }} aria-label="Find a store" />
      </div>
      <div className="max-h-56 overflow-y-auto adm-scroll p-1">
        {list.length === 0 && <p className="p-2 text-[13px] text-[var(--adm-ink-3)]">No stores match.</p>}
        {list.map((s) => (
          <button key={s.id} type="button" onClick={() => onPick(s)} className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left text-[13px] hover:bg-[var(--adm-panel)] cursor-pointer">
            <StoreBadge s={s} />
            <span className="truncate">{s.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function StoreBadge({ s, size = 24 }: { s: StoreMeta; size?: number }) {
  return s.logo
    ? <img src={s.logo} alt="" className="rounded-md object-contain bg-white border border-[var(--adm-line)] shrink-0" style={{ width: size, height: size }} />
    : <span className="grid place-items-center rounded-md bg-[var(--adm-accent-soft)] text-[var(--adm-accent)] shrink-0" style={{ width: size, height: size }}><Store className="size-3.5" /></span>;
}

// ---------------------------------------------------------------------------------------------
// One unit

interface UnitPanelProps {
  floorId: FloorId;
  floor: FloorData;
  unit: WayfindingLocation;
  doc: MapDoc;
  stores: StoreMeta[];
  storeById: Map<number, StoreMeta>;
  floorName: (f: string) => string;
  shaftNames: string[];
  onPatch: (patch: Partial<WayfindingLocation>) => void;
  onRename: (to: string) => void;
  onAssign: (storeId: number) => void;
  onVacate: () => void;
  onSplit: (dir: 'vertical' | 'horizontal', ratio: number) => void;
  onSplitPreview: (p: { dir: 'vertical' | 'horizontal'; ratio: number } | null) => void;
  onUnmerge: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function UnitPanel(p: UnitPanelProps) {
  const { unit, floor } = p;
  const owners = Object.entries(p.doc.place).filter(([, pl]) => pl.floor === p.floorId && pl.units.some((u) => u.toLowerCase() === unit.id.toLowerCase())).map(([id]) => p.storeById.get(Number(id))).filter(Boolean) as StoreMeta[];
  const [picking, setPicking] = useState(false);
  const [split, setSplit] = useState<{ dir: 'vertical' | 'horizontal'; ratio: number } | null>(null);
  useEffect(() => { setPicking(false); setSplit(null); }, [unit.id]);
  useEffect(() => { p.onSplitPreview(split); return () => p.onSplitPreview(null); }, [split]); // eslint-disable-line react-hooks/exhaustive-deps

  const knownType = UNIT_TYPES.some((t) => t.value === unit.cat);
  const validateId = (v: string) => {
    if (!v) return 'Give the unit an id';
    if (!/^[\w .&'()+-]{1,40}$/.test(v)) return 'Use letters, numbers, spaces and - _ . & ( )';
    if (floor.locations.some((l) => l !== unit && l.id.toLowerCase() === v.toLowerCase())) return `${v} already exists on this floor`;
    return null;
  };

  return (
    <div>
      <Section title="Unit">
        <div className="flex flex-col gap-3">
          <Row label="Unit / shutter id"><LazyInput value={unit.id} onCommit={p.onRename} validate={validateId} spellCheck={false} /></Row>
          <Row label="Type">
            <select className="adm-input h-8 text-[13px]" value={unit.cat} onChange={(e) => p.onPatch({ cat: e.target.value })}>
              {UNIT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              {!knownType && <option value={unit.cat}>{unit.cat}</option>}
            </select>
            {UNIT_TYPES.find((t) => t.value === unit.cat)?.hint && <span className="text-[12px] font-normal text-[var(--adm-ink-3)]">{UNIT_TYPES.find((t) => t.value === unit.cat)!.hint}</span>}
          </Row>
          {isTransitCat(unit.cat) && (
            <Row label="Connects to (same name on other floors)">
              <LazyInput value={unit.link || ''} onCommit={(v) => p.onPatch({ link: v || undefined })} placeholder={unit.id} list="shaft-names" />
              <datalist id="shaft-names">{p.shaftNames.map((n) => <option key={n} value={n} />)}</datalist>
              <span className="text-[12px] font-normal text-[var(--adm-ink-3)]">Lifts and stairs with the same name link up between floors. Empty uses the unit id.</span>
            </Row>
          )}
          {unit.cat !== 'shop' && (
            <Row label="Name shown on the map (optional)"><LazyInput value={unit.name || ''} onCommit={(v) => p.onPatch({ name: v || undefined })} placeholder={unit.cat === 'restroom' ? 'e.g. Restrooms' : ''} /></Row>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Row label="Block"><LazyInput value={unit.block || ''} onCommit={(v) => p.onPatch({ block: v || undefined })} /></Row>
            <Row label="Area"><LazyInput value={unit.area || ''} onCommit={(v) => p.onPatch({ area: v || undefined })} placeholder="e.g. 207 sq.ft" /></Row>
          </div>
          <div>
            <p className="text-[12.5px] font-medium text-[var(--adm-ink-2)] mb-1">Position and size</p>
            <div className="grid grid-cols-2 gap-1.5">
              <NumInput label="X" value={unit.x} onCommit={(x) => p.onPatch({ x })} />
              <NumInput label="Y" value={unit.y} onCommit={(y) => p.onPatch({ y })} />
              <NumInput label="W" value={unit.w} onCommit={(w) => p.onPatch({ w: Math.max(8, w) })} />
              <NumInput label="H" value={unit.h} onCommit={(h) => p.onPatch({ h: Math.max(8, h) })} />
            </div>
          </div>
        </div>
      </Section>

      {unit.cat === 'shop' && (
        <Section title="Shutter" actions={owners.length > 0 && !picking ? <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => setPicking(true)}><ArrowRightLeft className="size-3.5" /> Change</button> : undefined}>
          {owners.length > 1 && (
            <p className="mb-2 flex gap-1.5 text-[12.5px] text-[var(--adm-danger)]"><AlertTriangle className="size-4 shrink-0" /> {owners.length} stores are assigned here. Keep one.</p>
          )}
          {owners.map((s) => {
            const pl = p.doc.place[s.id];
            return (
              <div key={s.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[var(--adm-panel)] mb-2">
                <StoreBadge s={s} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-semibold truncate">{s.name}</p>
                  <p className="text-[12px] text-[var(--adm-ink-3)] truncate">{pl.units.length > 1 ? `Occupies ${pl.units.join(' + ')}` : 'Open'}</p>
                </div>
                <Link to={`/admin/stores/${s.id}`} className="adm-btn adm-btn-ghost adm-btn-sm !px-1.5" title="Edit store"><ExternalLink className="size-3.5" /></Link>
              </div>
            );
          })}
          {owners.length === 0 && !picking && (
            <div className="flex flex-col items-start gap-2">
              <p className="text-[13px] text-[var(--adm-ink-3)]">Vacant. Assign a store to this shutter.</p>
              <button className="adm-btn adm-btn-sm adm-btn-primary" onClick={() => setPicking(true)}><Store className="size-3.5" /> Assign a store</button>
            </div>
          )}
          {picking && (
            <div className="flex flex-col gap-2">
              <StorePicker autoFocus stores={p.stores} exclude={owners.map((o) => o.id)} onPick={(s) => { p.onAssign(s.id); setPicking(false); }} />
              <p className="text-[12px] text-[var(--adm-ink-3)]">The store moves here from wherever it was. To give one store several units, select them all (Shift-click) and use "Give to one store".</p>
              <div className="flex gap-2">
                <button className="adm-btn adm-btn-sm" onClick={() => setPicking(false)}>Cancel</button>
                {owners.length > 0 && <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => { p.onVacate(); setPicking(false); }}>Mark vacant</button>}
              </div>
            </div>
          )}
          {owners.length > 0 && !picking && <button className="adm-btn adm-btn-sm adm-btn-ghost -ml-2 text-[var(--adm-ink-3)]" onClick={p.onVacate}>Mark vacant</button>}
        </Section>
      )}

      <Section title="Shape">
        {split ? (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-1.5">
              {(['vertical', 'horizontal'] as const).map((d) => (
                <button key={d} className={`adm-btn adm-btn-sm ${split.dir === d ? '!border-[var(--adm-accent)] !text-[var(--adm-accent)] bg-[var(--adm-accent-soft)]' : ''}`} onClick={() => setSplit({ ...split, dir: d })}>
                  {d === 'vertical' ? <Split className="size-3.5" /> : <Split className="size-3.5 rotate-90" />} {d === 'vertical' ? 'Side by side' : 'One above other'}
                </button>
              ))}
            </div>
            <label className="text-[12.5px] text-[var(--adm-ink-2)] font-medium">
              Split at {Math.round(split.ratio * 100)}%
              <input type="range" min={10} max={90} step={1} value={Math.round(split.ratio * 100)} onChange={(e) => setSplit({ ...split, ratio: Number(e.target.value) / 100 })} className="w-full accent-[var(--adm-accent)]" />
            </label>
            <p className="text-[12px] text-[var(--adm-ink-3)]">The current store keeps the first part; the second part is vacant.</p>
            <div className="flex gap-2">
              <button className="adm-btn adm-btn-sm" onClick={() => setSplit(null)}>Cancel</button>
              <button className="adm-btn adm-btn-sm adm-btn-primary" onClick={() => { p.onSplit(split.dir, split.ratio); setSplit(null); }}><Scissors className="size-3.5" /> Split unit</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            <button className="adm-btn adm-btn-sm" onClick={() => setSplit({ dir: unit.w >= unit.h ? 'vertical' : 'horizontal', ratio: 0.5 })}><Scissors className="size-3.5" /> Split in two</button>
            {unit.mergedFrom?.length ? <button className="adm-btn adm-btn-sm" onClick={p.onUnmerge}><Ungroup className="size-3.5" /> Undo merge ({unit.mergedFrom.length})</button> : null}
            <button className="adm-btn adm-btn-sm" onClick={p.onDuplicate}><Copy className="size-3.5" /> Duplicate</button>
            <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={p.onDelete}><Trash2 className="size-3.5" /> Delete</button>
          </div>
        )}
      </Section>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Several units

export function MultiPanel({ units, stores, onMerge, onGiveTo, onDelete, onClear }: { units: WayfindingLocation[]; stores: StoreMeta[]; onMerge: () => void; onGiveTo: (storeId: number) => void; onDelete: () => void; onClear: () => void }) {
  const [picking, setPicking] = useState(false);
  return (
    <div>
      <Section title={`${units.length} units selected`} actions={<button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={onClear}>Clear</button>}>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {units.map((u) => <span key={u.id} className="h-6 px-2 rounded-md bg-[var(--adm-panel)] text-[12.5px] font-medium grid place-items-center">{u.id}</span>)}
        </div>
        <div className="flex flex-col gap-2">
          <button className="adm-btn adm-btn-sm justify-start" onClick={onMerge}><Combine className="size-3.5" /> Merge into one unit</button>
          <p className="text-[12px] text-[var(--adm-ink-3)] -mt-1 mb-1">Joins them into one box, e.g. when two shops become one. You can undo the merge later.</p>
          <button className="adm-btn adm-btn-sm justify-start" onClick={() => setPicking((v) => !v)}><Store className="size-3.5" /> Give to one store</button>
          <p className="text-[12px] text-[var(--adm-ink-3)] -mt-1 mb-1">Keeps the units separate but shows them as one shop on the visitor map.</p>
          {picking && <StorePicker autoFocus stores={stores} onPick={(s) => { onGiveTo(s.id); setPicking(false); }} />}
          <button className="adm-btn adm-btn-sm adm-btn-danger justify-start" onClick={onDelete}><Trash2 className="size-3.5" /> Delete units</button>
        </div>
      </Section>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Floor (nothing selected)

export function FloorPanel({ floorId, floor, doc, floorName, versions, loadingVersions, onRestore, onUnderlay, onLoadVersions }: {
  floorId: FloorId; floor: FloorData; doc: MapDoc; floorName: string;
  versions: MapVersion[] | null; loadingVersions: boolean; onLoadVersions: () => void; onRestore: (id: number) => void;
  onUnderlay: (u: FloorData['underlay'] | null) => void;
}) {
  const shops = floor.locations.filter((l) => l.cat === 'shop');
  const taken = new Set(Object.values(doc.place).filter((pl) => pl.floor === floorId).flatMap((pl) => pl.units.map((u) => u.toLowerCase())));
  const occupied = shops.filter((s) => taken.has(s.id.toLowerCase())).length;
  const lifts = floor.locations.filter((l) => isTransitCat(l.cat)).length;
  const u = floor.underlay;
  const size = floor.imageSize || { w: 3508, h: 4962 };
  return (
    <div>
      <Section title={floorName}>
        <div className="grid grid-cols-3 gap-2">
          {[['Shop units', shops.length], ['Occupied', occupied], ['Lifts & stairs', lifts]].map(([l, n]) => (
            <div key={l} className="rounded-lg bg-[var(--adm-panel)] px-2.5 py-2">
              <p className="text-[18px] font-semibold tabular-nums">{n}</p>
              <p className="text-[11.5px] text-[var(--adm-ink-3)]">{l}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12.5px] text-[var(--adm-ink-3)] leading-relaxed">Click a unit to edit it or assign its shutter. Drag to move, pull the corners to resize, Shift-click to pick several. Hold Space and drag, or right-drag, to move around the plan.</p>
      </Section>
      <Section title="Floor plan image">
        <p className="text-[12.5px] text-[var(--adm-ink-3)] mb-2">Optional. A scan of the architect's plan shown under the units while you edit, so you can trace them. Visitors never see it.</p>
        <ImageInput preset="cover" value={u?.url || ''} onChange={(url) => onUnderlay(url ? { url, x: u?.x ?? 0, y: u?.y ?? 0, w: u?.w ?? size.w, h: u?.h ?? size.h, opacity: u?.opacity ?? 0.5 } : null)} />
        {u && (
          <div className="mt-3 flex flex-col gap-2">
            <label className="text-[12.5px] text-[var(--adm-ink-2)] font-medium">Visibility {Math.round(u.opacity * 100)}%
              <input type="range" min={5} max={100} value={Math.round(u.opacity * 100)} onChange={(e) => onUnderlay({ ...u, opacity: Number(e.target.value) / 100 })} className="w-full accent-[var(--adm-accent)]" />
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <NumInput label="X" value={u.x} onCommit={(x) => onUnderlay({ ...u, x })} />
              <NumInput label="Y" value={u.y} onCommit={(y) => onUnderlay({ ...u, y })} />
              <NumInput label="W" value={u.w} onCommit={(w) => onUnderlay({ ...u, w })} />
              <NumInput label="H" value={u.h} onCommit={(h) => onUnderlay({ ...u, h })} />
            </div>
          </div>
        )}
      </Section>
      <Section title="Saved versions" actions={!versions && <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={onLoadVersions}><History className="size-3.5" /> Show</button>}>
        {loadingVersions && <Spinner />}
        {versions && versions.length === 0 && <p className="text-[13px] text-[var(--adm-ink-3)]">No saves yet for this floor. Each save you make is kept here.</p>}
        {versions && versions.length > 0 && (
          <ul className="flex flex-col">
            {versions.map((v, i) => (
              <li key={v.id} className="flex items-center justify-between gap-2 py-1.5 text-[13px] border-b border-[var(--adm-line)] last:border-0">
                <span className="min-w-0 truncate">{relativeTime(v.created_at)}{i === 0 && <span className="ml-1.5 text-[11.5px] text-[var(--adm-ok)] font-medium">current</span>}{v.note && <span className="text-[var(--adm-ink-3)]"> · {v.note}</span>}</span>
                {i > 0 && <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => onRestore(v.id)}><RotateCcw className="size-3.5" /> Restore</button>}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Stores

export function StoresPanel({ stores, doc, floorName, unitExists, onFocus, onPlace, placing }: {
  stores: StoreMeta[]; doc: MapDoc; floorName: (f: string) => string;
  unitExists: (floor: string, unit: string) => boolean;
  onFocus: (s: StoreMeta) => void; onPlace: (s: StoreMeta | null) => void; placing: StoreMeta | null;
}) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'unplaced' | 'broken'>('all');
  const rows = useMemo(() => stores.map((s) => {
    const pl = doc.place[s.id] || { floor: '', units: [] };
    const missing = pl.floor ? pl.units.filter((u) => !unitExists(pl.floor, u)) : [];
    const state = !pl.floor || !pl.units.length ? 'unplaced' : missing.length ? 'broken' : 'ok';
    return { s, pl, missing, state };
  }), [stores, doc.place, unitExists]);
  const counts = { unplaced: rows.filter((r) => r.state === 'unplaced').length, broken: rows.filter((r) => r.state === 'broken').length };
  const list = rows.filter((r) => (filter === 'all' || r.state === filter) && (!q.trim() || r.s.name.toLowerCase().includes(q.trim().toLowerCase())));

  return (
    <div>
      {placing && (
        <div className="m-3 p-3 rounded-lg bg-[var(--adm-accent-soft)] text-[13px] text-[var(--adm-accent)] flex items-start gap-2">
          <MapPin className="size-4 shrink-0 mt-0.5" />
          <span className="flex-1">Click a unit on the map to place <b>{placing.name}</b>. Switch floors first if needed.</span>
          <button onClick={() => onPlace(null)} className="p-0.5" aria-label="Stop placing"><X className="size-4" /></button>
        </div>
      )}
      <div className="p-3 flex flex-col gap-2 border-b border-[var(--adm-line)]">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-[var(--adm-ink-3)] pointer-events-none" />
          <input className="adm-input h-9 pl-8 text-[13px]" placeholder="Find a store" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.stopPropagation()} />
        </div>
        <div className="flex gap-1">
          {([['all', `All ${stores.length}`], ['unplaced', `Not on map ${counts.unplaced}`], ['broken', `Missing unit ${counts.broken}`]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} className={`h-7 px-2.5 rounded-full text-[12px] font-medium transition-colors ${filter === k ? 'bg-[var(--adm-ink)] text-white' : 'bg-[var(--adm-panel)] text-[var(--adm-ink-2)] hover:bg-[#eceef2]'}`}>{l}</button>
          ))}
        </div>
      </div>
      <ul className="p-1.5">
        {list.map(({ s, pl, missing, state }) => (
          <li key={s.id}>
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[var(--adm-panel)] group">
              <StoreBadge s={s} size={30} />
              <button className="min-w-0 flex-1 text-left cursor-pointer" onClick={() => (state === 'unplaced' ? onPlace(s) : onFocus(s))}>
                <p className="text-[13px] font-medium truncate">{s.name}</p>
                <p className={`text-[12px] truncate ${state === 'broken' ? 'text-[var(--adm-danger)]' : state === 'unplaced' ? 'text-[var(--adm-warn)]' : 'text-[var(--adm-ink-3)]'}`}>
                  {state === 'unplaced' ? 'Not on the map' : state === 'broken' ? `${floorName(pl.floor)} · ${missing.join(', ')} doesn't exist` : `${floorName(pl.floor)} · ${pl.units.join(' + ')}`}
                </p>
              </button>
              <button className="adm-btn adm-btn-ghost adm-btn-sm opacity-0 group-hover:opacity-100 focus:opacity-100" onClick={() => onPlace(s)} title="Place on the map"><MapPin className="size-3.5" /> {state === 'ok' ? 'Move' : 'Place'}</button>
            </div>
          </li>
        ))}
        {list.length === 0 && <li className="p-4 text-[13px] text-[var(--adm-ink-3)]">Nothing here.</li>}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// QR codes

function QrImage({ code }: { code: string }) {
  const [svg, setSvg] = useState('');
  useEffect(() => { let live = true; qrSvg(code).then((s) => live && setSvg(s)); return () => { live = false; }; }, [code]);
  return <div className="w-full aspect-square rounded-lg border border-[var(--adm-line)] bg-white p-2 [&_svg]:w-full [&_svg]:h-full" dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function QrDetail({ qrKey, point, scans, codeTaken, onChange, onDelete, floorName, dirty }: {
  qrKey: string; point: QrPoint; scans?: number; codeTaken: (code: string) => boolean;
  onChange: (p: Partial<QrPoint>) => void; onDelete: () => void; floorName: string; dirty: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const h = point.heading ?? null;
  return (
    <div>
      <Section title="QR point" actions={<span className="text-[12px] text-[var(--adm-ink-3)]">{floorName}</span>}>
        <div className="flex flex-col gap-3">
          <Row label="Name visitors see (where this sign is)"><LazyInput value={point.name} onCommit={(v) => onChange({ name: v || 'QR point' })} placeholder="e.g. Main entrance, lift lobby" /></Row>
          <Row label="Code (printed on the sign)">
            <LazyInput value={point.code} spellCheck={false} onCommit={(v) => onChange({ code: v.toUpperCase() })}
              validate={(v) => { const c = v.toUpperCase(); if (!/^[A-Z0-9][A-Z0-9-]{0,23}$/.test(c)) return 'Capital letters, numbers and hyphens'; if (c !== point.code && codeTaken(c)) return `${c} is already used`; return null; }} />
            {qrKey !== point.code && !qrKey.startsWith('new:') && <span className="text-[12px] font-normal text-[var(--adm-warn)]">Changing the code means signs already printed with {qrKey} stop working.</span>}
          </Row>
          <div>
            <p className="text-[12.5px] font-medium text-[var(--adm-ink-2)] mb-1.5">Facing direction</p>
            <div className="flex items-center gap-2">
              <button className="adm-btn adm-btn-sm !px-2" onClick={() => onChange({ heading: (((h ?? 0) - 45) % 360 + 360) % 360 })} aria-label="Turn left"><RotateCcw className="size-3.5" /></button>
              <div className="relative size-10 rounded-full border border-[var(--adm-line-strong)] grid place-items-center">
                {h != null ? <div className="absolute w-0.5 h-4 bg-[var(--adm-accent)] rounded origin-bottom" style={{ bottom: '50%', transform: `rotate(${h}deg)` }} /> : <span className="text-[11px] text-[var(--adm-ink-3)]">off</span>}
              </div>
              <button className="adm-btn adm-btn-sm !px-2" onClick={() => onChange({ heading: (((h ?? 0) + 45) % 360) })} aria-label="Turn right"><RotateCw className="size-3.5" /></button>
              {h != null && <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => onChange({ heading: null })}>Off</button>}
            </div>
            <p className="mt-1.5 text-[12px] text-[var(--adm-ink-3)]">Which way someone reading the sign is facing. Visitors see a beam in that direction. You can also drag the handle on the map.</p>
          </div>
          <Row label="Staff note (optional)"><LazyInput value={point.note || ''} onCommit={(v) => onChange({ note: v })} placeholder="e.g. Pillar left of the escalator" /></Row>
        </div>
      </Section>
      <Section title="Code" actions={scans != null ? <span className="text-[12px] text-[var(--adm-ink-3)]">{scans} scan{scans === 1 ? '' : 's'}</span> : undefined}>
        {dirty ? <p className="text-[13px] text-[var(--adm-warn)] mb-2">Save your changes before printing this code.</p> : null}
        <div className={dirty ? 'opacity-50 pointer-events-none' : ''}>
          <div className="w-40"><QrImage code={point.code} /></div>
          <p className="mt-2 text-[12px] text-[var(--adm-ink-3)] break-all">{qrUrl(point.code)}</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <button className="adm-btn adm-btn-sm" onClick={() => printSigns([point], () => floorName)}><Printer className="size-3.5" /> Print sign</button>
            <button className="adm-btn adm-btn-sm" onClick={() => downloadPng(point.code)}><Download className="size-3.5" /> PNG</button>
            <button className="adm-btn adm-btn-sm" onClick={() => downloadSvg(point.code)}><Download className="size-3.5" /> SVG</button>
            <button className="adm-btn adm-btn-sm" onClick={() => { navigator.clipboard?.writeText(qrUrl(point.code)); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />} {copied ? 'Copied' : 'Copy link'}</button>
            <a className="adm-btn adm-btn-sm" href={`/q/${point.code}`} target="_blank" rel="noreferrer"><ExternalLink className="size-3.5" /> Try it</a>
          </div>
        </div>
      </Section>
      <Section title="Remove">
        <button className="adm-btn adm-btn-sm adm-btn-danger" onClick={onDelete}><Trash2 className="size-3.5" /> Delete QR point</button>
      </Section>
    </div>
  );
}

export function QrListPanel({ doc, scans, floorName, onFocus, onAdd, dirty }: {
  doc: MapDoc; scans: Record<string, number>; floorName: (f: string) => string;
  onFocus: (key: string) => void; onAdd: () => void; dirty: boolean;
}) {
  const entries = Object.entries(doc.qr).sort((a, b) => a[1].code.localeCompare(b[1].code));
  const printing = useRef(false);
  return (
    <div>
      <div className="p-3 flex flex-col gap-2 border-b border-[var(--adm-line)]">
        <p className="text-[12.5px] text-[var(--adm-ink-3)] leading-relaxed">Each QR code is a fixed "you are here" point. Visitors scan it, pick a shop and get walked there. Scanning another code later continues the same trip.</p>
        <div className="flex gap-1.5">
          <button className="adm-btn adm-btn-sm adm-btn-primary" onClick={onAdd}><QrCode className="size-3.5" /> Add QR point</button>
          <button className="adm-btn adm-btn-sm" disabled={!entries.length || dirty} title={dirty ? 'Save first' : undefined}
            onClick={async () => { if (printing.current) return; printing.current = true; await printSigns(entries.map(([, q]) => q), floorName); printing.current = false; }}>
            <Printer className="size-3.5" /> Print all signs
          </button>
        </div>
      </div>
      <ul className="p-1.5">
        {entries.map(([key, q]) => (
          <li key={key}>
            <button onClick={() => onFocus(key)} className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[var(--adm-panel)] text-left cursor-pointer">
              <span className="grid place-items-center size-8 rounded-md bg-[var(--adm-accent-soft)] text-[var(--adm-accent)] shrink-0"><QrCode className="size-4" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium truncate">{q.name}</span>
                <span className="block text-[12px] text-[var(--adm-ink-3)] truncate">{q.code} · {floorName(q.floorId)}</span>
              </span>
              <span className="text-[12px] text-[var(--adm-ink-3)] tabular-nums">{scans[key] ?? 0}</span>
            </button>
          </li>
        ))}
        {entries.length === 0 && <li className="p-4 text-[13px] text-[var(--adm-ink-3)]">No QR points yet. Add one, then click on the map where the sign will hang.</li>}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Checks

export interface Problem { level: 'error' | 'warn'; text: string; floor?: FloorId; units?: string[]; storeId?: number }

export function ChecksPanel({ problems, onGo }: { problems: Problem[]; onGo: (p: Problem) => void }) {
  if (!problems.length) {
    return <div className="p-6 text-center"><Check className="size-6 mx-auto text-[var(--adm-ok)]" /><p className="mt-2 text-[13.5px] font-medium">Everything looks right</p><p className="text-[12.5px] text-[var(--adm-ink-3)]">Every store points at a real unit and every floor can be reached.</p></div>;
  }
  return (
    <ul className="p-1.5">
      {problems.map((pr, i) => (
        <li key={i}>
          <button onClick={() => onGo(pr)} className="w-full flex items-start gap-2.5 px-2.5 py-2.5 rounded-lg hover:bg-[var(--adm-panel)] text-left cursor-pointer">
            <AlertTriangle className={`size-4 shrink-0 mt-0.5 ${pr.level === 'error' ? 'text-[var(--adm-danger)]' : 'text-[#dc6803]'}`} />
            <span className="text-[13px] leading-snug">{pr.text}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
