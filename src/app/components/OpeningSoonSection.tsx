import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaClock, FaMapMarkerAlt, FaBell, FaCheckCircle } from 'react-icons/fa';

interface UpcomingStore {
  id: string;
  name: string;
  category: string;
  floor: string;
  expectedDate: string;
  teaser: string;
  imageUrl: string;
  logoUrl: string;
}

const upcomingStoresData: UpcomingStore[] = [
  {
    id: 'adidas',
    name: 'Adidas Flagship Store',
    category: 'Sportswear & Sneakers',
    floor: 'Ground Floor - Main Plaza',
    expectedDate: 'Opening Spring 2026',
    teaser: "World's iconic three-stripes performance activewear, Originals footwear, and athleisure gear arriving soon in Pokhara.",
    imageUrl: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?auto=format&fit=crop&w=800&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'starbucks',
    name: 'Starbucks Coffee',
    category: 'Global Cafe & Espresso',
    floor: '1st Floor - Outdoor Terrace',
    expectedDate: 'Opening Summer 2026',
    teaser: "Handcrafted espresso beverages, Frappuccinos, fresh artisan food & cozy lounge seating overlooking Pokhara city view.",
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'miniso',
    name: 'Miniso Lifestyle',
    category: 'Japanese Lifestyle & Gifts',
    floor: '2nd Floor - Retail Atrium',
    expectedDate: 'Opening Mid 2026',
    teaser: "Affordable plushies, digital gadgets, home organizing aesthetic, travel items, and viral pop-culture merchandise.",
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'sephora',
    name: 'Sephora Beauty Lounge',
    category: 'Cosmetics & Skincare',
    floor: '1st Floor - Fashion Wing',
    expectedDate: 'Opening Fall 2026',
    teaser: "Premium global beauty brands, luxury fragrances, skincare consultations, and interactive makeup bars.",
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=200&q=80',
  },
];

export default function OpeningSoonSection() {
  const [notifiedStores, setNotifiedStores] = useState<Record<string, boolean>>({});

  const toggleNotify = (id: string) => {
    setNotifiedStores((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section className="w-full py-16 md:py-24 bg-gray-900 text-white relative overflow-hidden">
      {/* Background Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-[#4a020d]/40 pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 bg-[#c22328]/20 border border-[#c22328]/40 px-4 py-1.5 rounded-full mb-3">
            <span className="w-2 h-2 rounded-full bg-[#c22328] animate-ping" />
            <span className="text-xs uppercase tracking-widest text-[#e43f44] font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              UPCOMING BRANDS
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-wider mb-4"
            style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
          >
            OPENING SOON
          </h2>
          <div className="w-24 h-1 bg-[#c22328] mx-auto rounded-full mb-4" />
          <p className="text-gray-300 text-sm md:text-base leading-relaxed" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Get ready for excited new arrivals! Iconic global brands and flagship outlets are bringing their signature experiences to Pokhara Trade Mall.
          </p>
        </div>

        {/* Upcoming Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {upcomingStoresData.map((store, index) => {
            const isNotified = notifiedStores[store.id];

            return (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="bg-gray-800/80 backdrop-blur-md rounded-2xl overflow-hidden border border-gray-700/60 hover:border-[#c22328]/50 shadow-xl transition-all duration-300 flex flex-col sm:flex-row"
              >
                {/* Image Side */}
                <div className="relative w-full sm:w-2/5 h-52 sm:h-auto overflow-hidden bg-gray-950">
                  <img
                    src={store.imageUrl}
                    alt={store.name}
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-700 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent sm:hidden" />
                  
                  {/* Badge Ribbon */}
                  <span className="absolute top-3 left-3 bg-[#c22328] text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-md shadow-md">
                    COMING SOON
                  </span>
                </div>

                {/* Content Side */}
                <div className="p-6 sm:w-3/5 flex flex-col justify-between" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-red-400 font-semibold tracking-wider uppercase">
                        {store.category}
                      </span>
                      <span className="text-xs text-gray-400 font-medium flex items-center bg-gray-900/60 px-2.5 py-1 rounded-full border border-gray-700">
                        <FaClock className="w-2.5 h-2.5 mr-1.5 text-red-400" />
                        {store.expectedDate}
                      </span>
                    </div>

                    <h3
                      className="text-xl md:text-2xl font-bold text-white mb-2 tracking-wide"
                      style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
                    >
                      {store.name}
                    </h3>

                    <p className="text-xs text-gray-300 leading-relaxed mb-4 font-light">
                      {store.teaser}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-700/60 flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center">
                      <FaMapMarkerAlt className="w-3 h-3 mr-1 text-red-400" />
                      {store.floor}
                    </span>

                    <button
                      onClick={() => toggleNotify(store.id)}
                      className={`inline-flex items-center text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        isNotified
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-gray-700 hover:bg-[#c22328] text-white'
                      }`}
                    >
                      {isNotified ? (
                        <>
                          <FaCheckCircle className="w-3 h-3 mr-1.5 text-white" />
                          Subscribed
                        </>
                      ) : (
                        <>
                          <FaBell className="w-3 h-3 mr-1.5" />
                          Get Notified
                        </>
                      )}
                    </button>
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
