import {
  FloorId,
  FloorData,
  GraphNode,
  GraphEdge,
  RouteStep,
  PathResult,
  CORRIDOR_SEGMENTS,
  FLOOR_LABELS,
} from '../types/wayfinding';

export function getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function projectPointToSegment(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number }
): { x: number; y: number } {
  const atob = { x: b.x - a.x, y: b.y - a.y };
  const atop = { x: p.x - a.x, y: p.y - a.y };
  const lenSq = atob.x * atob.x + atob.y * atob.y;
  let t = 0;
  if (lenSq > 0) {
    t = (atop.x * atob.x + atop.y * atob.y) / lenSq;
    t = Math.max(0, Math.min(1, t));
  }
  return {
    x: Math.round(a.x + t * atob.x),
    y: Math.round(a.y + t * atob.y),
  };
}

export function getSegmentT(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  const atob = { x: b.x - a.x, y: b.y - a.y };
  const atop = { x: p.x - a.x, y: p.y - a.y };
  const lenSq = atob.x * atob.x + atob.y * atob.y;
  if (lenSq === 0) return 0;
  return Math.max(0, Math.min(1, (atop.x * atob.x + atop.y * atob.y) / lenSq));
}

export function getLineIntersection(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  p4: { x: number; y: number }
): { x: number; y: number } | null {
  const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  if (Math.abs(d) < 1e-5) return null;

  const u = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
  const v = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;

  if (u >= -0.02 && u <= 1.02 && v >= -0.02 && v <= 1.02) {
    const clampedU = Math.max(0, Math.min(1, u));
    return {
      x: Math.round(p1.x + clampedU * (p2.x - p1.x)),
      y: Math.round(p1.y + clampedU * (p2.y - p1.y)),
    };
  }
  return null;
}

export function getStoreDoorway(
  loc: { x: number; y: number; w: number; h: number },
  corridorPoint: { x: number; y: number }
): { x: number; y: number } {
  const { x, y, w, h } = loc;
  const cx = x + w / 2;
  const cy = y + h / 2;

  const dx = corridorPoint.x - cx;
  const dy = corridorPoint.y - cy;

  // Determine dominant exit side towards corridor
  if (Math.abs(dx) / Math.max(1, w) >= Math.abs(dy) / Math.max(1, h)) {
    const doorX = dx > 0 ? x + w : x;
    const doorY = Math.max(y + 4, Math.min(y + h - 4, corridorPoint.y));
    return { x: Math.round(doorX), y: Math.round(doorY) };
  } else {
    const doorY = dy > 0 ? y + h : y;
    const doorX = Math.max(x + 4, Math.min(x + w - 4, corridorPoint.x));
    return { x: Math.round(doorX), y: Math.round(doorY) };
  }
}

