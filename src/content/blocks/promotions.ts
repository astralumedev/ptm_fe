import { defineBlock } from '../block';
import { SCHEDULE_FIELDS } from '../fields';
import type { Schedulable } from '../visibility';

const GROUP = 'Promotions & announcements';

const PAGE_OPTIONS = [
  { value: 'all', label: 'Every page' },
  { value: 'home', label: 'Home page only' },
];

export interface Promotion extends Schedulable {
  title: string;
  text: string;
  image: string;
  buttonLabel: string;
  buttonLink: string;
  pages: 'all' | 'home';
  frequency: 'visit' | 'day' | 'week' | 'once';
  delaySeconds: number;
}

/** A pop-up that greets visitors (a sale, a festival, a new store) and sends them somewhere. */
export const promotionsBlock = defineBlock<{ items: Promotion[] }>({
  key: 'promotions',
  group: GROUP,
  label: 'Promotion pop-up',
  description: 'A pop-up shown when visitors open the website. Only one shows at a time: the first live promotion in the list. Use the dates to schedule campaigns ahead.',
  page: '/',
  fields: [
    {
      key: 'items', label: 'Promotions', type: 'list', itemTitle: 'title', itemName: 'promotion',
      itemDefaults: { title: '', text: '', image: '', buttonLabel: 'Learn more', buttonLink: '/latest#offers', pages: 'all', frequency: 'day', delaySeconds: 2 },
      fields: [
        { key: 'image', label: 'Image', type: 'imageUrl', preset: 'content', help: 'Square or portrait works best, e.g. a campaign poster.' },
        { key: 'title', label: 'Heading', type: 'text', required: true },
        { key: 'text', label: 'Text', type: 'textarea', help: 'Optional. Keep it to one or two sentences.' },
        { key: 'buttonLabel', label: 'Button text', type: 'text', half: true, help: 'Leave empty for no button; the image still links.' },
        { key: 'buttonLink', label: 'Button link', type: 'text', half: true, placeholder: '/latest#offers or https://…' },
        { key: 'pages', label: 'Show on', type: 'select', options: PAGE_OPTIONS, half: true },
        {
          key: 'frequency', label: 'How often', type: 'select', half: true,
          options: [
            { value: 'visit', label: 'Every visit' },
            { value: 'day', label: 'Once a day' },
            { value: 'week', label: 'Once a week' },
            { value: 'once', label: 'Only once' },
          ],
          help: 'Per visitor, after they close it. Editing the promotion shows it again.',
        },
        { key: 'delaySeconds', label: 'Wait before showing (seconds)', type: 'number', half: true },
        ...SCHEDULE_FIELDS,
      ],
    },
  ],
  defaults: { items: [] },
});

export interface Announcement extends Schedulable {
  text: string;
  linkLabel: string;
  link: string;
  style: 'brand' | 'dark' | 'alert' | 'info';
  dismissible: boolean;
  pages: 'all' | 'home';
}

/** A thin notice bar above the header: holiday hours, closures, parking changes. */
export const announcementsBlock = defineBlock<{ items: Announcement[] }>({
  key: 'announcements',
  group: GROUP,
  label: 'Announcement banner',
  description: 'A slim bar across the top of the website for notices, e.g. "Open until 10 PM during Dashain". The first live announcement in the list shows.',
  page: '/',
  fields: [
    {
      key: 'items', label: 'Announcements', type: 'list', itemTitle: 'text', itemName: 'announcement',
      itemDefaults: { text: '', linkLabel: '', link: '', style: 'brand', dismissible: true, pages: 'all' },
      fields: [
        { key: 'text', label: 'Message', type: 'text', required: true, help: 'One short line. It wraps on phones.' },
        { key: 'linkLabel', label: 'Link text', type: 'text', half: true, placeholder: 'e.g. See hours', help: 'Optional.' },
        { key: 'link', label: 'Link', type: 'text', half: true, placeholder: '/contact' },
        {
          key: 'style', label: 'Colour', type: 'select', half: true,
          options: [
            { value: 'brand', label: 'Mall red' },
            { value: 'dark', label: 'Dark' },
            { value: 'info', label: 'Blue (information)' },
            { value: 'alert', label: 'Amber (important)' },
          ],
        },
        { key: 'pages', label: 'Show on', type: 'select', options: PAGE_OPTIONS, half: true },
        { key: 'dismissible', label: 'Visitors can close it', type: 'toggle', help: 'Turn off for notices everyone must see, e.g. an emergency closure.' },
        ...SCHEDULE_FIELDS,
      ],
    },
  ],
  defaults: { items: [] },
});

export const promotionBlocks = [announcementsBlock, promotionsBlock];

/** Stable id for "already seen": changes whenever the content changes, so edits show again. */
export function contentKey(parts: unknown[]) {
  const s = JSON.stringify(parts);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
