import { defineBlock, type BlockDef } from '../block';
import { SCHEDULE_FIELDS, type Field } from '../fields';
import { ICON_OPTIONS } from '../icons';

/* ------------------------------------------------------------------ helpers */

const text = (key: string, label: string, extra: Partial<Field> = {}): Field => ({ key, label, type: 'text', ...extra });
const area = (key: string, label: string, extra: Partial<Field> = {}): Field => ({ key, label, type: 'textarea', ...extra });
const link = (key: string, label: string, extra: Partial<Field> = {}): Field => ({
  key, label, type: 'url', help: 'A page on this site (e.g. /contact) or a full web address (https://…).', ...extra,
});
const img = (key: string, label: string, extra: Partial<Field> = {}): Field => ({ key, label, type: 'imageUrl', ...extra });
const icon = (key: string, label = 'Icon', extra: Partial<Field> = {}): Field => ({ key, label, type: 'icon', options: ICON_OPTIONS, half: true, ...extra });
const hide = (what: string): Field => ({ key: 'hidden', label: `Hide ${what}`, type: 'toggle', help: 'Turn on to remove this section from the website without deleting its content.' });
const tabLabel: Field = { key: 'tabLabel', label: 'Tab label', type: 'text', half: true, help: 'Name of the shortcut tab under the page header that scrolls to this section.' };

/* ================================================================ ABOUT PAGE */

export interface AboutHero {
  title: string; subtitle: string; badge: string; tabLabel: string;
  eyebrow: string; headingStart: string; headingHighlight: string; headingEnd: string;
  intro: string; body: string;
  pillars: { icon: string; title: string; text: string }[];
  primaryLabel: string; primaryHref: string; secondaryLabel: string; secondaryHref: string;
  image: string; imageAlt: string; imageTag: string; imageTitle: string; imageLocation: string;
  badgeValue: string; badgeTitle: string; badgeText: string;
  ratingLabel: string; ratingValue: string;
  statsEyebrow: string; statsHeading: string;
  stats: { label: string; value: string; sub: string }[];
}

export const aboutHeroBlock = defineBlock<AboutHero>({
  key: 'about-page',
  group: 'About page',
  label: 'Header, overview & numbers',
  description: 'The page title, the opening "overview" section with its photo, the three pillars and the "Mall by the numbers" row.',
  page: '/about',
  fields: [
    text('title', 'Page title', { half: true }),
    text('badge', 'Small badge above the title', { half: true }),
    area('subtitle', 'Header subtitle'),
    tabLabel,
    text('eyebrow', 'Overview: small red label', { half: true }),
    text('headingStart', 'Overview heading (start)', { half: true }),
    text('headingHighlight', 'Overview heading (red part)', { half: true }),
    text('headingEnd', 'Overview heading (end)', { half: true }),
    { key: 'intro', label: 'Overview: first paragraph', type: 'richtext', help: 'Use bold for words you want to stand out.' },
    { key: 'body', label: 'Overview: second paragraph', type: 'richtext' },
    {
      key: 'pillars', label: 'Pillars (small cards under the text)', type: 'list', itemTitle: 'title', itemName: 'pillar', max: 6,
      itemDefaults: { icon: 'star' },
      fields: [icon('icon'), text('title', 'Title', { half: true }), area('text', 'Short text')],
    },
    text('primaryLabel', 'Red button text', { half: true }), link('primaryHref', 'Red button link', { half: true }),
    text('secondaryLabel', 'White button text', { half: true }), link('secondaryHref', 'White button link', { half: true }),
    img('image', 'Main photo', { preset: 'cover' }),
    text('imageAlt', 'Photo description (for screen readers)', { half: true }),
    text('imageTag', 'Label on the photo', { half: true }),
    text('imageTitle', 'Title on the photo', { half: true }),
    text('imageLocation', 'Location line on the photo', { half: true }),
    text('badgeValue', 'Floating badge: big number', { half: true, placeholder: 'e.g. 10+' }),
    text('badgeTitle', 'Floating badge: title', { half: true }),
    text('badgeText', 'Floating badge: text'),
    text('ratingLabel', 'Top badge: label', { half: true }),
    text('ratingValue', 'Top badge: value', { half: true }),
    text('statsEyebrow', 'Numbers: small label', { half: true }),
    text('statsHeading', 'Numbers: heading', { half: true }),
    {
      key: 'stats', label: 'Numbers', type: 'list', itemTitle: 'label', itemName: 'number', max: 12,
      fields: [text('label', 'Label', { half: true }), text('value', 'Value', { half: true, placeholder: 'e.g. 500+' }), text('sub', 'Small text underneath')],
    },
  ],
  defaults: {
    title: 'About Pokhara Trade Mall',
    subtitle: 'Discover the story, resilience, vision, and people behind Gandaki Province’s most iconic shopping, dining, and cultural destination.',
    badge: 'Our Heritage & Vision',
    tabLabel: 'Overview',
    eyebrow: "The Heart of Pokhara's Commerce",
    headingStart: 'A Landmark Born from ',
    headingHighlight: 'Collective Vision',
    headingEnd: ' & Passion',
    intro: 'Standing tall at the historic intersection of <strong>Chipledhunga</strong>, <strong>Pokhara Trade Mall (PTM)</strong> is Gandaki Province’s largest and most vibrant commercial landmark. Built through a groundbreaking group investment of over 60 local retail entrepreneurs, the mall was created to offer a permanent, secure, and world-class retail sanctuary in the heart of the city.',
    body: 'Across 6 expansive levels, PTM houses over <strong>500 retail boutiques</strong>, authorized tech centers, a state-of-the-art <strong>QFX Multiplex</strong>, an international and traditional food court, premier banking institutions, and foreign education consultancies. Whether you are a Pokhareli local catching up with friends or a global traveler exploring the Annapurna gateway, PTM is your complete lifestyle hub.',
    pillars: [
      { icon: 'handshake', title: 'Community First', text: 'Empowering local traders and providing sustained entrepreneurship opportunities.' },
      { icon: 'shield', title: 'Safety & Rigor', text: 'Seismic resilience, 24/7 CCTV surveillance, and modern fire safety systems.' },
      { icon: 'leaf', title: 'Modern Culture', text: 'Blending authentic Pokhareli hospitality with international retail excellence.' },
    ],
    primaryLabel: 'Explore 500+ Stores', primaryHref: '/shops/directory',
    secondaryLabel: 'Interactive Mall Map', secondaryHref: '/mall-map',
    image: '/mall_images/ptm_hero.webp',
    imageAlt: 'Pokhara Trade Mall Exterior',
    imageTag: 'Iconic Architecture',
    imageTitle: 'Pokhara Trade Mall',
    imageLocation: 'Chipledhunga, Pokhara-4, Gandaki Province',
    badgeValue: '10+',
    badgeTitle: 'Years of Excellence',
    badgeText: 'Trusted by over 1.2 Million visitors every year.',
    ratingLabel: 'Seismic Rating',
    ratingValue: '9.0 Resilient',
    statsEyebrow: 'Mall By The Numbers',
    statsHeading: 'Scaling Retail & Entertainment in Gandaki',
    stats: [
      { label: 'Investment', value: 'NPR 1B+', sub: 'Total Capital Investment' },
      { label: 'Retail Outlets', value: '500+', sub: 'Shops & Showrooms' },
      { label: 'Floors', value: '6 Levels', sub: 'Commerce & Leisure' },
      { label: 'Annual Visitors', value: '1.2M+', sub: 'Locals & Tourists' },
      { label: 'Parking Bays', value: '200+', sub: 'Basement & Surface' },
      { label: 'Seismic Safety', value: '100%', sub: 'Earthquake Tested' },
    ],
  },
});

