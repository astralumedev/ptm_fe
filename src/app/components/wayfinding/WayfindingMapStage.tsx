import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  FloorId,
  FloorData,
  WayfindingLocation,
  WayfindingStore,
  CATEGORIES,
  GraphNode,
  CORRIDOR_SEGMENTS,
  FLOOR_LABELS,
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
  startLocation: { name: string; floorId: FloorId; locationId?: string; x: number; y: number } | null;
  routeNodePath: string[];
  graphNodeInfo: Record<string, GraphNode>;
  onSelectLocation: (loc: WayfindingLocation | null, store: WayfindingStore | null) => void;
  viewportState: { k: number; x: number; y: number };
  setViewportState: React.Dispatch<React.SetStateAction<{ k: number; x: number; y: number }>>;
}

export const WayfindingMapStage: React.FC<WayfindingMapStageProps> = ({
  currentFloor,
  floorData,
  stores,
  activeCategory,
  selectedLocation,
  selectedStore,
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

  // Analyze Active Route details for Current Floor (Transit, Start, Destination)
  const routeAnalysis = useMemo(() => {
    if (!routeNodePath || routeNodePath.length === 0) {
      return {
        isNavigating: false,
        isStartFloor: Boolean(startLocation && startLocation.floorId === currentFloor),
        isDestinationFloor: Boolean(selectedLocation),
        transitNodes: [] as Array<{
          id: string;
          location?: WayfindingLocation;
          targetFloorLabel: string;
          isExit: boolean;
          isElevator: boolean;
          x: number;
          y: number;
        }>,
        startPoint:
          startLocation && startLocation.floorId === currentFloor
            ? { x: startLocation.x, y: startLocation.y, label: startLocation.name || 'You Are Here' }
            : null,
        destinationPoint:
          selectedLocation
            ? {
                x: selectedLocation.x + selectedLocation.w / 2,
                y: selectedLocation.y + selectedLocation.h / 2,
                label: selectedStore?.name || selectedLocation.name || selectedLocation.id,
                location: selectedLocation,
              }
            : null,
        routeLocationIds: new Set<string>(),
      };
    }

    const firstGlobalNodeId = routeNodePath[0];
    const lastGlobalNodeId = routeNodePath[routeNodePath.length - 1];

    const firstNode = graphNodeInfo[firstGlobalNodeId];
    const lastNode = graphNodeInfo[lastGlobalNodeId];

    const isStartFloor = Boolean(
      (startLocation && startLocation.floorId === currentFloor) ||
      (firstNode && firstNode.floorId === currentFloor)
    );
    const isDestinationFloor = Boolean(
      (selectedLocation && lastNode && lastNode.floorId === currentFloor) ||
      (lastNode && lastNode.floorId === currentFloor)
    );

    const routeLocationIds = new Set<string>();

    // Find all location IDs on current floor that are part of route
    routeNodePath.forEach((nodeId) => {
      const node = graphNodeInfo[nodeId];
      if (node && node.floorId === currentFloor) {
        routeLocationIds.add(node.id);
        if (node.id.startsWith('door_') || node.id.startsWith('wp_')) {
          const baseId = node.id.replace(/^door_/, '').replace(/^wp_/, '');
          routeLocationIds.add(baseId);
        }
      }
    });

    // Check transitions across floors along the route (Stairs / Elevators)
    const transitNodes: Array<{
      id: string;
      location?: WayfindingLocation;
      targetFloorLabel: string;
      isExit: boolean;
      isElevator: boolean;
      x: number;
      y: number;
    }> = [];

    for (let i = 0; i < routeNodePath.length - 1; i++) {
      const u = graphNodeInfo[routeNodePath[i]];
      const v = graphNodeInfo[routeNodePath[i + 1]];
      if (u && v && u.floorId !== v.floorId) {
        // Leaving current floor via stairs/lift:
        if (u.floorId === currentFloor) {
          const loc = floorData?.locations.find((l) => l.id === u.id);
          const isElevator =
            u.id.toLowerCase().includes('elevator') ||
            u.id.toLowerCase().includes('lift') ||
            loc?.cat === 'elevator';
          const targetFloorLabel = FLOOR_LABELS[v.floorId] || v.floorId;

          const cx = loc ? loc.x + loc.w / 2 : u.x;
          const cy = loc ? loc.y + loc.h / 2 : u.y;

          transitNodes.push({
            id: u.id,
            location: loc,
            targetFloorLabel: `To ${targetFloorLabel}`,
            isExit: true,
            isElevator,
            x: cx,
            y: cy,
          });
          if (loc) routeLocationIds.add(loc.id);
        }

        // Arriving on current floor from stairs/lift:
        if (v.floorId === currentFloor) {
          const loc = floorData?.locations.find((l) => l.id === v.id);
          const isElevator =
            v.id.toLowerCase().includes('elevator') ||
            v.id.toLowerCase().includes('lift') ||
            loc?.cat === 'elevator';
          const fromFloorLabel = FLOOR_LABELS[u.floorId] || u.floorId;

          const cx = loc ? loc.x + loc.w / 2 : v.x;
          const cy = loc ? loc.y + loc.h / 2 : v.y;

          transitNodes.push({
            id: v.id,
            location: loc,
            targetFloorLabel: `From ${fromFloorLabel}`,
            isExit: false,
            isElevator,
            x: cx,
            y: cy,
          });
          if (loc) routeLocationIds.add(loc.id);
        }
      }
    }

    // Start point on this floor
    let startPoint: { x: number; y: number; label: string } | null = null;
    if (isStartFloor) {
      if (startLocation && startLocation.floorId === currentFloor) {
        startPoint = { x: startLocation.x, y: startLocation.y, label: startLocation.name || 'You Are Here' };
      } else if (firstNode) {
        startPoint = { x: firstNode.x, y: firstNode.y, label: firstNode.label || 'Start Point' };
      }
    }

    // Destination point on this floor
    let destinationPoint: { x: number; y: number; label: string; location?: WayfindingLocation } | null = null;
    if (isDestinationFloor) {
      if (selectedLocation) {
        destinationPoint = {
          x: selectedLocation.x + selectedLocation.w / 2,
          y: selectedLocation.y + selectedLocation.h / 2,
          label: selectedStore?.name || selectedLocation.name || selectedLocation.id,
          location: selectedLocation,
        };
        routeLocationIds.add(selectedLocation.id);
      } else if (lastNode) {
        const destLoc = floorData?.locations.find((l) => l.id === lastNode.id);
        destinationPoint = {
          x: lastNode.x,
          y: lastNode.y,
          label: lastNode.label || 'Destination',
          location: destLoc,
        };
        if (destLoc) routeLocationIds.add(destLoc.id);
      }
    }

    return {
      isNavigating: true,
      isStartFloor,
      isDestinationFloor,
      transitNodes,
      startPoint,
      destinationPoint,
      routeLocationIds,
    };
  }, [routeNodePath, graphNodeInfo, currentFloor, floorData, startLocation, selectedLocation, selectedStore]);

  // Auto-focus smoothly onto active navigation route OR newly selected location (only once per selection change)
  const prevSelectedIdRef = useRef<string | null>(null);
  const prevRouteKeyRef = useRef<string>('');

  useEffect(() => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
    const viewCenterX = rect.width / 2;
    const viewCenterY = rect.height * (isDesktop ? 0.50 : 0.38);

    // 1. If active navigation route on current floor exists, auto-fit only when route changes
    const routeKey = currentFloorRouteNodes.map((n) => `${n.x},${n.y}`).join('|');
    if (currentFloorRouteNodes.length >= 2) {
      if (prevRouteKeyRef.current === routeKey) return;
      prevRouteKeyRef.current = routeKey;

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
    prevRouteKeyRef.current = '';

    // 2. Otherwise if a new store/location is selected, focus on it once
    if (selectedLocation) {
      if (prevSelectedIdRef.current === selectedLocation.id) {
        return; // Already focused on this selection, allow user to freely drag/zoom without snapping back
      }
      prevSelectedIdRef.current = selectedLocation.id;

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
    } else {
      prevSelectedIdRef.current = null;
    }
  }, [currentFloorRouteNodes, selectedLocation, setViewportState]);

  // Touch & Pointer Gesture Tracking
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const initialPinchDistanceRef = useRef<number | null>(null);
  const initialPinchScaleRef = useRef<number>(1);
  const lastTapTimeRef = useRef<number>(0);
  const lastTapPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDraggedRef = useRef<boolean>(false);
  const pointerDownStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle pointer down (mouse click, single touch, multi-touch pinch)
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only capture primary mouse button or touch
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    hasDraggedRef.current = false;
    pointerDownStartPosRef.current = { x: e.clientX, y: e.clientY };

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Handle 2-finger Pinch to Zoom Start
    if (pointersRef.current.size === 2) {
      const points = Array.from(pointersRef.current.values());
      const dist = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      initialPinchDistanceRef.current = dist;
      initialPinchScaleRef.current = viewportState.k;
      setIsDragging(false);
      return;
    }

    // Handle Single Pointer Drag & Double Tap Detection
    if (pointersRef.current.size === 1) {
      const now = Date.now();
      const timeDiff = now - lastTapTimeRef.current;
      const distDiff = Math.hypot(e.clientX - lastTapPosRef.current.x, e.clientY - lastTapPosRef.current.y);

      // Double tap detected (< 320ms and < 25px movement)
      if (timeDiff < 320 && distDiff < 25) {
        lastTapTimeRef.current = 0;
        // Double tap zoom in centered at tap position
        if (stageRef.current) {
          const rect = stageRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          const targetK = Math.min(3.5, viewportState.k * 1.6);
          const newX = mouseX - (mouseX - viewportState.x) * (targetK / viewportState.k);
          const newY = mouseY - (mouseY - viewportState.y) * (targetK / viewportState.k);
          setViewportState({ k: targetK, x: newX, y: newY });
        }
        return;
      }

      lastTapTimeRef.current = now;
      lastTapPosRef.current = { x: e.clientX, y: e.clientY };

      setIsDragging(true);
      setDragStart({
        x: e.clientX - viewportState.x,
        y: e.clientY - viewportState.y,
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const moveDist = Math.hypot(
      e.clientX - pointerDownStartPosRef.current.x,
      e.clientY - pointerDownStartPosRef.current.y
    );
    if (moveDist > 8) {
      hasDraggedRef.current = true;
      if (stageRef.current && !stageRef.current.hasPointerCapture(e.pointerId)) {
        try {
          stageRef.current.setPointerCapture(e.pointerId);
        } catch {
          // Ignore
        }
      }
    }

    // 2-Finger Pinch Zooming
    if (pointersRef.current.size === 2 && initialPinchDistanceRef.current && stageRef.current) {
      const points = Array.from(pointersRef.current.values());
      const currentDist = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      const scaleDelta = currentDist / initialPinchDistanceRef.current;
      const targetK = Math.max(0.16, Math.min(3.5, initialPinchScaleRef.current * scaleDelta));

      const rect = stageRef.current.getBoundingClientRect();
      const midX = (points[0].x + points[1].x) / 2 - rect.left;
      const midY = (points[0].y + points[1].y) / 2 - rect.top;

      setViewportState((prev) => {
        const newX = midX - (midX - prev.x) * (targetK / prev.k);
        const newY = midY - (midY - prev.y) * (targetK / prev.k);
        return { k: targetK, x: newX, y: newY };
      });
      return;
    }

    // 1-Finger Dragging
    if (isDragging && pointersRef.current.size === 1) {
      setViewportState((prev) => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (stageRef.current) {
      try {
        if (stageRef.current.hasPointerCapture(e.pointerId)) {
          stageRef.current.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore
      }
    }

    pointersRef.current.delete(e.pointerId);

    if (pointersRef.current.size === 0) {
      setIsDragging(false);
      initialPinchDistanceRef.current = null;
    } else if (pointersRef.current.size === 1) {
      // Reset drag start for remaining pointer so it doesn't jump
      const remaining = Array.from(pointersRef.current.values())[0];
      setDragStart({
        x: remaining.x - viewportState.x,
        y: remaining.y - viewportState.y,
      });
      setIsDragging(true);
      initialPinchDistanceRef.current = null;
    }
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
      onClick={(e) => {
        if (e.target === e.currentTarget && !hasDraggedRef.current && selectedLocation) {
          onSelectLocation(null, null);
        }
      }}
    >
      <svg
        className={`${styles.svgMap} ${isDragging ? styles.svgMapActive : ''}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Refined Directional Route Arrowhead Marker */}
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
          {/* Background Rect for pan drag capture & click to deselect */}
          <rect
            x="-4000"
            y="-4000"
            width="12000"
            height="14000"
            fill="transparent"
            onClick={(e) => {
              if (hasDraggedRef.current) return;
              e.stopPropagation();
              onSelectLocation(null, null);
            }}
          />

          {/* Mall Floor Background along Silhouette Shape with Architectural Gray */}
          {silhouettePointsStr && (
            <g
              onClick={(e) => {
                if (hasDraggedRef.current) return;
                e.stopPropagation();
                onSelectLocation(null, null);
              }}
            >
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

              const isAnySelected = Boolean(selectedLocation);
              const isSelected = selectedLocation?.id === loc.id;
              const isRouteActive = routeAnalysis.isNavigating;
              const isLocOnRoute = routeAnalysis.routeLocationIds.has(loc.id);
              const isLocDestination =
                routeAnalysis.isDestinationFloor &&
                (selectedLocation?.id === loc.id ||
                  routeAnalysis.destinationPoint?.location?.id === loc.id);
              const isLocTransit = routeAnalysis.transitNodes.some(
                (t) => t.id === loc.id || t.location?.id === loc.id
              );
              const isLocStart =
                routeAnalysis.isStartFloor &&
                startLocation &&
                startLocation.floorId === currentFloor &&
                startLocation.locationId === loc.id;

              let opacity = 1;
              let pointerEnabled = true;

              if (activeCategory !== null) {
                const matchesCat = (store && store.cat === activeCategory) || loc.cat === activeCategory;
                opacity = matchesCat ? 1 : 0.12;
                pointerEnabled = matchesCat;
              } else if (isRouteActive) {
                if (isLocDestination || isLocTransit || isLocStart || isLocOnRoute || isSelected) {
                  opacity = 1;
                } else {
                  opacity = 0.18; // Dim non-route stores during active navigation
                }
                pointerEnabled = true;
              } else if (isAnySelected) {
                opacity = isSelected ? 1 : 0.28;
                pointerEnabled = true;
              }

              const catInfo = CATEGORIES[catKey] || CATEGORIES.service;
              const rgb = hexToRgb(catInfo.color);

              let fillColor = isSelected
                ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85)`
                : `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.28)`;
              let strokeColor = isSelected ? '#ffffff' : catInfo.color;
              let strokeWidth = isSelected ? 6 / viewportState.k : 2.5 / viewportState.k;
              let filterEffect: string | undefined = isSelected
                ? 'drop-shadow(0 0 18px rgba(239, 68, 68, 0.95))'
                : undefined;

              if (isLocDestination) {
                fillColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.88)`;
                strokeColor = '#ffffff';
                strokeWidth = 6 / viewportState.k;
                filterEffect = 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.95))';
              } else if (isLocTransit) {
                fillColor = 'rgba(245, 158, 11, 0.45)';
                strokeColor = '#f59e0b';
                strokeWidth = 5 / viewportState.k;
                filterEffect = 'drop-shadow(0 0 16px rgba(245, 158, 11, 0.95))';
              } else if (isLocStart) {
                fillColor = 'rgba(16, 185, 129, 0.45)';
                strokeColor = '#10b981';
                strokeWidth = 5 / viewportState.k;
                filterEffect = 'drop-shadow(0 0 16px rgba(16, 185, 129, 0.95))';
              }

              const storeName = store ? store.name : loc.name || loc.id;
              const cx = loc.x + loc.w / 2;
              const cy = loc.y + loc.h / 2;

              const isTransit = ['stairs', 'staircase', 'elevator', 'lift'].includes(catKey.toLowerCase());
              const isUtility = ['restroom', 'toilet', 'washroom', 'wc', 'service', 'janitor', 'cleaning', 'electrical', 'utility', 'void'].includes(catKey.toLowerCase());

              // Visibility rules
              const showIcon = isUtility || isTransit || viewportState.k <= 0.28 || isLocTransit;
              const showText = !isUtility && (isTransit ? (viewportState.k > 0.35 && loc.h > 60) : (viewportState.k > 0.28 || isSelected || isLocDestination));
              const iconOffset = showText && isTransit ? -Math.min(14, loc.h * 0.18) : 0;
              const textOffset = isTransit ? Math.min(18, loc.h * 0.22) : 0;

              return (
                <g
                  key={loc.id}
                  style={{
                    cursor: 'pointer',
                    opacity,
                    pointerEvents: pointerEnabled ? 'all' : 'none',
                    transition: 'opacity 0.25s ease',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasDraggedRef.current) return;
                    onSelectLocation(loc, store);
                  }}
                  onPointerEnter={(e) => {
                    if (!pointerEnabled) return;
                    setTooltip({ text: `${loc.id}: ${storeName}`, x: e.clientX, y: e.clientY });
                  }}
                  onPointerMove={(e) => {
                    if (!pointerEnabled) return;
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
                    filter={filterEffect}
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
                      fontWeight={isTransit || isLocDestination ? '700' : '600'}
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
                strokeWidth={3.5 / viewportState.k}
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
                strokeWidth={1.8 / viewportState.k}
                strokeDasharray={`${7 / viewportState.k} ${11 / viewportState.k}`}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 3. Floor Departure / Arrival Waypoint Marker */}
              {currentFloorRouteNodes[0] && (
                <g transform={`translate(${currentFloorRouteNodes[0].x}, ${currentFloorRouteNodes[0].y})`}>
                  <circle
                    r={4.5 / viewportState.k}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth={1.5 / viewportState.k}
                  />
                </g>
              )}

              {/* 4. Floor Target Marker */}
              {currentFloorRouteNodes[currentFloorRouteNodes.length - 1] && (
                <g
                  transform={`translate(${
                    currentFloorRouteNodes[currentFloorRouteNodes.length - 1].x
                  }, ${currentFloorRouteNodes[currentFloorRouteNodes.length - 1].y})`}
                >
                  <circle
                    r={5 / viewportState.k}
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth={1.5 / viewportState.k}
                  />
                </g>
              )}
            </g>
          )}

          {/* TRANSIT HIGHLIGHT BADGES (Stairs / Elevators on this floor) */}
          {routeAnalysis.transitNodes.map((transit) => {
            const badgeW = 150 / viewportState.k;
            const badgeH = 26 / viewportState.k;
            const fontSize = Math.max(9, Math.min(13, 10.5 / viewportState.k));
            const yOffset = -30 / viewportState.k;

            return (
              <g
                key={`transit-pin-${transit.id}`}
                transform={`translate(${transit.x}, ${transit.y})`}
                className={styles.floatingMapBadge}
                style={{ pointerEvents: 'none' }}
              >
                {/* Pulsing Beacon Rings */}
                <circle
                  className={transit.isElevator ? styles.startPulse : styles.transitPulse}
                  r={24 / viewportState.k}
                />
                <circle
                  r={9 / viewportState.k}
                  fill={transit.isElevator ? '#06b6d4' : '#f59e0b'}
                  stroke="#ffffff"
                  strokeWidth={2.5 / viewportState.k}
                />

                {/* Floating Transit Pill Badge */}
                <g transform={`translate(0, ${yOffset})`}>
                  <rect
                    x={-badgeW / 2}
                    y={-badgeH / 2}
                    width={badgeW}
                    height={badgeH}
                    rx={badgeH / 2}
                    fill={transit.isElevator ? 'rgba(8, 47, 73, 0.96)' : 'rgba(69, 26, 3, 0.96)'}
                    stroke={transit.isElevator ? '#06b6d4' : '#f59e0b'}
                    strokeWidth={1.8 / viewportState.k}
                    filter="drop-shadow(0 4px 12px rgba(0, 0, 0, 0.85))"
                  />
                  <text
                    x={0}
                    y={1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize={fontSize}
                    fontWeight="700"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {transit.isExit
                      ? transit.isElevator
                        ? `Elevator ${transit.targetFloorLabel}`
                        : `Stairs ${transit.targetFloorLabel}`
                      : transit.targetFloorLabel}
                  </text>
                </g>
              </g>
            );
          })}

          {/* START / CURRENT LOCATION BEACON ("YOU ARE HERE") */}
          {startLocation && startLocation.floorId === currentFloor && (
            <g
              transform={`translate(${startLocation.x}, ${startLocation.y})`}
              className={styles.floatingMapBadge}
              style={{ pointerEvents: 'none' }}
            >
              {/* Pulsing Emerald Rings */}
              <circle className={styles.startPulse} r={32 / viewportState.k} />
              <circle
                r={10 / viewportState.k}
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth={2.8 / viewportState.k}
              />
              <circle r={3.5 / viewportState.k} fill="#ffffff" />

              {/* Floating Start Badge */}
              <g transform={`translate(0, ${-28 / viewportState.k})`}>
                <rect
                  x={-60 / viewportState.k}
                  y={-12 / viewportState.k}
                  width={120 / viewportState.k}
                  height={24 / viewportState.k}
                  rx={12 / viewportState.k}
                  fill="rgba(6, 78, 59, 0.96)"
                  stroke="#10b981"
                  strokeWidth={1.8 / viewportState.k}
                  filter="drop-shadow(0 4px 12px rgba(0, 0, 0, 0.85))"
                />
                <text
                  x={0}
                  y={1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#ffffff"
                  fontSize={Math.max(9, Math.min(13, 10 / viewportState.k))}
                  fontWeight="700"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  YOU ARE HERE
                </text>
              </g>
            </g>
          )}

          {/* DESTINATION BEACON ("DESTINATION") */}
          {routeAnalysis.isDestinationFloor && routeAnalysis.destinationPoint && (
            <g
              transform={`translate(${routeAnalysis.destinationPoint.x}, ${routeAnalysis.destinationPoint.y})`}
              className={styles.floatingMapBadge}
              style={{ pointerEvents: 'none' }}
            >
              {/* Pulsing Red Rings */}
              <circle className={styles.destPulse} r={36 / viewportState.k} />
              <circle
                r={11 / viewportState.k}
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth={3 / viewportState.k}
              />
              <circle r={4 / viewportState.k} fill="#ffffff" />

              {/* Floating Destination Badge */}
              <g transform={`translate(0, ${-32 / viewportState.k})`}>
                <rect
                  x={-68 / viewportState.k}
                  y={-13 / viewportState.k}
                  width={136 / viewportState.k}
                  height={26 / viewportState.k}
                  rx={13 / viewportState.k}
                  fill="rgba(128, 20, 36, 0.96)"
                  stroke="#ef4444"
                  strokeWidth={1.8 / viewportState.k}
                  filter="drop-shadow(0 4px 14px rgba(239, 68, 68, 0.6))"
                />
                <text
                  x={0}
                  y={1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#ffffff"
                  fontSize={Math.max(9, Math.min(13, 10 / viewportState.k))}
                  fontWeight="800"
                  style={{ fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.4px' }}
                >
                  DESTINATION
                </text>
              </g>
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
