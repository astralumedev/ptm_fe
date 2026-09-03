import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBuilding,
  FaHistory,
  FaNewspaper,
  FaUsers,
  FaAward,
  FaShieldAlt,
  FaParking,
  FaFilm,
  FaStore,
  FaArrowRight,
  FaChevronDown,
  FaExternalLinkAlt,
  FaQuoteLeft,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaLightbulb,
  FaCheckCircle,
  FaHandshake,
  FaLeaf,
  FaCompass,
  FaHeart
} from 'react-icons/fa';
import NavigationBar from '../app/components/NavigationBar';
import PageHeader, { PageHeaderTab } from '../app/components/PageHeader';
import Footer from '../app/components/Footer';

// Timeline Data with researched historical facts
const timelineEvents = [
  {
    year: '2012 – 2013',
    title: 'The Entrepreneurial Vision',
    category: 'Foundation',
    image: '/mall_images/IMG_1366.webp',
    description:
      'A coalition of over 60 small and medium local retail entrepreneurs in Pokhara united under Pokhara Trade Mall & Housing Pvt. Ltd. The vision was to overcome rental instability in the commercial center and create a permanent, world-class business hub for Gandaki Province.',
    highlights: ['60+ Founding Entrepreneur Shareholders', 'Conceptualized by Local Business Leaders', 'Strategic Location in Chipledhunga Hub'],
  },
  {
    year: 'Early 2014',
    title: 'Groundbreaking & Seismic Construction',
    category: 'Engineering',
    image: '/mall_images/IMG_1364.webp',
    description:
      'Construction commenced by renowned builder CE Construction with an initial investment exceeding NPR 1 Billion (100 Crore+). The complex was built with advanced seismic structural engineering capable of withstanding up to 8.5–9.0 magnitude earthquakes, featuring multi-level underground basements, elevators, and escalators.',
    highlights: ['NPR 1B+ Capital Investment', 'Seismic Resilience (8.5–9.0 Magnitude)', 'Modern Escalators & Capsule Elevators'],
  },
  {
    year: 'April 2015',
    title: 'Tested by Nature: The Earthquake Proof',
    category: 'Resilience',
    image: '/mall_images/IMG_1365.webp',
    description:
      'When the devastating 7.8 magnitude Nepal Earthquake struck in April 2015, Pokhara Trade Mall sustained zero structural damage, validating the superior engineering and strict building safety standards adopted from day one.',
    highlights: ['Zero Structural Damage', 'Validated Safety Standards', 'Safe Haven in Gandaki Province'],
  },
  {
    year: 'October 15, 2015 (2072 BS)',
    title: 'Grand Official Inauguration',
    category: 'Milestone',
    image: '/mall_images/ptm_hero.webp',
    description:
      'Pokhara Trade Mall was officially inaugurated in a grand ceremony by Rabindra Adhikary (Chairman of Parliament\'s Development Committee), alongside Chairman Bindu Kumar Thapa and Managing Director Minraj Kafle. The mall opened over 500 shutters, bringing fashion, tech, and dining under one roof.',
    highlights: ['Inaugurated by National Leaders', 'Over 500 Retail & Commercial Spaces', 'Gandaki\'s Largest Shopping Complex'],
  },
  {
    year: '2018 – 2020',
    title: 'Entertainment Expansion & COVID-19 Tenant Relief',
    category: 'Community & Growth',
    image: '/mall_images/IMG_1361.webp',
    description:
      'Upgraded with state-of-the-art multi-screen Cineplex (QFX Cinemas) and an expansive 4th-floor food court. During the 2020 pandemic crisis, the leadership made national headlines by granting a historic 50% rent waiver across all 500+ shutters to support local small businesses.',
    highlights: ['QFX Multiplex Laser Projection', 'Historic 50% COVID-19 Rent Relief', 'Revamped Multi-Cuisine Food Court'],
  },
  {
    year: '2023 – Present',
    title: 'Modern Retail Hub & Digital Evolution',
    category: 'Modern Era',
    image: '/mall_images/IMG_1360.webp',
    description:
      'Under the executive management of Managing Director Saugat Thapa, Pokhara Trade Mall has evolved into a full-scale omni-lifestyle center—welcoming global retail brands, abroad education consultancies, digital interactive wayfinding, and cultural festival celebrations.',
    highlights: ['Digital Interactive Floor Directories', 'Abroad Study & Financial Hubs', '10,000+ Daily Footfall'],
  },
];

