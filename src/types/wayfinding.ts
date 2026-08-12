export type FloorId =
  | 'lower_ground_floor'
  | 'ground_floor'
  | 'first_floor'
  | 'second_floor'
  | 'third_floor'
  | 'fourth_floor'
  | 'fifth_floor';

export interface CategoryInfo {
  label: string;
  color: string;
}

export interface WayfindingLocation {
  id: string;
  name?: string;
  text?: string;
  cat: string;
  x: number;
  y: number;
  w: number;
  h: number;
  dims?: string;
  area?: string;
  block?: string;
}

export interface WayfindingStore {
  id: string;
  name: string;
  slug: string;
  cat: string;
  desc?: string;
  hours?: string;
  phone?: string;
  floor?: string;
  block?: string;
  shutters?: string[];
  logo?: string;
  image?: string;
}

export interface FloorData {
  locations: WayfindingLocation[];
  silhouette?: Array<{ x: number; y: number }>;
  youAreHere?: { x: number; y: number };
}

export interface GraphNode {
  floorId: FloorId;
  x: number;
  y: number;
  id: string;
  label: string;
  isTransit?: boolean;
  isWaypoint?: boolean;
}

export interface GraphEdge {
  target: string;
  weight: number;
}

export interface RouteStep {
  text: string;
  floorId: FloorId;
  type: 'start' | 'walk' | 'floor_change' | 'destination';
  icon?: string;
}

export interface PathResult {
  steps: RouteStep[];
  totalDistance: number;
  estTimeMinutes: number;
  nodePath: string[];
}

export const CATEGORIES: Record<string, CategoryInfo> = {
  womens_fashion: { label: "Women's Fashion", color: "#ec4899" },
  mens_fashion: { label: "Men's Fashion", color: "#3b82f6" },
  lingerie: { label: "Lingerie", color: "#f43f5e" },
  accessories: { label: "Accessories", color: "#8b5cf6" },
  beauty: { label: "Beauty", color: "#d946ef" },
  saloon: { label: "Saloon", color: "#06b6d4" },
  spa: { label: "Spa", color: "#14b8a6" },
  cosmetic_shops: { label: "Cosmetic Shops", color: "#10b981" },
  perfumes: { label: "Perfumes", color: "#f59e0b" },
  watches: { label: "Watches", color: "#84cc16" },
  mobile_phones_gadgets: { label: "Phones & Gadgets", color: "#a855f7" },
  cafes: { label: "Cafes", color: "#f97316" },
  restaurants: { label: "Restaurants", color: "#ef4444" },
  
  // Non-commercial / utility categories
  stairs: { label: "Stairs", color: "#9b7de0" },
  elevator: { label: "Lifts", color: "#37be6a" },
  restroom: { label: "Restrooms", color: "#17b0a0" },
  service: { label: "Service Areas", color: "#6b7280" },
  void: { label: "Void", color: "#d6604d" },
  atrium: { label: "Atrium", color: "#e8a13a" }
};

export const FLOOR_LABELS: Record<FloorId, string> = {
  lower_ground_floor: "Lower Ground",
  ground_floor: "Ground Floor",
  first_floor: "First Floor",
  second_floor: "Second Floor",
  third_floor: "Third Floor",
  fourth_floor: "Fourth Floor",
  fifth_floor: "Fifth Floor"
};

export const CORRIDOR_SEGMENTS = [
  { id: "C1", a: { x: 1380, y: 500 }, b: { x: 1380, y: 2260 } },
  { id: "C2", a: { x: 1050, y: 2260 }, b: { x: 2400, y: 2260 } },
  { id: "C3", a: { x: 1050, y: 2260 }, b: { x: 1050, y: 2730 } },
  { id: "C4", a: { x: 1050, y: 2730 }, b: { x: 1650, y: 2730 } },
  { id: "C5", a: { x: 1550, y: 2730 }, b: { x: 1550, y: 3200 } },
  { id: "C6", a: { x: 2060, y: 2260 }, b: { x: 2060, y: 3040 } },
  { id: "C7", a: { x: 1950, y: 3040 }, b: { x: 2260, y: 3040 } },
  { id: "C8", a: { x: 2200, y: 3040 }, b: { x: 2200, y: 4500 } }
];
