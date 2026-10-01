import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaClock,
  FaArrowRight,
  FaInfoCircle,
  FaEnvelope,
  FaHandshake,
  FaPaperPlane,
  FaTimes,
} from 'react-icons/fa';
import NavigationBar from '../app/components/NavigationBar';
import PageHeader, { PageHeaderTab } from '../app/components/PageHeader';
import Footer from '../app/components/Footer';
import api from '../services/api';
import { Store } from '../data/models/Store';
import { useBlock, useBundle } from '../content/block';
import { CmsLink } from '../content/CmsLink';
import { CmsIcon } from '../content/icons';
import { useCategories, type Category } from '../content/blocks/categories';
import { servicesPageBlock, servicesAmenitiesBlock, type ServiceSection } from '../content/blocks/pages';
import { submitForm } from '../content/forms';

const serif = { fontFamily: "'Arizona Flare', 'Times New Roman', serif" };

interface ServiceGroup {
  cat: Category;
  id: string;
  tabLabel: string;
  eyebrow: string;
  heading: string;
  intro: string;
  stores: Store[];
}

const lower = (v?: string | null) => (v || '').toLowerCase();

/** Groups service stores under the "Services" categories; per-category texts come from the CMS. */
function useServiceGroups(stores: Store[]): ServiceGroup[] {
  const { bySector, find } = useCategories();
  const { sections } = useBlock(servicesPageBlock);
  return useMemo(() => {
    const copyFor = (slug: string): ServiceSection | undefined => (sections || []).find((s) => s.category === slug);
    const groups: ServiceGroup[] = [];
    for (const cat of bySector('service')) {
      const copy = copyFor(cat.slug);
      if (copy?.hidden) continue;
      const codes = new Set([cat.slug, ...(cat.aliases || []), ...(copy?.matchTags || [])].map(lower));
      groups.push({
        cat,
        id: copy?.anchor?.trim() || cat.slug,
        tabLabel: copy?.tabLabel || cat.shortName || cat.name,
        eyebrow: copy?.eyebrow || cat.subtitle || '',
        heading: copy?.heading || cat.name,
        intro: copy?.intro || cat.description || '',
        stores: stores.filter(
          (s) =>
            find(s.categorySlug)?.slug === cat.slug ||
            codes.has(lower(s.categorySlug)) ||
            (s.tags || []).some((t) => codes.has(lower(t)))
        ),
      });
    }
    return groups;
  }, [stores, sections, bySector, find]);
}

const leasingInput =
  'w-full px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-colors';
const leasingLabel = 'block text-xs font-semibold text-gray-300 mb-1.5 uppercase tracking-wider';

