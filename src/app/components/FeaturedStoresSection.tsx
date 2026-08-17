import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';

interface FeaturedStore {
  id: string;
  name: string;
  category: string;
  floor: string;
  coverUrl: string;
  slug: string;
  colSpanClass: string;
  heightClass: string;
}

const featuredStoresData: FeaturedStore[] = [
  // Row 1: 1-span + 2-span (Mirrored layout for subtle distinction from Dine)
  {
    id: 'levis',
    name: "LEVI'S STORE",
    category: 'Fashion & Apparel',
    floor: '1st Floor - Wing A',
    coverUrl: '/stores/levis_cover.webp',
    slug: 'himalayan-outfitters',
    colSpanClass: 'md:col-span-1',
    heightClass: 'h-64 sm:h-72 lg:h-80',
  },
  {
    id: 'fone-decor',
    name: 'FONE DECOR & TECH',
    category: 'Tech & Mobiles',
    floor: 'Ground Floor - Tech Alley',
    coverUrl: '/stores/fone_decor_cover.jpeg',
    slug: 'tech-gadgets-arcade',
    colSpanClass: 'md:col-span-2',
    heightClass: 'h-64 sm:h-72 lg:h-80',
  },
  // Row 2: 1-span + 1-span + 1-span
  {
    id: 'obsession',
    name: 'OBSESSION COSMETICS',
    category: 'Beauty & Skincare',
    floor: '1st Floor - Beauty Hub',
    coverUrl: '/stores/obsession_cosmetics_cover.jpeg',
    slug: 'aura-luxury-spa',
    colSpanClass: 'md:col-span-1',
    heightClass: 'h-56 sm:h-64 lg:h-72',
  },
  {
    id: 'woven',
    name: 'WOVEN NEPALI HANDICRAFTS',
    category: 'Local Crafts & Gifts',
    floor: 'Ground Floor Main Atrium',
    coverUrl: '/stores/woven_cover.jpg',
    slug: 'machhapuchhre-fashion',
    colSpanClass: 'md:col-span-1',
    heightClass: 'h-56 sm:h-64 lg:h-72',
  },
  {
    id: 'dadybird',
    name: 'DADYBIRD FASHION',
    category: 'Fashion & Kids',
    floor: '2nd Floor - Wing B',
    coverUrl: '/stores/dadybird_cover.webp',
    slug: 'machhapuchhre-fashion',
    colSpanClass: 'md:col-span-1',
    heightClass: 'h-56 sm:h-64 lg:h-72',
  },
  // Row 3: 2-span + 1-span
  {
    id: 'cube',
    name: 'CUBE GAMING & TECH',
    category: 'Tech & Gaming',
    floor: 'Ground Floor - Tech Alley',
    coverUrl: '/stores/cube_cover.jpg',
    slug: 'tech-gadgets-arcade',
    colSpanClass: 'md:col-span-2',
    heightClass: 'h-64 sm:h-72 lg:h-80',
  },
  {
    id: 'malabar',
    name: 'MALABAR GOLD & DIAMONDS',
    category: 'Jewelry & Watches',
    floor: 'Ground Floor Plaza',
    coverUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
    slug: 'himalayan-outfitters',
    colSpanClass: 'md:col-span-1',
    heightClass: 'h-64 sm:h-72 lg:h-80',
  },
];

export default function FeaturedStoresSection() {
  return (
    <section className="w-full py-12 md:py-20 bg-white">
      <div className="container mx-auto px-3 sm:px-6">
        
        {/* Heading Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6 text-center md:text-left">
          {/* Title & Description */}
          <div className="max-w-3xl text-center md:text-left mx-auto md:mx-0">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-medium text-gray-900 tracking-wider mb-2 uppercase"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              SHOP
            </h2>
            <div className="w-12 md:w-16 h-0.5 bg-[#801424]/60 rounded-full mb-3 mx-auto md:mx-0" />
            <p
              className="text-gray-600 text-sm md:text-base leading-relaxed mt-2"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Pokhara Trade Mall is your one-stop destination for an expansive selection of the best brands in clothing, fashion accessories, beauty, home collections, interiors and more. With its fashion-forward collection and eclectic pop-up shops, Pokhara Trade Mall delivers a dynamic shopping experience that will make you come back for more.
            </p>
          </div>

          {/* Right Aligned Controls: See All Link */}
          <div className="flex-shrink-0 self-center md:self-end pb-1">
            <Link
              to="/shops/retail"
              className="inline-flex items-center gap-2 text-base md:text-lg font-medium text-gray-900 hover:text-[#801424] transition-colors group whitespace-nowrap !no-underline hover:!no-underline focus:!no-underline"
              style={{ fontFamily: "'Montserrat', sans-serif", textDecoration: 'none' }}
            >
              <span>See All</span>
              <FaArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5 duration-300" />
            </Link>
          </div>
        </div>

        {/* 3-Row Grid Layout for SHOP: [1-span][2-span] / [1-span][1-span][1-span] / [2-span][1-span] */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {featuredStoresData.map((store, index) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              viewport={{ once: true }}
              className={`w-full ${store.colSpanClass}`}
            >
              <Link
                to={`/shops/details/${store.slug}`}
                className="group relative block w-full overflow-hidden rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between !no-underline"
                style={{ textDecoration: 'none' }}
              >
                {/* Cover Image Container */}
                <div className={`relative w-full ${store.heightClass} overflow-hidden bg-gray-100`}>
                  <img
                    src={store.coverUrl}
                    alt={store.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
                  />

                  {/* Top-Right Location Badge */}
                  <span className="absolute top-3 right-3 text-[10px] font-semibold text-gray-800 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs border border-gray-200/60 flex items-center">
                    <FaMapMarkerAlt className="w-2.5 h-2.5 mr-1 text-[#801424]" />
                    {store.floor}
                  </span>
                </div>

                {/* Light-Mode Store Card Details Footer */}
                <div className="p-5 md:p-6 bg-white flex flex-col justify-between text-left" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-[#801424] font-bold block mb-1">
                      {store.category}
                    </span>
                    <h3
                      className="text-lg md:text-xl font-semibold text-gray-900 group-hover:text-[#801424] transition-colors uppercase tracking-wider leading-snug !no-underline hover:!no-underline"
                      style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif", textDecoration: 'none' }}
                    >
                      {store.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#801424] font-semibold">
                    <span>Explore Outlet</span>
                    <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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






