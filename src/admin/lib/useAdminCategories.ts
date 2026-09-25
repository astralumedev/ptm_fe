import { useMemo } from 'react';
import { mergeBlock } from '@/content/block';
import { categoriesBlock, Category } from '@/content/blocks/categories';
import { useCollection } from './useCollection';

/** Categories as saved in the CMS (including unpublished edits), for pickers inside the admin. */
export function useAdminCategories() {
  const { items } = useCollection('blocks');
  return useMemo(() => {
    const saved = items?.find((r) => r.slug === categoriesBlock.key)?.data;
    const categories: Category[] = mergeBlock(categoriesBlock, saved).items || [];
    return { categories, find: (slug?: string) => categories.find((c) => c.slug === slug || c.aliases?.includes(slug || '')) };
  }, [items]);
}
