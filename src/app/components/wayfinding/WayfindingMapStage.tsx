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
  showUnderlay: boolean;
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
  showUnderlay,
  onSelectLocation,
  viewportState,
  setViewportState,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  // Auto-fit function based on container dimensions
  const fitMap = useCallback(() => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const W = 3508;
    const H = 4962;
    const padding = 24;

    const k = Math.min((rect.width - padding * 2) / W, (rect.height - padding * 2) / H);
    const x = (rect.width - W * k) / 2;
    const y = (rect.height - H * k) / 2;

    setViewportState({ k, x, y });
  }, [setViewportState]);

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
      const newK = Math.max(0.08, Math.min(6.0, prev.k * zoomFactor));
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
          {/* Invisible Background Rect for easy panning drag capture */}
          <rect x="-2000" y="-2000" width="8000" height="10000" fill="transparent" />

          {/* Background Floor Blueprint Image */}
          <image
            x="0"
            y="0"
            width="3508"
            height="4962"
            href={`/wayfinding/floor_plans/${currentFloor}.png`}
            preserveAspectRatio="none"
            style={{
              opacity: showUnderlay ? 0.6 : 0,
              transition: 'opacity 0.3s ease',
            }}
          />

          {/* Floor Silhouette Polygon */}
          {silhouettePointsStr && (
            <polygon
              points={silhouettePointsStr}
              fill="rgba(255, 255, 255, 0.03)"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth={3 / viewportState.k}
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
                ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`
                : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`;
              const strokeColor = isSelected ? '#ef4444' : catInfo.color;
              const strokeWidth = isSelected ? 4 / viewportState.k : 2 / viewportState.k;

              const storeName = store ? store.name : loc.name || loc.id;
              const cx = loc.x + loc.w / 2;
              const cy = loc.y + loc.h / 2;

              return (
                <g
                  key={loc.id}
                  style={{
                    cursor: 'pointer',
                    opacity: matchesFilter ? 1 : 0.15,
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
                    rx={6}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    style={{ transition: 'fill 0.2s, stroke 0.2s' }}
                  />
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize={Math.max(
                      11,
                      Math.min(loc.w / Math.max(storeName.length, 3) * 1.4, loc.h * 0.45, 26)
                    )}
                    fontWeight="700"
                    style={{
                      fontFamily: 'monospace',
                      paintOrder: 'stroke',
                      stroke: 'rgba(0,0,0,0.85)',
                      strokeWidth: '3.5px',
                      opacity: viewportState.k > 0.3 || isSelected ? 0.9 : 0,
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
                  r={6 / viewportState.k}
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth={2 / viewportState.k}
                />
              ))}
            </g>
          )}

          {/* You Are Here Pulsing Dot */}
          {startLocation && startLocation.floorId === currentFloor && (
            <g transform={`translate(${startLocation.x}, ${startLocation.y})`}>
              <circle className={styles.yahPulse} r={28} />
              <circle r={14} fill="#ef4444" stroke="#ffffff" strokeWidth={4} />
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
