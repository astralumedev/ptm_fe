import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaMapMarkerAlt,
  FaClock,
  FaArrowRight,
  FaTshirt,
  FaLaptop,
  FaSpa,
  FaGem,
  FaGift,
  FaSearch,
  FaCompass,
  FaChild,
  FaMountain,
  FaShoppingBag,
} from 'react-icons/fa';
import NavigationBar from '../app/components/NavigationBar';
import PageHeader from '../app/components/PageHeader';
import Footer from '../app/components/Footer';
import api from '../services/api';
import { Store } from '../data/models/Store';

interface ShopCategoryTile {
  id: string;
  name: string;
  categorySlug: string;
  tagline: string;
  description: string;
  image: string;
  icon: React.ReactNode;
  storeCount: number;
}

export default function ShopPage() {
  const [featuredStores, setFeaturedStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await api.getStores({
          filter: { status: 'published', type: 'retail', featured: true },
        });
        setFeaturedStores(response.data || []);
      } catch (err) {
        console.error('Error fetching featured shop stores:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const categoryTiles: ShopCategoryTile[] = [
    {
      id: 'womens-fashion',
      name: "Women's Fashion & Couture",
      categorySlug: 'womens-fashion',
      tagline: 'Modern Elegance & Ethnic Heritage',
      description: 'Designer sarees, festive lehengas, contemporary dresses, and everyday casuals.',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
      icon: <FaTshirt className="w-4 h-4" />,
      storeCount: 14,
    },
    {
      id: 'mens-fashion',
      name: "Men's Fashion & Denim",
      categorySlug: 'mens-fashion',
      tagline: 'Tailored Suits, Casuals & Denim',
      description: 'Original Levi\'s denim, smart casual shirts, tailored blazers, and urban streetwear.',
      image: '/stores/levis_cover.webp',
      icon: <FaShoppingBag className="w-4 h-4" />,
      storeCount: 12,
    },
    {
      id: 'electronics',
      name: 'Tech, Mobiles & Gaming',
      categorySlug: 'electronics',
      tagline: 'Authorized Smartphones & Custom PC Rigs',
      description: 'Latest iPhones, Samsung flagships, mechanical gaming gear, and certified repairs.',
      image: '/stores/fone_decor_cover.jpeg',
      icon: <FaLaptop className="w-4 h-4" />,
      storeCount: 8,
    },
    {
      id: 'beauty',
      name: 'Beauty, Skincare & Fragrance',
      categorySlug: 'beauty',
      tagline: 'International Cosmetics & Organic Glow',
      description: 'Authentic K-beauty, luxury perfumes, dermatological skincare, and salon makeup.',
      image: '/stores/obsession_cosmetics_cover.jpeg',
      icon: <FaSpa className="w-4 h-4" />,
      storeCount: 9,
    },
    {
      id: 'jewelry',
      name: 'Fine Jewelry & Luxury Watches',
      categorySlug: 'womens-accessories',
      tagline: '24K Hallmark Gold & Certified Diamonds',
      description: 'Bridal gold sets, solitaire diamond rings, and premium Swiss & Japanese watches.',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
      icon: <FaGem className="w-4 h-4" />,
      storeCount: 6,
    },
    {
      id: 'handicrafts',
      name: 'Nepali Pashmina & Local Crafts',
      categorySlug: 'handicrafts',
      tagline: 'Pure Cashmere, Wild Hemp & Souvenirs',
      description: 'Hand-woven Himalayan pashminas, organic hemp backpacks, and authentic souvenirs.',
      image: '/stores/woven_cover.jpg',
      icon: <FaGift className="w-4 h-4" />,
      storeCount: 7,
    },
    {
      id: 'kids',
      name: 'Kids Wear & Family Essentials',
      categorySlug: 'womens-fashion',
      tagline: 'Playful Clothing, Newborns & Toys',
      description: 'Organic cotton baby clothing, festive childrenswear, and fun nursery essentials.',
      image: '/stores/dadybird_cover.webp',
      icon: <FaChild className="w-4 h-4" />,
      storeCount: 5,
    },
    {
      id: 'outdoor',
      name: 'Outdoor & Mountain Trekking Gear',
      categorySlug: 'mens-fashion',
      tagline: 'High-Altitude Apparel & Equipment',
      description: 'Gore-Tex jackets, rugged trekking boots, sleeping bags, and Annapurna gear.',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
      icon: <FaMountain className="w-4 h-4" />,
      storeCount: 6,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Navigation */}
      <NavigationBar />

      {/* Hero Header */}
      <PageHeader
        title="Shop & Boutiques"
        subtitle="Pokhara Trade Mall is your one-stop retail hub for leading international fashion brands, certified tech centers, fine jewelry, beauty, and local Himalayan artisan crafts."
        badge="PREMIER SHOPPING DESTINATION"
        breadcrumbs={[
          { label: 'Shop' },
        ]}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-20">

        {/* ========================================================================= */}
        {/* SECTION 1: FEATURED SHOPS & BRANDS (5-10 CURATED STORES) */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-[#801424] uppercase mb-1">
                <FaGem className="w-3.5 h-3.5" />
                <span>Curated Highlights</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-wide"
                style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
              >
                Featured Brands & Boutiques
              </h2>
            </div>
            <Link
              to="/shops/directory"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#801424] hover:text-[#5a0c18] transition-colors group no-underline"
            >
              <span>View All Directory Outlets</span>
              <FaArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center items-center">
              <div className="w-10 h-10 border-4 border-[#801424] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredStores.slice(0, 8).map((store, index) => (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  {/* Image Cover */}
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <img
                      src={store.cover.data.full_url}
                      alt={store.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />

                    {/* Floor Badge */}
                    <span className="absolute top-3 right-3 text-[10px] font-semibold text-gray-900 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs border border-gray-200/80 flex items-center gap-1">
                      <FaMapMarkerAlt className="w-2.5 h-2.5 text-[#801424]" />
                      {store.floor || '1st Floor'}
                    </span>

                    {/* Category Pill */}
                    <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-widest text-white bg-[#801424]/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs">
                      {store.category || store.type}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Logo + Store Title */}
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0 shadow-xs">
                          <img
                            src={store.logo.data.full_url}
                            alt={`${store.name} logo`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3
                            className="text-base font-bold text-gray-900 group-hover:text-[#801424] transition-colors leading-snug"
                            style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                          >
                            {store.name}
                          </h3>
                          {store.unitNumber && (
                            <p className="text-[11px] text-gray-500 font-medium">{store.unitNumber}</p>
                          )}
                        </div>
                      </div>

                      {/* Subtitle */}
                      {store.subtitle && (
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mt-1">
                          {store.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      {store.operation_hours && (
                        <div className="flex items-center text-[11px] text-gray-500 gap-1">
                          <FaClock className="w-3 h-3 text-[#801424]" />
                          <span>{store.operation_hours.split(';')[0]}</span>
                        </div>
                      )}
                      <Link
                        to={`/shops/details/${store.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#801424] hover:text-[#5a0c18] group-hover:translate-x-0.5 transition-all no-underline"
                      >
                        <span>Explore</span>
                        <FaArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: LARGE TILED CATEGORY SELECTION */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-[#801424] uppercase">
              <FaShoppingBag className="w-3.5 h-3.5" />
              <span>Explore by Category</span>
            </div>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-wide"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              Shop by Department
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed font-light">
              Select any department below to view the dedicated collection and browse available stores in our interactive directory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryTiles.map((tile, index) => (
              <motion.div
                key={tile.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link
                  to={`/shops/directory?category=${tile.categorySlug}`}
                  className="group relative block rounded-3xl overflow-hidden border border-gray-200/90 shadow-sm hover:shadow-2xl transition-all duration-500 h-80 flex flex-col justify-end p-6 text-white no-underline"
                >
                  {/* Backdrop Photo with Gradient */}
                  <img
                    src={tile.image}
                    alt={tile.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/95 transition-all duration-300" />

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] font-bold uppercase tracking-wider">
                    {tile.icon}
                    <span>{tile.storeCount} Outlets</span>
                  </div>

                  {/* Content on bottom */}
                  <div className="relative z-10 space-y-2">
                    <span className="text-[11px] uppercase tracking-widest text-red-300 font-bold block">
                      {tile.tagline}
                    </span>
                    <h3
                      className="text-xl sm:text-2xl font-bold text-white group-hover:text-red-200 transition-colors leading-snug"
                      style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                    >
                      {tile.name}
                    </h3>
                    <p className="text-xs text-gray-300 line-clamp-2 font-light leading-relaxed">
                      {tile.description}
                    </p>

                    <div className="pt-2 flex items-center gap-2 text-xs font-bold text-red-300 group-hover:text-white transition-colors">
                      <span>Browse Department</span>
                      <FaArrowRight className="w-3 h-3 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: JUMP TO SEARCH DIRECTORY BANNER */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl border border-gray-200/90 shadow-md p-8 sm:p-10 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-[#801424] uppercase">
              <FaSearch className="w-3.5 h-3.5" />
              <span>Full Store Directory</span>
            </div>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              Looking for a Specific Brand, Shutter or Floor?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 font-light leading-relaxed max-w-2xl">
              Access the complete, searchable directory with real-time keyword search, category filters, floor-by-floor listings, and interactive map links.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
            <Link
              to="/shops/directory"
              className="btn-primary"
            >
              <FaSearch className="w-3.5 h-3.5" />
              <span>Open Store Directory</span>
            </Link>
            <Link
              to="/mall-map"
              className="btn-secondary"
            >
              <FaCompass className="w-3.5 h-3.5 text-[#801424]" />
              <span>Interactive Mall Map</span>
            </Link>
          </div>
        </section>

      </main>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}
