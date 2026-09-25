import type { LucideIcon } from 'lucide-react';
import { Store, Newspaper, FileText, CalendarDays, BadgePercent } from 'lucide-react';
import { Field, SCHEDULE_FIELDS } from '@/content/fields';

export type { Field, FieldType } from '@/content/fields';

export interface CollectionDef {
  key: 'stores' | 'blogs' | 'pages' | 'events' | 'offers';
  label: string;
  singular: string;
  icon: LucideIcon;
  titleKey: string;
  subtitleKey?: string;
  imageKey?: string;
  /** The record field that mirrors the slug (events & offers use `id`). */
  slugKey: 'slug' | 'id';
  publicUrl?: (slug: string) => string;
  sections: { title: string; fields: Field[] }[];
  blank: () => Record<string, unknown>;
}

const FLOORS = ['Lower Ground Floor', 'Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor']
  .map((f) => ({ value: f, label: f }));

export const MAP_FLOORS = [
  { value: '', label: 'Not on the map' },
  { value: 'lower_ground_floor', label: 'Lower Ground Floor' },
  { value: 'ground_floor', label: 'Ground Floor' },
  { value: 'first_floor', label: '1st Floor' },
  { value: 'second_floor', label: '2nd Floor' },
  { value: 'third_floor', label: '3rd Floor' },
  { value: 'fourth_floor', label: '4th Floor' },
  { value: 'fifth_floor', label: '5th Floor' },
];

const emptyAsset = () => ({ data: { full_url: '', url: '', asset_url: '', thumbnails: [], embed: null } });

