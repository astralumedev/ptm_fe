import { useState, useEffect, useMemo } from 'react';
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
  FaUtensils,
  FaGem,
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
import { useBlock } from '../content/block';
import { useCategories } from '../content/blocks/categories';
import {
  shopTypePageBlock,
  type StoreGroup,
  floorsOf,
  floorKey,
  compareFloors,
  isPublished,
  fill,
  fillParts,
} from '../content/blocks/directory';
import { CmsIcon } from '../content/icons';
import { CmsLink } from '../content/CmsLink';

export default function ShopTypePage() {
  const { type } = useParams<{ type?: string }>();
  const [searchParams] = useSearchParams();
  const t = useBlock(shopTypePageBlock);
  const { find } = useCategories();

  // Stores State
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeTab, setActiveTypeTab] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'name-asc' | 'name-desc' | 'floor'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Featured Spotlight Category Switcher
  const [featuredSpotlightCategory, setFeaturedSpotlightCategory] = useState<string>('all');

  // Broad groups (fashion, tech...) from the CMS; each covers several store categories.
  const groups = useMemo(() => {
    const list = ((t.groups as StoreGroup[]) || []).filter((grp) => !grp.hidden && grp.id);
    return list.map((grp) => ({
      ...grp,
      slugs: new Set((grp.categories || []).map((c) => find(c)?.slug || c)),
    }));
  }, [t.groups, find]);

  const inGroup = (s: Store, groupId: string) => {
    const grp = groups.find((x) => x.id === groupId);
    if (!grp) return false;
    const slug = find(s.categorySlug)?.slug || s.categorySlug;
    return Boolean(slug && grp.slugs.has(slug));
  };

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
      const param = categoryParam.toLowerCase();
      const slug = find(param)?.slug || param;
      const foundGroup = groups.find((grp) => grp.id === param) || groups.find((grp) => grp.slugs.has(slug));
      if (foundGroup) {
        setSelectedCategory(foundGroup.id);
      }
    }

    // 3. Sync floor query param (e.g. ?floor=1st-floor)
    const floorParam = searchParams.get('floor');
    if (floorParam) {
      setSelectedFloor(floorKey(floorParam));
    }

    // 4. Sync search query param
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [type, searchParams, groups, find]);

  // Fetch stores from API
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await api.getStores({
          fields: '*,logo.data.full_url,cover.data.full_url,store_gallery.directus_files_id.*',
        });
        setAllStores((response.data || []).filter(isPublished));
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
      stores = stores.filter((s) => inGroup(s, featuredSpotlightCategory));
    }

    return stores;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allStores, featuredSpotlightCategory, groups]);

  // Filtered & Sorted Stores for Directory
  const filteredDirectoryStores = useMemo(() => {
    let result = [...allStores];

    // 1. Filter by Type Tab (retail / eatery / service)
    if (activeTypeTab !== 'all') {
      result = result.filter((s) => s.type === activeTypeTab);
    }

    // 2. Filter by Category Option
    if (selectedCategory !== 'all' && groups.some((grp) => grp.id === selectedCategory)) {
      result = result.filter((s) => inGroup(s, selectedCategory));
    }

    // 3. Filter by Floor
    if (selectedFloor !== 'all') {
      result = result.filter((s) => floorKey(s.floor) === selectedFloor);
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
        return compareFloors(a.floor, b.floor);
      }
      return 0;
    });

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allStores, activeTypeTab, selectedCategory, selectedFloor, searchQuery, sortBy, groups]);

  // Group tiles/options with a live store count; empty groups are hidden (selected one stays).
  const categoryOptions = useMemo(() => {
    const counted = groups
      .map((grp) => ({ ...grp, storeCount: allStores.filter((s) => inGroup(s, grp.id)).length }))
      .filter((grp) => grp.storeCount > 0 || grp.id === selectedCategory);
    return [
      { id: 'all', name: t.allGroupName, shortName: t.featuredAllLabel, icon: 'store', description: t.allGroupDescription, spotlight: true, storeCount: allStores.length },
      ...counted,
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, allStores, selectedCategory, t.allGroupName, t.featuredAllLabel, t.allGroupDescription]);

  const floorOptions = useMemo(() => {
    const floors = floorsOf(allStores).map((f) => ({ id: floorKey(f), name: f }));
    if (selectedFloor !== 'all' && !floors.some((f) => f.id === selectedFloor)) {
      floors.push({ id: selectedFloor, name: selectedFloor.replace(/-/g, ' ') });
    }
    return [{ id: 'all', name: t.allFloorsLabel }, ...floors];
  }, [allStores, selectedFloor, t.allFloorsLabel]);

  // Handle Tab Switch
  const handleTypeTabChange = (tabId: string) => {
    setActiveTypeTab(tabId);
    setSelectedCategory('all');
  };

  // Clear all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedFloor('all');
    setSortBy('featured');
  };

  // Header Tabs Configuration
  const tabs: PageHeaderTab[] = [
    { id: 'all', label: t.tabAll, count: allStores.length, icon: <FaStore className="w-3.5 h-3.5" /> },
    {
      id: 'retail',
      label: t.tabRetail,
      count: allStores.filter((s) => s.type === 'retail').length,
      icon: <FaTshirt className="w-3.5 h-3.5" />,
    },
    {
      id: 'eatery',
      label: t.tabEatery,
      count: allStores.filter((s) => s.type === 'eatery').length,
      icon: <FaUtensils className="w-3.5 h-3.5" />,
    },
    {
      id: 'service',
      label: t.tabService,
      count: allStores.filter((s) => s.type === 'service').length,
      icon: <FaGamepad className="w-3.5 h-3.5" />,
    },
  ];

  // Dynamic Header Title & Subtitle
  const getHeaderInfo = () => {
    if (activeTypeTab === 'retail') {
      return { title: t.retailTitle, subtitle: t.retailSubtitle, badge: t.retailBadge };
    }
    if (activeTypeTab === 'eatery') {
      return { title: t.eateryTitle, subtitle: t.eaterySubtitle, badge: t.eateryBadge };
    }
    if (activeTypeTab === 'service') {
      return { title: t.serviceTitle, subtitle: t.serviceSubtitle, badge: t.serviceBadge };
    }
    return { title: t.allTitle, subtitle: t.allSubtitle, badge: t.allBadge };
  };

  const headerInfo = getHeaderInfo();

  const breadcrumbs: BreadcrumbItem[] = [
    { label: t.breadcrumb, href: t.breadcrumbUrl },
    { label: headerInfo.title },
  ];

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all' || selectedFloor !== 'all';

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
                <span>{t.featuredEyebrow}</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-wide"
                style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
              >
                {t.featuredHeading}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md">
              {t.featuredIntro}
            </p>
          </div>

          {/* Featured Category Spotlight Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoryOptions
              .filter((cat) => cat.spotlight)
              .map((cat) => ({ id: cat.id, label: cat.shortName || cat.name }))
              .map((cat) => (
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
                className="h-full"
              >
                <Link
                  to={`/shops/details/${store.slug}`}
                  className="group bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between h-full cursor-pointer !no-underline text-inherit block"
                >
                  {/* Store Cover Image */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100">
                    <img
                      src={store.cover?.data?.full_url}
                      alt={store.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />

                    {/* Floor Location Badge */}
                    <span className="absolute top-3 right-3 text-[11px] font-semibold text-gray-900 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs border border-gray-200/80 flex items-center gap-1">
                      <FaMapMarkerAlt className="w-2.5 h-2.5 text-[#801424]" />
                      {store.floor || t.featuredFallbackFloor}
                    </span>

                    {/* Category Pill on Image */}
                    <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-widest text-white bg-[#801424]/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs">
                      {store.category || store.type?.toUpperCase()}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Logo + Store Title Header */}
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0 shadow-xs">
                          <img
                            src={store.logo?.data?.full_url}
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
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#801424] group-hover:translate-x-0.5 transition-all ml-auto"
                      >
                        <span>{t.exploreLabel}</span>
                        <FaArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
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
              {t.browseHeading}
            </h3>
            <span className="text-xs text-gray-500 font-medium">{t.browseHint}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categoryOptions.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const storeCount = cat.storeCount;

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
                    <CmsIcon name={cat.icon} className="w-3.5 h-3.5" />
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
                      {fill(t.outletsLabel, { count: storeCount })}
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
                <span>{t.directoryEyebrow}</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-wide"
                style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
              >
                {t.directoryHeading}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-semibold text-gray-600">
                {fillParts(t.showingText, {
                  shown: <span key="shown" className="text-[#801424] font-bold">{filteredDirectoryStores.length}</span>,
                  total: allStores.length,
                })}
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
                  placeholder={t.searchPlaceholder}
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
                  {categoryOptions.map((c) => (
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
                  {floorOptions.map((floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.name}
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
                  <option value="featured">{t.sortFeatured}</option>
                  <option value="name-asc">{t.sortNameAsc}</option>
                  <option value="name-desc">{t.sortNameDesc}</option>
                  <option value="floor">{t.sortFloor}</option>
                </select>
              </div>
            </div>

            {/* Active Filter Chips & View Mode Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
              {/* Active Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-gray-500 font-medium flex items-center gap-1">
                  <FaSlidersH className="w-3 h-3 text-gray-400" />
                  {t.filtersLabel}
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
                    <span>Category: {categoryOptions.find((c) => c.id === selectedCategory)?.name || selectedCategory}</span>
                    <button onClick={() => setSelectedCategory('all')} className="hover:text-red-900 cursor-pointer">
                      <FaTimes className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}

                {selectedFloor !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-[#801424] font-semibold border border-red-200">
                    <span>Floor: {floorOptions.find((f) => f.id === selectedFloor)?.name}</span>
                    <button onClick={() => setSelectedFloor('all')} className="hover:text-red-900 cursor-pointer">
                      <FaTimes className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}

                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[#801424] hover:underline font-bold ml-1 cursor-pointer"
                  >
                    {t.clearAllLabel}
                  </button>
                )}

                {!hasActiveFilters && (
                  <span className="text-gray-400 italic">{t.noFiltersText}</span>
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
              <p className="text-sm text-gray-500">{t.loadingText}</p>
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
                {t.emptyTitle}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t.emptyText}
              </p>
              <button
                onClick={handleResetFilters}
                className="btn-primary text-xs"
              >
                {t.emptyButton}
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View Mode */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDirectoryStores.map((store, index) => (
                <motion.div
                  key={store.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className="h-full"
                >
                  <Link
                    to={`/shops/details/${store.slug}`}
                    className="group bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between h-full cursor-pointer !no-underline text-inherit block"
                  >
                    {/* Cover Header */}
                    <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                      <img
                        src={store.cover?.data?.full_url}
                        alt={store.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />

                      {/* Floor Badge */}
                      <span className="absolute top-3 right-3 text-[11px] font-semibold text-gray-900 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs border border-gray-200/80 flex items-center gap-1">
                        <FaMapMarkerAlt className="w-2.5 h-2.5 text-[#801424]" />
                        {store.floor || t.fallbackFloor}
                      </span>

                      {/* Category Pill */}
                      <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-widest text-white bg-[#801424]/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs">
                        {store.category || store.type?.toUpperCase()}
                      </span>

                      {/* Featured Checkmark */}
                      {store.featured && (
                        <span className="absolute top-3 left-3 text-[10px] font-bold text-amber-900 bg-amber-100/95 backdrop-blur-md px-2 py-0.5 rounded-full shadow-xs border border-amber-300 flex items-center gap-1">
                          <FaCheckCircle className="w-2.5 h-2.5 text-amber-700" />
                          {t.featuredBadge}
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
                              src={store.logo?.data?.full_url}
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
                            <span>{t.fallbackLocation}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          {store.contact_number && (
                            <a
                              href={`tel:${store.contact_number}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-gray-500 hover:text-[#801424] transition-colors p-1"
                              title={`Call ${store.name}`}
                            >
                              <FaPhoneAlt className="w-3 h-3" />
                            </a>
                          )}
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#801424] group-hover:translate-x-0.5 transition-all"
                          >
                            <span>{t.exploreLabel}</span>
                            <FaArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            /* List View Mode */
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden divide-y divide-gray-100">
              {filteredDirectoryStores.map((store) => (
                <Link
                  key={store.id}
                  to={`/shops/details/${store.slug}`}
                  className="p-4 sm:p-5 hover:bg-gray-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group block !no-underline text-inherit cursor-pointer"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Logo */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0 shadow-xs">
                      <img
                        src={store.logo?.data?.full_url}
                        alt={`${store.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="text-base font-bold text-gray-900 group-hover:text-[#801424] transition-colors"
                          style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                        >
                          {store.name}
                        </span>
                        {store.featured && (
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                            {t.featuredBadge}
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
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-gray-500 hover:text-[#801424] hover:bg-red-50 rounded-lg transition-colors"
                        title={`Call ${store.name}`}
                      >
                        <FaPhoneAlt className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <span
                      className="btn-primary-sm"
                    >
                      <span>{t.detailsLabel}</span>
                      <FaArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </Link>
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
              <span>{t.mapEyebrow}</span>
            </div>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              {t.mapHeading}
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-light">
              {t.mapText}
            </p>
            <div className="pt-4 flex flex-wrap items-center gap-4">
              {t.mapPrimaryLabel && (
                <CmsLink href={t.mapPrimaryUrl} className="btn-primary">
                  <FaCompass className="w-3.5 h-3.5" />
                  <span>{t.mapPrimaryLabel}</span>
                </CmsLink>
              )}
              {t.mapSecondaryLabel && (
                <CmsLink href={t.mapSecondaryUrl} className="btn-dark">
                  <span>{t.mapSecondaryLabel}</span>
                </CmsLink>
              )}
            </div>
          </div>
        </section>

      </main>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}
 