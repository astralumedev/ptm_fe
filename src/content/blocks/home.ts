import { useMemo } from 'react';
import { defineBlock, useBundle, type BlockDef } from '../block';
import { SCHEDULE_FIELDS, type Field } from '../fields';
import { liveOnly, type Schedulable } from '../visibility';

const GROUP = 'Home page';

const SHOW_FIELD: Field = { key: 'show', label: 'Show this section', type: 'toggle', help: 'Turn off to hide the whole section from the home page.' };
const heading = (what: string): Field[] => [
  { key: 'title', label: 'Section heading', type: 'text', half: true },
  { key: 'seeAllLabel', label: '"See all" link text', type: 'text', half: true },
  { key: 'intro', label: 'Intro text', type: 'textarea', help: `A sentence or two under the heading introducing ${what}.` },
  { key: 'seeAllLink', label: '"See all" link', type: 'url', half: true },
  { key: 'cardCta', label: 'Card button text', type: 'text', half: true, help: 'Small call to action on each card.' },
];

/* ---------------- Hero ---------------- */

export interface HeroButton { label: string; href: string; style: 'primary' | 'dark' }
export interface HeroSlide extends Schedulable { title: string; category: string; date?: string; summary: string; imageUrl: string; href: string }
export interface HeroContent {
  backgroundUrl: string;
  backgroundAlt: string;
  /** Colour of the banner behind the photo. */
  tone?: 'maroon' | 'navy' | 'charcoal';
  title: string;
  intro: string;
  buttons: HeroButton[];
  showcaseTitle: string;
  intervalSeconds: number;
  slides: HeroSlide[];
}

