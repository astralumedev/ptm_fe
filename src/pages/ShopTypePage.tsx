import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaSearch,
  FaTimes,
  FaMapMarkerAlt,
  FaClock,
  FaPhoneAlt,
  FaArrowRight,
  FaThLarge,
  FaList,
  FaSlidersH,
  FaTshirt,
  FaLaptop,
  FaSpa,
  FaUtensils,
  FaGem,
  FaGift,
  FaGamepad,
  FaCompass,
  FaStore,
  FaCheckCircle,
} from 'react-icons/fa';
import NavigationBar from '../app/components/NavigationBar';
import PageHeader, { PageHeaderTab, BreadcrumbItem } from '../app/components/PageHeader';
import Footer from '../app/components/Footer';
import api from '../services/api';
import { Store } from '../data/models/Store';

// Category Definitions with Icons and Color Accents
interface CategoryOption {
  id: string;
  name: string;
  slugs: string[];
  icon: React.ReactNode;
  description: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: 'all',
    name: 'All Categories',
    slugs: ['all'],
    icon: <FaStore className="w-3.5 h-3.5" />,
    description: 'Explore all retail, dining, beauty, and entertainment outlets at Pokhara Trade Mall.',
  },
  {
    id: 'fashion',
    name: 'Fashion & Apparel',
    slugs: ['womens-fashion', 'mens-fashion', 'fashion', 'kids-fashion'],
    icon: <FaTshirt className="w-3.5 h-3.5" />,
    description: 'International brands, designer wear, traditional Nepali ethnic apparel, and everyday denim.',
  },
  {
    id: 'tech',
    name: 'Tech & Electronics',
    slugs: ['electronics', 'tech', 'mobiles', 'gadgets'],
    icon: <FaLaptop className="w-3.5 h-3.5" />,
    description: 'Smartphones, high-performance gaming hardware, accessories, and certified repair hubs.',
  },
  {
    id: 'beauty',
    name: 'Beauty & Wellness',
    slugs: ['beauty', 'wellness', 'cosmetics', 'spa'],
    icon: <FaSpa className="w-3.5 h-3.5" />,
    description: 'International cosmetics, skincare, Ayurvedic spas, hair salons, and organic body therapies.',
  },
  {
    id: 'jewelry',
    name: 'Jewelry & Watches',
    slugs: ['jewelry', 'womens-accessories', 'mens-accessories', 'watches'],
    icon: <FaGem className="w-3.5 h-3.5" />,
    description: 'Certified Hallmark 24K gold, diamond jewelry, designer accessories, and luxury timepieces.',
  },
  {
    id: 'dining',
    name: 'Dining & Cafes',
    slugs: ['eatery', 'cafe', 'restaurant', 'fast-food'],
    icon: <FaUtensils className="w-3.5 h-3.5" />,
    description: 'Artisanal espresso cafes, authentic Himalayan Thakali, wood-fired pizza, and gourmet food courts.',
  },
  {
    id: 'crafts',
    name: 'Crafts & Souvenirs',
    slugs: ['handicrafts', 'lifestyle', 'gifts', 'souvenirs'],
    icon: <FaGift className="w-3.5 h-3.5" />,
    description: 'Handcrafted cashmere pashminas, organic wild hemp, handmade carpets, and Nepali heritage gifts.',
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Leisure',
    slugs: ['entertainment', 'qfx', 'games'],
    icon: <FaGamepad className="w-3.5 h-3.5" />,
    description: '4K laser QFX cinema, 4D VR game simulator zone, and interactive family recreation.',
  },
];

const FLOOR_OPTIONS = [
  'All Floors',
  'Ground Floor',
  '1st Floor',
  '2nd Floor',
  '3rd Floor',
  '4th Floor',
  '5th Floor',
];