export interface AboutHistory {
  hidden?: boolean; tabLabel: string; eyebrow: string; heading: string; intro: string; milestoneLabel: string;
  events: { year: string; title: string; category: string; image: string; description: string; highlights: string[]; hidden?: boolean }[];
}

export const aboutHistoryBlock = defineBlock<AboutHistory>({
  key: 'about-history',
  group: 'About page',
  label: 'History timeline',
  description: 'The "Journey of Pokhara Trade Mall" timeline. Add a milestone when something big happens.',
  page: '/about#history',
  fields: [
    hide('the whole timeline'), tabLabel,
    text('eyebrow', 'Small red label', { half: true }), text('heading', 'Heading', { half: true }),
    area('intro', 'Intro text'),
    text('milestoneLabel', 'Word shown above each photo title', { half: true }),
    {
      key: 'events', label: 'Milestones (shown in this order)', type: 'list', itemTitle: 'title', itemName: 'milestone',
      itemDefaults: { highlights: [] },
      fields: [
        text('year', 'Year / date', { half: true, placeholder: 'e.g. 2023 – Present' }),
        text('category', 'Tag on the photo', { half: true }),
        text('title', 'Title', { required: true }),
        img('image', 'Photo', { preset: 'cover' }),
        area('description', 'Description'),
        { key: 'highlights', label: 'Key points (ticked list)', type: 'tags', help: 'Press Enter after each point.' },
        { key: 'hidden', label: 'Hide this milestone', type: 'toggle' },
      ],
    },
  ],
  defaults: {
    tabLabel: 'History & Timeline',
    eyebrow: 'Historical Milestones',
    heading: 'The Journey of Pokhara Trade Mall',
    intro: "From an ambitious collaborative initiative of local merchants to Gandaki's premier modern shopping epicenter.",
    milestoneLabel: 'Milestone',
    events: [
      {
        year: '2012 – 2013', title: 'The Entrepreneurial Vision', category: 'Foundation', image: '/mall_images/IMG_1366.webp',
        description: 'A coalition of over 60 small and medium local retail entrepreneurs in Pokhara united under Pokhara Trade Mall & Housing Pvt. Ltd. The vision was to overcome rental instability in the commercial center and create a permanent, world-class business hub for Gandaki Province.',
        highlights: ['60+ Founding Entrepreneur Shareholders', 'Conceptualized by Local Business Leaders', 'Strategic Location in Chipledhunga Hub'],
      },
      {
        year: 'Early 2014', title: 'Groundbreaking & Seismic Construction', category: 'Engineering', image: '/mall_images/IMG_1364.webp',
        description: 'Construction commenced by renowned builder CE Construction with an initial investment exceeding NPR 1 Billion (100 Crore+). The complex was built with advanced seismic structural engineering capable of withstanding up to 8.5–9.0 magnitude earthquakes, featuring multi-level underground basements, elevators, and escalators.',
        highlights: ['NPR 1B+ Capital Investment', 'Seismic Resilience (8.5–9.0 Magnitude)', 'Modern Escalators & Capsule Elevators'],
      },
      {
        year: 'April 2015', title: 'Tested by Nature: The Earthquake Proof', category: 'Resilience', image: '/mall_images/IMG_1365.webp',
        description: 'When the devastating 7.8 magnitude Nepal Earthquake struck in April 2015, Pokhara Trade Mall sustained zero structural damage, validating the superior engineering and strict building safety standards adopted from day one.',
        highlights: ['Zero Structural Damage', 'Validated Safety Standards', 'Safe Haven in Gandaki Province'],
      },
      {
        year: 'October 15, 2015 (2072 BS)', title: 'Grand Official Inauguration', category: 'Milestone', image: '/mall_images/ptm_hero.webp',
        description: "Pokhara Trade Mall was officially inaugurated in a grand ceremony by Rabindra Adhikary (Chairman of Parliament's Development Committee), alongside Chairman Bindu Kumar Thapa and Managing Director Minraj Kafle. The mall opened over 500 shutters, bringing fashion, tech, and dining under one roof.",
        highlights: ['Inaugurated by National Leaders', 'Over 500 Retail & Commercial Spaces', "Gandaki's Largest Shopping Complex"],
      },
      {
        year: '2018 – 2020', title: 'Entertainment Expansion & COVID-19 Tenant Relief', category: 'Community & Growth', image: '/mall_images/IMG_1361.webp',
        description: 'Upgraded with state-of-the-art multi-screen Cineplex (QFX Cinemas) and an expansive 4th-floor food court. During the 2020 pandemic crisis, the leadership made national headlines by granting a historic 50% rent waiver across all 500+ shutters to support local small businesses.',
        highlights: ['QFX Multiplex Laser Projection', 'Historic 50% COVID-19 Rent Relief', 'Revamped Multi-Cuisine Food Court'],
      },
      {
        year: '2023 – Present', title: 'Modern Retail Hub & Digital Evolution', category: 'Modern Era', image: '/mall_images/IMG_1360.webp',
        description: 'Under the executive management of Managing Director Saugat Thapa, Pokhara Trade Mall has evolved into a full-scale omni-lifestyle center—welcoming global retail brands, abroad education consultancies, digital interactive wayfinding, and cultural festival celebrations.',
        highlights: ['Digital Interactive Floor Directories', 'Abroad Study & Financial Hubs', '10,000+ Daily Footfall'],
      },
    ],
  },
});

export const PRESS_COLORS: Record<string, string> = {
  blue: 'border-blue-500/30 bg-blue-50/40 text-blue-900',
  amber: 'border-amber-500/30 bg-amber-50/40 text-amber-900',
  emerald: 'border-emerald-500/30 bg-emerald-50/40 text-emerald-900',
  purple: 'border-purple-500/30 bg-purple-50/40 text-purple-900',
  red: 'border-red-500/30 bg-red-50/40 text-red-900',
  gray: 'border-gray-500/30 bg-gray-50/40 text-gray-900',
};

export interface AboutMedia {
  hidden?: boolean; tabLabel: string; eyebrow: string; heading: string; intro: string;
  inquiryLabel: string; inquiryHref: string; archiveLabel: string; linkLabel: string;
  mentions: { publisher: string; date: string; headline: string; quote: string; tag: string; color: string; url?: string; hidden?: boolean; showFrom?: string; hideAfter?: string }[];
  kitHidden?: boolean; kitEyebrow: string; kitHeading: string; kitText: string; kitButtonLabel: string; kitButtonHref: string;
}

