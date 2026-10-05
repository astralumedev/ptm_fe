import { useState } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane } from 'react-icons/fa';
import NavigationBar from '../app/components/NavigationBar';
import PageHeader from '../app/components/PageHeader';
import Footer from '../app/components/Footer';
import { useBlock, useBundle } from '../content/block';
import { contactPageBlock } from '../content/blocks/pages';
import { useMallHours } from '../content/blocks/site';
import { submitForm } from '../content/forms';

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#801424] focus:ring-1 focus:ring-[#801424] transition-colors';
const labelClass = 'block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider';

/** "+977 61-520000 / +977 98…" → "+97761520000" (first number, dialable). */
const telHref = (phone: string) => `tel:${phone.split(/[/,;]/)[0].replace(/[^\d+]/g, '')}`;

const ContactPage: React.FC = () => {
  const c = useBlock(contactPageBlock);
  const settings = useBundle()?.settings?.[0];
  const topics = (c.topics || []).filter(Boolean);
  const emptyForm = { name: '', email: '', phone: '', subject: '', message: '' };

  const [formData, setFormData] = useState(emptyForm);
  const [honeypot, setHoneypot] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const hours = useMallHours();
  const phone = settings?.phone || '';
  const email = settings?.email || '';
  const address = settings?.address || '';

  // The chosen topic, or the first one when nothing (or a since-removed topic) is selected.
  const subject = topics.includes(formData.subject) ? formData.subject : topics[0] || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      await submitForm('contact', { ...formData, subject }, honeypot);
      setSubmitted(true);
      setFormData(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen font-montserrat bg-neutral-50/50 text-gray-900">
      <NavigationBar />

      <PageHeader
        title={c.title}
        subtitle={c.subtitle}
        badge={c.badge}
        breadcrumbs={[
          { label: 'Contact', href: '/contact' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-16">

        {/* Top Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-16">
          <div className="flex md:block gap-4 bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#801424] flex items-center justify-center text-xl shrink-0 md:mb-4">
              <FaPhoneAlt />
            </div>
            <div className="min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1 font-arizona-flare">{c.phoneTitle}</h3>
            <p className="text-xs text-gray-500 mb-2 md:mb-4">{c.phoneText}</p>
            {phone && <a
              href={telHref(phone)}
              className="text-sm font-bold text-[#801424] hover:text-[#600f1b] transition-colors block"
            >
              {phone}
            </a>}
            </div>
          </div>

          <div className="flex md:block gap-4 bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#801424] flex items-center justify-center text-xl shrink-0 md:mb-4">
              <FaEnvelope />
            </div>
            <div className="min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1 font-arizona-flare">{c.emailTitle}</h3>
            <p className="text-xs text-gray-500 mb-2 md:mb-4">{c.emailText}</p>
            {email && <a
              href={`mailto:${email}`}
              className="text-sm font-bold text-[#801424] hover:text-[#600f1b] transition-colors block"
            >
              {email}
            </a>}
            </div>
          </div>

          <div className="flex md:block gap-4 bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#801424] flex items-center justify-center text-xl shrink-0 md:mb-4">
              <FaClock />
            </div>
            <div className="min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1 font-arizona-flare">{c.hoursTitle}</h3>
            {hours.rows.map((row, idx, all) => (
              <p key={idx} className={`text-xs text-gray-500${idx < all.length - 1 ? ' mb-1' : ''}`}>{row.label}: {row.hours}</p>
            ))}
            </div>
          </div>
        </div>

        {/* Main Grid: Form & Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">

          {/* Inquiry Form */}
          <div className="lg:col-span-6 bg-white p-5 sm:p-10 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-sm">
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#801424]">{c.formEyebrow}</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-arizona-flare mt-1">
                {c.formHeading}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                {c.formIntro}
              </p>
            </div>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3" role="status">
                <h4 className="text-lg font-bold text-emerald-900 font-arizona-flare">{c.successHeading}</h4>
                <p className="text-xs text-emerald-700">
                  {c.successText}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-secondary text-xs mt-4"
                >
                  {c.againLabel}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Spam trap: hidden from people, bots fill it in. */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, opacity: 0 }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className={labelClass}>
                      {c.nameLabel}
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      maxLength={120}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={c.namePlaceholder}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className={labelClass}>
                      {c.phoneLabel}
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      required
                      maxLength={40}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder={c.phonePlaceholder}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-email" className={labelClass}>
                    {c.emailLabel}
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    maxLength={200}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={c.emailPlaceholder}
                    className={inputClass}
                  />
                </div>

                {topics.length > 0 && (
                  <div>
                    <label htmlFor="contact-subject" className={labelClass}>
                      {c.topicLabel}
                    </label>
                    <select
                      id="contact-subject"
                      value={subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className={`${inputClass} bg-white`}
                    >
                      {topics.map((topic) => (
                        <option key={topic} value={topic}>{topic}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="contact-message" className={labelClass}>
                    {c.messageLabel}
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    maxLength={5000}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={c.messagePlaceholder}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  aria-busy={sending}
                  className="btn-primary w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <FaPaperPlane className="w-3.5 h-3.5" />
                  <span>{sending ? c.sendingLabel : c.submitLabel}</span>
                </button>
              </form>
            )}

          </div>

          {/* Location Details & Map */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#801424] flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 font-arizona-flare">{c.locationTitle}</h3>
                  <p className="text-xs text-gray-500">{address}</p>
                  {settings?.location_info && settings.location_info !== address && (
                    <p className="text-xs text-gray-500">{settings.location_info}</p>
                  )}
                </div>
              </div>
              {c.locationText && (
                <p className="text-xs text-gray-600 leading-relaxed">
                  {c.locationText}
                </p>
              )}
            </div>

            {/* Embedded Google Map */}
            {c.mapEmbedUrl && (
              <div className="h-[380px] rounded-3xl overflow-hidden shadow-lg border border-gray-200">
                <iframe
                  src={c.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Pokhara Trade Mall Google Maps Location"
                />
              </div>
            )}

          </div>

        </div>

      </div>

      <Footer />
    </main>
  );
};

export default ContactPage;
