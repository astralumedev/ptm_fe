import { useState, useEffect } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane } from 'react-icons/fa';
import NavigationBar from '../app/components/NavigationBar';
import PageHeader from '../app/components/PageHeader';
import Footer from '../app/components/Footer';
import api from '../services/api';
import { SiteSettings } from '../data/models/SiteSettings';

const ContactPage: React.FC = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen font-montserrat bg-neutral-50/50 text-gray-900">
      <NavigationBar />
      
      <PageHeader
        title="Contact & Inquiries"
        subtitle="Get in touch with Pokhara Trade Mall administration, retail leasing management, or visitor assistance."
        badge="We're Here to Help"
        breadcrumbs={[
          { label: 'Contact', href: '/contact' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Top Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#801424] flex items-center justify-center text-xl mb-4">
              <FaPhoneAlt />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 font-arizona-flare">Direct Phone Lines</h3>
            <p className="text-xs text-gray-500 mb-4">Customer desk & management inquiries</p>
            <a
              href={`tel:${siteSettings?.phone?.replace(/\s+/g, '') || '+97761520000'}`}
              className="text-sm font-bold text-[#801424] hover:text-[#600f1b] transition-colors block"
            >
              {siteSettings?.phone || '+977 61-520000 / +977 9856012345'}
            </a>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#801424] flex items-center justify-center text-xl mb-4">
              <FaEnvelope />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 font-arizona-flare">Email Support</h3>
            <p className="text-xs text-gray-500 mb-4">General questions, media & feedback</p>
            <a
              href={`mailto:${siteSettings?.email || 'info@pokharatrademall.com'}`}
              className="text-sm font-bold text-[#801424] hover:text-[#600f1b] transition-colors block"
            >
              {siteSettings?.email || 'info@pokharatrademall.com'}
            </a>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#801424] flex items-center justify-center text-xl mb-4">
              <FaClock />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1 font-arizona-flare">Operating Hours</h3>
            <p className="text-xs text-gray-500 mb-1">Retail: 10:00 AM – 8:00 PM (Weekdays)</p>
            <p className="text-xs text-gray-500">QFX Cinema: 7:00 AM – 12:00 AM</p>
          </div>
        </div>

        {/* Main Grid: Form & Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Inquiry Form */}
          <div className="lg:col-span-6 bg-white p-8 sm:p-10 rounded-3xl border border-gray-200/80 shadow-sm">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#801424]">Send a Message</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-arizona-flare mt-1">
                How Can We Help You?
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Fill out the form below and our team will get back to you within 24 hours.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <h4 className="text-lg font-bold text-emerald-900 font-arizona-flare">Thank You!</h4>
                <p className="text-xs text-emerald-700">
                  Your inquiry has been submitted successfully. Our team will contact you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-secondary text-xs mt-4"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ramesh Shrestha"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#801424] focus:ring-1 focus:ring-[#801424] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+977 98..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#801424] focus:ring-1 focus:ring-[#801424] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#801424] focus:ring-1 focus:ring-[#801424] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Inquiry Category
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#801424] focus:ring-1 focus:ring-[#801424] transition-colors bg-white"
                  >
                    <option value="general">General Visitor Inquiry</option>
                    <option value="leasing">Store & Booth Leasing</option>
                    <option value="marketing">Brand Promotion & Events</option>
                    <option value="media">Press & Media Relations</option>
                    <option value="lost_found">Lost & Found</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us how we can assist you..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#801424] focus:ring-1 focus:ring-[#801424] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full mt-2"
                >
                  <FaPaperPlane className="w-3.5 h-3.5" />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}

          </div>

          {/* Location Details & Map */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#801424] flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 font-arizona-flare">Pokhara Trade Mall</h3>
                  <p className="text-xs text-gray-500">Chipledhunga Road, Ward 4 / 9, Pokhara 33700, Nepal</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Centrally positioned in Pokhara's bustling retail core, reachable within 10 minutes from Lakeside and walking distance from Mahendrapul.
              </p>
            </div>

            {/* Embedded Google Map */}
            <div className="h-[380px] rounded-3xl overflow-hidden shadow-lg border border-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3515.2289973872224!2d83.98544837548625!3d28.21852027589381!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399594589d38bb13%3A0xc3b836473187c4a1!2sPokhara%20Trade%20Mall!5e0!3m2!1sne!2snp!4v1749486065634!5m2!1sne!2snp"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Pokhara Trade Mall Google Maps Location"
              />
            </div>

          </div>

        </div>

      </div>

      <Footer />
    </main>
  );
};

export default ContactPage;