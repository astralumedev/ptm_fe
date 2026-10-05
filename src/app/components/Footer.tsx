'use client'

import React, { useEffect, useState } from 'react';
import { FaFacebook, FaInstagram, FaTiktok, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { SiteSettings } from '@/data/models/SiteSettings';
import api from '@/services/api';
import { useBlock } from '@/content/block';
import { siteFooterBlock, useMallHours } from '@/content/blocks/site';
import { CmsLink } from '@/content/CmsLink';

const Footer: React.FC = () => {
  // Dark tones are restyled in globals.css (.ptm-footer[data-tone]) so the markup stays one version.

  const footer = useBlock(siteFooterBlock);
  const hours = useMallHours();
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const response = await api.getSiteSettings();
        setSiteSettings(response.data[0] || null);
      } catch (error) {
        console.error('Error fetching site settings:', error);
        setSiteSettings(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteSettings();
  }, []);

  const rawPhones = siteSettings?.phone 
    ? siteSettings.phone.split('/').map(p => p.trim()) 
    : [];

  if (loading) {
    return (
      <footer data-tone={footer.tone || 'light'} className="ptm-footer relative bg-gray-100 text-gray-800 py-14 border-t border-gray-200" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-start">
            <img loading="lazy" decoding="async"
              src={footer.logoUrl}
              alt="Pokhara Trade Mall Logo"
              className='w-48 sm:w-60 md:w-72 h-auto object-contain drop-shadow-sm'
            />
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer data-tone={footer.tone || 'light'} className="ptm-footer relative bg-gray-100 text-gray-800 pt-12 pb-[max(2rem,env(safe-area-inset-bottom))] md:py-16 px-5 md:px-12 lg:px-16 border-t border-gray-200" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-10 md:gap-12 lg:gap-14">
        
        {/* Column 1: Logo & Overview */}
        <div className="col-span-2 lg:col-span-1 flex flex-col items-start">
          <img loading="lazy" decoding="async"
            src={footer.logoUrl}
            alt="Pokhara Trade Mall Logo"
            className='w-48 sm:w-60 md:w-72 h-auto object-contain drop-shadow-sm transition-transform hover:scale-105'
          />
          <p className="text-xs text-gray-600 mt-4 leading-relaxed">
            {footer.tagline}
          </p>
        </div>

        {/* Column 2: EXPLORE */}
        <div>
          <h4 className="font-semibold text-base mb-5 text-gray-900 tracking-wider uppercase" style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}>
            {footer.exploreTitle}
          </h4>
          <ul className="space-y-1 text-sm -my-1.5">
            {(footer.exploreLinks || []).filter((l) => l && l.label).map((l, i) => (
              <li key={i}>
                <CmsLink href={l.href} className="inline-block py-1.5 text-gray-700 hover:text-[#801424] transition-colors">
                  {l.label}
                </CmsLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Connect With Us */}
        <div className="col-span-2 sm:col-span-1 order-last sm:order-none">
          <h4 className="font-semibold text-base mb-5 text-gray-900 tracking-wider uppercase" style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}>
            {footer.connectTitle}
          </h4>
          <ul className="space-y-1 text-sm mb-4 -my-1.5">
            {rawPhones.map((phone, idx) => (
              <li key={idx}>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="group flex items-center py-1.5 text-gray-700 hover:text-[#801424] transition-colors"
                >
                  <FaPhoneAlt className="w-4 h-4 mr-3 text-gray-800 group-hover:text-[#801424] transition-colors flex-shrink-0" />
                  <span className="leading-tight">{phone}</span>
                </a>
              </li>
            ))}
            {siteSettings?.email && <li>
              <a
                href={`mailto:${siteSettings.email}`}
                className="group flex items-center py-1.5 text-gray-700 hover:text-[#801424] transition-colors break-all"
              >
                <FaEnvelope className="w-4 h-4 mr-3 text-gray-800 group-hover:text-[#801424] transition-colors flex-shrink-0" />
                <span className="leading-tight">{siteSettings.email}</span>
              </a>
            </li>}
          </ul>

          <div className="flex items-center gap-2.5 pt-1">
            {siteSettings?.facebook && (
              <a href={siteSettings.facebook} className="text-gray-800 hover:text-[#2e3094] transition-colors p-3 bg-white rounded-full border border-gray-300 shadow-xs" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebook className="w-4 h-4" />
              </a>
            )}
            {siteSettings?.instagram && (
              <a href={siteSettings.instagram} className="text-gray-800 hover:text-[#801424] transition-colors p-3 bg-white rounded-full border border-gray-300 shadow-xs" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram className="w-4 h-4" />
              </a>
            )}
            {siteSettings?.twitter && (
              <a href={siteSettings.twitter} className="text-gray-800 hover:text-[#2e3094] transition-colors p-3 bg-white rounded-full border border-gray-300 shadow-xs" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                <FaXTwitter className="w-4 h-4" />
              </a>
            )}
            {siteSettings?.tiktok && (
              <a href={siteSettings.tiktok} className="text-gray-800 hover:text-[#2e3094] transition-colors p-3 bg-white rounded-full border border-gray-300 shadow-xs" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <FaTiktok className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Column 4: Mall Timings */}
        <div>
          <h4 className="font-semibold text-base mb-5 text-gray-900 tracking-wider uppercase" style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}>
            {footer.timingsTitle}
          </h4>
          <div className="space-y-3.5 text-sm">
            {(hours.rows || []).filter((r) => r && r.label).map((r, i) => (
              <div key={i}>
                <span className="text-xs text-gray-500 uppercase tracking-wider block mb-0.5">{r.label}</span>
                <span className="text-gray-700">{r.hours}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 5: Find Us */}
        <div className="col-span-2 sm:col-span-1">
          <h4 className="font-semibold text-base mb-5 text-gray-900 tracking-wider uppercase" style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}>
            {footer.findUsTitle}
          </h4>
          <div className="text-sm text-gray-700 space-y-1.5 mb-5">
            <p className="font-medium text-gray-900">{footer.mallName}</p>
            <p className="text-xs leading-relaxed text-gray-600">{siteSettings?.address}</p>
          </div>
          
          <a 
            href={footer.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center text-xs font-medium text-gray-800 hover:text-[#801424] transition-colors bg-white px-4 py-3 rounded-md border border-gray-300 shadow-xs"
          >
            <FaMapMarkerAlt className="w-3.5 h-3.5 mr-2 text-gray-800 group-hover:text-[#801424] transition-colors" />
            {footer.mapsLabel}
          </a>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-gray-300 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600">
        <p className="text-center">{(footer.copyright || '').split('{year}').join(String(new Date().getFullYear()))}</p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 mt-2 md:mt-0">
          {(footer.bottomLinks || []).filter((l) => l && l.label).map((l, i) => (
            <CmsLink key={i} href={l.href} className="py-2 hover:text-[#801424] transition-colors">{l.label}</CmsLink>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;