export const aboutMediaBlock = defineBlock<AboutMedia>({
  key: 'about-media',
  group: 'About page',
  label: 'Press & media',
  description: 'The "In The Headlines" press coverage cards and the media resources banner.',
  page: '/about#media',
  fields: [
    hide('the whole press section'), tabLabel,
    text('eyebrow', 'Small red label', { half: true }), text('heading', 'Heading', { half: true }),
    area('intro', 'Intro text'),
    text('inquiryLabel', 'Media enquiries button text', { half: true }),
    link('inquiryHref', 'Media enquiries button link', { half: true, help: 'e.g. mailto:media@pokharatrademall.com or /contact' }),
    text('archiveLabel', 'Card footer text (left)', { half: true }),
    text('linkLabel', 'Card footer link text (right)', { half: true }),
    {
      key: 'mentions', label: 'Press mentions', type: 'list', itemTitle: 'headline', itemName: 'press mention',
      itemDefaults: { color: 'blue' },
      fields: [
        text('publisher', 'Publisher', { half: true, required: true }),
        text('date', 'Date or type', { half: true, placeholder: 'e.g. October 2015' }),
        text('headline', 'Headline', { required: true }),
        area('quote', 'Quote / summary'),
        text('tag', 'Tag', { half: true }),
        { key: 'color', label: 'Tag colour', type: 'select', half: true, options: Object.keys(PRESS_COLORS).map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) })) },
        link('url', 'Link to the article', { help: 'Optional. When set, the card footer link opens the article.' }),
        ...SCHEDULE_FIELDS,
      ],
    },
    { key: 'kitHidden', label: 'Hide the media resources banner', type: 'toggle' },
    text('kitEyebrow', 'Banner: small label', { half: true }), text('kitHeading', 'Banner: heading', { half: true }),
    area('kitText', 'Banner: text'),
    text('kitButtonLabel', 'Banner button text', { half: true }), link('kitButtonHref', 'Banner button link', { half: true }),
  ],
  defaults: {
    tabLabel: 'Press & Media',
    eyebrow: 'Press & Publications',
    heading: 'In The Headlines',
    intro: "Documenting Pokhara Trade Mall's role as Gandaki Province's commercial engine and community partner.",
    inquiryLabel: 'Media & Editorial Inquiries',
    inquiryHref: 'mailto:media@pokharatrademall.com',
    archiveLabel: 'Verified Media Archive',
    linkLabel: 'Press Coverage',
    mentions: [
      {
        publisher: 'The Kathmandu Post', date: 'October 2015', tag: 'National Press', color: 'blue',
        headline: 'Pokhara Trade Mall opens for business: 500+ commercial spaces built with Rs 1B investment',
        quote: 'Constructed by small and medium retail entrepreneurs coming together, Pokhara Trade Mall marks a monumental leap in Gandaki’s modern retail infrastructure.',
      },
      {
        publisher: 'New Business Age', date: 'Commercial Feature', tag: 'Business & Economy', color: 'amber',
        headline: 'Pokhara’s Mega Commercial Destination Comes Into Operation at Chipledhunga',
        quote: 'Equipped with earthquake-resistant technology, state-of-the-art lifts, and over 500 shutters, the mall eliminates rental insecurity for Pokhara’s traders.',
      },
      {
        publisher: 'Ratopati & Gandaki Khabar', date: 'Community Spotlight', tag: 'Leadership & Community', color: 'emerald',
        headline: 'Pokhara Trade Mall Leadership Announces 50% Rent Relief to Protect Retail Tenants',
        quote: 'In a remarkable display of business solidarity, the executive management granted substantial rent concessions to ensure small businesses thrived amidst market challenges.',
      },
      {
        publisher: 'Pokhara City Tourism & Lifestyle Journal', date: 'Travel & Lifestyle', tag: 'Lifestyle & Tourism', color: 'purple',
        headline: 'The Heartbeat of Chipledhunga: Why PTM is the Go-To Spot for Tourists & Locals Alike',
        quote: 'From authentic Thakali delicacies to cutting-edge 4K cinema and vibrant apparel boutiques, Pokhara Trade Mall encapsulates the modern soul of the city.',
      },
    ],
    kitEyebrow: 'Media Resources',
    kitHeading: 'Official Press & Photography Assets',
    kitText: 'Journalists and media representatives can request high-resolution brand logos, photography, and official spokesperson statements.',
    kitButtonLabel: 'Contact PR Desk',
    kitButtonHref: '/contact',
  },
});

export interface AboutLeadership {
  hidden?: boolean; tabLabel: string; eyebrow: string; heading: string; intro: string;
  members: { name: string; role: string; subtitle: string; image: string; bio: string; badges: string[]; hidden?: boolean }[];
  messageHidden?: boolean; messageEyebrow: string; messageHeading: string; messageText: string; messageAuthor: string; messageAuthorTitle: string;
  logo: string; logoCaption: string;
}

export const aboutLeadershipBlock = defineBlock<AboutLeadership>({
  key: 'about-leadership',
  group: 'About page',
  label: 'Board & leadership',
  description: 'Leadership team cards and the message from the Managing Director.',
  page: '/about#leadership',
  fields: [
    hide('the whole leadership section'), tabLabel,
    text('eyebrow', 'Small red label', { half: true }), text('heading', 'Heading', { half: true }),
    area('intro', 'Intro text'),
    {
      key: 'members', label: 'People', type: 'list', itemTitle: 'name', itemName: 'person', itemDefaults: { badges: [], image: '/square_silhouette_1.jpeg' },
      fields: [
        text('name', 'Name', { half: true, required: true }), text('role', 'Role (red label on the photo)', { half: true }),
        text('subtitle', 'Subtitle'),
        img('image', 'Photo', { preset: 'logo', help: 'Square photos look best.' }),
        area('bio', 'Short bio'),
        { key: 'badges', label: 'Badges', type: 'tags' },
        { key: 'hidden', label: 'Hide this person', type: 'toggle' },
      ],
    },
    { key: 'messageHidden', label: 'Hide the executive message', type: 'toggle' },
    text('messageEyebrow', 'Message: small label', { half: true }), text('messageHeading', 'Message: heading', { half: true }),
    area('messageText', 'Message text'),
    text('messageAuthor', 'Signed by', { half: true }), text('messageAuthorTitle', 'Their title', { half: true }),
    img('logo', 'Logo beside the message', { preset: 'logo', half: true }), text('logoCaption', 'Caption under the logo', { half: true }),
  ],
  defaults: {
    tabLabel: 'Board & Leadership',
    eyebrow: 'Leadership & Governance',
    heading: 'The Board & Executive Team',
    intro: 'Guided by experienced business pioneers and progressive leadership dedicated to Pokhara’s economic prosperity.',
    members: [
      {
        name: 'Bindu Kumar Thapa', role: 'Founder & Senior Advisor', subtitle: 'Former Chairman, Pokhara Trade Mall & Housing', image: '/square_silhouette_1.jpeg',
        bio: 'A visionary industrialist, respected entrepreneur, and former Minister in Gandaki Province. He championed the collective investment model that brought over 60 local entrepreneurs together to build Pokhara Trade Mall.',
        badges: ['Founding Chairman', 'Gandaki Business Pioneer'],
      },
      {
        name: 'Saugat Thapa', role: 'Managing Director (MD)', subtitle: 'Executive Leadership & Strategic Operations', image: '/square_silhouette_2.jpeg',
        bio: 'Directing the modernization, brand onboarding, digital wayfinding, and visitor experience initiatives at Pokhara Trade Mall. Dedicated to elevating PTM into Nepal’s benchmark lifestyle shopping center.',
        badges: ['Managing Director', 'Modernization Lead'],
      },
      {
        name: 'Minraj Kafle', role: 'Co-Founder & Executive Director', subtitle: 'Commercial Operations & Tenant Relations', image: '/square_silhouette_1.jpeg',
        bio: 'A cornerstone of the mall’s inception and continuous operations, guiding retail relationships, lease structures, and commercial growth across all 6 levels since 2014.',
        badges: ['Co-Founder', 'Operations Director'],
      },
      {
        name: 'Board of Directors & Shareholders', role: 'Shareholders & Governance Committee', subtitle: '60+ Local Entrepreneur Partners', image: '/square_silhouette_2.jpeg',
        bio: 'Representing the dynamic collective of Pokhara’s business community whose shared ownership and collaborative governance make Pokhara Trade Mall a true people-powered institution.',
        badges: ['Community Owned', 'Governing Council'],
      },
    ],
    messageEyebrow: 'Executive Message',
    messageHeading: 'Redefining Retail & Leisure for the Next Generation',
    messageText: 'Pokhara Trade Mall was founded on the belief that collective unity creates enduring strength. As we look to the future, our focus remains firmly on providing exceptional customer experiences, embracing digital innovation, and standing as the most welcoming landmark in Pokhara.',
    messageAuthor: 'Saugat Thapa',
    messageAuthorTitle: 'Managing Director, Pokhara Trade Mall',
    logo: '/tm_logo_nobg.png',
    logoCaption: "Pokhara's Premier Mall since 2015",
  },
});

