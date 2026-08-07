import HeaderSection from '../app/components/HeaderSection'
import Footer from '../app/components/Footer'
import AboutUsPreviewWrapper from '@/app/components/AboutUsPreviewWrapper'
import FeaturedStoresSection from '@/app/components/FeaturedStoresSection'
import QFXSection from '@/app/components/QFXSection'
import DineSection from '@/app/components/DineSection'
import OpeningSoonSection from '@/app/components/OpeningSoonSection'

export default function HomePage() {
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
  )
}