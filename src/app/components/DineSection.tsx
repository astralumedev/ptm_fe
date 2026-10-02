import { useBlock } from '@/content/block';
import { StoreVisual } from '@/app/components/StoreVisual';
import { CmsLink } from '@/content/CmsLink';
import { homeDiningBlock, useStoreCards } from '@/content/blocks/home';
import { motion } from 'framer-motion';
import { FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';

export default function DineSection() {
  const content = useBlock(homeDiningBlock);
  const cards = useStoreCards(content.items);
  if (content.show === false || cards.length === 0) return null;
  return (
    <section className="w-full py-12 md:py-20 bg-[#faf8f6] border-t border-amber-100/60">
      <div className="container mx-auto px-3 sm:px-6">
        
        {/* Heading Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6 text-center md:text-left">
          {/* Title & Description */}
          <div className="max-w-3xl text-center md:text-left mx-auto md:mx-0">
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
              className="text-gray-600 text-sm md:text-base leading-relaxed mt-2"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {content.intro}
            </p>
          </div>

          {/* Right Aligned Controls: See All Link */}
          <div className="flex-shrink-0 self-center md:self-end pb-1">
            <CmsLink
              href={content.seeAllLink}
              className="inline-flex items-center gap-2 text-base md:text-lg font-medium text-gray-900 hover:text-[#801424] transition-colors group whitespace-nowrap !no-underline hover:!no-underline focus:!no-underline"
              style={{ fontFamily: "'Montserrat', sans-serif", textDecoration: 'none' }}
            >
              <span>{content.seeAllLabel}</span>
              <FaArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5 duration-300" />
            </CmsLink>
          </div>
        </div>

        {/* Requested 3-Row Grid Layout */}
        <div className="m-rail grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8" style={{ ['--rail-pad' as string]: '12px' }}>
          {cards.map((spot, index) => (
            <motion.div
              key={spot.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              viewport={{ once: true }}
              className={`w-full ${spot.wide ? 'md:col-span-2' : 'md:col-span-1'}`}
            >
              <CmsLink
                href={spot.href}
                className="group relative block w-full overflow-hidden rounded-2xl shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer !no-underline"
                style={{ textDecoration: 'none' }}
              >
                <div className={`relative w-full ${spot.tall ? 'h-64 sm:h-72 lg:h-80' : 'h-56 sm:h-64 lg:h-72'} overflow-hidden bg-gray-900`}>
                  {/* Cover Image */}
                  <StoreVisual src={spot.imageUrl} alt={spot.name} category={spot.categorySlug} tone="dark"
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out opacity-90 group-hover:opacity-100" />

                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/90 group-hover:via-black/40" />

                  {/* Location Badge (Top Right) */}
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center text-[10px] font-medium text-white/90 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
                      <FaMapMarkerAlt className="w-2.5 h-2.5 mr-1 text-amber-400" />
                      {spot.floor}
                    </span>
                  </div>

                  {/* Z-Axis Text Overlay (Name & Category on Image) */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 flex flex-col justify-end z-10 text-left">
                    <span
                      className="text-[11px] uppercase tracking-widest text-amber-300 font-bold mb-1 drop-shadow-xs !no-underline"
                      style={{ fontFamily: "'Montserrat', sans-serif", textDecoration: 'none' }}
                    >
                      {spot.category}
                    </span>

                    <h3
                      className="text-lg md:text-xl font-semibold text-white uppercase tracking-wider leading-snug group-hover:text-amber-100 transition-colors drop-shadow-sm !no-underline hover:!no-underline"
                      style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif", textDecoration: 'none' }}
                    >
                      {spot.name}
                    </h3>

                    {/* Explore Link on Hover */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-amber-300/90 group-hover:text-amber-300 transition-all transform duration-300 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                      <span>{content.cardCta}</span>
                      <FaArrowRight className="w-3 h-3 text-amber-400 group-hover:translate-x-1 transition-transform" />
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