export default function ShopTypePage() {
  const { type } = useParams<{ type?: string }>();
  const [searchParams] = useSearchParams();

  // Stores State
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeTab, setActiveTypeTab] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFloor, setSelectedFloor] = useState<string>('All Floors');
  const [sortBy, setSortBy] = useState<'featured' | 'name-asc' | 'name-desc' | 'floor'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Featured Spotlight Category Switcher
  const [featuredSpotlightCategory, setFeaturedSpotlightCategory] = useState<string>('all');

  // Sync URL parameters on initial mount / change
  useEffect(() => {
    // 1. Sync type parameter (retail, eatery, service, wellness)
    if (type) {
      const lowerType = type.toLowerCase();
      if (lowerType === 'retail') setActiveTypeTab('retail');
      else if (lowerType === 'eatery') setActiveTypeTab('eatery');
      else if (lowerType === 'service') setActiveTypeTab('service');
      else if (lowerType === 'wellness') setActiveTypeTab('wellness');
    } else {
      setActiveTypeTab('all');
    }

    // 2. Sync category query param (e.g. ?category=womens-fashion)
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const foundCategory = CATEGORY_OPTIONS.find((c) =>
        c.slugs.includes(categoryParam.toLowerCase())
      );
      if (foundCategory) {
        setSelectedCategory(foundCategory.id);
      }
    }

    // 3. Sync floor query param (e.g. ?floor=1st-floor)
    const floorParam = searchParams.get('floor');
    if (floorParam) {
      const matchFloor = FLOOR_OPTIONS.find(
        (f) => f.toLowerCase().replace(/\s+/g, '-') === floorParam.toLowerCase()
      );
      if (matchFloor) {
        setSelectedFloor(matchFloor);
      }
    }

    // 4. Sync search query param
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [type, searchParams]);

  // Fetch stores from API
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await api.getStores({
          fields: '*,logo.data.full_url,cover.data.full_url,store_gallery.directus_files_id.*',
        });
        setAllStores(response.data || []);
      } catch (err) {
        console.error('Error loading stores directory:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  // Filtered Featured Stores for Spotlight Section
  const featuredStores = useMemo(() => {
    let stores = allStores.filter((s) => Boolean(s.featured));

    if (featuredSpotlightCategory !== 'all') {
      const targetCat = CATEGORY_OPTIONS.find((c) => c.id === featuredSpotlightCategory);
      if (targetCat) {
        stores = stores.filter((s) => {
          if (s.categorySlug && targetCat.slugs.includes(s.categorySlug)) return true;
          if (s.category && targetCat.name.toLowerCase().includes(s.category.toLowerCase())) return true;
          return false;
        });
      }
    }

    return stores;
  }, [allStores, featuredSpotlightCategory]);

  // Filtered & Sorted Stores for Directory
  const filteredDirectoryStores = useMemo(() => {
    let result = [...allStores];

    // 1. Filter by Type Tab (retail / eatery / service)
    if (activeTypeTab !== 'all') {
      result = result.filter((s) => s.type === activeTypeTab);
    }

    // 2. Filter by Category Option
    if (selectedCategory !== 'all') {
      const targetCat = CATEGORY_OPTIONS.find((c) => c.id === selectedCategory);
      if (targetCat) {
        result = result.filter((s) => {
          if (s.categorySlug && targetCat.slugs.includes(s.categorySlug)) return true;
          if (s.category && targetCat.name.toLowerCase().includes(s.category.toLowerCase())) return true;
          return false;
        });
      }
    }

    // 3. Filter by Floor
    if (selectedFloor !== 'All Floors') {
      result = result.filter((s) => s.floor?.toLowerCase().includes(selectedFloor.toLowerCase()));
    }

    // 4. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((s) => {
        const nameMatch = s.name.toLowerCase().includes(q);
        const subtitleMatch = s.subtitle?.toLowerCase().includes(q);
        const descMatch = s.store_description?.toLowerCase().includes(q);
        const categoryMatch = s.category?.toLowerCase().includes(q);
        const floorMatch = s.floor?.toLowerCase().includes(q);
        const tagsMatch = s.tags?.some((t) => t.toLowerCase().includes(q));
        return nameMatch || subtitleMatch || descMatch || categoryMatch || floorMatch || tagsMatch;
      });
    }

    // 5. Sort
    result.sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === 'floor') {
        return (a.floor || '').localeCompare(b.floor || '');
      }
      return 0;
    });

    return result;
  }, [allStores, activeTypeTab, selectedCategory, selectedFloor, searchQuery, sortBy]);

  // Handle Tab Switch
  const handleTypeTabChange = (tabId: string) => {
    setActiveTypeTab(tabId);
    setSelectedCategory('all');
  };

  // Clear all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedFloor('All Floors');
    setSortBy('featured');
  };

  // Header Tabs Configuration
  const tabs: PageHeaderTab[] = [
    { id: 'all', label: 'All Outlets', count: allStores.length, icon: <FaStore className="w-3.5 h-3.5" /> },
    {
      id: 'retail',
      label: 'Shop & Boutiques',
      count: allStores.filter((s) => s.type === 'retail').length,
      icon: <FaTshirt className="w-3.5 h-3.5" />,
    },
    {
      id: 'eatery',
      label: 'Dining & Cafes',
      count: allStores.filter((s) => s.type === 'eatery').length,
      icon: <FaUtensils className="w-3.5 h-3.5" />,
    },
    {
      id: 'service',
      label: 'Services & Fun',
      count: allStores.filter((s) => s.type === 'service').length,
      icon: <FaGamepad className="w-3.5 h-3.5" />,
    },
  ];

  // Dynamic Header Title & Subtitle
  const getHeaderInfo = () => {
    if (activeTypeTab === 'retail') {
      return {
        title: 'Shop & Boutiques',
        subtitle: 'Explore an expansive collection of leading apparel, electronics, beauty, fine jewelry, and artisanal crafts across Pokhara Trade Mall.',
        badge: 'EXCLUSIVE RETAIL',
      };
    }
    if (activeTypeTab === 'eatery') {
      return {
        title: 'Dining & Cafes',
        subtitle: 'From authentic Mustang Thakali and stone-oven pizzas to single-origin Himalayan coffee, delight your palate.',
        badge: 'GOURMET & CASUAL',
      };
    }
    if (activeTypeTab === 'service') {
      return {
        title: 'Services & Leisure',
        subtitle: 'Luxury Ayurvedic spa treatments, state-of-the-art 4K QFX cinema, 4D VR games, and essential mall conveniences.',
        badge: 'WELLNESS & CINEMA',
      };
    }
    return {
      title: 'Shop Directory',
      subtitle: 'Discover premier brands, specialty boutiques, gourmet eateries, and entertainment hubs in the heart of Chipledhunga, Pokhara.',
      badge: 'EXPLORE OUTLETS',
    };
  };

  const headerInfo = getHeaderInfo();

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Shop', href: '/shops/retail' },
    { label: headerInfo.title },
  ];

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all' || selectedFloor !== 'All Floors';

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Universal Mall Navigation Bar */}
      <NavigationBar />

      {/* Reusable Page Header */}
      <PageHeader
        title={headerInfo.title}
        subtitle={headerInfo.subtitle}
        badge={headerInfo.badge}
        breadcrumbs={breadcrumbs}
        tabs={tabs}
        activeTab={activeTypeTab}
        onTabChange={handleTypeTabChange}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-16">

        {/* ========================================================================= */}
        {/* SECTION 1: FEATURED SHOPS ACROSS CATEGORIES SPOTLIGHT */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-[#801424] uppercase mb-1">
                <FaGem className="w-3.5 h-3.5" />
                <span>Featured Brands</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-wide"
                style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
              >
                Featured Outlets
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md">
              Handpicked standout boutiques, authorized tech centers, and signature destinations at Pokhara Trade Mall.
            </p>
          </div>

          {/* Featured Category Spotlight Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'all', label: 'All Featured' },
              { id: 'fashion', label: 'Fashion & Denim' },
              { id: 'tech', label: 'Tech & Mobiles' },
              { id: 'beauty', label: 'Beauty & Spa' },
              { id: 'jewelry', label: 'Fine Jewelry' },
              { id: 'dining', label: 'Cafes & Dining' },
              { id: 'crafts', label: 'Handicrafts' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFeaturedSpotlightCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  featuredSpotlightCategory === cat.id
                    ? 'bg-[#801424] text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Featured Stores Bento / Asymmetric Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredStores.slice(0, 6).map((store, idx) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="group bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                {/* Store Cover Image */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100">
                  <img
                    src={store.cover.data.full_url}
                    alt={store.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />

                  {/* Floor Location Badge */}
                  <span className="absolute top-3 right-3 text-[11px] font-semibold text-gray-900 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs border border-gray-200/80 flex items-center gap-1">
                    <FaMapMarkerAlt className="w-2.5 h-2.5 text-[#801424]" />
                    {store.floor || 'Pokhara Trade Mall'}
                  </span>

                  {/* Category Pill on Image */}
                  <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-widest text-white bg-[#801424]/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs">
                    {store.category || store.type.toUpperCase()}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Logo + Store Title Header */}
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0 shadow-xs">
                        <img
                          src={store.logo.data.full_url}
                          alt={`${store.name} logo`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3
                          className="text-lg font-bold text-gray-900 group-hover:text-[#801424] transition-colors leading-snug"
                          style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                        >
                          {store.name}
                        </h3>
                        {store.unitNumber && (
                          <p className="text-[11px] text-gray-500 font-medium">
                            {store.unitNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Subtitle */}
                    {store.subtitle && (
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {store.subtitle}
                      </p>
                    )}

                    {/* Tags */}
                    {store.tags && store.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {store.tags.slice(0, 3).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
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
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: BROWSE BY CATEGORY TILES (QUICK ACCESS) */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3
              className="text-lg sm:text-xl font-bold text-gray-900 tracking-wide uppercase"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              Browse By Category
            </h3>
            <span className="text-xs text-gray-500 font-medium">Click to filter directory</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORY_OPTIONS.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const storeCount =
                cat.id === 'all'
                  ? allStores.length
                  : allStores.filter((s) => {
                      if (s.categorySlug && cat.slugs.includes(s.categorySlug)) return true;
                      if (s.category && cat.name.toLowerCase().includes(s.category.toLowerCase())) return true;
                      return false;
                    }).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(isSelected ? 'all' : cat.id);
                    const el = document.getElementById('shop-directory');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-2 group ${
                    isSelected
                      ? 'bg-[#801424] text-white border-[#801424] shadow-md scale-102'
                      : 'bg-white hover:bg-red-50/50 border-gray-200/80 text-gray-800 hover:border-red-200'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-colors ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-red-50 text-[#801424] group-hover:bg-white group-hover:text-[#801424]'
                    }`}
                  >
                    {cat.icon}
                  </div>
                  <div>
                    <span className="block text-xs font-bold leading-snug line-clamp-1">
                      {cat.name}
                    </span>
                    <span
                      className={`text-[10px] font-medium block mt-0.5 ${
                        isSelected ? 'text-white/80' : 'text-gray-400'
                      }`}
                    >
                      {storeCount} Outlets
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: COMPREHENSIVE SHOP DIRECTORY (SEARCH, FILTERS, LISTINGS) */}
        {/* ========================================================================= */}
        <section id="shop-directory" className="scroll-mt-24 space-y-8">
          {/* Directory Header with Live Stats */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-[#801424] uppercase mb-1">
                <FaCompass className="w-3.5 h-3.5" />
                <span>Mall Directory</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-wide"
                style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
              >
                Store Directory
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-semibold text-gray-600">
                Showing <span className="text-[#801424] font-bold">{filteredDirectoryStores.length}</span> of {allStores.length} Stores
              </span>
            </div>
          </div>

          {/* Search and Filters Hub Toolbar */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
              {/* 1. Live Search Input (Span 5) */}
              <div className="lg:col-span-5 relative">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by store name, brand, category, floor, or tag..."
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#801424]/20 focus:border-[#801424] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                  >
                    <FaTimes className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 2. Category Dropdown Filter (Span 3) */}
              <div className="lg:col-span-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full py-2.5 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#801424]/20 focus:border-[#801424] text-gray-800 font-medium cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Floor Filter Dropdown (Span 2) */}
              <div className="lg:col-span-2">
                <select
                  value={selectedFloor}
                  onChange={(e) => setSelectedFloor(e.target.value)}
                  className="w-full py-2.5 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#801424]/20 focus:border-[#801424] text-gray-800 font-medium cursor-pointer"
                >
                  {FLOOR_OPTIONS.map((floor) => (
                    <option key={floor} value={floor}>
                      {floor}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Sort Dropdown (Span 2) */}
              <div className="lg:col-span-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full py-2.5 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#801424]/20 focus:border-[#801424] text-gray-800 font-medium cursor-pointer"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="floor">By Floor Level</option>
                </select>
              </div>
            </div>

            {/* Active Filter Chips & View Mode Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
              {/* Active Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-gray-500 font-medium flex items-center gap-1">
                  <FaSlidersH className="w-3 h-3 text-gray-400" />
                  Filters:
                </span>

                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-[#801424] font-semibold border border-red-200">
                    <span>Search: "{searchQuery}"</span>
                    <button onClick={() => setSearchQuery('')} className="hover:text-red-900 cursor-pointer">
                      <FaTimes className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}

                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-[#801424] font-semibold border border-red-200">
                    <span>Category: {CATEGORY_OPTIONS.find((c) => c.id === selectedCategory)?.name}</span>
                    <button onClick={() => setSelectedCategory('all')} className="hover:text-red-900 cursor-pointer">
                      <FaTimes className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}

                {selectedFloor !== 'All Floors' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-[#801424] font-semibold border border-red-200">
                    <span>Floor: {selectedFloor}</span>
                    <button onClick={() => setSelectedFloor('All Floors')} className="hover:text-red-900 cursor-pointer">
                      <FaTimes className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}

                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[#801424] hover:underline font-bold ml-1 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}

                {!hasActiveFilters && (
                  <span className="text-gray-400 italic">Showing all stores</span>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-[#801424] shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  title="Grid View"
                >
                  <FaThLarge className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-[#801424] shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  title="List View"
                >
                  <FaList className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Directory Listings */}
          {loading ? (
            <div className="py-20 flex flex-col justify-center items-center space-y-4">
              <div className="w-10 h-10 border-4 border-[#801424] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Loading store directory...</p>
            </div>
          ) : filteredDirectoryStores.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center space-y-4 max-w-md mx-auto shadow-sm">
              <div className="w-16 h-16 bg-red-50 text-[#801424] rounded-full flex items-center justify-center mx-auto text-2xl">
                <FaStore />
              </div>
              <h3
                className="text-xl font-bold text-gray-900"
                style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
              >
                No Outlets Found
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                We couldn't find any stores matching your current search or filter combination.
              </p>
              <button
                onClick={handleResetFilters}
                className="btn-primary text-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View Mode */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDirectoryStores.map((store, index) => (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className="group bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  {/* Cover Header */}
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <img
                      src={store.cover.data.full_url}
                      alt={store.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />

                    {/* Floor Badge */}
                    <span className="absolute top-3 right-3 text-[11px] font-semibold text-gray-900 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs border border-gray-200/80 flex items-center gap-1">
                      <FaMapMarkerAlt className="w-2.5 h-2.5 text-[#801424]" />
                      {store.floor || 'Main Mall'}
                    </span>

                    {/* Category Pill */}
                    <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-widest text-white bg-[#801424]/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs">
                      {store.category || store.type.toUpperCase()}
                    </span>

                    {/* Featured Checkmark */}
                    {store.featured && (
                      <span className="absolute top-3 left-3 text-[10px] font-bold text-amber-900 bg-amber-100/95 backdrop-blur-md px-2 py-0.5 rounded-full shadow-xs border border-amber-300 flex items-center gap-1">
                        <FaCheckCircle className="w-2.5 h-2.5 text-amber-700" />
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Logo + Store Title */}
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-11 h-11 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0 shadow-xs">
                          <img
                            src={store.logo.data.full_url}
                            alt={`${store.name} logo`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3
                            className="text-lg font-bold text-gray-900 group-hover:text-[#801424] transition-colors leading-snug"
                            style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                          >
                            {store.name}
                          </h3>
                          {store.unitNumber && (
                            <p className="text-[11px] text-gray-500 font-medium">
                              {store.unitNumber}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Subtitle / Description Snippet */}
                      {store.subtitle && (
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mt-1">
                          {store.subtitle}
                        </p>
                      )}

                      {/* Tags */}
                      {store.tags && store.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {store.tags.slice(0, 3).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Info & Explore Button */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      {store.operation_hours ? (
                        <div className="flex items-center text-[11px] text-gray-500 gap-1">
                          <FaClock className="w-3 h-3 text-[#801424]" />
                          <span>{store.operation_hours.split(';')[0]}</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-[11px] text-gray-500 gap-1">
                          <FaMapMarkerAlt className="w-3 h-3 text-[#801424]" />
                          <span>Pokhara Trade Mall</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        {store.contact_number && (
                          <a
                            href={`tel:${store.contact_number}`}
                            className="text-gray-500 hover:text-[#801424] transition-colors p-1"
                            title={`Call ${store.name}`}
                          >
                            <FaPhoneAlt className="w-3 h-3" />
                          </a>
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
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* List View Mode */
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden divide-y divide-gray-100">
              {filteredDirectoryStores.map((store) => (
                <div
                  key={store.id}
                  className="p-4 sm:p-5 hover:bg-gray-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Logo */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0 shadow-xs">
                      <img
                        src={store.logo.data.full_url}
                        alt={`${store.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/shops/details/${store.slug}`}
                          className="text-base font-bold text-gray-900 group-hover:text-[#801424] transition-colors no-underline"
                          style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                        >
                          {store.name}
                        </Link>
                        {store.featured && (
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                            Featured
                          </span>
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#801424] bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                          {store.category || store.type}
                        </span>
                      </div>
                      {store.subtitle && (
                        <p className="text-xs text-gray-600 line-clamp-1">{store.subtitle}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 pt-0.5">
                        <span className="flex items-center gap-1 font-medium text-gray-700">
                          <FaMapMarkerAlt className="w-2.5 h-2.5 text-[#801424]" />
                          {store.floor} {store.unitNumber ? `(${store.unitNumber})` : ''}
                        </span>
                        {store.operation_hours && (
                          <span className="flex items-center gap-1">
                            <FaClock className="w-2.5 h-2.5 text-gray-400" />
                            {store.operation_hours.split(';')[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 flex-shrink-0">
                    {store.contact_number && (
                      <a
                        href={`tel:${store.contact_number}`}
                        className="p-2 text-gray-500 hover:text-[#801424] hover:bg-red-50 rounded-lg transition-colors"
                        title={`Call ${store.name}`}
                      >
                        <FaPhoneAlt className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <Link
                      to={`/shops/details/${store.slug}`}
                      className="btn-primary-sm"
                    >
                      <span>Details</span>
                      <FaArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: INTERACTIVE MALL MAP & WAYFINDING CALLOUT */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-r from-gray-900 via-[#1a1215] to-gray-900 text-white rounded-3xl p-8 sm:p-10 md:p-12 relative overflow-hidden shadow-xl border border-gray-800">
          {/* Subtle Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-red-400 uppercase">
              <FaCompass className="w-3.5 h-3.5" />
              <span>Interactive Navigation</span>
            </div>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              Find Any Store in Seconds with Mall Map
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-light">
              Looking for a specific boutique, lift, escalator, or dining terrace? Use our step-by-step interactive floor directory to navigate Pokhara Trade Mall seamlessly across all 6 levels.
            </p>
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                to="/mall-map"
                className="btn-primary"
              >
                <FaCompass className="w-3.5 h-3.5" />
                <span>Open Mall Map</span>
              </Link>
              <Link
                to="/contact"
                className="btn-dark"
              >
                <span>Guest Services & Info</span>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}
 