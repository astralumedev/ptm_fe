import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FloorId,
  FloorData,
  WayfindingStore,
  WayfindingLocation,
  PathResult
} from '../types/wayfinding';
import wayfindingService from '../services/wayfindingService';
import { buildGlobalPathGraph, findRoute, BuiltGraphData } from '../lib/wayfindingGraph';
import NavigationBar from '../app/components/NavigationBar';
import { WayfindingHeader } from '../app/components/wayfinding/WayfindingHeader';
import { WayfindingMapStage } from '../app/components/wayfinding/WayfindingMapStage';
import { FloorSelector } from '../app/components/wayfinding/FloorSelector';
import { MapControls } from '../app/components/wayfinding/MapControls';
import { StoreDetailsDrawer } from '../app/components/wayfinding/StoreDetailsDrawer';
import { QrSimulationModal } from '../app/components/wayfinding/QrSimulationModal';
import styles from '../app/components/wayfinding/Wayfinding.module.css';

const ALL_FLOORS: FloorId[] = [
  'lower_ground_floor',
  'ground_floor',
  'first_floor',
  'second_floor',
  'third_floor',
  'fourth_floor',
  'fifth_floor',
];

export const MallMapPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Core Data
  const [stores, setStores] = useState<WayfindingStore[]>([]);
  const [floorDataMap, setFloorDataMap] = useState<Record<string, FloorData>>({});
  const [graphData, setGraphData] = useState<BuiltGraphData>({ graph: {}, nodeInfo: {} });
  const [isLoading, setIsLoading] = useState(true);

  // App State
  const [currentFloor, setCurrentFloor] = useState<FloorId>('ground_floor');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<WayfindingLocation | null>(null);
  const [selectedStore, setSelectedStore] = useState<WayfindingStore | null>(null);

  // Start Location (You Are Here)
  const [startLocation, setStartLocation] = useState<{
    name: string;
    floorId: FloorId;
    locationId: string;
    x: number;
    y: number;
  }>({
    name: 'Ground Floor Main Entrance',
    floorId: 'ground_floor',
    locationId: 'A101',
    x: 1232,
    y: 513,
  });

  // Navigation Route
  const [routeResult, setRouteResult] = useState<PathResult | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Stage Viewport
  const [viewportState, setViewportState] = useState({ k: 0.25, x: 0, y: 0 });
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // 1. Initial Load of Stores & Floor Plans
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [loadedStores, loadedFloors] = await Promise.all([
          wayfindingService.getStores(),
          wayfindingService.getAllFloorsData(ALL_FLOORS),
        ]);

        setStores(loadedStores);
        setFloorDataMap(loadedFloors);

        // Build global path graph
        const builtGraph = buildGlobalPathGraph(loadedFloors);
        setGraphData(builtGraph);

        // Set accurate initial start entrance location if available
        const gLoc =
          loadedFloors['ground_floor']?.locations.find((l) => l.id === 'A101') ||
          loadedFloors['ground_floor']?.locations[0];
        if (gLoc) {
          setStartLocation({
            name: 'Ground Floor Main Entrance',
            floorId: 'ground_floor',
            locationId: gLoc.id,
            x: Math.round(gLoc.x + gLoc.w / 2),
            y: Math.round(gLoc.y + gLoc.h / 2),
          });
        }
      } catch (err) {
        console.error('Failed to initialize Mall Map:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // 2. Handle URL parameters (e.g. ?store=zara, ?floor=first_floor, ?category=electronics, ?from=ground_floor:A101)
  useEffect(() => {
    if (isLoading || stores.length === 0) return;

    const storeParam = searchParams.get('store');
    const floorParam = searchParams.get('floor');
    const categoryParam = searchParams.get('category');
    const fromParam = searchParams.get('from');

    if (floorParam && ALL_FLOORS.includes(floorParam as FloorId)) {
      setCurrentFloor(floorParam as FloorId);
    }

    if (categoryParam) {
      setActiveCategory(categoryParam);
    }

    if (fromParam) {
      const parts = fromParam.split(':');
      if (parts.length === 2 && ALL_FLOORS.includes(parts[0] as FloorId)) {
        const floorId = parts[0] as FloorId;
        const locId = parts[1];
        const loc = floorDataMap[floorId]?.locations.find((l) => l.id.toLowerCase() === locId.toLowerCase());

        if (loc) {
          setStartLocation({
            name: loc.name || `Entrance (${locId})`,
            floorId,
            locationId: loc.id,
            x: Math.round(loc.x + loc.w / 2),
            y: Math.round(loc.y + loc.h / 2),
          });
        }
      }
    }

    if (storeParam) {
      const foundStore = stores.find(
        (s) => s.slug === storeParam || s.id.toLowerCase() === storeParam.toLowerCase()
      );

      if (foundStore && foundStore.shutters && foundStore.shutters.length > 0) {
        const [targetFloor, shutterId] = foundStore.shutters[0].split(':');
        if (ALL_FLOORS.includes(targetFloor as FloorId)) {
          setCurrentFloor(targetFloor as FloorId);
          setSelectedStore(foundStore);

          const loc = floorDataMap[targetFloor]?.locations.find((l) => l.id === shutterId);
          if (loc) {
            setSelectedLocation(loc);
          }
        }
      }
    }
  }, [searchParams, stores, floorDataMap, isLoading]);

  const handleZoomFit = useCallback(() => {
    const curLocations = floorDataMap[currentFloor]?.locations || [];
    if (curLocations.length > 0) {
      const minX = Math.min(...curLocations.map((l) => l.x));
      const minY = Math.min(...curLocations.map((l) => l.y));
      const maxX = Math.max(...curLocations.map((l) => l.x + l.w));
      const maxY = Math.max(...curLocations.map((l) => l.y + l.h));
      const contentW = Math.max(100, maxX - minX);
      const contentH = Math.max(100, maxY - minY);
      const windowW = window.innerWidth;
      const windowH = window.innerHeight * 0.8;
      const pad = 40;
      const k = Math.min((windowW - pad * 2) / contentW, (windowH - pad * 2) / contentH);
      const x = (windowW - contentW * k) / 2 - minX * k;
      const y = (windowH - contentH * k) / 2 - minY * k;
      setViewportState({ k, x, y });
    }
  }, [currentFloor, floorDataMap]);

  const handleZoomIn = () => {
    setViewportState((prev) => ({ ...prev, k: Math.min(3.5, prev.k * 1.35) }));
  };

  const handleZoomOut = () => {
    setViewportState((prev) => ({ ...prev, k: Math.max(0.16, prev.k / 1.35) }));
  };

  // Select store from header search
  const handleSelectStoreFromSearch = (store: WayfindingStore) => {
    setSelectedStore(store);
    setRouteResult(null);

    if (store.shutters && store.shutters.length > 0) {
      const [floorStr, shutterId] = store.shutters[0].split(':');
      if (ALL_FLOORS.includes(floorStr as FloorId)) {
        const floor = floorStr as FloorId;
        setCurrentFloor(floor);

        const loc = floorDataMap[floor]?.locations.find((l) => l.id === shutterId);
        if (loc) {
          setSelectedLocation(loc);
        }
      }
    }
  };

  // Select location on map click
  const handleSelectLocationOnMap = (loc: WayfindingLocation, store: WayfindingStore | null) => {
    setSelectedLocation(loc);
    setSelectedStore(store);
    setRouteResult(null);
  };

  // Compute Route Directions with reliable fallback to Ground Floor Main Entrance
  const handleGetDirections = () => {
    if (!selectedLocation) return;

    let curStart = startLocation;
    const startLocFound =
      curStart &&
      floorDataMap[curStart.floorId]?.locations.some((l) => l.id === curStart.locationId);

    if (!curStart || !startLocFound) {
      const gFloor = floorDataMap['ground_floor'];
      const defaultLoc =
        gFloor?.locations.find((l) => l.id === 'A101') || gFloor?.locations[0];
      curStart = {
        name: 'Ground Floor Main Entrance',
        floorId: 'ground_floor',
        locationId: defaultLoc ? defaultLoc.id : 'A101',
        x: defaultLoc ? Math.round(defaultLoc.x + defaultLoc.w / 2) : 1232,
        y: defaultLoc ? Math.round(defaultLoc.y + defaultLoc.h / 2) : 513,
      };
      setStartLocation(curStart);
    }

    const startNodeId = `${curStart.floorId}:${curStart.locationId}`;
    const endNodeId = `${currentFloor}:${selectedLocation.id}`;
    const startName = curStart.name || 'Main Entrance';
    const endName = selectedStore?.name || selectedLocation.name || selectedLocation.id;

    const route = findRoute(graphData, startNodeId, endNodeId, startName, endName);
    setRouteResult(route);
    setActiveStepIndex(0);

    if (curStart.floorId !== currentFloor) {
      setCurrentFloor(curStart.floorId);
    }
  };

  // Step-by-step navigation controls
  const handleStepChange = (index: number) => {
    if (!routeResult || index < 0 || index >= routeResult.steps.length) return;
    setActiveStepIndex(index);
    const targetStep = routeResult.steps[index];
    if (targetStep && targetStep.floorId !== currentFloor) {
      setCurrentFloor(targetStep.floorId);
    }
  };

  const handleNextStep = () => {
    if (!routeResult) return;
    if (activeStepIndex < routeResult.steps.length - 1) {
      handleStepChange(activeStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (!routeResult) return;
    if (activeStepIndex > 0) {
      handleStepChange(activeStepIndex - 1);
    }
  };

  // QR Entrance Selection
  const handleSelectEntrance = (floorId: FloorId, locationId: string, name: string) => {
    const floorLocs = floorDataMap[floorId]?.locations || [];
    const loc =
      floorLocs.find((l) => l.id.toLowerCase() === locationId.toLowerCase()) || floorLocs[0];

    const posX = loc ? Math.round(loc.x + loc.w / 2) : 1232;
    const posY = loc ? Math.round(loc.y + loc.h / 2) : 513;
    const finalLocId = loc ? loc.id : locationId;

    setStartLocation({
      name,
      floorId,
      locationId: finalLocId,
      x: posX,
      y: posY,
    });

    setCurrentFloor(floorId);
    setRouteResult(null);

    // Smoothly focus/center on the newly selected start location on the map
    setViewportState((prev) => {
      const k = Math.min(0.9, Math.max(0.38, prev.k));
      const windowW = window.innerWidth;
      const windowH = window.innerHeight * 0.75;
      return {
        k,
        x: windowW / 2 - posX * k,
        y: windowH / 2 - posY * k,
      };
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#070914] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#2e3094] border-t-[#801424] rounded-full animate-spin shadow-lg shadow-indigo-950/60" />
          <div className="text-center">
            <span
              className="text-base font-bold tracking-widest text-white uppercase block"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              Pokhara Trade Mall
            </span>
            <span className="text-xs text-indigo-400 uppercase tracking-wider font-semibold">
              Loading Interactive Floor Plans & Wayfinding...
            </span>
          </div>
        </div>
      </div>
    );
  }

  const currentFloorLocations = floorDataMap[currentFloor]?.locations || [];

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#070914] text-white selection:bg-[#801424] selection:text-white">
      {/* 1. Official Website Navigation Header */}
      <div className="flex-shrink-0 z-40">
        <NavigationBar />
      </div>

      {/* 2. Wayfinding App Interactive Workspace */}
      <main className="flex-1 min-h-0 w-full relative flex flex-col overflow-hidden">
        <div className={styles.container}>
          {/* Top Search & Category Filter Header */}
          <WayfindingHeader
            stores={stores}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onSelectStore={handleSelectStoreFromSearch}
          />

          {/* Interactive Workspace (Map Canvas + Desktop Sidebar / Mobile Drawer) */}
          <div className={styles.workspaceBody}>
            <div className={styles.stage}>
              <FloorSelector
                currentFloor={currentFloor}
                onFloorChange={(f) => {
                  setCurrentFloor(f);
                }}
              />

              <MapControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onZoomFit={handleZoomFit}
                onToggleQrSim={() => setIsQrModalOpen(true)}
              />

              <WayfindingMapStage
                currentFloor={currentFloor}
                floorData={floorDataMap[currentFloor] || null}
                stores={stores}
                activeCategory={activeCategory}
                selectedLocation={selectedLocation}
                selectedStore={selectedStore}
                startLocation={startLocation}
                routeNodePath={routeResult?.nodePath || []}
                graphNodeInfo={graphData.nodeInfo}
                onSelectLocation={handleSelectLocationOnMap}
                viewportState={viewportState}
                setViewportState={setViewportState}
              />
            </div>

            <StoreDetailsDrawer
              currentFloor={currentFloor}
              stores={stores}
              activeCategory={activeCategory}
              selectedStore={selectedStore}
              selectedLocation={selectedLocation}
              startLocation={startLocation}
              routeResult={routeResult}
              activeStepIndex={activeStepIndex}
              floorLocations={currentFloorLocations}
              onCategoryChange={setActiveCategory}
              onSelectStore={handleSelectStoreFromSearch}
              onGetDirections={handleGetDirections}
              onStepChange={handleStepChange}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              onCloseDetails={() => {
                setSelectedLocation(null);
                setSelectedStore(null);
              }}
              onCloseDirections={() => setRouteResult(null)}
            />
          </div>

          <QrSimulationModal
            isOpen={isQrModalOpen}
            onClose={() => setIsQrModalOpen(false)}
            onSelectEntrance={handleSelectEntrance}
          />
        </div>
      </main>
    </div>
  );
};

export default MallMapPage;