// Media Mentions Data
const mediaMentions = [
  {
    publisher: 'The Kathmandu Post',
    logoText: 'The Kathmandu Post',
    date: 'October 2015',
    headline: 'Pokhara Trade Mall opens for business: 500+ commercial spaces built with Rs 1B investment',
    quote:
      'Constructed by small and medium retail entrepreneurs coming together, Pokhara Trade Mall marks a monumental leap in Gandaki’s modern retail infrastructure.',
    tag: 'National Press',
    color: 'border-blue-500/30 bg-blue-50/40 text-blue-900',
  },
  {
    publisher: 'New Business Age',
    logoText: 'New Business Age',
    date: 'Commercial Feature',
    headline: 'Pokhara’s Mega Commercial Destination Comes Into Operation at Chipledhunga',
    quote:
      'Equipped with earthquake-resistant technology, state-of-the-art lifts, and over 500 shutters, the mall eliminates rental insecurity for Pokhara’s traders.',
    tag: 'Business & Economy',
    color: 'border-amber-500/30 bg-amber-50/40 text-amber-900',
  },
  {
    publisher: 'Ratopati & Gandaki Khabar',
    logoText: 'Ratopati News',
    date: 'Community Spotlight',
    headline: 'Pokhara Trade Mall Leadership Announces 50% Rent Relief to Protect Retail Tenants',
    quote:
      'In a remarkable display of business solidarity, the executive management granted substantial rent concessions to ensure small businesses thrived amidst market challenges.',
    tag: 'Leadership & Community',
    color: 'border-emerald-500/30 bg-emerald-50/40 text-emerald-900',
  },
  {
    publisher: 'Pokhara City Tourism & Lifestyle Journal',
    logoText: 'Tourism Pokhara',
    date: 'Travel & Lifestyle',
    headline: 'The Heartbeat of Chipledhunga: Why PTM is the Go-To Spot for Tourists & Locals Alike',
    quote:
      'From authentic Thakali delicacies to cutting-edge 4K cinema and vibrant apparel boutiques, Pokhara Trade Mall encapsulates the modern soul of the city.',
    tag: 'Lifestyle & Tourism',
    color: 'border-purple-500/30 bg-purple-50/40 text-purple-900',
  },
];

// Board & Leadership Members
const leadershipTeam = [
  {
    name: 'Bindu Kumar Thapa',
    role: 'Founder & Senior Advisor',
    subtitle: 'Former Chairman, Pokhara Trade Mall & Housing',
    image: '/square_silhouette_1.jpeg',
    bio: 'A visionary industrialist, respected entrepreneur, and former Minister in Gandaki Province. He championed the collective investment model that brought over 60 local entrepreneurs together to build Pokhara Trade Mall.',
    badges: ['Founding Chairman', 'Gandaki Business Pioneer'],
  },
  {
    name: 'Saugat Thapa',
    role: 'Managing Director (MD)',
    subtitle: 'Executive Leadership & Strategic Operations',
    image: '/square_silhouette_2.jpeg',
    bio: 'Directing the modernization, brand onboarding, digital wayfinding, and visitor experience initiatives at Pokhara Trade Mall. Dedicated to elevating PTM into Nepal’s benchmark lifestyle shopping center.',
    badges: ['Managing Director', 'Modernization Lead'],
  },
  {
    name: 'Minraj Kafle',
    role: 'Co-Founder & Executive Director',
    subtitle: 'Commercial Operations & Tenant Relations',
    image: '/square_silhouette_1.jpeg',
    bio: 'A cornerstone of the mall’s inception and continuous operations, guiding retail relationships, lease structures, and commercial growth across all 6 levels since 2014.',
    badges: ['Co-Founder', 'Operations Director'],
  },
  {
    name: 'Board of Directors & Shareholders',
    role: 'Shareholders & Governance Committee',
    subtitle: '60+ Local Entrepreneur Partners',
    image: '/square_silhouette_2.jpeg',
    bio: 'Representing the dynamic collective of Pokhara’s business community whose shared ownership and collaborative governance make Pokhara Trade Mall a true people-powered institution.',
    badges: ['Community Owned', 'Governing Council'],
  },
];

