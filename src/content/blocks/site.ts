import { defineBlock, useBlock, type BlockDef } from '../block';

const GROUP_NAV = 'Header & navigation';
const GROUP_FOOTER = 'Footer';

export interface NavLink { label: string; href: string }
export interface NavGroup { title?: string; links: NavLink[] }
export interface NavItemContent { label: string; href?: string; groups?: NavGroup[]; hidden?: boolean }

export interface SiteNavContent {
  logoUrl: string;
  logoAlt: string;
  items: NavItemContent[];
  mapLabel: string;
  mapLink: string;
  drawerMapLabel: string;
  drawerLocation: string;
  drawerContactLabel: string;
  drawerContactLink: string;
}

export const siteNavBlock = defineBlock<SiteNavContent>({
  key: 'site-nav',
  group: GROUP_NAV,
  label: 'Main menu & logo',
  description: 'The logo and menu at the top of every page, on computers and in the phone menu.',
  page: '/',
  fields: [
    { key: 'logoUrl', label: 'Logo image', type: 'imageUrl', half: true, help: 'Shown top-left on every page and in the phone menu. A transparent PNG works best.' },
    { key: 'logoAlt', label: 'Logo description', type: 'text', half: true, help: 'Read out by screen readers. Usually just the mall name.' },
    {
      key: 'items', label: 'Menu items', type: 'list', itemTitle: 'label', itemName: 'menu item', max: 8,
      help: 'Shown in this order. Keep it to about 6 so it fits on one line. An item with dropdown groups opens a dropdown instead of going to a page.',
      itemDefaults: { label: '', href: '/', groups: [] },
      fields: [
        { key: 'label', label: 'Label', type: 'text', half: true, required: true },
        { key: 'href', label: 'Link', type: 'url', half: true, placeholder: '/shop', help: 'A page on this site (e.g. /dine) or a full web address. Ignored when the item has dropdown groups.' },
        { key: 'hidden', label: 'Hide this item', type: 'toggle', half: true },
        {
          key: 'groups', label: 'Dropdown groups', type: 'list', itemTitle: 'title', itemName: 'group', max: 3,
          help: 'Optional. Add groups to turn this item into a dropdown. Two groups show side by side.',
          itemDefaults: { title: '', links: [] },
          fields: [
            { key: 'title', label: 'Group heading', type: 'text', help: 'Optional small red heading above the links.' },
            {
              key: 'links', label: 'Links', type: 'list', itemTitle: 'label', itemName: 'link',
              itemDefaults: { label: '', href: '/' },
              fields: [
                { key: 'label', label: 'Label', type: 'text', half: true, required: true },
                { key: 'href', label: 'Link', type: 'url', half: true, placeholder: '/services#beauty' },
              ],
            },
          ],
        },
      ],
    },
    { key: 'mapLabel', label: 'Mall map button text (header)', type: 'text', half: true, help: 'The link next to the timings on large screens.' },
    { key: 'mapLink', label: 'Mall map link', type: 'url', half: true, help: 'Used by the header and the phone menu.' },
    { key: 'drawerMapLabel', label: 'Mall map button text (phone menu)', type: 'text', half: true },
    { key: 'drawerLocation', label: 'Location line (phone menu)', type: 'text', half: true, help: 'Short location shown at the bottom of the phone menu.' },
    { key: 'drawerContactLabel', label: 'Contact link text (phone menu)', type: 'text', half: true },
    { key: 'drawerContactLink', label: 'Contact link (phone menu)', type: 'url', half: true },
  ],
  defaults: {
    logoUrl: '/tm_logo_nobg.png',
    logoAlt: 'Pokhara Trade Mall Logo',
    items: [
      { label: "What's On", href: '/latest' },
      { label: 'Shop', href: '/shop' },
      { label: 'Dine', href: '/dine' },
      { label: 'Entertain', href: '/entertain' },
      {
        label: 'Services',
        groups: [
          {
            title: 'Business Directory',
            links: [
              { label: 'Beauty & Wellness', href: '/services#beauty' },
              { label: 'Banks & Financial Services', href: '/services#finance' },
              { label: 'Abroad Study & Education', href: '/services#education' },
              { label: 'IT & Software Studios', href: '/services#it-tech' },
              { label: 'Health & Fitness', href: '/services#health-fitness' },
              { label: 'Engineering & Consultancies', href: '/services#consultancy' },
              { label: 'All Services Directory', href: '/services' },
            ],
          },
          {
            title: 'Mall Services',
            links: [
              { label: 'Mall Map & Wayfinding', href: '/mall-map' },
              { label: 'Parking Information', href: '/services#parking' },
              { label: 'Contact & Inquiries', href: '/contact' },
            ],
          },
        ],
      },
      { label: 'About', href: '/page/about_us' },
    ],
    mapLabel: 'MALL MAP',
    mapLink: '/mall-map',
    drawerMapLabel: 'Interactive Mall Map',
    drawerLocation: 'Chipledhunga, Pokhara',
    drawerContactLabel: 'Contact Us',
    drawerContactLink: '/contact',
  },
});

