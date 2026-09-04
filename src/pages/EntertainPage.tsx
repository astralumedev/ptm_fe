import { Link } from 'react-router-dom';
import {
  FaFilm,
  FaGamepad,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaArrowRight,
  FaTicketAlt,
  FaTv,
  FaVolumeUp,
  FaCouch,
  FaVrCardboard,
  FaStar,
  FaUsers,
} from 'react-icons/fa';
import NavigationBar from '../app/components/NavigationBar';
import PageHeader from '../app/components/PageHeader';
import Footer from '../app/components/Footer';

export default function EntertainPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Navigation */}
      <NavigationBar />

      {/* Hero Header */}
      <PageHeader
        title="Cinema & Entertainment"
        subtitle="Experience high-definition 4K laser cinema with Dolby Atmos, immerse yourself in 360° virtual reality gaming, and celebrate memorable gatherings on our Level 5 entertainment deck."
        badge="LEVEL 5 ENTERTAINMENT DECK"
        breadcrumbs={[
          { label: 'Entertain' },
        ]}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-24">

        {/* ========================================================================= */}
        {/* SPOTLIGHT 1: QFX CINEMAS */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl border border-gray-200/90 shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Media & Visual */}
          <div className="lg:col-span-6 relative h-80 sm:h-96 lg:h-full bg-gray-950 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80"
              alt="QFX Cinemas Pokhara Trade Mall"
              className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="bg-[#801424] text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                Cinema
              </span>
              <span className="bg-white/90 backdrop-blur-md text-gray-900 text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <FaMapMarkerAlt className="w-2.5 h-2.5 text-[#801424]" />
                5th Floor, Level 5
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="text-xs uppercase tracking-widest text-red-300 font-bold">Premium Screening</span>
              <h3 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}>
                QFX Cinemas Cineplex
              </h3>
            </div>
          </div>

          {/* Right Details & Specs */}
          <div className="lg:col-span-6 p-6 sm:p-8 md:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-[#801424] uppercase mb-1">
                  <FaFilm className="w-3.5 h-3.5" />
                  <span>State-of-the-Art Multiplex</span>
                </div>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug"
                  style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                >
                  The Gold Standard for Movies in Pokhara
                </h2>
                <p className="text-sm text-gray-600 font-light leading-relaxed mt-2">
                  Pokhara Trade Mall houses the city's finest QFX Cineplex, equipped with cutting-edge 4K RGB laser projection, multi-dimensional Dolby Atmos surround audio, and ultra-plush VIP seating for the ultimate cinematic escape.
                </p>
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1 text-left">
                  <FaTv className="w-4 h-4 text-[#801424]" />
                  <h4 className="text-xs font-bold text-gray-900">4K RGB Laser</h4>
                  <p className="text-[11px] text-gray-500">Hyper-vibrant color gamuts and pristine contrast.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1 text-left">
                  <FaVolumeUp className="w-4 h-4 text-[#801424]" />
                  <h4 className="text-xs font-bold text-gray-900">Dolby Atmos</h4>
                  <p className="text-[11px] text-gray-500">64-channel 3D acoustic immersion.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1 text-left">
                  <FaCouch className="w-4 h-4 text-[#801424]" />
                  <h4 className="text-xs font-bold text-gray-900">VIP Recliners</h4>
                  <p className="text-[11px] text-gray-500">Luxury leather ergonomic recliners.</p>
                </div>
              </div>

              {/* Operating Info */}
              <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500 flex items-center gap-1.5">
                    <FaClock className="w-3.5 h-3.5 text-[#801424]" /> Operating Hours:
                  </span>
                  <span className="font-bold text-gray-900">9:00 AM - 11:30 PM (Daily)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500 flex items-center gap-1.5">
                    <FaPhoneAlt className="w-3.5 h-3.5 text-[#801424]" /> Box Office Inquiries:
                  </span>
                  <span className="font-bold text-gray-900">+977 61-525500</span>
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
              <a
                href="https://qfxcinemas.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <FaTicketAlt className="w-3.5 h-3.5" />
                <span>Check Showtimes & Book</span>
              </a>
              <Link
                to="/mall-map"
                className="btn-secondary"
              >
                <span>5th Floor Map</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SPOTLIGHT 2: 4D VR GAME ZONE & ARCADE */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl border border-gray-200/90 shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Right on Desktop, Left on Mobile */}
          <div className="lg:col-span-6 lg:order-2 relative h-80 sm:h-96 lg:h-full bg-gray-950 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80"
              alt="4D VR Game Zone Pokhara Trade Mall"
              className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="bg-[#801424] text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                VR & Arcade
              </span>
              <span className="bg-white/90 backdrop-blur-md text-gray-900 text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <FaMapMarkerAlt className="w-2.5 h-2.5 text-[#801424]" />
                5th Floor, Unit 502
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="text-xs uppercase tracking-widest text-red-300 font-bold">Virtual Reality</span>
              <h3 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}>
                4D VR Game Zone
              </h3>
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-6 lg:order-1 p-6 sm:p-8 md:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-[#801424] uppercase mb-1">
                  <FaGamepad className="w-3.5 h-3.5" />
                  <span>High-Tech Amusement</span>
                </div>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug"
                  style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                >
                  Virtual Reality Thrills & Classic Arcade
                </h2>
                <p className="text-sm text-gray-600 font-light leading-relaxed mt-2">
                  Immerse yourself in mind-bending 360° virtual rollercoasters, race high-octane supercars on pneumatic simulators, challenge your friends to air hockey tournaments, and win exclusive prizes.
                </p>
              </div>

              {/* VR Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1 text-left">
                  <FaVrCardboard className="w-4 h-4 text-[#801424]" />
                  <h4 className="text-xs font-bold text-gray-900">360° VR Pods</h4>
                  <p className="text-[11px] text-gray-500">Full-motion rollercoasters & sci-fi space rides.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1 text-left">
                  <FaGamepad className="w-4 h-4 text-[#801424]" />
                  <h4 className="text-xs font-bold text-gray-900">Arcade Games</h4>
                  <p className="text-[11px] text-gray-500">Hoops, air hockey, motorcycle racing & dance revolution.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1 text-left">
                  <FaStar className="w-4 h-4 text-[#801424]" />
                  <h4 className="text-xs font-bold text-gray-900">Family Passes</h4>
                  <p className="text-[11px] text-gray-500">Discounted group tokens and weekend combo tickets.</p>
                </div>
              </div>

              {/* Operating Info */}
              <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500 flex items-center gap-1.5">
                    <FaClock className="w-3.5 h-3.5 text-[#801424]" /> Operating Hours:
                  </span>
                  <span className="font-bold text-gray-900">10:00 AM - 9:30 PM (Daily)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500 flex items-center gap-1.5">
                    <FaPhoneAlt className="w-3.5 h-3.5 text-[#801424]" /> Inquiries & Group Bookings:
                  </span>
                  <span className="font-bold text-gray-900">+977 9801987654</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
              <Link
                to="/mall-map"
                className="btn-primary"
              >
                <span>Find Game Zone on Map</span>
                <FaArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SPOTLIGHT 3: LIVE EVENTS, PRIVATE SCREENINGS & GATHERINGS */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-r from-gray-900 via-[#191114] to-gray-900 text-white rounded-3xl p-8 sm:p-10 md:p-12 relative overflow-hidden shadow-xl border border-gray-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-red-400 uppercase">
              <FaCalendarAlt className="w-3.5 h-3.5" />
              <span>Live Events & Private Screenings</span>
            </div>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide leading-tight"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              Host Private Screenings, Community Meetups & Festive Galas
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-light">
              From corporate movie nights and private cinema bookings at QFX Cinemas to seasonal music showcases, cultural festivals, and pop-up activations, Pokhara Trade Mall provides a premier stage for unforgettable entertainment experiences.
            </p>
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                to="/contact"
                className="btn-primary"
              >
                <FaUsers className="w-3.5 h-3.5" />
                <span>Plan A Gathering or Event</span>
              </Link>
              <Link
                to="/latest"
                className="btn-dark"
              >
                <span>Explore Latest Events & Shows</span>
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