// Architectural & Amenity Highlights
const mallFeatures = [
  {
    icon: FaShieldAlt,
    title: 'Earthquake-Resistant Engineering',
    desc: 'Constructed by CE Construction with reinforced concrete foundations engineered to withstand seismic tremors up to 9.0 magnitude.',
  },
  {
    icon: FaCompass,
    title: 'Vertical Mobility & Accessibility',
    desc: 'Equipped with continuous dual-way escalators, high-speed passenger capsule elevators, and step-free wheelchair ramps across all levels.',
  },
  {
    icon: FaParking,
    title: 'Multi-Level Secure Parking',
    desc: 'Spacious dedicated basement and surface parking with CCTV surveillance for 200+ two-wheelers and four-wheelers.',
  },
  {
    icon: FaFilm,
    title: 'QFX Multiplex Cinema',
    desc: 'Premium multi-hall movie theater with 4K laser projection, Dolby Atmos 3D audio, and luxury recliner seating.',
  },
  {
    icon: FaStore,
    title: '500+ Retail & Service Outlets',
    desc: 'A comprehensive ecosystem of national and international fashion boutiques, electronics, cosmetics, jewelry, and local crafts.',
  },
  {
    icon: FaBuilding,
    title: 'Banking & Education Hub',
    desc: 'Home to leading national commercial banks, 24/7 ATMs, foreign exchange services, and premier study abroad consultancies.',
  },
];

// FAQs Data
const faqs = [
  {
    q: 'What are the operating hours of Pokhara Trade Mall?',
    a: 'The retail shops and service outlets operate daily from 10:00 AM to 8:00 PM (open until 10:00 PM on weekends and festival seasons). The QFX Cinemas and select 4th-floor dining outlets operate from 7:00 AM to 12:00 AM midnight.',
  },
  {
    q: 'Where is Pokhara Trade Mall located?',
    a: 'Pokhara Trade Mall is located centrally on Chipledhunga Road in the commercial downtown core of Pokhara (Ward 4 / 9), just minutes from Mahendrapul and a short 10-minute drive from Lakeside, Pokhara.',
  },
  {
    q: 'How many stores and services are housed in the mall?',
    a: 'The mall houses over 500 commercial spaces spread across 6 floors, including apparel, footwear, tech gadgets, fine jewelry, beauty salons, banks, abroad study consultancies, game zones, and food courts.',
  },
  {
    q: 'How can businesses or brands apply for commercial leasing?',
    a: 'Prospective tenants and pop-up stall operators can contact our Management & Leasing Office via our Contact page or call our dedicated administration line at +977 61-520000 / +977 9856012345.',
  },
  {
    q: 'Are parking facilities available on-site?',
    a: 'Yes, Pokhara Trade Mall features a secure multi-level underground parking basement with dedicated attendants and 24/7 CCTV surveillance for both motorbikes and cars.',
  },
];

