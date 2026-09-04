import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUtensils,
  FaCoffee,
  FaPizzaSlice,
  FaHamburger,
  FaMapMarkerAlt,
  FaClock,
  FaPhoneAlt,
  FaArrowRight,
  FaCheckCircle,
  FaSpinner,
} from 'react-icons/fa';
import NavigationBar from '../app/components/NavigationBar';
import PageHeader from '../app/components/PageHeader';
import Footer from '../app/components/Footer';
import api from '../services/api';
import { Store } from '../data/models/Store';

const DINE_CATEGORIES = [
  { id: 'all', name: 'All Dining', icon: <FaUtensils className="w-3.5 h-3.5" /> },
  { id: 'thakali', name: 'Nepali & Thakali', icon: <FaUtensils className="w-3.5 h-3.5" /> },
  { id: 'restaurant', name: 'Restaurants & Multi-Cuisine', icon: <FaPizzaSlice className="w-3.5 h-3.5" /> },
  { id: 'cafe', name: 'Artisan Cafés & Bakeries', icon: <FaCoffee className="w-3.5 h-3.5" /> },
  { id: 'fast-food', name: 'Fast Food & Quick Bites', icon: <FaHamburger className="w-3.5 h-3.5" /> },
];

const INITIAL_PAGE_SIZE = 6;
const PAGE_SIZE_INCREMENT = 4;

