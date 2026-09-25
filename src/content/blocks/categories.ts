import { useMemo } from 'react';
import { defineBlock, useBlock } from '../block';
import { ICON_OPTIONS } from '../icons';

export type Sector = 'retail' | 'dine' | 'entertain' | 'service';

export interface Category {
  slug: string;
  name: string;
  shortName?: string;
  subtitle?: string;
  description?: string;
  sector: Sector;
  icon: string;
  color: string;
  /** Older or alternative codes that should count as this category (search, map data, links). */
  aliases?: string[];
  hidden?: boolean;
}

export const SECTORS: { value: Sector; label: string }[] = [
  { value: 'retail', label: 'Shop' },
  { value: 'dine', label: 'Dine' },
  { value: 'entertain', label: 'Entertain' },
  { value: 'service', label: 'Services' },
];

/** Store `type` values used by the site's section pages for each sector. */
export const SECTOR_STORE_TYPE: Record<Sector, string> = { retail: 'retail', dine: 'eatery', entertain: 'service', service: 'service' };

const c = (slug: string, sector: Sector, name: string, shortName: string, subtitle: string, icon: string, color: string, aliases: string[] = []): Category =>
  ({ slug, sector, name, shortName, subtitle, icon, color, aliases });

/**
 * The single list of store categories. Directory filters, the shop landing tiles, dining filters,
 * the store editor and the mall-map colours all read from here.
 */