export interface AboutFeatures {
  hidden?: boolean; tabLabel: string; eyebrow: string; heading: string; intro: string;
  features: { icon: string; title: string; desc: string; hidden?: boolean }[];
  communityHidden?: boolean; communityEyebrow: string; communityHeading: string; communityText: string; communityChips: string[];
  communityImage: string; communityImageAlt: string;
}

export const aboutFeaturesBlock = defineBlock<AboutFeatures>({
  key: 'about-features',
  group: 'About page',
  label: 'Features & community',
  description: 'The infrastructure & amenities cards and the dark "Community & Culture" panel.',
  page: '/about#features',
  fields: [
    hide('the whole features section'), tabLabel,
    text('eyebrow', 'Small red label', { half: true }), text('heading', 'Heading', { half: true }),
    area('intro', 'Intro text'),
    {
      key: 'features', label: 'Feature cards', type: 'list', itemTitle: 'title', itemName: 'feature', itemDefaults: { icon: 'star' },
      fields: [icon('icon'), text('title', 'Title', { half: true, required: true }), area('desc', 'Description'), { key: 'hidden', label: 'Hide this card', type: 'toggle' }],
    },
    { key: 'communityHidden', label: 'Hide the community panel', type: 'toggle' },
    text('communityEyebrow', 'Community: small label', { half: true }), text('communityHeading', 'Community: heading', { half: true }),
    area('communityText', 'Community: text'),
    { key: 'communityChips', label: 'Community: highlight chips', type: 'tags', help: 'Short phrases shown as little pills. Emoji are fine.' },
    img('communityImage', 'Community photo', { preset: 'cover', half: true }), text('communityImageAlt', 'Photo description', { half: true }),
  ],
  defaults: {
    tabLabel: 'Features & Impact',
    eyebrow: 'Infrastructure & Amenities',
    heading: 'Built for Safety, Comfort & Convenience',
    intro: 'Every square meter of Pokhara Trade Mall is designed to meet international standards of public safety, accessibility, and modern aesthetics.',
    features: [
      { icon: 'shield', title: 'Earthquake-Resistant Engineering', desc: 'Constructed by CE Construction with reinforced concrete foundations engineered to withstand seismic tremors up to 9.0 magnitude.' },
      { icon: 'compass', title: 'Vertical Mobility & Accessibility', desc: 'Equipped with continuous dual-way escalators, high-speed passenger capsule elevators, and step-free wheelchair ramps across all levels.' },
      { icon: 'parking', title: 'Multi-Level Secure Parking', desc: 'Spacious dedicated basement and surface parking with CCTV surveillance for 200+ two-wheelers and four-wheelers.' },
      { icon: 'film', title: 'QFX Multiplex Cinema', desc: 'Premium multi-hall movie theater with 4K laser projection, Dolby Atmos 3D audio, and luxury recliner seating.' },
      { icon: 'store', title: '500+ Retail & Service Outlets', desc: 'A comprehensive ecosystem of national and international fashion boutiques, electronics, cosmetics, jewelry, and local crafts.' },
      { icon: 'building', title: 'Banking & Education Hub', desc: 'Home to leading national commercial banks, 24/7 ATMs, foreign exchange services, and premier study abroad consultancies.' },
    ],
    communityEyebrow: 'Community & Culture',
    communityHeading: "Celebrating Gandaki's Heritage & Youth",
    communityText: 'Beyond shopping, Pokhara Trade Mall is an active civic center hosting festive celebrations for Dashain, Tihar, Holi, and English New Year, as well as talent showcases, educational seminars, and youth cultural showcases.',
    communityChips: ['✨ Dashain-Tihar Mahotsav', '🎨 Local Art Exhibitions', '🌱 Energy Efficient Lighting'],
    communityImage: '/mall_images/IMG_1368.webp',
    communityImageAlt: 'Community Gathering Pokhara Trade Mall',
  },
});

export interface AboutFaq {
  hidden?: boolean; tabLabel: string; eyebrow: string; heading: string; intro: string;
  faqs: { q: string; a: string; hidden?: boolean }[];
}

export const aboutFaqBlock = defineBlock<AboutFaq>({
  key: 'about-faq',
  group: 'About page',
  label: 'Visitor FAQ',
  description: 'Frequently asked questions. The first one opens automatically. Update hours and phone numbers here when they change.',
  page: '/about#faq',
  fields: [
    hide('the FAQ section'), tabLabel,
    text('eyebrow', 'Small red label', { half: true }), text('heading', 'Heading', { half: true }),
    area('intro', 'Intro text'),
    {
      key: 'faqs', label: 'Questions', type: 'list', itemTitle: 'q', itemName: 'FAQ',
      fields: [text('q', 'Question', { required: true }), area('a', 'Answer', { required: true }), { key: 'hidden', label: 'Hide this question', type: 'toggle' }],
    },
  ],
  defaults: {
    tabLabel: 'Visitor FAQ',
    eyebrow: 'Frequently Asked Questions',
    heading: 'Visitor Information & Guide',
    intro: 'Find answers to common questions about visiting, parking, shopping, and leasing at Pokhara Trade Mall.',
    faqs: [
      { q: 'What are the operating hours of Pokhara Trade Mall?', a: 'The retail shops and service outlets operate daily from 10:00 AM to 8:00 PM (open until 10:00 PM on weekends and festival seasons). The QFX Cinemas and select 4th-floor dining outlets operate from 7:00 AM to 12:00 AM midnight.' },
      { q: 'Where is Pokhara Trade Mall located?', a: 'Pokhara Trade Mall is located centrally on Chipledhunga Road in the commercial downtown core of Pokhara (Ward 4 / 9), just minutes from Mahendrapul and a short 10-minute drive from Lakeside, Pokhara.' },
      { q: 'How many stores and services are housed in the mall?', a: 'The mall houses over 500 commercial spaces spread across 6 floors, including apparel, footwear, tech gadgets, fine jewelry, beauty salons, banks, abroad study consultancies, game zones, and food courts.' },
      { q: 'How can businesses or brands apply for commercial leasing?', a: 'Prospective tenants and pop-up stall operators can contact our Management & Leasing Office via our Contact page or call our dedicated administration line at +977 61-520000 / +977 9856012345.' },
      { q: 'Are parking facilities available on-site?', a: 'Yes, Pokhara Trade Mall features a secure multi-level underground parking basement with dedicated attendants and 24/7 CCTV surveillance for both motorbikes and cars.' },
    ],
  },
});

export interface Cta { label: string; href: string; icon: string; style: string }

export interface AboutCta {
  hidden?: boolean; eyebrow: string; heading: string; text: string; buttons: Cta[];
}

const BUTTON_STYLES = [
  { value: 'btn-white', label: 'White' },
  { value: 'btn-dark', label: 'Dark' },
  { value: 'btn-primary', label: 'Red' },
  { value: 'btn-secondary', label: 'Outline' },
];

