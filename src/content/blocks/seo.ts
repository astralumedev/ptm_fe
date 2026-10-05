import { defineBlock } from '../block';

export interface SeoPage {
  path: string;
  title: string;
  description: string;
  image?: string;
}

export interface SeoContent {
  siteName: string;
  titleTemplate: string;
  description: string;
  shareImage: string;
  pages: SeoPage[];
}

/** Search-engine and social-sharing text for every page. */
export const seoBlock = defineBlock<SeoContent>({
  key: 'seo',
  group: 'SEO & sharing',
  label: 'Page titles & descriptions',
  description: 'What Google shows in search results and what appears when a link is shared on WhatsApp or Facebook. Store and blog pages use their own name, description and photo automatically.',
  page: '/',
  fields: [
    { key: 'siteName', label: 'Site name', type: 'text', half: true, required: true },
    { key: 'titleTemplate', label: 'Title pattern', type: 'text', half: true, help: '{page} is replaced with the page title, e.g. "{page} | Pokhara Trade Mall".' },
    { key: 'description', label: 'Default description', type: 'textarea', help: 'Used on pages without their own description. Aim for 120–160 characters.' },
    { key: 'shareImage', label: 'Default sharing image', type: 'imageUrl', preset: 'cover', help: 'Shown when a link is shared. Landscape, ideally 1200 × 630.' },
    {
      key: 'pages', label: 'Pages', type: 'list', itemTitle: 'title', itemName: 'page',
      help: 'The path is the address after the domain, e.g. /dine. The first matching entry wins.',
      itemDefaults: { path: '/', title: '', description: '' },
      fields: [
        { key: 'path', label: 'Path', type: 'text', half: true, required: true, placeholder: '/dine' },
        { key: 'title', label: 'Title', type: 'text', half: true, required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'image', label: 'Sharing image (optional)', type: 'imageUrl', preset: 'cover' },
      ],
    },
  ],
  defaults: {
    siteName: 'Pokhara Trade Mall',
    titleTemplate: '{page} | Pokhara Trade Mall',
    description: "Pokhara Trade Mall - Pokhara's premier shopping, dining, and entertainment destination",
    shareImage: '/mall_images/ptm_hero.webp',
    pages: [
      { path: '/', title: 'Pokhara Trade Mall', description: 'Shopping, dining, QFX cinemas and entertainment at Chipledhunga, Pokhara. Explore stores, events and offers.' },
      { path: '/shop', title: 'Shop', description: 'International fashion brands, tech, jewelry, beauty and Himalayan handicrafts at Pokhara Trade Mall.' },
      { path: '/shops/directory', title: 'Store directory', description: 'Find every store, restaurant and service at Pokhara Trade Mall by category and floor.' },
      { path: '/dine', title: 'Dine', description: 'Thakali kitchens, cafés, bakeries and fast food at Pokhara Trade Mall.' },
      { path: '/qfx', title: 'QFX Cinemas', description: 'Latest movies, upcoming releases, showtimes, and ticket reservations at QFX Cinemas Pokhara Trade Mall.' },
      { path: '/entertain', title: 'QFX Cinemas', description: 'Latest movies, upcoming releases, showtimes, and ticket reservations at QFX Cinemas Pokhara Trade Mall.' },
      { path: '/services', title: 'Services', description: 'Banks, beauty and wellness, education, IT and professional services at Pokhara Trade Mall.' },
      { path: '/latest', title: "What's on", description: 'Events, offers and stories from Pokhara Trade Mall.' },
      { path: '/mall-map', title: 'Mall map', description: 'Interactive floor map with directions to every store at Pokhara Trade Mall.' },
      { path: '/about', title: 'About us', description: 'The story, vision and people behind Pokhara Trade Mall.' },
      { path: '/contact', title: 'Contact', description: 'Opening hours, phone, email and directions to Pokhara Trade Mall.' },
      { path: '/privacy-policy', title: 'Privacy policy', description: 'How Pokhara Trade Mall collects and uses personal information.' },
    ],
  },
});

export interface NotFoundContent {
  title: string;
  message: string;
  primaryLabel: string;
  primaryLink: string;
  secondaryLabel: string;
  secondaryLink: string;
}

export const notFoundBlock = defineBlock<NotFoundContent>({
  key: 'not-found',
  group: 'SEO & sharing',
  label: 'Page not found (404)',
  description: 'Shown when someone opens an address that does not exist, e.g. an old link or a typo.',
  fields: [
    { key: 'title', label: 'Heading', type: 'text', required: true },
    { key: 'message', label: 'Message', type: 'textarea' },
    { key: 'primaryLabel', label: 'Main button', type: 'text', half: true },
    { key: 'primaryLink', label: 'Main button link', type: 'text', half: true },
    { key: 'secondaryLabel', label: 'Second button', type: 'text', half: true, help: 'Leave empty to hide.' },
    { key: 'secondaryLink', label: 'Second button link', type: 'text', half: true },
  ],
  defaults: {
    title: 'We couldn’t find that page',
    message: 'The page may have moved or the link may be out of date. Try the store directory or head back to the home page.',
    primaryLabel: 'Back to home',
    primaryLink: '/',
    secondaryLabel: 'Store directory',
    secondaryLink: '/shops/directory',
  },
});
