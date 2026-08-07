import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavigationBar from '../app/components/NavigationBar';
import Footer from '../app/components/Footer';
import api from '../services/api';
import { Store } from '../data/models/Store';
import { FaFacebook, FaInstagram, FaTiktok, FaGlobe, FaPhoneAlt } from 'react-icons/fa';

interface StoreFilter {
  status: 'published';
  slug: string;
}

export default function ShopDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getShop() {
      if (!slug) {
        setError('No shop slug provided');
        setLoading(false);
        return;
      }

      try {
        const filter: StoreFilter = {
          status: 'published',
          slug: slug
        };

        const response = await api.getStores({
          fields: '*,logo.data.full_url,cover.data.full_url,store_gallery.directus_files_id.*',
          filter
        });

        if (!response.data || response.data.length === 0) {
          setError('Shop not found');
          setLoading(false);
          return;
        }

        setShop(response.data[0] as Store);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching shop:', error);
        setError('Failed to load shop');
        setLoading(false);
      }
    }

    getShop();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <NavigationBar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-white">
        <NavigationBar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-xl text-gray-600 mb-4">{error || 'Shop not found'}</div>
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-mall-brown text-white rounded hover:bg-mall-accent transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <NavigationBar />

      {/* Main Content */}
      <section className="w-full px-4 md:px-12 py-20 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left Column */}
            <div className="my-6">
              <h2 className="text-3xl text-center font-lora text-shadow-mall-brown md:text-4xl font-bold text-gray-600 tracking-widest">
                {shop.name.toUpperCase()}
              </h2>

              {shop.subtitle && (
                <p className="text-base text-center tracking-wider mt-2 font-light font-montserrat text-mall-accent-dark">
                  {shop.subtitle.toUpperCase()}
                </p>
              )}

              {/* Social Links */}
              <div className="flex justify-center items-center mt-2 gap-8 rounded-full p-2">
                {shop.website && (
                  <a 
                    href={shop.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-mall-brown hover:text-mall-accent transition-colors"
                  >
                    <FaGlobe className="w-6 h-6 text-mall-reseda-green" />
                  </a>
                )}
                {shop.facebook && (
                  <a 
                    href={shop.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-mall-brown hover:text-mall-accent transition-colors"
                  >
                    <FaFacebook className="w-6 h-6 text-mall-reseda-green" />
                  </a>
                )}
                {shop.instagram && (
                  <a 
                    href={shop.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-mall-brown hover:text-mall-accent transition-colors"
                  >
                    <FaInstagram className="w-6 h-6 text-mall-reseda-green" />
                  </a>
                )}
                {shop.tiktok && (
                  <a 
                    href={shop.tiktok} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-mall-brown hover:text-mall-accent transition-colors"
                  >
                    <FaTiktok className="w-6 h-6 text-mall-reseda-green" />
                  </a>
                )}
                {shop.contact_number && (
                  <a 
                    href={`tel:${shop.contact_number || ''}`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-mall-brown hover:text-mall-accent transition-colors"
                  >
                    <FaPhoneAlt className="w-6 h-6 text-mall-reseda-green" />
                  </a>
                )}
              </div>

              <div className="w-120 h-px bg-gradient-to-r from-transparent via-mall-accent-dark to-transparent mt-6 mb-6" />

              {/* Store Description */}
              <div className="prose prose-lg max-w-none mb-8">
                <div 
                  className="text-gray-700 leading-relaxed font-lora bg-mall-accent p-8 rounded-2xl"
                  dangerouslySetInnerHTML={{ __html: shop.store_description }}
                />

                <div className="w-full mt-12">
                  <div className="bg-mall-accent rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 tracking-wider font-montserrat text-mall-brown">CONTACT</h3>
                    <div className="space-y-4 text-gray-600">
                      {shop.operation_hours && shop.operation_hours !== undefined && shop.type !== 'hotel' && (
                        <p className="text-gray-700 leading-relaxed">
                          Opening Hours : <span dangerouslySetInnerHTML={{ __html: shop.operation_hours }} />
                        </p>
                      )}
                      {shop.operation_hours && shop.operation_hours !== undefined && shop.type === 'hotel' && (
                        <p className="text-gray-700 leading-relaxed">
                          <span dangerouslySetInnerHTML={{ __html: shop.operation_hours }} />
                        </p>
                      )}

                      {/* Store Contact Number */}
                      {shop.contact_number && shop.contact_number.length > 0 && (
                        <div>
                          {shop.type === 'hotel' && (
                            <p className="text-gray-700 font-medium mb-2">For bookings & reservations:</p>
                          )}
                          <a
                            href={`tel:${shop.contact_number || ''}`}
                            className="text-gray-300 hover:text-white transition-colors"
                          >
                            <FaPhoneAlt className="w-4 h-4 inline mr-2" />
                            {shop.contact_number || ''}
                          </a>
                        </div>                
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Gallery */}
            {shop.store_gallery && shop.store_gallery.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {shop.store_gallery.slice(0, 4).map((image, index) => (
                  <div 
                    key={index}
                    className={`relative overflow-hidden rounded-lg ${
                      index % 3 === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-square'
                    }`}
                  >
                    <img
                      src={image.directus_files_id.data.full_url}
                      alt={`${shop.name} gallery image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
