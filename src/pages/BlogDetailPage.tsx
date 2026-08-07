import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import NavigationBar from '../app/components/NavigationBar'
import Footer from '../app/components/Footer'
import PageHeader from '../app/components/PageHeader'
import api from '../services/api'
import { Blog } from '../data/models/Blog'

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlog = async () => {
      if (!slug) return
      
      try {
        const response = await api.getBlogs({
          fields: '*,cover_image.data.full_url,owner.*',
          filter: {
            status: 'published',
            slug: slug
          }
        })

        if (response.data && response.data.length > 0) {
          setBlog(response.data[0] as Blog)
        }
      } catch (error) {
        console.error('Error fetching blog:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [slug])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!blog) {
    return <div>Blog not found</div>
  }

  return (
    <div className="font-montserrat">
      <NavigationBar />
      <PageHeader title={blog.title} />

      {/* Cover Image */}
      {blog.cover_image?.data?.full_url && (
        <section className="w-full bg-white relative overflow-hidden">
          <div className="relative h-[50vh] w-[85%] mx-auto rounded-2xl overflow-clip">
            <img
              src={blog.cover_image.data.full_url}
              alt={blog.title}
              className="object-cover w-full h-full"
            />
          </div>
        </section>
      )}

      {/* Blog Content */}
      <section className="w-full px-4 md:px-12 py-20 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <div 
              className="text-gray-700 leading-relaxed text-xl prose-headings:font-bold prose-headings:text-[#760316] prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[#760316] prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
} 