export function getSilhouettePoints(
  silhouette?: Array<{ x: number; y: number } | [number, number]>
): Array<{ x: number; y: number }> {
  if (!silhouette || !Array.isArray(silhouette)) return [];
  return silhouette
    .map((p: any) => {
      if (Array.isArray(p) && p.length >= 2) {
        return { x: Number(p[0]), y: Number(p[1]) };
      }
      if (p && typeof p.x === 'number' && typeof p.y === 'number') {
        return { x: p.x, y: p.y };
      }
      return null;
    })
    .filter((p): p is { x: number; y: number } => p !== null && !isNaN(p.x) && !isNaN(p.y));
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

class PriorityQueue {
  private elements: { val: string; priority: number }[] = [];

  enqueue(val: string, priority: number) {
    this.elements.push({ val, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }

  dequeue(): { val: string; priority: number } | undefined {
    return this.elements.shift();
  }

  isEmpty(): boolean {
    return this.elements.length === 0;
  }
}

export interface BuiltGraphData {
  graph: Record<string, GraphEdge[]>;
  nodeInfo: Record<string, GraphNode>;
}

export function buildGlobalPathGraph(
  floorLocations: Record<string, FloorData>
): BuiltGraphData {
  const graph: Record<string, GraphEdge[]> = {};
  const nodeInfo: Record<string, GraphNode> = {};

  const addEdge = (u: string, v: string, weight: number) => {
    if (!graph[u]) graph[u] = [];
    if (!graph[v]) graph[v] = [];
    if (!graph[u].some((e) => e.target === v)) {
      graph[u].push({ target: v, weight });
    }
    if (!graph[v].some((e) => e.target === u)) {
      graph[v].push({ target: u, weight });
    }
  };

  Object.entries(floorLocations).forEach(([floorId, floorData]) => {
    if (!floorData || !floorData.locations) return;

    // 1. Register store centers
    floorData.locations.forEach((loc) => {
      const cx = Math.round(loc.x + loc.w / 2);
      const cy = Math.round(loc.y + loc.h / 2);
      const nodeId = `${floorId}:${loc.id}`;

      nodeInfo[nodeId] = {
        floorId: floorId as FloorId,
        x: cx,
        y: cy,
        id: loc.id,
        label: loc.name || loc.id,
        isTransit: ['stairs', 'elevator'].includes(loc.cat),
      };

      graph[nodeId] = [];
    });

    const corridorWaypoints: Record<
      string,
      Array<{ nodeId: string; x: number; y: number; t: number }>
    > = {};

    // 2. Register corridor endpoints
    CORRIDOR_SEGMENTS.forEach((seg) => {
      const startWpId = `${floorId}:${seg.id}_start`;
      const endWpId = `${floorId}:${seg.id}_end`;

      nodeInfo[startWpId] = {
        floorId: floorId as FloorId,
        x: seg.a.x,
        y: seg.a.y,
        id: `${seg.id}_start`,
        label: `Corridor ${seg.id} Junction`,
        isWaypoint: true,
      };

      nodeInfo[endWpId] = {
        floorId: floorId as FloorId,
        x: seg.b.x,
        y: seg.b.y,
        id: `${seg.id}_end`,
        label: `Corridor ${seg.id} Junction`,
        isWaypoint: true,
      };

      graph[startWpId] = [];
      graph[endWpId] = [];

      corridorWaypoints[seg.id] = [
        { nodeId: startWpId, x: seg.a.x, y: seg.a.y, t: 0 },
        { nodeId: endWpId, x: seg.b.x, y: seg.b.y, t: 1 },
      ];
    });

    // 3. Connect intersecting or neighboring corridor segments to create unified walkway grid
    for (let i = 0; i < CORRIDOR_SEGMENTS.length; i++) {
      const s1 = CORRIDOR_SEGMENTS[i];
      for (let j = i + 1; j < CORRIDOR_SEGMENTS.length; j++) {
        const s2 = CORRIDOR_SEGMENTS[j];

        // Check line intersection
        const inter = getLineIntersection(s1.a, s1.b, s2.a, s2.b);
        if (inter) {
          const juncId = `${floorId}:junc_${s1.id}_${s2.id}`;
          nodeInfo[juncId] = {
            floorId: floorId as FloorId,
            x: inter.x,
            y: inter.y,
            id: `junc_${s1.id}_${s2.id}`,
            label: `Hallway Concourse`,
            isWaypoint: true,
          };
          graph[juncId] = [];

          const t1 = getSegmentT(inter, s1.a, s1.b);
          const t2 = getSegmentT(inter, s2.a, s2.b);
          corridorWaypoints[s1.id].push({ nodeId: juncId, x: inter.x, y: inter.y, t: t1 });
          corridorWaypoints[s2.id].push({ nodeId: juncId, x: inter.x, y: inter.y, t: t2 });
        } else {
          // Check if endpoints of s1 meet s2 within 40px
          const pStart = projectPointToSegment(s1.a, s2.a, s2.b);
          if (getDistance(s1.a, pStart) <= 35) {
            const startNodeId = `${floorId}:${s1.id}_start`;
            const t2 = getSegmentT(pStart, s2.a, s2.b);
            corridorWaypoints[s2.id].push({ nodeId: startNodeId, x: s1.a.x, y: s1.a.y, t: t2 });
          }

          const pEnd = projectPointToSegment(s1.b, s2.a, s2.b);
          if (getDistance(s1.b, pEnd) <= 35) {
            const endNodeId = `${floorId}:${s1.id}_end`;
            const t2 = getSegmentT(pEnd, s2.a, s2.b);
            corridorWaypoints[s2.id].push({ nodeId: endNodeId, x: s1.b.x, y: s1.b.y, t: t2 });
          }
        }
      }
    }

    // 4. Connect each store via its perimeter doorway to the closest corridor segment
    floorData.locations.forEach((loc) => {
      const nodeId = `${floorId}:${loc.id}`;
      const node = nodeInfo[nodeId];
      if (!node) return;

      let closestSeg: { id: string; a: { x: number; y: number }; b: { x: number; y: number } } | null = null;
      let minDistance = Infinity;
      let projection: { x: number; y: number } | null = null;

      CORRIDOR_SEGMENTS.forEach((seg) => {
        const proj = projectPointToSegment(node, seg.a, seg.b);
        const dist = getDistance(node, proj);
        if (dist < minDistance) {
          minDistance = dist;
          closestSeg = seg;
          projection = proj;
        }
      });

      if (closestSeg && projection) {
        const projObj = projection as { x: number; y: number };
        const segObj = closestSeg as { id: string; a: { x: number; y: number }; b: { x: number; y: number } };

        // Determine store exit doorway on the border of the store facing the hallway
        const door = getStoreDoorway(loc, projObj);
        const doorNodeId = `${floorId}:door_${loc.id}`;
        const wpNodeId = `${floorId}:wp_${loc.id}`;

        nodeInfo[doorNodeId] = {
          floorId: floorId as FloorId,
          x: door.x,
          y: door.y,
          id: `door_${loc.id}`,
          label: `Entrance of ${node.label}`,
          isWaypoint: true,
        };
        graph[doorNodeId] = [];

        nodeInfo[wpNodeId] = {
          floorId: floorId as FloorId,
          x: projObj.x,
          y: projObj.y,
          id: `wp_${loc.id}`,
          label: `Corridor near ${node.label}`,
          isWaypoint: true,
        };
        graph[wpNodeId] = [];

        // Add edges: storeCenter -> door -> corridorWaypoint
        addEdge(nodeId, doorNodeId, getDistance(node, door));
        addEdge(doorNodeId, wpNodeId, getDistance(door, projObj));

        const tVal = getSegmentT(projObj, segObj.a, segObj.b);
        corridorWaypoints[segObj.id].push({
          nodeId: wpNodeId,
          x: projObj.x,
          y: projObj.y,
          t: tVal,
        });
      }
    });

    // 5. Connect all waypoints along each corridor segment in order
    CORRIDOR_SEGMENTS.forEach((seg) => {
      const wps = corridorWaypoints[seg.id] || [];
      wps.sort((a, b) => a.t - b.t);

      for (let i = 0; i < wps.length - 1; i++) {
        const u = wps[i];
        const v = wps[i + 1];
        const dist = getDistance(u, v);
        addEdge(u.nodeId, v.nodeId, dist);
      }
    });
  });

  // 6. Connect multi-floor elevators and stairs across adjacent floors
  const floors = Object.keys(FLOOR_LABELS) as FloorId[];
  for (let i = 0; i < floors.length - 1; i++) {
    const f1 = floors[i];
    const f2 = floors[i + 1];

    const f1Locs = floorLocations[f1]?.locations || [];
    const f2Locs = floorLocations[f2]?.locations || [];

    const f1Transits = f1Locs.filter((l) => ['stairs', 'elevator'].includes(l.cat));
    const f2Transits = f2Locs.filter((l) => ['stairs', 'elevator'].includes(l.cat));

    f1Transits.forEach((l1) => {
      // 1. Try exact ID and Category match
      let match = f2Transits.find((l2) => l2.id === l1.id && l2.cat === l1.cat);

      // 2. Try spatial proximity match for same category (within 600px)
      if (!match) {
        let minDist = Infinity;
        f2Transits
          .filter((l2) => l2.cat === l1.cat)
          .forEach((l2) => {
            const d = getDistance({ x: l1.x, y: l1.y }, { x: l2.x, y: l2.y });
            if (d < minDist && d < 600) {
              minDist = d;
              match = l2;
            }
          });
      }

      // 3. Fallback to any transit on next floor if none matched
      if (!match && f2Transits.length > 0) {
        match = f2Transits[0];
      }

      if (match) {
        const n1 = `${f1}:${l1.id}`;
        const n2 = `${f2}:${match.id}`;
        const penalty = l1.cat === 'elevator' ? 350 : 650;
        addEdge(n1, n2, penalty);
      }
    });
  }

  return { graph, nodeInfo };
}

export function findRoute(
  graphData: BuiltGraphData,
  startNodeId: string,
  endNodeId: string,
  customStartLabel?: string,
  customEndLabel?: string
): PathResult | null {
  const { graph, nodeInfo } = graphData;

  if (!nodeInfo[startNodeId] || !nodeInfo[endNodeId]) {
    const validStart = nodeInfo[startNodeId] ? startNodeId : Object.keys(nodeInfo)[0];
    const validEnd = nodeInfo[endNodeId] ? endNodeId : Object.keys(nodeInfo)[1];
    if (!validStart || !validEnd) return null;
    startNodeId = validStart;
    endNodeId = validEnd;
  }

  const distances: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const pq = new PriorityQueue();

  Object.keys(graph).forEach((node) => {
    distances[node] = Infinity;
    prev[node] = null;
  });

  distances[startNodeId] = 0;
  pq.enqueue(startNodeId, 0);

  let targetFound = false;

  while (!pq.isEmpty()) {
    const item = pq.dequeue();
    if (!item) break;
    const { val: current, priority } = item;

    if (current === endNodeId) {
      targetFound = true;
      break;
    }

    if (priority > distances[current]) continue;

    const edges = graph[current] || [];
    edges.forEach((edge) => {
      const alt = distances[current] + edge.weight;
      if (alt < distances[edge.target]) {
        distances[edge.target] = alt;
        prev[edge.target] = current;
        pq.enqueue(edge.target, alt);
      }
    });
  }

  const startNode = nodeInfo[startNodeId];
  const endNode = nodeInfo[endNodeId];

  // If path wasn't found through graph, build graceful direct path
  if (!targetFound) {
    const directDistance = getDistance(
      { x: startNode?.x || 1000, y: startNode?.y || 1000 },
      { x: endNode?.x || 1500, y: endNode?.y || 1500 }
    );
    const estTimeMinutes = Math.max(1, Math.round((directDistance / 1500) * 10) / 10);
    const steps: RouteStep[] = [
      {
        text: `Start at ${startNode?.label || 'Main Entrance'} (${FLOOR_LABELS[startNode?.floorId || 'ground_floor']})`,
        floorId: startNode?.floorId || 'ground_floor',
        type: 'start',
      },
    ];

    if (startNode?.floorId !== endNode?.floorId) {
      steps.push({
        text: `Take Elevators or Stairs from ${FLOOR_LABELS[startNode?.floorId || 'ground_floor']} to ${FLOOR_LABELS[endNode?.floorId || 'first_floor']}`,
        floorId: endNode?.floorId || 'first_floor',
        type: 'floor_change',
        icon: 'elevator',
      });
    }

    steps.push({
      text: `Arrive at destination: ${endNode?.label || 'Target Unit'} (${FLOOR_LABELS[endNode?.floorId || 'ground_floor']})`,
      floorId: endNode?.floorId || 'ground_floor',
      type: 'destination',
    });

    return {
      steps,
      totalDistance: directDistance,
      estTimeMinutes,
      nodePath: [startNodeId, endNodeId],
    };
  }

  const nodePath: string[] = [];
  let temp: string | null = endNodeId;
  while (temp !== null) {
    nodePath.unshift(temp);
    temp = prev[temp];
  }

  const totalDistance = distances[endNodeId];
  const estTimeMinutes = Math.max(1, Math.round((totalDistance / 1500) * 10) / 10);

  const startLabel = customStartLabel || startNode.label;
  const endLabel = customEndLabel || endNode.label;

  // Generate concise, grouped turn-by-turn steps (1 meaningful step per floor leg)
  const steps: RouteStep[] = [];

  if (startNode.floorId === endNode.floorId) {
    // Single floor journey -> Exactly 1 clean step
    steps.push({
      text: `Walk from ${startLabel} along the hallway directly to ${endLabel}`,
      floorId: startNode.floorId,
      type: 'walk',
    });
  } else {
    // Group path nodes into floor legs
    interface FloorLeg {
      floorId: FloorId;
      startNode: GraphNode;
      endNode: GraphNode;
      transitType?: 'Elevator' | 'Stairs';
      nextFloorId?: FloorId;
    }

    const legs: FloorLeg[] = [];
    let curFloor: FloorId = startNode.floorId;
    let legStartNode = startNode;

    for (let i = 0; i < nodePath.length - 1; i++) {
      const curr = nodeInfo[nodePath[i]];
      const next = nodeInfo[nodePath[i + 1]];

      if (curr && next && curr.floorId !== next.floorId) {
        const transitType =
          curr.id.toLowerCase().includes('elevator') || curr.id.toLowerCase().includes('lift')
            ? 'Elevator'
            : 'Stairs';

        legs.push({
          floorId: curFloor,
          startNode: legStartNode,
          endNode: curr,
          transitType,
          nextFloorId: next.floorId,
        });

        curFloor = next.floorId;
        legStartNode = next;
      }
    }

    // Final leg on destination floor
    legs.push({
      floorId: endNode.floorId,
      startNode: legStartNode,
      endNode: endNode,
    });

    // Build user-friendly step descriptions for each floor leg
    legs.forEach((leg, index) => {
      const fromLabel = index === 0 ? startLabel : leg.startNode.label;
      const toLabel = index === legs.length - 1 ? endLabel : leg.endNode.label;

      if (index === 0 && leg.nextFloorId && leg.transitType) {
        // First floor leg leading to elevator/stairs
        steps.push({
          text: `Walk from ${fromLabel} to the ${leg.endNode.label || leg.transitType} on ${FLOOR_LABELS[leg.floorId]}, and take it to ${FLOOR_LABELS[leg.nextFloorId]}`,
          floorId: leg.floorId,
          type: 'floor_change',
          icon: leg.transitType.toLowerCase() === 'elevator' ? 'elevator' : 'stairs',
        });
      } else if (index === legs.length - 1) {
        // Final floor leg reaching destination
        steps.push({
          text: `On ${FLOOR_LABELS[leg.floorId]}, follow the hallway from the ${leg.startNode.label || 'Lifts/Stairs'} to ${toLabel}`,
          floorId: leg.floorId,
          type: 'destination',
        });
      } else if (leg.nextFloorId && leg.transitType) {
        // Intermediate floor transfer leg (if any)
        steps.push({
          text: `Transfer on ${FLOOR_LABELS[leg.floorId]} from ${fromLabel} to ${leg.endNode.label}, and take it to ${FLOOR_LABELS[leg.nextFloorId]}`,
          floorId: leg.floorId,
          type: 'floor_change',
          icon: leg.transitType.toLowerCase() === 'elevator' ? 'elevator' : 'stairs',
        });
      }
    });
  }

  return {
    steps,
    totalDistance,
    estTimeMinutes,
    nodePath,
  };
}
