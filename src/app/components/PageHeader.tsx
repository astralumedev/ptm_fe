'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import { arizonaFlare } from '../fonts';

export interface PageHeaderTab {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  breadcrumbs?: BreadcrumbItem[];
  tabs?: PageHeaderTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  align?: 'center' | 'left';
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  breadcrumbs,
  tabs,
  activeTab,
  onTabChange,
  align = 'center',
  className = '',
}) => {
  const isLeft = align === 'left';

  return (
    <section className={`relative w-full overflow-hidden bg-gradient-to-b from-[#12132b]/5 via-white to-gray-50/60 border-b border-gray-200/80 pt-8 pb-10 md:pt-12 md:pb-14 ${className}`}>
      {/* Subtle Luxury Gradient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Optional Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className={`mb-4 flex items-center text-xs text-gray-600 ${isLeft ? 'justify-start' : 'justify-center'}`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <ol className="flex items-center space-x-2">
              <li>
                <Link to="/" className="hover:text-[#801424] transition-colors font-medium">
                  Home
                </Link>
              </li>
              {breadcrumbs.map((crumb, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <span className="text-gray-300">/</span>
                  {crumb.href ? (
                    <Link to={crumb.href} className="hover:text-[#801424] transition-colors font-medium">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-700 font-semibold">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Header Content Container */}
        <div className={`flex flex-col ${isLeft ? 'items-start text-left' : 'items-center text-center'}`}>
          
          {/* Optional Badge */}
          {badge && (
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-50 border border-red-200/80 text-[#801424] text-[11px] font-bold uppercase tracking-widest mb-3 shadow-xs" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#801424] animate-pulse" />
              <span>{badge}</span>
            </div>
          )}

          {/* Main Title with Arizona Flare Font */}
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 uppercase drop-shadow-xs leading-tight ${arizonaFlare.className}`}
            style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
          >
            {title}
          </h1>

          {/* Refined Brand Accent Bar */}
          <div className="flex items-center gap-2 my-4">
            <div className="w-8 h-0.5 bg-[#801424] rounded-full" />
            <div className="w-2 h-2 rotate-45 bg-[#801424] rounded-xs" />
            <div className="w-8 h-0.5 bg-[#801424] rounded-full" />
          </div>

          {/* Optional Subtitle */}
          {subtitle && (
            <p
              className="max-w-2xl text-sm sm:text-base text-gray-600 font-light leading-relaxed mb-2"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {subtitle}
            </p>
          )}

          {/* Optional Tabs / Filter Navigation */}
          {tabs && tabs.length > 0 && (
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200 shadow-sm">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange && onTabChange(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wider transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-[#801424] text-white shadow-md shadow-red-900/20 scale-102'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/80'
                    }`}
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {tab.icon && <span className="text-base">{tab.icon}</span>}
                    <span>{tab.label}</span>
                    {typeof tab.count === 'number' && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default PageHeader;
