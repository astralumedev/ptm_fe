import HeaderSection from './components/HeaderSection';
import Footer from './components/Footer';
import AboutUsPreviewWrapper from './components/AboutUsPreviewWrapper';
import FeaturedStoresSection from './components/FeaturedStoresSection';
import QFXSection from './components/QFXSection';
import DineSection from './components/DineSection';
import OpeningSoonSection from './components/OpeningSoonSection';

export default async function HomePage() {
  return (
    <div className="relative min-h-screen">
      <HeaderSection />
      <div className="pt-16 md:pt-20">
        <AboutUsPreviewWrapper />
        <FeaturedStoresSection />
        <QFXSection />
        <DineSection />
        <OpeningSoonSection />
        <Footer />
      </div>
    </div>
  );
}