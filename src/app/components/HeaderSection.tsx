import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import MobileMenuToggle from './MobileMenuToggle';
import styles from './HeaderSection.module.css';
import { menuItems } from './navData';

interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  imageUrl: string;
  href: string;
}

const latestNewsAndEvents: NewsItem[] = [
  {
    id: 'festive-sale',
    title: 'Festive Shopping Extravaganza 2026',
    category: 'EVENT',
    date: 'Aug 15 - Aug 25',
    summary: 'Up to 50% OFF across top fashion, apparel & footwear brands at Pokhara Trade Mall!',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
    href: '/page/events',
  },
  {
    id: 'qfx-upgrade',
    title: 'QFX Cinemas New 4K Screen Unveiling',
    category: 'NEWS',
    date: 'Aug 20',
    summary: 'Experience ultra-crisp 4K Laser Projection and immersive Dolby Atmos surround sound at Screen 2.',
    imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    href: '/page/events',
  },
  {
    id: 'food-fest',
    title: 'Mustang Thakali Food & Wine Fest',
    category: 'BLOG',
    date: 'Aug 28',
    summary: 'Taste authentic Himalayan Thakali delicacies and local artisan fruit wines on the rooftop terrace.',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    href: '/page/blogs',
  },
  {
    id: 'boutiques',
    title: 'New Luxury Fashion Boutiques Opening',
    category: 'STORE',
    date: 'Sep 05',
    summary: 'Discover exclusive premium designer wear, cosmetics, and luxury accessories on the Ground Floor.',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    href: '/shops/retail',
  },
];