export const aboutCtaBlock = defineBlock<AboutCta>({
  key: 'about-cta',
  group: 'About page',
  label: 'Closing call to action',
  description: 'The red banner at the bottom of the About page.',
  page: '/about',
  fields: [
    hide('the banner'),
    text('eyebrow', 'Small label'), text('heading', 'Heading'), area('text', 'Text'),
    {
      key: 'buttons', label: 'Buttons', type: 'list', itemTitle: 'label', itemName: 'button', max: 4, itemDefaults: { icon: 'store', style: 'btn-dark' },
      fields: [text('label', 'Text', { half: true }), link('href', 'Link', { half: true }), icon('icon'), { key: 'style', label: 'Style', type: 'select', half: true, options: BUTTON_STYLES }],
    },
  ],
  defaults: {
    eyebrow: 'Experience Pokhara Trade Mall',
    heading: 'Plan Your Visit or Join Our Retail Community',
    text: 'Whether you’re planning a family movie outing, shopping for the latest trends, or looking to lease commercial space in Pokhara’s busiest mall, we are here to welcome you.',
    buttons: [
      { label: 'Browse Directory', href: '/shops/directory', icon: 'store', style: 'btn-white' },
      { label: 'Leasing & Inquiries', href: '/contact', icon: 'email', style: 'btn-dark' },
      { label: 'View Floor Map', href: '/mall-map', icon: 'compass', style: 'btn-dark' },
    ],
  },
});

/* ============================================================= CONTACT PAGE */

export interface ContactPageContent {
  title: string; subtitle: string; badge: string;
  phoneTitle: string; phoneText: string; emailTitle: string; emailText: string;
  hoursTitle: string;
  formEyebrow: string; formHeading: string; formIntro: string;
  nameLabel: string; namePlaceholder: string; phoneLabel: string; phonePlaceholder: string;
  emailLabel: string; emailPlaceholder: string; topicLabel: string; topics: string[];
  messageLabel: string; messagePlaceholder: string; submitLabel: string; sendingLabel: string;
  successHeading: string; successText: string; againLabel: string;
  locationTitle: string; locationText: string; mapEmbedUrl: string;
}

export const contactPageBlock = defineBlock<ContactPageContent>({
  key: 'contact-page',
  group: 'Contact page',
  label: 'Contact page',
  description: 'Texts, form labels and map on the Contact page. Phone, email and address come from Contact & social; opening hours from Mall timings. Messages sent with the form arrive in the admin Inbox.',
  page: '/contact',
  fields: [
    text('title', 'Page title', { half: true }), text('badge', 'Small badge above the title', { half: true }),
    area('subtitle', 'Header subtitle'),
    text('phoneTitle', 'Phone card: title', { half: true }), text('phoneText', 'Phone card: small text', { half: true, help: 'The number itself comes from Site settings.' }),
    text('emailTitle', 'Email card: title', { half: true }), text('emailText', 'Email card: small text', { half: true, help: 'The address itself comes from Site settings.' }),
    text('hoursTitle', 'Hours card: title'),
    text('formEyebrow', 'Form: small red label', { half: true }), text('formHeading', 'Form: heading', { half: true }),
    area('formIntro', 'Form: intro text'),
    text('nameLabel', 'Name field label', { half: true }), text('namePlaceholder', 'Name field example', { half: true }),
    text('phoneLabel', 'Phone field label', { half: true }), text('phonePlaceholder', 'Phone field example', { half: true }),
    text('emailLabel', 'Email field label', { half: true }), text('emailPlaceholder', 'Email field example', { half: true }),
    text('topicLabel', 'Topic dropdown label'),
    { key: 'topics', label: 'Topic choices', type: 'tags', help: 'Choices in the dropdown. The first one is selected by default. The chosen topic is shown as the subject in the Inbox.' },
    text('messageLabel', 'Message field label', { half: true }), text('messagePlaceholder', 'Message field example', { half: true }),
    text('submitLabel', 'Send button text', { half: true }), text('sendingLabel', 'Send button text while sending', { half: true }),
    text('successHeading', 'Thank-you heading', { half: true }), text('againLabel', '"Send another" button text', { half: true }),
    area('successText', 'Thank-you text'),
    text('locationTitle', 'Location card: title', { help: 'The address line comes from Site settings.' }),
    area('locationText', 'Location card: directions'),
    { key: 'mapEmbedUrl', label: 'Google Maps embed link', type: 'url', help: 'In Google Maps: Share → Embed a map → copy only the address inside src="…".' },
  ],
  defaults: {
    title: 'Contact & Inquiries',
    subtitle: 'Get in touch with Pokhara Trade Mall administration, retail leasing management, or visitor assistance.',
    badge: "We're Here to Help",
    phoneTitle: 'Direct Phone Lines', phoneText: 'Customer desk & management inquiries',
    emailTitle: 'Email Support', emailText: 'General questions, media & feedback',
    hoursTitle: 'Operating Hours',
    formEyebrow: 'Send a Message',
    formHeading: 'How Can We Help You?',
    formIntro: 'Fill out the form below and our team will get back to you within 24 hours.',
    nameLabel: 'Your Name *', namePlaceholder: 'e.g. Ramesh Shrestha',
    phoneLabel: 'Phone Number *', phonePlaceholder: '+977 98...',
    emailLabel: 'Email Address *', emailPlaceholder: 'name@example.com',
    topicLabel: 'Inquiry Category',
    topics: ['General Visitor Inquiry', 'Store & Booth Leasing', 'Brand Promotion & Events', 'Press & Media Relations', 'Lost & Found'],
    messageLabel: 'Your Message *', messagePlaceholder: 'Tell us how we can assist you...',
    submitLabel: 'Submit Inquiry', sendingLabel: 'Sending…',
    successHeading: 'Thank You!',
    successText: 'Your inquiry has been submitted successfully. Our team will contact you shortly.',
    againLabel: 'Send Another Inquiry',
    locationTitle: 'Pokhara Trade Mall',
    locationText: "Centrally positioned in Pokhara's bustling retail core, reachable within 10 minutes from Lakeside and walking distance from Mahendrapul.",
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3515.2289973872224!2d83.98544837548625!3d28.21852027589381!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399594589d38bb13%3A0xc3b836473187c4a1!2sPokhara%20Trade%20Mall!5e0!3m2!1sne!2snp!4v1749486065634!5m2!1sne!2snp',
  },
});

/* ============================================================ SERVICES PAGE */

export interface ServiceSection {
  category: string; anchor?: string; tabLabel?: string; eyebrow?: string; heading?: string; intro?: string;
  matchTags?: string[]; hidden?: boolean;
}

export interface ServicesPageContent {
  title: string; subtitle: string; badge: string;
  sections: ServiceSection[];
  emptyText: string; cardLinkLabel: string;
}

