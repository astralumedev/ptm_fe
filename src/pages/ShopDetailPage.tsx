import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaPhoneAlt, FaGlobe, FaFacebook, FaInstagram, FaTiktok, FaMapMarkerAlt, FaArrowLeft, FaStore } from 'react-icons/fa';
import NavigationBar from '../app/components/NavigationBar';
import PageHeader from '../app/components/PageHeader';
import Footer from '../app/components/Footer';
import api from '../services/api';
import { Store } from '../data/models/Store';
import { useBlock } from '../content/block';
import { storePageBlock, fill } from '../content/blocks/directory';
import { usePageMeta } from '../content/seo';

/** Store records may carry mall-map placement (added by the CMS); read it defensively. */
type StoreWithMap = Store & { mapFloor?: string | null; mapUnits?: string[] | null };

/** Adds https:// to links typed without it, so "www.brand.com" still works. */
const withProtocol = (url: string) => (/^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`);

export default function ShopDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const t = useBlock(storePageBlock);
  const [shop, setShop] = useState<Store | null>(null);
  usePageMeta(shop ? { title: shop.name, description: shop.subtitle || shop.store_description, image: shop.cover?.data?.full_url || shop.logo?.data?.full_url } : null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        setLoading(true);
        if (!slug) return;
        const response = await api.getStores({ filter: { slug, status: 'published' } });
        if (response.data && response.data.length > 0) {
          setShop(response.data[0]);
        } else {
          setError(null);
          setShop(null);
        }
      } catch (err) {
        console.error('Error loading store details:', err);
        setError('failed');
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
          <p className="text-sm font-semibold text-gray-500">{t.loadingText}</p>
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
          <h2 className="text-2xl font-bold text-gray-900 font-arizona-flare">{t.notFoundTitle}</h2>
          <p className="text-xs text-gray-500">
            {t.notFoundText}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button onClick={() => navigate(t.directoryUrl || '/shops/directory')} className="btn-primary text-xs">
              {t.notFoundPrimary}
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary text-xs">
              {t.notFoundSecondary}
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const mapUnits = (shop as StoreWithMap).mapUnits || [];
  const onMap = mapUnits.length > 0 || Boolean((shop as StoreWithMap).mapFloor);
  const mapHref = onMap ? `/mall-map?store=${encodeURIComponent(shop.slug)}` : `/mall-map?search=${encodeURIComponent(shop.name)}`;
  const hours = shop.operation_hours || t.hoursFallback;
  const phone = shop.contact_number || t.phoneFallback;
  const gallery = (shop.store_gallery || []).filter((g) => g?.directus_files_id?.data?.full_url);
  const tags = (shop.tags || []).filter(Boolean);
  const socials = [
    { url: shop.website, icon: FaGlobe, label: 'Website' },
    { url: shop.facebook, icon: FaFacebook, label: 'Facebook' },
    { url: shop.instagram, icon: FaInstagram, label: 'Instagram' },
    { url: shop.tiktok, icon: FaTiktok, label: 'TikTok' },
  ].filter((s): s is { url: string; icon: typeof FaGlobe; label: string } => Boolean(s.url && s.url.trim()));

  return (
    <div className="min-h-screen font-montserrat bg-neutral-50/50 text-gray-900 pb-[76px] lg:pb-0">
      <NavigationBar />

      <PageHeader
        title={shop.name}
        subtitle={shop.subtitle || fill(t.subtitleFallback, { name: shop.name })}
        badge={shop.type?.toUpperCase() || t.badgeFallback}
        breadcrumbs={[
          { label: t.breadcrumb, href: t.directoryUrl },
          { label: shop.name }
        ]}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-10 md:py-16">
        
        {/* Back Link */}
        <div className="mb-5 md:mb-8">
          <Link
            to={t.directoryUrl || '/shops/directory'}
            className="btn-link"
          >
            <FaArrowLeft className="w-3.5 h-3.5" />
            <span>{t.backLabel}</span>
          </Link>
        </div>

        {/* Phones: the photo comes first, it's what people recognise the shop by. */}
        <div className="lg:hidden mb-5 rounded-2xl overflow-hidden border border-gray-200/80 shadow-sm aspect-[16/10] bg-gray-100">
          <img decoding="async" src={shop.cover?.data?.full_url || shop.logo?.data?.full_url || '/mall_images/ptm_hero.webp'} alt={shop.name} className="w-full h-full object-cover" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
          
          {/* Left Column: Details & Description */}
          <div className="lg:col-span-7 space-y-6 lg:space-y-8">
            
            <div className="bg-white p-5 sm:p-10 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs space-y-5 sm:space-y-6">
              
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5 sm:pb-6">
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

                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-[#801424] text-xs font-bold">
                    <FaMapMarkerAlt className="w-3.5 h-3.5" />
                    <span>{fill(t.floorLabel, { floor: shop.floor || t.floorFallback })}</span>
                  </div>
                  {shop.unitNumber && t.unitLabel && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold">
                      <span>{fill(t.unitLabel, { unit: shop.unitNumber })}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="cms-prose cms-prose-sm text-gray-600">
                <div dangerouslySetInnerHTML={{ __html: shop.store_description || fill(t.descriptionFallback, { name: shop.name }) }} />
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {t.tagsHeading && <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-2">{t.tagsHeading}</span>}
                  {tags.map((tag, i) => (
                    <span key={i} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Social Channels */}
              {socials.length > 0 && (
                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-2">{t.connectLabel}</span>
                  {socials.map(({ url, icon: Icon, label }) => (
                    <a
                      key={label}
                      href={withProtocol(url.trim())}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${shop.name} ${label}`}
                      title={label}
                      className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 hover:text-[#801424] hover:bg-red-50 transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              )}

            </div>

            {/* Practical Info Card */}
            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-gray-900 font-arizona-flare uppercase tracking-wider">
                Store Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                {hours && (
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <span className="font-semibold text-gray-500 uppercase tracking-wider block">{t.hoursLabel}</span>
                    {hours.split(';').map((line, i) => (
                      <p key={i} className="font-bold text-gray-800">
                        {line.trim()}
                      </p>
                    ))}
                  </div>
                )}

                {phone && (
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <span className="font-semibold text-gray-500 uppercase tracking-wider block">{t.phoneLabel}</span>
                    <p className="font-bold text-[#801424]">
                      {phone}
                    </p>
                  </div>
                )}
              </div>

              {shop.contact_number && (
                <div className="pt-2">
                  <a
                    href={`tel:${shop.contact_number.replace(/\s+/g, '')}`}
                    className="btn-primary w-full"
                  >
                    <FaPhoneAlt className="w-3.5 h-3.5" />
                    <span>{t.callLabel}</span>
                  </a>
                </div>
              )}

              {shop.website && shop.website.trim() && t.websiteLabel && (
                <div className={shop.contact_number ? '' : 'pt-2'}>
                  <a
                    href={withProtocol(shop.website.trim())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary w-full"
                  >
                    <FaGlobe className="w-3.5 h-3.5" />
                    <span>{t.websiteLabel}</span>
                  </a>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Imagery & Gallery */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Primary Cover Image */}
            <div className="hidden lg:block bg-white p-3 rounded-3xl border border-gray-200/80 shadow-md overflow-hidden aspect-[4/3] group">
              <img loading="lazy" decoding="async"
                src={shop.cover?.data?.full_url || shop.logo?.data?.full_url || '/mall_images/ptm_hero.webp'}
                alt={shop.name}
                className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Gallery Grid if available */}
            {gallery.length > 0 && (
              <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  {t.galleryHeading}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {gallery.map((image, index) => (
                    <div
                      key={index}
                      className="rounded-xl overflow-hidden aspect-square bg-gray-100 border border-gray-200"
                    >
                      <img loading="lazy" decoding="async"
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
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 text-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">{t.mapEyebrow}</span>
              <h3 className="text-xl font-bold font-arizona-flare">{t.mapHeading}</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                {fill(t.mapText, { name: shop.name })}
              </p>
              <Link
                to={mapHref}
                className="btn-white w-full"
              >
                <span>{t.mapButton}</span>
              </Link>
            </div>

          </div>

        </div>

      </section>

      {/* Phones: the two things a visitor in the mall wants, always in reach. */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-6px_20px_rgba(0,0,0,0.06)] flex gap-2.5">
        <Link to={mapHref} className="btn-primary flex-1 min-w-0 justify-center">
          <FaMapMarkerAlt className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{t.mapButton}</span>
        </Link>
        {shop.contact_number && (
          <a href={`tel:${shop.contact_number.replace(/\s+/g, '')}`} className="btn-secondary !px-4 justify-center" aria-label={t.callLabel}>
            <FaPhoneAlt className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <Footer />
    </div>
  );
}
