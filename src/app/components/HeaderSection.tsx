import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import MobileMenuToggle from './MobileMenuToggle';
import MobileNavigationDrawer from './MobileNavigationDrawer';
import styles from './HeaderSection.module.css';
import { useMenuItems } from './navData';
import { useSiteNav, useMallHours } from '@/content/blocks/site';
import { CmsLink } from '@/content/CmsLink';
import { useBlock } from '@/content/block';
import { liveOnly } from '@/content/visibility';
import { homeHeroBlock } from '@/content/blocks/home';

const HeaderSection = () => {
  const menuItems = useMenuItems();
  const nav = useSiteNav();
  const hours = useMallHours();
  const hero = useBlock(homeHeroBlock);
  const slides = useMemo(() => liveOnly(hero.slides), [hero.slides]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const intervalMs = Math.max(1, Number(hero.intervalSeconds) || 4.5) * 1000;

  // Auto-cycle through news and events items
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveStoryIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [slides.length, intervalMs]);

  const activeStory = slides.length ? slides[activeStoryIndex % slides.length] : null;

  return (
    <header className="relative w-full" style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}>
      {/* Hero Section with Dine Terrace Style Dark Gradient & Subtle Image Blend */}
      <div className="relative w-full min-h-[580px] md:min-h-[620px] lg:min-h-[660px] overflow-hidden bg-gradient-to-r from-gray-900 via-[#1e1316] to-gray-900 text-white flex items-center shadow-xl border-b border-gray-800">
        {/* Ambient Red Glow Highlights (Matching Dine Terrace) */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#801424]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle Background Image Overlay */}
        <img fetchPriority="high" decoding="async"
          src={hero.backgroundUrl}
          alt={hero.backgroundAlt}
          className="absolute inset-0 object-cover w-full h-full opacity-20 mix-blend-luminosity pointer-events-none"
        />

        {/* Hero Content Container */}
        <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-20 pt-28 pb-10 sm:pt-32 sm:pb-10 md:pt-40 md:pb-14 flex flex-col lg:flex-row items-center lg:items-stretch justify-between gap-8 lg:gap-8">
          
          {/* Left Section: ELEVATE YOUR SHOPPING EXPERIENCE Text + Action Links */}
          <div className="w-full lg:w-5/12 text-center lg:text-left flex flex-col items-center lg:items-start justify-center">
            <h1
              className="text-xl sm:text-3xl md:text-4xl font-bold text-white tracking-wider uppercase leading-snug sm:leading-tight drop-shadow-md text-center lg:text-left"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              {hero.title}
            </h1>

            <div className="flex items-center justify-center lg:justify-start gap-2 my-2.5 sm:my-3.5">
              <div className="w-8 h-0.5 bg-[#801424] rounded-full" />
              <div className="w-2 h-2 rotate-45 bg-[#801424] rounded-xs" />
              <div className="w-8 h-0.5 bg-[#801424] rounded-full" />
            </div>

            <p
              className="text-gray-200 text-xs sm:text-sm leading-relaxed max-w-lg font-light mb-6 text-center lg:text-left"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {hero.intro}
            </p>

            {/* Direct Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              {(hero.buttons || []).filter((btn) => btn && btn.label).map((btn, i) => (
                <CmsLink
                  key={i}
                  href={btn.href}
                  className={btn.style === 'dark' ? 'btn-dark' : 'btn-primary'}
                >
                  <span>{btn.label}</span>
                  {btn.style !== 'dark' && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </CmsLink>
              ))}
            </div>
          </div>

          {/* Right Section: Elegant Glass Hero Showcase for WHAT'S ON */}
          {activeStory && (
          <div className="w-full lg:w-6/12 flex justify-center lg:justify-end">
            <div className="w-full bg-black/40 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/10 p-4 sm:p-6 md:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between min-h-[340px] sm:min-h-[420px]">
              
              {/* Header: WHAT'S ON Title */}
              <div className="text-center pb-1 sm:pb-2 mb-2 sm:mb-3">
                <h3
                  className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-widest uppercase"
                  style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                >
                  {hero.showcaseTitle}
                </h3>
                <div className="flex items-center justify-center gap-2 my-2">
                  <div className="w-8 h-0.5 bg-[#801424] rounded-full" />
                  <div className="w-2 h-2 rotate-45 bg-[#801424] rounded-xs" />
                  <div className="w-8 h-0.5 bg-[#801424] rounded-full" />
                </div>
              </div>

              {/* Main Animated Showcase Display (Entire Card Clickable) */}
              <CmsLink
                href={activeStory.href}
                className="block relative rounded-xl sm:rounded-2xl overflow-hidden h-[200px] sm:h-[260px] group shadow-lg my-1 cursor-pointer !no-underline"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStoryIndex % slides.length}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute inset-0"
                  >
                    <img decoding="async"
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
              </CmsLink>

              {/* Bottom Interactive Indicator Dots */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5 pt-3">
                {slides.map((item, idx) => {
                  const isActive = activeStoryIndex % slides.length === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveStoryIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}: ${item.title}`}
                      className={`rounded-full transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                          : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/30 hover:bg-white/60'
                      }`}
                    />
                  );
                })}
              </div>

            </div>
          </div>
          )}

        </div>
      </div>

      {/* Navigation Menu (Matching NavigationBar Design & Persistent Snippet) */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-gray-100/95 backdrop-blur-md border-b border-gray-200/90 shadow-md">
        <div className="w-full px-3 sm:px-6 md:px-8 lg:px-12">
          <div className="relative flex h-18 sm:h-22 md:h-26 py-2 sm:py-3 items-center justify-between">
            
            {/* Logo on Left */}
            <div className="relative z-20 flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center no-underline hover:no-underline">
                <img fetchPriority="high" decoding="async"
                  src={nav.logoUrl}
                  alt={nav.logoAlt}
                  className="w-36 sm:w-40 md:w-44 lg:w-48 h-auto max-h-14 sm:max-h-16 md:max-h-20 object-contain transition-transform hover:scale-105"
                />
              </Link>
            </div>

            {/* Navigation Items Centered (Exact Horizontal Center) */}
            <div className="hidden md:flex items-center space-x-5 lg:space-x-8 text-gray-800 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20">
              {menuItems.map((item, index) => {
                const hasSub = !!item.subGroups;
                const isDropdownOpen = activeDropdown === item.label;
                const isRightAligned = index >= menuItems.length / 2;

                if (!hasSub) {
                  return (
                    <CmsLink
                      key={item.label}
                      href={item.href || '#'}
                      className={`text-gray-800 font-semibold text-sm tracking-widest no-underline hover:no-underline hover:text-red-700 ${styles.navLink} transition-colors whitespace-nowrap`}
                      style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                    >
                      {item.label.toUpperCase()}
                    </CmsLink>
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
                          className={`absolute top-full mt-2 bg-white/98 backdrop-blur-xl border border-gray-200/90 rounded-xl shadow-2xl p-4 z-50 text-gray-800 ${
                            isRightAligned ? 'right-0 left-auto' : 'left-0 right-auto'
                          } ${
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
                                  <CmsLink
                                    key={subItem.label}
                                    href={subItem.href}
                                    onClick={() => setActiveDropdown(null)}
                                    className="block px-3 py-2 text-sm tracking-wider text-gray-700 hover:text-red-700 hover:bg-red-50/80 no-underline hover:no-underline rounded-lg font-medium transition-all"
                                    style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                                  >
                                    {subItem.label}
                                  </CmsLink>
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

            {/* Persistent Right Section: Mall Timings & Mall Map (Identical to other pages) */}
            <div className="hidden xl:flex items-center space-x-3.5 bg-gray-100/90 border border-gray-200/90 px-4 py-2 rounded-full text-gray-800 shadow-sm flex-shrink-0">
              {/* Mall Timings */}
              <div className="relative group cursor-pointer flex items-center space-x-1.5 text-xs font-semibold tracking-wide">
                <svg className="w-3.5 h-3.5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-500 uppercase tracking-widest text-[10px]">{hours.pillLabel}</span>
                <span className="text-gray-900 font-bold text-xs whitespace-nowrap">{hours.shortHours}</span>

                {/* Hover Schedule Popup */}
                <div className="absolute top-full right-0 mt-2.5 hidden group-hover:block bg-white border border-gray-200 rounded-xl p-3 shadow-2xl text-xs text-gray-800 min-w-[210px] z-50">
                  <div className="text-[10px] font-bold text-red-700 uppercase tracking-widest pb-1 border-b border-gray-200 mb-2">{hours.popupTitle}</div>
                  <div className="space-y-1 text-gray-600">
                    {(hours.rows || []).filter((r) => r.inHeader).map((r, i) => (
                      <div key={i} className="flex justify-between"><span>{r.label}:</span> <span className="font-semibold text-gray-900">{r.hours}</span></div>
                    ))}
                  </div>
                </div>
              </div>

              <span className="text-gray-300">|</span>

              {/* Mall Map Link */}
              <CmsLink
                href={nav.mapLink}
                className="flex items-center space-x-1 text-xs font-bold text-gray-900 hover:text-red-700 no-underline hover:no-underline transition-colors whitespace-nowrap group"
              >
                <svg className="w-3.5 h-3.5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{nav.mapLabel}</span>
                <svg className="w-3 h-3 text-red-600 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </CmsLink>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <MobileMenuToggle onClick={() => setIsMenuOpen(true)} />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sliding Navigation Drawer */}
      <MobileNavigationDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </header>
  );
};

export default HeaderSection;