import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaArrowRight,
  FaUsers,
} from 'react-icons/fa';
import NavigationBar from '../app/components/NavigationBar';
import PageHeader from '../app/components/PageHeader';
import Footer from '../app/components/Footer';
import { useBlock } from '../content/block';
import { CmsLink } from '../content/CmsLink';
import { CmsIcon } from '../content/icons';
import { liveOnly } from '../content/visibility';
import { entertainPageBlock, type Spotlight } from '../content/blocks/pages';

const serif = { fontFamily: "'Arizona Flare', 'Times New Roman', serif" };

function SpotlightSection({ spot, flipped }: { spot: Spotlight; flipped: boolean }) {
  const features = spot.features || [];
  return (
    <section className="bg-white rounded-3xl border border-gray-200/90 shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12">
      {/* Media & Visual (right on desktop when flipped) */}
      <div className={`lg:col-span-6 ${flipped ? 'lg:order-2 ' : ''}relative h-80 sm:h-96 lg:h-full bg-gray-950 overflow-hidden`}>
        {spot.image && (
          <img
            src={spot.image}
            alt={spot.imageAlt || spot.title}
            className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute top-4 left-4 flex items-center gap-2">
          {spot.badge && (
            <span className="bg-[#801424] text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
              {spot.badge}
            </span>
          )}
          {spot.location && (
            <span className="bg-white/90 backdrop-blur-md text-gray-900 text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              <FaMapMarkerAlt className="w-2.5 h-2.5 text-[#801424]" />
              {spot.location}
            </span>
          )}
        </div>

        <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
          {spot.kicker && <span className="text-xs uppercase tracking-widest text-red-300 font-bold">{spot.kicker}</span>}
          <h3 className="text-2xl sm:text-3xl font-bold" style={serif}>
            {spot.title}
          </h3>
        </div>
      </div>

      {/* Details & Specs */}
      <div className={`lg:col-span-6 ${flipped ? 'lg:order-1 ' : ''}p-6 sm:p-8 md:p-10 flex flex-col justify-between space-y-6`}>
        <div className="space-y-6">
          <div>
            {spot.eyebrow && (
              <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-[#801424] uppercase mb-1">
                <CmsIcon name={spot.eyebrowIcon} fallback="star" className="w-3.5 h-3.5" />
                <span>{spot.eyebrow}</span>
              </div>
            )}
            <h2
              className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug"
              style={serif}
            >
              {spot.heading}
            </h2>
            <p className="text-sm text-gray-600 font-light leading-relaxed mt-2">
              {spot.body}
            </p>
          </div>

          {/* Feature Highlights Grid */}
          {features.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {features.map((f, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1 text-left">
                  <CmsIcon name={f.icon} fallback="star" className="w-4 h-4 text-[#801424]" />
                  <h4 className="text-xs font-bold text-gray-900">{f.title}</h4>
                  <p className="text-[11px] text-gray-500">{f.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Operating Info */}
          {(spot.hours || spot.phone) && (
            <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
              {spot.hours && (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500 flex items-center gap-1.5">
                    <FaClock className="w-3.5 h-3.5 text-[#801424]" /> {spot.hoursLabel}
                  </span>
                  <span className="font-bold text-gray-900">{spot.hours}</span>
                </div>
              )}
              {spot.phone && (
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500 flex items-center gap-1.5">
                    <FaPhoneAlt className="w-3.5 h-3.5 text-[#801424]" /> {spot.phoneLabel}
                  </span>
                  <a href={`tel:${spot.phone.replace(/[^\d+]/g, '')}`} className="font-bold text-gray-900 hover:text-[#801424]">{spot.phone}</a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action CTAs */}
        {(spot.primaryLabel || spot.secondaryLabel) && (
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
            {spot.primaryLabel && (
              <CmsLink href={spot.primaryHref} className="btn-primary">
                {spot.primaryIcon && <CmsIcon name={spot.primaryIcon} className="w-3.5 h-3.5" />}
                <span>{spot.primaryLabel}</span>
                {!spot.primaryIcon && <FaArrowRight className="w-3.5 h-3.5" />}
              </CmsLink>
            )}
            {spot.secondaryLabel && (
              <CmsLink href={spot.secondaryHref} className="btn-secondary">
                <span>{spot.secondaryLabel}</span>
              </CmsLink>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default function EntertainPage() {
  const page = useBlock(entertainPageBlock);
  const spotlights = liveOnly(page.spotlights);

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {/* Navigation */}
      <NavigationBar />

      {/* Hero Header */}
      <PageHeader
        title={page.title}
        subtitle={page.subtitle}
        badge={page.badge}
        breadcrumbs={[
          { label: 'Entertain' },
        ]}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-24">

        {spotlights.map((spot, idx) => (
          <SpotlightSection key={idx} spot={spot} flipped={idx % 2 === 1} />
        ))}

        {/* LIVE EVENTS, PRIVATE SCREENINGS & GATHERINGS */}
        {!page.eventsHidden && (
          <section className="bg-gradient-to-r from-gray-900 via-[#191114] to-gray-900 text-white rounded-3xl p-8 sm:p-10 md:p-12 relative overflow-hidden shadow-xl border border-gray-800">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4">
              {page.eventsEyebrow && (
                <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-red-400 uppercase">
                  <FaCalendarAlt className="w-3.5 h-3.5" />
                  <span>{page.eventsEyebrow}</span>
                </div>
              )}
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide leading-tight"
                style={serif}
              >
                {page.eventsHeading}
              </h2>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-light">
                {page.eventsText}
              </p>
              <div className="pt-4 flex flex-wrap items-center gap-4">
                {page.eventsPrimaryLabel && (
                  <CmsLink href={page.eventsPrimaryHref} className="btn-primary">
                    <FaUsers className="w-3.5 h-3.5" />
                    <span>{page.eventsPrimaryLabel}</span>
                  </CmsLink>
                )}
                {page.eventsSecondaryLabel && (
                  <CmsLink href={page.eventsSecondaryHref} className="btn-dark">
                    <span>{page.eventsSecondaryLabel}</span>
                  </CmsLink>
                )}
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