export default function DinePage() {
  const [diningStores, setDiningStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const fetchDining = async () => {
      try {
        setLoading(true);
        const response = await api.getStores({
          filter: { status: 'published', type: 'eatery' },
        });
        setDiningStores(response.data || []);
      } catch (err) {
        console.error('Error loading dining stores:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDining();
  }, []);

  const featuredSpots = useMemo(() => {
    return diningStores.filter((s) => Boolean(s.featured));
  }, [diningStores]);

  const filteredStores = useMemo(() => {
    if (activeCategory === 'all') return diningStores;
    return diningStores.filter((s) => s.categorySlug === activeCategory || s.tags?.some((t) => t.toLowerCase().includes(activeCategory)));
  }, [diningStores, activeCategory]);

  const displayedStores = useMemo(() => {
    return filteredStores.slice(0, visibleCount);
  }, [filteredStores, visibleCount]);

  const hasMore = visibleCount < filteredStores.length;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + PAGE_SIZE_INCREMENT);
      setIsLoadingMore(false);
    }, 400);
  };

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setVisibleCount(INITIAL_PAGE_SIZE);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Navigation */}
      <NavigationBar />

      {/* Hero Header */}
      <PageHeader
        title="Dine & Taste"
        subtitle="From authentic Himalayan Mustang Thakali and organic single-origin coffee to gourmet thin-crust pizza and vibrant casual dining, indulge your senses."
        badge="GOURMET & CASUAL DINING"
        breadcrumbs={[
          { label: 'Dine' },
        ]}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-20">

        {/* ========================================================================= */}
        {/* SECTION 1: FEATURED DINING SPOTS (5-8 HIGHLIGHTS) */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-[#801424] uppercase mb-1">
                <FaUtensils className="w-3.5 h-3.5" />
                <span>Culinary Highlights</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-wide"
                style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
              >
                Featured Eateries & Cafes
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md">
              Handpicked standout restaurants, artisanal bakeries, and traditional kitchens inside Pokhara Trade Mall.
            </p>
          </div>

          {loading ? (
            <div className="py-16 flex justify-center items-center">
              <div className="w-10 h-10 border-4 border-[#801424] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSpots.slice(0, 6).map((store, index) => (
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
                    <div className="relative h-52 w-full overflow-hidden bg-gray-100">
                      <img
                        src={store.cover.data.full_url}
                        alt={store.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-85" />

                      <span className="absolute top-3 right-3 text-[11px] font-semibold text-gray-900 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs border border-gray-200/80 flex items-center gap-1">
                        <FaMapMarkerAlt className="w-2.5 h-2.5 text-[#801424]" />
                        {store.floor || '4th Floor'}
                      </span>

                      <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-widest text-white bg-[#801424]/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs">
                        {store.category || 'Dining'}
                      </span>

                      <span className="absolute top-3 left-3 text-[10px] font-bold text-amber-900 bg-amber-100/95 backdrop-blur-md px-2 py-0.5 rounded-full shadow-xs border border-amber-300 flex items-center gap-1">
                        <FaCheckCircle className="w-2.5 h-2.5 text-amber-700" />
                        Signature Spot
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-11 h-11 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0 shadow-xs">
                            <img src={store.logo.data.full_url} alt={`${store.name} logo`} className="w-full h-full object-cover" />
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
                              <span key={tIdx} className="text-[10px] bg-red-50 text-[#801424] px-2 py-0.5 rounded-md font-medium">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

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
                          <span>View Menu & Info</span>
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
        {/* SECTION 2: ALL RESTAURANTS & CAFES WITH PAGINATED "LOAD MORE" */}
        {/* ========================================================================= */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-[#801424] uppercase mb-1">
                <FaUtensils className="w-3.5 h-3.5" />
                <span>Browse All Flavors</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-wide"
                style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
              >
                Dining Directory
              </h2>
            </div>
            <span className="text-xs sm:text-sm text-gray-500 font-medium">
              Showing {displayedStores.length} of {filteredStores.length} Dining Spots
            </span>
          </div>

          {/* Category Filter Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {DINE_CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-[#801424] text-white shadow-md shadow-red-900/20'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Dining Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedStores.map((store, index) => (
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
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <img
                      src={store.cover.data.full_url}
                      alt={store.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />

                    <span className="absolute top-3 right-3 text-[11px] font-semibold text-gray-900 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs border border-gray-200/80 flex items-center gap-1">
                      <FaMapMarkerAlt className="w-2.5 h-2.5 text-[#801424]" />
                      {store.floor || '4th Floor'}
                    </span>

                    <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-widest text-white bg-[#801424]/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs">
                      {store.category || 'Dining'}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-11 h-11 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0 shadow-xs">
                          <img src={store.logo.data.full_url} alt={`${store.name} logo`} className="w-full h-full object-cover" />
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
                    </div>

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
                          <span>Details</span>
                          <FaArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Paginated "Load More" Button */}
          {hasMore && (
            <div className="pt-6 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-8 py-3.5 bg-white border border-gray-300/90 text-gray-800 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl shadow-xs hover:border-[#801424] hover:text-[#801424] transition-all flex items-center gap-2 cursor-pointer"
              >
                {isLoadingMore ? (
                  <>
                    <FaSpinner className="w-3.5 h-3.5 animate-spin text-[#801424]" />
                    <span>Loading Outlets...</span>
                  </>
                ) : (
                  <>
                    <span>Load More Dining Outlets ({filteredStores.length - visibleCount} Remaining)</span>
                    <FaArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: CULINARY EXPERIENCE & GATHERINGS SPOTLIGHT */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-r from-gray-900 via-[#1e1316] to-gray-900 text-white rounded-3xl p-8 sm:p-10 md:p-12 relative overflow-hidden shadow-xl border border-gray-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-red-400 uppercase">
              <FaUtensils className="w-3.5 h-3.5" />
              <span>Culinary Excellence</span>
            </div>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide leading-tight"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              Savor Exceptional Dining & Vibrant Gatherings
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-light">
              From casual weekend brunch catch-ups and artisanal espresso roasts to authentic Himalayan feasts and delightful pre-movie dinners, Pokhara Trade Mall brings together a rich tapestry of flavors for food lovers and families alike.
            </p>
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                to="/shops/directory"
                className="btn-primary"
              >
                <span>Browse Full Directory</span>
                <FaArrowRight className="w-3 h-3" />
              </Link>
              <Link
                to="/contact"
                className="btn-dark"
              >
                <span>Plan A Visit & Contact</span>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
