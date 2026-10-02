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
import { MallEvent, MallOffer } from '../data/models/Latest';
import { useBlock } from '../content/block';
import { latestPageBlock } from '../content/blocks/latest';
import { submitForm } from '../content/forms';

const emptyRsvp = { name: '', email: '', phone: '', guests: '1', note: '', website: '' };

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <div className="py-14 px-6 text-center bg-white rounded-2xl border border-dashed border-gray-300 text-sm text-gray-500">
    {text}
  </div>
);

export const LatestPage: React.FC = () => {
  const location = useLocation();
  const c = useBlock(latestPageBlock);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [events, setEvents] = useState<MallEvent[]>([]);
  const [offers, setOffers] = useState<MallOffer[]>([]);

  useEffect(() => {
    api.getEvents().then(setEvents);
    api.getOffers().then(setOffers);
  }, []);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'blogs' | 'events' | 'offers'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<MallEvent | null>(null);
  const [rsvpDone, setRsvpDone] = useState<Set<string>>(() => new Set());
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [rsvpForm, setRsvpForm] = useState(emptyRsvp);
  const [rsvpStatus, setRsvpStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [rsvpError, setRsvpError] = useState('');

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
    navigator.clipboard?.writeText(code).catch(() => undefined);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const openEvent = (event: MallEvent, withRsvp: boolean) => {
    setSelectedEvent(event);
    setRsvpOpen(withRsvp && c.rsvpEnabled && !rsvpDone.has(event.id));
    setRsvpStatus(rsvpDone.has(event.id) ? 'success' : 'idle');
    setRsvpError('');
  };

  const closeEvent = () => {
    setSelectedEvent(null);
    setRsvpOpen(false);
  };

  const setField = (key: keyof typeof emptyRsvp) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setRsvpForm((f) => ({ ...f, [key]: e.target.value }));

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || rsvpStatus === 'sending') return;
    if (!rsvpForm.email.trim() && !rsvpForm.phone.trim()) {
      setRsvpStatus('error');
      setRsvpError(c.rsvpContactError);
      return;
    }
    setRsvpStatus('sending');
    setRsvpError('');
    try {
      await submitForm(
        'rsvp',
        {
          name: rsvpForm.name.trim(),
          email: rsvpForm.email.trim(),
          phone: rsvpForm.phone.trim(),
          guests: rsvpForm.guests.trim().slice(0, 4),
          note: rsvpForm.note.trim(),
          eventId: selectedEvent.id,
          eventTitle: selectedEvent.title,
        },
        rsvpForm.website,
      );
      setRsvpDone((prev) => new Set(prev).add(selectedEvent.id));
      setRsvpStatus('success');
      setRsvpForm((f) => ({ ...emptyRsvp, name: f.name, email: f.email, phone: f.phone }));
    } catch (err) {
      setRsvpStatus('error');
      setRsvpError(err instanceof Error ? err.message : String(err));
    }
  };

  const tabs: PageHeaderTab[] = [
    { id: 'all', label: c.tabAll, count: blogs.length + events.length + offers.length },
    { id: 'blogs', label: c.tabBlogs, count: blogs.length, icon: <FaBookOpen className="w-3.5 h-3.5" /> },
    { id: 'events', label: c.tabEvents, count: events.length, icon: <FaCalendarAlt className="w-3.5 h-3.5" /> },
    { id: 'offers', label: c.tabOffers, count: offers.length, icon: <FaTags className="w-3.5 h-3.5" /> },
  ];

  const featuredBlog = blogs[0];
  const gridBlogs = blogs.slice(1);

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Universal Mall Navigation Bar */}
      <NavigationBar />

      {/* Reusable Page Header */}
      <PageHeader
        title={c.title}
        subtitle={c.subtitle}
        badge={c.badge}
        breadcrumbs={[
          { label: c.breadcrumbParent, href: '/latest' },
          { label: c.breadcrumbCurrent },
        ]}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as any)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-14 md:space-y-20">

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
                  <span>{c.blogsEyebrow}</span>
                </div>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase tracking-wide"
                  style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                >
                  {c.blogsHeading}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md">
                {c.blogsIntro}
              </p>
            </div>

            {loadingBlogs ? (
              <div className="py-16 flex justify-center items-center">
                <div className="w-10 h-10 border-4 border-[#801424] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-8">
                {blogs.length === 0 && <EmptyState text={c.blogsEmpty} />}

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
                      <img loading="lazy" decoding="async"
                        src={featuredBlog.cover_image?.data?.full_url || '/mall_images/ptm_hero.webp'}
                        alt={featuredBlog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4 bg-[#801424] text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                        {c.blogsFeaturedBadge}
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
                          {c.blogsReadTime && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-[#801424]">
                                <FaClock className="w-3 h-3" /> {c.blogsReadTime}
                              </span>
                            </>
                          )}
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
                          <span>{c.blogsReadFull}</span>
                          <FaArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Additional Blog Grid */}
                {gridBlogs.length > 0 && <div className="m-rail grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                          <img loading="lazy" decoding="async"
                            src={blog.cover_image?.data?.full_url || '/mall_images/ptm_hero.webp'}
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
                            {c.blogsCardLabel}
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
                          {c.blogsByPrefix} {blog.owner?.first_name} {blog.owner?.last_name}
                        </span>
                        <Link
                          to={`/blogs/${blog.slug}`}
                          className="py-2.5 -my-2.5 font-bold text-[#801424] hover:underline flex items-center gap-1"
                        >
                          {c.blogsReadMore}
                          <FaArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </motion.article>
                  ))}
                </div>}
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
                  <span>{c.eventsEyebrow}</span>
                </div>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase tracking-wide"
                  style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                >
                  {c.eventsHeading}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md">
                {c.eventsIntro}
              </p>
            </div>

            {/* Events Grid */}
            {events.length === 0 && <EmptyState text={c.eventsEmpty} />}
            <div className="m-rail grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {events.map((event, index) => {
                const isRsvpd = rsvpDone.has(event.id);
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
                      <img loading="lazy" decoding="async"
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Date Badge */}
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-gray-900 rounded-xl p-2 text-center shadow-lg border border-white/40 min-w-[62px]">
                        <span className="block text-[10px] font-black text-[#801424] uppercase tracking-wider">
                          {event.dateBadge?.month}
                        </span>
                        <span className="block text-lg font-extrabold leading-none">
                          {event.dateBadge?.day}
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
                          onClick={() => openEvent(event, false)}
                          className="py-2.5 -my-2.5 text-xs font-bold text-gray-700 hover:text-[#801424] transition-colors underline cursor-pointer"
                        >
                          {c.eventsDetails}
                        </button>

                        {c.rsvpEnabled && <button
                          onClick={() => openEvent(event, true)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isRsvpd
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-900 text-white hover:bg-[#801424] shadow-sm'
                            }`}
                        >
                          {isRsvpd ? (
                            <>
                              <FaCheck className="w-3 h-3" /> {c.rsvpDoneButton}
                            </>
                          ) : (
                            <>
                              <FaCalendarAlt className="w-3 h-3" /> {c.rsvpButton}
                            </>
                          )}
                        </button>}
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
                  <span>{c.offersEyebrow}</span>
                </div>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase tracking-wide"
                  style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                >
                  {c.offersHeading}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md">
                {c.offersIntro}
              </p>
            </div>

            {/* Offer Cards Grid */}
            {offers.length === 0 && <EmptyState text={c.offersEmpty} />}
            <div className="m-rail grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {offers.map((offer, index) => {
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
                      <img loading="lazy" decoding="async"
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
                                {c.offersPromoLabel}
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
                                  <FaCheck className="w-3 h-3" /> {c.offersCopied}
                                </>
                              ) : (
                                <>
                                  <FaCopy className="w-3 h-3 text-gray-500" /> {c.offersCopy}
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <span className="text-rose-700 font-semibold">{offer.validUntil}</span>
                          <Link
                            to={offer.storeLink}
                            className="py-2.5 -my-2.5 font-bold text-gray-800 hover:text-[#801424] flex items-center gap-1 transition-colors"
                          >
                            {c.offersStoreLink}
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
              className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200"
            >
              <div className="relative aspect-16/9 bg-gray-900">
                <img loading="lazy" decoding="async"
                  src={selectedEvent.imageUrl}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={closeEvent}
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
                    <span className="block text-gray-400 font-medium">{c.modalDateLabel}</span>
                    <span className="font-semibold">{selectedEvent.date}</span>
                    <div className="text-gray-500">{selectedEvent.time}</div>
                  </div>
                  <div>
                    <span className="block text-gray-400 font-medium">{c.modalVenueLabel}</span>
                    <span className="font-semibold">{selectedEvent.location}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedEvent.fullDescription || selectedEvent.description}
                </p>

                <AnimatePresence initial={false}>
                  {c.rsvpEnabled && (rsvpOpen || rsvpStatus === 'success') && (
                    <motion.div
                      key="rsvp"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      {rsvpStatus === 'success' ? (
                        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3" role="status">
                          <FaCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-bold text-emerald-800">{c.rsvpSuccessTitle}</div>
                            <p className="text-xs text-emerald-700 mt-0.5">{c.rsvpSuccessText}</p>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleRsvpSubmit} className="relative rounded-2xl bg-gray-50 border border-gray-200 p-4 space-y-3" noValidate>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{c.rsvpFormTitle}</div>
                            {c.rsvpFormIntro && <p className="text-xs text-gray-500 mt-0.5">{c.rsvpFormIntro}</p>}
                          </div>
                          <div
                            aria-hidden="true"
                            style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}
                          >
                            <input type="text" name="website" tabIndex={-1} autoComplete="off" value={rsvpForm.website} onChange={setField('website')} />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className="block sm:col-span-2 text-xs font-semibold text-gray-600">
                              {c.rsvpNameLabel}
                              <input required maxLength={120} autoComplete="name" value={rsvpForm.name} onChange={setField('name')}
                                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#801424]" />
                            </label>
                            <label className="block text-xs font-semibold text-gray-600">
                              {c.rsvpEmailLabel}
                              <input type="email" maxLength={200} autoComplete="email" value={rsvpForm.email} onChange={setField('email')}
                                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#801424]" />
                            </label>
                            <label className="block text-xs font-semibold text-gray-600">
                              {c.rsvpPhoneLabel}
                              <input type="tel" maxLength={40} autoComplete="tel" value={rsvpForm.phone} onChange={setField('phone')}
                                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#801424]" />
                            </label>
                            <label className="block text-xs font-semibold text-gray-600">
                              {c.rsvpGuestsLabel}
                              <input type="number" min={1} max={99} inputMode="numeric" value={rsvpForm.guests} onChange={setField('guests')}
                                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#801424]" />
                            </label>
                            <label className="block sm:col-span-2 text-xs font-semibold text-gray-600">
                              {c.rsvpNoteLabel}
                              <textarea rows={2} maxLength={1000} value={rsvpForm.note} onChange={setField('note')}
                                className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#801424] resize-none" />
                            </label>
                          </div>
                          {rsvpStatus === 'error' && rsvpError && (
                            <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2" role="alert">
                              {rsvpError}
                            </p>
                          )}
                          <div className="flex justify-end">
                            <button type="submit" disabled={rsvpStatus === 'sending' || !rsvpForm.name.trim()} className="btn-primary text-xs disabled:opacity-60 disabled:cursor-not-allowed">
                              {rsvpStatus === 'sending' ? c.rsvpSending : c.rsvpSubmit}
                            </button>
                          </div>
                        </form>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    onClick={closeEvent}
                    className="btn-secondary text-xs"
                  >
                    {c.modalClose}
                  </button>
                  {c.rsvpEnabled && !rsvpOpen && rsvpStatus !== 'success' && (
                    <button
                      onClick={() => setRsvpOpen(true)}
                      className="btn-primary text-xs"
                    >
                      {c.rsvpModalButton}
                    </button>
                  )}
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