export const servicesPageBlock = defineBlock<ServicesPageContent>({
  key: 'services-page',
  group: 'Services page',
  label: 'Header & service sections',
  description: 'One section is shown for every "Services" category in Store categories, filled with the service stores filed under it. A new service category appears here automatically; use this list to give a section its own heading and text.',
  page: '/services',
  fields: [
    text('title', 'Page title', { half: true }), text('badge', 'Small badge above the title', { half: true }),
    area('subtitle', 'Header subtitle'),
    {
      key: 'sections', label: 'Section texts (optional, per category)', type: 'list', itemTitle: 'heading', itemName: 'section text',
      fields: [
        { key: 'category', label: 'Category', type: 'category', sector: 'service', half: true, required: true },
        text('anchor', 'Web address anchor', { half: true, help: 'Optional. e.g. "beauty" makes /services#beauty jump here. Leave empty to use the category code.' }),
        text('tabLabel', 'Tab label', { half: true, help: 'Leave empty to use the category short name.' }),
        text('eyebrow', 'Small red label', { half: true, help: 'Leave empty to use the category subtitle.' }),
        text('heading', 'Heading', { help: 'Leave empty to use the category name.' }),
        area('intro', 'Intro text', { help: 'Leave empty to use the category description.' }),
        { key: 'matchTags', label: 'Also include stores tagged', type: 'tags', help: 'Service stores with any of these tags (or category codes) also show in this section, e.g. "atm".' },
        { key: 'hidden', label: 'Hide this section', type: 'toggle' },
      ],
    },
    text('emptyText', 'Text when a section has no stores yet'),
    text('cardLinkLabel', 'Link text on each store card', { half: true }),
  ],
  defaults: {
    title: 'Services & Directory',
    subtitle: 'Explore top educational consultancies, banking hubs, architecture studios, and luxury spas alongside complete mall guest amenities.',
    badge: 'BUSINESS & GUEST SERVICES',
    sections: [
      { category: 'beauty-wellness', anchor: 'beauty', tabLabel: 'Beauty & Wellness', eyebrow: 'Relaxation & Grooming', heading: 'Beauty & Wellness', intro: 'Ayurvedic body therapies, hair styling, skin clinics, and luxury grooming on our Dedicated Service wings.', matchTags: ['beauty', 'spa', 'salon', 'massage'] },
      { category: 'finance', anchor: 'finance', tabLabel: 'Banks & Finance', eyebrow: 'Banking & Forex', heading: 'Banks & Financial Services', intro: 'Full-service commercial bank branches, foreign currency exchange, remittance counters, and 24/7 ATM lounge.', matchTags: ['bank', 'atm', 'forex', 'loans'] },
      { category: 'education', anchor: 'education', tabLabel: 'Abroad Study', eyebrow: 'Global Education & Test Prep', heading: 'Abroad Study & Education', intro: 'Certified overseas education consultancies, high-score IELTS/PTE training labs, and visa counseling hubs.', matchTags: ['ielts', 'pte', 'study abroad', 'education'] },
      { category: 'it-tech', anchor: 'it-tech', tabLabel: 'IT & Software Studios', eyebrow: 'Digital & Cloud Tech', heading: 'IT, Software & Digital Solutions', intro: 'Enterprise software development, corporate web engineering, network cybersecurity, and managed IT services.', matchTags: ['it', 'software', 'cloud', 'cybersecurity'] },
      { category: 'health-fitness', anchor: 'health-fitness', tabLabel: 'Health & Fitness', eyebrow: 'Active Living & Vitality', heading: 'Health & Fitness', intro: 'State-of-the-art gym, CrossFit conditioning, cardio training zones, private steam saunas, and certified nutrition coaches.', matchTags: ['gym', 'fitness', 'crossfit', 'workout'] },
      { category: 'professional', anchor: 'consultancy', tabLabel: 'Engineering & Consultancies', eyebrow: 'Professional Studios', heading: 'Engineering & Consultancies', intro: 'Architectural modeling, structural design, land GPS surveying, GIS mapping, and legal corporate advisory.', matchTags: ['consultancy', 'architecture', 'engineering', 'surveying', 'consulting'] },
    ],
    emptyText: 'New businesses are coming soon to this section. Check back shortly!',
    cardLinkLabel: 'Inquire',
  },
});

export interface AmenityCard {
  icon: string; title: string; body: string; bullets: { icon: string; text: string }[];
  linkLabel?: string; linkHref?: string; showHotline?: boolean; hotlineLabel?: string; hoursLabel?: string; hours?: string; hidden?: boolean;
}

export interface ServicesAmenities {
  hidden?: boolean; tabLabel: string; anchor: string; eyebrow: string; heading: string; intro: string;
  cards: AmenityCard[];
  ctaHidden?: boolean; ctaEyebrow: string; ctaHeading: string; ctaText: string; ctaButtonLabel: string; ctaButtonHref: string;
  leasingButtonLabel: string; leasingHeading: string; leasingIntro: string; leasingSubmitLabel: string; leasingSuccess: string;
}

export const servicesAmenitiesBlock = defineBlock<ServicesAmenities>({
  key: 'services-amenities',
  group: 'Services page',
  label: 'Guest amenities, parking & leasing',
  description: 'The parking / map / guest assistance cards and the "Get in Touch" banner with its leasing enquiry form (enquiries arrive in the admin Inbox).',
  page: '/services#parking',
  fields: [
    hide('the amenities section'), tabLabel,
    text('anchor', 'Web address anchor', { half: true, help: 'e.g. "parking" makes /services#parking jump here.' }),
    text('eyebrow', 'Small red label', { half: true }), text('heading', 'Heading'),
    area('intro', 'Intro text'),
    {
      key: 'cards', label: 'Amenity cards', type: 'list', itemTitle: 'title', itemName: 'card', max: 6, itemDefaults: { icon: 'info', bullets: [] },
      fields: [
        icon('icon'), text('title', 'Title', { half: true, required: true }), area('body', 'Text'),
        { key: 'bullets', label: 'Bullet points', type: 'list', itemTitle: 'text', itemName: 'bullet', itemDefaults: { icon: 'star' }, fields: [icon('icon'), text('text', 'Text', { half: true })] },
        text('linkLabel', 'Link text (optional)', { half: true }), link('linkHref', 'Link', { half: true }),
        { key: 'showHotline', label: 'Show the mall phone number', type: 'toggle', half: true, help: 'Uses the phone from Site settings.' },
        text('hotlineLabel', 'Phone label', { half: true }),
        text('hoursLabel', 'Hours label (optional)', { half: true }), text('hours', 'Hours', { half: true }),
        { key: 'hidden', label: 'Hide this card', type: 'toggle' },
      ],
    },
    { key: 'ctaHidden', label: 'Hide the "Get in Touch" banner', type: 'toggle' },
    text('ctaEyebrow', 'Banner: small label', { half: true }), text('ctaHeading', 'Banner: heading', { half: true }),
    area('ctaText', 'Banner: text'),
    text('ctaButtonLabel', 'Contact button text', { half: true }), link('ctaButtonHref', 'Contact button link', { half: true }),
    text('leasingButtonLabel', 'Leasing button text', { half: true, help: 'Leave empty to hide the leasing enquiry form.' }),
    text('leasingHeading', 'Leasing form: heading', { half: true }),
    area('leasingIntro', 'Leasing form: intro'),
    text('leasingSubmitLabel', 'Leasing form: send button', { half: true }),
    text('leasingSuccess', 'Leasing form: thank-you text', { half: true }),
  ],
  defaults: {
    tabLabel: 'Mall Parking & Map',
    anchor: 'parking',
    eyebrow: 'Guest Amenities',
    heading: 'Mall Services & Parking Info',
    intro: 'Safe underground multi-level parking, wayfinding map, wheelchair accessibility, and 24/7 security assistance.',
    cards: [
      {
        icon: 'parking', title: 'Underground Parking',
        body: 'Multi-level secured basement parking with capacity for 200+ four-wheelers and 500+ two-wheelers. Equipped with automated boom barriers and EV charging stations.',
        bullets: [{ icon: 'charging', text: 'Fast EV Charging Bays Available' }, { icon: 'shield', text: '24/7 CCTV & Security Patrol' }],
      },
      {
        icon: 'pin', title: 'Interactive Mall Map',
        body: 'Navigate all 6 levels effortlessly. Locate escalators, elevators, restrooms, ATMs, emergency exits, and specific retail outlets in seconds.',
        bullets: [], linkLabel: 'Launch Interactive Map', linkHref: '/mall-map',
      },
      {
        icon: 'wheelchair', title: 'Guest Assistance',
        body: 'Customer service desk located at the Ground Floor main entrance. Free wheelchair assistance, lost & found registry, baby care nursing rooms, and luggage holding.',
        bullets: [], showHotline: true, hotlineLabel: 'Help Desk Hotline:', hoursLabel: 'Hours:', hours: '10:00 AM - 8:00 PM',
      },
    ],
    ctaEyebrow: 'Inquiries & Leasing',
    ctaHeading: 'Get in Touch with Mall Management',
    ctaText: 'Have questions about corporate space leasing, pop-up kiosks, event space bookings, or mall services? Reach out to our dedicated support team.',
    ctaButtonLabel: 'Contact Us',
    ctaButtonHref: '/contact',
    leasingButtonLabel: 'Leasing Enquiry',
    leasingHeading: 'Lease a Space at Pokhara Trade Mall',
    leasingIntro: 'Tell us about your business and the space you need. Our leasing team will call you back.',
    leasingSubmitLabel: 'Send Leasing Enquiry',
    leasingSuccess: 'Thank you! Our leasing team will contact you shortly.',
  },
});

