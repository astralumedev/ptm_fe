import HeaderSection from '../app/components/HeaderSection'
import Footer from '../app/components/Footer'
import FeaturedStoresSection from '@/app/components/FeaturedStoresSection'
import QFXSection from '@/app/components/QFXSection'
import DineSection from '@/app/components/DineSection'
import OpeningSoonSection from '@/app/components/OpeningSoonSection'

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <HeaderSection />
      <FeaturedStoresSection />
      <DineSection />
      <QFXSection />
      <OpeningSoonSection />
      <Footer />
    </div>
  )
}