export interface HoursRow { label: string; hours: string; inHeader?: boolean }
export interface SiteHoursContent {
  pillLabel: string;
  shortHours: string;
  popupTitle: string;
  todayHours: string;
  badge: string;
  rows: HoursRow[];
}

export const siteHoursBlock = defineBlock<SiteHoursContent>({
  key: 'site-hours',
  group: GROUP_NAV,
  label: 'Mall timings',
  description: 'Opening hours, shown in the header (with a pop-up on hover), the phone menu and the footer. Change them here once and every place updates.',
  page: '/',
  fields: [
    { key: 'shortHours', label: 'Short hours (header)', type: 'text', half: true, placeholder: '10 AM - 8 PM', help: 'Keep it short, it sits in a small pill at the top right.' },
    { key: 'pillLabel', label: 'Label before the hours', type: 'text', half: true },
    { key: 'todayHours', label: 'Hours in the phone menu', type: 'text', half: true, placeholder: '10:00 AM - 8:00 PM' },
    { key: 'badge', label: 'Badge in the phone menu', type: 'text', half: true, help: 'e.g. "Open Daily" or "Closed today for Dashain". Leave empty to hide.' },
    { key: 'popupTitle', label: 'Pop-up heading', type: 'text', help: 'Heading of the pop-up that appears when visitors hover the timings.' },
    {
      key: 'rows', label: 'Opening hours', type: 'list', itemTitle: 'label', itemName: 'row',
      help: 'All rows appear in the footer. Tick "Show in header pop-up" for the ones that should also appear in the header pop-up.',
      itemDefaults: { label: '', hours: '', inHeader: true },
      fields: [
        { key: 'label', label: 'Days / place', type: 'text', half: true, placeholder: 'Weekdays' },
        { key: 'hours', label: 'Hours', type: 'text', half: true, placeholder: '10:00 AM - 8:00 PM' },
        { key: 'inHeader', label: 'Show in header pop-up', type: 'toggle', half: true },
      ],
    },
  ],
  defaults: {
    pillLabel: 'TIMINGS:',
    shortHours: '10 AM - 8 PM',
    popupTitle: 'Mall Operating Hours',
    todayHours: '10:00 AM - 8:00 PM',
    badge: 'Open Daily',
    rows: [
      { label: 'Weekdays', hours: '10:00 AM - 8:00 PM', inHeader: true },
      { label: 'Weekends', hours: '10:00 AM - 10:00 PM', inHeader: true },
      { label: 'QFX Cinemas', hours: '07:00 AM - 12:00 AM', inHeader: false },
    ],
  },
});

