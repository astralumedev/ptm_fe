import { useEffect, useState } from 'react'
import HeaderSection from '../app/components/HeaderSection'
import Footer from '../app/components/Footer'
import BlogList from '../app/components/BlogList'
import api from '../services/api'

export default function BlogListPage() {
  const [page, setPage] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await api.getPages({
          fields: '*,cover_image.data.full_url',
          filter: {
            slug: 'blogs',
            status: 'published'
          }
        })

        if (response.data && response.data.length > 0) {
          setPage(response.data[0])
        }
      } catch (error) {
        console.error('Error fetching page:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#ac0e28] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <HeaderSection />
      <div className="pt-16 md:pt-20">
        {page && (
          <div className="w-full py-8 bg-white">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl font-bold text-center mb-8">{page.title}</h1>
              <div 
                className="prose prose-lg mx-auto mb-12"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </div>
          </div>
        )}
        <BlogList />
        <Footer />
      </div>
    </div>
  )
} 