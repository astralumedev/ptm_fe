import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FloorId,
  FloorData,
  WayfindingLocation,
  WayfindingStore,
  CATEGORIES,
  GraphNode
} from '../../../types/wayfinding';
import { hexToRgb } from '../../../lib/wayfindingGraph';
import styles from './Wayfinding.module.css';

interface WayfindingMapStageProps {
  currentFloor: FloorId;
  floorData: FloorData | null;
  stores: WayfindingStore[];
  activeCategory: string | null;
  selectedLocation: WayfindingLocation | null;
  selectedStore: WayfindingStore | null;
  startLocation: { name: string; floorId: FloorId; x: number; y: number } | null;
  routeNodePath: string[];
  graphNodeInfo: Record<string, GraphNode>;
  onSelectLocation: (loc: WayfindingLocation, store: WayfindingStore | null) => void;
  viewportState: { k: number; x: number; y: number };
  setViewportState: React.Dispatch<React.SetStateAction<{ k: number; x: number; y: number }>>;
}

export const WayfindingMapStage: React.FC<WayfindingMapStageProps> = ({
  currentFloor,
  floorData,
  stores,
  activeCategory,
  selectedLocation,
  selectedStore: _selectedStore,
  startLocation,
  routeNodePath,
  graphNodeInfo,
  onSelectLocation,
  viewportState,
  setViewportState,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  // Auto-fit function based on container dimensions and actual floor content bounds
  const fitMap = useCallback(() => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    let minX = 400;
    let minY = 400;
    let maxX = 3100;
    let maxY = 4500;

    if (floorData?.locations && floorData.locations.length > 0) {
      const xs = floorData.locations.map((l) => l.x);
      const ys = floorData.locations.map((l) => l.y);
      const rights = floorData.locations.map((l) => l.x + l.w);
      const bottoms = floorData.locations.map((l) => l.y + l.h);

      minX = Math.min(...xs);
      minY = Math.min(...ys);
      maxX = Math.max(...rights);
      maxY = Math.max(...bottoms);
    } else if (floorData?.silhouette && floorData.silhouette.length > 0) {
      const xs = floorData.silhouette.map((p) => p.x);
      const ys = floorData.silhouette.map((p) => p.y);
      minX = Math.min(...xs);
      minY = Math.min(...ys);
      maxX = Math.max(...xs);
      maxY = Math.max(...ys);
    }

    const contentW = Math.max(100, maxX - minX);
    const contentH = Math.max(100, maxY - minY);
    const paddingX = Math.max(20, rect.width * 0.06);
    const paddingY = Math.max(20, rect.height * 0.06);

    const k = Math.min(
      (rect.width - paddingX * 2) / contentW,
      (rect.height - paddingY * 2) / contentH
    );

    const x = (rect.width - contentW * k) / 2 - minX * k;
    const y = (rect.height - contentH * k) / 2 - minY * k;

    setViewportState({ k, x, y });
  }, [floorData, setViewportState]);

  // Initial fit on mount & when floor changes
  useEffect(() => {
    fitMap();
  }, [currentFloor, fitMap]);

  // Handle Container Resize
  useEffect(() => {
    if (!stageRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      fitMap();
    });
    resizeObserver.observe(stageRef.current);
    return () => resizeObserver.disconnect();
  }, [fitMap]);

  // Find store associated with a shutter ID
  const getStoreByShutter = useCallback(
    (shutterId: string): WayfindingStore | null => {
      const key = `${currentFloor}:${shutterId}`;
      return stores.find((s) => s.shutters?.includes(key)) || null;
    },
    [currentFloor, stores]
  );

  // Handle Drag Panning
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - viewportState.x,
      y: e.clientY - viewportState.y,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      setViewportState((prev) => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Handle Mouse Wheel Zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;

    setViewportState((prev) => {
      const newK = Math.max(0.08, Math.min(8.0, prev.k * zoomFactor));
      if (!stageRef.current) return prev;

      const rect = stageRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newX = mouseX - (mouseX - prev.x) * (newK / prev.k);
      const newY = mouseY - (mouseY - prev.y) * (newK / prev.k);

      return { k: newK, x: newX, y: newY };
    });
  };

  // Build SVG Path for Route on Current Floor
  const currentFloorRouteNodes = routeNodePath
    .map((nodeId) => graphNodeInfo[nodeId])
    .filter((n) => n && n.floorId === currentFloor);

  let routeSvgPath = '';
  if (currentFloorRouteNodes.length > 1) {
    routeSvgPath = currentFloorRouteNodes.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');
  }

  // Silhouette points string
  const silhouettePointsStr =
    floorData?.silhouette && floorData.silhouette.length >= 3
      ? floorData.silhouette.map((p) => `${p.x},${p.y}`).join(' ')
      : '';

  return (
    <div
      ref={stageRef}
      className={styles.stage}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    >
      <svg
        className={`${styles.svgMap} ${isDragging ? styles.svgMapActive : ''}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g
          transform={`translate(${viewportState.x}, ${viewportState.y}) scale(${viewportState.k})`}
        >
          {/* Invisible Background Rect for smooth pan drag capture */}
          <rect x="-4000" y="-4000" width="12000" height="14000" fill="transparent" />

          {/* Floor Silhouette Polygon / Base */}
          {silhouettePointsStr && (
            <polygon
              points={silhouettePointsStr}
              fill="rgba(255, 255, 255, 0.04)"
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth={4 / viewportState.k}
              strokeLinejoin="round"
            />
          )}

          {/* Locations & Hotspots */}
          <g>
            {floorData?.locations.map((loc) => {
              const store = getStoreByShutter(loc.id);
              const catKey = store ? store.cat : loc.cat;

              let matchesFilter = true;
              if (activeCategory !== null) {
                matchesFilter = (store && store.cat === activeCategory) || loc.cat === activeCategory;
              }

              const catInfo = CATEGORIES[catKey] || CATEGORIES.service;
              const rgb = hexToRgb(catInfo.color);
              const isSelected = selectedLocation?.id === loc.id;
              const fillColor = isSelected
                ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.65)`
                : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.28)`;
              const strokeColor = isSelected ? '#ffffff' : catInfo.color;
              const strokeWidth = isSelected ? 5 / viewportState.k : 2.5 / viewportState.k;

              const storeName = store ? store.name : loc.name || loc.id;
              const cx = loc.x + loc.w / 2;
              const cy = loc.y + loc.h / 2;

              return (
                <g
                  key={loc.id}
                  style={{
                    cursor: 'pointer',
                    opacity: matchesFilter ? 1 : 0.12,
                    pointerEvents: matchesFilter ? 'all' : 'none',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLocation(loc, store);
                  }}
                  onPointerEnter={(e) => {
                    if (!matchesFilter) return;
                    setTooltip({ text: `${loc.id}: ${storeName}`, x: e.clientX, y: e.clientY });
                  }}
                  onPointerMove={(e) => {
                    if (!matchesFilter) return;
                    setTooltip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
                  }}
                  onPointerLeave={() => setTooltip(null)}
                >
                  <rect
                    x={loc.x}
                    y={loc.y}
                    width={Math.max(1, loc.w)}
                    height={Math.max(1, loc.h)}
                    rx={8}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    filter={isSelected ? 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.7))' : undefined}
                    style={{ transition: 'fill 0.2s, stroke 0.2s' }}
                  />
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize={Math.max(
                      12,
                      Math.min(loc.w / Math.max(storeName.length, 3) * 1.5, loc.h * 0.45, 30)
                    )}
                    fontWeight="700"
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      paintOrder: 'stroke',
                      stroke: 'rgba(0,0,0,0.9)',
                      strokeWidth: '4px',
                      opacity: viewportState.k > 0.25 || isSelected ? 0.95 : 0,
                      transition: 'opacity 0.2s ease',
                      pointerEvents: 'none',
                    }}
                  >
                    {storeName.replace(/ & /g, '·')}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Navigation Path Route */}
          {routeSvgPath && (
            <g>
              <path d={routeSvgPath} className={styles.animatedRoutePath} />
              {currentFloorRouteNodes.map((n, idx) => (
                <circle
                  key={idx}
                  cx={n.x}
                  cy={n.y}
                  r={7 / viewportState.k}
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth={2.5 / viewportState.k}
                />
              ))}
            </g>
          )}

          {/* You Are Here Pulsing Dot */}
          {startLocation && startLocation.floorId === currentFloor && (
            <g transform={`translate(${startLocation.x}, ${startLocation.y})`}>
              <circle className={styles.yahPulse} r={32} />
              <circle r={15} fill="#ef4444" stroke="#ffffff" strokeWidth={4} />
              <circle r={5} fill="#ffffff" />
            </g>
          )}
        </g>
      </svg>

      {/* Map Hover Tooltip */}
      {tooltip && (
        <div
          className={styles.mapTooltip}
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};
