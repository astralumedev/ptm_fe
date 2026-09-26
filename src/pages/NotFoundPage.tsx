import NavigationBar from '../app/components/NavigationBar';
import Footer from '../app/components/Footer';
import { useBlock } from '../content/block';
import { notFoundBlock } from '../content/blocks/seo';
import { CmsLink } from '../content/CmsLink';
import { usePageMeta } from '../content/seo';

export default function NotFoundPage() {
  const c = useBlock(notFoundBlock);
  usePageMeta({ title: c.title });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavigationBar />
      <main className="flex-1 flex items-center justify-center px-6 pt-36 pb-24">
        <div className="max-w-xl text-center">
          <p className="text-[#801424] font-bold tracking-[0.3em] text-sm mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>404</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 uppercase tracking-wide mb-4 font-arizona-flare">{c.title}</h1>
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-0.5 bg-[#801424] rounded-full" />
            <div className="w-2 h-2 rotate-45 bg-[#801424] rounded-xs" />
            <div className="w-8 h-0.5 bg-[#801424] rounded-full" />
          </div>
          {c.message && <p className="text-gray-600 leading-relaxed mb-8" style={{ fontFamily: "'Montserrat', sans-serif" }}>{c.message}</p>}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {c.primaryLabel && <CmsLink href={c.primaryLink || '/'} className="btn-primary"><span>{c.primaryLabel}</span></CmsLink>}
            {c.secondaryLabel && <CmsLink href={c.secondaryLink} className="btn-dark"><span>{c.secondaryLabel}</span></CmsLink>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
