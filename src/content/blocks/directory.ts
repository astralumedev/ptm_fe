import type { ReactNode } from 'react';
import { defineBlock, type BlockDef } from '../block';
import type { Field } from '../fields';
import { ICON_OPTIONS } from '../icons';
import type { Category, Sector } from './categories';
import type { Store } from '@/data/models/Store';

/* -------------------------------------------------------------------------- */
/* Helpers shared by the shop, dine, directory and store pages                */
/* -------------------------------------------------------------------------- */

type TextSpec = [key: string, label: string, value: string, type?: Field['type'], help?: string];

/** Builds a block's fields and defaults from one list, so the two can never drift apart. */
function textBlock(specs: TextSpec[], extraFields: Field[] = [], extraDefaults: Record<string, unknown> = {}) {
  const fields: Field[] = specs.map(([key, label, , type = 'text', help]) => ({ key, label, type, ...(help ? { help } : {}) }));
  const defaults: Record<string, any> = Object.fromEntries(specs.map(([key, , value]) => [key, value]));
  return { fields: [...fields, ...extraFields], defaults: { ...defaults, ...extraDefaults } };
}

/** Replaces {placeholders} in a CMS sentence with plain values. */
export function fill(template: string | undefined, vars: Record<string, string | number>) {
  return (template || '').replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/** Like `fill`, but placeholders may be React nodes (e.g. a bold number). */
export function fillParts(template: string | undefined, vars: Record<string, ReactNode>): ReactNode[] {
  return (template || '').split(/(\{\w+\})/g).map((part) => {
    const m = /^\{(\w+)\}$/.exec(part);
    return m && m[1] in vars ? vars[m[1]] : part;
  });
}

/** Store records staff have published (drafts never show on the public site). */
export const isPublished = (s: Store) => s.status !== 'draft';

type Finder = (slug?: string | null) => Category | undefined;

/** The category a store is filed under, resolving old/alias codes. */
export const storeCategory = (s: Store, find: Finder) => find(s.categorySlug);

const TYPE_SECTOR: Record<string, Sector> = { retail: 'retail', eatery: 'dine', service: 'service', wellness: 'service', hotel: 'service' };

/** Sector of a store: from its category, falling back to the store type. */
export function storeSector(s: Store, find: Finder): Sector {
  return storeCategory(s, find)?.sector || TYPE_SECTOR[s.type] || 'retail';
}

export const inCategory = (s: Store, cat: Category, find: Finder) => storeCategory(s, find)?.slug === cat.slug;

/** URL-friendly key for a floor name: "1st Floor" -> "1st-floor". */
export const floorKey = (floor?: string | null) => (floor || '').trim().toLowerCase().replace(/\s+/g, '-');

function floorRank(floor: string) {
  const f = floor.toLowerCase();
  if (/basement|lower\s*ground|\blg\b|\bb\d?\b/.test(f)) return -1;
  if (/ground|\bgf\b/.test(f)) return 0;
  const n = /(\d+)\s*(st|nd|rd|th)?/.exec(f);
  if (n) return Number(n[1]);
  if (/roof|terrace|top/.test(f)) return 50;
  return 100;
}

/** Floors present in the given stores, ordered Lower Ground, Ground, 1st, 2nd... then others. */
export function floorsOf(stores: Store[]): string[] {
  const seen = new Map<string, string>();
  for (const s of stores) if (s.floor?.trim() && !seen.has(floorKey(s.floor))) seen.set(floorKey(s.floor), s.floor.trim());
  return [...seen.values()].sort((a, b) => floorRank(a) - floorRank(b) || a.localeCompare(b));
}

export const compareFloors = (a?: string | null, b?: string | null) =>
  floorRank(a || 'zzz') - floorRank(b || 'zzz') || (a || '').localeCompare(b || '');

/* -------------------------------------------------------------------------- */
/* Shop page (/shop)                                                          */
/* -------------------------------------------------------------------------- */

const shop = textBlock([
  ['title', 'Page title', 'Shop & Boutiques'],
  ['subtitle', 'Page intro', 'Pokhara Trade Mall is your one-stop retail hub for leading international fashion brands, certified tech centers, fine jewelry, beauty, and local Himalayan artisan crafts.', 'textarea'],
  ['badge', 'Small label above the title', 'PREMIER SHOPPING DESTINATION'],
  ['breadcrumb', 'Breadcrumb name', 'Shop'],
  ['featuredEyebrow', 'Featured stores: small label', 'Curated Highlights'],
  ['featuredHeading', 'Featured stores: heading', 'Featured Brands & Boutiques', 'text', 'Shows shop stores marked "Featured" in the store editor (up to 8).'],
  ['featuredLinkLabel', 'Featured stores: link text', 'View All Directory Outlets'],
  ['featuredLinkUrl', 'Featured stores: link goes to', '/shops/directory', 'url'],
  ['featuredEmpty', 'Text when no store is featured', '', 'text', 'Optional. Leave empty to show nothing.'],
  ['exploreLabel', 'Store card button text', 'Explore'],
  ['fallbackFloor', 'Floor shown when a store has none', '1st Floor'],
  ['categoriesEyebrow', 'Categories: small label', 'Explore by Category'],
  ['categoriesHeading', 'Categories: heading', 'Shop by Category', 'text', 'The tiles come from Store categories (sector "Shop"). Categories with no stores are hidden.'],
  ['categoriesIntro', 'Categories: intro', 'Select any category below to browse retail stores, specialty boutiques, and tech outlets in our directory.', 'textarea'],
  ['outletsLabel', 'Store count text on tiles', '{count} Outlets', 'text', '{count} is replaced with the number of stores.'],
  ['bannerEyebrow', 'Directory banner: small label', 'Full Store Directory'],
  ['bannerHeading', 'Directory banner: heading', 'Looking for a Specific Brand, Shutter or Floor?'],
  ['bannerText', 'Directory banner: text', 'Access the complete, searchable directory with real-time keyword search, category filters, floor-by-floor listings, and interactive map links.', 'textarea'],
  ['bannerPrimaryLabel', 'Directory banner: first button', 'Open Store Directory', 'text', 'Leave empty to hide the button.'],
  ['bannerPrimaryUrl', 'Directory banner: first button link', '/shops/directory', 'url'],
  ['bannerSecondaryLabel', 'Directory banner: second button', 'Interactive Mall Map', 'text', 'Leave empty to hide the button.'],
  ['bannerSecondaryUrl', 'Directory banner: second button link', '/mall-map', 'url'],
]);

export const shopPageBlock = defineBlock<Record<string, string>>({
  key: 'shop-page',
  group: 'Shop page',
  label: 'Shop page text',
  description: 'Headings, intro text and buttons on the Shop landing page.',
  page: '/shop',
  ...shop,
});

/* -------------------------------------------------------------------------- */
/* Dine page (/dine)                                                          */
/* -------------------------------------------------------------------------- */

const dine = textBlock([
  ['title', 'Page title', 'Dine & Taste'],
  ['subtitle', 'Page intro', 'From authentic Himalayan Mustang Thakali and organic single-origin coffee to gourmet thin-crust pizza and vibrant casual dining, indulge your senses.', 'textarea'],
  ['badge', 'Small label above the title', 'GOURMET & CASUAL DINING'],
  ['breadcrumb', 'Breadcrumb name', 'Dine'],
  ['featuredEyebrow', 'Featured eateries: small label', 'Culinary Highlights'],
  ['featuredHeading', 'Featured eateries: heading', 'Featured Eateries & Cafes', 'text', 'Shows eateries marked "Featured" in the store editor (up to 6).'],
  ['featuredIntro', 'Featured eateries: intro', 'Handpicked standout restaurants, artisanal bakeries, and traditional kitchens inside Pokhara Trade Mall.', 'textarea'],
  ['featuredBadge', 'Badge on featured cards', 'Signature Spot'],
  ['featuredCta', 'Featured card button text', 'View Menu & Info'],
  ['directoryEyebrow', 'All eateries: small label', 'Browse All Flavors'],
  ['directoryHeading', 'All eateries: heading', 'Dining Directory'],
  ['showingText', 'All eateries: count text', 'Showing {shown} of {total} Dining Spots', 'text', '{shown} and {total} are replaced with numbers.'],
  ['allLabel', 'Filter button for everything', 'All Dining', 'text', 'The other filter buttons come from Store categories (sector "Dine") that have eateries.'],
  ['emptyText', 'Text when no eatery matches', '', 'text', 'Optional. Leave empty to show nothing.'],
  ['detailsLabel', 'Card button text', 'Details'],
  ['fallbackFloor', 'Floor shown when an eatery has none', '4th Floor'],
  ['fallbackCategory', 'Category shown when an eatery has none', 'Dining'],
  ['fallbackLocation', 'Location shown when no opening hours', 'Pokhara Trade Mall'],
  ['loadMoreLabel', 'Load more button', 'Load More Dining Outlets ({count} Remaining)', 'text', '{count} is replaced with how many are left.'],
  ['loadingMoreLabel', 'Load more button while loading', 'Loading Outlets...'],
  ['spotlightEyebrow', 'Bottom banner: small label', 'Culinary Excellence'],
  ['spotlightHeading', 'Bottom banner: heading', 'Savor Exceptional Dining & Vibrant Gatherings'],
  ['spotlightText', 'Bottom banner: text', 'From casual weekend brunch catch-ups and artisanal espresso roasts to authentic Himalayan feasts and delightful pre-movie dinners, Pokhara Trade Mall brings together a rich tapestry of flavors for food lovers and families alike.', 'textarea'],
  ['spotlightPrimaryLabel', 'Bottom banner: first button', 'Browse Full Directory', 'text', 'Leave empty to hide the button.'],
  ['spotlightPrimaryUrl', 'Bottom banner: first button link', '/shops/directory', 'url'],
  ['spotlightSecondaryLabel', 'Bottom banner: second button', 'Plan A Visit & Contact', 'text', 'Leave empty to hide the button.'],
  ['spotlightSecondaryUrl', 'Bottom banner: second button link', '/contact', 'url'],
], [
  { key: 'initialCount', label: 'Eateries shown at first', type: 'number', half: true },
  { key: 'loadMoreCount', label: 'Extra eateries per "Load more" click', type: 'number', half: true },
], { initialCount: 6, loadMoreCount: 4 });

export const dinePageBlock = defineBlock<Record<string, any>>({
  key: 'dine-page',
  group: 'Dine page',
  label: 'Dine page text',
  description: 'Headings, intro text, filters and buttons on the Dine page.',
  page: '/dine',
  ...dine,
});

/* -------------------------------------------------------------------------- */
/* Store directory (/shops/directory)                                         */
/* -------------------------------------------------------------------------- */

const directory = textBlock([
  ['title', 'Page title', 'Mall Store Directory'],
  ['subtitle', 'Page intro', 'Search and filter through all retail outlets, boutiques, dining spots, entertainment venues, and professional service suites at Pokhara Trade Mall.', 'textarea'],
  ['badge', 'Small label above the title', 'OMNICHANNEL DIRECTORY'],
  ['breadcrumbParent', 'Breadcrumb: parent name', 'Shop'],
  ['breadcrumbParentUrl', 'Breadcrumb: parent link', '/shop', 'url'],
  ['breadcrumb', 'Breadcrumb: this page', 'Store Directory'],
  ['allSectorsLabel', 'Sector button: everything', 'All Sectors'],
  ['retailLabel', 'Sector button: Shop', 'Shop & Boutiques'],
  ['dineLabel', 'Sector button: Dine', 'Dine & Cafes'],
  ['entertainLabel', 'Sector button: Entertain', 'Entertainment'],
  ['serviceLabel', 'Sector button: Services', 'Services & Offices'],
  ['searchPlaceholder', 'Search box hint', 'Search store name, brand, keyword, unit...'],
  ['allCategoriesLabel', 'Category menu: everything', 'All Categories (Complete Directory)', 'text', 'Other choices come from Store categories; ones with no stores are left out.'],
  ['allFloorsLabel', 'Floor menu: everything', 'All Floors', 'text', 'Other choices are the floors your stores are on.'],
  ['sortFeatured', 'Sort option: featured', 'Sort: Featured First'],
  ['sortNameAsc', 'Sort option: A-Z', 'Name (A-Z)'],
  ['sortNameDesc', 'Sort option: Z-A', 'Name (Z-A)'],
  ['sortFloor', 'Sort option: floor', 'By Floor Level'],
  ['activeFiltersLabel', 'Active filters label', 'Active Filters:'],
  ['clearAllLabel', 'Clear filters link', 'Clear All'],
  ['noFiltersText', 'Text when no filter is set', 'Showing all outlets'],
  ['showingText', 'Result count text', 'Showing {shown} of {total} Outlets', 'text', '{shown} and {total} are replaced with numbers.'],
  ['loadingText', 'Loading text', 'Loading store directory...'],
  ['emptyTitle', 'No results: heading', 'No Outlets Found'],
  ['emptyText', 'No results: text', "We couldn't find any stores matching your current search or filter combination.", 'textarea'],
  ['emptyButton', 'No results: button', 'Reset All Filters'],
  ['featuredBadge', 'Badge on featured stores', 'Featured'],
  ['exploreLabel', 'Grid card button text', 'Explore'],
  ['detailsLabel', 'List row button text', 'Details'],
  ['fallbackFloor', 'Floor shown when a store has none', 'Main Mall'],
  ['fallbackLocation', 'Location shown when no opening hours', 'Pokhara Trade Mall'],
]);

export const directoryPageBlock = defineBlock<Record<string, string>>({
  key: 'directory-page',
  group: 'Store directory',
  label: 'Store directory text',
  description: 'Title, filter labels, sort options and empty-state text on the searchable store directory.',
  page: '/shops/directory',
  ...directory,
});

/* -------------------------------------------------------------------------- */
/* Store detail page (/shops/details/:slug)                                   */
/* -------------------------------------------------------------------------- */

const store = textBlock([
  ['loadingText', 'Loading text', 'Loading store profile...'],
  ['notFoundTitle', 'Store not found: heading', 'Store Not Found'],
  ['notFoundText', 'Store not found: text', "We couldn't find the store or boutique you were searching for.", 'textarea'],
  ['notFoundPrimary', 'Store not found: first button', 'Explore Directory'],
  ['notFoundSecondary', 'Store not found: second button', 'Go Home'],
  ['subtitleFallback', 'Intro when a store has no subtitle', 'Explore {name} at Pokhara Trade Mall', 'text', '{name} is replaced with the store name.'],
  ['badgeFallback', 'Label when a store has no type', 'RETAIL OUTLET'],
  ['breadcrumb', 'Breadcrumb: parent name', 'Directory'],
  ['directoryUrl', 'Directory link', '/shops/directory', 'url'],
  ['backLabel', 'Back link text', 'Back to Store Directory'],
  ['floorLabel', 'Floor pill', 'Floor: {floor}', 'text', '{floor} is replaced with the store floor.'],
  ['floorFallback', 'Floor shown when a store has none', 'Level 1'],
  ['unitLabel', 'Unit pill', 'Unit: {unit}', 'text', '{unit} is replaced with the unit number. Hidden when a store has none.'],
  ['descriptionFallback', 'Description when a store has none', 'Welcome to {name} at Pokhara Trade Mall.', 'textarea', '{name} is replaced with the store name.'],
  ['connectLabel', 'Social links label', 'Connect:'],
  ['tagsHeading', 'Tags label', 'Tags:', 'text', 'Hidden when a store has no tags.'],
  ['infoHeading', 'Info box heading', 'Store Information'],
  ['hoursLabel', 'Hours label', 'Hours'],
  ['hoursFallback', 'Hours when a store has none', '', 'text', 'Leave empty to hide the hours box when a store has no hours.'],
  ['phoneLabel', 'Phone label', 'Direct Phone'],
  ['phoneFallback', 'Phone when a store has none', '', 'text', 'Leave empty to hide the phone box when a store has no phone.'],
  ['callLabel', 'Call button', 'Call Store Directly'],
  ['websiteLabel', 'Website button', 'Visit Website', 'text', 'Shown when a store has a website.'],
  ['galleryHeading', 'Gallery heading', 'Store Gallery'],
  ['mapEyebrow', 'Map box: small label', 'Navigation'],
  ['mapHeading', 'Map box: heading', 'Find in Mall Map'],
  ['mapText', 'Map box: text', 'Locate {name} with step-by-step turn guidance, escalators, and nearest parking lifts.', 'textarea', '{name} is replaced with the store name.'],
  ['mapButton', 'Map box: button', 'Navigate on Interactive Map'],
]);

export const storePageBlock = defineBlock<Record<string, string>>({
  key: 'store-page',
  group: 'Store page',
  label: 'Store page text',
  description: 'Labels and fallback text on every store profile page. The store details themselves are edited under Stores.',
  page: '/shops/directory',
  ...store,
});

/* -------------------------------------------------------------------------- */
/* Shop type page groupings (fashion, tech, beauty...)                        */
/* -------------------------------------------------------------------------- */

export interface StoreGroup {
  id: string;
  name: string;
  shortName?: string;
  icon: string;
  description?: string;
  categories: string[];
  spotlight?: boolean;
  hidden?: boolean;
}

const g = (id: string, name: string, shortName: string, icon: string, description: string, categories: string[], spotlight = true): StoreGroup =>
  ({ id, name, shortName, icon, description, categories, spotlight });

const shopType = textBlock([
  ['allTitle', 'All outlets: title', 'Shop Directory'],
  ['allSubtitle', 'All outlets: intro', 'Discover premier brands, specialty boutiques, gourmet eateries, and entertainment hubs in the heart of Chipledhunga, Pokhara.', 'textarea'],
  ['allBadge', 'All outlets: small label', 'EXPLORE OUTLETS'],
  ['retailTitle', 'Shops: title', 'Shop & Boutiques'],
  ['retailSubtitle', 'Shops: intro', 'Explore an expansive collection of leading apparel, electronics, beauty, fine jewelry, and artisanal crafts across Pokhara Trade Mall.', 'textarea'],
  ['retailBadge', 'Shops: small label', 'EXCLUSIVE RETAIL'],
  ['eateryTitle', 'Dining: title', 'Dining & Cafes'],
  ['eaterySubtitle', 'Dining: intro', 'From authentic Mustang Thakali and stone-oven pizzas to single-origin Himalayan coffee, delight your palate.', 'textarea'],
  ['eateryBadge', 'Dining: small label', 'GOURMET & CASUAL'],
  ['serviceTitle', 'Services: title', 'Services & Leisure'],
  ['serviceSubtitle', 'Services: intro', 'Luxury Ayurvedic spa treatments, state-of-the-art 4K QFX cinema, 4D VR games, and essential mall conveniences.', 'textarea'],
  ['serviceBadge', 'Services: small label', 'WELLNESS & CINEMA'],
  ['breadcrumb', 'Breadcrumb: parent name', 'Shop'],
  ['breadcrumbUrl', 'Breadcrumb: parent link', '/shops/retail', 'url'],
  ['tabAll', 'Tab: all', 'All Outlets'],
  ['tabRetail', 'Tab: shops', 'Shop & Boutiques'],
  ['tabEatery', 'Tab: dining', 'Dining & Cafes'],
  ['tabService', 'Tab: services', 'Services & Fun'],
  ['featuredEyebrow', 'Featured: small label', 'Featured Brands'],
  ['featuredHeading', 'Featured: heading', 'Featured Outlets'],
  ['featuredIntro', 'Featured: intro', 'Handpicked standout boutiques, authorized tech centers, and signature destinations at Pokhara Trade Mall.', 'textarea'],
  ['featuredAllLabel', 'Featured filter: everything', 'All Featured'],
  ['browseHeading', 'Category tiles: heading', 'Browse By Category'],
  ['browseHint', 'Category tiles: hint', 'Click to filter directory'],
  ['allGroupName', 'Tile/menu for everything', 'All Categories'],
  ['outletsLabel', 'Store count on tiles', '{count} Outlets', 'text', '{count} is replaced with the number of stores.'],
  ['directoryEyebrow', 'Directory: small label', 'Mall Directory'],
  ['directoryHeading', 'Directory: heading', 'Store Directory'],
  ['showingText', 'Directory: count text', 'Showing {shown} of {total} Stores', 'text', '{shown} and {total} are replaced with numbers.'],
  ['searchPlaceholder', 'Search box hint', 'Search by store name, brand, category, floor, or tag...'],
  ['allFloorsLabel', 'Floor menu: everything', 'All Floors'],
  ['sortFeatured', 'Sort option: featured', 'Sort: Featured'],
  ['sortNameAsc', 'Sort option: A-Z', 'Name (A-Z)'],
  ['sortNameDesc', 'Sort option: Z-A', 'Name (Z-A)'],
  ['sortFloor', 'Sort option: floor', 'By Floor Level'],
  ['filtersLabel', 'Filters label', 'Filters:'],
  ['clearAllLabel', 'Clear filters link', 'Clear All'],
  ['noFiltersText', 'Text when no filter is set', 'Showing all stores'],
  ['loadingText', 'Loading text', 'Loading store directory...'],
  ['emptyTitle', 'No results: heading', 'No Outlets Found'],
  ['emptyText', 'No results: text', "We couldn't find any stores matching your current search or filter combination.", 'textarea'],
  ['emptyButton', 'No results: button', 'Reset All Filters'],
  ['featuredBadge', 'Badge on featured stores', 'Featured'],
  ['exploreLabel', 'Grid card button text', 'Explore'],
  ['detailsLabel', 'List row button text', 'Details'],
  ['featuredFallbackFloor', 'Featured card: floor when missing', 'Pokhara Trade Mall'],
  ['fallbackFloor', 'Directory card: floor when missing', 'Main Mall'],
  ['fallbackLocation', 'Location shown when no opening hours', 'Pokhara Trade Mall'],
  ['mapEyebrow', 'Map banner: small label', 'Interactive Navigation'],
  ['mapHeading', 'Map banner: heading', 'Find Any Store in Seconds with Mall Map'],
  ['mapText', 'Map banner: text', 'Looking for a specific boutique, lift, escalator, or dining terrace? Use our step-by-step interactive floor directory to navigate Pokhara Trade Mall seamlessly across all 6 levels.', 'textarea'],
  ['mapPrimaryLabel', 'Map banner: first button', 'Open Mall Map', 'text', 'Leave empty to hide the button.'],
  ['mapPrimaryUrl', 'Map banner: first button link', '/mall-map', 'url'],
  ['mapSecondaryLabel', 'Map banner: second button', 'Guest Services & Info', 'text', 'Leave empty to hide the button.'],
  ['mapSecondaryUrl', 'Map banner: second button link', '/contact', 'url'],
], [
  {
    key: 'groups', label: 'Category groups', type: 'list', itemTitle: 'name', itemName: 'group',
    help: 'Broad groups (e.g. Fashion) that each cover several store categories. Groups with no stores are hidden.',
    itemDefaults: { icon: 'store', categories: [], spotlight: true },
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true, half: true },
      { key: 'shortName', label: 'Short name', type: 'text', half: true, help: 'Used on the featured-store filter buttons.' },
      { key: 'id', label: 'Code', type: 'text', half: true, required: true, help: 'Lowercase, no spaces. Used in links (?category=code).' },
      { key: 'icon', label: 'Icon', type: 'icon', half: true, options: ICON_OPTIONS },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'categories', label: 'Store categories in this group', type: 'tags', help: 'Category codes from Store categories, e.g. "womens-fashion".' },
      { key: 'spotlight', label: 'Show as a featured-store filter', type: 'toggle', half: true },
      { key: 'hidden', label: 'Hide this group', type: 'toggle', half: true },
    ],
  },
], {
  groups: [
    g('fashion', 'Fashion & Apparel', 'Fashion & Denim', 'tshirt', 'International brands, designer wear, traditional Nepali ethnic apparel, and everyday denim.', ['womens-fashion', 'mens-fashion', 'kids']),
    g('tech', 'Tech & Electronics', 'Tech & Mobiles', 'laptop', 'Smartphones, high-performance gaming hardware, accessories, and certified repair hubs.', ['electronics']),
    g('beauty', 'Beauty & Wellness', 'Beauty & Spa', 'spa', 'International cosmetics, skincare, Ayurvedic spas, hair salons, and organic body therapies.', ['beauty-fragrance', 'beauty-wellness']),
    g('jewelry', 'Jewelry & Watches', 'Fine Jewelry', 'gem', 'Certified Hallmark 24K gold, diamond jewelry, designer accessories, and luxury timepieces.', ['jewelry-watches']),
    g('dining', 'Dining & Cafes', 'Cafes & Dining', 'utensils', 'Artisanal espresso cafes, authentic Himalayan Thakali, wood-fired pizza, and gourmet food courts.', ['thakali', 'restaurant', 'cafe', 'fast-food']),
    g('crafts', 'Crafts & Souvenirs', 'Handicrafts', 'gift', 'Handcrafted cashmere pashminas, organic wild hemp, handmade carpets, and Nepali heritage gifts.', ['handicrafts', 'home-living']),
    g('entertainment', 'Entertainment & Leisure', 'Entertainment', 'gamepad', '4K laser QFX cinema, 4D VR game simulator zone, and interactive family recreation.', ['cinema', 'gaming'], false),
  ],
  allGroupDescription: 'Explore all retail, dining, beauty, and entertainment outlets at Pokhara Trade Mall.',
});
shopType.fields.push({ key: 'allGroupDescription', label: 'Description for "all" group', type: 'textarea' });

export const shopTypePageBlock = defineBlock<Record<string, any>>({
  key: 'shop-type-page',
  group: 'Store directory',
  label: 'Store sections page (by type)',
  description: 'Text and broad category groups on the store listing page organised by type (shops, dining, services).',
  ...shopType,
});

// Blocks for this area are registered here; see src/content/blocks/index.ts.
export const directoryBlocks: BlockDef<any>[] = [shopPageBlock, dinePageBlock, directoryPageBlock, storePageBlock, shopTypePageBlock];
