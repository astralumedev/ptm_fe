import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaMapMarkerAlt,
  FaClock,
  FaArrowRight,
  FaFemale,
  FaTshirt,
  FaChild,
  FaHeart,
  FaShoppingBag,
  FaGem,
  FaSpa,
  FaLaptop,
  FaCouch,
  FaGift,
  FaSearch,
  FaCompass,
} from 'react-icons/fa';
import NavigationBar from '../app/components/NavigationBar';
import PageHeader from '../app/components/PageHeader';
import Footer from '../app/components/Footer';
import api from '../services/api';
import { Store } from '../data/models/Store';

interface ShopCategoryItem {
  id: string;
  name: string;
  categorySlug: string;
  subtitle: string;
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

  const retailCategories: ShopCategoryItem[] = [
    {
      id: 'womens-fashion',
      name: "Women's Fashion",
      categorySlug: 'womens-fashion',
      subtitle: 'Ethnic & Western Couture',
      icon: <FaFemale className="w-5 h-5" />,
      storeCount: 14,
    },
    {
      id: 'mens-fashion',
      name: "Men's Fashion & Denim",
      categorySlug: 'mens-fashion',
      subtitle: 'Formal, Casual & Denim',
      icon: <FaTshirt className="w-5 h-5" />,
      storeCount: 12,
    },
    {
      id: 'kids',
      name: 'Kids & Baby Wear',
      categorySlug: 'kids',
      subtitle: 'Playwear & Nursery Kits',
      icon: <FaChild className="w-5 h-5" />,
      storeCount: 8,
    },
    {
      id: 'lingerie',
      name: 'Lingerie & Nightwear',
      categorySlug: 'lingerie',
      subtitle: 'Intimate & Loungewear',
      icon: <FaHeart className="w-5 h-5" />,
      storeCount: 5,
    },
    {
      id: 'footwear-bags',
      name: 'Footwear & Luggage',
      categorySlug: 'footwear-bags',
      subtitle: 'Shoes, Sneakers & Bags',
      icon: <FaShoppingBag className="w-5 h-5" />,
      storeCount: 9,
    },
    {
      id: 'jewelry-watches',
      name: 'Jewelry & Watches',
      categorySlug: 'jewelry-watches',
      subtitle: 'Fine Gold & Luxury Watches',
      icon: <FaGem className="w-5 h-5" />,
      storeCount: 6,
    },
    {
      id: 'beauty-fragrance',
      name: 'Beauty & Fragrance',
      categorySlug: 'beauty-fragrance',
      subtitle: 'Cosmetics & K-Beauty',
      icon: <FaSpa className="w-5 h-5" />,
      storeCount: 10,
    },
    {
      id: 'electronics',
      name: 'Tech & Electronics',
      categorySlug: 'electronics',
      subtitle: 'Mobiles, PC Rigs & Gadgets',
      icon: <FaLaptop className="w-5 h-5" />,
      storeCount: 8,
    },
    {
      id: 'home-living',
      name: 'Home & Living',
      categorySlug: 'home-living',
      subtitle: 'Decor, Bedding & Lifestyle',
      icon: <FaCouch className="w-5 h-5" />,
      storeCount: 7,
    },
    {
      id: 'handicrafts',
      name: 'Nepali Handicrafts',
      categorySlug: 'handicrafts',
      subtitle: 'Pashmina & Souvenirs',
      icon: <FaGift className="w-5 h-5" />,
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
                  className="h-full"
                >
                  <Link
                    to={`/shops/details/${store.slug}`}
                    className="group bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between h-full cursor-pointer !no-underline text-inherit block"
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
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#801424] group-hover:translate-x-0.5 transition-all ml-auto"
                        >
                          <span>Explore</span>
                          <FaArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: ICON-BASED CATEGORY SELECTION */}
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
              Shop by Category
            </h2>
            <div className="flex items-center justify-center gap-2 my-2.5">
              <div className="w-8 h-0.5 bg-[#801424] rounded-full" />
              <div className="w-2 h-2 rotate-45 bg-[#801424] rounded-xs" />
              <div className="w-8 h-0.5 bg-[#801424] rounded-full" />
            </div>
            <p className="text-sm text-gray-600 leading-relaxed font-light">
              Select any category below to browse retail stores, specialty boutiques, and tech outlets in our directory.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {retailCategories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="h-full"
              >
                <Link
                  to={`/shops/directory?category=${cat.categorySlug}`}
                  className="group bg-white rounded-2xl border border-gray-200/90 hover:border-[#801424]/40 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 sm:p-6 flex flex-col items-center text-center justify-between h-full no-underline cursor-pointer"
                >
                  <div className="flex flex-col items-center w-full">
                    {/* Icon Container */}
                    <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#801424] group-hover:bg-[#801424] group-hover:text-white transition-all duration-300 flex items-center justify-center text-xl mb-3.5 shadow-xs group-hover:shadow-md group-hover:scale-105">
                      {cat.icon}
                    </div>

                    {/* Category Name */}
                    <h3
                      className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#801424] transition-colors leading-tight mb-1"
                      style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                    >
                      {cat.name}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-[11px] text-gray-500 font-medium line-clamp-1">
                      {cat.subtitle}
                    </p>
                  </div>

                  {/* Outlets Count Badge & Arrow */}
                  <div className="pt-3 mt-3 border-t border-gray-100 w-full flex items-center justify-between text-[11px] font-semibold text-gray-500 group-hover:text-[#801424] transition-colors">
                    <span className="bg-gray-50 group-hover:bg-red-50 px-2 py-0.5 rounded-md transition-colors">
                      {cat.storeCount} Outlets
                    </span>
                    <FaArrowRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform text-[#801424]" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: JUMP TO SEARCH DIRECTORY BANNER */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-r from-gray-900 via-[#1e1316] to-gray-900 text-white rounded-3xl p-8 sm:p-10 md:p-12 relative overflow-hidden shadow-xl border border-gray-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 lg:col-span-8 space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-red-400 uppercase">
              <FaSearch className="w-3.5 h-3.5" />
              <span>Full Store Directory</span>
            </div>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              Looking for a Specific Brand, Shutter or Floor?
            </h2>
            <p className="text-sm sm:text-base text-gray-300 font-light leading-relaxed max-w-2xl">
              Access the complete, searchable directory with real-time keyword search, category filters, floor-by-floor listings, and interactive map links.
            </p>
          </div>

          <div className="relative z-10 lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
            <Link
              to="/shops/directory"
              className="btn-primary"
            >
              <FaSearch className="w-3.5 h-3.5" />
              <span>Open Store Directory</span>
            </Link>
            <Link
              to="/mall-map"
              className="btn-dark"
            >
              <FaCompass className="w-3.5 h-3.5 text-red-400" />
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
