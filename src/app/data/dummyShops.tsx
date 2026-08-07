import { ShopService } from "../interfaces/shopService";

export const categoryData = [
  {
    name: 'Men\'s Fashion',
    subcategories: ['Clothes', 'Shoes', 'Accessories', 'Watches', 'Perfumes', 'Undergarments'],
  },
  {
    name: 'Women\'s Fashion',
    subcategories: ['Clothes', 'Lingerie', 'Accessories', 'Perfumes', 'Ethnic Wear'],
  },
  {
    name: 'Services',
    subcategories: ['Educational Consultancies', 'Financial Services', 'Banks', 'Spa', 'Haircut'],
  },
  {
    name: 'Dining',
    subcategories: ['Cafe', 'Restaurant', 'Drinks', 'Fast Food'],
  },
  {
    name: 'Children',
    subcategories: ['Clothes', 'Parental Accessories', 'Toys'],
  },
];

const storeNames = [
    'Tech Hub', 'Glam Zone', 'Eat Street', 'Style Spot', 'Book Nook', 'Home Haven', 'Active Life', 'Electro World', 'Cosmo Shop', 'Foodies',
    'Trend Setters', 'Page Turner', 'Cozy Corner', 'Sport Central', 'Gadget Galaxy', 'Beauty Bar', 'Dine In', 'Fashion Flair', 'Literary Lane', 'Decor Delights',
    'Fitness First', 'Digital Den', 'Aura Beauty', 'Taste Buds', 'Chic Closet', 'Word Weaver', 'Comfort Zone', 'Game Zone', 'Mobile Mania', 'Radiant You',
    'Spice Route', 'Urban Wear', 'Story Teller', 'Home Sweet Home', 'Adventure Gear', 'Smart Tech', 'Glow Up', 'Flavor Town', 'Dress Code', 'Ink Well',
    'Design Hub', 'Extreme Sports', 'Appliance Ace', 'Skin Bliss', 'Culinary Corner', 'Outfit Outlet', 'Verse Vault', 'Interior Ideas', 'Peak Performance', 'Cellular City',
    'Shine Bright', 'Savor Spot', 'Luxury Look', 'Rhyme Reader', 'Artistic Abode', 'Pro Athlete', 'Wired World', 'Eternal Beauty', 'Grill & Chill', 'Casual Chic',
    'Poetic Place', 'Elegant Living', 'Power Up', 'Connect Zone', 'Fresh Face', 'Munchies', 'Trendy Threads', 'Novel Nest', 'Dream Dwelling', 'Action Sports',
    'Circuit City', 'Pure Skin', 'Bistro Bliss', 'Formal Form', 'Epic Tales', 'Creative Crib', 'Team Spirit', 'Signal Source', 'Natural Glow', 'Feast Fest',
    'Smart Style', 'Classic Reads', 'Modern Maison', 'Outdoor Outlet', 'Byte Barn', 'Healthy Skin', 'Cafe Corner', 'Smart Fashions', 'Epic Stories', 'Decor Dreams',
    'Ultimate Fitness', 'Phone Fix', 'Beauty Secret', 'Global Cuisine', 'Stylish Wardrobe', 'Book Worms', 'Home Innovations', 'Sports Fanatic', 'Digital World', 'Ageless Beauty'
  ];
  
  function generateRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  function generateDummyShops(count: number): ShopService[] {
    return Array.from({ length: count }, (_, index) => {
      const name = generateRandomItem(storeNames) + ' ' + (index + 1);
      const category = generateRandomItem(categoryData);
      const logo = `/stores/dummy_logo_${index % 5 + 1}.png`; // Replace with your dummy logo paths
      const coverImage = `/stores/dummy_cover_${index % 5 + 1}.jpg`; // Replace with your dummy cover image paths
      const excerpt = `A fantastic shop/service in the ${category} category. ${name} offers a wide range of products/services.`;
      const link = `/shop/${name.toLowerCase().replace(/ /g, '-')}`;
      return { id: index + 1, name, categories: [category], logo, coverImage, excerpt, link };
    });
  }
  
  export const dummyShops: ShopService[] = generateDummyShops(100);
  