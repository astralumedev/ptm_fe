import {
  FloorId,
  FloorData,
  GraphNode,
  GraphEdge,
  RouteStep,
  PathResult,
  CORRIDOR_SEGMENTS,
  FLOOR_LABELS
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
    x: a.x + t * atob.x,
    y: a.y + t * atob.y
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
  return (atop.x * atob.x + atop.y * atob.y) / lenSq;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
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
    if (!graph[u].some(e => e.target === v)) {
      graph[u].push({ target: v, weight });
    }
    if (!graph[v].some(e => e.target === u)) {
      graph[v].push({ target: u, weight });
    }
  };

  Object.entries(floorLocations).forEach(([floorId, floorData]) => {
    if (!floorData || !floorData.locations) return;

    floorData.locations.forEach(loc => {
      const cx = Math.round(loc.x + loc.w / 2);
      const cy = Math.round(loc.y + loc.h / 2);
      const nodeId = `${floorId}:${loc.id}`;

      nodeInfo[nodeId] = {
        floorId: floorId as FloorId,
        x: cx,
        y: cy,
        id: loc.id,
        label: loc.name || loc.id,
        isTransit: ['stairs', 'elevator'].includes(loc.cat)
      };

      graph[nodeId] = [];
    });

    const corridorWaypoints: Record<
      string,
      Array<{ nodeId: string; x: number; y: number; t: number }>
    > = {};

    CORRIDOR_SEGMENTS.forEach(seg => {
      const startWpId = `${floorId}:${seg.id}_start`;
      const endWpId = `${floorId}:${seg.id}_end`;

      nodeInfo[startWpId] = {
        floorId: floorId as FloorId,
        x: seg.a.x,
        y: seg.a.y,
        id: `${seg.id}_start`,
        label: `Corridor ${seg.id} Junction`,
        isWaypoint: true
      };

      nodeInfo[endWpId] = {
        floorId: floorId as FloorId,
        x: seg.b.x,
        y: seg.b.y,
        id: `${seg.id}_end`,
        label: `Corridor ${seg.id} Junction`,
        isWaypoint: true
      };

      graph[startWpId] = [];
      graph[endWpId] = [];

      corridorWaypoints[seg.id] = [
        { nodeId: startWpId, x: seg.a.x, y: seg.a.y, t: 0 },
        { nodeId: endWpId, x: seg.b.x, y: seg.b.y, t: 1 }
      ];
    });

    floorData.locations.forEach(loc => {
      const nodeId = `${floorId}:${loc.id}`;
      const node = nodeInfo[nodeId];
      if (!node) return;

      let closestSeg: { id: string; a: { x: number; y: number }; b: { x: number; y: number } } | null = null;
      let minDistance = Infinity;
      let projection: { x: number; y: number } | null = null;

      CORRIDOR_SEGMENTS.forEach(seg => {
        const proj = projectPointToSegment(node, seg.a, seg.b);
        const dist = getDistance(node, proj);
        if (dist < minDistance) {
          minDistance = dist;
          closestSeg = seg;
          projection = proj;
        }
      });

      if (closestSeg && projection) {
        const wpNodeId = `${floorId}:wp_${node.id}`;
        const projObj = projection as { x: number; y: number };
        const segObj = closestSeg as { id: string; a: { x: number; y: number }; b: { x: number; y: number } };

        nodeInfo[wpNodeId] = {
          floorId: floorId as FloorId,
          x: Math.round(projObj.x),
          y: Math.round(projObj.y),
          id: `wp_${node.id}`,
          label: `Hallway near ${node.label}`,
          isWaypoint: true
        };

        graph[wpNodeId] = [];
        addEdge(nodeId, wpNodeId, minDistance);

        const tVal = getSegmentT(projObj, segObj.a, segObj.b);
        corridorWaypoints[segObj.id].push({
          nodeId: wpNodeId,
          x: projObj.x,
          y: projObj.y,
          t: tVal
        });
      }
    });

    CORRIDOR_SEGMENTS.forEach(seg => {
      const wps = corridorWaypoints[seg.id];
      wps.sort((a, b) => a.t - b.t);

      for (let i = 0; i < wps.length - 1; i++) {
        const u = wps[i];
        const v = wps[i + 1];
        const dist = getDistance(u, v);
        addEdge(u.nodeId, v.nodeId, dist);
      }
    });

    CORRIDOR_SEGMENTS.forEach(s1 => {
      const startNodeId = `${floorId}:${s1.id}_start`;
      const endNodeId = `${floorId}:${s1.id}_end`;

      CORRIDOR_SEGMENTS.forEach(s2 => {
        if (s1.id === s2.id) return;

        const pStart = projectPointToSegment(s1.a, s2.a, s2.b);
        if (getDistance(s1.a, pStart) < 15) {
          const tVal = getSegmentT(pStart, s2.a, s2.b);
          corridorWaypoints[s2.id].push({
            nodeId: startNodeId,
            x: s1.a.x,
            y: s1.a.y,
            t: tVal
          });
        }

        const pEnd = projectPointToSegment(s1.b, s2.a, s2.b);
        if (getDistance(s1.b, pEnd) < 15) {
          const tVal = getSegmentT(pEnd, s2.a, s2.b);
          corridorWaypoints[s2.id].push({
            nodeId: endNodeId,
            x: s1.b.x,
            y: s1.b.y,
            t: tVal
          });
        }
      });
    });

    CORRIDOR_SEGMENTS.forEach(seg => {
      const wps = corridorWaypoints[seg.id];
      wps.sort((a, b) => a.t - b.t);

      for (let i = 0; i < wps.length - 1; i++) {
        const u = wps[i];
        const v = wps[i + 1];
        const dist = getDistance(u, v);
        addEdge(u.nodeId, v.nodeId, dist);
      }
    });
  });

  const floors = Object.keys(FLOOR_LABELS) as FloorId[];
  for (let i = 0; i < floors.length - 1; i++) {
    const f1 = floors[i];
    const f2 = floors[i + 1];

    const f1Locs = floorLocations[f1]?.locations || [];
    const f2Locs = floorLocations[f2]?.locations || [];

    f1Locs.forEach(l1 => {
      if (['stairs', 'elevator'].includes(l1.cat)) {
        const match = f2Locs.find(l2 => l2.id === l1.id && l2.cat === l1.cat);
        if (match) {
          const n1 = `${f1}:${l1.id}`;
          const n2 = `${f2}:${match.id}`;
          const penalty = l1.cat === 'elevator' ? 400 : 750;
          addEdge(n1, n2, penalty);
        }
      }
    });
  }

  return { graph, nodeInfo };
}

