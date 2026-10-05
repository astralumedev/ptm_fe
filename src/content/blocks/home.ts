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
      { store: 'obsession-cosmetics' },
      { store: 'fone-decor', wide: true },
      { store: 'titan' },
      { store: 'newmew-pokhara' },
      { store: 'cheppa-bee' },
      { store: 'dadybird-collection', wide: true },
      { store: 'safari' },
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
      { store: 'classic-chulo', wide: true },
      { store: 'meriz-coffee' },
      { store: 'the-cube-cafe' },
      { store: 'june-coffee-smoothies' },
      { store: 'boba-station' },
    ],
  },
});

export interface ResolvedStoreCard {
  key: string;
  name: string;
  category: string;
  floor: string;
  imageUrl: string;
  href: string;
  wide: boolean;
  colSpanClass: string;
  tall: boolean;
  /** Store category code, for the icon shown when there is no photo. */
  categorySlug?: string;
}

/**
 * Live showcase items merged with the store they point to. Overrides win; missing values fall back
 * to the store record. Intelligently calculates wide vs regular card spans based on total item count
 * so every row in the 3-column grid is completely filled with zero awkward empty spaces.
 */
export function useStoreCards(items: StoreCardItem[] | undefined, defaultType?: 'retail' | 'eatery'): ResolvedStoreCard[] {
  const bundle = useBundle();
  const stores = bundle?.stores;
  return useMemo(() => {
    const out: ResolvedStoreCard[] = [];

    // Filter to valid configured items (items that resolve to an existing store in bundle.stores, or valid custom place)
    const validItems: StoreCardItem[] = [];
    if (items && items.length > 0) {
      for (const item of liveOnly(items)) {
        if (item.store) {
          const s = stores?.find((x) => x.slug === item.store);
          if (s) validItems.push(item);
        } else if (item.name && item.name !== 'POKHARA FOOD COURT' && item.name !== 'ANNAPURNA ROOFTOP LOUNGE') {
          validItems.push(item);
        }
      }
    }

    const itemsToProcess = [...validItems];

    // If no valid items (or fewer than target count), auto-populate from real API stores
    if (stores && stores.length > 0) {
      if (defaultType === 'retail' && itemsToProcess.length < 6) {
        const featuredRetail = stores.filter(
          (s) => (s.type === 'retail' || s.types?.includes('retail')) && !itemsToProcess.some((it) => it.store === s.slug)
        );
        // Featured stores first, then stores with cover photos
        featuredRetail.sort((a, b) => {
          if (Boolean(b.featured) !== Boolean(a.featured)) return b.featured ? 1 : -1;
          if (Boolean(b.cover?.data?.full_url) !== Boolean(a.cover?.data?.full_url)) return b.cover?.data?.full_url ? 1 : -1;
          return 0;
        });
        const needed = 7 - itemsToProcess.length;
        featuredRetail.slice(0, needed).forEach((s) => {
          itemsToProcess.push({ store: s.slug });
        });
      } else if (defaultType === 'eatery' && itemsToProcess.length < 4) {
        const eateries = stores.filter(
          (s) => (s.type === 'eatery' || s.types?.includes('eatery')) && !itemsToProcess.some((it) => it.store === s.slug)
        );
        eateries.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        eateries.forEach((s) => {
          itemsToProcess.push({ store: s.slug });
        });
      }
    }

    const total = itemsToProcess.length;

    itemsToProcess.forEach((item, i) => {
      const s = item.store ? stores?.find((x) => x.slug === item.store) : undefined;
      const name = (item.store && s ? (item.name || s.name) : item.name) || s?.name;
      if (!name) return;

      // Adaptive layout rules depending on total items count to guarantee filled 3-column rows
      let wide = false;
      let colSpanClass = 'md:col-span-1';
      let tall = false;

      if (total === 1) {
        wide = true;
        colSpanClass = 'md:col-span-3';
        tall = true;
      } else if (total === 2) {
        wide = i === 0;
        colSpanClass = i === 0 ? 'md:col-span-2' : 'md:col-span-1';
        tall = true;
      } else if (total === 3) {
        wide = false;
        colSpanClass = 'md:col-span-1';
        tall = true;
      } else if (total === 4) {
        // Row 1 (2 + 1), Row 2 (1 + 2)
        if (i === 0) { wide = true; colSpanClass = 'md:col-span-2'; tall = true; }
        else if (i === 1) { wide = false; colSpanClass = 'md:col-span-1'; tall = true; }
        else if (i === 2) { wide = false; colSpanClass = 'md:col-span-1'; tall = false; }
        else { wide = true; colSpanClass = 'md:col-span-2'; tall = false; }
      } else if (total === 5) {
        // Row 1 (2 + 1 = 2 items), Row 2 (1 + 1 + 1 = 3 items)
        if (i === 0) { wide = true; colSpanClass = 'md:col-span-2'; tall = true; }
        else if (i === 1) { wide = false; colSpanClass = 'md:col-span-1'; tall = true; }
        else { wide = false; colSpanClass = 'md:col-span-1'; tall = false; }
      } else if (total === 6) {
        // 2 equal rows of 3 columns
        wide = false;
        colSpanClass = 'md:col-span-1';
        tall = i < 3;
      } else if (total === 7) {
        // Signature 7-card layout: Row 1 (1 + 2), Row 2 (1 + 1 + 1), Row 3 (2 + 1)
        if (i === 1 || i === 5) { wide = true; colSpanClass = 'md:col-span-2'; tall = i < 2 || i > 4; }
        else { wide = false; colSpanClass = 'md:col-span-1'; tall = i < 2 || i > 4; }
      } else {
        // 8+ items: repeating staggered layout
        const mod = i % 7;
        const isWide = mod === 1 || mod === 5;
        wide = item.wide !== undefined ? !!item.wide : isWide;
        colSpanClass = wide ? 'md:col-span-2' : 'md:col-span-1';
        tall = mod < 2 || mod > 4;
      }

      out.push({
        key: `${item.store || 'item'}-${i}`,
        name,
        category: (item.store && s ? (item.category || s.category) : item.category) || s?.category || '',
        floor: (item.store && s ? (item.floor || s.floor) : item.floor) || s?.floor || '',
        imageUrl: (item.store && s ? (s.cover?.data?.full_url || item.imageUrl || s.logo?.data?.full_url) : item.imageUrl) || s?.cover?.data?.full_url || s?.logo?.data?.full_url || '',
        href: item.href || (s ? `/shops/details/${s.slug}` : ''),
        categorySlug: s?.categorySlug || s?.category,
        wide,
        colSpanClass,
        tall,
      });
    });
    return out;
  }, [items, stores, defaultType]);
}

