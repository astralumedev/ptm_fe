'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

interface GalleryItem {
  directus_files_id: {
    data: {
      full_url: string;
    };
  };
}

const AUTOPLAY_INTERVAL = 4000; // 4 seconds

export default function CarouselGallery({ gallery }: { gallery: GalleryItem[] }) {
  const [current, setCurrent] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const length = gallery.length;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const prevSlide = useCallback(() => {
    setIsLoaded(false);
    setCurrent((current) => (current === 0 ? length - 1 : current - 1));
  }, [length]);

  const nextSlide = useCallback(() => {
    setIsLoaded(false);
    setCurrent((current) => (current === length - 1 ? 0 : current + 1));
  }, [length]);

  // Autoplay handler
  useEffect(() => {
    if (length <= 1) return;

    timeoutRef.current = setTimeout(() => {
      nextSlide();
    }, AUTOPLAY_INTERVAL);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [current, length, nextSlide]);  // nextSlide included

  // Swipe handler for drag end
  const handleDragEnd = (_: PointerEvent, info: PanInfo) => {
    if (info.offset.x > 50) {
      prevSlide();
    } else if (info.offset.x < -50) {
      nextSlide();
    }
  };

  if (length === 0) return null;

  const prevIndex = current === 0 ? length - 1 : current - 1;
  const nextIndex = current === length - 1 ? 0 : current + 1;

  return (
    <section className="relative w-full max-w-5xl mx-auto px-4 py-10 select-none">
      <div className="overflow-hidden rounded-lg shadow-lg relative">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={current}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: isLoaded ? 1 : 0, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="relative w-full h-[400px] md:h-[500px]"
          >
            <div className="relative w-full h-full">
              <img
                src={gallery[current].directus_files_id.data.full_url}
                alt={`Gallery image ${current + 1}`}
                className="object-cover rounded-lg pointer-events-none select-none w-full h-full"
                onLoad={() => setIsLoaded(true)}
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Preload prev and next images hidden offscreen */}
        <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
          <img
            src={gallery[prevIndex].directus_files_id.data.full_url}
            alt=""
            width={1}
            height={1}
          />
          <img
            src={gallery[nextIndex].directus_files_id.data.full_url}
            alt=""
            width={1}
            height={1}
          />
        </div>

        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/70 transition hidden md:flex"
        >
          ‹
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/70 transition hidden md:flex"
        >
          ›
        </button>
      </div>

      <div className="flex justify-center mt-4 gap-3">
        {gallery.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsLoaded(false);
              setCurrent(index);
            }}
            aria-label={`Go to slide ${index + 1}`}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === current ? 'bg-[#760316]' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
