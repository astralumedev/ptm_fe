import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaPhoneAlt, FaGlobe, FaFacebook, FaInstagram, FaTiktok, FaMapMarkerAlt, FaArrowLeft, FaStore } from 'react-icons/fa';
import NavigationBar from '../app/components/NavigationBar';
import PageHeader from '../app/components/PageHeader';
import Footer from '../app/components/Footer';
import api from '../services/api';
import { Store } from '../data/models/Store';

export default function ShopDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        setLoading(true);
        if (!slug) return;
        const response = await api.getStores({ filter: { slug } });
        if (response.data && response.data.length > 0) {
          setShop(response.data[0]);
        } else {
          setError('Store not found');
        }
      } catch (err) {
        console.error('Error loading store details:', err);
        setError('Failed to load store');
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-montserrat flex flex-col justify-between">
        <NavigationBar />
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-10 h-10 border-4 border-[#801424] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-500">Loading store profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-white font-montserrat flex flex-col justify-between">
        <NavigationBar />
        <div className="max-w-md mx-auto my-32 p-8 bg-white border border-gray-200 rounded-3xl text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-red-50 text-[#801424] rounded-full flex items-center justify-center mx-auto text-2xl">
            <FaStore />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 font-arizona-flare">{error || 'Store Not Found'}</h2>
          <p className="text-xs text-gray-500">
            We couldn't find the store or boutique you were searching for.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button onClick={() => navigate('/shops/directory')} className="btn-primary text-xs">
              Explore Directory
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary text-xs">
              Go Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-montserrat bg-neutral-50/50 text-gray-900">
      <NavigationBar />

      <PageHeader
        title={shop.name}
        subtitle={shop.subtitle || `Explore ${shop.name} at Pokhara Trade Mall`}
        badge={shop.type?.toUpperCase() || 'RETAIL OUTLET'}
        breadcrumbs={[
          { label: 'Directory', href: '/shops/directory' },
          { label: shop.name }
        ]}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link
            to="/shops/directory"
            className="btn-link"
          >
            <FaArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Store Directory</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Details & Description */}
          <div className="lg:col-span-7 space-y-8">
            
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200/80 shadow-xs space-y-6">
              
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-arizona-flare">
                    {shop.name}
                  </h2>
                  {shop.subtitle && (
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#801424] mt-1">
                      {shop.subtitle}
                    </p>
                  )}
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-[#801424] text-xs font-bold">
                  <FaMapMarkerAlt className="w-3.5 h-3.5" />
                  <span>Floor: {shop.floor || 'Level 1'}</span>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: shop.store_description || 'Welcome to ' + shop.name + ' at Pokhara Trade Mall.' }} />
              </div>

              {/* Social Channels */}
              <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-2">Connect:</span>
                {shop.website && (
                  <a
                    href={shop.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 hover:text-[#801424] hover:bg-red-50 transition-colors"
                  >
                    <FaGlobe className="w-4 h-4" />
                  </a>
                )}
                {shop.facebook && (
                  <a
                    href={shop.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 hover:text-[#801424] hover:bg-red-50 transition-colors"
                  >
                    <FaFacebook className="w-4 h-4" />
                  </a>
                )}
                {shop.instagram && (
                  <a
                    href={shop.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 hover:text-[#801424] hover:bg-red-50 transition-colors"
                  >
                    <FaInstagram className="w-4 h-4" />
                  </a>
                )}
                {shop.tiktok && (
                  <a
                    href={shop.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 hover:text-[#801424] hover:bg-red-50 transition-colors"
                  >
                    <FaTiktok className="w-4 h-4" />
                  </a>
                )}
              </div>

            </div>

            {/* Practical Info Card */}
            <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-gray-900 font-arizona-flare uppercase tracking-wider">
                Store Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                  <span className="font-semibold text-gray-500 uppercase tracking-wider block">Hours</span>
                  <p className="font-bold text-gray-800">
                    {shop.operation_hours || '10:00 AM – 8:00 PM'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                  <span className="font-semibold text-gray-500 uppercase tracking-wider block">Direct Phone</span>
                  <p className="font-bold text-[#801424]">
                    {shop.contact_number || '+977 61-520000'}
                  </p>
                </div>
              </div>

              {shop.contact_number && (
                <div className="pt-2">
                  <a
                    href={`tel:${shop.contact_number.replace(/\s+/g, '')}`}
                    className="btn-primary w-full"
                  >
                    <FaPhoneAlt className="w-3.5 h-3.5" />
                    <span>Call Store Directly</span>
                  </a>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Imagery & Gallery */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Primary Cover Image */}
            <div className="bg-white p-3 rounded-3xl border border-gray-200/80 shadow-md overflow-hidden aspect-[4/3] group">
              <img
                src={shop.cover?.data?.full_url || shop.logo?.data?.full_url || '/mall_images/ptm_hero.webp'}
                alt={shop.name}
                className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Gallery Grid if available */}
            {shop.store_gallery && shop.store_gallery.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Store Gallery
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {shop.store_gallery.slice(0, 4).map((image, index) => (
                    <div
                      key={index}
                      className="rounded-xl overflow-hidden aspect-square bg-gray-100 border border-gray-200"
                    >
                      <img
                        src={image.directus_files_id.data.full_url}
                        alt={`${shop.name} photo ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Wayfinding Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 text-white p-8 rounded-3xl shadow-xl space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Navigation</span>
              <h3 className="text-xl font-bold font-arizona-flare">Find in Mall Map</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Locate {shop.name} with step-by-step turn guidance, escalators, and nearest parking lifts.
              </p>
              <Link
                to={`/mall-map?search=${encodeURIComponent(shop.name)}`}
                className="btn-white w-full"
              >
                <span>Navigate on Interactive Map</span>
              </Link>
            </div>

          </div>

        </div>

      </section>

      <Footer />
    </div>
  );
}