/* =========================================================== ENTERTAIN PAGE */

export interface Spotlight {
  hidden?: boolean; showFrom?: string; hideAfter?: string;
  image: string; imageAlt: string; badge: string; location: string; kicker: string; title: string;
  eyebrowIcon: string; eyebrow: string; heading: string; body: string;
  features: { icon: string; title: string; text: string }[];
  hoursLabel: string; hours: string; phoneLabel: string; phone: string;
  primaryLabel: string; primaryHref: string; primaryIcon?: string; secondaryLabel?: string; secondaryHref?: string;
}

/* =========================================================== QFX CINEMAS PAGE */

export interface QfxExperienceFeature {
  icon: string;
  title: string;
  text: string;
}

export interface QfxPageContent {
  title: string;
  subtitle: string;
  badge: string;
  reserveLabel: string;
  nowShowingHeading: string;
  nowShowingSub: string;
  upcomingHeading: string;
  upcomingSub: string;
  phoneLabel: string;
  phone: string;
  locationLabel: string;
  location: string;
  hoursLabel: string;
  hours: string;
  vipHeading: string;
  vipSub: string;
  vipFeatures: QfxExperienceFeature[];
  privateBookingHidden?: boolean;
  privateBookingHeading: string;
  privateBookingText: string;
  privateBookingLabel: string;
  privateBookingHref: string;
  privateBookingPhone: string;
}

export const qfxPageBlock = defineBlock<QfxPageContent>({
  key: 'qfx-page',
  group: 'QFX page',
  label: 'QFX Cinemas page',
  description: 'Header, movie listings intro, multiplex features, and private booking section on the QFX page.',
  page: '/qfx',
  fields: [
    text('title', 'Page title', { half: true }),
    text('badge', 'Header badge', { half: true }),
    area('subtitle', 'Header subtitle'),
    text('reserveLabel', 'Booking CTA button label', { half: true }),
    text('nowShowingHeading', 'Now Showing section title', { half: true }),
    text('nowShowingSub', 'Now Showing subtitle', { half: true }),
    text('upcomingHeading', 'Upcoming section title', { half: true }),
    text('upcomingSub', 'Upcoming subtitle', { half: true }),
    text('phoneLabel', 'Box office phone label', { half: true }),
    text('phone', 'Box office phone number', { half: true }),
    text('locationLabel', 'Location label', { half: true }),
    text('location', 'Location text', { half: true }),
    text('hoursLabel', 'Hours label', { half: true }),
    text('hours', 'Operating hours', { half: true }),
    text('vipHeading', 'Experience section heading', { half: true }),
    text('vipSub', 'Experience section subtitle', { half: true }),
    {
      key: 'vipFeatures',
      label: 'Multiplex highlights',
      type: 'list',
      itemTitle: 'title',
      itemName: 'highlight',
      max: 6,
      itemDefaults: { icon: 'star', title: '', text: '' },
      fields: [icon('icon'), text('title', 'Title', { half: true }), text('text', 'Description')],
    },
    { key: 'privateBookingHidden', label: 'Hide private bookings section', type: 'toggle' },
    text('privateBookingHeading', 'Private bookings heading', { half: true }),
    area('privateBookingText', 'Private bookings description'),
    text('privateBookingLabel', 'Private bookings CTA text', { half: true }),
    link('privateBookingHref', 'Private bookings link', { half: true }),
    text('privateBookingPhone', 'Private bookings phone', { half: true }),
  ],
  defaults: {
    title: 'QFX CINEMAS',
    subtitle: "Experience high-definition 4K Laser projection with immersive Dolby Atmos surround sound, luxury recliners, and the latest international and Nepali cinema at Pokhara Trade Mall's premier multiplex.",
    badge: 'LEVEL 5 MULTIPLEX • POKHARA TRADE MALL',
    reserveLabel: 'Reserve Seats',
    nowShowingHeading: 'Now Showing in Pokhara',
    nowShowingSub: 'Currently running on Level 5 Cineplex with daily scheduled showtimes.',
    upcomingHeading: 'Upcoming & Next Change',
    upcomingSub: 'Arriving soon to QFX Cinemas Pokhara Trade Mall. Advance booking and previews.',
    phoneLabel: 'Box Office Inquiries:',
    phone: '+977 61-525500',
    locationLabel: 'Multiplex Location:',
    location: '5th Floor (Level 5), Pokhara Trade Mall, Chipledhunga',
    hoursLabel: 'Box Office Hours:',
    hours: '8:30 AM - 10:30 PM (Daily)',
    vipHeading: 'The QFX Multiplex Experience',
    vipSub: "Pokhara's most advanced cinema destination featuring world-class audiovisual technology.",
    vipFeatures: [
      {
        icon: 'tv',
        title: '4K RGB Laser Projection',
        text: 'Ultra-crisp visual clarity, intense contrast ratios, and hyper-vibrant color gamuts on giant wall-to-wall silver screens.',
      },
      {
        icon: 'sound',
        title: 'Dolby Atmos 3D Audio',
        text: '64-channel multidimensional acoustic surround sound placing audio precision all around and above you.',
      },
      {
        icon: 'couch',
        title: 'VIP Luxury Recliners',
        text: 'Ergonomic plush leather power recliners with personal armrests and extra legroom for maximum viewing comfort.',
      },
      {
        icon: 'cup',
        title: 'Gourmet Concessions',
        text: 'Fresh warm buttered caramel popcorn, loaded nachos, hot snacks, artisanal coffees, and chilled beverages.',
      },
    ],
    privateBookingHidden: false,
    privateBookingHeading: 'Host Private Screenings, Corporate Shows & Celebrations',
    privateBookingText: 'From private movie premieres, executive corporate presentations, and product launches to birthday celebrations and school group excursions, QFX Cinemas at Pokhara Trade Mall delivers an unmatched private theater experience with custom catering packages.',
    privateBookingLabel: 'Inquire for Private Booking',
    privateBookingHref: '/contact',
    privateBookingPhone: '+977 61-525500',
  },
});

