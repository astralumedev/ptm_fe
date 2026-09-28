import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navigation, X } from 'lucide-react';
import type { FloorId, PathResult, QrPoint, WayfindingLocation, WayfindingStore } from '../types/wayfinding';
import wayfindingService from '../services/wayfindingService';
import { countScan, useMapData } from '../services/mapData';
import { clearTrip, getTrip, saveTrip } from '../services/mapTrip';
import { FLOOR_ORDER, planRoute, RouteTexts, unitCenter } from '../lib/mapRouter';
import NavigationBar from '../app/components/NavigationBar';
import { WayfindingHeader } from '../app/components/wayfinding/WayfindingHeader';
import { StartPoint, VisitorMapStage, floorBounds } from '../app/components/wayfinding/VisitorMapStage';
import { FloorSelector } from '../app/components/wayfinding/FloorSelector';
import { MapControls } from '../app/components/wayfinding/MapControls';
import { StoreDetailsDrawer } from '../app/components/wayfinding/StoreDetailsDrawer';
import { WhereAreYouModal } from '../app/components/wayfinding/WhereAreYouModal';
import type { MapCanvasHandle } from '../app/components/map/MapCanvas';
import { boundsOf } from '../app/components/map/MapCanvas';
import styles from '../app/components/wayfinding/Wayfinding.module.css';
import { ALL_FLOORS, fill, useFloorTexts, useMapCategories, useMapCopy } from '../app/components/wayfinding/useMapContent';

const HERE_KEY = 'ptm-map-here';
const HERE_MAX_AGE = 3 * 60 * 60 * 1000;

/** The QR code this phone scanned last, so reopening the map keeps "you are here". */
function lastScanned(): string | null {
  try {
    const v = JSON.parse(localStorage.getItem(HERE_KEY) || 'null');
    return v && Date.now() - v.at < HERE_MAX_AGE ? String(v.code) : null;
  } catch { return null; }
}
function rememberScan(code: string) {
  try { localStorage.setItem(HERE_KEY, JSON.stringify({ code, at: Date.now() })); } catch { /* private mode */ }
}

const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 1024;

/** /q/:code — the address printed in every map QR code. */
export function QrScanRedirect() {
  const { code = '' } = useParams();
  const navigate = useNavigate();
  const counted = useRef(false);
  useEffect(() => {
    const c = code.toUpperCase();
    if (!counted.current) { counted.current = true; countScan(c); }
    navigate(`/mall-map?qr=${encodeURIComponent(c)}`, { replace: true });
  }, [code, navigate]);
  return <div className="min-h-screen bg-[#070914]" />;
}

