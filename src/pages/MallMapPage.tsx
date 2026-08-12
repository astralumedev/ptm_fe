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
    locationId: 'G-01',
    x: 1015,
    y: 955,
  });

  // Navigation Route
  const [routeResult, setRouteResult] = useState<PathResult | null>(null);

  // Stage Viewport
  const [viewportState, setViewportState] = useState({ k: 0.2, x: 0, y: 0 });
  const [showUnderlay, setShowUnderlay] = useState(true);
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
      } catch (err) {
        console.error('Failed to initialize Mall Map:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // 2. Handle URL parameters (e.g. ?store=zara or ?from=ground_floor:G-01)
  useEffect(() => {
    if (isLoading || stores.length === 0) return;

    const storeParam = searchParams.get('store');
    const fromParam = searchParams.get('from');

    if (fromParam) {
      const parts = fromParam.split(':');
      if (parts.length === 2 && ALL_FLOORS.includes(parts[0] as FloorId)) {
        const floorId = parts[0] as FloorId;
        const locId = parts[1];
        const loc = floorDataMap[floorId]?.locations.find((l) => l.id === locId);

        setStartLocation({
          name: loc?.name || `Entrance (${locId})`,
          floorId,
          locationId: locId,
          x: loc ? Math.round(loc.x + loc.w / 2) : 1015,
          y: loc ? Math.round(loc.y + loc.h / 2) : 955,
        });
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
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;
    const W = 3508;
    const H = 4962;
    const padding = 24;

    const k = Math.min((windowW - padding * 2) / W, (windowH - padding * 2) / H);
    const x = (windowW - W * k) / 2;
    const y = (windowH - H * k) / 2;
    setViewportState({ k, x, y });
  }, []);

  const handleZoomIn = () => {
    setViewportState((prev) => ({ ...prev, k: Math.min(6.0, prev.k * 1.35) }));
  };

  const handleZoomOut = () => {
    setViewportState((prev) => ({ ...prev, k: Math.max(0.05, prev.k / 1.35) }));
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

  // Compute Route Directions
  const handleGetDirections = () => {
    if (!selectedLocation) return;

    const startNodeId = `${startLocation.floorId}:${startLocation.locationId}`;
    const endNodeId = `${currentFloor}:${selectedLocation.id}`;

    const route = findRoute(graphData, startNodeId, endNodeId);
    setRouteResult(route);

    if (startLocation.floorId !== currentFloor) {
      setCurrentFloor(startLocation.floorId);
    }
  };

  // QR Entrance Selection
  const handleSelectEntrance = (floorId: FloorId, locationId: string, name: string) => {
    const loc = floorDataMap[floorId]?.locations.find((l) => l.id === locationId);

    setStartLocation({
      name,
      floorId,
      locationId,
      x: loc ? Math.round(loc.x + loc.w / 2) : 1015,
      y: loc ? Math.round(loc.y + loc.h / 2) : 955,
    });

    setCurrentFloor(floorId);
    setRouteResult(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0b16] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#801424] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wider text-gray-300 uppercase">
            Loading Pokhara Trade Mall Map...
          </span>
        </div>
      </div>
    );
  }

  const currentFloorLocations = floorDataMap[currentFloor]?.locations || [];

  return (
    <div className={styles.container}>
      <WayfindingHeader
        stores={stores}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onSelectStore={handleSelectStoreFromSearch}
      />

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
          onToggleUnderlay={() => setShowUnderlay((prev) => !prev)}
          onToggleQrSim={() => setIsQrModalOpen(true)}
          showUnderlay={showUnderlay}
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
          showUnderlay={showUnderlay}
          onSelectLocation={handleSelectLocationOnMap}
          viewportState={viewportState}
          setViewportState={setViewportState}
        />

        <StoreDetailsDrawer
          currentFloor={currentFloor}
          selectedStore={selectedStore}
          selectedLocation={selectedLocation}
          startLocation={startLocation}
          routeResult={routeResult}
          floorLocations={currentFloorLocations}
          onGetDirections={handleGetDirections}
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
  );
};

export default MallMapPage;