export const homeHeroBlock = defineBlock<HeroContent>({
  key: 'home-hero',
  group: GROUP,
  label: "Hero & What's On slider",
  description: "The big banner at the top of the home page, with the rotating \"What's On\" slides.",
  page: '/',
  fields: [
    { key: 'title', label: 'Headline', type: 'text' },
    { key: 'intro', label: 'Text under the headline', type: 'textarea' },
    { key: 'backgroundUrl', label: 'Background photo', type: 'imageUrl', half: true, help: 'Shown faintly behind the banner. Wide landscape photo, at least 1600px wide.' },
    { key: 'backgroundAlt', label: 'Background photo description', type: 'text', half: true },
    {
      key: 'tone', label: 'Banner colour', type: 'select', half: true,
      help: 'The colour behind the photo. Every option keeps the white text readable.',
      options: [{ value: 'maroon', label: 'Maroon night (original)' }, { value: 'navy', label: 'PTM navy' }, { value: 'charcoal', label: 'Charcoal' }],
    },
    {
      key: 'buttons', label: 'Buttons', type: 'list', itemTitle: 'label', itemName: 'button', max: 3,
      itemDefaults: { label: '', href: '/', style: 'primary' },
      fields: [
        { key: 'label', label: 'Text', type: 'text', half: true },
        { key: 'href', label: 'Link', type: 'url', half: true },
        { key: 'style', label: 'Style', type: 'select', half: true, options: [{ value: 'primary', label: 'Red (main)' }, { value: 'dark', label: 'Dark (secondary)' }] },
      ],
    },
    { key: 'showcaseTitle', label: 'Slider heading', type: 'text', half: true },
    { key: 'intervalSeconds', label: 'Seconds per slide', type: 'number', half: true, help: 'How long each slide stays before moving to the next.' },
    {
      key: 'slides', label: "What's On slides", type: 'list', itemTitle: 'title', itemName: 'slide', max: 10,
      help: 'Rotate automatically. Use "Show from" / "Hide after" so a promotion appears and disappears on its own. If no slide is live, the slider box is hidden.',
      itemDefaults: { title: '', category: 'EVENT', summary: '', imageUrl: '', href: '/latest' },
      fields: [
        { key: 'title', label: 'Title', type: 'text', required: true },
        { key: 'category', label: 'Small label', type: 'text', half: true, placeholder: 'EVENT', help: 'e.g. EVENT, NEWS, OFFER, STORE.' },
        { key: 'date', label: 'Date text', type: 'text', half: true, placeholder: 'Aug 15 - Aug 25', help: 'For your reference; not shown on the slide right now.' },
        { key: 'summary', label: 'Short description', type: 'textarea', help: 'About 15-20 words; longer text is cut after two lines.' },
        { key: 'imageUrl', label: 'Photo', type: 'imageUrl', half: true, help: 'Landscape photo, about 800px wide.' },
        { key: 'href', label: 'Link when clicked', type: 'url', half: true },
        ...SCHEDULE_FIELDS,
      ],
    },
  ],
  defaults: {
    backgroundUrl: '/mall_images/ptm_hero.webp',
    backgroundAlt: 'Pokhara Trade Mall Building',
    tone: 'maroon',
    title: 'ELEVATE YOUR SHOPPING EXPERIENCE',
    intro: 'Your premier lifestyle destination for global fashion brands, gourmet Thakali dining, QFX cinemas, and everyday essentials in Pokhara.',
    buttons: [
      { label: 'Explore Stores', href: '/shops/directory', style: 'primary' },
      { label: "What's On & Events", href: '/latest', style: 'dark' },
    ],
    showcaseTitle: "WHAT'S ON",
    intervalSeconds: 4.5,
    slides: [
      {
        title: 'Festive Shopping Extravaganza 2026',
        category: 'EVENT',
        date: 'Aug 15 - Aug 25',
        summary: 'Up to 50% OFF across top fashion, apparel & footwear brands at Pokhara Trade Mall!',
        imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
        href: '/latest#events',
      },
      {
        title: 'QFX Cinemas New 4K Screen Unveiling',
        category: 'NEWS',
        date: 'Aug 20',
        summary: 'Experience ultra-crisp 4K Laser Projection and immersive Dolby Atmos surround sound at Screen 2.',
        imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
        href: '/latest#events',
      },
      {
        title: 'Mustang Thakali Food & Wine Fest',
        category: 'BLOG',
        date: 'Aug 28',
        summary: 'Taste authentic Himalayan Thakali delicacies and local artisan fruit wines on the rooftop terrace.',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        href: '/latest#blogs',
      },
      {
        title: 'New Luxury Fashion Boutiques Opening',
        category: 'STORE',
        date: 'Sep 05',
        summary: 'Discover exclusive premium designer wear, cosmetics, and luxury accessories on the Ground Floor.',
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
        href: '/shops/retail',
      },
    ],
  },
});

/* ---------------- Store showcases (Shop + Dine) ---------------- */

export interface StoreCardItem extends Schedulable {
  store?: string;
  name?: string;
  category?: string;
  floor?: string;
  imageUrl?: string;
  href?: string;
  wide?: boolean;
}
export interface StoreShowcaseContent {
  show: boolean;
  title: string;
  intro: string;
  seeAllLabel: string;
  seeAllLink: string;
  cardCta: string;
  items: StoreCardItem[];
}

const storeCardList = (noun: string): Field => ({
  key: 'items', label: `${noun} to feature`, type: 'list', itemTitle: 'name', itemName: noun.toLowerCase().replace(/s$/, ''), max: 12,
  help: 'Pick a store from the directory and its name, photo, category and floor are used automatically, so updating the store updates this card. Fill in the other boxes only to show something different on the home page. Cards flow in rows of three; a "wide" card takes two spaces.',
  itemDefaults: { store: '', wide: false },
  fields: [
    { key: 'store', label: 'Store', type: 'store', help: 'Leave empty only for a place that has no store page.' },
    { key: 'name', label: 'Name on card', type: 'text', half: true, help: 'Optional. Defaults to the store name.' },
    { key: 'category', label: 'Category text', type: 'text', half: true, help: "Optional. Defaults to the store's category." },
    { key: 'floor', label: 'Location text', type: 'text', half: true, help: "Optional. Defaults to the store's floor." },
    { key: 'imageUrl', label: 'Card photo', type: 'imageUrl', half: true, help: "Optional. Defaults to the store's cover photo." },
    { key: 'href', label: 'Link', type: 'url', half: true, help: "Optional. Defaults to the store's page." },
    { key: 'wide', label: 'Wide card (two spaces)', type: 'toggle', half: true },
    ...SCHEDULE_FIELDS,
  ],
});

