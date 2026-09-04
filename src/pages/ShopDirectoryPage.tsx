import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
  FaStore,
  FaCheckCircle,
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
  FaUtensils,
  FaPizzaSlice,
  FaCoffee,
  FaHamburger,
  FaFilm,
  FaGamepad,
  FaUniversity,
  FaGraduationCap,
  FaLaptopCode,
  FaDumbbell,
  FaDraftingCompass,
} from 'react-icons/fa';
import NavigationBar from '../app/components/NavigationBar';
import PageHeader, { BreadcrumbItem } from '../app/components/PageHeader';
import Footer from '../app/components/Footer';
import api from '../services/api';
import { Store } from '../data/models/Store';

interface CategoryOption {
  id: string;
  name: string;
  sector: 'retail' | 'dine' | 'entertain' | 'service' | 'all';
  slugs: string[];
  icon: React.ReactNode;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: 'all', name: 'All Categories (Complete Directory)', sector: 'all', slugs: ['all'], icon: <FaStore className="w-3.5 h-3.5" /> },
  
  // RETAIL / SHOP
  { id: 'womens-fashion', name: "Women's Fashion & Couture", sector: 'retail', slugs: ['womens-fashion', 'fashion'], icon: <FaFemale className="w-3.5 h-3.5" /> },
  { id: 'mens-fashion', name: "Men's Fashion & Denim", sector: 'retail', slugs: ['mens-fashion'], icon: <FaTshirt className="w-3.5 h-3.5" /> },
  { id: 'kids', name: 'Kids & Baby Wear', sector: 'retail', slugs: ['kids'], icon: <FaChild className="w-3.5 h-3.5" /> },
  { id: 'lingerie', name: 'Lingerie & Nightwear', sector: 'retail', slugs: ['lingerie'], icon: <FaHeart className="w-3.5 h-3.5" /> },
  { id: 'footwear-bags', name: 'Footwear, Bags & Luggage', sector: 'retail', slugs: ['footwear-bags', 'footwear', 'bags'], icon: <FaShoppingBag className="w-3.5 h-3.5" /> },
  { id: 'jewelry-watches', name: 'Fine Jewelry & Luxury Watches', sector: 'retail', slugs: ['jewelry-watches', 'jewelry', 'womens-accessories', 'watches'], icon: <FaGem className="w-3.5 h-3.5" /> },
  { id: 'beauty-fragrance', name: 'Beauty, Skincare & Fragrance', sector: 'retail', slugs: ['beauty-fragrance', 'beauty', 'cosmetics'], icon: <FaSpa className="w-3.5 h-3.5" /> },
  { id: 'electronics', name: 'Tech, Mobiles & Electronics', sector: 'retail', slugs: ['electronics', 'tech', 'mobiles'], icon: <FaLaptop className="w-3.5 h-3.5" /> },
  { id: 'home-living', name: 'Home, Living & Decor', sector: 'retail', slugs: ['home-living', 'lifestyle'], icon: <FaCouch className="w-3.5 h-3.5" /> },
  { id: 'handicrafts', name: 'Himalayan Handicrafts & Souvenirs', sector: 'retail', slugs: ['handicrafts', 'gifts', 'souvenirs'], icon: <FaGift className="w-3.5 h-3.5" /> },

  // DINE
  { id: 'thakali', name: 'Authentic Nepali & Thakali', sector: 'dine', slugs: ['thakali'], icon: <FaUtensils className="w-3.5 h-3.5" /> },
  { id: 'restaurant', name: 'Restaurants & Multi-Cuisine', sector: 'dine', slugs: ['restaurant', 'eatery'], icon: <FaPizzaSlice className="w-3.5 h-3.5" /> },
  { id: 'cafe', name: 'Artisan Cafés & Bakeries', sector: 'dine', slugs: ['cafe', 'bakery'], icon: <FaCoffee className="w-3.5 h-3.5" /> },
  { id: 'fast-food', name: 'Fast Food & Quick Bites', sector: 'dine', slugs: ['fast-food'], icon: <FaHamburger className="w-3.5 h-3.5" /> },

  // ENTERTAIN
  { id: 'cinema', name: 'Movies & Multiplex (QFX Cinemas)', sector: 'entertain', slugs: ['cinema', 'entertainment'], icon: <FaFilm className="w-3.5 h-3.5" /> },
  { id: 'gaming', name: '4D VR Gaming & Arcade', sector: 'entertain', slugs: ['gaming'], icon: <FaGamepad className="w-3.5 h-3.5" /> },

  // SERVICES
  { id: 'beauty-wellness', name: 'Beauty, Spas & Salons', sector: 'service', slugs: ['beauty-wellness'], icon: <FaSpa className="w-3.5 h-3.5" /> },
  { id: 'finance', name: 'Financial Services & Banking', sector: 'service', slugs: ['finance'], icon: <FaUniversity className="w-3.5 h-3.5" /> },
  { id: 'education', name: 'Educational Institutes & Abroad Study', sector: 'service', slugs: ['education'], icon: <FaGraduationCap className="w-3.5 h-3.5" /> },
  { id: 'it-tech', name: 'IT, Software & Digital Solutions', sector: 'service', slugs: ['it-tech'], icon: <FaLaptopCode className="w-3.5 h-3.5" /> },
  { id: 'health-fitness', name: 'Health, Fitness & Gym', sector: 'service', slugs: ['health-fitness'], icon: <FaDumbbell className="w-3.5 h-3.5" /> },
  { id: 'professional', name: 'Engineering & Consultancies', sector: 'service', slugs: ['professional', 'consultancy'], icon: <FaDraftingCompass className="w-3.5 h-3.5" /> },
];

