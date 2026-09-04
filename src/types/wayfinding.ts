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
  // Retail / Shop
  'womens-fashion': { label: "Women's Fashion", color: "#ec4899" },
  womens_fashion: { label: "Women's Fashion", color: "#ec4899" },
  'mens-fashion': { label: "Men's Fashion & Denim", color: "#3b82f6" },
  mens_fashion: { label: "Men's Fashion & Denim", color: "#3b82f6" },
  kids: { label: "Kids & Baby Wear", color: "#f59e0b" },
  lingerie: { label: "Lingerie & Nightwear", color: "#f43f5e" },
  'footwear-bags': { label: "Footwear & Luggage", color: "#8b5cf6" },
  footwear_bags: { label: "Footwear & Luggage", color: "#8b5cf6" },
  'jewelry-watches': { label: "Fine Jewelry & Watches", color: "#eab308" },
  jewelry_watches: { label: "Fine Jewelry & Watches", color: "#eab308" },
  accessories: { label: "Accessories & Watches", color: "#eab308" },
  'beauty-fragrance': { label: "Beauty & Fragrance", color: "#d946ef" },
  beauty_fragrance: { label: "Beauty & Fragrance", color: "#d946ef" },
  beauty: { label: "Beauty & Fragrance", color: "#d946ef" },
  cosmetic_shops: { label: "Beauty & Cosmetics", color: "#d946ef" },
  perfumes: { label: "Perfumes & Scents", color: "#d946ef" },
  electronics: { label: "Tech & Electronics", color: "#06b6d4" },
  mobile_phones_gadgets: { label: "Tech & Mobiles", color: "#06b6d4" },
  'home-living': { label: "Home & Living", color: "#10b981" },
  home_living: { label: "Home & Living", color: "#10b981" },
  lifestyle: { label: "Home & Lifestyle", color: "#10b981" },
  handicrafts: { label: "Himalayan Handicrafts", color: "#14b8a6" },

  // Dine
  thakali: { label: "Nepali & Thakali", color: "#f97316" },
  restaurant: { label: "Restaurants & Dining", color: "#ef4444" },
  restaurants: { label: "Restaurants & Dining", color: "#ef4444" },
  cafe: { label: "Artisan Cafés & Bakeries", color: "#d97706" },
  cafes: { label: "Artisan Cafés & Bakeries", color: "#d97706" },
  'fast-food': { label: "Fast Food & Snacks", color: "#ea580c" },
  fast_food: { label: "Fast Food & Snacks", color: "#ea580c" },

  // Entertain
  cinema: { label: "Movies & Multiplex", color: "#b91c1c" },
  gaming: { label: "4D VR Gaming & Arcade", color: "#7c3aed" },
  entertainment: { label: "Entertainment & Cinema", color: "#b91c1c" },

  // Services
  'beauty-wellness': { label: "Beauty, Spas & Salons", color: "#ec4899" },
  beauty_wellness: { label: "Beauty, Spas & Salons", color: "#ec4899" },
  spa: { label: "Luxury Spas & Wellness", color: "#14b8a6" },
  saloon: { label: "Hair & Grooming Salon", color: "#ec4899" },
  finance: { label: "Banking & Finance", color: "#2563eb" },
  education: { label: "Abroad Study & Education", color: "#0284c7" },
  'it-tech': { label: "IT & Software Solutions", color: "#6366f1" },
  it_tech: { label: "IT & Software Solutions", color: "#6366f1" },
  'health-fitness': { label: "Health & Fitness Gym", color: "#16a34a" },
  health_fitness: { label: "Health & Fitness Gym", color: "#16a34a" },
  professional: { label: "Engineering & Consultancies", color: "#059669" },
  consultancy: { label: "Engineering & Consultancies", color: "#059669" },

  // Non-commercial / utility categories
  shop: { label: "Retail Boutique", color: "#3b82f6" },
  stairs: { label: "Stairs", color: "#801424" },
  elevator: { label: "Lifts & Elevators", color: "#37be6a" },
  restroom: { label: "Restrooms", color: "#17b0a0" },
  service: { label: "Service Area", color: "#6b7280" },
  void: { label: "Void", color: "#d6604d" },
  atrium: { label: "Central Atrium", color: "#e8a13a" },
  parking: { label: "Underground Parking", color: "#475569" },
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
