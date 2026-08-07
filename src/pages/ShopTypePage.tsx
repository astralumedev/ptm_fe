import { useParams } from 'react-router-dom'
import NavigationBar from '../app/components/NavigationBar'
import PageHeader from '../app/components/PageHeader'
import BusinessListSection from '../app/components/BusinessListSection'
import Footer from '../app/components/Footer'

export default function ShopTypePage() {
  const { type } = useParams<{ type: string }>()
  
  // Convert URL parameter to valid type
  const typeParam = type || ''
  const shopType = typeParam.toLowerCase() as 'retail' | 'eatery' | 'wellness' | 'service'
  
  // Map URL parameter to display title
  const titleMap = {
    retail: 'Shopping',
    eatery: 'Dining',
    service: 'Services',
    wellness: 'Wellness'
  }

  return (
    <div className="font-montserrat">
      <NavigationBar />
      <PageHeader title={titleMap[shopType] || 'Shops'} />
      <BusinessListSection featured={false} type={shopType} />
      <Footer />
    </div>
  )
} 