export const homeFeaturedBlock = defineBlock<StoreShowcaseContent>({
  key: 'home-featured',
  group: GROUP,
  label: 'Shop showcase',
  description: 'The "SHOP" section with featured store cards.',
  page: '/',
  fields: [SHOW_FIELD, ...heading('shopping at the mall'), storeCardList('Stores')],
  defaults: {
    show: true,
    title: 'SHOP',
    intro: 'Pokhara Trade Mall is your one-stop destination for an expansive selection of the best brands in clothing, fashion accessories, beauty, home collections, interiors and more. With its fashion-forward collection and eclectic pop-up shops, Pokhara Trade Mall delivers a dynamic shopping experience that will make you come back for more.',
    seeAllLabel: 'See All',
    seeAllLink: '/shop',
    cardCta: 'Explore Outlet',
    items: [
      { store: 'levis-store', name: "LEVI'S STORE", category: 'Fashion & Apparel', floor: '1st Floor - Wing A', imageUrl: '/stores/levis_cover.webp' },
      { store: 'fone-decor-tech', name: 'FONE DECOR & TECH', category: 'Tech & Mobiles', floor: 'Ground Floor - Tech Alley', imageUrl: '/stores/fone_decor_cover.jpeg', wide: true },
      { store: 'obsession-cosmetics', name: 'OBSESSION COSMETICS', category: 'Beauty & Skincare', floor: '1st Floor - Beauty Hub', imageUrl: '/stores/obsession_cosmetics_cover.jpeg' },
      { store: 'woven-nepali-handicrafts', name: 'WOVEN NEPALI HANDICRAFTS', category: 'Local Crafts & Gifts', floor: 'Ground Floor Main Atrium', imageUrl: '/stores/woven_cover.jpg' },
      { store: 'dadybird-fashion', name: 'DADYBIRD FASHION', category: 'Fashion & Kids', floor: '2nd Floor - Wing B', imageUrl: '/stores/dadybird_cover.webp' },
      { store: 'cube-gaming-tech', name: 'CUBE GAMING & TECH', category: 'Tech & Gaming', floor: 'Ground Floor - Tech Alley', imageUrl: '/stores/cube_cover.jpg', wide: true },
      { store: 'malabar-gold-diamonds', name: 'MALABAR GOLD & DIAMONDS', category: 'Jewelry & Watches', floor: 'Ground Floor Plaza', imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80' },
    ],
  },
});

export const homeDiningBlock = defineBlock<StoreShowcaseContent>({
  key: 'home-dining',
  group: GROUP,
  label: 'Dining showcase',
  description: 'The "DINE & FLAVORS" section with restaurant and cafe cards.',
  page: '/',
  fields: [SHOW_FIELD, ...heading('food and drink at the mall'), storeCardList('Restaurants')],
  defaults: {
    show: true,
    title: 'DINE & FLAVORS',
    intro: 'Treat your palate to a culinary journey at Pokhara Trade Mall! From traditional Mustang Thakali to specialty coffee roasters, authentic Neapolitan pizzas, and multi-cuisine food courts.',
    seeAllLabel: 'See All',
    seeAllLink: '/dine',
    cardCta: 'Explore Outlet',
    items: [
      { store: 'himalayan-java-coffee', name: 'HIMALAYAN JAVA COFFEE', category: 'Specialty Coffee & Bakery', floor: 'Ground Floor Plaza', imageUrl: '/stores/himalayan_java_cover.jpg', wide: true },
      { store: 'mantra-thakali-kitchen', name: 'MANTRA THAKALI & BAR', category: 'Nepali Ethnic Dining', floor: '3rd Floor Food Court', imageUrl: '/stores/mantra_thakali_cover.jpg' },
      { store: 'fewa-lakeside-bistro', name: 'FEWA LAKESIDE BISTRO', category: 'Wood-fired Pizza & Bistro', floor: '1st Floor Terrace', imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80' },
      { store: '', name: 'POKHARA FOOD COURT', category: 'Multi-Cuisine Food Hall', floor: '3rd Floor Main Atrium', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', href: '/dine' },
      { store: '', name: 'ANNAPURNA ROOFTOP LOUNGE', category: 'Craft Cocktails & Grills', floor: 'Rooftop Level', imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80', href: '/dine' },
      { store: 'everest-momo-house', name: 'HIMALAYAN MOMO HOUSE', category: 'Authentic Dumplings & Snacks', floor: '3rd Floor Food Court', imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80' },
      { store: 'fewa-lakeside-bistro', name: 'LAKESIDE BAKERY & CREPERIE', category: 'French Pastries & Waffles', floor: 'Ground Floor Wing B', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80', wide: true },
    ],
  },
});

export interface ResolvedStoreCard { key: string; name: string; category: string; floor: string; imageUrl: string; href: string; wide: boolean; tall: boolean;
  /** Store category code, for the icon shown when there is no photo. */
  categorySlug?: string }

/**
 * Live showcase items merged with the store they point to. Overrides win; missing values fall back
 * to the store record. Cards whose store was removed and that have no own name are dropped.
 * Rows alternate tall / short, like the original grid.
 */
export function useStoreCards(items: StoreCardItem[] | undefined): ResolvedStoreCard[] {
  const bundle = useBundle();
  const stores = bundle?.stores;
  return useMemo(() => {
    const out: ResolvedStoreCard[] = [];
    let used = 0;
    liveOnly(items).forEach((item, i) => {
      const s = item.store ? stores?.find((x) => x.slug === item.store) : undefined;
      const name = item.name || s?.name;
      if (!name) return;
      const wide = !!item.wide;
      const span = wide ? 2 : 1;
      if ((used % 3) + span > 3) used += 3 - (used % 3); // a wide card that doesn't fit starts a new row
      const row = Math.floor(used / 3);
      used += span;
      out.push({
        key: `${item.store || 'item'}-${i}`,
        name,
        category: item.category || s?.category || '',
        floor: item.floor || s?.floor || '',
        imageUrl: item.imageUrl || s?.cover?.data?.full_url || s?.logo?.data?.full_url || '',
        href: item.href || (s ? `/shops/details/${s.slug}` : ''),
        categorySlug: s?.categorySlug || s?.category,
        wide,
        tall: row % 2 === 0,
      });
    });
    return out;
  }, [items, stores]);
}

/* ---------------- QFX ---------------- */

export interface Movie extends Schedulable { title: string; genre: string; rating: string; duration: string; language?: string; format: string; posterUrl: string; showtimes: string[]; href?: string }
export interface QfxContent {
  show: boolean;
  badge: string;
  logoUrl: string;
  title: string;
  intro: string;
  bookLabel: string;
  bookUrl: string;
  reserveLabel: string;
  movies: Movie[];
}

export const homeQfxBlock = defineBlock<QfxContent>({
  key: 'home-qfx',
  group: GROUP,
  label: 'QFX Cinemas – now showing',
  description: 'The cinema section with the scrolling row of movie posters and showtimes.',
  page: '/',
  fields: [
    SHOW_FIELD,
    { key: 'title', label: 'Section heading', type: 'text', half: true },
    { key: 'badge', label: 'Small label above the heading', type: 'text', half: true },
    { key: 'logoUrl', label: 'Cinema logo', type: 'imageUrl', half: true },
    { key: 'reserveLabel', label: 'Poster button text', type: 'text', half: true },
    { key: 'intro', label: 'Intro text', type: 'textarea' },
    { key: 'bookLabel', label: 'Booking link text', type: 'text', half: true },
    { key: 'bookUrl', label: 'Booking website', type: 'url', half: true, help: 'Where "Book Tickets" and the posters go.' },
    {
      key: 'movies', label: 'Now showing', type: 'list', itemTitle: 'title', itemName: 'movie', max: 20,
      help: 'Update every week. Set "Hide after" to the last show date so old movies disappear on their own. If no movie is live, the whole section is hidden.',
      itemDefaults: { title: '', genre: '', rating: 'UA', duration: '', format: '2D', posterUrl: '', showtimes: [] },
      fields: [
        { key: 'title', label: 'Movie title', type: 'text', required: true },
        { key: 'genre', label: 'Genre', type: 'text', half: true, placeholder: 'Action / Comedy' },
        { key: 'format', label: 'Format', type: 'text', half: true, placeholder: '3D ATMOS' },
        { key: 'rating', label: 'Rating', type: 'text', half: true, placeholder: 'UA' },
        { key: 'duration', label: 'Duration', type: 'text', half: true, placeholder: '2h 08m' },
        { key: 'language', label: 'Language', type: 'text', half: true, help: 'For your reference; not shown on the poster right now.' },
        { key: 'posterUrl', label: 'Poster', type: 'imageUrl', half: true, help: 'Portrait poster image.' },
        { key: 'showtimes', label: 'Showtimes', type: 'tags', help: 'Type each time and press Enter, e.g. 11:00 AM.' },
        { key: 'href', label: 'Link', type: 'url', help: 'Optional. Defaults to the booking website above.' },
        ...SCHEDULE_FIELDS,
      ],
    },
  ],
  defaults: {
    show: true,
    badge: 'Multiplex Cineplex',
    logoUrl: '/stores/qfx/qfx.png',
    title: 'QFX CINEMAS',
    intro: 'Catch the latest global blockbusters and Nepali cinema at Pokhara Trade Mall! Featuring state-of-the-art 4K laser projection, immersive Dolby Atmos surround sound, and luxury recliner seating.',
    bookLabel: 'Book Tickets',
    bookUrl: 'https://www.qfxcinemas.com/',
    reserveLabel: 'Reserve Seats',
    movies: [
      { title: 'AVATAR: FIRE AND ASH', genre: 'Sci-Fi / Action / Epic', rating: 'UA', duration: '3h 12m', language: 'English (3D)', format: '3D ATMOS', posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', showtimes: ['11:00 AM', '03:00 PM', '07:00 PM'] },
      { title: 'DEADPOOL & WOLVERINE', genre: 'Action / Sci-Fi / Comedy', rating: 'UA 16+', duration: '2h 08m', language: 'English', format: '3D', posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80', showtimes: ['11:15 AM', '02:30 PM', '06:00 PM'] },
      { title: 'DUNE: PART TWO', genre: 'Sci-Fi / Epic Adventure', rating: 'UA', duration: '2h 46m', language: 'English', format: '3D', posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80', showtimes: ['12:00 PM', '04:00 PM', '08:00 PM'] },
      { title: 'INSIDE OUT 2', genre: 'Animation / Family', rating: 'U', duration: '1h 36m', language: 'English', format: '2D', posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80', showtimes: ['10:45 AM', '01:15 PM', '03:45 PM'] },
      { title: 'GLADIATOR II', genre: 'Action / Historical Epic', rating: 'UA', duration: '2h 28m', language: 'English', format: '3D', posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80', showtimes: ['02:15 PM', '07:00 PM'] },
      { title: 'KANGUVA: THE WARRIOR', genre: 'Period Action / Drama', rating: 'UA', duration: '2h 34m', language: 'Nepali / Hindi', format: '3D', posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80', showtimes: ['10:30 AM', '02:00 PM', '05:45 PM'] },
    ],
  },
});

/* ---------------- Opening soon ---------------- */

export interface UpcomingStore extends Schedulable { name: string; category: string; floor: string; expectedDate: string; teaser: string; imageUrl: string; href?: string }
export interface OpeningSoonContent { show: boolean; title: string; intro: string; badge: string; items: UpcomingStore[] }

export const homeOpeningSoonBlock = defineBlock<OpeningSoonContent>({
  key: 'home-opening-soon',
  group: GROUP,
  label: 'Opening soon',
  description: 'Cards announcing stores that are coming to the mall.',
  page: '/',
  fields: [
    SHOW_FIELD,
    { key: 'title', label: 'Section heading', type: 'text', half: true },
    { key: 'badge', label: 'Ribbon on each photo', type: 'text', half: true },
    { key: 'intro', label: 'Intro text', type: 'textarea' },
    {
      key: 'items', label: 'Upcoming stores', type: 'list', itemTitle: 'name', itemName: 'store', max: 10,
      help: 'Once a store has opened, delete it here (or set "Hide after" to its opening day). If no card is live, the section is hidden.',
      itemDefaults: { name: '', category: '', floor: '', expectedDate: 'Opening soon', teaser: '', imageUrl: '' },
      fields: [
        { key: 'name', label: 'Store name', type: 'text', required: true },
        { key: 'category', label: 'Category text', type: 'text', half: true },
        { key: 'expectedDate', label: 'Opening date text', type: 'text', half: true, placeholder: 'Opening Spring 2026' },
        { key: 'floor', label: 'Location text', type: 'text', half: true },
        { key: 'imageUrl', label: 'Photo', type: 'imageUrl', half: true },
        { key: 'teaser', label: 'Short description', type: 'textarea' },
        { key: 'href', label: 'Link', type: 'url', help: 'Optional. Makes the store name clickable (e.g. to its store page once it exists).' },
        ...SCHEDULE_FIELDS,
      ],
    },
  ],
  defaults: {
    show: true,
    title: 'OPENING SOON',
    intro: 'Get ready for exciting new arrivals! Iconic global brands, luxury lifestyle lounges, and flagship outlets are bringing their signature experiences to Pokhara Trade Mall.',
    badge: 'COMING SOON',
    items: [
      { name: 'Adidas Flagship Store', category: 'Sportswear & Sneakers', floor: 'Ground Floor - Main Plaza', expectedDate: 'Opening Spring 2026', teaser: "World's iconic three-stripes performance activewear, Originals footwear, and athleisure gear arriving soon in Pokhara.", imageUrl: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=800&q=80' },
      { name: 'Starbucks Coffee', category: 'Global Cafe & Espresso', floor: '1st Floor - Outdoor Terrace', expectedDate: 'Opening Summer 2026', teaser: 'Handcrafted espresso beverages, Frappuccinos, fresh artisan food & cozy lounge seating overlooking Pokhara city view.', imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80' },
      { name: 'Miniso Lifestyle', category: 'Japanese Lifestyle & Gifts', floor: '2nd Floor - Retail Atrium', expectedDate: 'Opening Mid 2026', teaser: 'Affordable plushies, digital gadgets, home organizing aesthetic, travel items, and viral pop-culture merchandise.', imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80' },
      { name: 'Sephora Beauty Lounge', category: 'Cosmetics & Skincare', floor: '1st Floor - Fashion Wing', expectedDate: 'Opening Fall 2026', teaser: 'Premium global beauty brands, luxury fragrances, skincare consultations, and interactive makeup bars.', imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80' },
    ],
  },
});

// Blocks for this area are registered here; see src/content/blocks/index.ts.
export const homeBlocks: BlockDef<any>[] = [homeHeroBlock, homeFeaturedBlock, homeDiningBlock, homeQfxBlock, homeOpeningSoonBlock];
