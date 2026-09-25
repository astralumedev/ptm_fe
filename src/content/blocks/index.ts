import type { BlockDef } from '../block';
import { categoriesBlock } from './categories';
import { homeBlocks } from './home';
import { siteBlocks } from './site';
import { pagesBlocks } from './pages';
import { directoryBlocks } from './directory';
import { latestBlocks } from './latest';
import { mapBlocks } from './map';

/** Every editable site section, in the order the admin lists them. */
export const ALL_BLOCKS: BlockDef<any>[] = [
  ...siteBlocks,
  ...homeBlocks,
  categoriesBlock,
  // shop-type-page belongs to ShopTypePage, which no route renders; listing it would edit nothing.
  ...directoryBlocks.filter((b) => b.key !== 'shop-type-page'),
  ...latestBlocks,
  ...pagesBlocks,
  ...mapBlocks,
];

export const blockByKey = (key?: string) => ALL_BLOCKS.find((b) => b.key === key);