export const MallMapPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const copy = useMapCopy();
  const { names: floorNames } = useFloorTexts();
  const { canonical } = useMapCategories();
  const { data, error } = useMapData();
  const floors = data?.floors;
  const qrPoints = useMemo(() => data?.qr || [], [data]);

  const [stores, setStores] = useState<WayfindingStore[] | null>(null);
  const [currentFloor, setCurrentFloor] = useState<FloorId>('ground_floor');
  const [enterFrom, setEnterFrom] = useState<'up' | 'down' | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<WayfindingLocation | null>(null);
  const [selectedStore, setSelectedStore] = useState<WayfindingStore | null>(null);
  const [start, setStart] = useState<StartPoint | null>(null);
  const [route, setRoute] = useState<PathResult | null>(null);
  const [activeLeg, setActiveLeg] = useState(0);
  const [play, setPlay] = useState({ n: 0, animate: true });
  const [noRoute, setNoRoute] = useState(false);
  const [continuing, setContinuing] = useState<string | null>(null);
  const [hereOpen, setHereOpen] = useState(false);
  const mapRef = useRef<MapCanvasHandle>(null);
  const handledParams = useRef('');

  useEffect(() => {
    let live = true;
    wayfindingService.getStores().then((s) => live && setStores(s));
    return () => { live = false; };
  }, []);

  const routeTexts = useMemo<RouteTexts>(() => ({
    floorName: (f) => floorNames[f] || f,
    sameFloor: copy.stepSameFloor,
    toTransit: copy.stepToTransit,
    arrive: copy.stepArrive,
    sides: { left: copy.sideLeft, right: copy.sideRight, ahead: copy.sideAhead },
    lift: copy.wordLift, stairs: copy.wordStairs, up: copy.wordUp, down: copy.wordDown,
  }), [copy, floorNames]);

  const goToFloor = useCallback((f: FloorId) => {
    setCurrentFloor((prev) => {
      if (prev !== f) setEnterFrom(FLOOR_ORDER.indexOf(f) > FLOOR_ORDER.indexOf(prev) ? 'up' : 'down');
      return f;
    });
  }, []);

  const findUnit = useCallback((floorId: string, unitId: string) =>
    floors?.[floorId as FloorId]?.locations.find((l) => l.id.toLowerCase() === unitId.toLowerCase()) || null, [floors]);

  const storeAt = useCallback((floorId: string, unitId: string) =>
    (stores || []).find((s) => s.shutters?.some((k) => k.toLowerCase() === `${floorId}:${unitId}`.toLowerCase())) || null, [stores]);

  const defaultStart = useCallback((): StartPoint | null => {
    if (!floors) return null;
    const qr = qrPoints.find((q) => q.floorId === 'ground_floor') || qrPoints[0];
    if (qr) return { name: qr.name, floorId: qr.floorId, x: qr.x, y: qr.y, heading: qr.heading, code: qr.code };
    const g = floors.ground_floor;
    if (g?.youAreHere) return { name: copy.defaultStartName, floorId: 'ground_floor', ...g.youAreHere };
    return null;
  }, [floors, qrPoints, copy.defaultStartName]);

  /** Plans and plays a route to a unit; returns false when there is no way there. */
  const navigate = useCallback((from: StartPoint | null, floorId: FloorId, unit: WayfindingLocation, store: WayfindingStore | null, animate = true) => {
    const s = from || defaultStart();
    if (!floors || !s) return false;
    if (!from) setStart(s);
    const name = store?.name || unit.name || unit.id;
    // For a shop over several units, head for the nearest one.
    const candidates = store?.shutters?.filter((k) => k.startsWith(`${floorId}:`)).map((k) => k.split(':')[1]) || [unit.id];
    let best: PathResult | null = null;
    for (const u of candidates.length ? candidates : [unit.id]) {
      const r = planRoute(floors, s, { floorId, unitId: u }, name, routeTexts);
      if (r && (!best || r.totalDistance < best.totalDistance)) best = r;
    }
    setNoRoute(!best);
    setRoute(best);
    if (!best) return false;
    saveTrip({ floorId, unitId: unit.id, storeSlug: store?.slug, name });
    setActiveLeg(0);
    setPlay((p) => ({ n: p.n + 1, animate }));
    goToFloor(best.legs[0].floorId);
    return true;
  }, [floors, defaultStart, routeTexts, goToFloor]);

  // Deep links: ?qr=CODE (scanned), ?store=slug, ?search=name, ?floor=, ?category=, ?from=floor:unit
  useEffect(() => {
    if (!floors || !stores) return;
    const key = searchParams.toString();
    if (handledParams.current === key) return;
    handledParams.current = key;

    const qrParam = (searchParams.get('qr') || '').toUpperCase();
    const floorParam = searchParams.get('floor');
    const categoryParam = searchParams.get('category');
    const fromParam = searchParams.get('from');
    const storeParam = (searchParams.get('store') || '').trim().toLowerCase();
    const searchParam = (searchParams.get('search') || '').trim().toLowerCase();

    let here: StartPoint | null = null;
    const qr = qrPoints.find((q) => q.code === (qrParam || lastScanned() || ''));
    if (qr) {
      here = { name: qr.name, floorId: qr.floorId, x: qr.x, y: qr.y, heading: qr.heading, code: qr.code };
      if (qrParam) rememberScan(qr.code);
    } else if (fromParam) {
      const [f, u] = fromParam.split(':');
      const loc = f && u ? findUnit(f, u) : null;
      if (loc) here = { name: loc.name || u, floorId: f as FloorId, ...unitCenter(loc) };
    }
    const startPoint = here || defaultStart();
    setStart(startPoint);
    if (startPoint) goToFloor(startPoint.floorId);
    if (floorParam && ALL_FLOORS.includes(floorParam as FloorId)) goToFloor(floorParam as FloorId);
    if (categoryParam) setActiveCategory(canonical(categoryParam));

    const wanted = storeParam || searchParam
      ? stores.find((s) => (storeParam && ((s.slug || '').toLowerCase() === storeParam || s.id.toLowerCase() === storeParam)) || (searchParam && s.name.trim().toLowerCase() === searchParam))
      : undefined;
    if (wanted) {
      setSelectedStore(wanted);
      const [f, u] = (wanted.shutters?.[0] || '').split(':');
      const loc = f && u ? findUnit(f, u) : null;
      setSelectedLocation(loc);
      if (loc) goToFloor(f as FloorId);
      return;
    }

    // Scanned a code mid-trip: carry on to the same destination from here.
    const trip = qrParam ? getTrip() : null;
    if (trip && here) {
      const loc = findUnit(trip.floorId, trip.unitId);
      if (loc) {
        const store = trip.storeSlug ? stores.find((s) => s.slug === trip.storeSlug) || storeAt(trip.floorId, loc.id) : storeAt(trip.floorId, loc.id);
        setSelectedLocation(loc);
        setSelectedStore(store);
        if (navigate(here, trip.floorId, loc, store)) setContinuing(trip.name);
      }
    }
  }, [floors, stores, searchParams, qrPoints, findUnit, storeAt, defaultStart, navigate, goToFloor, canonical]);

  // Frame the active leg of the route (or the selected shop) when it changes.
  const leg = route?.legs[activeLeg] || null;
  const legOnFloor = leg && leg.floorId === currentFloor ? leg : null;
  const mobileOffset = () => (isMobile() ? 110 : 0);
  useEffect(() => {
    if (!legOnFloor) return;
    const b = boundsOf(legOnFloor.points, 170);
    if (b) window.setTimeout(() => mapRef.current?.flyToBox(b, { pad: 40, maxK: 0.9, ms: 700, offsetY: mobileOffset() }), 60);
  }, [legOnFloor, play.n]);
  useEffect(() => {
    if (!selectedLocation || route) return;
    const onFloor = floors?.[currentFloor]?.locations.some((l) => l.id === selectedLocation.id);
    if (!onFloor) return;
    const pad = Math.max(selectedLocation.w, selectedLocation.h) * 2.2;
    mapRef.current?.flyToBox({ x: selectedLocation.x - pad, y: selectedLocation.y - pad, w: selectedLocation.w + pad * 2, h: selectedLocation.h + pad * 2 }, { maxK: 1.1, ms: 600, offsetY: isMobile() ? 220 : 0 });
  }, [selectedLocation, currentFloor, floors, route]);

  const onLegFinished = useCallback(() => {
    if (!route) return;
    const next = activeLeg + 1;
    if (next < route.legs.length) {
      setActiveLeg(next);
      setPlay((p) => ({ n: p.n + 1, animate: true }));
      goToFloor(route.legs[next].floorId);
    }
  }, [route, activeLeg, goToFloor]);

  const clearRoute = () => { setRoute(null); setContinuing(null); setNoRoute(false); };
  const endTrip = () => { clearTrip(); clearRoute(); };

  const handleSelectStore = (store: WayfindingStore) => {
    clearRoute();
    setSelectedStore(store);
    const [f, u] = (store.shutters?.[0] || '').split(':');
    const loc = f && u ? findUnit(f, u) : null;
    setSelectedLocation(loc);
    if (loc) goToFloor(f as FloorId);
  };

  const handleSelectOnMap = (loc: WayfindingLocation | null, store: WayfindingStore | null) => {
    if (route && !loc) return; // keep the route when tapping empty floor
    clearRoute();
    setSelectedLocation(loc);
    setSelectedStore(store);
  };

  const handleGetDirections = () => {
    if (!selectedLocation || !floors) return;
    const floorOfSel = (FLOOR_ORDER.find((f) => floors[f]?.locations.some((l) => l === selectedLocation)) || currentFloor) as FloorId;
    setContinuing(null);
    navigate(start, floorOfSel, selectedLocation, selectedStore);
  };

  const handleStep = (i: number) => {
    if (!route || i < 0 || i >= route.steps.length) return;
    const legIndex = route.steps[i].legIndex;
    setActiveLeg(legIndex);
    setPlay((p) => ({ n: p.n + 1, animate: true }));
    goToFloor(route.legs[legIndex].floorId);
  };

  const pickHere = (p: QrPoint) => {
    rememberScan(p.code);
    const here: StartPoint = { name: p.name, floorId: p.floorId, x: p.x, y: p.y, heading: p.heading, code: p.code };
    setStart(here);
    if (route && selectedLocation) {
      const f = (FLOOR_ORDER.find((fl) => floors?.[fl]?.locations.some((l) => l === selectedLocation)) || currentFloor) as FloorId;
      navigate(here, f, selectedLocation, selectedStore);
    } else {
      goToFloor(p.floorId);
      window.setTimeout(() => mapRef.current?.flyTo({ x: p.x, y: p.y }, 0.6, 650), 80);
    }
    if (searchParams.get('qr')) { searchParams.delete('qr'); handledParams.current = searchParams.toString(); setSearchParams(searchParams, { replace: true }); }
  };

  const transitText = leg && leg.end.kind === 'transit'
    ? fill(copy.transitBadge, {
        transit: leg.end.cat === 'elevator' ? copy.wordLift : copy.wordStairs,
        direction: FLOOR_ORDER.indexOf(leg.end.toFloor) > FLOOR_ORDER.indexOf(leg.floorId) ? copy.wordUp : copy.wordDown,
        floor: floorNames[leg.end.toFloor],
      })
    : undefined;

  if (!floors || !stores) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070914] text-white">
        <div className="flex flex-col items-center gap-4">
          {error ? (
            <p className="text-sm text-gray-300 max-w-xs text-center">{error}</p>
          ) : (
            <div className="w-12 h-12 border-4 border-[#2e3094] border-t-[#801424] rounded-full animate-spin" />
          )}
          <div className="text-center">
            <span className="text-base font-bold tracking-widest text-white uppercase block" style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}>{copy.loadingTitle}</span>
            <span className="text-xs text-indigo-400 uppercase tracking-wider font-semibold">{copy.loadingText}</span>
          </div>
        </div>
      </div>
    );
  }

  const currentFloorLocations = floors[currentFloor]?.locations || [];
  const activeStepIndex = route ? Math.max(0, route.steps.findIndex((s) => s.legIndex === activeLeg)) : 0;

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-[#070914] text-white selection:bg-[#801424] selection:text-white">
      <div className="flex-shrink-0 z-40"><NavigationBar /></div>

      <main className="flex-1 min-h-0 w-full relative flex flex-col overflow-hidden">
        <div className={styles.container}>
          <WayfindingHeader
            stores={stores}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onSelectStore={handleSelectStore}
            initialQuery={searchParams.get('search') || ''}
          />

          <div className={styles.workspaceBody}>
            <div className={styles.stage}>
              <FloorSelector currentFloor={currentFloor} onFloorChange={goToFloor} />
              <MapControls
                onZoomIn={() => mapRef.current?.zoomBy(1.45)}
                onZoomOut={() => mapRef.current?.zoomBy(1 / 1.45)}
                onZoomFit={() => { const b = floorBounds(floors[currentFloor] || null); if (b) mapRef.current?.flyToBox(b, { ms: 500 }); }}
                onToggleQrSim={() => setHereOpen(true)}
              />

              <AnimatePresence>
                {(continuing || noRoute) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute left-1/2 -translate-x-1/2 top-[68px] z-30 max-w-[calc(100%-24px)] w-max"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    {noRoute ? (
                      <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-[#11142e]/95 border border-white/10 shadow-xl text-[13px] text-gray-200 max-w-sm">
                        <span className="flex-1">{copy.noRoute}</span>
                        <button onClick={() => setNoRoute(false)} className="p-0.5 text-gray-400 hover:text-white" aria-label="Dismiss"><X size={16} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pl-3.5 pr-1.5 py-1.5 rounded-full bg-[#11142e]/95 border border-[#2f7bf6]/40 shadow-xl text-[13px]">
                        <Navigation size={14} className="text-[#60a5fa] shrink-0" />
                        <span className="font-semibold truncate">{fill(copy.continuing, { name: continuing || '' })}</span>
                        <button onClick={() => { setContinuing(null); setRoute(null); }} className="ml-1 px-2.5 py-1 rounded-full text-gray-300 hover:bg-white/10">{copy.changeTrip}</button>
                        <button onClick={endTrip} className="px-2.5 py-1 rounded-full text-gray-300 hover:bg-white/10">{copy.endTrip}</button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <VisitorMapStage
                ref={mapRef}
                floorId={currentFloor}
                floor={floors[currentFloor] || null}
                stores={stores}
                activeCategory={activeCategory}
                selectedUnitId={selectedLocation && currentFloorLocations.includes(selectedLocation) ? selectedLocation.id : null}
                start={start}
                youAreHereLabel={copy.youAreHere}
                leg={legOnFloor}
                legFromTransit={activeLeg > 0}
                playKey={`${play.n}-${activeLeg}`}
                animate={play.animate}
                transitText={transitText}
                destLabel={selectedStore?.name || selectedLocation?.name || selectedLocation?.id}
                enterFrom={enterFrom}
                onSelectUnit={handleSelectOnMap}
                onLegFinished={onLegFinished}
              />
            </div>

            <StoreDetailsDrawer
              currentFloor={currentFloor}
              stores={stores}
              activeCategory={activeCategory}
              selectedStore={selectedStore}
              selectedLocation={selectedLocation}
              startLocation={start}
              routeResult={route}
              activeStepIndex={activeStepIndex}
              floorLocations={currentFloorLocations}
              onCategoryChange={setActiveCategory}
              onSelectStore={handleSelectStore}
              onGetDirections={handleGetDirections}
              onStepChange={handleStep}
              onNextStep={() => handleStep(activeStepIndex + 1)}
              onPrevStep={() => handleStep(activeStepIndex - 1)}
              onReplay={() => setPlay((p) => ({ n: p.n + 1, animate: true }))}
              onCloseDetails={() => { setSelectedLocation(null); setSelectedStore(null); }}
              onCloseDirections={endTrip}
            />
          </div>

          <WhereAreYouModal isOpen={hereOpen} points={qrPoints} currentCode={start?.code} onClose={() => setHereOpen(false)} onPick={pickHere} />
        </div>
      </main>
    </div>
  );
};

export default MallMapPage;
