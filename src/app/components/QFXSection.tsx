import { useMemo, useRef } from 'react';
import { useBlock } from '@/content/block';
import { CmsLink } from '@/content/CmsLink';
import { liveOnly } from '@/content/visibility';
import { homeQfxBlock } from '@/content/blocks/home';
import { motion } from 'framer-motion';
import { FaArrowRight, FaTicketAlt, FaChevronLeft, FaChevronRight, FaFilm } from 'react-icons/fa';

export default function QFXSection() {
  const content = useBlock(homeQfxBlock);
  const movies = useMemo(() => liveOnly(content.movies), [content.movies]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (content.show === false || movies.length === 0) return null;

  return (
    <section className="w-full py-12 md:py-20 bg-white border-t border-gray-100">
      <div className="container mx-auto px-3 sm:px-6">
        
        {/* Heading Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6 text-center md:text-left">
          {/* Title & Description */}
          <div className="max-w-3xl text-center md:text-left mx-auto md:mx-0">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              <span className="text-xs uppercase tracking-widest text-[#801424] font-bold bg-[#801424]/10 px-3 py-1 rounded-full">
                {content.badge}
              </span>
              {content.logoUrl && <img loading="lazy" decoding="async"
                src={content.logoUrl}
                alt="QFX Cinemas Logo"
                className="h-6 w-auto object-contain"
              />}
            </div>

            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-medium text-gray-900 tracking-wider mb-2 uppercase"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              {content.title}
            </h2>
            <div className="flex items-center justify-center md:justify-start gap-2 my-3">
              <div className="w-8 h-0.5 bg-[#801424] rounded-full" />
              <div className="w-2 h-2 rotate-45 bg-[#801424] rounded-xs" />
              <div className="w-8 h-0.5 bg-[#801424] rounded-full" />
            </div>

            <p
              className="text-gray-600 text-sm md:text-base leading-relaxed"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {content.intro}
            </p>
          </div>

          {/* Right Aligned Controls: Book Tickets Link & Scroll Buttons */}
          <div className="flex items-center justify-center md:justify-end gap-4 flex-shrink-0 self-center md:self-end pb-1">
            <CmsLink
              href={content.bookUrl}
              className="inline-flex items-center gap-2 text-base md:text-lg font-medium text-gray-900 hover:text-[#801424] transition-colors group whitespace-nowrap !no-underline hover:!no-underline focus:!no-underline mr-2"
              style={{ fontFamily: "'Montserrat', sans-serif", textDecoration: 'none' }}
            >
              <span>{content.bookLabel}</span>
              <FaArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5 duration-300" />
            </CmsLink>

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
          {movies.map((movie, index) => (
            <motion.div
              key={`${movie.title}-${index}`}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-64 sm:w-72 md:w-80 lg:w-[320px]"
            >
              <CmsLink
                href={movie.href || content.bookUrl}
                className="group relative block w-full overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer !no-underline"
                style={{ textDecoration: 'none' }}
              >
                {/* Large Height Poster Aspect Box */}
                <div className="relative w-full h-[420px] sm:h-[460px] md:h-[500px] overflow-hidden bg-gray-950">
                  {/* Poster Image */}
                  <img loading="lazy" decoding="async"
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
                      {(movie.showtimes || []).map((st, i) => (
                        <span key={i} className="text-[11px] bg-white/15 backdrop-blur-md text-white border border-white/20 px-2.5 py-1 rounded-md font-medium">
                          {st}
                        </span>
                      ))}
                    </div>

                    {/* Reserve Seats Action Footer */}
                    <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-bold text-amber-300 group-hover:text-amber-200 transition-colors">
                      <span className="flex items-center gap-1.5">
                        <FaTicketAlt className="w-3.5 h-3.5" />
                        <span>{content.reserveLabel}</span>
                      </span>
                      <FaArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </CmsLink>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