/* ---------------- QFX ---------------- */

export interface Movie extends Schedulable { title: string; genre: string; rating: string; duration: string; language?: string; format: string; posterUrl: string; showtimes?: string[]; href?: string }
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
  description: 'The cinema section with the scrolling row of movie posters.',
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
      itemDefaults: { title: '', genre: '', rating: 'UA', duration: '', format: '2D', posterUrl: '' },
      fields: [
        { key: 'title', label: 'Movie title', type: 'text', required: true },
        { key: 'genre', label: 'Genre', type: 'text', half: true, placeholder: 'Action / Comedy' },
        { key: 'format', label: 'Format', type: 'text', half: true, placeholder: '3D ATMOS' },
        { key: 'rating', label: 'Rating', type: 'text', half: true, placeholder: 'UA' },
        { key: 'duration', label: 'Duration', type: 'text', half: true, placeholder: '2h 08m' },
        { key: 'language', label: 'Language', type: 'text', half: true, help: 'For your reference; not shown on the poster right now.' },
        { key: 'posterUrl', label: 'Poster', type: 'imageUrl', half: true, help: 'Portrait poster image.' },
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
    bookLabel: 'View All Movies & Book on QFX',
    bookUrl: '/qfx',
    reserveLabel: 'Reserve Seats',
    movies: [
      {
        title: 'Digger',
        genre: 'Comedy / Drama',
        rating: 'PG',
        duration: '2h 08m',
        language: 'English',
        format: '2D / 3D ATMOS',
        posterUrl: 'https://qfx-images.qfxcinemas.com/S3/uploads/gallery/1786878229551-diggerposter.jpg',
        href: 'https://www.qfxcinemas.com/movie/719',
      },
      {
        title: 'Drishyam: The Conclusion',
        genre: 'Crime / Thriller',
        rating: 'PG',
        duration: '2h 30m',
        language: 'Hindi',
        format: '2D / 3D ATMOS',
        posterUrl: 'https://qfx-images.qfxcinemas.com/S3/uploads/gallery/1777551819476-drishyam3poster.jpg',
        href: 'https://www.qfxcinemas.com/movie/649',
      },
      {
        title: 'Resident Evil',
        genre: 'Horror / Action',
        rating: 'Adult',
        duration: '1h 34m',
        language: 'English',
        format: '2D / 3D ATMOS',
        posterUrl: 'https://qfx-images.qfxcinemas.com/S3/uploads/gallery/1790594787454-res_500x715_pixels.jpg',
        href: 'https://www.qfxcinemas.com/movie/722',
      },
      {
        title: 'Baa: Ek Yoddha',
        genre: 'Drama',
        rating: 'PG',
        duration: '2h 25m',
        language: 'Nepali',
        format: '2D / 3D ATMOS',
        posterUrl: 'https://qfx-images.qfxcinemas.com/S3/uploads/gallery/1789732362535-baaekyodhaposter.jpg',
        href: 'https://www.qfxcinemas.com/movie/738',
      },
      {
        title: 'Avengers: Endgame Encore',
        genre: 'Action / Adventure / Sci Fi',
        rating: 'PG',
        duration: '3h 05m',
        language: 'English',
        format: '2D / 3D ATMOS',
        posterUrl: 'https://qfx-images.qfxcinemas.com/S3/uploads/gallery/1787740045610-poster.jpg',
        href: 'https://www.qfxcinemas.com/movie/729',
      },
      {
        title: 'Pension Patta',
        genre: 'Drama',
        rating: 'U',
        duration: '2h 08m',
        language: 'Nepali',
        format: '2D / 3D ATMOS',
        posterUrl: 'https://qfx-images.qfxcinemas.com/S3/uploads/gallery/1786261358893-pensionpatta.jpg',
        href: 'https://www.qfxcinemas.com/movie/716',
      },
      {
        title: 'Hanuman Ansh',
        genre: 'Biography / Mythological',
        rating: 'U',
        duration: '2h 30m',
        language: 'Hindi',
        format: '2D / 3D ATMOS',
        posterUrl: 'https://qfx-images.qfxcinemas.com/S3/uploads/gallery/1788776481026-hanumananshposter.jpg',
        href: 'https://www.qfxcinemas.com/movie/734',
      },
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
