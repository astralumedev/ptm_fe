import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';

interface DiningSpot {
  id: string;
  name: string;
  category: string;
  floor: string;
  coverUrl: string;
  slug: string;
  colSpanClass: string;
  heightClass: string;
}

const diningSpotsData: DiningSpot[] = [
  // Row 1: 2-span + 1-span
  {
    id: 'himalayan-java',
    name: 'HIMALAYAN JAVA COFFEE',
    category: 'Specialty Coffee & Bakery',
    floor: 'Ground Floor Plaza',
    coverUrl: '/stores/himalayan_java_cover.jpg',
    slug: 'fewa-lakeside-bistro',
    colSpanClass: 'md:col-span-2',
    heightClass: 'h-64 sm:h-72 lg:h-80',
  },
  {
    id: 'mantra-thakali',
    name: 'MANTRA THAKALI & BAR',
    category: 'Nepali Ethnic Dining',
    floor: '3rd Floor Food Court',
    coverUrl: '/stores/mantra_thakali_cover.jpg',
    slug: 'pokhara-food-court',
    colSpanClass: 'md:col-span-1',
    heightClass: 'h-64 sm:h-72 lg:h-80',
  },
  // Row 2: 1-span + 1-span + 1-span
  {
    id: 'fewa-bistro',
    name: 'FEWA LAKESIDE BISTRO',
    category: 'Wood-fired Pizza & Bistro',
    floor: '1st Floor Terrace',
    coverUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    slug: 'fewa-lakeside-bistro',
    colSpanClass: 'md:col-span-1',
    heightClass: 'h-56 sm:h-64 lg:h-72',
  },
  {
    id: 'food-court-express',
    name: 'POKHARA FOOD COURT',
    category: 'Multi-Cuisine Food Hall',
    floor: '3rd Floor Main Atrium',
    coverUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    slug: 'pokhara-food-court',
    colSpanClass: 'md:col-span-1',
    heightClass: 'h-56 sm:h-64 lg:h-72',
  },
  {
    id: 'rooftop-lounge',
    name: 'ANNAPURNA ROOFTOP LOUNGE',
    category: 'Craft Cocktails & Grills',
    floor: 'Rooftop Level',
    coverUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
    slug: 'pokhara-food-court',
    colSpanClass: 'md:col-span-1',
    heightClass: 'h-56 sm:h-64 lg:h-72',
  },
  // Row 3: 1-span + 2-span
  {
    id: 'momo-house',
    name: 'HIMALAYAN MOMO HOUSE',
    category: 'Authentic Dumplings & Snacks',
    floor: '3rd Floor Food Court',
    coverUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    slug: 'pokhara-food-court',
    colSpanClass: 'md:col-span-1',
    heightClass: 'h-64 sm:h-72 lg:h-80',
  },
  {
    id: 'lakeside-bakery',
    name: 'LAKESIDE BAKERY & CREPERIE',
    category: 'French Pastries & Waffles',
    floor: 'Ground Floor Wing B',
    coverUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    slug: 'fewa-lakeside-bistro',
    colSpanClass: 'md:col-span-2',
    heightClass: 'h-64 sm:h-72 lg:h-80',
  },
];

export default function DineSection() {
  return (
    <section className="w-full py-12 md:py-20 bg-[#faf8f6] border-t border-amber-100/60">
      <div className="container mx-auto px-3 sm:px-6">
        
        {/* Heading Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6 text-center md:text-left">
          {/* Title & Description */}
          <div className="max-w-3xl text-center md:text-left mx-auto md:mx-0">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-medium text-gray-900 tracking-wider mb-2 uppercase"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              DINE & FLAVORS
            </h2>
            <div className="w-12 md:w-16 h-0.5 bg-[#801424]/60 rounded-full mb-3 mx-auto md:mx-0" />
            <p
              className="text-gray-600 text-sm md:text-base leading-relaxed mt-2"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Treat your palate to a culinary journey at Pokhara Trade Mall! From traditional Mustang Thakali to specialty coffee roasters, authentic Neapolitan pizzas, and multi-cuisine food courts.
            </p>
          </div>

          {/* Right Aligned Controls: See All Link */}
          <div className="flex-shrink-0 self-center md:self-end pb-1">
            <Link
              to="/shops/eatery"
              className="inline-flex items-center gap-2 text-base md:text-lg font-medium text-gray-900 hover:text-[#801424] transition-colors group whitespace-nowrap !no-underline hover:!no-underline focus:!no-underline"
              style={{ fontFamily: "'Montserrat', sans-serif", textDecoration: 'none' }}
            >
              <span>See All</span>
              <FaArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5 duration-300" />
            </Link>
          </div>
        </div>

        {/* Requested 3-Row Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {diningSpotsData.map((spot, index) => (
            <motion.div
              key={spot.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              viewport={{ once: true }}
              className={`w-full ${spot.colSpanClass}`}
            >
              <Link
                to={`/shops/details/${spot.slug}`}
                className="group relative block w-full overflow-hidden rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer !no-underline"
                style={{ textDecoration: 'none' }}
              >
                <div className={`relative w-full ${spot.heightClass} overflow-hidden bg-gray-900`}>
                  {/* Cover Image */}
                  <img
                    src={spot.coverUrl}
                    alt={spot.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out opacity-90 group-hover:opacity-100"
                  />

                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/90 group-hover:via-black/40" />

                  {/* Location Badge (Top Right) */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center text-[10px] font-medium text-white/90 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
                      <FaMapMarkerAlt className="w-2.5 h-2.5 mr-1 text-amber-400" />
                      {spot.floor}
                    </span>
                  </div>

                  {/* Z-Axis Text Overlay (Name & Category on Image) */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 flex flex-col justify-end z-10 text-left">
                    <span
                      className="text-[11px] uppercase tracking-widest text-amber-300 font-bold mb-1 drop-shadow-xs !no-underline"
                      style={{ fontFamily: "'Montserrat', sans-serif", textDecoration: 'none' }}
                    >
                      {spot.category}
                    </span>

                    <h3
                      className="text-lg md:text-xl font-semibold text-white uppercase tracking-wider leading-snug group-hover:text-amber-100 transition-colors drop-shadow-sm !no-underline hover:!no-underline"
                      style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif", textDecoration: 'none' }}
                    >
                      {spot.name}
                    </h3>

                    {/* Explore Link on Hover */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-amber-300/90 group-hover:text-amber-300 transition-all transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-300">
                      <span>Explore Outlet</span>
                      <FaArrowRight className="w-3 h-3 text-amber-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}





