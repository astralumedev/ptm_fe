import { useBlock } from '@/content/block';
import { StoreVisual } from '@/app/components/StoreVisual';
import { CmsLink } from '@/content/CmsLink';
import { homeFeaturedBlock, useStoreCards } from '@/content/blocks/home';
import { motion } from 'framer-motion';
import { FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';

export default function FeaturedStoresSection() {
  const content = useBlock(homeFeaturedBlock);
  const cards = useStoreCards(content.items);
  if (content.show === false || cards.length === 0) return null;
  return (
    <section className="w-full py-12 md:py-20 bg-white">
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

        {/* 3-Row Grid Layout for SHOP: [1-span][2-span] / [1-span][1-span][1-span] / [2-span][1-span] */}
        <div className="m-rail grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8" style={{ ['--rail-pad' as string]: '12px' }}>
          {cards.map((store, index) => (
            <motion.div
              key={store.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              viewport={{ once: true }}
              className={`w-full ${store.wide ? 'md:col-span-2' : 'md:col-span-1'}`}
            >
              <CmsLink
                href={store.href}
                className="group relative block w-full overflow-hidden rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between !no-underline"
                style={{ textDecoration: 'none' }}
              >
                {/* Cover Image Container */}
                <div className={`relative w-full ${store.tall ? 'h-64 sm:h-72 lg:h-80' : 'h-56 sm:h-64 lg:h-72'} overflow-hidden bg-gray-100`}>
                  <StoreVisual src={store.imageUrl} alt={store.name} category={store.categorySlug}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out" />

                  {/* Top-Right Location Badge */}
                  <span className="absolute top-3 right-3 text-[10px] font-semibold text-gray-800 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs border border-gray-200/60 flex items-center">
                    <FaMapMarkerAlt className="w-2.5 h-2.5 mr-1 text-[#801424]" />
                    {store.floor}
                  </span>
                </div>

                {/* Light-Mode Store Card Details Footer */}
                <div className="p-5 md:p-6 bg-white flex flex-col justify-between text-left" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-[#801424] font-bold block mb-1">
                      {store.category}
                    </span>
                    <h3
                      className="text-lg md:text-xl font-semibold text-gray-900 group-hover:text-[#801424] transition-colors uppercase tracking-wider leading-snug !no-underline hover:!no-underline"
                      style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif", textDecoration: 'none' }}
                    >
                      {store.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#801424] font-semibold">
                    <span>{content.cardCta}</span>
                    <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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






