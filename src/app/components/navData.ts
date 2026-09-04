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

export const menuItems: MenuItem[] = [
  {
    label: "What's On",
    href: "/latest",
  },
  {
    label: "Shop",
    href: "/shop",
  },
  {
    label: "Dine",
    href: "/dine",
  },
  {
    label: "Entertain",
    href: "/entertain",
  },
  {
    label: "Services",
    subGroups: [
      {
        title: "Business Directory",
        items: [
          { label: "Beauty & Wellness", href: "/services#beauty" },
          { label: "Banks & Financial Services", href: "/services#finance" },
          { label: "Abroad Study & Education", href: "/services#education" },
          { label: "IT & Software Studios", href: "/services#it-tech" },
          { label: "Health & Fitness", href: "/services#health-fitness" },
          { label: "Engineering & Consultancies", href: "/services#consultancy" },
          { label: "All Services Directory", href: "/services" },
        ],
      },
      {
        title: "Mall Services",
        items: [
          { label: "Mall Map & Wayfinding", href: "/mall-map" },
          { label: "Parking Information", href: "/services#parking" },
          { label: "Contact & Inquiries", href: "/contact" },
        ],
      },
    ],
  },
  {
    label: "About",
    href: "/page/about_us",
  },
];
