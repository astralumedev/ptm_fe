import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStore, FaClock, FaMapMarkerAlt, FaChevronRight } from 'react-icons/fa';

interface FeaturedStore {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  categoryType: 'fashion' | 'tech' | 'beauty' | 'crafts' | 'kids';
  floor: string;
  coverUrl: string;
  logoUrl: string;
  hours: string;
  slug: string;
}

const featuredStoresData: FeaturedStore[] = [
  {
    id: 'levis',
    name: "Levi's Store",
    subtitle: 'Official Levi Strauss & Co. Denim & Apparel',
    category: 'Fashion & Apparel',
    categoryType: 'fashion',
    floor: '1st Floor - Wing A',
    coverUrl: '/stores/levis_cover.webp',
    logoUrl: '/stores/levis_logo.avif',
    hours: '10:00 AM - 8:00 PM',
    slug: 'himalayan-outfitters',
  },
  {
    id: 'fone-decor',
    name: 'Fone Decor & Tech',
    subtitle: 'Smartphone Accessories, Gadgets & Repairs',
    category: 'Tech & Mobiles',
    categoryType: 'tech',
    floor: 'Ground Floor - Tech Alley',
    coverUrl: '/stores/fone_decor_cover.jpeg',
    logoUrl: '/stores/fone_decor_logo.jpeg',
    hours: '10:00 AM - 8:00 PM',
    slug: 'tech-gadgets-arcade',
  },
  {
    id: 'obsession',
    name: 'Obsession Cosmetics',
    subtitle: 'International Makeup, Skincare & Fragrances',
    category: 'Beauty & Skincare',
    categoryType: 'beauty',
    floor: '1st Floor - Beauty Hub',
    coverUrl: '/stores/obsession_cosmetics_cover.jpeg',
    logoUrl: '/stores/obsession_logo.png',
    hours: '10:00 AM - 8:00 PM',
    slug: 'aura-luxury-spa',
  },
  {
    id: 'woven',
    name: 'Woven Nepali Handicrafts',
    subtitle: 'Authentic Handwoven Textiles & Himalayan Souvenirs',
    category: 'Local Crafts & Gifts',
    categoryType: 'crafts',
    floor: 'Ground Floor',
    coverUrl: '/stores/woven_cover.jpg',
    logoUrl: '/stores/woven_logo.avif',
    hours: '10:00 AM - 8:00 PM',
    slug: 'machhapuchhre-fashion',
  },
  {
    id: 'dadybird',
    name: 'Dadybird Fashion',
    subtitle: 'Trendy Casual Wear & Family Apparel',
    category: 'Fashion & Kids',
    categoryType: 'fashion',
    floor: '2nd Floor - Wing B',
    coverUrl: '/stores/dadybird_cover.webp',
    logoUrl: '/stores/dadybird_logo.webp',
    hours: '10:00 AM - 8:00 PM',
    slug: 'machhapuchhre-fashion',
  },
  {
    id: 'cube',
    name: 'Cube Gaming & Tech',
    subtitle: 'High-Performance Laptops & Gaming Accessories',
    category: 'Tech & Gaming',
    categoryType: 'tech',
    floor: 'Ground Floor - Tech Hub',
    coverUrl: '/stores/cube_cover.jpg',
    logoUrl: '/stores/cube_logo.png',
    hours: '10:00 AM - 8:00 PM',
    slug: 'tech-gadgets-arcade',
  },
];

const categories = [
  { label: 'All Outlets', value: 'all' },
  { label: 'Fashion & Apparel', value: 'fashion' },
  { label: 'Tech & Mobiles', value: 'tech' },
  { label: 'Beauty & Skincare', value: 'beauty' },
  { label: 'Crafts & Gifts', value: 'crafts' },
];

export default function FeaturedStoresSection() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredStores = activeCategory === 'all'
    ? featuredStoresData
    : featuredStoresData.filter((s) => s.categoryType === activeCategory);

  return (
    <section className="w-full py-16 md:py-24 bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#c22328] font-bold block mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            RETAIL DIRECTORY
          </span>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-wider mb-4"
            style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
          >
            FEATURED STORES
          </h2>
          <div className="w-24 h-1 bg-[#c22328] mx-auto rounded-full mb-4" />
          <p className="text-gray-600 text-sm md:text-base leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Explore top international brands, local artisan boutiques, tech shops, and lifestyle outlets all under one roof at Pokhara Trade Mall.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300 cursor-pointer ${
                activeCategory === cat.value
                  ? 'bg-[#760316] text-white shadow-md scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStores.map((store, index) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              {/* Cover Image Container */}
              <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                <img
                  src={store.coverUrl}
                  alt={store.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                
                {/* Category Badge */}
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-[#760316] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                  {store.category}
                </span>

                {/* Floor Badge */}
                <span className="absolute bottom-4 left-4 text-white text-xs font-medium flex items-center bg-black/50 backdrop-blur-md px-3 py-1 rounded-md">
                  <FaMapMarkerAlt className="w-3 h-3 mr-1.5 text-red-400" />
                  {store.floor}
                </span>

                {/* Store Logo Circle */}
                <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md bg-white p-0.5 flex items-center justify-center">
                  <img
                    src={store.logoUrl}
                    alt={`${store.name} logo`}
                    className="object-contain w-full h-full rounded-full"
                  />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <div>
                  <h3
                    className="text-xl font-bold text-gray-900 group-hover:text-[#760316] transition-colors mb-1 tracking-wide"
                    style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                  >
                    {store.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mb-3 leading-relaxed">
                    {store.subtitle}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center">
                    <FaClock className="w-3 h-3 mr-1.5 text-gray-400" />
                    {store.hours}
                  </span>
                  
                  <Link
                    to={`/shops/details/${store.slug}`}
                    className="inline-flex items-center text-xs font-semibold text-[#760316] hover:text-[#c22328] group/btn transition-colors"
                  >
                    Explore
                    <FaChevronRight className="w-2.5 h-2.5 ml-1 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Stores CTA */}
        <div className="mt-14 text-center">
          <Link
            to="/page/business"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-[#760316] hover:bg-[#5a0211] text-white text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 group"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <FaStore className="w-4 h-4 mr-2" />
            View Complete Mall Directory
            <FaChevronRight className="w-3 h-3 ml-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </section>
  );
}
