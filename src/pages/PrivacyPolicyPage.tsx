import { Link } from 'react-router-dom';
import NavigationBar from '../app/components/NavigationBar';
import PageHeader from '../app/components/PageHeader';
import Footer from '../app/components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-50/60 text-gray-900 selection:bg-[#801424] selection:text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <NavigationBar />

      {/* Page Header */}
      <PageHeader
        title="Privacy Policy"
        subtitle="Information on how Pokhara Trade Mall collects, protects, and handles your data across our digital platforms and premises."
        badge="Legal & Transparency"
        breadcrumbs={[
          { label: 'Privacy Policy', href: '/page/privacy_policy' }
        ]}
      />

      {/* Policy Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <article className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-6 sm:p-10 md:p-14 shadow-sm space-y-10 text-gray-700 leading-relaxed">
          
          {/* Metadata Note */}
          <div className="flex flex-wrap items-center justify-between pb-6 border-b border-gray-100 text-xs text-gray-500 gap-2">
            <span>Effective Date: January 1, 2026</span>
            <span>Pokhara Trade Mall & Housing Pvt. Ltd.</span>
          </div>

          {/* 1. Overview */}
          <section className="space-y-3">
            <h2
              className="text-xl sm:text-2xl font-bold text-gray-900 uppercase tracking-wide"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              1. Overview & Commitment
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              Pokhara Trade Mall & Housing Pvt. Ltd. (“PTM”, “we”, “our”, or “us”) values your trust and is committed to protecting your personal information. This Privacy Policy outlines our practices regarding data collection, usage, storage, and visitor rights across our official website, customer service desks, and mall premises located at Chipledhunga, Pokhara, Nepal.
            </p>
            <p className="text-sm sm:text-base leading-relaxed">
              We process personal information in compliance with the <strong className="text-gray-900 font-semibold">Individual Privacy Act (2075 / 2018)</strong> of Nepal and applicable international data protection principles.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section className="space-y-4">
            <h2
              className="text-xl sm:text-2xl font-bold text-gray-900 uppercase tracking-wide"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              2. Information We Collect
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              We collect information that you directly provide to us, as well as technical data generated when you interact with our services:
            </p>
            
            <div className="space-y-3 pl-1 sm:pl-2">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                  a. Direct Submissions
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  When you submit inquiry forms for retail leasing, event bookings, lost & found assistance, or general feedback, we collect your name, contact phone number, email address, and message details.
                </p>
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                  b. Guest Wi-Fi & Technical Diagnostics
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  When accessing our complimentary guest Wi-Fi within the mall atrium, temporary network identifier logs (such as device MAC address and connection timestamps) may be recorded for network security and bandwidth balancing.
                </p>
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                  c. Website Analytics & Cookies
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  We use standard technical cookies and anonymized website analytics (such as browser type, operating system, and page view duration) to optimize navigation performance and responsiveness across devices.
                </p>
              </div>
            </div>
          </section>

          {/* 3. How We Use Information */}
          <section className="space-y-3">
            <h2
              className="text-xl sm:text-2xl font-bold text-gray-900 uppercase tracking-wide"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              3. How We Use Your Information
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              Your information is used strictly for legitimate operational purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-gray-600 pl-1">
              <li>Processing leasing, promotional sponsorship, and event venue inquiries.</li>
              <li>Responding to visitor support requests, feedback, and customer desk services.</li>
              <li>Maintaining physical safety, emergency preparedness, and building administration.</li>
              <li>Enhancing website directory accessibility and mobile navigation.</li>
            </ul>
            <p className="text-xs sm:text-sm text-gray-600 italic pt-1">
              * We never sell, rent, or lease personal visitor information to third-party commercial marketing firms.
            </p>
          </section>

          {/* 4. CCTV & Public Space Monitoring */}
          <section className="space-y-3">
            <h2
              className="text-xl sm:text-2xl font-bold text-gray-900 uppercase tracking-wide"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              4. Mall CCTV & Public Space Monitoring
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              To safeguard visitors, staff, and store tenants, Pokhara Trade Mall operates 24/7 CCTV surveillance across all common corridors, escalators, atrium walkways, parking basements, and entry gates.
            </p>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              CCTV recordings are securely stored and routinely overwritten after 30 to 45 days. Access to video logs is strictly limited to authorized security personnel and will only be disclosed to law enforcement authorities in compliance with applicable Nepali law.
            </p>
          </section>

          {/* 5. Data Security & Storage */}
          <section className="space-y-3">
            <h2
              className="text-xl sm:text-2xl font-bold text-gray-900 uppercase tracking-wide"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              5. Data Security & Storage
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              We implement electronic and administrative controls to protect submitted data against unauthorized disclosure or loss. Digital communications over our website are encrypted using industry-standard SSL protocols, and internal databases are protected by restricted role-based permissions.
            </p>
          </section>

          {/* 6. Your Rights & Inquiries */}
          <section className="space-y-3">
            <h2
              className="text-xl sm:text-2xl font-bold text-gray-900 uppercase tracking-wide"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              6. Your Rights & Inquiries
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              You have the right to request access to the personal data we hold about you, request corrections to inaccurate contact details, or ask for the deletion of previously submitted inquiries where retention is not legally required.
            </p>
          </section>

          {/* 7. Contact Us */}
          <section className="pt-6 border-t border-gray-100 space-y-4">
            <h2
              className="text-xl sm:text-2xl font-bold text-gray-900 uppercase tracking-wide"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              7. Contact Us
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              If you have any questions, feedback, or data requests regarding this Privacy Policy, please reach out to our administration office:
            </p>

            <div className="bg-neutral-50 rounded-xl p-5 border border-gray-200 text-xs sm:text-sm space-y-2 text-gray-700">
              <p><strong className="text-gray-900">Administration Office:</strong> Pokhara Trade Mall & Housing Pvt. Ltd.</p>
              <p><strong className="text-gray-900">Location:</strong> Chipledhunga, Pokhara-4, Kaski, Gandaki Province, Nepal</p>
              <p><strong className="text-gray-900">Email:</strong> <a href="mailto:info@pokharatrademall.com" className="text-[#801424] hover:underline font-medium">info@pokharatrademall.com</a></p>
              <p><strong className="text-gray-900">Contact:</strong> +977 61-520000</p>
            </div>

            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#801424] hover:text-red-900 transition-colors"
              >
                <span>Have a specific inquiry? Contact our team &rarr;</span>
              </Link>
            </div>
          </section>

        </article>
      </main>

      <Footer />
    </div>
  );
}
