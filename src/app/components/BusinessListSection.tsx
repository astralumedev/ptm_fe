'use client';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '@/services/api';
import { Store } from '@/data/models/Store';
import TruncatedDescription from './TruncatedDescription';
import styles from './BusinessListSection.module.css';

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.8,
      ease: 'easeOut',
    },
  }),
};

interface BusinessListSectionProps {
  title?: string;
  featured: boolean;
  type?: 'retail' | 'eatery' | 'service' | 'hotel' | 'wellness';
}

interface StoreFilter {
  status: 'published';
  type?: 'retail' | 'eatery' | 'service' | 'hotel' | 'wellness';
  featured?: number;
}

const BusinessListSection: React.FC<BusinessListSectionProps> = ({
  title,
  type,
  featured = false
}) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const filter: StoreFilter = {
          status: 'published',
        };

        if (type) {
          filter.type = type;
        }

        if (featured) {
          filter.featured = 1;
        }
      
        const response = await api.getStores({
          fields: '*,logo.data.full_url,cover.data.full_url,store_gallery.directus_files_id.*',
          filter
        });
        setStores(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching stores:', error);
        setError('Failed to load stores. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, [type, featured]);

  if (isLoading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mall-accent-dark"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <section className="w-full py-16 bg-white" style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}>
      <div className="container mx-auto px-4 md:px-8">
        {/* Section Header */}
        {title && (
          <div className="flex flex-col items-center mb-16">
            <h2 
              className="text-4xl text-mall-brown mb-4 tracking-widest font-semibold"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              {title.toUpperCase()}
            </h2>
            <div className="w-120 h-px bg-gradient-to-r from-transparent via-mall-accent-dark to-transparent" />
          </div>
        )}

        {/* Business Items */}
        <div className="space-y-32">
          {stores.map((store, index) => {
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={store.id}
                className={`flex flex-col md:flex-row items-start gap-12 ${
                  isEven ? '' : 'md:flex-row-reverse'
                }`}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                {/* Title and Subtitle - Now first in mobile */}
                <div className="w-full md:hidden">
                  <h2 
                    className="text-2xl text-shadow-mall-brown md:text-4xl font-bold text-gray-850 tracking-widest"
                    style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                  >
                    {store.name.toUpperCase()}
                  </h2>

                  {store.subtitle && (
                    <p 
                      className="text-base tracking-widest mt-2 font-light text-mall-accent-dark"
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {store.subtitle.toUpperCase()}
                    </p>
                  )}

                  <div className="w-120 h-px bg-gradient-to-r from-transparent via-mall-accent-dark to-transparent mt-4 mb-4" />
                </div>

                {/* Image with overlay, logo, and title */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  viewport={{ once: true }}
                  className="w-full md:w-[40%]"
                >
                  {/* Image Block */}
                  <div className="relative h-[200px] md:h-150 w-full overflow-hidden shadow-lg rounded-2xl">
                    <img
                      src={store.cover.data.full_url}
                      alt={store.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </motion.div>

                {/* Description */}
                <div className="w-full md:w-[60%]">
                  {/* Title and Subtitle - Hidden in mobile, shown in desktop */}
                  <div className="hidden md:block">
                    <h2 
                      className="text-2xl text-mall-brown md:text-4xl mt-5 font-bold text-gray-850 tracking-widest"
                      style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                    >
                      {store.name.toUpperCase()}
                    </h2>

                    {store.subtitle && (
                      <p 
                        className="text-base tracking-widest mt-2 font-light text-mall-reseda-green"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        {store.subtitle.toUpperCase()}
                      </p>
                    )}

                    <div className="w-120 h-px bg-gradient-to-r from-transparent via-mall-accent-dark to-transparent mt-4 mb-4" />
                  </div>

                  <div style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    <TruncatedDescription 
                      htmlString={store.store_description} 
                      maxChar={400} 
                    />
                  </div>

                  {/* Static Three Image Gallery */}
                  {store.store_gallery && store.store_gallery.length > 0 && (
                    <div className="mt-8 flex gap-4">
                      {store.store_gallery.slice(0, 3).map((image, index) => (
                        <div 
                          key={index}
                          className="relative w-1/3 aspect-[4/3] rounded-lg overflow-hidden shadow-md"
                        >
                          <img
                            src={image.directus_files_id.data.full_url}
                            alt={`Gallery image ${index + 1}`}
                            className="object-cover hover:scale-105 transition-transform duration-500 w-full h-full"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Explore Link */}
                  <Link
                    to={`/shops/details/${store.slug}`}
                    className={`inline-flex items-center gap-2 text-[#2c3e2c] hover:text-[#1e2b1e] tracking-wider transition-colors mt-6 font-medium ${styles.discoverLink}`}
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    DISCOVER MORE
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BusinessListSection;
