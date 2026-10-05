import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBuilding,
  FaHistory,
  FaNewspaper,
  FaUsers,
  FaAward,
  FaArrowRight,
  FaChevronDown,
  FaExternalLinkAlt,
  FaQuoteLeft,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaLightbulb,
  FaCheckCircle,
  FaCompass,
  FaHeart
} from 'react-icons/fa';
import NavigationBar from '../app/components/NavigationBar';
import PageHeader, { PageHeaderTab } from '../app/components/PageHeader';
import Footer from '../app/components/Footer';
import { useBlock } from '../content/block';
import { CmsLink } from '../content/CmsLink';
import { CmsIcon } from '../content/icons';
import { liveOnly } from '../content/visibility';
import {
  aboutHeroBlock,
  aboutHistoryBlock,
  aboutMediaBlock,
  aboutLeadershipBlock,
  aboutFeaturesBlock,
  aboutFaqBlock,
  aboutCtaBlock,
  PRESS_COLORS,
} from '../content/blocks/pages';

const visible = <T extends { hidden?: boolean }>(items: T[] | undefined) => (items || []).filter((i) => !i.hidden);

export default function AboutPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const hero = useBlock(aboutHeroBlock);
  const history = useBlock(aboutHistoryBlock);
  const media = useBlock(aboutMediaBlock);
  const leadership = useBlock(aboutLeadershipBlock);
  const features = useBlock(aboutFeaturesBlock);
  const faq = useBlock(aboutFaqBlock);
  const cta = useBlock(aboutCtaBlock);

  const timelineEvents = visible(history.events);
  const mediaMentions = liveOnly(media.mentions);
  const leadershipTeam = visible(leadership.members);
  const mallFeatures = visible(features.features);
  const faqs = visible(faq.faqs);
  const stats = hero.stats || [];
  const pillars = hero.pillars || [];

  const tabs: PageHeaderTab[] = [
    { id: 'overview', label: hero.tabLabel, icon: <FaBuilding className="w-3.5 h-3.5" /> },
    ...(!history.hidden ? [{ id: 'history', label: history.tabLabel, icon: <FaHistory className="w-3.5 h-3.5" /> }] : []),
    ...(!media.hidden ? [{ id: 'media', label: media.tabLabel, icon: <FaNewspaper className="w-3.5 h-3.5" /> }] : []),
    ...(!leadership.hidden ? [{ id: 'leadership', label: leadership.tabLabel, icon: <FaUsers className="w-3.5 h-3.5" /> }] : []),
    ...(!features.hidden ? [{ id: 'features', label: features.tabLabel, icon: <FaAward className="w-3.5 h-3.5" /> }] : []),
    ...(!faq.hidden && faqs.length > 0 ? [{ id: 'faq', label: faq.tabLabel, icon: <FaLightbulb className="w-3.5 h-3.5" /> }] : []),
  ];

  const handleTabClick = (tabId: string) => {
    const el = document.getElementById(tabId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="font-montserrat min-h-screen bg-neutral-50/50 text-gray-900 selection:bg-[#801424] selection:text-white">
      <NavigationBar />

      {/* Hero Header */}
      <PageHeader
        title={hero.title}
        subtitle={hero.subtitle}
        badge={hero.badge}
        breadcrumbs={[
          { label: 'About Us', href: '/page/about_us' }
        ]}
        tabs={tabs}
        onTabChange={handleTabClick}
      />

      {/* SECTION 1: MALL INFORMATION & HERO OVERVIEW */}
      <section id="overview" className="relative py-12 md:py-24 bg-white border-b border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              {hero.eyebrow && (
                <div className="inline-flex items-center gap-2 text-[#801424] text-xs font-bold tracking-widest uppercase mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#801424]" />
                  {hero.eyebrow}
                </div>
              )}

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-tight font-arizona-flare">
                {hero.headingStart}<span className="text-[#801424]">{hero.headingHighlight}</span>{hero.headingEnd}
              </h2>

              {hero.intro && (
                <p
                  className="text-base sm:text-lg text-gray-600 leading-relaxed [&_strong]:text-gray-900 [&_a]:text-[#801424] [&_a]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: hero.intro }}
                />
              )}

              {hero.body && (
                <p
                  className="text-sm sm:text-base text-gray-600 leading-relaxed [&_strong]:font-semibold [&_strong]:text-gray-900 [&_a]:text-[#801424] [&_a]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: hero.body }}
                />
              )}

              {/* Core Pillars */}
              {pillars.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  {pillars.map((pillar, idx) => (
                    <div key={idx} className="flex sm:block gap-3.5 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-all duration-300">
                      <div className="w-10 h-10 shrink-0 rounded-lg bg-[#801424]/10 flex items-center justify-center text-[#801424] sm:mb-3">
                        <CmsIcon name={pillar.icon} className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{pillar.title}</h4>
                      <p className="text-xs text-gray-500 leading-normal">
                        {pillar.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                {hero.primaryLabel && (
                  <CmsLink
                    href={hero.primaryHref}
                    className="btn-primary"
                  >
                    <span>{hero.primaryLabel}</span>
                    <FaArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </CmsLink>
                )}

                {hero.secondaryLabel && (
                  <CmsLink
                    href={hero.secondaryHref}
                    className="btn-secondary"
                  >
                    <FaCompass className="w-4 h-4 text-[#801424]" />
                    <span>{hero.secondaryLabel}</span>
                  </CmsLink>
                )}
              </div>

            </motion.div>

            {/* Right Visual Image Collage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-md lg:max-w-none">

                {/* Main Hero Image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] group">
                  <img loading="lazy" decoding="async"
                    src={hero.image}
                    alt={hero.imageAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    {hero.imageTag && (
                      <span className="inline-block px-2.5 py-1 rounded-md bg-[#801424] text-[10px] font-bold tracking-wider uppercase mb-2">
                        {hero.imageTag}
                      </span>
                    )}
                    <h3 className="text-xl font-bold font-arizona-flare">{hero.imageTitle}</h3>
                    {hero.imageLocation && (
                      <p className="text-xs text-gray-200 mt-1 flex items-center gap-1.5">
                        <FaMapMarkerAlt className="text-red-400" />
                        {hero.imageLocation}
                      </p>
                    )}
                  </div>
                </div>

                {/* Floating Inset Badge 1 */}
                {hero.badgeValue && (
                  <div className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8 bg-white p-4 sm:p-5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 max-w-xs animate-bounce-slow">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-[#801424] font-bold text-xl flex-shrink-0">
                      {hero.badgeValue}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{hero.badgeTitle}</h5>
                      <p className="text-[11px] text-gray-500">{hero.badgeText}</p>
                    </div>
                  </div>
                )}

                {/* Floating Inset Badge 2 */}
                {hero.ratingValue && (
                  <div className="absolute -top-6 -right-4 sm:-top-6 sm:-right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <FaCheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">{hero.ratingLabel}</span>
                      <span className="text-xs font-extrabold text-gray-900">{hero.ratingValue}</span>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>

          </div>

          {/* Key Statistics Grid */}
          {stats.length > 0 && (
            <div className="mt-20 pt-12 border-t border-gray-200">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h3 className="text-xs font-bold text-[#801424] uppercase tracking-widest">{hero.statsEyebrow}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1 font-arizona-flare">
                  {hero.statsHeading}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                {stats.map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className="p-5 rounded-2xl bg-gray-50/80 border border-gray-200/80 text-center hover:bg-white hover:shadow-lg hover:border-red-200 transition-all duration-300"
                  >
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
                      {stat.label}
                    </span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-[#801424] font-arizona-flare">
                      {stat.value}
                    </div>
                    <span className="text-[11px] text-gray-500 mt-1 block">
                      {stat.sub}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* SECTION 2: MALL HISTORY TIMELINE */}
      {!history.hidden && (
      <section id="history" className="py-14 md:py-28 bg-gradient-to-b from-gray-50 via-white to-gray-50 border-b border-gray-200/80 relative overflow-hidden">

        {/* Background decorative elements */}
        <div className="absolute top-1/3 left-0 w-72 h-72 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 text-[#801424] text-xs font-bold tracking-widest uppercase mb-2">
              <FaHistory className="w-3.5 h-3.5" />
              {history.eyebrow}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 font-arizona-flare">
              {history.heading}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
              {history.intro}
            </p>
          </div>

          {/* Timeline Tree */}
          <div className="relative pl-7 md:pl-0">
            {/* Phones: a line down the left with a dot per milestone */}
            {timelineEvents.length > 0 && <div className="md:hidden absolute left-[7px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-[#801424]/15 via-[#801424]/50 to-[#801424]/15" />}
            {/* Center Line */}
            {timelineEvents.length > 0 && (
              <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-0.5 bg-gradient-to-b from-[#801424]/20 via-[#801424] to-[#801424]/20 -translate-x-1/2" />
            )}

            <div className="space-y-8 md:space-y-16">
              {timelineEvents.map((event, index) => {
                const isEven = index % 2 === 0;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`relative flex flex-col md:flex-row items-center ${
                      isEven ? 'md:flex-row-reverse' : ''
                    } gap-0 md:gap-12`}
                  >
                    <div className="md:hidden absolute -left-[27px] top-5 w-3.5 h-3.5 rounded-full bg-[#801424] ring-4 ring-gray-50" />

                    {/* Center Node Dot */}
                    <div className="hidden md:flex absolute left-1/2 top-10 -translate-x-1/2 z-20 items-center justify-center w-8 h-8 rounded-full bg-white border-4 border-[#801424] shadow-md">
                      <div className="w-2 h-2 rounded-full bg-[#801424]" />
                    </div>

                    {/* Timeline Image Card */}
                    <div className="w-full md:w-1/2">
                      <div className="group relative rounded-t-2xl md:rounded-2xl overflow-hidden md:shadow-lg border border-b-0 md:border-b border-gray-200/80 bg-white aspect-[16/9] md:aspect-[16/10]">
                        {event.image && (
                          <img loading="lazy" decoding="async"
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        )}
                        <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {event.category && (
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-[#801424] shadow-xs">
                              {event.category}
                            </span>
                          </div>
                        )}

                        <div className="hidden md:block absolute bottom-4 left-4 right-4 text-white">
                          <span className="text-xs font-semibold text-red-300 uppercase tracking-wider block">
                            {history.milestoneLabel}
                          </span>
                          <h4 className="text-lg font-bold drop-shadow-sm font-arizona-flare">{event.title}</h4>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Content Description Card */}
                    <div className="w-full md:w-1/2">
                      <div className="bg-white p-5 sm:p-8 rounded-b-2xl md:rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">

                        {/* Year Badge */}
                        {event.year && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#801424] text-white text-xs font-extrabold tracking-wider mb-3">
                            <span>{event.year}</span>
                          </div>
                        )}

                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-arizona-flare mb-3">
                          {event.title}
                        </h3>

                        <p className="text-sm text-gray-600 leading-relaxed mb-5">
                          {event.description}
                        </p>

                        {/* Bullet Highlights */}
                        {(event.highlights || []).length > 0 && (
                          <div className="space-y-2 border-t border-gray-100 pt-4">
                            {(event.highlights || []).map((item, hIdx) => (
                              <div key={hIdx} className="flex items-center gap-2.5 text-xs font-medium text-gray-700">
                                <FaCheckCircle className="text-[#801424] flex-shrink-0 w-3.5 h-3.5" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </div>

          </div>

        </div>
      </section>
      )}

      {/* SECTION 3: MEDIA & PRESS MENTIONS */}
      {!media.hidden && (
      <section id="media" className="py-14 md:py-28 bg-white border-b border-gray-200/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-[#801424] text-xs font-bold tracking-widest uppercase mb-2">
                <FaNewspaper className="w-3.5 h-3.5" />
                {media.eyebrow}
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 font-arizona-flare">
                {media.heading}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
                {media.intro}
              </p>
            </div>

            {media.inquiryLabel && media.inquiryHref && (
              <div className="flex-shrink-0">
                <CmsLink
                  href={media.inquiryHref}
                  className="btn-secondary text-xs"
                >
                  <FaEnvelope className="w-3.5 h-3.5" />
                  <span>{media.inquiryLabel}</span>
                </CmsLink>
              </div>
            )}
          </div>

          {/* Press Mentions Grid */}
          <div className="m-rail grid grid-cols-1 md:grid-cols-2 gap-8">
            {mediaMentions.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group p-8 rounded-3xl bg-neutral-50/70 border border-gray-200 hover:border-red-300 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>

                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold text-xs">
                        PTM
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 text-sm block">
                          {item.publisher}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.date}
                        </span>
                      </div>
                    </div>

                    {item.tag && (
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${PRESS_COLORS[item.color] || PRESS_COLORS.blue}`}>
                        {item.tag}
                      </span>
                    )}
                  </div>

                  {/* Headline */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 group-hover:text-[#801424] transition-colors leading-snug font-arizona-flare">
                    "{item.headline}"
                  </h3>

                  {/* Quote Callout */}
                  {item.quote && (
                    <div className="relative pl-4 border-l-2 border-[#801424] my-4">
                      <FaQuoteLeft className="text-[#801424]/20 absolute -top-2 left-2 w-6 h-6 -z-1" />
                      <p className="text-sm text-gray-600 italic leading-relaxed">
                        {item.quote}
                      </p>
                    </div>
                  )}

                </div>

                {/* Footer Link */}
                <div className="pt-6 mt-6 border-t border-gray-200/80 flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium">{media.archiveLabel}</span>
                  {item.url ? (
                    <CmsLink href={item.url} className="text-[#801424] font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      {media.linkLabel} <FaExternalLinkAlt className="w-2.5 h-2.5 ml-1" />
                    </CmsLink>
                  ) : (
                    <span className="text-[#801424] font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      {media.linkLabel} <FaExternalLinkAlt className="w-2.5 h-2.5 ml-1" />
                    </span>
                  )}
                </div>

              </motion.div>
            ))}
          </div>

          {/* Press Kit Callout Banner */}
          {!media.kitHidden && (
            <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-gray-900 via-[#1a1114] to-gray-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-xs font-bold uppercase tracking-widest text-red-400">{media.kitEyebrow}</span>
                <h4 className="text-xl sm:text-2xl font-bold font-arizona-flare">{media.kitHeading}</h4>
                <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
                  {media.kitText}
                </p>
              </div>
              {media.kitButtonLabel && (
                <CmsLink
                  href={media.kitButtonHref}
                  className="btn-primary flex-shrink-0"
                >
                  <FaPhoneAlt className="w-3 h-3" />
                  <span>{media.kitButtonLabel}</span>
                </CmsLink>
              )}
            </div>
          )}

        </div>
      </section>
      )}

      {/* SECTION 4: BOARD MEMBERS & EXECUTIVE LEADERSHIP */}
      {!leadership.hidden && (
      <section id="leadership" className="py-14 md:py-28 bg-neutral-50/70 border-b border-gray-200/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-[#801424] text-xs font-bold tracking-widest uppercase mb-2">
              <FaUsers className="w-3.5 h-3.5" />
              {leadership.eyebrow}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 font-arizona-flare">
              {leadership.heading}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
              {leadership.intro}
            </p>
          </div>

          {/* Leadership Cards Grid */}
          <div className="m-rail m-rail-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadershipTeam.map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white rounded-3xl border border-gray-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                <div>

                  {/* Photo Frame */}
                  <div className="relative aspect-[4/4] bg-gray-100 overflow-hidden">
                    {member.image && (
                      <img loading="lazy" decoding="async"
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {member.role && (
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="inline-block px-2.5 py-1 rounded-md bg-[#801424] text-white text-[10px] font-bold tracking-wider uppercase">
                          {member.role}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#801424] transition-colors font-arizona-flare">
                      {member.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#801424] mt-1 mb-3">
                      {member.subtitle}
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {member.bio}
                    </p>
                  </div>

                </div>

                {/* Badges Footer */}
                {(member.badges || []).length > 0 && (
                  <div className="px-6 pb-6 pt-2">
                    <div className="flex flex-wrap gap-1.5 border-t border-gray-100 pt-3">
                      {(member.badges || []).map((badge, bIdx) => (
                        <span
                          key={bIdx}
                          className="text-[10px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </motion.div>
            ))}
          </div>

          {/* Message from Managing Director */}
          {!leadership.messageHidden && (
            <div className="mt-16 bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -z-1" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-[#801424] uppercase tracking-widest">
                    <FaQuoteLeft className="w-3.5 h-3.5" />
                    {leadership.messageEyebrow}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 font-arizona-flare">
                    "{leadership.messageHeading}"
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed italic">
                    "{leadership.messageText}"
                  </p>
                  <div className="pt-2">
                    <p className="font-bold text-gray-900 text-sm">{leadership.messageAuthor}</p>
                    <p className="text-xs text-gray-500">{leadership.messageAuthorTitle}</p>
                  </div>
                </div>

                <div className="lg:col-span-4 flex justify-center lg:justify-end">
                  <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 text-center w-full max-w-xs">
                    {leadership.logo && (
                      <img loading="lazy" decoding="async"
                        src={leadership.logo}
                        alt="Pokhara Trade Mall Logo"
                        className="w-36 h-auto mx-auto mb-3"
                      />
                    )}
                    <p className="text-xs text-gray-500 font-medium">
                      {leadership.logoCaption}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>
      )}

      {/* SECTION 5: ARCHITECTURAL FEATURES & COMMUNITY IMPACT */}
      {!features.hidden && (
      <section id="features" className="py-14 md:py-28 bg-white border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-[#801424] text-xs font-bold tracking-widest uppercase mb-2">
              <FaAward className="w-3.5 h-3.5" />
              {features.eyebrow}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 font-arizona-flare">
              {features.heading}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
              {features.intro}
            </p>
          </div>

          <div className="m-rail grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mallFeatures.map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="p-8 rounded-3xl bg-neutral-50/80 border border-gray-200 hover:border-red-300 hover:bg-white hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-[#801424] group-hover:bg-[#801424] group-hover:text-white transition-colors duration-300 mb-6 shadow-xs">
                  <CmsIcon name={feat.icon} className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2.5 font-arizona-flare group-hover:text-[#801424] transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Community & Sustainability Showcase */}
          {!features.communityHidden && (
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-gray-900 text-white rounded-3xl p-8 sm:p-12 overflow-hidden relative">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-red-400 flex items-center gap-2">
                  <FaHeart className="text-red-400" />
                  {features.communityEyebrow}
                </span>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-arizona-flare">
                  {features.communityHeading}
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {features.communityText}
                </p>
                {(features.communityChips || []).length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-2 text-xs">
                    {(features.communityChips || []).map((chip, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-lg bg-white/10 text-gray-200">{chip}</span>
                    ))}
                  </div>
                )}
              </div>

              {features.communityImage && (
                <div className="relative rounded-2xl overflow-hidden aspect-[16/10] border border-white/10 shadow-2xl">
                  <img loading="lazy" decoding="async"
                    src={features.communityImage}
                    alt={features.communityImageAlt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                </div>
              )}
            </div>
          )}

        </div>
      </section>
      )}

      {/* SECTION 6: VISITOR FAQ ACCORDION */}
      {!faq.hidden && faqs.length > 0 && (
      <section id="faq" className="py-14 md:py-28 bg-neutral-50/70 border-b border-gray-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 text-[#801424] text-xs font-bold tracking-widest uppercase mb-2">
              <FaLightbulb className="w-3.5 h-3.5" />
              {faq.eyebrow}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 font-arizona-flare">
              {faq.heading}
            </h2>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              {faq.intro}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((item, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen ? 'bg-white border-[#801424]/40 shadow-md' : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-bold text-gray-900 text-sm sm:text-base font-arizona-flare">
                      {item.q}
                    </span>
                    <FaChevronDown
                      className={`w-4 h-4 text-[#801424] flex-shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-6 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4 whitespace-pre-line">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>
      )}

      {/* SECTION 7: INTERACTIVE CALL TO ACTION */}
      {!cta.hidden && (
      <section className="py-14 md:py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-[#801424] via-[#660e1c] to-[#400911] text-white p-8 sm:p-14 md:p-16 shadow-2xl relative overflow-hidden">

            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-6">
              {cta.eyebrow && (
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-widest text-red-100">
                  {cta.eyebrow}
                </span>
              )}

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-arizona-flare leading-tight">
                {cta.heading}
              </h2>

              <p className="text-sm sm:text-base text-red-100 leading-relaxed max-w-2xl">
                {cta.text}
              </p>

              {(cta.buttons || []).length > 0 && (
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  {(cta.buttons || []).map((btn, idx) => (
                    <CmsLink key={idx} href={btn.href} className={btn.style || 'btn-dark'}>
                      <CmsIcon name={btn.icon} className="w-4 h-4" />
                      <span>{btn.label}</span>
                    </CmsLink>
                  ))}
                </div>
              )}

            </div>

          </div>
        </div>
      </section>
      )}

      <Footer />
    </div>
  );
}
