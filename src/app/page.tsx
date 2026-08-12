import HeaderSection from './components/HeaderSection';
import Footer from './components/Footer';
import FeaturedStoresSection from './components/FeaturedStoresSection';
import QFXSection from './components/QFXSection';
import DineSection from './components/DineSection';
import OpeningSoonSection from './components/OpeningSoonSection';

export default async function HomePage() {
  return (
    <div className="relative min-h-screen">
      <HeaderSection />
      <FeaturedStoresSection />
      <DineSection />
      <QFXSection />
      <OpeningSoonSection />
      <Footer />
    </div>
  );
}