/**
 * Field descriptions shared by the public site (block defaults) and the admin panel (editors).
 * One description drives the form, so adding a field to a block makes it editable immediately.
 */
export type ImagePreset = 'logo' | 'cover' | 'content' | 'plan';

export type FieldType =
  | 'text' | 'textarea' | 'richtext' | 'url' | 'number' | 'select' | 'toggle' | 'tags'
  | 'datetime' | 'date' | 'color'
  | 'icon'      // key from src/content/icons.tsx
  | 'asset'     // { data: { full_url, ... } } image object used by stores, blogs, pages
  | 'imageUrl'  // plain image URL string
  | 'gallery'   // store_gallery list
  | 'list'      // repeatable group of `fields`
  | 'category'  // store category slug from the Categories block
  | 'categories' // several category slugs, the first is the main one
  | 'store'     // store slug picker
  | 'mapUnits'; // units (shutters) on the floor chosen in `floorKey`

export interface Field {
  key: string; // dot path into the record
  label: string;
  type: FieldType;
  help?: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  preset?: ImagePreset;
  half?: boolean;
  /** list: the fields of each item */
  fields?: Field[];
  /** list: sub-field used as each item's heading in the editor */
  itemTitle?: string;
  /** list: noun for the add button, e.g. "slide" */
  itemName?: string;
  /** list: starting values for a newly added item */
  itemDefaults?: Record<string, unknown>;
  /** list: maximum number of items */
  max?: number;
  /** mapUnits: sibling key that holds the floor id */
  floorKey?: string;
  /** asset: when empty, preview the store category's icon that the site shows instead */
  categoryFallback?: boolean;
  /** category: limit choices to a sector */
  sector?: string;
}

/** Common scheduling fields for anything time-bound (slides, promos, events). */
export const SCHEDULE_FIELDS: Field[] = [
  { key: 'hidden', label: 'Hide from the website', type: 'toggle', half: true },
  { key: 'showFrom', label: 'Show from', type: 'date', half: true, help: 'Optional. Appears automatically on this day.' },
  { key: 'hideAfter', label: 'Hide after', type: 'date', half: true, help: 'Optional. Disappears automatically after this day.' },
];