export const entertainPageBlock = qfxPageBlock;
export type EntertainPageContent = QfxPageContent;
export interface Spotlight {
  hidden?: boolean; showFrom?: string; hideAfter?: string;
  image: string; imageAlt: string; badge: string; location: string; kicker: string; title: string;
  eyebrowIcon: string; eyebrow: string; heading: string; body: string;
  features: { icon: string; title: string; text: string }[];
  hoursLabel: string; hours: string; phoneLabel: string; phone: string;
  primaryLabel: string; primaryHref: string; primaryIcon?: string; secondaryLabel?: string; secondaryHref?: string;
}

/* ==================================================================== LEGAL */

export interface PrivacyPolicyContent {
  title: string; subtitle: string; badge: string; effectiveLabel: string; lastUpdated: string; company: string;
  sections: { heading: string; body: string; hidden?: boolean }[];
  contactHidden?: boolean; contactHeading: string; contactIntro: string; contactLinkLabel: string; contactLinkHref: string;
}

export const privacyPolicyBlock = defineBlock<PrivacyPolicyContent>({
  key: 'privacy-policy',
  group: 'Legal',
  label: 'Privacy policy',
  description: 'The Privacy Policy page. Sections are numbered automatically in the order listed. Remember to update the effective date when the policy changes.',
  page: '/privacy-policy',
  fields: [
    text('title', 'Page title', { half: true }), text('badge', 'Small badge above the title', { half: true }),
    area('subtitle', 'Header subtitle'),
    text('effectiveLabel', 'Date label', { half: true }),
    { key: 'lastUpdated', label: 'Effective / last updated date', type: 'date', half: true },
    text('company', 'Company name (top right and contact box)'),
    {
      key: 'sections', label: 'Sections', type: 'list', itemTitle: 'heading', itemName: 'section',
      fields: [
        text('heading', 'Heading', { required: true, help: 'Do not type the number; it is added automatically.' }),
        { key: 'body', label: 'Text', type: 'richtext' },
        { key: 'hidden', label: 'Hide this section', type: 'toggle' },
      ],
    },
    { key: 'contactHidden', label: 'Hide the closing "Contact us" section', type: 'toggle' },
    text('contactHeading', 'Contact section: heading', { half: true, help: 'The address, email and phone come from Site settings.' }),
    text('contactLinkLabel', 'Contact section: link text', { half: true }),
    area('contactIntro', 'Contact section: text'),
    link('contactLinkHref', 'Contact section: link'),
  ],
  defaults: {
    title: 'Privacy Policy',
    subtitle: 'Information on how Pokhara Trade Mall collects, protects, and handles your data across our digital platforms and premises.',
    badge: 'Legal & Transparency',
    effectiveLabel: 'Effective Date:',
    lastUpdated: '2026-01-01',
    company: 'Pokhara Trade Mall & Housing Pvt. Ltd.',
    sections: [
      {
        heading: 'Overview & Commitment',
        body: '<p>Pokhara Trade Mall & Housing Pvt. Ltd. (“PTM”, “we”, “our”, or “us”) values your trust and is committed to protecting your personal information. This Privacy Policy outlines our practices regarding data collection, usage, storage, and visitor rights across our official website, customer service desks, and mall premises located at Chipledhunga, Pokhara, Nepal.</p><p>We process personal information in compliance with the <strong>Individual Privacy Act (2075 / 2018)</strong> of Nepal and applicable international data protection principles.</p>',
      },
      {
        heading: 'Information We Collect',
        body: '<p>We collect information that you directly provide to us, as well as technical data generated when you interact with our services:</p><h3>a. Direct Submissions</h3><p class="small">When you submit inquiry forms for retail leasing, event bookings, lost & found assistance, or general feedback, we collect your name, contact phone number, email address, and message details.</p><h3>b. Guest Wi-Fi & Technical Diagnostics</h3><p class="small">When accessing our complimentary guest Wi-Fi within the mall atrium, temporary network identifier logs (such as device MAC address and connection timestamps) may be recorded for network security and bandwidth balancing.</p><h3>c. Website Analytics & Cookies</h3><p class="small">We use standard technical cookies and anonymized website analytics (such as browser type, operating system, and page view duration) to optimize navigation performance and responsiveness across devices.</p>',
      },
      {
        heading: 'How We Use Your Information',
        body: '<p>Your information is used strictly for legitimate operational purposes:</p><ul><li>Processing leasing, promotional sponsorship, and event venue inquiries.</li><li>Responding to visitor support requests, feedback, and customer desk services.</li><li>Maintaining physical safety, emergency preparedness, and building administration.</li><li>Enhancing website directory accessibility and mobile navigation.</li></ul><p class="small"><em>* We never sell, rent, or lease personal visitor information to third-party commercial marketing firms.</em></p>',
      },
      {
        heading: 'Mall CCTV & Public Space Monitoring',
        body: '<p>To safeguard visitors, staff, and store tenants, Pokhara Trade Mall operates 24/7 CCTV surveillance across all common corridors, escalators, atrium walkways, parking basements, and entry gates.</p><p class="small">CCTV recordings are securely stored and routinely overwritten after 30 to 45 days. Access to video logs is strictly limited to authorized security personnel and will only be disclosed to law enforcement authorities in compliance with applicable Nepali law.</p>',
      },
      {
        heading: 'Data Security & Storage',
        body: '<p>We implement electronic and administrative controls to protect submitted data against unauthorized disclosure or loss. Digital communications over our website are encrypted using industry-standard SSL protocols, and internal databases are protected by restricted role-based permissions.</p>',
      },
      {
        heading: 'Your Rights & Inquiries',
        body: '<p>You have the right to request access to the personal data we hold about you, request corrections to inaccurate contact details, or ask for the deletion of previously submitted inquiries where retention is not legally required.</p>',
      },
    ],
    contactHeading: 'Contact Us',
    contactIntro: 'If you have any questions, feedback, or data requests regarding this Privacy Policy, please reach out to our administration office:',
    contactLinkLabel: 'Have a specific inquiry? Contact our team →',
    contactLinkHref: '/contact',
  },
});

export interface ContentPageTexts { loadingText: string; notFoundTitle: string; notFoundText: string; backLabel: string; backHref: string }

export const contentPageBlock = defineBlock<ContentPageTexts>({
  key: 'content-page-texts',
  group: 'Legal',
  label: 'Custom pages: loading & not found',
  description: 'Texts shown on custom pages (/page/…) while loading, or when the address does not match any published page.',
  page: '/page/homepage_intro',
  fields: [
    text('loadingText', 'Loading text'),
    text('notFoundTitle', 'Not found: heading', { half: true }), text('notFoundText', 'Not found: text', { half: true }),
    text('backLabel', 'Not found: button text', { half: true }), link('backHref', 'Not found: button link', { half: true }),
  ],
  defaults: {
    loadingText: 'Loading...',
    notFoundTitle: 'Page not found',
    notFoundText: 'The page you are looking for may have been moved or is no longer available.',
    backLabel: 'Back to Home',
    backHref: '/',
  },
});

// Blocks for this area are registered here; see src/content/blocks/index.ts.
export const pagesBlocks: BlockDef<any>[] = [
  aboutHeroBlock, aboutHistoryBlock, aboutMediaBlock, aboutLeadershipBlock, aboutFeaturesBlock, aboutFaqBlock, aboutCtaBlock,
  servicesPageBlock, servicesAmenitiesBlock,
  qfxPageBlock, entertainPageBlock,
  contactPageBlock,
  privacyPolicyBlock, contentPageBlock,
];