export const categoriesBlock = defineBlock<{ items: Category[] }>({
  key: 'categories',
  group: 'Stores & categories',
  label: 'Store categories',
  description: 'The categories stores are filed under. Used by the directory filters, the Shop and Dine pages, the store editor and the mall map colours.',
  page: '/shops/directory',
  fields: [
    {
      key: 'items', label: 'Categories', type: 'list', itemTitle: 'name', itemName: 'category',
      itemDefaults: { sector: 'retail', icon: 'store', color: '#3b82f6', aliases: [] },
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true, half: true },
        { key: 'shortName', label: 'Short name', type: 'text', half: true, help: 'Used on small tiles and the map legend.' },
        { key: 'slug', label: 'Code', type: 'text', half: true, required: true, help: 'Lowercase, no spaces. Changing it un-files the stores that use it.' },
        { key: 'sector', label: 'Sector', type: 'select', half: true, options: SECTORS },
        { key: 'icon', label: 'Icon', type: 'icon', half: true, options: ICON_OPTIONS },
        { key: 'color', label: 'Map colour', type: 'color', half: true },
        { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'e.g. Ethnic & Western Couture' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'aliases', label: 'Also matches', type: 'tags', help: 'Other codes that mean the same thing, e.g. "fashion".' },
        { key: 'hidden', label: 'Hide from filters', type: 'toggle' },
      ],
    },
  ],
  defaults: {
    items: [
      c('womens-fashion', 'retail', "Women's Fashion & Couture", "Women's Fashion", 'Ethnic & Western Couture', 'female', '#ec4899', ['fashion', 'womens_fashion']),
      c('mens-fashion', 'retail', "Men's Fashion & Denim", "Men's Fashion", 'Formal, Casual & Denim', 'tshirt', '#3b82f6', ['mens_fashion']),
      c('kids', 'retail', 'Kids & Baby Wear', 'Kids & Baby', 'Playwear & Nursery Kits', 'child', '#f59e0b', ['kids-fashion']),
      c('lingerie', 'retail', 'Lingerie & Nightwear', 'Lingerie', 'Intimate & Loungewear', 'heart', '#f43f5e'),
      c('footwear-bags', 'retail', 'Footwear, Bags & Luggage', 'Footwear & Luggage', 'Shoes, Sneakers & Bags', 'shopping-bag', '#8b5cf6', ['footwear', 'bags', 'footwear_bags']),
      c('jewelry-watches', 'retail', 'Fine Jewelry & Luxury Watches', 'Jewelry & Watches', 'Fine Gold & Luxury Watches', 'gem', '#eab308', ['jewelry', 'watches', 'womens-accessories', 'mens-accessories', 'accessories', 'jewelry_watches']),
      c('beauty-fragrance', 'retail', 'Beauty, Skincare & Fragrance', 'Beauty & Fragrance', 'Cosmetics & K-Beauty', 'spa', '#d946ef', ['beauty', 'cosmetics', 'perfumes', 'cosmetic_shops', 'beauty_fragrance']),
      c('electronics', 'retail', 'Tech, Mobiles & Electronics', 'Tech & Electronics', 'Mobiles, PC Rigs & Gadgets', 'laptop', '#06b6d4', ['tech', 'mobiles', 'gadgets', 'mobile_phones_gadgets']),
      c('home-living', 'retail', 'Home, Living & Decor', 'Home & Living', 'Decor, Bedding & Lifestyle', 'couch', '#10b981', ['lifestyle', 'home_living']),
      c('handicrafts', 'retail', 'Himalayan Handicrafts & Souvenirs', 'Handicrafts', 'Pashmina & Souvenirs', 'gift', '#14b8a6', ['gifts', 'souvenirs']),
      c('thakali', 'dine', 'Authentic Nepali & Thakali', 'Nepali & Thakali', 'Himalayan home-style dining', 'utensils', '#f97316'),
      c('restaurant', 'dine', 'Restaurants & Multi-Cuisine', 'Restaurants', 'Sit-down dining', 'pizza', '#ef4444', ['eatery', 'restaurants']),
      c('cafe', 'dine', 'Artisan Cafés & Bakeries', 'Cafés & Bakeries', 'Coffee, cakes & bakes', 'coffee', '#d97706', ['bakery', 'cafes']),
      c('fast-food', 'dine', 'Fast Food & Quick Bites', 'Fast Food', 'Burgers, momos & snacks', 'burger', '#ea580c', ['fast_food']),
      c('cinema', 'entertain', 'Movies & Multiplex (QFX Cinemas)', 'Movies & Multiplex', 'QFX Cinemas', 'film', '#b91c1c', ['entertainment', 'qfx']),
      c('gaming', 'entertain', '4D VR Gaming & Arcade', 'Gaming & Arcade', '4D VR simulators', 'gamepad', '#7c3aed', ['games']),
      c('beauty-wellness', 'service', 'Beauty, Spas & Salons', 'Spas & Salons', 'Massage, hair & grooming', 'spa', '#ec4899', ['wellness', 'spa', 'saloon', 'beauty_wellness']),
      c('finance', 'service', 'Financial Services & Banking', 'Banking & Finance', 'Banks, ATMs & forex', 'bank', '#2563eb'),
      c('education', 'service', 'Educational Institutes & Abroad Study', 'Education', 'IELTS, PTE & abroad study', 'education', '#0284c7'),
      c('it-tech', 'service', 'IT, Software & Digital Solutions', 'IT & Software', 'Software & digital studios', 'code', '#6366f1', ['it_tech']),
      c('health-fitness', 'service', 'Health, Fitness & Gym', 'Health & Fitness', 'Gyms & training', 'dumbbell', '#16a34a', ['health_fitness']),
      c('professional', 'service', 'Engineering & Consultancies', 'Consultancies', 'Architecture, engineering & surveying', 'drafting', '#059669', ['consultancy']),
    ],
  },
});

export function useCategories() {
  const { items } = useBlock(categoriesBlock);
  return useMemo(() => {
    const visible = items.filter((c) => !c.hidden);
    const lookup = new Map<string, Category>();
    for (const cat of items) {
      lookup.set(cat.slug, cat);
      for (const a of cat.aliases || []) if (!lookup.has(a)) lookup.set(a, cat);
    }
    return {
      all: items,
      visible,
      bySector: (s: Sector) => visible.filter((c) => c.sector === s),
      /** Resolves a category by its code or any alias. */
      find: (slug?: string | null) => (slug ? lookup.get(slug) || lookup.get(slug.replace(/_/g, '-')) : undefined),
    };
  }, [items]);
}
