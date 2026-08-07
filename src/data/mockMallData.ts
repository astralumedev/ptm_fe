import { Store } from '@/data/models/Store';
import { Blog } from '@/data/models/Blog';
import { SiteSettings } from '@/data/models/SiteSettings';

export interface PageData {
  id: number;
  status: 'published' | 'draft';
  owner: { id: number };
  created_on: string;
  title: string;
  slug: string;
  content: string;
  cover_image: {
    data: {
      full_url: string;
      url: string;
      asset_url: string;
      thumbnails: any[];
      embed: null;
    };
  };
  gallery: any[];
}

const createHelperImage = (url: string) => ({
  data: {
    full_url: url,
    url: url,
    asset_url: url,
    thumbnails: [],
    embed: null,
  },
});

export const mockStores: Store[] = [
  {
    id: 1,
    status: 'published',
    owner: { id: 1 },
    created_on: '2026-01-15T00:00:00Z',
    name: 'Himalayan Outfitters & Wear',
    subtitle: 'Premium outdoor & mountain gear',
    logo: createHelperImage('https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80'),
    cover: createHelperImage('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'),
    store_description: 'Discover world-class trekking apparel, jacket lines, and high-altitude gear suited for Annapurna and beyond right at Pokhara Trade Mall.',
    slug: 'himalayan-outfitters',
    featured: true,
    type: 'retail',
    website: 'https://himalayanoutfitters.np',
    instagram: 'https://instagram.com/himalayanoutfitters',
    facebook: 'https://facebook.com/himalayanoutfitters',
    tiktok: null,
    store_gallery: [],
    contact_number: '+977 61-528811',
    operation_hours: '10:00 AM - 8:00 PM',
  },
  {
    id: 2,
    status: 'published',
    owner: { id: 1 },
    created_on: '2026-01-16T00:00:00Z',
    name: 'Fewa Lakeside Bistro & Bakery',
    subtitle: 'Fresh pastries, organic coffee & artisan eats',
    logo: createHelperImage('https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80'),
    cover: createHelperImage('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80'),
    store_description: 'Enjoy delicious wood-fired pizzas, gourmet coffee, and Pokhara\'s finest cakes in a comfortable ambiance inside Pokhara Trade Mall.',
    slug: 'fewa-lakeside-bistro',
    featured: true,
    type: 'eatery',
    website: 'https://fewabistro.com',
    instagram: 'https://instagram.com/fewabistro',
    facebook: 'https://facebook.com/fewabistro',
    tiktok: null,
    store_gallery: [],
    contact_number: '+977 61-529944',
    operation_hours: '8:00 AM - 9:30 PM',
  },
  {
    id: 3,
    status: 'published',
    owner: { id: 1 },
    created_on: '2026-01-18T00:00:00Z',
    name: 'Tech & Gadgets Arcade',
    subtitle: 'Authorised electronics, smartphones & accessories',
    logo: createHelperImage('https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=400&q=80'),
    cover: createHelperImage('https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80'),
    store_description: 'Find original laptops, smartphones, camera hardware, and high-fidelity audio equipment with official warranty.',
    slug: 'tech-gadgets-arcade',
    featured: true,
    type: 'retail',
    website: null,
    instagram: 'https://instagram.com/techarcade_pkr',
    facebook: 'https://facebook.com/techarcade',
    tiktok: null,
    store_gallery: [],
    contact_number: '+977 9801122334',
    operation_hours: '10:00 AM - 8:00 PM',
  },
  {
    id: 4,
    status: 'published',
    owner: { id: 1 },
    created_on: '2026-01-20T00:00:00Z',
    name: 'Aura Luxury Spa & Salon',
    subtitle: 'Relaxing therapies & premium hair styling',
    logo: createHelperImage('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80'),
    cover: createHelperImage('https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=1200&q=80'),
    store_description: 'Rejuvenate your senses with Ayurvedic massages, modern body therapies, and professional hair & nail care treatments.',
    slug: 'aura-luxury-spa',
    featured: true,
    type: 'service',
    website: null,
    instagram: 'https://instagram.com/auraspapokhara',
    facebook: null,
    tiktok: null,
    store_gallery: [],
    contact_number: '+977 61-523311',
    operation_hours: '9:00 AM - 8:00 PM',
  },
  {
    id: 5,
    status: 'published',
    owner: { id: 1 },
    created_on: '2026-01-22T00:00:00Z',
    name: 'Machhapuchhre Fashion Trends',
    subtitle: 'Modern ethnic & western clothing collection',
    logo: createHelperImage('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80'),
    cover: createHelperImage('https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80'),
    store_description: 'Curated designer wear, traditional Nepali garments, and contemporary street styles for men and women.',
    slug: 'machhapuchhre-fashion',
    featured: false,
    type: 'retail',
    website: null,
    instagram: null,
    facebook: null,
    tiktok: null,
    store_gallery: [],
    contact_number: '+977 9812345678',
    operation_hours: '10:00 AM - 8:00 PM',
  },
  {
    id: 6,
    status: 'published',
    owner: { id: 1 },
    created_on: '2026-01-25T00:00:00Z',
    name: 'Pokhara Food Court Express',
    subtitle: 'Multi-cuisine dining & quick bites',
    logo: createHelperImage('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80'),
    cover: createHelperImage('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'),
    store_description: 'Authentic Nepali Thakali, Momo stations, Indian curries, and Continental delights under one spacious roof.',
    slug: 'pokhara-food-court',
    featured: true,
    type: 'eatery',
    website: null,
    instagram: 'https://instagram.com/ptm_foodcourt',
    facebook: 'https://facebook.com/ptmfoodcourt',
    tiktok: null,
    store_gallery: [],
    contact_number: '+977 61-526677',
    operation_hours: '10:00 AM - 9:00 PM',
  },
];

