import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { menuItems } from './navData';

interface MobileNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNavigationDrawer: React.FC<MobileNavigationDrawerProps> = ({ isOpen, onClose }) => {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="relative w-[85vw] max-w-sm sm:max-w-md h-full bg-white text-gray-900 shadow-2xl flex flex-col z-10 overflow-hidden"
            style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50/90 flex-shrink-0">
              <Link to="/" onClick={onClose} className="flex items-center no-underline">
                <img
                  src="/tm_logo_nobg.png"
                  alt="Pokhara Trade Mall"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </Link>

              <button
                onClick={onClose}
                className="p-2 rounded-full text-gray-600 hover:text-red-700 hover:bg-gray-200/70 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Quick Status / Mall Timings Badge */}
            <div
              className="px-5 py-2.5 bg-red-50/60 border-b border-red-100 flex items-center justify-between text-xs flex-shrink-0"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <div className="flex items-center gap-1.5 text-red-800 font-semibold">
                <svg className="w-3.5 h-3.5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>10:00 AM - 8:00 PM</span>
              </div>
              <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider bg-red-100/80 px-2 py-0.5 rounded-full">
                Open Daily
              </span>
            </div>

            {/* Navigation List (Scrollable) */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
              {menuItems.map((item) => {
                const hasSub = !!item.subGroups;
                const isSubOpen = openSubmenu === item.label;
                const isCurrent = item.href && location.pathname === item.href;

                if (!hasSub) {
                  return (
                    <Link
                      key={item.label}
                      to={item.href || '#'}
                      onClick={onClose}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm tracking-wider transition-all no-underline ${
                        isCurrent
                          ? 'bg-red-700 text-white shadow-md'
                          : 'text-gray-800 hover:text-red-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>{item.label.toUpperCase()}</span>
                      <svg
                        className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  );
                }

                return (
                  <div key={item.label} className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50/50">
                    <button
                      onClick={() => setOpenSubmenu(isSubOpen ? null : item.label)}
                      className={`w-full flex items-center justify-between px-4 py-3 font-bold text-sm tracking-wider transition-colors cursor-pointer ${
                        isSubOpen ? 'text-red-700 bg-red-50/70' : 'text-gray-800 hover:text-red-700 hover:bg-gray-100/60'
                      }`}
                    >
                      <span>{item.label.toUpperCase()}</span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isSubOpen ? 'rotate-180 text-red-700' : 'text-gray-500'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <AnimatePresence>
                      {isSubOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden bg-white px-3 py-2 space-y-3 border-t border-gray-100"
                        >
                          {item.subGroups?.map((group, gIdx) => (
                            <div key={gIdx} className="space-y-1">
                              {group.title && (
                                <div
                                  className="text-[11px] font-bold tracking-widest text-red-700 uppercase pt-1 pb-1 px-2 border-b border-gray-100"
                                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                                >
                                  {group.title}
                                </div>
                              )}
                              <div className="space-y-0.5 pt-1">
                                {group.items.map((subItem) => (
                                  <Link
                                    key={subItem.label}
                                    to={subItem.href}
                                    onClick={onClose}
                                    className="flex items-center px-3 py-2 text-xs sm:text-sm text-gray-700 hover:text-red-700 hover:bg-red-50/60 rounded-lg font-medium transition-colors no-underline"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-2 flex-shrink-0" />
                                    <span>{subItem.label}</span>
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
            </nav>

            {/* Bottom Quick Action Footer */}
            <div
              className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col gap-2 flex-shrink-0"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <Link
                to="/mall-map"
                onClick={onClose}
                className="btn-primary w-full text-center py-2.5 justify-center flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Interactive Mall Map</span>
              </Link>
              <div className="flex items-center justify-between text-xs text-gray-600 px-1 pt-1">
                <span>Chipledhunga, Pokhara</span>
                <Link to="/contact" onClick={onClose} className="text-red-700 font-bold hover:underline">
                  Contact Us
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MobileNavigationDrawer;
