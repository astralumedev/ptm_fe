export interface MallEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  dateBadge: {
    month: string;
    day: string;
  };
  time: string;
  location: string;
  description: string;
  fullDescription?: string;
  imageUrl: string;
  tag: string;
  featured?: boolean;
  ticketInfo?: string;
}

export interface MallOffer {
  id: string;
  storeName: string;
  storeCategory: string;
  storeLogo?: string;
  title: string;
  discount: string;
  discountType: 'percentage' | 'bogo' | 'voucher' | 'combo';
  promoCode?: string;
  description: string;
  validUntil: string;
  terms: string;
  imageUrl: string;
  storeLink: string;
  featured?: boolean;
  badge?: string;
}

export const mockEvents: MallEvent[] = [
  {
    id: 'thakali-wine-fest',
    title: 'Mustang Thakali Food & Artisan Wine Fest 2026',
    category: 'Food & Culture',
    date: 'Aug 28 - Aug 30, 2026',
    dateBadge: {
      month: 'AUG',
      day: '28-30',
    },
    time: '12:00 PM - 9:00 PM',
    location: 'PTM Rooftop Terrace & Sky Garden (5th Floor)',
    description: 'Immerse yourself in authentic Himalayan Thakali cuisine, local Mustang apple cider, artisanal fruit wines, and live acoustic folk music.',
    fullDescription: 'Join us for a 3-day celebration of authentic mountain delicacies prepared by master Thakali chefs from Mustang. Sample traditional buckwheat dhido, organic Jimbu-tempered lentils, sukuti skewers, and Mustang Marpha fruit wines with panoramic views of the Annapurna range.',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    tag: 'This Weekend',
    featured: true,
    ticketInfo: 'Free Entry • Food Stalls A La Carte',
  },
  {
    id: 'qfx-laser-premiere',
    title: 'QFX Cinemas 4K Laser Sound Immersion Night',
    category: 'Entertainment',
    date: 'Sep 05, 2026',
    dateBadge: {
      month: 'SEP',
      day: '05',
    },
    time: '6:30 PM - 10:30 PM',
    location: 'QFX Cineplex (Level 4, Screen 2)',
    description: 'Experience Hollywood and Nepali blockbuster premieres with cutting-edge 4K Laser projection and Dolby Atmos 64-channel immersive sound.',
    fullDescription: 'Celebrate the grand upgrade of QFX Screen 2 with red carpet arrivals, complimentary gourmet popcorn combos, movie trivia contests, and the special advance premiere screening of the season’s most anticipated blockbuster.',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    tag: 'Special Premiere',
    featured: true,
    ticketInfo: 'Tickets via QFX App & PTM Counter',
  },
  {
    id: 'acoustic-weekend-sessions',
    title: 'Live Courtyard Acoustic Sessions & Coffee Jam',
    category: 'Live Music',
    date: 'Every Friday & Saturday',
    dateBadge: {
      month: 'SEP',
      day: 'FRI-SAT',
    },
    time: '5:00 PM - 8:00 PM',
    location: 'Central Ground Floor Atrium',
    description: 'Unwind your weekend evenings with soulful live acoustic sets from local Pokhara indie artists, specialty barista popups, and open mic jams.',
    fullDescription: 'Relax and sip on freshly brewed organic Nepali coffee while talented acoustic guitarists and vocalists perform classic rock, blues, and contemporary Nepali melodies in our spacious skylit atrium.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    tag: 'Weekly Happening',
    featured: false,
    ticketInfo: 'Free Admission • Open to All',
  },
  {
    id: 'vr-game-expo',
    title: 'Junior Creators Robotics & VR Gaming Championship',
    category: 'Kids & Family',
    date: 'Sep 18 - Sep 20, 2026',
    dateBadge: {
      month: 'SEP',
      day: '18-20',
    },
    time: '11:00 AM - 6:00 PM',
    location: '4D Game Zone & Family Fun Arena (Level 4)',
    description: 'An action-packed gaming weekend with multiplayer VR tournaments, STEM robotics demonstrations, and arcade prize challenges for children and teens.',
    fullDescription: 'Compete in motion-simulator VR racing, laser shooting challenges, and robotic maze navigation. Exciting prizes, shopping gift vouchers, and medals awarded to tournament winners every evening!',
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80',
    tag: 'Family Fun',
    featured: false,
    ticketInfo: 'Free Registration at Game Zone Desk',
  },
  {
    id: 'autumn-bridal-runway',
    title: 'Pokhara Autumn Fashion Week & Bridal Showcase',
    category: 'Fashion & Style',
    date: 'Sep 26, 2026',
    dateBadge: {
      month: 'SEP',
      day: '26',
    },
    time: '4:00 PM - 7:30 PM',
    location: 'Main Atrium Runway Stage',
    description: 'Explore the latest festive wear, silk sarees, designer lehengas, and contemporary western styles curated by PTM fashion boutiques.',
    fullDescription: 'A glamourous runway showcase featuring premier bridal and festive collections from leading clothing brands and jewelers housed at Pokhara Trade Mall, complemented by makeup masterclasses from Aura Wellness.',
    imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80',
    tag: 'Exclusive Runway',
    featured: false,
    ticketInfo: 'VIP Reserved & Free Public Viewing',
  },
];

