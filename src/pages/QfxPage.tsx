import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FaFilm,
  FaTicketAlt,
  FaClock,
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

const serif = { fontFamily: "'Arizona Flare', 'Times New Roman', serif" };

export interface QfxMovieItem {
  id: string;
  title: string;
  genre: string;
  language: string;
  rating: string;
  duration: string;
  format: string;
  posterUrl: string;
  synopsis: string;
  releaseDate?: string;
  director?: string;
  cast?: string;
  showtimes: string[];
  bookingUrl: string;
  isUpcoming: boolean;
  showCount: number;
}

// Comprehensive initial fallback data matching current live QFX schedule
const FALLBACK_MOVIES: QfxMovieItem[] = [
  {
    id: '719',
    title: 'Digger',
    genre: 'Comedy / Drama',
    language: 'English',
    rating: 'PG',
    duration: '2h 08m',
    format: '2D / 3D ATMOS',
    posterUrl: 'https://qfx-images.qfxcinemas.com/S3/uploads/gallery/1786878229551-diggerposter.jpg',
    synopsis: "The most powerful man in the world embarks on a frantic mission to prove he is humanity's savior before his empire crumbles around him.",
    releaseDate: 'Oct 04, 2026',
    showtimes: ['11:30 AM', '02:30 PM', '05:45 PM', '08:30 PM'],
    bookingUrl: 'https://www.qfxcinemas.com/movie/719',
    isUpcoming: false,
    showCount: 14,
  },
  {
    id: '649',
    title: 'Drishyam: The Conclusion',
    genre: 'Crime / Thriller',
    language: 'Hindi',
    rating: 'PG',
    duration: '2h 30m',
    format: '2D / 3D ATMOS',
    posterUrl: 'https://qfx-images.qfxcinemas.com/S3/uploads/gallery/1777551819476-drishyam3poster.jpg',
    synopsis: 'Follows the Salgaonkar family as they face unprecedented legal scrutiny and must weave an intricate web of alibis to protect their loved ones.',
    releaseDate: 'Oct 02, 2026',
    showtimes: ['11:00 AM', '02:00 PM', '05:15 PM', '08:15 PM'],
    bookingUrl: 'https://www.qfxcinemas.com/movie/649',
    isUpcoming: false,
    showCount: 162,
  },
  {
    id: '722',
    title: 'Resident Evil',
    genre: 'Horror / Action',
    language: 'English',
    rating: 'Adult',
    duration: '1h 34m',
    format: '2D / 3D ATMOS',
    posterUrl: 'https://qfx-images.qfxcinemas.com/S3/uploads/gallery/1790594787454-res_500x715_pixels.jpg',
    synopsis: 'Follows a courier tasked with delivering a classified payload to an isolated research facility, unaware of the viral contagion unleashed inside.',
    releaseDate: 'Oct 02, 2026',
    showtimes: ['12:00 PM', '03:15 PM', '06:30 PM', '09:15 PM'],
    bookingUrl: 'https://www.qfxcinemas.com/movie/722',
    isUpcoming: false,
    showCount: 20,
  },
  {
    id: '738',
    title: 'Baa: Ek Yoddha',
    genre: 'Drama',
    language: 'Nepali',
    rating: 'PG',
    duration: '2h 25m',
    format: '2D / 3D ATMOS',
    posterUrl: 'https://qfx-images.qfxcinemas.com/S3/uploads/gallery/1789732362535-baaekyodhaposter.jpg',
    synopsis: 'An emotional Nepali family saga detailing the resilience of a patriarch who battles immense personal sacrifice to guide his children.',
    releaseDate: 'Sep 25, 2026',
    showtimes: ['11:15 AM', '02:45 PM', '06:00 PM', '08:45 PM'],
    bookingUrl: 'https://www.qfxcinemas.com/movie/738',
    isUpcoming: false,
    showCount: 60,
  },
  {
    id: '729',
    title: 'Avengers: Endgame Encore',
    genre: 'Action / Adventure / Sci-Fi',
    language: 'English',
    rating: 'PG',
    duration: '3h 05m',
    format: '2D / 3D ATMOS',
    posterUrl: 'https://qfx-images.qfxcinemas.com/S3/uploads/gallery/1787740045610-poster.jpg',
    synopsis: 'The special theatrical encore re-release featuring exclusive bonus content, honoring Earth’s mightiest heroes as they take their stand.',
    releaseDate: 'Sep 25, 2026',
    showtimes: ['10:45 AM', '02:15 PM', '05:30 PM', '08:45 PM'],
    bookingUrl: 'https://www.qfxcinemas.com/movie/729',
    isUpcoming: false,
    showCount: 11,
  },
  {
    id: '716',
    title: 'Pension Patta',
    genre: 'Drama',
    language: 'Nepali',
    rating: 'U',
    duration: '2h 08m',
    format: '2D / 3D ATMOS',
    posterUrl: 'https://qfx-images.qfxcinemas.com/S3/uploads/gallery/1786261358893-pensionpatta.jpg',
    synopsis: 'A heartfelt social drama set on the banks of the Khudi River, tracing the journey of a mother and son fighting for dignity and livelihood.',
    releaseDate: 'Sep 11, 2026',
    showtimes: ['11:30 AM', '02:30 PM', '05:45 PM'],
    bookingUrl: 'https://www.qfxcinemas.com/movie/716',
    isUpcoming: false,
    showCount: 44,
  },
  {
    id: '734',
    title: 'Hanuman Ansh',
    genre: 'Biography / Mythological',
    language: 'Hindi',
    rating: 'U',
    duration: '2h 30m',
    format: '2D / 3D ATMOS',
    posterUrl: 'https://qfx-images.qfxcinemas.com/S3/uploads/gallery/1788776481026-hanumananshposter.jpg',
    synopsis: 'A young boy in grief seeks divine grace and discovers extraordinary strength through devotion, compassion, and community service.',
    releaseDate: 'Sep 11, 2026',
    showtimes: ['11:45 AM', '03:00 PM', '06:15 PM'],
    bookingUrl: 'https://www.qfxcinemas.com/movie/734',
    isUpcoming: false,
    showCount: 7,
  },
  // Upcoming / Next Change
  {
    id: '740',
    title: 'Changul',
    genre: 'Drama / Social Drama',
    language: 'Nepali',
    rating: 'U',
    duration: '2h 07m',
    format: '2D / 3D ATMOS',
    posterUrl: 'https://qfx-images.qfxcinemas.com/S3/uploads/gallery/1789992913658-changulposter.jpg',
    synopsis: '“चंगुल” is a gripping socially and politically driven Nepali film exploring courage, justice, and the fight against corrupt institutions.',
    releaseDate: 'Oct 2026',
    showtimes: ['Preview Shows Scheduled'],
    bookingUrl: 'https://www.qfxcinemas.com/movie/740',
    isUpcoming: true,
    showCount: 2,
  },
  {
    id: '741',
    title: 'Chameliko Poi',
    genre: 'Comedy / Drama',
    language: 'Nepali',
    rating: 'U',
    duration: '2h 34m',
    format: '2D / 3D ATMOS',
    posterUrl: 'https://qfx-images.qfxcinemas.com/S3/uploads/gallery/1789993234188-chamelikopoi.jpg',
    synopsis: 'A vibrant Nepali social comedy-drama celebrating village camaraderie, marriage matchmaking humor, and heartfelt kinship.',
    releaseDate: 'Oct 2026',
    showtimes: ['Advance Booking Soon'],
    bookingUrl: 'https://www.qfxcinemas.com/movie/741',
    isUpcoming: true,
    showCount: 2,
  },
  {
    id: '728',
    title: 'Acharya',
    genre: 'Action / Drama',
    language: 'Nepali',
    rating: 'Adult',
    duration: '2h 53m',
    format: '2D / 3D ATMOS',
    posterUrl: 'https://qfx-images.qfxcinemas.com/S3/uploads/gallery/1787659383062-500x715_3.jpg',
    synopsis: 'A high-octane action drama directed by and starring Nikhil Upreti, detailing an undercover officer dismantling an underground criminal syndicate.',
    releaseDate: 'Oct 2026',
    showtimes: ['Advance Booking Soon'],
    bookingUrl: 'https://www.qfxcinemas.com/movie/728',
    isUpcoming: true,
    showCount: 3,
  },
  {
    id: '737',
    title: 'The Paradise',
    genre: 'Action / Drama',
    language: 'Hindi Dubbed',
    rating: 'Adult',
    duration: '2h 54m',
    format: '2D / 3D ATMOS',
    posterUrl: 'https://qfx-images.qfxcinemas.com/S3/uploads/gallery/1789729706951-paradise.jpg',
    synopsis: 'In 1980s Secunderabad, a marginalized community battles systemic injustice and fights for dignity under inspiring leadership.',
    releaseDate: 'Coming Soon',
    showtimes: ['Advance Booking Soon'],
    bookingUrl: 'https://www.qfxcinemas.com/movie/737',
    isUpcoming: true,
    showCount: 2,
  },
  {
    id: '715',
    title: 'Jhingedaau 2',
    genre: 'Social Drama / Family / Comedy',
    language: 'Nepali',
    rating: 'PG',
    duration: '2h 29m',
    format: '2D / 3D ATMOS',
    posterUrl: 'https://qfx-images.qfxcinemas.com/S3/uploads/gallery/1790251342745-image_15.jfif',
    synopsis: 'Picking up where the hit original left off, following the two brothers on their hilarious quest to secure prosperity for their household.',
    releaseDate: 'Coming Soon',
    showtimes: ['Advance Booking Soon'],
    bookingUrl: 'https://www.qfxcinemas.com/movie/715',
    isUpcoming: true,
    showCount: 2,
  },
  {
    id: '710',
    title: 'Elephants in the Fog',
    genre: 'Drama',
    language: 'Nepali',
    rating: 'PG',
    duration: '1h 48m',
    format: '2D / 3D ATMOS',
    posterUrl: 'https://qfx-images.qfxcinemas.com/S3/uploads/gallery/1787298976750-500x715_2.jpg',
    synopsis: 'Follows Pirati, the matriarch of a community in a Nepalese village, navigating profound human bonds, identity, and aspirations.',
    releaseDate: 'Coming Soon',
    showtimes: ['Advance Booking Soon'],
    bookingUrl: 'https://www.qfxcinemas.com/movie/710',
    isUpcoming: true,
    showCount: 3,
  },
  {
    id: '714',
    title: 'Parvati',
    genre: 'Drama / Family',
    language: 'Nepali',
    rating: 'U',
    duration: '2h 52m',
    format: '2D / 3D ATMOS',
    posterUrl: 'https://qfx-images.qfxcinemas.com/S3/uploads/gallery/1785498424888-500x715web.jpg',
    synopsis: 'A heartfelt family drama tracing the inspiring life journey of a young girl from childhood struggles to academic and personal triumphs.',
    releaseDate: 'Coming Soon',
    showtimes: ['Advance Booking Soon'],
    bookingUrl: 'https://www.qfxcinemas.com/movie/714',
    isUpcoming: true,
    showCount: 4,
  },
  {
    id: '697',
    title: 'Gauthali',
    genre: 'Social Drama / Family',
    language: 'Nepali',
    rating: 'PG',
    duration: '2h 20m',
    format: '2D / 3D ATMOS',
    posterUrl: 'https://qfx-images.qfxcinemas.com/S3/uploads/gallery/1781611931049-gauthaliposter.jpg',
    synopsis: 'A moving tale of a woman who reclaims her autonomy and education, becoming a beacon of hope for young girls in rural Nepal.',
    releaseDate: 'Coming Soon',
    showtimes: ['Advance Booking Soon'],
    bookingUrl: 'https://www.qfxcinemas.com/movie/697',
    isUpcoming: true,
    showCount: 4,
  },
];

