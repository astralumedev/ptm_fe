import React, { useState, useEffect } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import NavigationBar from '../app/components/NavigationBar';
import Footer from '../app/components/Footer';
import api from '../services/api';
import { SiteSettings } from '../data/models/SiteSettings';

const ContactPage: React.FC = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    async function fetchSiteSettings() {
      try {
        const response = await api.getSiteSettings();
        setSiteSettings(response.data[0] || null);
      } catch (error) {
        console.error('Error fetching site settings:', error);
        setSiteSettings(null);
      }
    }
    fetchSiteSettings();
  }, []);

  return (
    <main className="min-h-screen">
      <NavigationBar />
      
      {/* Contact Information */}
      <div className="max-w-7xl mx-auto px-4 py-16" style={{ fontFamily: "'Montserrat', 'Times New Roman', serif" }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Details */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-medium mb-6" style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}>Get in Touch</h2>
              <p className="text-gray-600 mb-8">
                We&apos;d love to hear from you. Whether you have a question about our services, 
                want to know more about our location, or just want to say hello, we&apos;re here to help.
              </p>
            </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-mall-primary/10 p-3 rounded-full">
                    <FaPhoneAlt className="w-6 h-6 text-mall-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Phone</h3>
                    <a href={`tel:${siteSettings?.phone || '+977 61-520000'}`} className="text-gray-600 hover:text-mall-primary transition-colors">
                      {siteSettings?.phone || '+977 61-520000'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-mall-primary/10 p-3 rounded-full">
                    <FaEnvelope className="w-6 h-6 text-mall-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Email</h3>
                    <a href={`mailto:${siteSettings?.email || 'info@pokharatrademall.com'}`} className="text-gray-600 hover:text-mall-primary transition-colors">
                      {siteSettings?.email || 'info@pokharatrademall.com'}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-mall-primary/10 p-3 rounded-full">
                    <FaMapMarkerAlt className="w-6 h-6 text-mall-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Location</h3>
                    <p className="text-gray-600">
                      {siteSettings?.address || 'Chipledhunga, Mahendrapool, Pokhara 33700, Nepal'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <h3 className="text-xl font-medium mb-4" style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}>Business Hours</h3>
                <div className="space-y-2 text-gray-600">
                  <p>Sunday - Saturday: 10:00 AM - 8:00 PM</p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="h-[500px] rounded-lg overflow-hidden shadow-lg border border-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3515.2289973872224!2d83.98544837548625!3d28.21852027589381!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399594589d38bb13%3A0xc3b836473187c4a1!2sPokhara%20Trade%20Mall!5e0!3m2!1sne!2snp!4v1749486065634!5m2!1sne!2snp"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default ContactPage; 