export interface FooterContent {
  logoUrl: string;
  tagline: string;
  exploreTitle: string;
  exploreLinks: NavLink[];
  connectTitle: string;
  timingsTitle: string;
  findUsTitle: string;
  mallName: string;
  address: string;
  mapsUrl: string;
  mapsLabel: string;
  copyright: string;
  bottomLinks: NavLink[];
}

const LINK_FIELDS = [
  { key: 'label', label: 'Label', type: 'text' as const, half: true, required: true },
  { key: 'href', label: 'Link', type: 'url' as const, half: true, placeholder: '/contact' },
];

export const siteFooterBlock = defineBlock<FooterContent>({
  key: 'site-footer',
  group: GROUP_FOOTER,
  label: 'Footer',
  description: 'The bottom of every page. Phone numbers, email and social media links come from Site settings; opening hours come from "Mall timings".',
  page: '/',
  fields: [
    { key: 'logoUrl', label: 'Footer logo', type: 'imageUrl', half: true },
    { key: 'tagline', label: 'Short description under the logo', type: 'textarea', half: true },
    { key: 'exploreTitle', label: 'Links column heading', type: 'text' },
    { key: 'exploreLinks', label: 'Links column', type: 'list', itemTitle: 'label', itemName: 'link', fields: LINK_FIELDS, itemDefaults: { label: '', href: '/' } },
    { key: 'connectTitle', label: 'Contact column heading', type: 'text', half: true, help: 'Phone, email and social icons below it are edited in Site settings.' },
    { key: 'timingsTitle', label: 'Timings column heading', type: 'text', half: true, help: 'The hours themselves are edited in "Mall timings".' },
    { key: 'findUsTitle', label: 'Location column heading', type: 'text', half: true },
    { key: 'mallName', label: 'Name above the address', type: 'text', half: true },
    { key: 'address', label: 'Address', type: 'textarea', help: 'Leave empty to use the address from Site settings.' },
    { key: 'mapsUrl', label: 'Google Maps link', type: 'url', half: true, help: 'Open the mall in Google Maps, press Share and paste the link here.' },
    { key: 'mapsLabel', label: 'Google Maps button text', type: 'text', half: true },
    { key: 'copyright', label: 'Copyright line', type: 'text', help: 'Write {year} where the current year should appear.' },
    { key: 'bottomLinks', label: 'Bottom row links', type: 'list', itemTitle: 'label', itemName: 'link', fields: LINK_FIELDS, itemDefaults: { label: '', href: '/' } },
  ],
  defaults: {
    logoUrl: '/tm_logo_nobg.png',
    tagline: "Pokhara's premier destination for shopping, dining, services, and entertainment.",
    exploreTitle: 'EXPLORE',
    exploreLinks: [
      { label: 'Our Story', href: '/page/about_us' },
      { label: 'Latest & Events', href: '/latest' },
      { label: 'Privacy Policy', href: '/page/privacy_policy' },
      { label: 'Contact Us', href: '/contact' },
    ],
    connectTitle: 'Connect With Us',
    timingsTitle: 'Mall Timings',
    findUsTitle: 'Find Us',
    mallName: 'Pokhara Trade Mall',
    address: 'Chiple Dhunga Road, पोखरा 33700, Nepal',
    mapsUrl: 'https://www.google.com/maps?ll=28.223844,83.986463&z=18&t=m&hl=en&gl=NP&mapclient=embed&cid=13569072981790925385',
    mapsLabel: 'View on Google Maps',
    copyright: '© {year} Pokhara Trade Mall. All rights reserved.',
    bottomLinks: [
      { label: 'Privacy Policy', href: '/page/privacy_policy' },
      { label: 'About Us', href: '/page/about_us' },
      { label: 'Contact', href: '/contact' },
    ],
  },
});

export const useSiteNav = () => useBlock(siteNavBlock);
export const useMallHours = () => useBlock(siteHoursBlock);

// Blocks for this area are registered here; see src/content/blocks/index.ts.
export const siteBlocks: BlockDef<any>[] = [siteNavBlock, siteHoursBlock, siteFooterBlock];
