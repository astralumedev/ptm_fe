'use client'

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTiktok, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { SiteSettings } from '@/data/models/SiteSettings';
import api from '@/services/api';

const Footer: React.FC = () => {
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

  const googleMapsUrl = "https://www.google.com/maps?ll=28.223844,83.986463&z=18&t=m&hl=en&gl=NP&mapclient=embed&cid=13569072981790925385";

  const rawPhones = siteSettings?.phone 
    ? siteSettings.phone.split('/').map(p => p.trim()) 
    : ['+977 61-520000', '+977 9856012345'];

  if (loading) {
    return (
      <footer className="relative bg-gray-100 text-gray-800 py-14 border-t border-gray-200" style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-start">
            <img
              src="/tm_logo_nobg.png"
              alt="Pokhara Trade Mall Logo"
              className='w-60 md:w-72 h-auto object-contain drop-shadow-sm'
            />
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative bg-gray-100 text-gray-800 py-16 px-6 md:px-12 lg:px-16 border-t border-gray-200" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-14">
        
        {/* Column 1: Logo & Overview */}
        <div className="lg:col-span-1 flex flex-col items-start">
          <img
            src="/tm_logo_nobg.png"
            alt="Pokhara Trade Mall Logo"
            className='w-60 md:w-72 h-auto object-contain drop-shadow-sm transition-transform hover:scale-105'
          />
          <p className="text-xs text-gray-600 mt-4 leading-relaxed">
            Pokhara's premier destination for shopping, dining, services, and entertainment.
          </p>
        </div>

        {/* Column 2: EXPLORE */}
        <div>
          <h4 className="font-semibold text-base mb-5 text-gray-900 tracking-wider uppercase" style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}>
            EXPLORE
          </h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link to="/page/about_us" className="text-gray-700 hover:text-[#c22328] transition-colors">
                Our Story
              </Link>
            </li>
            <li>
              <Link to="/page/business" className="text-gray-700 hover:text-[#c22328] transition-colors">
                Businesses
              </Link>
            </li>
            <li>
              <Link to="/blogs" className="text-gray-700 hover:text-[#c22328] transition-colors">
                Events
              </Link>
            </li>
            <li>
              <Link to="/page/privacy_policy" className="text-gray-700 hover:text-[#c22328] transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-gray-700 hover:text-[#c22328] transition-colors">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Connect With Us */}
        <div>
          <h4 className="font-semibold text-base mb-5 text-gray-900 tracking-wider uppercase" style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}>
            Connect With Us
          </h4>
          <ul className="space-y-3 text-sm mb-5">
            {rawPhones.map((phone, idx) => (
              <li key={idx}>
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="group flex items-center text-gray-700 hover:text-[#c22328] transition-colors"
                >
                  <FaPhoneAlt className="w-4 h-4 mr-3 text-gray-800 group-hover:text-[#c22328] transition-colors flex-shrink-0" />
                  <span className="leading-tight">{phone}</span>
                </a>
              </li>
            ))}
            <li>
              <a
                href={`mailto:${siteSettings?.email || 'info@pokharatrademall.com'}`}
                className="group flex items-center text-gray-700 hover:text-[#c22328] transition-colors"
              >
                <FaEnvelope className="w-4 h-4 mr-3 text-gray-800 group-hover:text-[#c22328] transition-colors flex-shrink-0" />
                <span className="leading-tight">{siteSettings?.email || 'info@pokharatrademall.com'}</span>
              </a>
            </li>
          </ul>

          <div className="flex items-center space-x-3 pt-1">
            {siteSettings?.facebook && (
              <a href={siteSettings.facebook} className="text-gray-800 hover:text-[#2e3094] transition-colors p-2 bg-white rounded-full border border-gray-300 shadow-xs" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebook className="w-4 h-4" />
              </a>
            )}
            {siteSettings?.instagram && (
              <a href={siteSettings.instagram} className="text-gray-800 hover:text-[#c22328] transition-colors p-2 bg-white rounded-full border border-gray-300 shadow-xs" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram className="w-4 h-4" />
              </a>
            )}
            {siteSettings?.tiktok && (
              <a href={siteSettings.tiktok} className="text-gray-800 hover:text-[#2e3094] transition-colors p-2 bg-white rounded-full border border-gray-300 shadow-xs" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <FaTiktok className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Column 4: Mall Timings */}
        <div>
          <h4 className="font-semibold text-base mb-5 text-gray-900 tracking-wider uppercase" style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}>
            Mall Timings
          </h4>
          <div className="space-y-3.5 text-sm">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-0.5">Weekdays</span>
              <span className="text-gray-700">10:00 AM - 8:00 PM</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-0.5">Weekends</span>
              <span className="text-gray-700">10:00 AM - 10:00 PM</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider block mb-0.5">QFX Cinemas</span>
              <span className="text-gray-700">07:00 AM - 12:00 AM</span>
            </div>
          </div>
        </div>

        {/* Column 5: Find Us */}
        <div>
          <h4 className="font-semibold text-base mb-5 text-gray-900 tracking-wider uppercase" style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}>
            Find Us
          </h4>
          <div className="text-sm text-gray-700 space-y-1.5 mb-5">
            <p className="font-medium text-gray-900">Pokhara Trade Mall</p>
            <p className="text-xs leading-relaxed text-gray-600">Chiple Dhunga Road, पोखरा 33700, Nepal</p>
          </div>
          
          <a 
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center text-xs font-medium text-gray-800 hover:text-[#c22328] transition-colors bg-white px-3.5 py-2.5 rounded-md border border-gray-300 shadow-xs"
          >
            <FaMapMarkerAlt className="w-3.5 h-3.5 mr-2 text-gray-800 group-hover:text-[#c22328] transition-colors" />
            View on Google Maps
          </a>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-gray-300 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600">
        <p>© {new Date().getFullYear()} Pokhara Trade Mall. All rights reserved.</p>
        <div className="flex space-x-6 mt-3 md:mt-0">
          <Link to="/page/privacy_policy" className="hover:text-[#c22328] transition-colors">Privacy Policy</Link>
          <Link to="/page/about_us" className="hover:text-[#c22328] transition-colors">About Us</Link>
          <Link to="/contact" className="hover:text-[#c22328] transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;