function LeasingForm({ heading, intro, submitLabel, successText, onClose }: { heading: string; intro: string; submitLabel: string; successText: string; onClose: () => void }) {
  const { visible } = useCategories();
  const empty = { name: '', phone: '', email: '', business: '', category: '', size: '', message: '' };
  const [data, setData] = useState(empty);
  const [honeypot, setHoneypot] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setData({ ...data, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      await submitForm('leasing', data, honeypot);
      setDone(true);
      setData(empty);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative z-10 mt-8 pt-8 border-t border-white/10">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h4 className="text-xl sm:text-2xl font-bold" style={serif}>{heading}</h4>
          {intro && <p className="text-sm text-gray-300 font-light">{intro}</p>}
        </div>
        <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors" aria-label="Close leasing form">
          <FaTimes className="w-4 h-4" />
        </button>
      </div>

      {done ? (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-center space-y-3" role="status">
          <p className="text-sm text-emerald-200">{successText}</p>
          <button type="button" onClick={() => setDone(false)} className="btn-dark text-xs">Send another enquiry</button>
        </div>
      ) : (
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
            value={honeypot} onChange={(e) => setHoneypot(e.target.value)}
            style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, opacity: 0 }}
          />
          <div>
            <label htmlFor="lease-name" className={leasingLabel}>Your Name *</label>
            <input id="lease-name" required maxLength={120} value={data.name} onChange={set('name')} className={leasingInput} placeholder="e.g. Ramesh Shrestha" />
          </div>
          <div>
            <label htmlFor="lease-phone" className={leasingLabel}>Phone Number *</label>
            <input id="lease-phone" type="tel" required maxLength={40} value={data.phone} onChange={set('phone')} className={leasingInput} placeholder="+977 98..." />
          </div>
          <div>
            <label htmlFor="lease-email" className={leasingLabel}>Email Address</label>
            <input id="lease-email" type="email" maxLength={200} value={data.email} onChange={set('email')} className={leasingInput} placeholder="name@example.com" />
          </div>
          <div>
            <label htmlFor="lease-business" className={leasingLabel}>Business / Brand Name *</label>
            <input id="lease-business" required maxLength={160} value={data.business} onChange={set('business')} className={leasingInput} />
          </div>
          <div>
            <label htmlFor="lease-category" className={leasingLabel}>Business Category</label>
            <select id="lease-category" value={data.category} onChange={set('category')} className={`${leasingInput} [&_option]:text-gray-900`}>
              <option value="">Select a category</option>
              {visible.map((c) => (
                <option key={c.slug} value={c.name}>{c.name}</option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="lease-size" className={leasingLabel}>Space Needed</label>
            <input id="lease-size" maxLength={80} value={data.size} onChange={set('size')} className={leasingInput} placeholder="e.g. 1 shutter, kiosk, 500 sq ft" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="lease-message" className={leasingLabel}>Message</label>
            <textarea id="lease-message" rows={3} maxLength={5000} value={data.message} onChange={set('message')} className={`${leasingInput} resize-none`} />
          </div>
          {error && (
            <p className="sm:col-span-2 text-xs text-red-200 bg-red-500/10 border border-red-400/30 rounded-xl px-4 py-3" role="alert">{error}</p>
          )}
          <div className="sm:col-span-2">
            <button type="submit" disabled={sending} aria-busy={sending} className="btn-primary w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed">
              <FaPaperPlane className="w-3.5 h-3.5" />
              <span>{sending ? 'Sending…' : submitLabel}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ServicesPage() {
  const location = useLocation();
  const page = useBlock(servicesPageBlock);
  const amenities = useBlock(servicesAmenitiesBlock);
  const settings = useBundle()?.settings?.[0];
  const [allServices, setAllServices] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [leasingOpen, setLeasingOpen] = useState(false);
  const groups = useServiceGroups(allServices);
  const hotline = (settings?.phone || '').split('/')[0].trim();
  const amenityId = amenities.anchor?.trim() || 'parking';
  const cards = (amenities.cards || []).filter((c) => !c.hidden);

  // Sync scroll hash
  useEffect(() => {
    if (location.hash) {
      const elementId = location.hash.replace('#', '');
      const el = document.getElementById(elementId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [location.hash, loading]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await api.getStores({
          filter: { status: 'published', type: 'service' },
        });
        setAllServices(response.data || []);
      } catch (err) {
        console.error('Error loading services stores:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const tabs: PageHeaderTab[] = [
    ...groups.map((g) => ({ id: g.id, label: g.tabLabel, icon: <CmsIcon name={g.cat.icon} className="w-3.5 h-3.5" /> })),
    ...(!amenities.hidden ? [{ id: amenityId, label: amenities.tabLabel, icon: <CmsIcon name="parking" className="w-3.5 h-3.5" /> }] : []),
  ];

  const handleTabClick = (tabId: string) => {
    const el = document.getElementById(tabId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderServiceCards = (stores: Store[]) =>
    stores.length === 0 ? (
      <p className="py-8 text-center text-sm text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">{page.emptyText}</p>
    ) : (
    <div className="m-rail grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stores.map((store, index) => (
        <motion.div
          key={store.id}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="h-full"
        >
          <Link
            to={`/shops/details/${store.slug}`}
            className="group bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between h-full cursor-pointer !no-underline text-inherit block"
          >
            <div className="relative h-44 w-full overflow-hidden bg-gray-100">
              {store.cover?.data?.full_url && (
                <img loading="lazy" decoding="async"
                  src={store.cover.data.full_url}
                  alt={store.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />

              <span className="absolute top-3 right-3 text-[11px] font-semibold text-gray-900 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs border border-gray-200/80 flex items-center gap-1">
                <FaMapMarkerAlt className="w-2.5 h-2.5 text-[#801424]" />
                {store.floor || '3rd Floor'}
              </span>

              <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-widest text-white bg-[#801424]/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs">
                {store.category || 'Service'}
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0 shadow-xs">
                    {store.logo?.data?.full_url && (
                      <img loading="lazy" decoding="async" src={store.logo.data.full_url} alt={`${store.name} logo`} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className="text-base font-bold text-gray-900 group-hover:text-[#801424] transition-colors leading-snug"
                      style={serif}
                    >
                      {store.name}
                    </h3>
                    {store.unitNumber && (
                      <p className="text-[11px] text-gray-500 font-medium">{store.unitNumber}</p>
                    )}
                  </div>
                </div>

                {store.subtitle && (
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mt-1">{store.subtitle}</p>
                )}

                {store.tags && store.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {store.tags.slice(0, 3).map((tag, tIdx) => (
                      <span key={tIdx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                {store.operation_hours && (
                  <div className="flex items-center text-[11px] text-gray-500 gap-1">
                    <FaClock className="w-3 h-3 text-[#801424]" />
                    <span>{store.operation_hours.split(';')[0]}</span>
                  </div>
                )}

                <div className="flex items-center gap-3 ml-auto">
                  {store.contact_number && (
                    <a
                      href={`tel:${store.contact_number}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-500 hover:text-[#801424] transition-colors p-2.5 -m-1.5"
                      title={`Call ${store.name}`}
                    >
                      <FaPhoneAlt className="w-3 h-3" />
                    </a>
                  )}
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#801424] group-hover:translate-x-0.5 transition-all"
                  >
                    <span>{page.cardLinkLabel}</span>
                    <FaArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );

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
          { label: 'Services' },
        ]}
        tabs={tabs}
        onTabChange={handleTabClick}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 space-y-14 md:space-y-24">

        {/* One section per "Services" category */}
        {groups.map((group) => (
          <section key={group.cat.slug} id={group.id} className="scroll-mt-28 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
              <div>
                {group.eyebrow && (
                  <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-[#801424] uppercase mb-1">
                    <CmsIcon name={group.cat.icon} className="w-3.5 h-3.5" />
                    <span>{group.eyebrow}</span>
                  </div>
                )}
                <h2
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-wide"
                  style={serif}
                >
                  {group.heading}
                </h2>
              </div>
              {group.intro && (
                <p className="text-xs sm:text-sm text-gray-500 max-w-md">
                  {group.intro}
                </p>
              )}
            </div>

            {loading ? (
              <div className="py-12 flex justify-center"><div className="w-8 h-8 border-3 border-[#801424] border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              renderServiceCards(group.stores)
            )}
          </section>
        ))}

        {/* MALL SERVICES, PARKING & GUEST CONVENIENCES */}
        {!amenities.hidden && (
        <section id={amenityId} className="scroll-mt-28 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-bold tracking-widest text-[#801424] uppercase mb-1">
                <FaInfoCircle className="w-3.5 h-3.5" />
                <span>{amenities.eyebrow}</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-wide"
                style={serif}
              >
                {amenities.heading}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md">
              {amenities.intro}
            </p>
          </div>

          {/* Amenities Breakdown */}
          {cards.length > 0 && (
            <div className="m-rail grid grid-cols-1 md:grid-cols-3 gap-6">
              {cards.map((card, idx) => {
                const bullets = card.bullets || [];
                const hasDetails = card.showHotline || card.hours;
                return (
                  <div key={idx} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-sm space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#801424] flex items-center justify-center text-xl">
                      <CmsIcon name={card.icon} fallback="info" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900" style={serif}>
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                      {card.body}
                    </p>
                    {bullets.length > 0 && (
                      <ul className="text-xs text-gray-600 space-y-2 pt-2 border-t border-gray-100">
                        {bullets.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-center gap-2">
                            <CmsIcon name={b.icon} fallback="star" className="w-3.5 h-3.5 text-[#801424]" /> {b.text}
                          </li>
                        ))}
                      </ul>
                    )}
                    {card.linkLabel && card.linkHref && (
                      <div className="pt-2 border-t border-gray-100">
                        <CmsLink
                          href={card.linkHref}
                          className="inline-flex items-center gap-2 py-2.5 -my-2.5 text-xs font-bold text-[#801424] hover:text-[#5a0c18] no-underline"
                        >
                          <span>{card.linkLabel}</span>
                          <FaArrowRight className="w-3 h-3" />
                        </CmsLink>
                      </div>
                    )}
                    {hasDetails && (
                      <div className="pt-2 border-t border-gray-100 text-xs text-gray-600 space-y-1">
                        {card.showHotline && hotline && <p><strong>{card.hotlineLabel}</strong> {hotline}</p>}
                        {card.hours && <p><strong>{card.hoursLabel}</strong> {card.hours}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Get In Touch CTA Banner */}
          {!amenities.ctaHidden && (
            <div className="bg-gradient-to-r from-gray-900 via-[#1a1215] to-gray-900 text-white rounded-3xl p-8 sm:p-10 md:p-12 relative overflow-hidden shadow-xl border border-gray-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <span className="text-xs uppercase tracking-widest text-red-400 font-bold">{amenities.ctaEyebrow}</span>
                  <h3
                    className="text-2xl sm:text-3xl font-bold"
                    style={serif}
                  >
                    {amenities.ctaHeading}
                  </h3>
                  <p className="text-sm text-gray-300 font-light">
                    {amenities.ctaText}
                  </p>
                </div>
                <div className="flex-shrink-0 flex flex-wrap gap-3">
                  {amenities.ctaButtonLabel && (
                    <CmsLink
                      href={amenities.ctaButtonHref}
                      className="btn-primary"
                    >
                      <FaEnvelope className="w-3.5 h-3.5" />
                      <span>{amenities.ctaButtonLabel}</span>
                    </CmsLink>
                  )}
                  {amenities.leasingButtonLabel && (
                    <button
                      type="button"
                      onClick={() => setLeasingOpen((o) => !o)}
                      aria-expanded={leasingOpen}
                      className="btn-dark"
                    >
                      <FaHandshake className="w-3.5 h-3.5" />
                      <span>{amenities.leasingButtonLabel}</span>
                    </button>
                  )}
                </div>
              </div>

              {leasingOpen && amenities.leasingButtonLabel && (
                <LeasingForm
                  heading={amenities.leasingHeading}
                  intro={amenities.leasingIntro}
                  submitLabel={amenities.leasingSubmitLabel}
                  successText={amenities.leasingSuccess}
                  onClose={() => setLeasingOpen(false)}
                />
              )}
            </div>
          )}
        </section>
        )}

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