export const mockOffers: MallOffer[] = [
  {
    id: 'offer-festive-fashion',
    storeName: 'Zara & Urban Attire',
    storeCategory: "Fashion & Apparel",
    title: 'Festive Season Wardrobe Sale: Up to 50% Off',
    discount: 'UP TO 50% OFF',
    discountType: 'percentage',
    promoCode: 'FESTIVE50',
    description: 'Refresh your wardrobe with huge savings on western apparel, autumn jackets, denim, and trendy accessories.',
    validUntil: 'Valid until Sep 30, 2026',
    terms: 'Valid on select autumn-winter collections. Cannot be clubbed with other clearance vouchers.',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    storeLink: '/shops/retail?category=womens-fashion',
    featured: true,
    badge: 'Popular',
  },
  {
    id: 'offer-thakali-feast',
    storeName: 'PTM Royal Thakali Kitchen',
    storeCategory: 'Dining & Eatery',
    title: 'Himalayan Thali Special: Free Dessert & Beverage',
    discount: 'FREE DESSERT',
    discountType: 'voucher',
    promoCode: 'THAKALIROYAL',
    description: 'Enjoy a complimentary traditional Sikarni dessert and Mustang herbal iced tea with every order of 2 or more Royal Thali sets.',
    validUntil: 'Valid until Oct 15, 2026',
    terms: 'Dine-in only at 4th Floor Food Court. Present coupon code before placing your order.',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    storeLink: '/shops/eatery?category=restaurant',
    featured: true,
    badge: 'Trending Food',
  },
  {
    id: 'offer-qfx-movie-combo',
    storeName: 'QFX Cinemas Pokhara',
    storeCategory: 'Entertainment & Cinema',
    title: 'Tuesday Blockbuster Movie Combo Deal',
    discount: 'Rs. 650 COMBO',
    discountType: 'combo',
    promoCode: 'QFXTUESDAY',
    description: 'Get 2 Movie Tickets + 1 Large Caramel Popcorn + 2 Soft Drinks for only Rs. 650 on all Tuesday afternoon and evening showtimes.',
    validUntil: 'Valid all Tuesdays throughout 2026',
    terms: 'Valid for standard 2D/3D screenings on Tuesdays. Not applicable on official public holidays.',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    storeLink: '/page/qfx',
    featured: false,
    badge: 'Movie Special',
  },
  {
    id: 'offer-java-coffee-bogo',
    storeName: 'Himalayan Java Coffee Bar',
    storeCategory: 'Cafe & Beverages',
    title: 'Morning Brew Boost: Buy 1 Get 1 Free',
    discount: 'BUY 1 GET 1',
    discountType: 'bogo',
    promoCode: 'JAVAMORNING',
    description: 'Order any regular or large artisanal espresso, cappuccino, or iced latte before 11:30 AM and get the second drink on the house!',
    validUntil: 'Valid until Sep 25, 2026',
    terms: 'Applicable Monday to Friday 9:00 AM - 11:30 AM. Equal or lesser value item free.',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    storeLink: '/shops/eatery?category=cafe',
    featured: true,
    badge: 'Morning Deal',
  },
  {
    id: 'offer-aura-spa',
    storeName: 'Aura Luxury Spa & Salon',
    storeCategory: 'Beauty & Wellness',
    title: 'Deep Relaxation Package: Flat 25% Off',
    discount: 'FLAT 25% OFF',
    discountType: 'percentage',
    promoCode: 'AURAGLOW25',
    description: 'Pamper yourself with rejuvenating Ayurvedic herbal massage, deep cleansing facial, and hair therapy by expert certified specialists.',
    validUntil: 'Valid until Oct 05, 2026',
    terms: 'Prior appointment recommended. Applicable on total billing exceeding Rs. 2,500.',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    storeLink: '/shops/service?category=beauty',
    featured: false,
    badge: 'Wellness',
  },
  {
    id: 'offer-gadget-tech',
    storeName: 'TechVibe Gadgets & Audio',
    storeCategory: 'Electronics & Accessories',
    title: 'Mega Tech Clearance: Up to 35% Off Audio Gear',
    discount: 'UP TO 35% OFF',
    discountType: 'percentage',
    promoCode: 'TECHVIBE35',
    description: 'Upgrade your sound with huge discounts on noise-cancelling wireless headphones, Bluetooth speakers, and smartwatch accessories.',
    validUntil: 'Valid while stocks last',
    terms: 'Includes official 1-year warranty on all brand items. Cash & card payments accepted.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    storeLink: '/shops/retail',
    featured: false,
    badge: 'Electronics',
  },
];
