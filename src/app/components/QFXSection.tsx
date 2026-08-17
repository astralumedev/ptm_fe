import { useRef } from 'react';
import { motion } from 'framer-motion';
import { FaArrowRight, FaTicketAlt, FaChevronLeft, FaChevronRight, FaFilm } from 'react-icons/fa';

interface Movie {
  id: string;
  title: string;
  genre: string;
  rating: string;
  duration: string;
  language: string;
  format: string;
  posterUrl: string;
  showtimes: string[];
}

const nowShowingMovies: Movie[] = [
  {
    id: 'avatar-3d',
    title: 'AVATAR: FIRE AND ASH',
    genre: 'Sci-Fi / Action / Epic',
    rating: 'UA',
    duration: '3h 12m',
    language: 'English (3D)',
    format: '3D ATMOS',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    showtimes: ['11:00 AM', '03:00 PM', '07:00 PM'],
  },
  {
    id: 'deadpool-wolverine',
    title: 'DEADPOOL & WOLVERINE',
    genre: 'Action / Sci-Fi / Comedy',
    rating: 'UA 16+',
    duration: '2h 08m',
    language: 'English',
    format: '3D',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    showtimes: ['11:15 AM', '02:30 PM', '06:00 PM'],
  },
  {
    id: 'dune-2',
    title: 'DUNE: PART TWO',
    genre: 'Sci-Fi / Epic Adventure',
    rating: 'UA',
    duration: '2h 46m',
    language: 'English',
    format: '3D',
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    showtimes: ['12:00 PM', '04:00 PM', '08:00 PM'],
  },
  {
    id: 'inside-out-2',
    title: 'INSIDE OUT 2',
    genre: 'Animation / Family',
    rating: 'U',
    duration: '1h 36m',
    language: 'English',
    format: '2D',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    showtimes: ['10:45 AM', '01:15 PM', '03:45 PM'],
  },
  {
    id: 'gladiator-2',
    title: 'GLADIATOR II',
    genre: 'Action / Historical Epic',
    rating: 'UA',
    duration: '2h 28m',
    language: 'English',
    format: '3D',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
    showtimes: ['02:15 PM', '07:00 PM'],
  },
  {
    id: 'kanguva',
    title: 'KANGUVA: THE WARRIOR',
    genre: 'Period Action / Drama',
    rating: 'UA',
    duration: '2h 34m',
    language: 'Nepali / Hindi',
    format: '3D',
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    showtimes: ['10:30 AM', '02:00 PM', '05:45 PM'],
  },
];

export default function QFXSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full py-12 md:py-20 bg-white border-t border-gray-100">
      <div className="container mx-auto px-3 sm:px-6">
        
        {/* Heading Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6 text-center md:text-left">
          {/* Title & Description */}
          <div className="max-w-3xl text-center md:text-left mx-auto md:mx-0">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              <span className="text-xs uppercase tracking-widest text-[#801424] font-bold bg-[#801424]/10 px-3 py-1 rounded-full">
                Multiplex Cineplex
              </span>
              <img
                src="/stores/qfx/qfx.png"
                alt="QFX Cinemas Logo"
                className="h-6 w-auto object-contain"
              />
            </div>

            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-medium text-gray-900 tracking-wider mb-2 uppercase"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              QFX CINEMAS
            </h2>
            <div className="w-12 md:w-16 h-0.5 bg-[#801424]/60 rounded-full mb-3 mx-auto md:mx-0" />

            <p
              className="text-gray-600 text-sm md:text-base leading-relaxed"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Catch the latest global blockbusters and Nepali cinema at Pokhara Trade Mall! Featuring state-of-the-art 4K laser projection, immersive Dolby Atmos surround sound, and luxury recliner seating.
            </p>
          </div>

          {/* Right Aligned Controls: Book Tickets Link & Scroll Buttons */}
          <div className="flex items-center justify-center md:justify-end gap-4 flex-shrink-0 self-center md:self-end pb-1">
            <a
              href="https://www.qfxcinemas.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-base md:text-lg font-medium text-gray-900 hover:text-[#801424] transition-colors group whitespace-nowrap !no-underline hover:!no-underline focus:!no-underline mr-2"
              style={{ fontFamily: "'Montserrat', sans-serif", textDecoration: 'none' }}
            >
              <span>Book Tickets</span>
              <FaArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5 duration-300" />
            </a>

            {/* Scroll Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleScroll('left')}
                aria-label="Scroll left"
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300 cursor-pointer shadow-xs"
              >
                <FaChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                aria-label="Scroll right"
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300 cursor-pointer shadow-xs"
              >
                <FaChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Large Height Horizontally Scrollable Movie Posters Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-6 pt-2 select-none"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {nowShowingMovies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-64 sm:w-72 md:w-80 lg:w-[320px]"
            >
              <a
                href="https://www.qfxcinemas.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block w-full overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer !no-underline"
                style={{ textDecoration: 'none' }}
              >
                {/* Large Height Poster Aspect Box */}
                <div className="relative w-full h-[420px] sm:h-[460px] md:h-[500px] overflow-hidden bg-gray-950">
                  {/* Poster Image */}
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                  />

                  {/* Gradient Overlay for Cinematic Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 transition-opacity duration-500 group-hover:from-black group-hover:via-black/50" />

                  {/* Format Badge (Glassmorphism dark badge with gold text & film icon) */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center text-[10px] font-bold text-amber-300 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/30 uppercase tracking-widest shadow-xs">
                      <FaFilm className="w-2.5 h-2.5 mr-1.5 text-amber-400" />
                      {movie.format}
                    </span>
                  </div>

                  {/* Age Rating Badge (Top Right) */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center text-[10px] font-semibold text-white/90 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                      {movie.rating} • {movie.duration}
                    </span>
                  </div>

                  {/* Movie Info Overlay (Bottom Z-axis) */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end z-10 text-left">
                    <span
                      className="text-xs uppercase tracking-widest text-rose-300 font-bold mb-1.5 drop-shadow-xs !no-underline"
                      style={{ fontFamily: "'Montserrat', sans-serif", textDecoration: 'none' }}
                    >
                      {movie.genre}
                    </span>

                    <h3
                      className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider leading-snug group-hover:text-rose-200 transition-colors drop-shadow-md !no-underline hover:!no-underline"
                      style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif", textDecoration: 'none' }}
                    >
                      {movie.title}
                    </h3>

                    {/* Showtimes Pills */}
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {movie.showtimes.map((st, i) => (
                        <span key={i} className="text-[11px] bg-white/15 backdrop-blur-md text-white border border-white/20 px-2.5 py-1 rounded-md font-medium">
                          {st}
                        </span>
                      ))}
                    </div>

                    {/* Reserve Seats Action Footer */}
                    <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-bold text-amber-300 group-hover:text-amber-200 transition-colors">
                      <span className="flex items-center gap-1.5">
                        <FaTicketAlt className="w-3.5 h-3.5" />
                        <span>Reserve Seats</span>
                      </span>
                      <FaArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
