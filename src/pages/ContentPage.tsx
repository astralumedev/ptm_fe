import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import NavigationBar from '../app/components/NavigationBar'
import PageHeader from '../app/components/PageHeader'
import Footer from '../app/components/Footer'
import GallerySection from '../app/components/GallerySection'
import api from '../services/api'

interface Page {
  id: number;
  status: 'published' | 'draft';
  owner: {
    id: number;
  };
  created_on: string;
  title: string;
  slug: string;
  content: string;
  cover_image: {
    data: {
      full_url: string;
    };
  };
  gallery: Array<{
    directus_files_id: {
      data: {
        full_url: string;
      };
    };
  }>;
}

export default function ContentPage() {
  const { slug } = useParams<{ slug: string }>()
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return
      
      try {
        const response = await api.getPages({
          fields: '*,cover_image.data.full_url,gallery.directus_files_id.data.full_url',
          filter: {
            slug: slug,
            status: 'published'
          }
        })

        if (response.data && response.data.length > 0) {
          setPage(response.data[0] as Page)
        }
      } catch (error) {
        console.error('Error fetching page:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [slug])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!page) {
    return <div>Page not found</div>
  }

  return (
    <div className="font-montserrat">
      <NavigationBar />
      <PageHeader title={page.title} />

      {/* Gallery Section */}
      {page.gallery && page.gallery.length > 0 && (
        <GallerySection gallery={page.gallery} />
      )}

      {/* Cover Image Section (if no gallery) */}
      {(!page.gallery || page.gallery.length === 0) && page.cover_image?.data?.full_url && (
        <section className="w-full bg-white relative overflow-hidden">
          <div className="relative h-[50vh] w-[85%] mx-auto rounded-2xl overflow-clip">
            <img
              src={page.cover_image.data.full_url}
              alt={page.title}
              className="object-cover w-full h-full"
            />
          </div>
        </section>
      )}
      
      <section className="w-full px-4 sm:px-6 lg:px-8 py-16 bg-neutral-50/50">
        <div className="container mx-auto max-w-5xl bg-white p-8 sm:p-12 rounded-3xl border border-gray-200/80 shadow-sm">
          <div className="prose prose-lg max-w-none">
            <div 
              className="text-gray-700 leading-relaxed prose-headings:font-bold prose-headings:font-arizona-flare prose-headings:text-gray-900 prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-[#801424] prose-a:font-semibold hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
} 