export function findRoute(
  graphData: BuiltGraphData,
  startNodeId: string,
  endNodeId: string
): PathResult | null {
  const { graph, nodeInfo } = graphData;

  if (!graph[startNodeId] || !graph[endNodeId]) {
    return null;
  }

  const distances: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const pq = new PriorityQueue();

  Object.keys(graph).forEach(node => {
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
    edges.forEach(edge => {
      const alt = distances[current] + edge.weight;
      if (alt < distances[edge.target]) {
        distances[edge.target] = alt;
        prev[edge.target] = current;
        pq.enqueue(edge.target, alt);
      }
    });
  }

  if (!targetFound) return null;

  const nodePath: string[] = [];
  let temp: string | null = endNodeId;
  while (temp !== null) {
    nodePath.unshift(temp);
    temp = prev[temp];
  }

  const totalDistance = distances[endNodeId];
  // Convert distance pixels to estimated walking minutes (assuming 1500px ~ 1 min walk)
  const estTimeMinutes = Math.max(1, Math.round((totalDistance / 1500) * 10) / 10);

  // Generate readable turn-by-turn steps
  const steps: RouteStep[] = [];
  const startNode = nodeInfo[startNodeId];
  const endNode = nodeInfo[endNodeId];

  if (startNode) {
    steps.push({
      text: `Start at ${startNode.label} (${FLOOR_LABELS[startNode.floorId] || startNode.floorId})`,
      floorId: startNode.floorId,
      type: 'start'
    });
  }

  for (let i = 0; i < nodePath.length - 1; i++) {
    const currId = nodePath[i];
    const nextId = nodePath[i + 1];
    const curr = nodeInfo[currId];
    const next = nodeInfo[nextId];

    if (curr && next && curr.floorId !== next.floorId) {
      const transitType = curr.id.includes('elevator') || curr.id.includes('lift') ? 'Elevator' : 'Stairs';
      steps.push({
        text: `Take ${transitType} from ${FLOOR_LABELS[curr.floorId]} to ${FLOOR_LABELS[next.floorId]}`,
        floorId: next.floorId,
        type: 'floor_change',
        icon: transitType === 'Elevator' ? 'elevator' : 'stairs'
      });
    }
  }

  if (endNode) {
    steps.push({
      text: `Arrive at destination: ${endNode.label} (${FLOOR_LABELS[endNode.floorId] || endNode.floorId})`,
      floorId: endNode.floorId,
      type: 'destination'
    });
  }

  return {
    steps,
    totalDistance,
    estTimeMinutes,
    nodePath
  };
}
