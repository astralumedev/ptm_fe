import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './HeaderSection.module.css';
import MobileMenuToggle from './MobileMenuToggle';
import { menuItems } from './navData';

const NavigationBar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);

  return (
    <header className="relative w-full" style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}>
      {/* Hero Section */}
      <div className="relative h-[140px] w-full overflow-hidden">
        <img
          src="/mall_images/ptm_hero.webp"
          alt="Hero Background"
          className="object-cover w-full h-full blur-[2px] scale-105"
        />
        {/* Minimal Smooth Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1b1c54]/80 to-[#231528]/80" />

        {/* Subtle animated gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      </div>

      {/* Navigation Menu */}
      <nav className="absolute top-2 left-0 right-0 z-50">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="relative flex h-24 items-center justify-between">
            {/* Logo on Left */}
            <div className="relative z-20 flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center no-underline hover:no-underline">
                <img
                  src="/tm_logo_tp.png"
                  alt="Pokhara Trade Mall Logo"
                  className="w-36 md:w-44 lg:w-48 h-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] transition-all"
                />
              </Link>
            </div>

            {/* Navigation Items Centered (Exact Horizontal Center) */}
            <div className="hidden md:flex items-center space-x-5 lg:space-x-8 text-white absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20">
              {menuItems.map((item, index) => {
                const hasSub = !!item.subGroups;
                const isDropdownOpen = activeDropdown === item.label;
                const isRightAligned = index >= menuItems.length / 2;

                if (!hasSub) {
                  return (
                    <Link
                      key={item.label}
                      to={item.href || '#'}
                      className={`text-white text-sm tracking-widest no-underline hover:no-underline hover:text-red-300 ${styles.navLink} transition-colors whitespace-nowrap`}
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
                      className={`flex items-center space-x-1.5 text-sm tracking-widest whitespace-nowrap text-shadow cursor-pointer transition-colors ${
                        isDropdownOpen ? 'text-red-400' : 'text-white hover:text-red-300'
                      }`}
                      style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                    >
                      <span>{item.label.toUpperCase()}</span>
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-red-400' : 'text-white/70'}`}
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
                          className={`absolute top-full mt-1 bg-black/90 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl p-4 z-50 text-white ${
                            isRightAligned ? 'right-0 left-auto' : 'left-0 right-auto'
                          } ${
                            item.subGroups && item.subGroups.length > 1 ? 'w-[440px] max-w-[90vw] grid grid-cols-2 gap-6' : 'min-w-[220px] whitespace-nowrap'
                          }`}
                        >
                          {item.subGroups?.map((group, gIdx) => (
                            <div key={gIdx} className="space-y-2">
                              {group.title && (
                                <div className="text-xs font-bold tracking-widest text-red-400 uppercase pb-1.5 border-b border-white/15">
                                  {group.title}
                                </div>
                              )}
                              <div className="space-y-1 pt-1">
                                {group.items.map((subItem) => (
                                  <Link
                                    key={subItem.label}
                                    to={subItem.href}
                                    onClick={() => setActiveDropdown(null)}
                                    className="block px-3 py-2 text-sm tracking-wider text-gray-200 hover:text-red-300 hover:bg-white/10 no-underline hover:no-underline rounded-lg transition-all"
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

            {/* Persistent Right Section: Mall Timings & Mall Map */}
            <div className="hidden xl:flex items-center space-x-3.5 bg-black/55 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full text-white shadow-xl flex-shrink-0">
              {/* Mall Timings */}
              <div className="relative group cursor-pointer flex items-center space-x-1.5 text-xs font-semibold tracking-wide">
                <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-300 uppercase tracking-widest text-[10px]">TIMINGS:</span>
                <span className="text-white font-bold text-xs whitespace-nowrap">10 AM - 8 PM</span>

                {/* Hover Schedule Popup */}
                <div className="absolute top-full right-0 mt-2.5 hidden group-hover:block bg-black/95 backdrop-blur-2xl border border-white/20 rounded-xl p-3 shadow-2xl text-xs text-white min-w-[210px] z-50">
                  <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest pb-1 border-b border-white/15 mb-2">Mall Operating Hours</div>
                  <div className="space-y-1 text-gray-200">
                    <div className="flex justify-between"><span>Weekdays:</span> <span className="font-semibold text-white">10:00 AM - 8:00 PM</span></div>
                    <div className="flex justify-between"><span>Weekends:</span> <span className="font-semibold text-white">10:00 AM - 10:00 PM</span></div>
                  </div>
                </div>
              </div>

              <span className="text-white/25">|</span>

              {/* Mall Map Link */}
              <Link
                to="/page/wayfinding"
                className="flex items-center space-x-1 text-xs font-bold text-white hover:text-red-300 no-underline hover:no-underline transition-colors whitespace-nowrap group"
              >
                <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>MALL MAP</span>
                <svg className="w-3 h-3 text-red-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
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

export default NavigationBar; 