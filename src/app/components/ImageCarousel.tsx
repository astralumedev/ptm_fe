'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: Array<{
    directus_files_id: {
      data: {
        full_url: string;
      };
    };
  }>;
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = 3;

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + itemsPerView >= images.length ? 0 : prevIndex + itemsPerView
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - itemsPerView < 0 ? Math.max(0, images.length - itemsPerView) : prevIndex - itemsPerView
    );
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full mt-4">
      <div className="relative w-full flex gap-4 overflow-hidden">
        {images.slice(currentIndex, currentIndex + itemsPerView).map((image, index) => (
          <div 
            key={index} 
            className="relative w-[300px] h-[180px] flex-shrink-0 rounded-lg overflow-hidden"
          >
            <img
              src={image.directus_files_id.data.full_url}
              alt={`Gallery image ${index + 1}`}
             
              className="object-cover"
            />
          </div>
        ))}
      </div>
      
      {images.length > itemsPerView && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {Array.from({ length: Math.ceil(images.length / itemsPerView) }).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === Math.floor(currentIndex / itemsPerView) ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
} 