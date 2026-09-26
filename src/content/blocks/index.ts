import type { BlockDef } from '../block';
import { categoriesBlock } from './categories';
import { homeBlocks } from './home';
import { siteBlocks } from './site';
import { pagesBlocks } from './pages';
import { directoryBlocks } from './directory';
import { latestBlocks } from './latest';
import { mapBlocks } from './map';
import { seoBlock, notFoundBlock } from './seo';
import { promotionBlocks } from './promotions';

/** Every editable site section, in the order the admin lists them. */
export const ALL_BLOCKS: BlockDef<any>[] = [
  ...siteBlocks,
  ...promotionBlocks,
  ...homeBlocks,
  categoriesBlock,
  // shop-type-page belongs to ShopTypePage, which no route renders; listing it would edit nothing.
  ...directoryBlocks.filter((b) => b.key !== 'shop-type-page'),
  ...latestBlocks,
  ...pagesBlocks,
  ...mapBlocks,
  seoBlock,
  notFoundBlock,
];

export const blockByKey = (key?: string) => ALL_BLOCKS.find((b) => b.key === key);
