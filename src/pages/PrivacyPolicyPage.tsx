import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaShieldAlt,
  FaLock,
  FaUserShield,
  FaEye,
  FaWifi,
  FaVideo,
  FaCookieBite,
  FaEnvelope,
  FaCheckCircle,
  FaCalendarAlt,
  FaArrowRight,
  FaPrint
} from 'react-icons/fa';
import NavigationBar from '../app/components/NavigationBar';
import PageHeader, { PageHeaderTab } from '../app/components/PageHeader';
import Footer from '../app/components/Footer';

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const tabs: PageHeaderTab[] = [
    { id: 'overview', label: '1. Overview', icon: <FaShieldAlt className="w-3.5 h-3.5" /> },
    { id: 'collection', label: '2. Information We Collect', icon: <FaEye className="w-3.5 h-3.5" /> },
    { id: 'usage', label: '3. How We Use Data', icon: <FaUserShield className="w-3.5 h-3.5" /> },
    { id: 'wifi-cctv', label: '4. Wi-Fi & Mall CCTV', icon: <FaVideo className="w-3.5 h-3.5" /> },
    { id: 'security', label: '5. Security & Retention', icon: <FaLock className="w-3.5 h-3.5" /> },
    { id: 'rights', label: '6. Your Rights', icon: <FaCheckCircle className="w-3.5 h-3.5" /> },
    { id: 'contact', label: '7. Contact Desk', icon: <FaEnvelope className="w-3.5 h-3.5" /> },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveSection(tabId);
    const el = document.getElementById(tabId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Scroll spy to highlight active section in table of contents
  useEffect(() => {
    const handleScroll = () => {
      const sectionIds = ['overview', 'collection', 'usage', 'wifi-cctv', 'security', 'rights', 'contact'];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="font-montserrat min-h-screen bg-neutral-50/50 text-gray-900 selection:bg-[#801424] selection:text-white">
      <NavigationBar />

      {/* Header */}
      <PageHeader
        title="Privacy Policy"
        subtitle="Transparent information on how Pokhara Trade Mall collects, protects, and handles your data across our website, on-site Wi-Fi, and premises."
        badge="Legal & Transparency"
        breadcrumbs={[
          { label: 'Privacy Policy', href: '/page/privacy_policy' }
        ]}
        tabs={tabs}
        onTabChange={handleTabClick}
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        
        {/* Top Summary Banner */}
        <div className="mb-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl">
              <FaShieldAlt />
            </div>
            <h3 className="font-bold text-gray-900 text-sm font-arizona-flare">Zero Data Selling</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              We do not sell, rent, or trade your personal information to third-party advertisers.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl">
              <FaLock />
            </div>
            <h3 className="font-bold text-gray-900 text-sm font-arizona-flare">Encrypted Communications</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              All website forms, queries, and digital channels use 256-bit SSL encryption.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl">
              <FaVideo />
            </div>
            <h3 className="font-bold text-gray-900 text-sm font-arizona-flare">Premises Safety CCTV</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              CCTV footage is retained strictly for visitor security and emergency management.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#801424] flex items-center justify-center text-xl">
              <FaUserShield />
            </div>
            <h3 className="font-bold text-gray-900 text-sm font-arizona-flare">Your Right to Control</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Request access, correction, or deletion of your contact information at any time.
            </p>
          </motion.div>

        </div>

        {/* Layout Grid: Sticky Sidebar + Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Sidebar Table of Contents (Sticky on Desktop) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-28 space-y-6">
            
            <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Contents
                </span>
                <span className="text-[11px] text-gray-400">
                  7 Sections
                </span>
              </div>

              <nav className="space-y-1">
                {[
                  { id: 'overview', label: '1. Overview & Commitment' },
                  { id: 'collection', label: '2. Information We Collect' },
                  { id: 'usage', label: '3. How We Use Information' },
                  { id: 'wifi-cctv', label: '4. Guest Wi-Fi & Mall CCTV' },
                  { id: 'security', label: '5. Security & Data Retention' },
                  { id: 'rights', label: '6. Your Privacy Rights' },
                  { id: 'contact', label: '7. Data Governance Desk' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center justify-between ${
                      activeSection === item.id
                        ? 'bg-[#801424] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {activeSection === item.id && (
                      <FaArrowRight className="w-3 h-3 text-white/80" />
                    )}
                  </button>
                ))}
              </nav>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <span className="flex items-center gap-1.5">
                  <FaCalendarAlt className="text-[#801424]" />
                  Updated: Jan 2026
                </span>
                <button
                  onClick={() => window.print()}
                  className="text-gray-600 hover:text-[#801424] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <FaPrint className="w-3 h-3" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Quick Contact Box */}
            <div className="bg-gradient-to-br from-[#801424] to-[#550b16] text-white p-6 rounded-3xl shadow-lg space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-200">
                Privacy Inquiries
              </span>
              <h4 className="text-base font-bold font-arizona-flare">
                Have questions about your data?
              </h4>
              <p className="text-xs text-red-100/90 leading-relaxed">
                Contact our compliance officers for any questions regarding your personal details.
              </p>
              <a
                href="mailto:privacy@pokharatrademall.com"
                className="btn-white text-xs w-full mt-2"
              >
                <FaEnvelope className="w-3.5 h-3.5" />
                <span>privacy@pokharatrademall.com</span>
              </a>
            </div>

          </div>

          {/* Right Main Policy Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Overview */}
            <section id="overview" className="p-8 sm:p-10 bg-white rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#801424] uppercase tracking-widest">
                <FaShieldAlt />
                <span>Section 1</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-arizona-flare">
                1. Overview & Commitment
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Pokhara Trade Mall & Housing Pvt. Ltd. (“PTM”, “we”, “our”, or “us”) is dedicated to maintaining the trust and confidence of all visitors, shoppers, tenants, and users of our digital platforms.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                This Privacy Policy explains the nature of personal information we collect through our official website (<a href="https://pokharatrademall.com" className="text-[#801424] font-semibold hover:underline">pokharatrademall.com</a>), on-premise guest Wi-Fi network, inquiry forms, and customer service desks at Chipledhunga, Pokhara, Nepal.
              </p>
              <div className="p-4 rounded-2xl bg-neutral-50 border border-gray-200 text-xs text-gray-700 leading-relaxed">
                <strong>Legal Basis:</strong> We handle personal data in accordance with the <em>Individual Privacy Act (2075 / 2018)</em> of Nepal and international best practices regarding digital transparency and consumer security.
              </div>
            </section>

            {/* 2. Information We Collect */}
            <section id="collection" className="p-8 sm:p-10 bg-white rounded-3xl border border-gray-200/80 shadow-sm space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#801424] uppercase tracking-widest">
                <FaEye />
                <span>Section 2</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-arizona-flare">
                2. Information We Collect
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Depending on how you interact with Pokhara Trade Mall, we may collect the following categories of information:
              </p>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-gray-50/80 border border-gray-200 space-y-2">
                  <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <FaEnvelope className="text-[#801424]" />
                    Direct Submissions & Inquiries
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Name, phone number, email address, company details, and message contents submitted through our Contact, Leasing, or Event Inquiry forms.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50/80 border border-gray-200 space-y-2">
                  <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <FaWifi className="text-[#801424]" />
                    Guest Wi-Fi & Device Diagnostics
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    When connecting to our high-speed guest Wi-Fi within the mall atrium, temporary MAC address, connection timestamps, and general signal bandwidth may be logged for load balancing.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50/80 border border-gray-200 space-y-2">
                  <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <FaCookieBite className="text-[#801424]" />
                    Website Analytics & Cookies
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Anonymized IP addresses, browser types, floor directory searches, and page visit duration to continually optimize site speed and mobile navigation.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. How We Use Data */}
            <section id="usage" className="p-8 sm:p-10 bg-white rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#801424] uppercase tracking-widest">
                <FaUserShield />
                <span>Section 3</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-arizona-flare">
                3. How We Use Your Information
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                We use collected data solely for legitimate business purposes, including:
              </p>
              
              <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600">
                {[
                  'Responding to store leasing, kiosk rental, and brand partnership inquiries.',
                  'Facilitating customer support for lost & found, mall directions, and facility assistance.',
                  'Informing subscribers about seasonal festivals, festive sales, live concerts, and cinema premier screenings (only with explicit consent).',
                  'Ensuring physical and digital safety across our premises and systems.',
                  'Improving website performance, interactive floor maps, and wayfinding reliability.'
                ].map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <FaCheckCircle className="text-[#801424] mt-0.5 flex-shrink-0 w-3.5 h-3.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 4. Guest Wi-Fi & CCTV */}
            <section id="wifi-cctv" className="p-8 sm:p-10 bg-white rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#801424] uppercase tracking-widest">
                <FaVideo />
                <span>Section 4</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-arizona-flare">
                4. Mall CCTV & Public Space Monitoring
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                For the personal safety of our 1.2M+ annual shoppers, tenants, and children, Pokhara Trade Mall operates 24/7 CCTV surveillance throughout common areas, corridors, escalators, parking basements, and entry gates.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-neutral-50 border border-gray-200">
                  <span className="text-xs font-bold text-gray-900 block mb-1">Retention Window</span>
                  <p className="text-xs text-gray-500">
                    CCTV video logs are automatically overwritten after 30 to 45 days, unless required for ongoing safety investigations.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-50 border border-gray-200">
                  <span className="text-xs font-bold text-gray-900 block mb-1">Restricted Access</span>
                  <p className="text-xs text-gray-500">
                    Footage is accessible solely to authorized security personnel and law enforcement authorities upon official request.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Security & Retention */}
            <section id="security" className="p-8 sm:p-10 bg-white rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#801424] uppercase tracking-widest">
                <FaLock />
                <span>Section 5</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-arizona-flare">
                5. Security Safeguards & Data Retention
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                We implement physical, electronic, and procedural safeguards to protect your personal details against unauthorized access, loss, or misuse:
              </p>
              
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0">
                    SSL
                  </div>
                  <span><strong>256-Bit SSL Encryption:</strong> All data transmitted over our website is securely encrypted.</span>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold flex-shrink-0">
                    RBAC
                  </div>
                  <span><strong>Role-Based Access Control:</strong> Only designated administration staff can view leasing inquiries.</span>
                </div>
              </div>
            </section>

            {/* 6. Your Rights */}
            <section id="rights" className="p-8 sm:p-10 bg-white rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#801424] uppercase tracking-widest">
                <FaCheckCircle />
                <span>Section 6</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-arizona-flare">
                6. Your Privacy Rights & Choices
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                You possess full rights regarding the personal information you share with us:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-4 rounded-2xl bg-neutral-50 border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-1">Right to Access</h4>
                  <p className="text-gray-500">Request a copy of any personal data we hold about you.</p>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-50 border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-1">Right to Rectify</h4>
                  <p className="text-gray-500">Update or correct incomplete or outdated contact details.</p>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-50 border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-1">Right to Erasure</h4>
                  <p className="text-gray-500">Request complete deletion of your submitted messages or emails.</p>
                </div>
              </div>
            </section>

            {/* 7. Contact Desk */}
            <section id="contact" className="p-8 sm:p-10 bg-gradient-to-br from-gray-900 via-[#1a1114] to-gray-900 text-white rounded-3xl shadow-xl space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest">
                <FaEnvelope />
                <span>Section 7</span>
              </div>
              
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold font-arizona-flare">
                  7. Data Governance & Compliance Desk
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
                  If you have questions, complaints, or would like to exercise any of your data rights, please contact our administrative team:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1">
                  <span className="text-red-300 font-bold block">Email Inquiries</span>
                  <p className="text-white font-medium">privacy@pokharatrademall.com</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1">
                  <span className="text-red-300 font-bold block">Phone Line</span>
                  <p className="text-white font-medium">+977 61-520000 / 9856012345</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-1">
                  <span className="text-red-300 font-bold block">Physical Address</span>
                  <p className="text-white font-medium">Chipledhunga, Pokhara-4, Nepal</p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/contact"
                  className="btn-primary"
                >
                  <FaEnvelope className="w-3.5 h-3.5" />
                  <span>Submit Inquiry</span>
                </Link>
                <Link
                  to="/"
                  className="btn-dark"
                >
                  <span>Return to Home</span>
                </Link>
              </div>
            </section>

          </div>

        </div>

      </div>

      <Footer />
    </div>
  );
}
