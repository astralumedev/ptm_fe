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
    subGroups: [
      {
        items: [
          { label: "Latest", href: "/blogs" },
          { label: "Events", href: "/page/events" },
          { label: "Offers", href: "/page/offers" },
        ],
      },
    ],
  },
  {
    label: "Shop",
    subGroups: [
      {
        items: [
          { label: "Women's Fashion", href: "/shops/retail?category=womens-fashion" },
          { label: "Men's Fashion", href: "/shops/retail?category=mens-fashion" },
          { label: "Women's Accessories", href: "/shops/retail?category=womens-accessories" },
          { label: "Men's Accessories", href: "/shops/retail?category=mens-accessories" },
          { label: "Directory", href: "/shops/retail" },
        ],
      },
    ],
  },
  {
    label: "Dine",
    subGroups: [
      {
        items: [
          { label: "Cafe", href: "/shops/eatery?category=cafe" },
          { label: "Restaurant", href: "/shops/eatery?category=restaurant" },
          { label: "Fast Food", href: "/shops/eatery?category=fast-food" },
          { label: "Directory", href: "/shops/eatery" },
        ],
      },
    ],
  },
  {
    label: "Entertain",
    subGroups: [
      {
        items: [
          { label: "QFX Cinema", href: "/page/qfx" },
          { label: "4D Game Zone", href: "/page/4d_game_zone" },
        ],
      },
    ],
  },
  {
    label: "Services",
    subGroups: [
      {
        title: "Business Directory",
        items: [
          { label: "Beauty & Wellness", href: "/shops/service?category=beauty" },
          { label: "Educational Institutes", href: "/shops/service?category=education" },
          { label: "Professional Consultancies", href: "/shops/service?category=consultancy" },
        ],
      },
      {
        title: "Mall Services",
        items: [
          { label: "Mall Information", href: "/page/info" },
          { label: "Parking", href: "/page/parking" },
          { label: "Contact Us", href: "/contact" },
        ],
      },
    ],
  },
  {
    label: "About",
    href: "/page/about_us",
  },
];
