import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUtensils, FaMapMarkerAlt, FaChevronRight } from 'react-icons/fa';

interface DiningSpot {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  floor: string;
  hours: string;
  description: string;
  highlights: string[];
  coverUrl: string;
  logoUrl: string;
  slug: string;
}

const diningSpotsData: DiningSpot[] = [
  {
    id: 'himalayan-java',
    name: 'Himalayan Java Coffee',
    subtitle: 'Specialty Coffee Roasters & Bakery',
    category: 'Cafe & Bakery',
    floor: 'Ground Floor Plaza',
    hours: '07:30 AM - 09:00 PM',
    description: "Nepal's pioneer specialty coffee brand serving organic Himalayan espresso blends, cold brews, fresh muffins, and artisan cheesecake.",
    highlights: ['Artisan Coffee', 'Fresh Bakery', 'Cozy Ambiance'],
    coverUrl: '/stores/himalayan_java_cover.jpg',
    logoUrl: '/stores/himalayan_java_logo.png',
    slug: 'fewa-lakeside-bistro',
  },
  {
    id: 'mantra-thakali',
    name: 'Mantra Thakali & Bar',
    subtitle: 'Authentic Mustang Thakali & Fine Drinks',
    category: 'Nepali Ethnic Dining',
    floor: '3rd Floor Food Court',
    hours: '10:30 AM - 10:00 PM',
    description: 'Serving authentic Thakali thali with Mustang jimbu butter, organic black lentils, mutton curry, dhido, and curated cocktails.',
    highlights: ['Mustang Thakali', 'Organic Ingredients', 'Family Dining'],
    coverUrl: '/stores/mantra_thakali_cover.jpg',
    logoUrl: '/stores/mantra_logo.jpg',
    slug: 'pokhara-food-court',
  },
  {
    id: 'fewa-bistro',
    name: 'Fewa Lakeside Bistro',
    subtitle: 'Wood-fired Pizza, Pastas & Artisan Drinks',
    category: 'Continental & Bistro',
    floor: '1st Floor Terrace',
    hours: '08:00 AM - 09:30 PM',
    description: 'Enjoy handcrafted wood-fired pizzas, creamy pasta dishes, gourmet burgers, and fresh smoothie bowls with outdoor terrace seating.',
    highlights: ['Wood-fired Pizza', 'Terrace Seating', 'Smoothie Bowls'],
    coverUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80',
    slug: 'fewa-lakeside-bistro',
  },
  {
    id: 'food-court-express',
    name: 'Pokhara Food Court Express',
    subtitle: 'Multi-Cuisine Dining & Quick Bites',
    category: 'Food Court & Fast Casual',
    floor: '3rd Floor Main Atrium',
    hours: '10:00 AM - 09:30 PM',
    description: 'Spacious food hall hosting 10+ culinary stations offering juicy Momo varieties, Indian tandoori platters, Chinese wok, and gelato desserts.',
    highlights: ['10+ Cuisine Counters', 'Spacious Seating', 'Fast Service'],
    coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
    slug: 'pokhara-food-court',
  },
];

export default function DineSection() {
  return (
    <section className="w-full py-16 md:py-24 bg-amber-50/40 border-t border-amber-100">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-amber-700 font-bold block mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            CAFES & RESTAURANTS
          </span>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-wider mb-4"
            style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
          >
            DINE & FLAVORS
          </h2>
          <div className="w-24 h-1 bg-amber-600 mx-auto rounded-full mb-4" />
          <p className="text-gray-600 text-sm md:text-base leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Treat your palate to a culinary journey at Pokhara Trade Mall! From traditional Nepali Thakali to specialty coffee and continental wood-fired eats.
          </p>
        </div>

        {/* Dining Spots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {diningSpotsData.map((spot, index) => (
            <motion.div
              key={spot.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="group bg-white rounded-2xl overflow-hidden border border-amber-200/60 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row"
            >
              {/* Cover Image */}
              <div className="relative w-full sm:w-2/5 h-56 sm:h-auto overflow-hidden bg-gray-100">
                <img
                  src={spot.coverUrl}
                  alt={spot.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent sm:hidden" />
                
                {/* Category Badge */}
                <span className="absolute top-3 left-3 bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">
                  {spot.category}
                </span>

                {/* Logo Circle */}
                <div className="absolute bottom-3 right-3 w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-md bg-white p-0.5 flex items-center justify-center">
                  <img
                    src={spot.logoUrl}
                    alt={`${spot.name} logo`}
                    className="object-contain w-full h-full rounded-full"
                  />
                </div>
              </div>

              {/* Info Body */}
              <div className="p-6 sm:w-3/5 flex flex-col justify-between" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <div>
                  <h3
                    className="text-xl font-bold text-gray-900 group-hover:text-amber-700 transition-colors mb-1 tracking-wide"
                    style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                  >
                    {spot.name}
                  </h3>
                  <p className="text-xs text-amber-800 font-medium mb-3">
                    {spot.subtitle}
                  </p>
                  
                  <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-3">
                    {spot.description}
                  </p>

                  {/* Highlights Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {spot.highlights.map((hl, i) => (
                      <span key={i} className="text-[11px] bg-amber-100/70 text-amber-900 px-2.5 py-0.5 rounded-full font-medium">
                        {hl}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500 flex items-center">
                    <FaMapMarkerAlt className="w-3 h-3 mr-1 text-amber-600" />
                    {spot.floor}
                  </span>

                  <Link
                    to={`/shops/details/${spot.slug}`}
                    className="inline-flex items-center font-semibold text-amber-700 hover:text-amber-900 transition-colors"
                  >
                    <span>View Menu</span>
                    <FaChevronRight className="w-2.5 h-2.5 ml-1" />
                  </Link>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

        {/* Explore All Dining CTA */}
        <div className="mt-14 text-center">
          <Link
            to="/page/business"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 group"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <FaUtensils className="w-4 h-4 mr-2" />
            Explore All Cafes & Food Outlets
            <FaChevronRight className="w-3 h-3 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </section>
  );
}
