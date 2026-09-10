import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  FloorId,
  FloorData,
  WayfindingLocation,
  WayfindingStore,
  CATEGORIES,
  GraphNode,
  CORRIDOR_SEGMENTS,
} from '../../../types/wayfinding';
import { hexToRgb, getSilhouettePoints } from '../../../lib/wayfindingGraph';
import { CategoryIcon } from './CategoryIcon';
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

  // Normalize silhouette points
  const silhouettePoints = useMemo(() => {
    return getSilhouettePoints(floorData?.silhouette);
  }, [floorData?.silhouette]);

  // Auto-fit function based on container dimensions and actual floor content bounds
  const fitMap = useCallback(() => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    let minX = 400;
    let minY = 400;
    let maxX = 3100;
    let maxY = 4500;

    const parsedSilhouette = getSilhouettePoints(floorData?.silhouette);

    if (floorData?.locations && floorData.locations.length > 0) {
      const xs = floorData.locations.map((l) => l.x);
      const ys = floorData.locations.map((l) => l.y);
      const rights = floorData.locations.map((l) => l.x + l.w);
      const bottoms = floorData.locations.map((l) => l.y + l.h);

      if (parsedSilhouette.length > 0) {
        minX = Math.min(...xs, ...parsedSilhouette.map((p) => p.x));
        minY = Math.min(...ys, ...parsedSilhouette.map((p) => p.y));
        maxX = Math.max(...rights, ...parsedSilhouette.map((p) => p.x));
        maxY = Math.max(...bottoms, ...parsedSilhouette.map((p) => p.y));
      } else {
        minX = Math.min(...xs);
        minY = Math.min(...ys);
        maxX = Math.max(...rights);
        maxY = Math.max(...bottoms);
      }
    } else if (parsedSilhouette.length > 0) {
      const xs = parsedSilhouette.map((p) => p.x);
      const ys = parsedSilhouette.map((p) => p.y);
      minX = Math.min(...xs);
      minY = Math.min(...ys);
      maxX = Math.max(...xs);
      maxY = Math.max(...ys);
    }

    const contentW = Math.max(100, maxX - minX);
    const contentH = Math.max(100, maxY - minY);
    const paddingX = Math.max(20, rect.width * 0.06);
    const paddingY = Math.max(20, rect.height * 0.06);

    const calculatedK = Math.min(
      (rect.width - paddingX * 2) / contentW,
      (rect.height - paddingY * 2) / contentH
    );
    const k = Math.max(0.16, Math.min(3.5, calculatedK));

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

  // Calculate current floor route nodes
  const currentFloorRouteNodes = useMemo(() => {
    return routeNodePath
      .map((nodeId) => graphNodeInfo[nodeId])
      .filter((n): n is GraphNode => Boolean(n && n.floorId === currentFloor));
  }, [routeNodePath, graphNodeInfo, currentFloor]);

  // Build SVG Path for Route on Current Floor
  const routeSvgPath = useMemo(() => {
    if (currentFloorRouteNodes.length > 1) {
      return currentFloorRouteNodes.reduce((acc, curr, idx) => {
        return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
      }, '');
    }
    return '';
  }, [currentFloorRouteNodes]);

  // Auto-focus smoothly onto active navigation route OR selected location
  useEffect(() => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
    const viewCenterX = rect.width / 2;
    const viewCenterY = rect.height * (isDesktop ? 0.50 : 0.38);

    // 1. If active navigation route on current floor exists with at least 2 nodes, fit entire route in view
    if (currentFloorRouteNodes.length >= 2) {
      const xs = currentFloorRouteNodes.map((n) => n.x);
      const ys = currentFloorRouteNodes.map((n) => n.y);
      const minRouteX = Math.min(...xs);
      const maxRouteX = Math.max(...xs);
      const minRouteY = Math.min(...ys);
      const maxRouteY = Math.max(...ys);

      const routeW = Math.max(280, maxRouteX - minRouteX);
      const routeH = Math.max(280, maxRouteY - minRouteY);
      const routeCenterX = (minRouteX + maxRouteX) / 2;
      const routeCenterY = (minRouteY + maxRouteY) / 2;

      const paddingX = Math.max(60, rect.width * 0.18);
      const paddingY = Math.max(60, rect.height * 0.18);

      const calcK = Math.min(
        (rect.width - paddingX * 2) / routeW,
        (rect.height - paddingY * 2) / routeH
      );
      const desiredK = Math.max(0.20, Math.min(1.2, calcK));

      const targetX = viewCenterX - routeCenterX * desiredK;
      const targetY = viewCenterY - routeCenterY * desiredK;

      setViewportState({
        k: desiredK,
        x: targetX,
        y: targetY,
      });
      return;
    }

    // 2. Otherwise if a store/location is selected, focus on it
    if (selectedLocation) {
      const targetCenterX = selectedLocation.x + selectedLocation.w / 2;
      const targetCenterY = selectedLocation.y + selectedLocation.h / 2;

      const desiredK = Math.min(
        1.1,
        Math.max(0.38, 700 / Math.max(selectedLocation.w, selectedLocation.h, 300))
      );

      const targetX = viewCenterX - targetCenterX * desiredK;
      const targetY = viewCenterY - targetCenterY * desiredK;

      setViewportState({
        k: desiredK,
        x: targetX,
        y: targetY,
      });
    }
  }, [currentFloorRouteNodes, selectedLocation, setViewportState]);

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

  // Attach non-passive wheel event listener to prevent browser scroll & provide smooth proportional zoom
  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;

    const onWheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const zoomFactor = Math.max(0.7, Math.min(1.3, Math.pow(0.9985, e.deltaY)));

      setViewportState((prev) => {
        const newK = Math.max(0.16, Math.min(3.5, prev.k * zoomFactor));
        const rect = stageEl.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newX = mouseX - (mouseX - prev.x) * (newK / prev.k);
        const newY = mouseY - (mouseY - prev.y) * (newK / prev.k);

        return { k: newK, x: newX, y: newY };
      });
    };

    stageEl.addEventListener('wheel', onWheelHandler, { passive: false });
    return () => {
      stageEl.removeEventListener('wheel', onWheelHandler);
    };
  }, [setViewportState]);

  // Silhouette points string
  const silhouettePointsStr = useMemo(() => {
    if (silhouettePoints.length < 3) return '';
    return silhouettePoints.map((p) => `${p.x},${p.y}`).join(' ');
  }, [silhouettePoints]);

  return (
    <div
      ref={stageRef}
      className={styles.stage}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <svg
        className={`${styles.svgMap} ${isDragging ? styles.svgMapActive : ''}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Refined Smaller Directional Route Arrowhead Marker */}
          <marker
            id="routeArrowEnd"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="5.5"
            markerHeight="5.5"
            orient="auto"
          >
            <path d="M 1 2 L 9 5 L 1 8 z" fill="#ef4444" stroke="#ffffff" strokeWidth="0.8" />
          </marker>
        </defs>

        <g
          transform={`translate(${viewportState.x}, ${viewportState.y}) scale(${viewportState.k})`}
        >
          {/* Invisible Background Rect for smooth pan drag capture */}
          <rect x="-4000" y="-4000" width="12000" height="14000" fill="transparent" />

          {/* Mall Floor Background along Silhouette Shape with Architectural Gray */}
          {silhouettePointsStr && (
            <g>
              {/* Main Mall Floor Gray Plate */}
              <polygon
                points={silhouettePointsStr}
                fill="#1a1f2c"
                stroke="rgba(156, 163, 175, 0.4)"
                strokeWidth={3.5 / viewportState.k}
                strokeLinejoin="round"
              />
              {/* Subtle Inner Accent Rim */}
              <polygon
                points={silhouettePointsStr}
                fill="transparent"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth={1 / viewportState.k}
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* Mall Walkways & Corridor Paths */}
          <g opacity={0.7} pointerEvents="none">
            {CORRIDOR_SEGMENTS.map((seg) => (
              <g key={seg.id}>
                {/* Broad corridor walkway background */}
                <line
                  x1={seg.a.x}
                  y1={seg.a.y}
                  x2={seg.b.x}
                  y2={seg.b.y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth={32 / viewportState.k}
                  strokeLinecap="round"
                />
                {/* Center hallway guideline */}
                <line
                  x1={seg.a.x}
                  y1={seg.a.y}
                  x2={seg.b.x}
                  y2={seg.b.y}
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth={1.5 / viewportState.k}
                  strokeDasharray={`${6 / viewportState.k} ${8 / viewportState.k}`}
                  strokeLinecap="round"
                />
              </g>
            ))}
          </g>

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

              const isTransit = ['stairs', 'staircase', 'elevator', 'lift'].includes(catKey.toLowerCase());
              const isUtility = ['restroom', 'toilet', 'washroom', 'wc', 'service', 'janitor', 'cleaning', 'electrical', 'utility', 'void'].includes(catKey.toLowerCase());

              // Visibility rules
              const showIcon = isUtility || isTransit || viewportState.k <= 0.28;
              const showText = !isUtility && (isTransit ? (viewportState.k > 0.35 && loc.h > 60) : (viewportState.k > 0.28 || isSelected));
              const iconOffset = showText && isTransit ? -Math.min(14, loc.h * 0.18) : 0;
              const textOffset = isTransit ? Math.min(18, loc.h * 0.22) : 0;

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

                  {/* 1. Category / Amenity Icon */}
                  {showIcon && (
                    <g
                      transform={`translate(${cx}, ${cy + iconOffset})`}
                      style={{
                        pointerEvents: 'none',
                      }}
                    >
                      <g transform={`scale(${Math.max(0.65, Math.min(1.5, 0.28 / viewportState.k))})`}>
                        <g transform="translate(-10, -10)">
                          <CategoryIcon category={catKey} size={20} color={isUtility || isTransit ? strokeColor : strokeColor} />
                        </g>
                      </g>
                    </g>
                  )}

                  {/* 2. Store / Transit Name Text */}
                  {showText && (
                    <text
                      x={cx}
                      y={cy + textOffset}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#ffffff"
                      fontSize={Math.max(
                        11,
                        Math.min((loc.w / Math.max(storeName.length, 3)) * 1.5, loc.h * (isTransit ? 0.28 : 0.45), isTransit ? 18 : 30)
                      )}
                      fontWeight={isTransit ? '600' : '700'}
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        paintOrder: 'stroke',
                        stroke: 'rgba(0,0,0,0.9)',
                        strokeWidth: '3.5px',
                        pointerEvents: 'none',
                      }}
                    >
                      {storeName.replace(/ & /g, '·')}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Simplified Navigation Route Path with Directional Arrow */}
          {routeSvgPath && currentFloorRouteNodes.length >= 2 && (
            <g>
              {/* 1. Clean Solid Route Line with Destination Arrowhead */}
              <path
                d={routeSvgPath}
                fill="none"
                stroke="#ef4444"
                strokeWidth={3 / viewportState.k}
                strokeLinecap="round"
                strokeLinejoin="round"
                markerEnd="url(#routeArrowEnd)"
              />

              {/* 2. Sleek Directional Dash Animation from Point A to Point B */}
              <path
                d={routeSvgPath}
                className={styles.animatedRouteArrows}
                fill="none"
                stroke="#ffffff"
                strokeWidth={1.5 / viewportState.k}
                strokeDasharray={`${6 / viewportState.k} ${10 / viewportState.k}`}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 3. Start Point Marker (Floor Departure) */}
              {currentFloorRouteNodes[0] && (
                <g transform={`translate(${currentFloorRouteNodes[0].x}, ${currentFloorRouteNodes[0].y})`}>
                  <circle
                    r={4 / viewportState.k}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth={1.5 / viewportState.k}
                  />
                </g>
              )}

              {/* 4. Destination Marker (Floor Target) */}
              {currentFloorRouteNodes[currentFloorRouteNodes.length - 1] && (
                <g
                  transform={`translate(${
                    currentFloorRouteNodes[currentFloorRouteNodes.length - 1].x
                  }, ${currentFloorRouteNodes[currentFloorRouteNodes.length - 1].y})`}
                >
                  <circle
                    r={4.5 / viewportState.k}
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth={1.5 / viewportState.k}
                  />
                </g>
              )}
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
