import { useMemo } from 'react';
import { useSiteNav } from '@/content/blocks/site';

export interface SubMenuItem {
  label: string;
  href: string;
}

export interface SubMenuGroup {
  title?: string;
  items: SubMenuItem[];
}

export interface MenuItem {
  label: string;
  href?: string;
  subGroups?: SubMenuGroup[];
}

/** Main menu from the "Main menu & logo" CMS block (site-nav). */
export function useMenuItems(): MenuItem[] {
  const { items } = useSiteNav();
  return useMemo(
    () =>
      (items || [])
        .filter((i) => i && i.label && !i.hidden)
        .map((i) => {
          const groups = (i.groups || [])
            .map((g) => ({ title: g.title || undefined, items: (g.links || []).filter((l) => l && l.label) }))
            .filter((g) => g.items.length > 0);
          return groups.length ? { label: i.label, subGroups: groups } : { label: i.label, href: i.href };
        }),
    [items],
  );
}