const HeaderSection = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  // Auto-cycle through news and events items
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStoryIndex((prevIndex) => (prevIndex + 1) % latestNewsAndEvents.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const activeStory = latestNewsAndEvents[activeStoryIndex];

  return (
    <header className="relative w-full" style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}>
      {/* Hero Section with Matching Opening Soon Dark Gradient & Fixed Background Image */}
      <div className="relative w-full min-h-[580px] md:min-h-[620px] lg:min-h-[660px] overflow-hidden bg-gray-900 text-white flex items-center">
        {/* Single Fixed Mall Background Image (Vivid & Clear) */}
        <img
          src="/mall_images/ptm_hero.webp"
          alt="Pokhara Trade Mall Building"
          className="absolute inset-0 object-cover w-full h-full opacity-75"
        />

        {/* Semi-Transparent Opening Soon Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950/98 via-gray-900/95 to-[#4a020d]/85 z-10 pointer-events-none" />

        {/* Divided Hero Content Container (Left: Text + Timings, Right: Auto-Cycling Gallery Widget) */}
        <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-20 pt-28 pb-10 sm:pt-32 sm:pb-10 md:pt-40 md:pb-14 flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-8 lg:gap-8">
          
          {/* Left Section: ELEVATE YOUR SHOPPING EXPERIENCE Text + Timings & Mall Map */}
          <div className="w-full lg:w-5/12 text-center lg:text-left flex flex-col items-center lg:items-start">
            <h1
              className="text-xl sm:text-3xl md:text-4xl font-bold text-white tracking-wider uppercase leading-snug sm:leading-tight drop-shadow-md text-center lg:text-left"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              ELEVATE YOUR SHOPPING EXPERIENCE
            </h1>

            <div className="w-12 sm:w-16 h-0.5 bg-[#801424] my-2.5 sm:my-3.5 rounded-full mx-auto lg:mx-0" />

            <p
              className="text-gray-200 text-xs sm:text-sm leading-relaxed max-w-lg font-light mb-4 sm:mb-6 text-center lg:text-left"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Your premier lifestyle destination for global fashion brands, gourmet Thakali dining, QFX cinemas, and everyday essentials in Pokhara.
            </p>

            {/* Mall Timings & Mall Map Pill Widget */}
            <div className="w-auto inline-flex items-center space-x-2.5 sm:space-x-3.5 bg-black/60 backdrop-blur-xl border border-white/20 px-4 py-2 sm:px-4 sm:py-2.5 rounded-full text-white shadow-xl">
              {/* Mall Timings */}
              <div className="relative group cursor-pointer flex items-center space-x-1.5 sm:space-x-2 text-xs font-semibold tracking-wide">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-300 uppercase tracking-widest text-[9px] sm:text-[10px]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  TIMINGS:
                </span>
                <span className="text-white font-bold text-[11px] sm:text-xs whitespace-nowrap">10 AM - 8 PM</span>

                {/* Hover Schedule Popup */}
                <div className="absolute bottom-full left-0 mb-2.5 hidden group-hover:block bg-black/95 backdrop-blur-2xl border border-white/20 rounded-xl p-3 shadow-2xl text-xs text-white min-w-[210px] z-50">
                  <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest pb-1 border-b border-white/15 mb-2">
                    Mall Operating Hours
                  </div>
                  <div className="space-y-1 text-gray-200" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    <div className="flex justify-between"><span>Weekdays:</span> <span className="font-semibold text-white">10:00 AM - 8:00 PM</span></div>
                    <div className="flex justify-between"><span>Weekends:</span> <span className="font-semibold text-white">10:00 AM - 10:00 PM</span></div>
                  </div>
                </div>
              </div>

              <span className="text-white/25">|</span>

              {/* Mall Map Link */}
              <Link
                to="/page/wayfinding"
                className="flex items-center space-x-1 sm:space-x-1.5 text-xs font-bold text-white hover:text-rose-300 no-underline hover:no-underline transition-colors whitespace-nowrap group"
                style={{ fontFamily: "'Montserrat', sans-serif", textDecoration: 'none' }}
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[11px] sm:text-xs">MALL MAP</span>
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Section: Elegant Glass Hero Showcase for WHAT'S ON */}
          <div className="w-full lg:w-6/12 flex justify-center lg:justify-end">
            <div className="w-full bg-black/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/15 p-4 sm:p-6 md:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between min-h-[340px] sm:min-h-[420px]">
              
              {/* Header: WHAT'S ON Title */}
              <div className="flex items-center justify-between pb-2.5 sm:pb-3.5 border-b border-white/10 mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" />
                  <h3
                    className="text-base sm:text-lg font-bold text-white tracking-widest uppercase"
                    style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                  >
                    WHAT'S ON
                  </h3>
                </div>
              </div>

              {/* Main Animated Showcase Display (Entire Card Clickable) */}
              <Link
                to={activeStory.href}
                className="block relative rounded-xl sm:rounded-2xl overflow-hidden h-[200px] sm:h-[260px] border border-white/10 group shadow-xl my-1 cursor-pointer !no-underline"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStory.id}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute inset-0"
                  >
                    <img
                      src={activeStory.imageUrl}
                      alt={activeStory.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 opacity-80"
                    />
                    {/* Rich Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-black/20" />

                    {/* Content Overlay */}
                    <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end z-10 text-left">
                      {/* Title, Category & Summary */}
                      <div>
                        <div className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-rose-300 mb-1 drop-shadow-sm">
                          {activeStory.category}
                        </div>
                        <h4
                          className="text-base sm:text-xl font-bold text-white uppercase leading-snug drop-shadow-lg mb-1 group-hover:text-rose-200 transition-colors"
                          style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                        >
                          {activeStory.title}
                        </h4>
                        <p
                          className="text-xs sm:text-sm text-gray-300 line-clamp-2 font-light leading-relaxed drop-shadow-sm"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                          {activeStory.summary}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </Link>

              {/* Bottom Interactive Indicator Dots */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5 pt-3">
                {latestNewsAndEvents.map((item, idx) => {
                  const isActive = activeStoryIndex === idx;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveStoryIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}: ${item.title}`}
                      className={`relative overflow-hidden rounded-full transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'w-8 sm:w-9 h-2 sm:h-2.5 bg-rose-500/30 border border-rose-400/50 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                          : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/30 hover:bg-white/60 border border-transparent'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          key={`progress-${idx}`}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 4.5, ease: 'linear' }}
                          className="absolute inset-0 bg-rose-500 origin-left rounded-full"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-gray-100/95 backdrop-blur-md border-b border-gray-200/90 shadow-md">
        <div className="container mx-auto px-3 sm:px-6 md:px-8">
          <div className="flex h-18 sm:h-22 md:h-26 py-2 sm:py-3 items-center justify-between">
            {/* Logo on Left (Aligned with ELEVATE text) */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center no-underline hover:no-underline">
                <img
                  src="/tm_logo_nobg.png"
                  alt="Pokhara Trade Mall Logo"
                  className="w-36 sm:w-40 md:w-44 lg:w-48 h-auto max-h-14 sm:max-h-16 md:max-h-20 object-contain transition-transform hover:scale-105"
                />
              </Link>
            </div>

            {/* Navigation Items Aligned Right (Aligned with WHAT'S ON section) */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8 text-gray-800">
              {menuItems.map((item) => {
                const hasSub = !!item.subGroups;
                const isDropdownOpen = activeDropdown === item.label;

                if (!hasSub) {
                  return (
                    <Link
                      key={item.label}
                      to={item.href || '#'}
                      className={`text-sm font-semibold tracking-widest whitespace-nowrap text-gray-800 no-underline hover:no-underline hover:text-red-700 transition-colors ${styles.navLink}`}
                      style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                    >
                      {item.label.toUpperCase()}
                    </Link>
                  );
                }

                return (
                  <div
                    key={item.label}
                    className="relative group py-2"
                    onMouseEnter={() => setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      className={`flex items-center space-x-1.5 text-sm font-semibold tracking-widest whitespace-nowrap cursor-pointer transition-colors ${
                        isDropdownOpen ? 'text-red-700' : 'text-gray-800 hover:text-red-700'
                      }`}
                      style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                    >
                      <span>{item.label.toUpperCase()}</span>
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-red-700' : 'text-gray-500'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu Overlay */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className={`absolute top-full right-0 mt-2 bg-white/98 backdrop-blur-xl border border-gray-200/90 rounded-xl shadow-2xl p-4 z-50 text-gray-800 ${
                            item.subGroups && item.subGroups.length > 1 ? 'w-[440px] max-w-[90vw] grid grid-cols-2 gap-6' : 'min-w-[220px] whitespace-nowrap'
                          }`}
                        >
                          {item.subGroups?.map((group, gIdx) => (
                            <div key={gIdx} className="space-y-2">
                              {group.title && (
                                <div className="text-xs font-bold tracking-widest text-red-700 uppercase pb-1.5 border-b border-gray-200">
                                  {group.title}
                                </div>
                              )}
                              <div className="space-y-1 pt-1">
                                {group.items.map((subItem) => (
                                  <Link
                                    key={subItem.label}
                                    to={subItem.href}
                                    onClick={() => setActiveDropdown(null)}
                                    className="block px-3 py-2 text-sm tracking-wider text-gray-700 hover:text-red-700 hover:bg-red-50/80 no-underline hover:no-underline rounded-lg font-medium transition-all"
                                    style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                                  >
                                    {subItem.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <MobileMenuToggle onClick={() => setIsMenuOpen(!isMenuOpen)} />
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className={styles.mobileMenuOverlay} onClick={() => setIsMenuOpen(false)} />
          )}
          <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
            <div className="flex flex-col h-full bg-mall-accent overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b border-white/20 bg-white shadow-2xl sticky top-0 z-20">
                <button
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <span className="text-gray-900 font-bold tracking-wider">MENU</span>
                <div className="w-10" /> {/* Spacer to balance the layout */}
              </div>

              <nav className="flex-1 px-4 py-6 space-y-3">
                {menuItems.map((item) => {
                  const hasSub = !!item.subGroups;
                  const isSubOpen = openMobileSubmenu === item.label;

                  if (!hasSub) {
                    return (
                      <Link
                        key={item.label}
                        to={item.href || '#'}
                        className={`block tracking-wider text-mall-brown no-underline hover:no-underline ${styles.navLinkSideBar} transition-colors`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="text-sm">{item.label.toUpperCase()}</span>
                        <svg
                          className={styles.arrowIcon}
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    );
                  }

                  return (
                    <div key={item.label} className="border-b border-gray-300/40">
                      <button
                        onClick={() => setOpenMobileSubmenu(isSubOpen ? null : item.label)}
                        className="w-full flex items-center justify-between py-3 px-3 text-mall-brown font-bold text-sm tracking-wider cursor-pointer"
                      >
                        <span>{item.label.toUpperCase()}</span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${isSubOpen ? 'rotate-180 text-red-600' : 'text-gray-600'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isSubOpen && (
                        <div className="bg-white/60 rounded-lg px-3 py-2 my-1 space-y-3">
                          {item.subGroups?.map((group, gIdx) => (
                            <div key={gIdx} className="space-y-1">
                              {group.title && (
                                <div className="text-xs font-bold tracking-widest text-red-700 uppercase pt-1 pb-1 border-b border-gray-300/50">
                                  {group.title}
                                </div>
                              )}
                              {group.items.map((subItem) => (
                                <Link
                                  key={subItem.label}
                                  to={subItem.href}
                                  className="block py-2 px-2 text-sm text-gray-800 hover:text-red-700 font-semibold no-underline hover:no-underline transition-colors"
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  • {subItem.label}
                                </Link>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default HeaderSection;