export const mockBlogs: Blog[] = [
  {
    id: 1,
    status: 'published',
    owner: {
      id: 1,
      first_name: 'PTM',
      last_name: 'Team',
      email: 'info@pokharatrademall.com',
      status: 'active',
      role: 1,
      external_id: null,
      theme: 'default',
      timezone: 'Asia/Kathmandu',
      locale: 'en',
      avatar: null,
      company: 'Pokhara Trade Mall',
      title: 'Editor',
    },
    created_on: '2026-02-01T10:00:00Z',
    updated_on: null,
    title: 'Grand Festive Celebration & Shopping Extravaganza at Pokhara Trade Mall',
    slug: 'grand-festive-celebration-ptm',
    content: '<p>Join us at Pokhara Trade Mall for our seasonal shopping celebration! Enjoy up to 50% discounts across top clothing brands, food court vouchers, and live music performances every weekend in Chipledhunga, Pokhara.</p>',
    cover_image: {
      data: {
        full_url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
        url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
        asset_url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
        thumbnails: [],
        embed: null,
      },
    },
  },
  {
    id: 2,
    status: 'published',
    owner: {
      id: 1,
      first_name: 'PTM',
      last_name: 'Events',
      email: 'events@pokharatrademall.com',
      status: 'active',
      role: 1,
      external_id: null,
      theme: 'default',
      timezone: 'Asia/Kathmandu',
      locale: 'en',
      avatar: null,
      company: 'Pokhara Trade Mall',
      title: 'Events Manager',
    },
    created_on: '2026-02-10T14:30:00Z',
    updated_on: null,
    title: 'New Brands Open Their Doors at Pokhara Trade Mall',
    slug: 'new-brands-opening-ptm',
    content: '<p>We are delighted to welcome five new international and Nepali lifestyle brands to Pokhara Trade Mall. Visit our updated retail wings to explore the latest fashion and gadgets!</p>',
    cover_image: {
      data: {
        full_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
        asset_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
        thumbnails: [],
        embed: null,
      },
    },
  },
];

export const mockSiteSettings: SiteSettings[] = [
  {
    id: 1,
    created_on: '2026-01-01T00:00:00Z',
    modified_by: 1,
    modified_on: '2026-01-01T00:00:00Z',
    location_info: 'Chipledhunga, Mahendrapool, Pokhara 33700, Nepal',
    facebook: 'https://facebook.com/pokharatrademall',
    instagram: 'https://instagram.com/pokharatrademall',
    tiktok: 'https://tiktok.com/@pokharatrademall',
    twitter: null,
    phone: '+977 61-520000 / +977 9856012345',
    address: 'Chipledhunga, Pokhara 33700, Nepal',
    email: 'info@pokharatrademall.com',
  },
];

