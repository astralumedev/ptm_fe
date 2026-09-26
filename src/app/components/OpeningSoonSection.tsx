import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBlock } from '@/content/block';
import { CmsLink } from '@/content/CmsLink';
import { liveOnly } from '@/content/visibility';
import { homeOpeningSoonBlock } from '@/content/blocks/home';
import { FaClock, FaMapMarkerAlt } from 'react-icons/fa';

export default function OpeningSoonSection() {
  const content = useBlock(homeOpeningSoonBlock);
  const upcoming = useMemo(() => liveOnly(content.items), [content.items]);
  if (content.show === false || upcoming.length === 0) return null;

  return (
    <section className="w-full py-12 md:py-20 bg-gray-900 text-white relative overflow-hidden border-t border-gray-800">
      {/* Background Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-[#4a020d]/40 pointer-events-none" />
      
      <div className="container mx-auto px-3 sm:px-6 relative z-10">
        
        {/* Heading Section */}
        <div className="mb-8 md:mb-12 text-center md:text-left max-w-3xl mx-auto md:mx-0">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-medium text-white tracking-wider mb-2 uppercase"
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
            className="text-gray-300 text-sm md:text-base leading-relaxed"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {content.intro}
          </p>
        </div>

        {/* Upcoming Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {upcoming.map((store, index) => {
            return (
              <motion.div
                key={`${store.name}-${index}`}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-800/80 backdrop-blur-md rounded-2xl overflow-hidden border border-gray-700/60 hover:border-[#801424]/60 shadow-xl transition-all duration-300 flex flex-col sm:flex-row"
              >
                {/* Image Side */}
                <div className="relative w-full sm:w-2/5 h-48 sm:h-auto overflow-hidden bg-gray-950">
                  <img loading="lazy" decoding="async"
                    src={store.imageUrl}
                    alt={store.name}
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-700 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent sm:hidden" />
                  
                  {/* Badge Ribbon */}
                  <span className="absolute top-3 left-3 bg-[#801424] text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    {content.badge}
                  </span>
                </div>

                {/* Content Side */}
                <div className="p-5 md:p-6 sm:w-3/5 flex flex-col justify-between" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] text-rose-300 font-bold tracking-wider uppercase">
                        {store.category}
                      </span>
                      <span className="text-[11px] text-gray-300 font-medium flex items-center bg-gray-900/60 px-2.5 py-1 rounded-full border border-gray-700">
                        <FaClock className="w-2.5 h-2.5 mr-1.5 text-rose-300" />
                        {store.expectedDate}
                      </span>
                    </div>

                    <h3
                      className="text-lg md:text-xl font-semibold text-white mb-2 tracking-wide uppercase !no-underline"
                      style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif", textDecoration: 'none' }}
                    >
                      {store.href ? <CmsLink href={store.href} className="text-white hover:text-rose-200 transition-colors !no-underline">{store.name}</CmsLink> : store.name}
                    </h3>

                    <p className="text-xs text-gray-300 leading-relaxed mb-4 font-light">
                      {store.teaser}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-700/60 flex items-center justify-between">
                    <span className="text-xs text-gray-300 flex items-center">
                      <FaMapMarkerAlt className="w-3 h-3 mr-1.5 text-rose-400" />
                      {store.floor}
                    </span>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

