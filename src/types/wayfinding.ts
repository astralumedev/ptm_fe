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
  /** Lifts/stairs: shaft name linking this unit to the same lift/stair on other floors. */
  link?: string;
  /** Units combined into this one by a merge, kept so the merge can be undone. */
  mergedFrom?: WayfindingLocation[];
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
  imageSize?: { w: number; h: number };
  locations: WayfindingLocation[];
  silhouette?: Array<{ x: number; y: number } | [number, number]>;
  youAreHere?: { x: number; y: number } | null;
  /** Optional traced floor-plan image shown under the map in the editor. */
  underlay?: { url: string; x: number; y: number; w: number; h: number; opacity: number };
}

/** A printed QR code in the building: a fixed "you are here" point. */
export interface QrPoint {
  code: string;
  name: string;
  floorId: FloorId;
  x: number;
  y: number;
  /** Direction the person scanning is facing, in degrees (0 = up on the map). */
  heading?: number | null;
  note?: string;
}

export interface MapPoint {
  x: number;
  y: number;
}

/** One continuous walk on a single floor. */
export interface RouteLeg {
  floorId: FloorId;
  points: MapPoint[];
  /** Metres walked on this leg. */
  metres: number;
  /** How the leg ends: at a lift/stairs to another floor, or at the destination. */
  end:
    | { kind: 'transit'; unitId: string; cat: 'elevator' | 'stairs'; toFloor: FloorId }
    | { kind: 'destination'; unitId?: string; side?: 'left' | 'right' | 'ahead' };
}

export interface RouteStep {
  text: string;
  floorId: FloorId;
  type: 'start' | 'walk' | 'floor_change' | 'destination';
  icon?: string;
  /** Leg of the route this step describes. */
  legIndex: number;
}

export interface PathResult {
  steps: RouteStep[];
  legs: RouteLeg[];
  /** Metres walked, all floors together. */
  totalDistance: number;
  estTimeMinutes: number;
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