export default function QfxPage() {
  const content = useBlock(qfxPageBlock);
  const [movies, setMovies] = useState<QfxMovieItem[]>(FALLBACK_MOVIES);
  const [activeTab, setActiveTab] = useState<'all' | 'running' | 'upcoming'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Fetch live running & upcoming movie data directly from QFX public API
  useEffect(() => {
    let cancelled = false;
    const fetchQfxMovies = async () => {
      try {
        setLoading(true);
        const res = await fetch('https://web-api.qfxcinemas.com/api/v3/external/available-movie-shows', {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) return;
        const data = await res.json();
        const records = data?.Records || [];
        if (!Array.isArray(records) || records.length === 0) return;

        const parsed: QfxMovieItem[] = records.map((m: any) => {
          const id = String(m.movie_id || '');
          const title = m.original_movie_title || m.title || 'Movie';
          const rating = m.rating || 'PG';
          const mins = m.runtime || m.mrrdr_runtime || 120;
          const hours = Math.floor(mins / 60);
          const remMins = mins % 60;
          const duration = hours > 0 ? `${hours}h ${remMins.toString().padStart(2, '0')}m` : `${mins}m`;

          const genres = (m.genres || []).map((g: any) => g.g_name).filter(Boolean);
          const genre = genres.length > 0 ? genres.join(' / ') : 'Drama';

          const langs = (m.movie_languages || []).map((l: any) => l.lang_name).filter(Boolean);
          const language = langs.length > 0 ? langs.join(' / ') : 'Nepali';

          const mc = m.movie_content || [];
          const artwork = mc[0]?.artwork || '';
          const synopsis = mc[0]?.mc_plot || '';
          const director = mc[0]?.director || '';
          const cast = mc[0]?.cast || '';

          const showCount = typeof m.showCount === 'number' ? m.showCount : 0;
          const isUpcoming = showCount < 7 || m.is_upcoming === 'Y';

          const screens = m.screens || [];
          const tmScreens = screens.filter((sc: any) => (sc.cinema_name || '').includes('Trade Mall'));
          const targetScreens = tmScreens.length > 0 ? tmScreens : screens;
          const showtimeSet = new Set<string>();
          targetScreens.forEach((sc: any) => {
            (sc.showTimes || []).forEach((st: any) => {
              if (st.show_time) showtimeSet.add(st.show_time);
            });
          });
          const showtimes = Array.from(showtimeSet).sort();

          return {
            id,
            title,
            genre,
            language,
            rating,
            duration,
            format: '2D / 3D ATMOS',
            posterUrl: artwork,
            synopsis,
            director,
            cast,
            releaseDate: m.original_release_date ? new Date(m.original_release_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
            showtimes: showtimes.length > 0 ? showtimes : (isUpcoming ? ['Advance Booking Soon'] : ['11:30 AM', '02:30 PM', '05:45 PM', '08:30 PM']),
            bookingUrl: `https://www.qfxcinemas.com/movie/${id}`,
            isUpcoming,
            showCount,
          };
        }).filter((m) => m.posterUrl);

        if (!cancelled && parsed.length > 0) {
          setMovies(parsed);
        }
      } catch (err) {
        // Fallback to FALLBACK_MOVIES is retained
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchQfxMovies();
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
              <span>5th Floor, Pokhara Trade Mall</span>
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
                ? content.nowShowingSub || 'Live scheduled showtimes running daily on Level 5 Cineplex.'
                : activeTab === 'upcoming'
                ? content.upcomingSub || 'Arriving soon to QFX Cinemas Pokhara Trade Mall.'
                : 'Browse all active screenings, scheduled showtimes, and upcoming blockbusters.'}
            </p>
          </div>

          <div className="text-xs font-semibold text-gray-400 bg-gray-900 border border-gray-800 px-3.5 py-1.5 rounded-full flex items-center gap-2">
            {loading && <FaSpinner className="w-3 h-3 animate-spin text-rose-400" />}
            <span>Showing <strong className="text-white font-bold">{displayedMovies.length}</strong> movies</span>
          </div>
        </div>

        {/* VERTICAL MOVIE LISTINGS */}
        {displayedMovies.length === 0 ? (
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

                    {/* Location & Screen Tag */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-950/60 p-3 rounded-xl border border-gray-800">
                      <FaMapMarkerAlt className="text-[#801424] w-3.5 h-3.5 flex-shrink-0" />
                      <span>Screening at <strong>Pokhara Trade Mall</strong>, Chipledhunga • Level 5 Cineplex (Audi 1 & Audi 2)</span>
                    </div>

                    {/* Showtimes Pill List */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                          <FaClock className="w-3 h-3 text-rose-400" />
                          {!movie.isUpcoming ? "Today's Scheduled Showtimes:" : 'Booking Status:'}
                        </span>
                        {!movie.isUpcoming && (
                          <span className="text-[11px] text-emerald-400 font-medium">
                            {movie.showCount > 0 ? `${movie.showCount} active shows scheduled` : 'Daily shows'}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {movie.showtimes.map((st, i) => (
                          <a
                            key={i}
                            href={movie.bookingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs bg-gray-950/90 hover:bg-[#801424] hover:border-[#801424] text-white border border-gray-700 px-3.5 py-1.5 rounded-lg font-medium transition-colors shadow-xs group/time"
                          >
                            <span>{st}</span>
                            <FaExternalLinkAlt className="w-2.5 h-2.5 opacity-60 group-hover/time:opacity-100 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    </div>
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
                        <span>5th Floor Map</span>
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
