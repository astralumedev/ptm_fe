import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FaFilm,
  FaTicketAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSearch,
  FaExternalLinkAlt,
  FaTv,
  FaVolumeUp,
  FaCouch,
  FaArrowRight,
  FaSpinner,
} from 'react-icons/fa';
import NavigationBar from '../app/components/NavigationBar';
import Footer from '../app/components/Footer';
import { useBlock } from '../content/block';
import { CmsLink } from '../content/CmsLink';
import { CmsIcon } from '../content/icons';
import { qfxPageBlock } from '../content/blocks/pages';
import { fetchQfxMoviesWithCache, getCachedQfxMovies, type ParsedQfxMovie } from '../services/qfxService';

const serif = { fontFamily: "'Arizona Flare', 'Times New Roman', serif" };

export type QfxMovieItem = ParsedQfxMovie;

export default function QfxPage() {
  const content = useBlock(qfxPageBlock);
  
  // Synchronously initialize from 1-day cache if available
  const [movies, setMovies] = useState<QfxMovieItem[]>(() => {
    const cached = getCachedQfxMovies();
    return cached && cached.length > 0 ? cached : [];
  });
  const [loading, setLoading] = useState<boolean>(() => movies.length === 0);
  const [activeTab, setActiveTab] = useState<'all' | 'running' | 'upcoming'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  // Fetch live running & upcoming movie data directly from QFX public API with 1-day cache
  useEffect(() => {
    let cancelled = false;
    const loadMovies = async () => {
      try {
        if (movies.length === 0) setLoading(true);
        const parsed = await fetchQfxMoviesWithCache();
        if (!cancelled && parsed.length > 0) {
          setMovies(parsed);
        }
      } catch {
        // network or parse error
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMovies();
    return () => { cancelled = true; };
  }, []);

  // Filtered lists
  const runningMovies = useMemo(() => movies.filter((m) => !m.isUpcoming), [movies]);
  const upcomingMovies = useMemo(() => movies.filter((m) => m.isUpcoming), [movies]);

  const languages = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => {
      m.language.split('/').forEach((l) => set.add(l.trim()));
    });
    return Array.from(set).filter(Boolean);
  }, [movies]);

  const displayedMovies = useMemo(() => {
    let list = movies;
    if (activeTab === 'running') {
      list = runningMovies;
    } else if (activeTab === 'upcoming') {
      list = upcomingMovies;
    }

    if (selectedLanguage !== 'all') {
      list = list.filter((m) => m.language.toLowerCase().includes(selectedLanguage.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.genre.toLowerCase().includes(q) ||
          m.language.toLowerCase().includes(q) ||
          m.synopsis.toLowerCase().includes(q)
      );
    }

    return list;
  }, [movies, activeTab, selectedLanguage, searchQuery, runningMovies, upcomingMovies]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col selection:bg-rose-500 selection:text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Navigation */}
      <NavigationBar />

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#191114] via-gray-950 to-gray-950 border-b border-gray-800/80 pt-8 pb-12 md:pt-14 md:pb-16">
        {/* Subtle Ambient Red Light Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#801424]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/4 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Page Title */}
          <h1
            className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-wider uppercase text-white mb-3"
            style={serif}
          >
            {content.title || 'QFX CINEMAS'}
          </h1>

          <div className="flex items-center justify-center gap-2 my-4">
            <div className="w-12 h-0.5 bg-[#801424] rounded-full" />
            <div className="w-2.5 h-2.5 rotate-45 bg-[#801424] rounded-xs" />
            <div className="w-12 h-0.5 bg-[#801424] rounded-full" />
          </div>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-gray-300 text-sm sm:text-base md:text-lg font-light leading-relaxed mb-8">
            {content.subtitle}
          </p>

          {/* Quick Multiplex Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-300">
            <div className="flex items-center gap-2 bg-gray-900/80 border border-gray-800 px-3.5 py-2 rounded-xl backdrop-blur-md">
              <FaTv className="text-rose-400 w-4 h-4" />
              <span>4K RGB Laser Projection</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-900/80 border border-gray-800 px-3.5 py-2 rounded-xl backdrop-blur-md">
              <FaVolumeUp className="text-amber-400 w-4 h-4" />
              <span>Dolby Atmos 64-Ch 3D Sound</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-900/80 border border-gray-800 px-3.5 py-2 rounded-xl backdrop-blur-md">
              <FaCouch className="text-rose-400 w-4 h-4" />
              <span>VIP Recliner Seating</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-900/80 border border-gray-800 px-3.5 py-2 rounded-xl backdrop-blur-md">
              <FaMapMarkerAlt className="text-amber-400 w-4 h-4" />
              <span>Pokhara Trade Mall, Chipledhunga</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14 space-y-12">
        
        {/* Filter / Search Bar & Tabs */}
        <div className="bg-gray-900/90 border border-gray-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl backdrop-blur-md space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Tab Buttons */}
            <div className="flex items-center bg-gray-950 p-1.5 rounded-xl border border-gray-800 overflow-x-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  activeTab === 'all'
                    ? 'bg-[#801424] text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span>All Movies</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-gray-200 font-bold">
                  {movies.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('running')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  activeTab === 'running'
                    ? 'bg-[#801424] text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Now Showing</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-gray-200 font-bold">
                  {runningMovies.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  activeTab === 'upcoming'
                    ? 'bg-[#801424] text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <FaCalendarAlt className="w-3 h-3 text-amber-400" />
                <span>Upcoming & Next Change</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 text-gray-200 font-bold">
                  {upcomingMovies.length}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies by title, genre, language..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#801424] focus:ring-1 focus:ring-[#801424] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Language filter pills */}
          {languages.length > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-800/80 overflow-x-auto text-xs pb-1">
              <span className="text-gray-400 font-medium whitespace-nowrap mr-1">Language:</span>
              <button
                onClick={() => setSelectedLanguage('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                  selectedLanguage === 'all'
                    ? 'bg-white text-gray-950 font-bold'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                All Languages
              </button>
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                    selectedLanguage.toLowerCase() === lang.toLowerCase()
                      ? 'bg-white text-gray-950 font-bold'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section Heading Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-gray-800">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-wide text-white" style={serif}>
              {activeTab === 'running'
                ? content.nowShowingHeading || 'Now Showing in Pokhara'
                : activeTab === 'upcoming'
                ? content.upcomingHeading || 'Upcoming & Next Change'
                : 'All QFX Theatrical Releases'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              {activeTab === 'running'
                ? content.nowShowingSub || 'Currently running at Pokhara Trade Mall. Select any movie to book directly on QFX.'
                : activeTab === 'upcoming'
                ? content.upcomingSub || 'Arriving soon to QFX Cinemas Pokhara Trade Mall. Advance booking on QFX.'
                : 'Browse all active theatrical releases and upcoming blockbusters.'}
            </p>
          </div>

          <div className="text-xs font-semibold text-gray-400 bg-gray-900 border border-gray-800 px-3.5 py-1.5 rounded-full flex items-center gap-2">
            {loading && <FaSpinner className="w-3 h-3 animate-spin text-rose-400" />}
            <span>Showing <strong className="text-white font-bold">{displayedMovies.length}</strong> movies</span>
          </div>
        </div>

        {/* VERTICAL MOVIE LISTINGS (Loading Skeleton vs List) */}
        {loading && movies.length === 0 ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-900/60 border border-gray-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl animate-pulse grid grid-cols-1 md:grid-cols-12 min-h-[380px]"
              >
                <div className="md:col-span-4 lg:col-span-3 bg-gray-950 p-6 flex flex-col justify-between min-h-[320px]">
                  <div className="flex justify-between">
                    <div className="w-24 h-6 bg-gray-800 rounded-full" />
                    <div className="w-20 h-6 bg-gray-800 rounded-full" />
                  </div>
                  <div className="w-28 h-6 bg-gray-800 rounded-full" />
                </div>
                <div className="md:col-span-8 lg:col-span-9 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="w-20 h-5 bg-rose-900/30 rounded-full" />
                      <div className="w-24 h-5 bg-gray-800 rounded-full" />
                    </div>
                    <div className="w-3/4 h-8 bg-gray-800 rounded-lg" />
                    <div className="w-full h-16 bg-gray-800/60 rounded-lg" />
                  </div>
                  <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between">
                    <div className="flex gap-3">
                      <div className="w-36 h-11 bg-rose-900/40 rounded-xl" />
                      <div className="w-28 h-11 bg-gray-800 rounded-xl" />
                    </div>
                    <div className="w-32 h-5 bg-gray-800 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedMovies.length === 0 ? (
          <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-12 text-center space-y-4">
            <FaFilm className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-xl font-bold text-white">No movies found</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              We couldn’t find any movies matching your current search or filter criteria. Try adjusting the search query or selecting "All Movies".
            </p>
            <button
              onClick={() => {
                setActiveTab('all');
                setSearchQuery('');
                setSelectedLanguage('all');
              }}
              className="mt-2 px-6 py-2.5 bg-[#801424] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#9c182c] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {displayedMovies.map((movie, index) => (
              <motion.article
                key={`${movie.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
                viewport={{ once: true }}
                className="bg-gray-900/80 border border-gray-800 hover:border-rose-900/60 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-rose-950/20 group grid grid-cols-1 md:grid-cols-12"
              >
                {/* Movie Poster (Left Column) */}
                <div className="md:col-span-4 lg:col-span-3 relative bg-gray-950 overflow-hidden flex-shrink-0 min-h-[360px] md:min-h-full">
                  <img loading="lazy" decoding="async"
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-black/50 md:hidden" />

                  {/* Status Badge (Top Left) */}
                  <div className="absolute top-3 left-3 z-10">
                    {!movie.isUpcoming ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-emerald-600/90 backdrop-blur-md px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Now Showing
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-200 bg-amber-900/80 backdrop-blur-md px-3 py-1 rounded-full uppercase tracking-wider border border-amber-600/40 shadow-md">
                        <FaCalendarAlt className="w-2.5 h-2.5" />
                        Coming Soon
                      </span>
                    )}
                  </div>

                  {/* Rating & Duration Badge (Top Right) */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center text-[11px] font-semibold text-white/90 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                      {movie.rating} • {movie.duration}
                    </span>
                  </div>

                  {/* Format Pill (Bottom Left on Poster) */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <span className="inline-flex items-center text-[10px] font-bold text-amber-300 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/40 uppercase tracking-widest shadow-md">
                      <FaFilm className="w-2.5 h-2.5 mr-1.5 text-amber-400" />
                      {movie.format}
                    </span>
                  </div>
                </div>

                {/* Movie Details (Right Column) */}
                <div className="md:col-span-8 lg:col-span-9 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    {/* Meta Row: Language & Genre */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#801424] bg-[#801424]/15 border border-[#801424]/30 px-3 py-0.5 rounded-full">
                        {movie.language}
                      </span>
                      <span className="text-xs font-medium text-rose-300/80 uppercase tracking-wider">
                        {movie.genre}
                      </span>
                      {movie.releaseDate && (
                        <span className="text-xs text-gray-500 font-light ml-auto hidden sm:inline-block">
                          Release: {movie.releaseDate}
                        </span>
                      )}
                    </div>

                    {/* Movie Title */}
                    <h3
                      className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wide leading-tight group-hover:text-rose-200 transition-colors"
                      style={serif}
                    >
                      {movie.title}
                    </h3>

                    {/* Synopsis / Plot */}
                    {movie.synopsis && (
                      <p className="text-sm sm:text-base text-gray-300 font-light leading-relaxed">
                        {movie.synopsis}
                      </p>
                    )}

                    {/* Cast & Director (if available) */}
                    {(movie.director || movie.cast) && (
                      <div className="text-xs text-gray-400 space-y-1 pt-1">
                        {movie.director && <div><span className="text-gray-500 font-medium">Director:</span> {movie.director}</div>}
                        {movie.cast && <div><span className="text-gray-500 font-medium">Cast:</span> {movie.cast}</div>}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action CTAs */}
                  <div className="pt-4 border-t border-gray-800/80 flex flex-wrap items-center gap-4 justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Direct Movie Booking Link */}
                      <a
                        href={movie.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#801424] hover:bg-[#9c182c] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg hover:shadow-rose-950/50 transition-all duration-300 group/btn"
                      >
                        <FaTicketAlt className="w-3.5 h-3.5 text-rose-200" />
                        <span>{content.reserveLabel || 'Reserve Seats'}</span>
                        <FaExternalLinkAlt className="w-3 h-3 text-rose-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </a>

                      {/* Direct QFX Portal / Mall Map */}
                      <CmsLink
                        href="/mall-map"
                        className="inline-flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs sm:text-sm font-semibold rounded-xl border border-gray-700 transition-colors"
                      >
                        <FaMapMarkerAlt className="w-3 h-3 text-rose-400" />
                        <span>Mall Map</span>
                      </CmsLink>
                    </div>

                    {/* Phone inquiries */}
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                      <FaPhoneAlt className="w-3 h-3 text-rose-400" />
                      <span>Box Office: </span>
                      <a href="tel:+97761525500" className="text-white hover:text-rose-300 font-bold">
                        +977 61-525500
                      </a>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* CINEPLEX VIP EXPERIENCE HIGHLIGHTS */}
        <section className="bg-gray-900/60 border border-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#801424] font-bold">
              PREMIUM CINEMA STANDARDS
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase text-white" style={serif}>
              {content.vipHeading || 'The QFX Multiplex Experience'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 font-light">
              {content.vipSub || "Pokhara's most advanced cinema destination featuring world-class audiovisual technology."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {(content.vipFeatures || []).map((feat, idx) => (
              <div
                key={idx}
                className="bg-gray-950/80 border border-gray-800 p-6 rounded-2xl space-y-3 hover:border-rose-900/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#801424]/20 border border-[#801424]/40 flex items-center justify-center text-rose-400">
                  <CmsIcon name={feat.icon} fallback="tv" className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white" style={serif}>
                  {feat.title}
                </h3>
                <p className="text-xs text-gray-400 font-light leading-relaxed">
                  {feat.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* PRIVATE SCREENINGS & CORPORATE SHOWCASES */}
        {!content.privateBookingHidden && (
          <section className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-[#191114] to-gray-900 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl border border-gray-800">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#801424]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-rose-400 uppercase">
                <FaCalendarAlt className="w-3.5 h-3.5" />
                <span>Private Auditoriums & Events</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide leading-tight" style={serif}>
                {content.privateBookingHeading}
              </h2>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-light">
                {content.privateBookingText}
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <CmsLink
                  href={content.privateBookingHref || '/contact'}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#801424] hover:bg-[#9c182c] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg transition-colors"
                >
                  <span>{content.privateBookingLabel}</span>
                  <FaArrowRight className="w-3.5 h-3.5" />
                </CmsLink>

                <a
                  href={`tel:${(content.privateBookingPhone || '+97761525500').replace(/[^\d+]/g, '')}`}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs sm:text-sm font-semibold rounded-xl border border-gray-700 transition-colors"
                >
                  <FaPhoneAlt className="w-3.5 h-3.5 text-rose-400" />
                  <span>Call Box Office ({content.privateBookingPhone || '+977 61-525500'})</span>
                </a>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