export const COLLECTIONS: CollectionDef[] = [
  {
    key: 'stores',
    label: 'Stores',
    singular: 'store',
    icon: Store,
    titleKey: 'name',
    subtitleKey: 'category',
    imageKey: 'logo',
    slugKey: 'slug',
    publicUrl: (s) => `/stores/${s}`,
    blank: () => ({
      name: '', subtitle: '', type: 'retail', featured: false, logo: emptyAsset(), cover: emptyAsset(),
      store_description: '', tags: [], store_gallery: [], mapFloor: '', mapUnits: [], website: null, instagram: null, facebook: null, tiktok: null,
      contact_number: null, operation_hours: '10:00 AM - 8:00 PM', owner: { id: 1 }, created_on: new Date().toISOString(),
    }),
    sections: [
      {
        title: 'Basics',
        fields: [
          { key: 'name', label: 'Store name', type: 'text', required: true },
          { key: 'subtitle', label: 'Tagline', type: 'text', placeholder: 'e.g. Iconic denim & casual wear' },
          { key: 'featured', label: 'Featured store', type: 'toggle', help: 'Featured stores are highlighted in the directory and can be picked for the home page.' },
          { key: 'categorySlug', label: 'Category', type: 'category', help: 'Files the store under a directory filter. Edit the list under Site content → Store categories.' },
          { key: 'store_description', label: 'Description', type: 'textarea' },
          { key: 'tags', label: 'Tags', type: 'tags', help: 'Press Enter after each tag. Used by search.' },
        ],
      },
      {
        title: 'Images',
        fields: [
          { key: 'logo', label: 'Logo', type: 'asset', preset: 'logo', half: true },
          { key: 'cover', label: 'Cover photo', type: 'asset', preset: 'cover', half: true },
          { key: 'store_gallery', label: 'Gallery', type: 'gallery', preset: 'content', help: 'Up to 4 photos show on the store page.' },
        ],
      },
      {
        title: 'Location & hours',
        fields: [
          { key: 'floor', label: 'Floor (as shown on the store page)', type: 'select', options: FLOORS, half: true },
          { key: 'unitNumber', label: 'Unit label', type: 'text', half: true, placeholder: 'e.g. Unit 108, Wing A' },
          { key: 'mapFloor', label: 'Mall map floor', type: 'select', options: MAP_FLOORS, half: true, help: 'Where the store is highlighted on the mall map.' },
          { key: 'mapUnits', label: 'Mall map units', type: 'mapUnits', floorKey: 'mapFloor', help: 'Pick every unit the store occupies. Visitors get directions to it.' },
          { key: 'operation_hours', label: 'Opening hours', type: 'text', half: true },
          { key: 'contact_number', label: 'Phone', type: 'text', half: true },
        ],
      },
      {
        title: 'Links',
        fields: [
          { key: 'website', label: 'Website', type: 'url', half: true },
          { key: 'instagram', label: 'Instagram', type: 'url', half: true },
          { key: 'facebook', label: 'Facebook', type: 'url', half: true },
          { key: 'tiktok', label: 'TikTok', type: 'url', half: true },
        ],
      },
    ],
  },
  {
    key: 'blogs',
    label: 'Blog posts',
    singular: 'post',
    icon: Newspaper,
    titleKey: 'title',
    subtitleKey: 'owner.first_name',
    imageKey: 'cover_image',
    slugKey: 'slug',
    publicUrl: (s) => `/blogs/${s}`,
    blank: () => ({
      title: '', content: '', cover_image: emptyAsset(), created_on: new Date().toISOString(), updated_on: null,
      owner: { id: 1, first_name: '', last_name: '', title: '', company: 'Pokhara Trade Mall' },
    }),
    sections: [
      {
        title: 'Post',
        fields: [
          { key: 'title', label: 'Title', type: 'text', required: true },
          { key: 'cover_image', label: 'Cover image', type: 'asset', preset: 'cover' },
          { key: 'content', label: 'Body', type: 'richtext' },
        ],
      },
      {
        title: 'Byline',
        fields: [
          { key: 'owner.first_name', label: 'Author first name', type: 'text', half: true },
          { key: 'owner.last_name', label: 'Author last name', type: 'text', half: true },
          { key: 'owner.title', label: 'Author role', type: 'text', half: true, placeholder: 'e.g. Lifestyle Editor' },
          { key: 'created_on', label: 'Publish date', type: 'datetime', half: true, help: 'Posts are listed newest first.' },
        ],
      },
    ],
  },
  {
    key: 'events',
    label: 'Events',
    singular: 'event',
    icon: CalendarDays,
    titleKey: 'title',
    subtitleKey: 'date',
    imageKey: 'imageUrl',
    slugKey: 'id',
    publicUrl: () => '/latest#events',
    blank: () => ({ title: '', category: '', date: '', dateBadge: { month: '', day: '' }, time: '', location: '', description: '', fullDescription: '', imageUrl: '', tag: '', featured: false, ticketInfo: '' }),
    sections: [
      {
        title: 'Event',
        fields: [
          { key: 'title', label: 'Title', type: 'text', required: true },
          { key: 'category', label: 'Category', type: 'text', half: true, placeholder: 'e.g. Food & Culture' },
          { key: 'tag', label: 'Badge', type: 'text', half: true, placeholder: 'e.g. This Weekend' },
          { key: 'imageUrl', label: 'Image', type: 'imageUrl', preset: 'content' },
          { key: 'description', label: 'Short description', type: 'textarea', help: 'Shown on the event card.' },
          { key: 'fullDescription', label: 'Full description', type: 'textarea', help: 'Shown when a visitor opens the event.' },
          { key: 'featured', label: 'Feature this event', type: 'toggle' },
        ],
      },
      { title: 'Schedule', fields: SCHEDULE_FIELDS },
      {
        title: 'When & where',
        fields: [
          { key: 'date', label: 'Date text', type: 'text', half: true, placeholder: 'e.g. Aug 28 - Aug 30, 2026' },
          { key: 'time', label: 'Time', type: 'text', half: true, placeholder: 'e.g. 12:00 PM - 9:00 PM' },
          { key: 'dateBadge.month', label: 'Badge month', type: 'text', half: true, placeholder: 'AUG' },
          { key: 'dateBadge.day', label: 'Badge day', type: 'text', half: true, placeholder: '28-30' },
          { key: 'location', label: 'Location', type: 'text' },
          { key: 'ticketInfo', label: 'Ticket info', type: 'text', placeholder: 'e.g. Free entry' },
        ],
      },
    ],
  },
  {
    key: 'offers',
    label: 'Offers',
    singular: 'offer',
    icon: BadgePercent,
    titleKey: 'title',
    subtitleKey: 'storeName',
    imageKey: 'imageUrl',
    slugKey: 'id',
    publicUrl: () => '/latest#offers',
    blank: () => ({ storeName: '', storeCategory: '', storeLogo: '', title: '', discount: '', discountType: 'percentage', promoCode: '', description: '', validUntil: '', terms: '', imageUrl: '', storeLink: '', featured: false, badge: '' }),
    sections: [
      {
        title: 'Offer',
        fields: [
          { key: 'title', label: 'Title', type: 'text', required: true },
          { key: 'discount', label: 'Discount', type: 'text', half: true, placeholder: 'e.g. 30% OFF' },
          {
            key: 'discountType', label: 'Type', type: 'select', half: true,
            options: [
              { value: 'percentage', label: 'Percentage' },
              { value: 'bogo', label: 'Buy one get one' },
              { value: 'voucher', label: 'Voucher' },
              { value: 'combo', label: 'Combo' },
            ],
          },
          { key: 'promoCode', label: 'Promo code', type: 'text', half: true },
          { key: 'badge', label: 'Badge', type: 'text', half: true, placeholder: 'e.g. Limited time' },
          { key: 'validUntil', label: 'Valid until', type: 'text', half: true, placeholder: 'e.g. Sep 30, 2026' },
          { key: 'featured', label: 'Feature this offer', type: 'toggle', half: true },
          { key: 'imageUrl', label: 'Image', type: 'imageUrl', preset: 'content' },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'terms', label: 'Terms', type: 'textarea' },
        ],
      },
      {
        title: 'Store',
        fields: [
          { key: 'storeName', label: 'Store name', type: 'text', half: true },
          { key: 'storeCategory', label: 'Store category', type: 'text', half: true },
          { key: 'storeLink', label: 'Store page link', type: 'text', placeholder: '/stores/levis-store' },
          { key: 'storeLogo', label: 'Store logo', type: 'imageUrl', preset: 'logo' },
        ],
      },
      { title: 'Schedule', fields: SCHEDULE_FIELDS },
    ],
  },
  {
    key: 'pages',
    label: 'Pages',
    singular: 'page',
    icon: FileText,
    titleKey: 'title',
    imageKey: 'cover_image',
    slugKey: 'slug',
    publicUrl: (s) => `/page/${s}`,
    blank: () => ({ title: '', content: '', cover_image: emptyAsset(), gallery: [], owner: { id: 1 }, created_on: new Date().toISOString() }),
    sections: [
      {
        title: 'Page',
        fields: [
          { key: 'title', label: 'Title', type: 'text', required: true },
          { key: 'cover_image', label: 'Cover image', type: 'asset', preset: 'cover' },
          { key: 'content', label: 'Content', type: 'richtext' },
        ],
      },
    ],
  },
];