export default function AboutPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const tabs: PageHeaderTab[] = [
    { id: 'overview', label: 'Overview', icon: <FaBuilding className="w-3.5 h-3.5" /> },
    { id: 'history', label: 'History & Timeline', icon: <FaHistory className="w-3.5 h-3.5" /> },
    { id: 'media', label: 'Press & Media', icon: <FaNewspaper className="w-3.5 h-3.5" /> },
    { id: 'leadership', label: 'Board & Leadership', icon: <FaUsers className="w-3.5 h-3.5" /> },
    { id: 'features', label: 'Features & Impact', icon: <FaAward className="w-3.5 h-3.5" /> },
    { id: 'faq', label: 'Visitor FAQ', icon: <FaLightbulb className="w-3.5 h-3.5" /> },
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
        title="About Pokhara Trade Mall"
        subtitle="Discover the story, resilience, vision, and people behind Gandaki Province’s most iconic shopping, dining, and cultural destination."
        badge="Our Heritage & Vision"
        breadcrumbs={[
          { label: 'About Us', href: '/page/about_us' }
        ]}
        tabs={tabs}
        onTabChange={handleTabClick}
      />

      {/* SECTION 1: MALL INFORMATION & HERO OVERVIEW */}
      <section id="overview" className="relative py-16 md:py-24 bg-white border-b border-gray-100 overflow-hidden">
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200/70 text-[#801424] text-xs font-bold tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-[#801424] animate-ping" />
                The Heart of Pokhara's Commerce
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-tight font-arizona-flare">
                A Landmark Born from <span className="text-[#801424]">Collective Vision</span> & Passion
              </h2>

              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                Standing tall at the historic intersection of <strong className="text-gray-900">Chipledhunga</strong>, 
                <strong className="text-gray-900"> Pokhara Trade Mall (PTM)</strong> is Gandaki Province’s largest and most vibrant commercial landmark. 
                Built through a groundbreaking group investment of over 60 local retail entrepreneurs, the mall was created to offer a permanent, secure, and world-class retail sanctuary in the heart of the city.
              </p>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Across 6 expansive levels, PTM houses over <span className="font-semibold text-gray-900">500 retail boutiques</span>, 
                authorized tech centers, a state-of-the-art <span className="font-semibold text-gray-900">QFX Multiplex</span>, 
                an international and traditional food court, premier banking institutions, and foreign education consultancies. 
                Whether you are a Pokhareli local catching up with friends or a global traveler exploring the Annapurna gateway, PTM is your complete lifestyle hub.
              </p>

              {/* Core Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-[#801424]/10 flex items-center justify-center text-[#801424] mb-3">
                    <FaHandshake className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Community First</h4>
                  <p className="text-xs text-gray-500 leading-normal">
                    Empowering local traders and providing sustained entrepreneurship opportunities.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-[#801424]/10 flex items-center justify-center text-[#801424] mb-3">
                    <FaShieldAlt className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Safety & Rigor</h4>
                  <p className="text-xs text-gray-500 leading-normal">
                    Seismic resilience, 24/7 CCTV surveillance, and modern fire safety systems.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-all duration-300">
                  <div className="w-10 h-10 rounded-lg bg-[#801424]/10 flex items-center justify-center text-[#801424] mb-3">
                    <FaLeaf className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Modern Culture</h4>
                  <p className="text-xs text-gray-500 leading-normal">
                    Blending authentic Pokhareli hospitality with international retail excellence.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  to="/shops/directory"
                  className="btn-primary"
                >
                  <span>Explore 500+ Stores</span>
                  <FaArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/mall-map"
                  className="btn-secondary"
                >
                  <FaCompass className="w-4 h-4 text-[#801424]" />
                  <span>Interactive Mall Map</span>
                </Link>
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
                  <img
                    src="/mall_images/ptm_hero.webp"
                    alt="Pokhara Trade Mall Exterior"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-[#801424] text-[10px] font-bold tracking-wider uppercase mb-2">
                      Iconic Architecture
                    </span>
                    <h3 className="text-xl font-bold font-arizona-flare">Pokhara Trade Mall</h3>
                    <p className="text-xs text-gray-200 mt-1 flex items-center gap-1.5">
                      <FaMapMarkerAlt className="text-red-400" />
                      Chipledhunga, Pokhara-4, Gandaki Province
                    </p>
                  </div>
                </div>

                {/* Floating Inset Badge 1 */}
                <div className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8 bg-white p-4 sm:p-5 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 max-w-xs animate-bounce-slow">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-[#801424] font-bold text-xl flex-shrink-0">
                    10+
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Years of Excellence</h5>
                    <p className="text-[11px] text-gray-500">Trusted by over 1.2 Million visitors every year.</p>
                  </div>
                </div>

                {/* Floating Inset Badge 2 */}
                <div className="absolute -top-6 -right-4 sm:-top-6 sm:-right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <FaCheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Seismic Rating</span>
                    <span className="text-xs font-extrabold text-gray-900">9.0 Resilient</span>
                  </div>
                </div>

              </div>
            </motion.div>

          </div>

          {/* Key Statistics Grid */}
          <div className="mt-20 pt-12 border-t border-gray-200">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h3 className="text-xs font-bold text-[#801424] uppercase tracking-widest">Mall By The Numbers</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1 font-arizona-flare">
                Scaling Retail & Entertainment in Gandaki
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              {[
                { label: 'Investment', val: 'NPR 1B+', sub: 'Total Capital Investment' },
                { label: 'Retail Outlets', val: '500+', sub: 'Shops & Showrooms' },
                { label: 'Floors', val: '6 Levels', sub: 'Commerce & Leisure' },
                { label: 'Annual Visitors', val: '1.2M+', sub: 'Locals & Tourists' },
                { label: 'Parking Bays', val: '200+', sub: 'Basement & Surface' },
                { label: 'Seismic Safety', val: '100%', sub: 'Earthquake Tested' },
              ].map((stat, idx) => (
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
                    {stat.val}
                  </div>
                  <span className="text-[11px] text-gray-500 mt-1 block">
                    {stat.sub}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: MALL HISTORY TIMELINE */}
      <section id="history" className="py-20 md:py-28 bg-gradient-to-b from-gray-50 via-white to-gray-50 border-b border-gray-200/80 relative overflow-hidden">
        
        {/* Background decorative elements */}
        <div className="absolute top-1/3 left-0 w-72 h-72 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200/80 text-[#801424] text-xs font-bold tracking-widest uppercase mb-3">
              <FaHistory className="w-3.5 h-3.5" />
              Historical Milestones
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 font-arizona-flare">
              The Journey of Pokhara Trade Mall
            </h2>
            <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
              From an ambitious collaborative initiative of local merchants to Gandaki's premier modern shopping epicenter.
            </p>
          </div>

          {/* Timeline Tree */}
          <div className="relative">
            {/* Center Line */}
            <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-0.5 bg-gradient-to-b from-[#801424]/20 via-[#801424] to-[#801424]/20 -translate-x-1/2" />

            <div className="space-y-12 md:space-y-16">
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
                    } gap-8 md:gap-12`}
                  >
                    
                    {/* Center Node Dot */}
                    <div className="hidden md:flex absolute left-1/2 top-10 -translate-x-1/2 z-20 items-center justify-center w-8 h-8 rounded-full bg-white border-4 border-[#801424] shadow-md">
                      <div className="w-2 h-2 rounded-full bg-[#801424]" />
                    </div>

                    {/* Timeline Image Card */}
                    <div className="w-full md:w-1/2">
                      <div className="group relative rounded-2xl overflow-hidden shadow-lg border border-gray-200/80 bg-white aspect-[16/10]">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-[#801424] shadow-xs">
                            {event.category}
                          </span>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <span className="text-xs font-semibold text-red-300 uppercase tracking-wider block">
                            Milestone
                          </span>
                          <h4 className="text-lg font-bold drop-shadow-sm font-arizona-flare">{event.title}</h4>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Content Description Card */}
                    <div className="w-full md:w-1/2">
                      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
                        
                        {/* Year Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#801424] text-white text-xs font-extrabold tracking-wider mb-3">
                          <span>{event.year}</span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-arizona-flare mb-3">
                          {event.title}
                        </h3>

                        <p className="text-sm text-gray-600 leading-relaxed mb-5">
                          {event.description}
                        </p>

                        {/* Bullet Highlights */}
                        <div className="space-y-2 border-t border-gray-100 pt-4">
                          {event.highlights.map((item, hIdx) => (
                            <div key={hIdx} className="flex items-center gap-2.5 text-xs font-medium text-gray-700">
                              <FaCheckCircle className="text-[#801424] flex-shrink-0 w-3.5 h-3.5" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>

                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </div>

          </div>

        </div>
      </section>

      {/* SECTION 3: MEDIA & PRESS MENTIONS */}
      <section id="media" className="py-20 md:py-28 bg-white border-b border-gray-200/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200/80 text-[#801424] text-xs font-bold tracking-widest uppercase mb-3">
                <FaNewspaper className="w-3.5 h-3.5" />
                Press & Publications
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 font-arizona-flare">
                In The Headlines
              </h2>
              <p className="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">
                Documenting Pokhara Trade Mall's role as Gandaki Province's commercial engine and community partner.
              </p>
            </div>

            <div className="flex-shrink-0">
              <a
                href="mailto:media@pokharatrademall.com"
                className="btn-secondary text-xs"
              >
                <FaEnvelope className="w-3.5 h-3.5" />
                <span>Media & Editorial Inquiries</span>
              </a>
            </div>
          </div>

          {/* Press Mentions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mediaMentions.map((media, idx) => (
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
                          {media.publisher}
                        </span>
                        <span className="text-xs text-gray-500">
                          {media.date}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${media.color}`}>
                      {media.tag}
                    </span>
                  </div>

                  {/* Headline */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 group-hover:text-[#801424] transition-colors leading-snug font-arizona-flare">
                    "{media.headline}"
                  </h3>

                  {/* Quote Callout */}
                  <div className="relative pl-4 border-l-2 border-[#801424] my-4">
                    <FaQuoteLeft className="text-[#801424]/20 absolute -top-2 left-2 w-6 h-6 -z-1" />
                    <p className="text-sm text-gray-600 italic leading-relaxed">
                      {media.quote}
                    </p>
                  </div>

                </div>

                {/* Footer Link */}
                <div className="pt-6 mt-6 border-t border-gray-200/80 flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium">Verified Media Archive</span>
                  <span className="text-[#801424] font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Press Coverage <FaExternalLinkAlt className="w-2.5 h-2.5 ml-1" />
                  </span>
                </div>

              </motion.div>
            ))}
          </div>

          {/* Press Kit Callout Banner */}
          <div className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-gray-900 via-[#1a1114] to-gray-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-red-400">Media Resources</span>
              <h4 className="text-xl sm:text-2xl font-bold font-arizona-flare">Official Press & Photography Assets</h4>
              <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
                Journalists and media representatives can request high-resolution brand logos, photography, and official spokesperson statements.
              </p>
            </div>
            <Link
              to="/contact"
              className="btn-primary flex-shrink-0"
            >
              <FaPhoneAlt className="w-3 h-3" />
              <span>Contact PR Desk</span>
            </Link>
          </div>

        </div>
      </section>

      {/* SECTION 4: BOARD MEMBERS & EXECUTIVE LEADERSHIP */}
      <section id="leadership" className="py-20 md:py-28 bg-neutral-50/70 border-b border-gray-200/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200/80 text-[#801424] text-xs font-bold tracking-widest uppercase mb-3">
              <FaUsers className="w-3.5 h-3.5" />
              Leadership & Governance
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 font-arizona-flare">
              The Board & Executive Team
            </h2>
            <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
              Guided by experienced business pioneers and progressive leadership dedicated to Pokhara’s economic prosperity.
            </p>
          </div>

          {/* Leadership Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-[#801424] text-white text-[10px] font-bold tracking-wider uppercase">
                        {member.role}
                      </span>
                    </div>
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
                <div className="px-6 pb-6 pt-2">
                  <div className="flex flex-wrap gap-1.5 border-t border-gray-100 pt-3">
                    {member.badges.map((badge, bIdx) => (
                      <span
                        key={bIdx}
                        className="text-[10px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

              </motion.div>
            ))}
          </div>

          {/* Message from Managing Director */}
          <div className="mt-16 bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -z-1" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#801424] uppercase tracking-widest">
                  <FaQuoteLeft className="w-3.5 h-3.5" />
                  Executive Message
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 font-arizona-flare">
                  "Redefining Retail & Leisure for the Next Generation"
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed italic">
                  "Pokhara Trade Mall was founded on the belief that collective unity creates enduring strength. 
                  As we look to the future, our focus remains firmly on providing exceptional customer experiences, 
                  embracing digital innovation, and standing as the most welcoming landmark in Pokhara."
                </p>
                <div className="pt-2">
                  <p className="font-bold text-gray-900 text-sm">Saugat Thapa</p>
                  <p className="text-xs text-gray-500">Managing Director, Pokhara Trade Mall</p>
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-center lg:justify-end">
                <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 text-center w-full max-w-xs">
                  <img
                    src="/tm_logo_nobg.png"
                    alt="Pokhara Trade Mall Logo"
                    className="w-36 h-auto mx-auto mb-3"
                  />
                  <p className="text-xs text-gray-500 font-medium">
                    Pokhara's Premier Mall since 2015
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 5: ARCHITECTURAL FEATURES & COMMUNITY IMPACT */}
      <section id="features" className="py-20 md:py-28 bg-white border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200/80 text-[#801424] text-xs font-bold tracking-widest uppercase mb-3">
              <FaAward className="w-3.5 h-3.5" />
              Infrastructure & Amenities
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 font-arizona-flare">
              Built for Safety, Comfort & Convenience
            </h2>
            <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
              Every square meter of Pokhara Trade Mall is designed to meet international standards of public safety, accessibility, and modern aesthetics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mallFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="p-8 rounded-3xl bg-neutral-50/80 border border-gray-200 hover:border-red-300 hover:bg-white hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-[#801424] group-hover:bg-[#801424] group-hover:text-white transition-colors duration-300 mb-6 shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2.5 font-arizona-flare group-hover:text-[#801424] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {feat.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Community & Sustainability Showcase */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-gray-900 text-white rounded-3xl p-8 sm:p-12 overflow-hidden relative">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-red-400 flex items-center gap-2">
                <FaHeart className="text-red-400" />
                Community & Culture
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-arizona-flare">
                Celebrating Gandaki's Heritage & Youth
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Beyond shopping, Pokhara Trade Mall is an active civic center hosting festive celebrations for Dashain, Tihar, Holi, and English New Year, as well as talent showcases, educational seminars, and youth cultural showcases.
              </p>
              <div className="flex flex-wrap gap-3 pt-2 text-xs">
                <span className="px-3 py-1.5 rounded-lg bg-white/10 text-gray-200">✨ Dashain-Tihar Mahotsav</span>
                <span className="px-3 py-1.5 rounded-lg bg-white/10 text-gray-200">🎨 Local Art Exhibitions</span>
                <span className="px-3 py-1.5 rounded-lg bg-white/10 text-gray-200">🌱 Energy Efficient Lighting</span>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] border border-white/10 shadow-2xl">
              <img
                src="/mall_images/IMG_1368.webp"
                alt="Community Gathering Pokhara Trade Mall"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 6: VISITOR FAQ ACCORDION */}
      <section id="faq" className="py-20 md:py-28 bg-neutral-50/70 border-b border-gray-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200/80 text-[#801424] text-xs font-bold tracking-widest uppercase mb-3">
              <FaLightbulb className="w-3.5 h-3.5" />
              Frequently Asked Questions
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 font-arizona-flare">
              Visitor Information & Guide
            </h2>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              Find answers to common questions about visiting, parking, shopping, and leasing at Pokhara Trade Mall.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
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
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-bold text-gray-900 text-sm sm:text-base font-arizona-flare">
                      {faq.q}
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
                        <div className="px-6 pb-6 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                          {faq.a}
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

      {/* SECTION 7: INTERACTIVE CALL TO ACTION */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-[#801424] via-[#660e1c] to-[#400911] text-white p-8 sm:p-14 md:p-16 shadow-2xl relative overflow-hidden">
            
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-6">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-widest text-red-100">
                Experience Pokhara Trade Mall
              </span>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-arizona-flare leading-tight">
                Plan Your Visit or Join Our Retail Community
              </h2>

              <p className="text-sm sm:text-base text-red-100 leading-relaxed max-w-2xl">
                Whether you’re planning a family movie outing, shopping for the latest trends, or looking to lease commercial space in Pokhara’s busiest mall, we are here to welcome you.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  to="/shops/directory"
                  className="btn-white"
                >
                  <FaStore className="w-4 h-4" />
                  <span>Browse Directory</span>
                </Link>

                <Link
                  to="/contact"
                  className="btn-dark"
                >
                  <FaEnvelope className="w-4 h-4" />
                  <span>Leasing & Inquiries</span>
                </Link>

                <Link
                  to="/mall-map"
                  className="btn-dark"
                >
                  <FaCompass className="w-4 h-4" />
                  <span>View Floor Map</span>
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