export const mockPages: PageData[] = [
  {
    id: 0,
    status: 'published',
    owner: { id: 1 },
    created_on: '2026-01-01T00:00:00Z',
    title: 'Pokhara Trade Mall',
    slug: 'homepage_intro',
    content: `
      <p>A premier destination for shopping, entertainment, and leisure in the heart of Pokhara. As one of the city's first modern malls, we blend the vibrant local culture with a contemporary retail experience, offering everything from fashion boutiques and electronics to unique local handicrafts.</p>
      <p>Whether you are looking to catch the latest blockbuster at our state-of-the-art QFX Cineplex, enjoy a delicious meal at our diverse food court, or explore a wide array of shops, Pokhara Trade Mall serves as the perfect social hub for families, tourists, and locals alike. Visit us today at Chiple Dhunga to experience the best of convenience, comfort, and community spirit in the beautiful lakeside city of Pokhara.</p>
    `,
    cover_image: createHelperImage('/mall_images/IMG_1364.webp'),
    gallery: [],
  },
  {
    id: 1,
    status: 'published',
    owner: { id: 1 },
    created_on: '2026-01-01T00:00:00Z',
    title: 'About Pokhara Trade Mall',
    slug: 'about_us',
    content: `
      <h2>Welcome to Pokhara Trade Mall</h2>
      <p>The premier destination for shopping, entertainment, and leisure in the heart of Pokhara. As one of the city's first modern malls, we blend the vibrant local culture with a contemporary retail experience, offering everything from fashion boutiques and electronics to unique local handicrafts.</p>
      <p>Whether you are looking to catch the latest blockbuster at our state-of-the-art QFX Cineplex, enjoy a delicious meal at our diverse food court, or explore a wide array of shops, Pokhara Trade Mall serves as the perfect social hub for families, tourists, and locals alike. Visit us today at Chiple Dhunga to experience the best of convenience, comfort, and community spirit in the beautiful lakeside city of Pokhara.</p>
    `,
    cover_image: createHelperImage('/mall_images/ptm_hero.webp'),
    gallery: [],
  },
  {
    id: 2,
    status: 'published',
    owner: { id: 1 },
    created_on: '2026-01-01T00:00:00Z',
    title: 'Business & Leasing Directory',
    slug: 'business',
    content: `
      <h2>Leasing & Retail Opportunities</h2>
      <p>Pokhara Trade Mall is the premier commercial hub in Pokhara, receiving thousands of daily visitors from around the globe and local communities.</p>
      <p>We offer prime retail, dining, and service counter space with high footfall, modern security, back-up power, and dedicated parking spaces.</p>
      <p>To inquire about leasing space or partnership opportunities, contact our management team at <strong>leasing@pokharatrademall.com</strong> or call <strong>+977 61-520000</strong>.</p>
    `,
    cover_image: createHelperImage('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'),
    gallery: [],
  },
  {
    id: 3,
    status: 'published',
    owner: { id: 1 },
    created_on: '2026-01-01T00:00:00Z',
    title: 'Privacy Policy',
    slug: 'privacy_policy',
    content: `
      <h2>Privacy Policy</h2>
      <p>At Pokhara Trade Mall, we value your privacy. We strictly handle your personal information, inquiries, and booking details in accordance with applicable laws in Nepal.</p>
      <p>We do not sell or share personal data with third-party marketers. For inquiries regarding our terms or data usage, please reach out to info@pokharatrademall.com.</p>
    `,
    cover_image: createHelperImage('https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80'),
    gallery: [],
  },
  {
    id: 4,
    status: 'published',
    owner: { id: 1 },
    created_on: '2026-01-01T00:00:00Z',
    title: 'QFX Cinemas - Pokhara Trade Mall',
    slug: 'qfx',
    content: `
      <h2>QFX Cinemas Pokhara</h2>
      <p>Experience movies like never before with state-of-the-art 4K projection, Dolby Atmos surround sound, and luxury seating at QFX Cinemas, Pokhara Trade Mall.</p>
      <p>Check showtimes, book tickets online, and enjoy gourmet cinema snacks on the upper entertainment level.</p>
    `,
    cover_image: createHelperImage('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80'),
    gallery: [],
  },
  {
    id: 5,
    status: 'published',
    owner: { id: 1 },
    created_on: '2026-01-01T00:00:00Z',
    title: 'Mall Directory & Wayfinding',
    slug: 'wayfinding',
    content: `
      <h2>Interactive Floor Map & Directory</h2>
      <p>Easily navigate Pokhara Trade Mall across all levels. Find escalators, elevators, brand outlets, food courts, restrooms, and underground parking facilities.</p>
      <p>Our customer help desk is located on the Ground Floor at the main Chipledhunga entrance.</p>
    `,
    cover_image: createHelperImage('https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=1200&q=80'),
    gallery: [],
  },
];
