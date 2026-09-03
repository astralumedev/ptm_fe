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
  FaTshirt,
  FaLaptop,
  FaSpa,
  FaUtensils,
  FaGem,
  FaGift,
  FaGamepad,
  FaStore,
  FaCheckCircle,
} from 'react-icons/fa';
import NavigationBar from '../app/components/NavigationBar';
import PageHeader, { BreadcrumbItem } from '../app/components/PageHeader';
import Footer from '../app/components/Footer';
import api from '../services/api';
import { Store } from '../data/models/Store';

interface CategoryOption {
  id: string;
  name: string;
  slugs: string[];
  icon: React.ReactNode;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: 'all', name: 'All Categories', slugs: ['all'], icon: <FaStore className="w-3.5 h-3.5" /> },
  { id: 'fashion', name: 'Fashion & Apparel', slugs: ['womens-fashion', 'mens-fashion', 'fashion', 'kids-fashion'], icon: <FaTshirt className="w-3.5 h-3.5" /> },
  { id: 'tech', name: 'Tech & Electronics', slugs: ['electronics', 'tech', 'mobiles', 'gadgets'], icon: <FaLaptop className="w-3.5 h-3.5" /> },
  { id: 'beauty', name: 'Beauty & Skincare', slugs: ['beauty', 'wellness', 'cosmetics', 'spa'], icon: <FaSpa className="w-3.5 h-3.5" /> },
  { id: 'jewelry', name: 'Jewelry & Watches', slugs: ['jewelry', 'womens-accessories', 'mens-accessories', 'watches'], icon: <FaGem className="w-3.5 h-3.5" /> },
  { id: 'crafts', name: 'Handicrafts & Gifts', slugs: ['handicrafts', 'lifestyle', 'gifts', 'souvenirs'], icon: <FaGift className="w-3.5 h-3.5" /> },
  { id: 'dining', name: 'Dining & Cafes', slugs: ['eatery', 'cafe', 'restaurant', 'fast-food'], icon: <FaUtensils className="w-3.5 h-3.5" /> },
  { id: 'entertainment', name: 'Entertainment & Fun', slugs: ['entertainment', 'qfx', 'games'], icon: <FaGamepad className="w-3.5 h-3.5" /> },
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFloor, setSelectedFloor] = useState<string>('All Floors');
  const [sortBy, setSortBy] = useState<'featured' | 'name-asc' | 'name-desc' | 'floor'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const found = CATEGORY_OPTIONS.find((c) => c.slugs.includes(categoryParam.toLowerCase()));
      if (found) setSelectedCategory(found.id);
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

  const filteredStores = useMemo(() => {
    let result = [...allStores];

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

    if (selectedFloor !== 'All Floors') {
      result = result.filter((s) => s.floor?.toLowerCase().includes(selectedFloor.toLowerCase()));
    }

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
  }, [allStores, selectedCategory, selectedFloor, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedFloor('All Floors');
    setSortBy('featured');
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Shop', href: '/shop' },
    { label: 'Store Directory' },
  ];

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all' || selectedFloor !== 'All Floors';

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Navigation */}
      <NavigationBar />

      {/* Header */}
      <PageHeader
        title="Store Directory"
        subtitle="Search and filter through all retail outlets, boutiques, tech centers, and specialty shops at Pokhara Trade Mall."
        badge="COMPLETE DIRECTORY"
        breadcrumbs={breadcrumbs}
      />

      {/* Main Directory Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10">

        {/* Toolbar with Search, Category, Floor & Sort */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-4 sm:p-6 space-y-4">
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
                {CATEGORY_OPTIONS.map((c) => (
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

            <div className="flex items-center gap-4">
              <span className="text-gray-600 font-semibold text-xs">
                Showing <strong className="text-[#801424]">{filteredStores.length}</strong> of {allStores.length} Stores
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
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden divide-y divide-gray-100">
            {filteredStores.map((store) => (
              <div
                key={store.id}
                className="p-4 sm:p-5 hover:bg-gray-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0 shadow-xs">
                    <img src={store.logo.data.full_url} alt={`${store.name} logo`} className="w-full h-full object-cover" />
                  </div>
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

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
