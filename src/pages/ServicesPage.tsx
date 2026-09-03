import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaSpa,
  FaUniversity,
  FaGraduationCap,
  FaDraftingCompass,
  FaParking,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaClock,
  FaArrowRight,
  FaChargingStation,
  FaShieldAlt,
  FaWheelchair,
  FaInfoCircle,
  FaEnvelope,
} from 'react-icons/fa';
import NavigationBar from '../app/components/NavigationBar';
import PageHeader, { PageHeaderTab } from '../app/components/PageHeader';
import Footer from '../app/components/Footer';
import api from '../services/api';
import { Store } from '../data/models/Store';

export default function ServicesPage() {
  const location = useLocation();
  const [allServices, setAllServices] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync scroll hash (e.g. #beauty, #finance, #education, #consultancy, #parking)
  useEffect(() => {
    if (location.hash) {
      const elementId = location.hash.replace('#', '');
      const el = document.getElementById(elementId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [location.hash]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await api.getStores({
          filter: { status: 'published', type: 'service' },
        });
        setAllServices(response.data || []);
      } catch (err) {
        console.error('Error loading services stores:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const beautyServices = allServices.filter(
    (s) => s.categorySlug === 'beauty' || s.tags?.some((t) => ['spa', 'salon', 'massage'].includes(t.toLowerCase()))
  );

  const financeServices = allServices.filter(
    (s) => s.categorySlug === 'finance' || s.tags?.some((t) => ['bank', 'atm', 'forex', 'loans'].includes(t.toLowerCase()))
  );

  const educationServices = allServices.filter(
    (s) => s.categorySlug === 'education' || s.tags?.some((t) => ['ielts', 'pte', 'study abroad', 'education'].includes(t.toLowerCase()))
  );

  const consultancyServices = allServices.filter(
    (s) => s.categorySlug === 'consultancy' || s.tags?.some((t) => ['architecture', 'engineering', 'surveying', 'consulting'].includes(t.toLowerCase()))
  );

  const tabs: PageHeaderTab[] = [
    { id: 'beauty', label: 'Beauty & Wellness', icon: <FaSpa className="w-3.5 h-3.5" /> },
    { id: 'finance', label: 'Banks & Finance', icon: <FaUniversity className="w-3.5 h-3.5" /> },
    { id: 'education', label: 'Abroad Study', icon: <FaGraduationCap className="w-3.5 h-3.5" /> },
    { id: 'consultancy', label: 'Engineering & Consultancies', icon: <FaDraftingCompass className="w-3.5 h-3.5" /> },
    { id: 'parking', label: 'Mall Parking & Map', icon: <FaParking className="w-3.5 h-3.5" /> },
  ];

  const handleTabClick = (tabId: string) => {
    const el = document.getElementById(tabId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderServiceCards = (stores: Store[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stores.map((store, index) => (
        <motion.div
          key={store.id}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="group bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
        >
          <div className="relative h-44 w-full overflow-hidden bg-gray-100">
            <img
              src={store.cover.data.full_url}
              alt={store.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />

            <span className="absolute top-3 right-3 text-[11px] font-semibold text-gray-900 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs border border-gray-200/80 flex items-center gap-1">
              <FaMapMarkerAlt className="w-2.5 h-2.5 text-[#801424]" />
              {store.floor || '3rd Floor'}
            </span>

            <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-widest text-white bg-[#801424]/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs">
              {store.category || 'Service'}
            </span>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0 shadow-xs">
                  <img src={store.logo.data.full_url} alt={`${store.name} logo`} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3
                    className="text-base font-bold text-gray-900 group-hover:text-[#801424] transition-colors leading-snug"
                    style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                  >
                    {store.name}
                  </h3>
                  {store.unitNumber && (
                    <p className="text-[11px] text-gray-500 font-medium">{store.unitNumber}</p>
                  )}
                </div>
              </div>

              {store.subtitle && (
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mt-1">{store.subtitle}</p>
              )}

              {store.tags && store.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {store.tags.slice(0, 3).map((tag, tIdx) => (
                    <span key={tIdx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              {store.operation_hours && (
                <div className="flex items-center text-[11px] text-gray-500 gap-1">
                  <FaClock className="w-3 h-3 text-[#801424]" />
                  <span>{store.operation_hours.split(';')[0]}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                {store.contact_number && (
                  <a
                    href={`tel:${store.contact_number}`}
                    className="text-gray-500 hover:text-[#801424] transition-colors p-1"
                    title={`Call ${store.name}`}
                  >
                    <FaPhoneAlt className="w-3 h-3" />
                  </a>
                )}
                <Link
                  to={`/shops/details/${store.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#801424] hover:text-[#5a0c18] group-hover:translate-x-0.5 transition-all no-underline"
                >
                  <span>Inquire</span>
                  <FaArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Navigation */}
      <NavigationBar />

      {/* Hero Header */}
      <PageHeader
        title="Services & Directory"
        subtitle="Explore top educational consultancies, banking hubs, architecture studios, and luxury spas alongside complete mall guest amenities."
        badge="BUSINESS & GUEST SERVICES"
        breadcrumbs={[
          { label: 'Services' },
        ]}
        tabs={tabs}
        onTabChange={handleTabClick}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-24">

        {/* ========================================================================= */}
        {/* SECTION 1: BEAUTY & WELLNESS */}
        {/* ========================================================================= */}
        <section id="beauty" className="scroll-mt-28 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-[#801424] uppercase mb-1">
                <FaSpa className="w-3.5 h-3.5" />
                <span>Relaxation & Grooming</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-wide"
                style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
              >
                Beauty & Wellness
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md">
              Ayurvedic body therapies, hair styling, skin clinics, and luxury grooming on our Dedicated Service wings.
            </p>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center"><div className="w-8 h-8 border-3 border-[#801424] border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            renderServiceCards(beautyServices)
          )}
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: BANKS & FINANCIAL SERVICES */}
        {/* ========================================================================= */}
        <section id="finance" className="scroll-mt-28 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-[#801424] uppercase mb-1">
                <FaUniversity className="w-3.5 h-3.5" />
                <span>Banking & Forex</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-wide"
                style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
              >
                Banks & Financial Services
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md">
              Full-service commercial bank branches, foreign currency exchange, remittance counters, and 24/7 ATM lounge.
            </p>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center"><div className="w-8 h-8 border-3 border-[#801424] border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            renderServiceCards(financeServices)
          )}
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: ABROAD STUDY & EDUCATIONAL INSTITUTES */}
        {/* ========================================================================= */}
        <section id="education" className="scroll-mt-28 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-[#801424] uppercase mb-1">
                <FaGraduationCap className="w-3.5 h-3.5" />
                <span>Global Education & Test Prep</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-wide"
                style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
              >
                Abroad Study & Education
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md">
              Certified overseas education consultancies, high-score IELTS/PTE training labs, and visa counseling hubs.
            </p>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center"><div className="w-8 h-8 border-3 border-[#801424] border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            renderServiceCards(educationServices)
          )}
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: ENGINEERING & PROFESSIONAL CONSULTANCIES */}
        {/* ========================================================================= */}
        <section id="consultancy" className="scroll-mt-28 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-[#801424] uppercase mb-1">
                <FaDraftingCompass className="w-3.5 h-3.5" />
                <span>Professional Studios</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-wide"
                style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
              >
                Engineering & Consultancies
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md">
              Architectural modeling, structural design, land GPS surveying, GIS mapping, and legal corporate advisory.
            </p>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center"><div className="w-8 h-8 border-3 border-[#801424] border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            renderServiceCards(consultancyServices)
          )}
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: MALL SERVICES, PARKING & GUEST CONVENIENCES */}
        {/* ========================================================================= */}
        <section id="parking" className="scroll-mt-28 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-[#801424] uppercase mb-1">
                <FaInfoCircle className="w-3.5 h-3.5" />
                <span>Guest Amenities</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-wide"
                style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
              >
                Mall Services & Parking Info
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md">
              Safe underground multi-level parking, wayfinding map, wheelchair accessibility, and 24/7 security assistance.
            </p>
          </div>

          {/* 3-Column Amenities Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Parking Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#801424] flex items-center justify-center text-xl">
                <FaParking />
              </div>
              <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}>
                Underground Parking
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                Multi-level secured basement parking with capacity for 200+ four-wheelers and 500+ two-wheelers. Equipped with automated boom barriers and EV charging stations.
              </p>
              <ul className="text-xs text-gray-600 space-y-2 pt-2 border-t border-gray-100">
                <li className="flex items-center gap-2">
                  <FaChargingStation className="w-3.5 h-3.5 text-[#801424]" /> Fast EV Charging Bays Available
                </li>
                <li className="flex items-center gap-2">
                  <FaShieldAlt className="w-3.5 h-3.5 text-[#801424]" /> 24/7 CCTV & Security Patrol
                </li>
              </ul>
            </div>

            {/* Mall Map & Navigation */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#801424] flex items-center justify-center text-xl">
                <FaMapMarkerAlt />
              </div>
              <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}>
                Interactive Mall Map
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                Navigate all 6 levels effortlessly. Locate escalators, elevators, restrooms, ATMs, emergency exits, and specific retail outlets in seconds.
              </p>
              <div className="pt-2 border-t border-gray-100">
                <Link
                  to="/mall-map"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#801424] hover:text-[#5a0c18] no-underline"
                >
                  <span>Launch Interactive Map</span>
                  <FaArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Guest Services & Accessibility */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#801424] flex items-center justify-center text-xl">
                <FaWheelchair />
              </div>
              <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}>
                Guest Assistance
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                Customer service desk located at the Ground Floor main entrance. Free wheelchair assistance, lost & found registry, baby care nursing rooms, and luggage holding.
              </p>
              <div className="pt-2 border-t border-gray-100 text-xs text-gray-600 space-y-1">
                <p><strong>Help Desk Hotline:</strong> +977 61-520000</p>
                <p><strong>Hours:</strong> 10:00 AM - 8:00 PM</p>
              </div>
            </div>
          </div>

          {/* Get In Touch CTA Banner */}
          <div className="bg-gradient-to-r from-gray-900 via-[#1a1215] to-gray-900 text-white rounded-3xl p-8 sm:p-10 md:p-12 relative overflow-hidden shadow-xl border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs uppercase tracking-widest text-red-400 font-bold">Inquiries & Leasing</span>
              <h3
                className="text-2xl sm:text-3xl font-bold"
                style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
              >
                Get in Touch with Mall Management
              </h3>
              <p className="text-sm text-gray-300 font-light">
                Have questions about corporate space leasing, pop-up kiosks, event space bookings, or mall services? Reach out to our dedicated support team.
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="btn-primary"
              >
                <FaEnvelope className="w-3.5 h-3.5" />
                <span>Contact Us</span>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