const SECTOR_PILLS = [
  { id: 'all', label: 'All Sectors' },
  { id: 'retail', label: 'Shop & Boutiques' },
  { id: 'dine', label: 'Dine & Cafes' },
  { id: 'entertain', label: 'Entertainment' },
  { id: 'service', label: 'Services & Offices' },
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

export default function ShopDirectoryPage() {
  const [searchParams] = useSearchParams();
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFloor, setSelectedFloor] = useState<string>('All Floors');
  const [sortBy, setSortBy] = useState<'featured' | 'name-asc' | 'name-desc' | 'floor'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const found = CATEGORY_OPTIONS.find((c) => c.slugs.includes(categoryParam.toLowerCase()) || c.id === categoryParam.toLowerCase());
      if (found) {
        setSelectedCategory(found.id);
        if (found.sector !== 'all') {
          setSelectedSector(found.sector);
        }
      }
    }

    const sectorParam = searchParams.get('sector');
    if (sectorParam) {
      setSelectedSector(sectorParam.toLowerCase());
    }

    const floorParam = searchParams.get('floor');
    if (floorParam) {
      const matchFloor = FLOOR_OPTIONS.find(
        (f) => f.toLowerCase().replace(/\s+/g, '-') === floorParam.toLowerCase()
      );
      if (matchFloor) setSelectedFloor(matchFloor);
    }

    const searchParam = searchParams.get('search');
    if (searchParam) setSearchQuery(searchParam);
  }, [searchParams]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const response = await api.getStores({
          fields: '*,logo.data.full_url,cover.data.full_url,store_gallery.directus_files_id.*',
        });
        setAllStores(response.data || []);
      } catch (err) {
        console.error('Error fetching directory stores:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const handleSectorChange = (sectorId: string) => {
    setSelectedSector(sectorId);
    if (selectedCategory !== 'all') {
      const cat = CATEGORY_OPTIONS.find((c) => c.id === selectedCategory);
      if (cat && cat.sector !== 'all' && cat.sector !== sectorId && sectorId !== 'all') {
        setSelectedCategory('all');
      }
    }
  };

  const filteredStores = useMemo(() => {
    let result = [...allStores];

    // 1. Sector filter
    if (selectedSector !== 'all') {
      result = result.filter((s) => {
        if (selectedSector === 'retail') return s.type === 'retail';
        if (selectedSector === 'dine') return s.type === 'eatery';
        if (selectedSector === 'entertain') return s.categorySlug === 'cinema' || s.categorySlug === 'gaming' || s.categorySlug === 'entertainment';
        if (selectedSector === 'service') return s.type === 'service' && s.categorySlug !== 'cinema' && s.categorySlug !== 'gaming' && s.categorySlug !== 'entertainment';
        return true;
      });
    }

    // 2. Category filter
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

    // 3. Floor filter
    if (selectedFloor !== 'All Floors') {
      result = result.filter((s) => s.floor?.toLowerCase().includes(selectedFloor.toLowerCase()));
    }

    // 4. Search keyword
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

    result.sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'floor') return (a.floor || '').localeCompare(b.floor || '');
      return 0;
    });

    return result;
  }, [allStores, selectedSector, selectedCategory, selectedFloor, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSector('all');
    setSelectedCategory('all');
    setSelectedFloor('All Floors');
    setSortBy('featured');
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Shop', href: '/shop' },
    { label: 'Store Directory' },
  ];

  const hasActiveFilters = searchQuery !== '' || selectedSector !== 'all' || selectedCategory !== 'all' || selectedFloor !== 'All Floors';

  const visibleCategoryOptions = useMemo(() => {
    if (selectedSector === 'all') return CATEGORY_OPTIONS;
    return CATEGORY_OPTIONS.filter((c) => c.sector === 'all' || c.sector === selectedSector);
  }, [selectedSector]);

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Navigation */}
      <NavigationBar />

      {/* Header */}
      <PageHeader
        title="Mall Store Directory"
        subtitle="Search and filter through all retail outlets, boutiques, dining spots, entertainment venues, and professional service suites at Pokhara Trade Mall."
        badge="OMNICHANNEL DIRECTORY"
        breadcrumbs={breadcrumbs}
      />

      {/* Main Directory Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">

        {/* Toolbar with Sector Pills, Search, Category, Floor & Sort */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-4 sm:p-6 space-y-4">
          {/* Sector Switcher Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-gray-100">
            {SECTOR_PILLS.map((pill) => {
              const isSelected = selectedSector === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => handleSectorChange(pill.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-[#801424] text-white shadow-md shadow-red-900/20'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Main Filter Inputs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="lg:col-span-5 relative">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search store name, brand, keyword, unit..."
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

            {/* Category Dropdown */}
            <div className="lg:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2.5 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#801424]/20 focus:border-[#801424] text-gray-800 font-medium cursor-pointer"
              >
                {visibleCategoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Floor Dropdown */}
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

            {/* Sort Dropdown */}
            <div className="lg:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full py-2.5 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#801424]/20 focus:border-[#801424] text-gray-800 font-medium cursor-pointer"
              >
                <option value="featured">Sort: Featured First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="floor">By Floor Level</option>
              </select>
            </div>
          </div>

          {/* Filter Pills and View Mode Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-500 font-medium flex items-center gap-1">
                <FaSlidersH className="w-3 h-3 text-gray-400" />
                Active Filters:
              </span>

              {selectedSector !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-[#801424] font-semibold border border-red-200">
                  <span>Sector: {SECTOR_PILLS.find((p) => p.id === selectedSector)?.label}</span>
                  <button onClick={() => setSelectedSector('all')} className="hover:text-red-900 cursor-pointer">
                    <FaTimes className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}

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
                <span className="text-gray-400 italic">Showing all outlets</span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-600 font-semibold text-xs">
                Showing <strong className="text-[#801424]">{filteredStores.length}</strong> of {allStores.length} Outlets
              </span>
              <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white text-[#801424] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                  title="Grid View"
                >
                  <FaThLarge className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list' ? 'bg-white text-[#801424] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                  }`}
                  title="List View"
                >
                  <FaList className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Directory Store Cards */}
        {loading ? (
          <div className="py-20 flex flex-col justify-center items-center space-y-4">
            <div className="w-10 h-10 border-4 border-[#801424] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading store directory...</p>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center space-y-4 max-w-md mx-auto shadow-sm">
            <div className="w-16 h-16 bg-red-50 text-[#801424] rounded-full flex items-center justify-center mx-auto text-2xl">
              <FaStore />
            </div>
            <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store, index) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="h-full"
              >
                <Link
                  to={`/shops/details/${store.slug}`}
                  className="group bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between h-full cursor-pointer !no-underline text-inherit block"
                >
                  {/* Cover Header */}
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <img
                      src={store.cover.data.full_url}
                      alt={store.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />

                    <span className="absolute top-3 right-3 text-[11px] font-semibold text-gray-900 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs border border-gray-200/80 flex items-center gap-1">
                      <FaMapMarkerAlt className="w-2.5 h-2.5 text-[#801424]" />
                      {store.floor || 'Main Mall'}
                    </span>

                    <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-widest text-white bg-[#801424]/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs">
                      {store.category || store.type.toUpperCase()}
                    </span>

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
                            <p className="text-[11px] text-gray-500 font-medium">{store.unitNumber}</p>
                          )}
                        </div>
                      </div>

                      {store.subtitle && (
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mt-1">{store.subtitle}</p>
                      )}

                      {store.tags && store.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {store.tags.slice(0, 3).map((tag, tIdx) => (
                            <span key={tIdx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
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
                          <span>Explore</span>
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
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden divide-y divide-gray-100">
            {filteredStores.map((store) => (
              <Link
                key={store.id}
                to={`/shops/details/${store.slug}`}
                className="p-4 sm:p-5 hover:bg-gray-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group block !no-underline text-inherit cursor-pointer"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0 shadow-xs">
                    <img src={store.logo.data.full_url} alt={`${store.name} logo`} className="w-full h-full object-cover" />
                  </div>
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
                          Featured
                        </span>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#801424] bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                        {store.category || store.type}
                      </span>
                    </div>
                    {store.subtitle && <p className="text-xs text-gray-600 line-clamp-1">{store.subtitle}</p>}
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
                    <span>Details</span>
                    <FaArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
