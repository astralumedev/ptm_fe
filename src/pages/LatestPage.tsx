import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCalendarAlt,
  FaTags,
  FaBookOpen,
  FaClock,
  FaMapMarkerAlt,
  FaCopy,
  FaCheck,
  FaArrowRight
} from 'react-icons/fa';
import NavigationBar from '../app/components/NavigationBar';
import PageHeader, { PageHeaderTab } from '../app/components/PageHeader';
import Footer from '../app/components/Footer';
import api from '../services/api';
import { Blog } from '../data/models/Blog';
import { mockEvents, mockOffers, MallEvent } from '../data/latestData';

export const LatestPage: React.FC = () => {
  const location = useLocation();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'blogs' | 'events' | 'offers'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<MallEvent | null>(null);
  const [rsvpSuccess, setRsvpSuccess] = useState<string | null>(null);

  // Parse hash on initial load or change (e.g. /latest#events, /latest#offers, /latest#blogs)
  useEffect(() => {
    const hash = location.hash.replace('#', '').toLowerCase();
    if (hash === 'events') setActiveTab('events');
    else if (hash === 'offers') setActiveTab('offers');
    else if (hash === 'blogs') setActiveTab('blogs');
    else if (hash === 'all') setActiveTab('all');
  }, [location.hash]);

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await api.getBlogs({
          fields: '*,cover_image.data.full_url,owner.*',
          filter: { status: 'published' },
          sort: ['-created_on'],
        });
        setBlogs(response.data);
      } catch (error) {
        console.error('Error fetching blogs for latest page:', error);
      } finally {
        setLoadingBlogs(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleRsvp = (eventId: string) => {
    setRsvpSuccess(eventId);
    setTimeout(() => setRsvpSuccess(null), 3000);
  };

  const tabs: PageHeaderTab[] = [
    { id: 'all', label: 'All Updates', count: blogs.length + mockEvents.length + mockOffers.length },
    { id: 'blogs', label: 'Blogs & Stories', count: blogs.length, icon: <FaBookOpen className="w-3.5 h-3.5" /> },
    { id: 'events', label: 'Events & Happenings', count: mockEvents.length, icon: <FaCalendarAlt className="w-3.5 h-3.5" /> },
    { id: 'offers', label: 'Latest Offers', count: mockOffers.length, icon: <FaTags className="w-3.5 h-3.5" /> },
  ];

  const featuredBlog = blogs[0];
  const gridBlogs = blogs.slice(1);

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Universal Mall Navigation Bar */}
      <NavigationBar />

      {/* Reusable Page Header */}
      <PageHeader
        title="Latest"
        subtitle="Stay updated with our newest editorial stories, vibrant mall events, and exclusive seasonal discounts at Pokhara Trade Mall."
        badge="WHAT'S ON"
        breadcrumbs={[
          { label: "What's On", href: '/latest' },
          { label: 'Latest' },
        ]}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as any)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-20">

        {/* ========================================================================= */}
        {/* SECTION 1: BLOGS & EDITORIAL STORIES */}
        {/* ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'blogs') && (
          <section id="blogs" className="scroll-mt-24 space-y-8">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-gray-200">
              <div>
                <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-[#801424] uppercase mb-1">
                  <FaBookOpen className="w-3.5 h-3.5" />
                  <span>Stories & Articles</span>
                </div>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase tracking-wide"
                  style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                >
                  Latest Blogs & Insights
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md">
                Discover lifestyle tips, dining recommendations, and insider shopping guides curated by our editorial team.
              </p>
            </div>

            {loadingBlogs ? (
              <div className="py-16 flex justify-center items-center">
                <div className="w-10 h-10 border-4 border-[#801424] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-8">
                {/* Featured Blog Highlight Card */}
                {featuredBlog && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-3xl overflow-hidden border border-gray-200/80 shadow-md hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 group"
                  >
                    <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-full overflow-hidden bg-gray-900">
                      <img
                        src={featuredBlog.cover_image?.data?.full_url || '/placeholder.jpg'}
                        alt={featuredBlog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4 bg-[#801424] text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                        Featured Story
                      </div>
                    </div>

                    <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span className="font-semibold text-gray-900">
                            {featuredBlog.owner?.first_name} {featuredBlog.owner?.last_name}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(featuredBlog.created_on).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[#801424]">
                            <FaClock className="w-3 h-3" /> 4 min read
                          </span>
                        </div>

                        <Link to={`/blogs/${featuredBlog.slug}`} className="block group-hover:text-[#801424] transition-colors">
                          <h3
                            className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-snug"
                            style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                          >
                            {featuredBlog.title}
                          </h3>
                        </Link>

                        <div className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                          {featuredBlog.content.replace(/<[^>]*>/g, '')}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <Link
                          to={`/blogs/${featuredBlog.slug}`}
                          className="btn-link"
                        >
                          <span>Read Full Story</span>
                          <FaArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Additional Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {gridBlogs.map((blog, index) => (
                    <motion.article
                      key={blog.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Image */}
                        <Link to={`/blogs/${blog.slug}`} className="block relative aspect-16/10 overflow-hidden bg-gray-100">
                          <img
                            src={blog.cover_image?.data?.full_url || '/placeholder.jpg'}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                            {new Date(blog.created_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </Link>

                        {/* Content */}
                        <div className="p-5 sm:p-6 space-y-3">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-[#801424]">
                            Editorial
                          </div>

                          <Link to={`/blogs/${blog.slug}`} className="block group-hover:text-[#801424] transition-colors">
                            <h4
                              className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight"
                              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                            >
                              {blog.title}
                            </h4>
                          </Link>

                          <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                            {blog.content.replace(/<[^>]*>/g, '')}
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="px-5 sm:px-6 pb-5 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-medium">
                          By {blog.owner?.first_name} {blog.owner?.last_name}
                        </span>
                        <Link
                          to={`/blogs/${blog.slug}`}
                          className="font-bold text-[#801424] hover:underline flex items-center gap-1"
                        >
                          Read More
                          <FaArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: UPCOMING EVENTS & HAPPENINGS */}
        {/* ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'events') && (
          <section id="events" className="scroll-mt-24 space-y-8">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-gray-200">
              <div>
                <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-blue-700 uppercase mb-1">
                  <FaCalendarAlt className="w-3.5 h-3.5" />
                  <span>Calendar of Events</span>
                </div>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase tracking-wide"
                  style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                >
                  Upcoming Events & Happenings
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md">
                Live concerts, cultural food fests, movie premiere nights, and family gaming tournaments at Pokhara Trade Mall.
              </p>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {mockEvents.map((event, index) => {
                const isRsvpd = rsvpSuccess === event.id;
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row"
                  >
                    {/* Left Event Image + Date Badge */}
                    <div className="sm:w-5/12 relative min-h-[220px] sm:min-h-full bg-gray-900 overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Date Badge */}
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-gray-900 rounded-xl p-2 text-center shadow-lg border border-white/40 min-w-[62px]">
                        <span className="block text-[10px] font-black text-[#801424] uppercase tracking-wider">
                          {event.dateBadge.month}
                        </span>
                        <span className="block text-lg font-extrabold leading-none">
                          {event.dateBadge.day}
                        </span>
                      </div>

                      {/* Category Tag */}
                      <div className="absolute bottom-3 left-3 bg-[#16194A]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {event.category}
                      </div>
                    </div>

                    {/* Right Event Content */}
                    <div className="sm:w-7/12 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                            {event.tag}
                          </span>
                          {event.ticketInfo && (
                            <span className="text-[11px] text-gray-500 font-medium">
                              {event.ticketInfo.split('•')[0]}
                            </span>
                          )}
                        </div>

                        <h3
                          className="text-lg sm:text-xl font-bold text-gray-900 leading-snug"
                          style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                        >
                          {event.title}
                        </h3>

                        <div className="space-y-1.5 text-xs text-gray-600 pt-1">
                          <div className="flex items-center gap-2">
                            <FaClock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaMapMarkerAlt className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 pt-1 leading-relaxed">
                          {event.description}
                        </p>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="text-xs font-bold text-gray-700 hover:text-[#801424] transition-colors underline cursor-pointer"
                        >
                          View Details
                        </button>

                        <button
                          onClick={() => handleRsvp(event.id)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isRsvpd
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-900 text-white hover:bg-[#801424] shadow-sm'
                            }`}
                        >
                          {isRsvpd ? (
                            <>
                              <FaCheck className="w-3 h-3" /> Added Reminder!
                            </>
                          ) : (
                            <>
                              <FaCalendarAlt className="w-3 h-3" /> Save Event
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: EXCLUSIVE OFFERS & PROMOTIONS */}
        {/* ========================================================================= */}
        {(activeTab === 'all' || activeTab === 'offers') && (
          <section id="offers" className="scroll-mt-24 space-y-8">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-gray-200">
              <div>
                <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-emerald-700 uppercase mb-1">
                  <FaTags className="w-3.5 h-3.5" />
                  <span>Deals & Vouchers</span>
                </div>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase tracking-wide"
                  style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                >
                  Latest Offers & Promotions
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md">
                Claim exclusive coupon codes and special store discounts across retail, dining, and cinema at Pokhara Trade Mall.
              </p>
            </div>

            {/* Offer Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {mockOffers.map((offer, index) => {
                const isCopied = copiedCode === offer.promoCode;
                return (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    className="relative bg-white rounded-3xl overflow-hidden border border-gray-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Top Image + Discount Badge */}
                    <div className="relative aspect-16/9 bg-gray-900 overflow-hidden">
                      <img
                        src={offer.imageUrl}
                        alt={offer.title}
                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                      {/* Prominent Discount Stamp */}
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-[#801424] text-white text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-lg uppercase tracking-wider">
                        {offer.discount}
                      </div>

                      {/* Store Category */}
                      <div className="absolute bottom-3 left-4 text-white text-xs font-medium">
                        <span className="text-gray-300">{offer.storeCategory}</span>
                        <div className="text-sm font-bold text-white">{offer.storeName}</div>
                      </div>
                    </div>

                    {/* Offer Body */}
                    <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3
                          className="text-base sm:text-lg font-bold text-gray-900 leading-snug"
                          style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                        >
                          {offer.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {offer.description}
                        </p>
                      </div>

                      {/* Promo Code Box */}
                      <div className="space-y-3 pt-3 border-t border-gray-100">
                        {offer.promoCode && (
                          <div className="flex items-center justify-between bg-gray-50 border border-dashed border-gray-300 rounded-xl p-2.5">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
                                Promo Code
                              </span>
                              <span className="font-mono text-xs sm:text-sm font-bold text-gray-900 tracking-wider">
                                {offer.promoCode}
                              </span>
                            </div>

                            <button
                              onClick={() => handleCopyCode(offer.promoCode!)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${isCopied
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 shadow-2xs'
                                }`}
                            >
                              {isCopied ? (
                                <>
                                  <FaCheck className="w-3 h-3" /> Copied!
                                </>
                              ) : (
                                <>
                                  <FaCopy className="w-3 h-3 text-gray-500" /> Copy
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <span className="text-rose-700 font-semibold">{offer.validUntil}</span>
                          <Link
                            to={offer.storeLink}
                            className="font-bold text-gray-800 hover:text-[#801424] flex items-center gap-1 transition-colors"
                          >
                            Explore Store
                            <FaArrowRight className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

      </main>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-200"
            >
              <div className="relative aspect-16/9 bg-gray-900">
                <img
                  src={selectedEvent.imageUrl}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setSelectedEvent(null)}
                  aria-label="Close modal"
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold uppercase">
                  <span>{selectedEvent.category}</span>
                </div>

                <h3
                  className="text-2xl font-bold text-gray-900 leading-tight"
                  style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                >
                  {selectedEvent.title}
                </h3>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-100 text-xs text-gray-700">
                  <div>
                    <span className="block text-gray-400 font-medium">Date & Time</span>
                    <span className="font-semibold">{selectedEvent.date}</span>
                    <div className="text-gray-500">{selectedEvent.time}</div>
                  </div>
                  <div>
                    <span className="block text-gray-400 font-medium">Venue Location</span>
                    <span className="font-semibold">{selectedEvent.location}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedEvent.fullDescription || selectedEvent.description}
                </p>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="btn-secondary text-xs"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleRsvp(selectedEvent.id);
                      setSelectedEvent(null);
                    }}
                    className="btn-primary text-xs"
                  >
                    Save to My Schedule
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
};

export default LatestPage;
