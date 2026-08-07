import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaFilm, FaTicketAlt, FaClock, FaExternalLinkAlt } from 'react-icons/fa';

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
    id: 'deadpool-wolverine',
    title: 'Deadpool & Wolverine',
    genre: 'Action / Sci-Fi / Comedy',
    rating: 'UA 16+',
    duration: '2h 08m',
    language: 'English (Subtitled)',
    format: '3D • Dolby Atmos',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    showtimes: ['11:15 AM', '02:30 PM', '06:00 PM', '09:15 PM'],
  },
  {
    id: 'dune-2',
    title: 'Dune: Part Two',
    genre: 'Sci-Fi / Epic Adventure',
    rating: 'UA',
    duration: '2h 46m',
    language: 'English',
    format: '4K 2D • Surround 7.1',
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    showtimes: ['12:00 PM', '04:00 PM', '08:00 PM'],
  },
  {
    id: 'inside-out-2',
    title: 'Inside Out 2',
    genre: 'Animation / Family / Comedy',
    rating: 'U',
    duration: '1h 36m',
    language: 'English',
    format: '3D Digital',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    showtimes: ['10:45 AM', '01:15 PM', '03:45 PM'],
  },
  {
    id: 'nepali-movie',
    title: 'Unko Paheli Sanobar',
    genre: 'Drama / Romance / Musical',
    rating: 'U',
    duration: '2h 12m',
    language: 'Nepali',
    format: '2D Digital',
    posterUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
    showtimes: ['01:00 PM', '05:30 PM'],
  },
  {
    id: 'gladiator-2',
    title: 'Gladiator II',
    genre: 'Action / Historical Epic',
    rating: 'UA',
    duration: '2h 28m',
    language: 'English',
    format: '4K • Dolby Atmos',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
    showtimes: ['02:15 PM', '07:00 PM'],
  },
];

export default function QFXSection() {
  const [selectedMovie, setSelectedMovie] = useState<string | null>(null);

  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-b from-gray-950 via-slate-950 to-gray-900 text-white relative">
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        
        {/* QFX Header Branding */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16">
          
          {/* QFX Official Logo */}
          <div className="mb-5 flex items-center justify-center p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl">
            <img
              src="/stores/qfx/qfx.png"
              alt="QFX Cinemas Logo"
              className="h-16 md:h-22 w-auto object-contain drop-shadow-[0_4px_16px_rgba(239,68,68,0.5)] transition-transform duration-300 hover:scale-105"
            />
          </div>

          <span className="text-xs uppercase tracking-widest text-red-400 font-bold mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            NOW SHOWING AT POKHARA TRADE MALL
          </span>

          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-wider mb-4"
            style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
          >
            CINEMATIC EXPERIENCE
          </h2>
          
          <div className="w-24 h-1 bg-red-600 mx-auto rounded-full mb-4" />

          <p className="text-gray-300 text-sm md:text-base max-w-2xl leading-relaxed font-light" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Catch the latest global blockbusters and Nepali cinema with state-of-the-art 4K projection, immersive Dolby Atmos surround sound, and luxury recliner seating.
          </p>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {nowShowingMovies.map((movie, index) => {
            const isHovered = selectedMovie === movie.id;

            return (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                onMouseEnter={() => setSelectedMovie(movie.id)}
                onMouseLeave={() => setSelectedMovie(null)}
                className="group relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-red-600/70 shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Movie Poster */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-950">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-black/30" />

                  {/* Format Badge */}
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md">
                    {movie.format.split('•')[0].trim()}
                  </span>

                  {/* Rating Tag */}
                  <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/20">
                    {movie.rating}
                  </span>

                  {/* Quick Action Overlay on Hover */}
                  <div className={`absolute inset-0 bg-black/75 backdrop-blur-xs p-4 flex flex-col justify-end transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}>
                    <p className="text-xs text-red-400 font-semibold mb-1">{movie.genre}</p>
                    <p className="text-xs text-gray-300 mb-3 flex items-center">
                      <FaClock className="w-3 h-3 mr-1 text-gray-400" />
                      {movie.duration} • {movie.language}
                    </p>

                    <div className="mb-3">
                      <span className="text-[11px] text-gray-400 uppercase tracking-wider block mb-1 font-semibold">Today's Shows</span>
                      <div className="flex flex-wrap gap-1">
                        {movie.showtimes.map((st, i) => (
                          <span key={i} className="text-[10px] bg-red-950/80 text-red-200 border border-red-800/60 px-2 py-0.5 rounded-md">
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>

                    <a
                      href="https://www.qfxcinemas.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg text-center shadow-lg transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <FaTicketAlt className="w-3 h-3" />
                      <span>Book at QFX</span>
                    </a>
                  </div>
                </div>

                {/* Card Title Info */}
                <div className="p-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">
                    {movie.title}
                  </h3>
                  <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
                    <span className="truncate pr-2">{movie.genre.split('/')[0]}</span>
                    <span className="text-red-400 font-medium flex-shrink-0">{movie.duration}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View Full QFX Schedule Footer CTA */}
        <div className="mt-14 text-center">
          <a
            href="https://www.qfxcinemas.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-red-900/40 transition-all duration-300 group"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <FaFilm className="w-4 h-4 mr-2" />
            Check Full QFX Showtimes & Reserve Seats
            <FaExternalLinkAlt className="w-3 h-3 ml-2 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

      </div>
    </section>
  );
}