export const SETTINGS_FIELDS: Field[] = [
  { key: 'phone', label: 'Phone', type: 'text', half: true },
  { key: 'email', label: 'Email', type: 'text', half: true },
  { key: 'address', label: 'Address', type: 'text' },
  { key: 'location_info', label: 'Location details', type: 'textarea', help: 'Shown on the contact page and footer.' },
  { key: 'facebook', label: 'Facebook', type: 'url', half: true },
  { key: 'instagram', label: 'Instagram', type: 'url', half: true },
  { key: 'tiktok', label: 'TikTok', type: 'url', half: true },
  { key: 'twitter', label: 'X / Twitter', type: 'url', half: true },
];

export const collectionByKey = (key?: string) => COLLECTIONS.find((c) => c.key === key);

export function getPath(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

export function setPath<T extends Record<string, any>>(obj: T, path: string, value: unknown): T {
  const keys = path.split('.');
  const next: any = Array.isArray(obj) ? [...obj] : { ...obj };
  let cur = next;
  keys.slice(0, -1).forEach((k) => {
    cur[k] = cur[k] && typeof cur[k] === 'object' ? { ...cur[k] } : {};
    cur = cur[k];
  });
  cur[keys[keys.length - 1]] = value;
  return next;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Resolves the displayable image URL for either image shape. */
export function imageUrlOf(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value?.data?.full_url || value?.data?.url || '';
}

export function toAsset(url: string, thumb?: string | null) {
  return {
    data: {
      full_url: url, url, asset_url: url,
      thumbnails: thumb ? [{ key: 'thumb', url: thumb, relative_url: thumb, dimension: '400', width: 400, height: 400 }] : [],
      embed: null,
    },
  };
}
