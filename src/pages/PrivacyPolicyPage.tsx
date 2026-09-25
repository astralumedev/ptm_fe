import NavigationBar from '../app/components/NavigationBar';
import PageHeader from '../app/components/PageHeader';
import Footer from '../app/components/Footer';
import { useBlock, useBundle } from '../content/block';
import { CmsLink } from '../content/CmsLink';
import { privacyPolicyBlock } from '../content/blocks/pages';

const headingStyle = { fontFamily: "'Arizona Flare', 'Times New Roman', serif" };

/** Styles staff-written policy HTML to match the original hand-built layout. */
const bodyClass = [
  'space-y-3',
  '[&_p]:text-sm sm:[&_p]:text-base [&_p]:leading-relaxed',
  '[&_p.small]:text-xs sm:[&_p.small]:text-sm [&_p.small]:text-gray-600',
  '[&_strong]:text-gray-900 [&_strong]:font-semibold',
  '[&_h3]:text-sm sm:[&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-900 [&_h3]:mb-1 [&_h3]:pt-2',
  '[&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-2 [&_ul]:text-xs sm:[&_ul]:text-sm [&_ul]:text-gray-600 [&_ul]:pl-1',
  '[&_ol]:list-decimal [&_ol]:list-inside [&_ol]:space-y-2 [&_ol]:text-xs sm:[&_ol]:text-sm [&_ol]:text-gray-600 [&_ol]:pl-1',
  '[&_a]:text-[#801424] [&_a]:font-medium hover:[&_a]:underline',
].join(' ');

function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export default function PrivacyPolicyPage() {
  const policy = useBlock(privacyPolicyBlock);
  const settings = useBundle()?.settings?.[0];
  const sections = (policy.sections || []).filter((s) => !s.hidden);
  const email = settings?.email || 'info@pokharatrademall.com';
  const phone = settings?.phone || '+977 61-520000';
  const address = settings?.address || 'Chipledhunga, Pokhara-4, Kaski, Gandaki Province, Nepal';

  return (
    <div className="min-h-screen bg-neutral-50/60 text-gray-900 selection:bg-[#801424] selection:text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <NavigationBar />

      {/* Page Header */}
      <PageHeader
        title={policy.title}
        subtitle={policy.subtitle}
        badge={policy.badge}
        breadcrumbs={[
          { label: policy.title, href: '/page/privacy_policy' }
        ]}
      />

      {/* Policy Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <article className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-6 sm:p-10 md:p-14 shadow-sm space-y-10 text-gray-700 leading-relaxed">

          {/* Metadata Note */}
          <div className="flex flex-wrap items-center justify-between pb-6 border-b border-gray-100 text-xs text-gray-500 gap-2">
            <span>{policy.effectiveLabel} {formatDate(policy.lastUpdated)}</span>
            <span>{policy.company}</span>
          </div>

          {sections.map((section, idx) => (
            <section key={idx} className="space-y-3">
              <h2
                className="text-xl sm:text-2xl font-bold text-gray-900 uppercase tracking-wide"
                style={headingStyle}
              >
                {idx + 1}. {section.heading}
              </h2>
              <div className={bodyClass} dangerouslySetInnerHTML={{ __html: section.body || '' }} />
            </section>
          ))}

          {/* Contact Us */}
          {!policy.contactHidden && (
            <section className="pt-6 border-t border-gray-100 space-y-4">
              <h2
                className="text-xl sm:text-2xl font-bold text-gray-900 uppercase tracking-wide"
                style={headingStyle}
              >
                {sections.length + 1}. {policy.contactHeading}
              </h2>
              <p className="text-sm sm:text-base leading-relaxed">
                {policy.contactIntro}
              </p>

              <div className="bg-neutral-50 rounded-xl p-5 border border-gray-200 text-xs sm:text-sm space-y-2 text-gray-700">
                <p><strong className="text-gray-900">Administration Office:</strong> {policy.company}</p>
                <p><strong className="text-gray-900">Location:</strong> {address}</p>
                <p><strong className="text-gray-900">Email:</strong> <a href={`mailto:${email}`} className="text-[#801424] hover:underline font-medium">{email}</a></p>
                <p><strong className="text-gray-900">Contact:</strong> {phone}</p>
              </div>

              {policy.contactLinkLabel && (
                <div className="pt-2">
                  <CmsLink
                    href={policy.contactLinkHref}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#801424] hover:text-red-900 transition-colors"
                  >
                    <span>{policy.contactLinkLabel}</span>
                  </CmsLink>
                </div>
              )}
            </section>
          )}

        </article>
      </main>

      <Footer />
    </div>
  );
}
