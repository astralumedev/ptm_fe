import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import NavigationBar from '../app/components/NavigationBar'
import PageHeader from '../app/components/PageHeader'
import Footer from '../app/components/Footer'
import GallerySection from '../app/components/GallerySection'
import api from '../services/api'
import { useBlock } from '../content/block'
import { CmsLink } from '../content/CmsLink'
import { contentPageBlock } from '../content/blocks/pages'

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
  const texts = useBlock(contentPageBlock)

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return
      setLoading(true)
      setPage(null)
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

  if (loading || !page) {
    return (
      <div className="font-montserrat min-h-screen flex flex-col bg-neutral-50/50">
        <NavigationBar />
        <section className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-24 flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4 text-sm text-gray-500" role="status">
              <div className="w-8 h-8 border-3 border-[#801424] border-t-transparent rounded-full animate-spin" />
              <span>{texts.loadingText}</span>
            </div>
          ) : (
            <div className="max-w-lg text-center space-y-4">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-arizona-flare">{texts.notFoundTitle}</h1>
              {texts.notFoundText && <p className="text-sm text-gray-600 leading-relaxed">{texts.notFoundText}</p>}
              {texts.backLabel && (
                <CmsLink href={texts.backHref || '/'} className="btn-primary inline-flex">
                  <span>{texts.backLabel}</span>
                </CmsLink>
              )}
            </div>
          )}
        </section>
        <Footer />
      </div>
    )
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
            <img loading="lazy" decoding="async"
              src={page.cover_image.data.full_url}
              alt={page.title}
              className="object-cover w-full h-full"
            />
          </div>
        </section>
      )}
      
      <section className="w-full px-4 sm:px-6 lg:px-8 py-6 md:py-16 bg-neutral-50/50">
        <div className="container mx-auto max-w-5xl bg-white p-5 sm:p-12 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-sm">
          <div className="cms-prose" dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>
      </section>

      <Footer />
    </div>
  )
} 