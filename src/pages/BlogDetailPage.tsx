import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaUser, FaTag, FaShareAlt } from 'react-icons/fa';
import NavigationBar from '../app/components/NavigationBar';
import Footer from '../app/components/Footer';
import PageHeader from '../app/components/PageHeader';
import api from '../services/api';
import { Blog } from '../data/models/Blog';

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!slug) return;
      
      try {
        const response = await api.getBlogs({
          fields: '*,cover_image.data.full_url,owner.*',
          filter: {
            status: 'published',
            slug: slug
          }
        });

        if (response.data && response.data.length > 0) {
          setBlog(response.data[0] as Blog);
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-montserrat flex flex-col justify-between">
        <NavigationBar />
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-10 h-10 border-4 border-[#801424] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-500">Loading article...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white font-montserrat flex flex-col justify-between">
        <NavigationBar />
        <div className="max-w-md mx-auto my-32 p-8 bg-white border border-gray-200 rounded-3xl text-center space-y-4 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 font-arizona-flare">Article Not Found</h2>
          <p className="text-xs text-gray-500">
            The article or story you are looking for is unavailable or has been moved.
          </p>
          <div className="pt-2">
            <Link to="/latest#blogs" className="btn-primary text-xs">
              Back to Latest Stories
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="font-montserrat min-h-screen bg-neutral-50/50 text-gray-900">
      <NavigationBar />

      <PageHeader
        title={blog.title}
        subtitle="Editorial features, events, lifestyle news, and shopping guides from Pokhara Trade Mall."
        badge="Editorial Article"
        breadcrumbs={[
          { label: 'Latest & Stories', href: '/latest#blogs' },
          { label: blog.title }
        ]}
      />

      <section className="w-full px-4 sm:px-6 lg:px-8 py-14">
        <div className="max-w-4xl mx-auto">
          
          {/* Back Button */}
          <div className="mb-8 flex items-center justify-between">
            <Link
              to="/latest#blogs"
              className="btn-link"
            >
              <FaArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Stories</span>
            </Link>

            <span className="text-xs font-semibold text-gray-400">
              Pokhara Trade Mall Editorial
            </span>
          </div>

          {/* Article Header Card */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-12 shadow-sm space-y-8">
            
            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 pb-4 border-b border-gray-100">
              <span className="inline-flex items-center gap-1.5 text-[#801424] font-bold">
                <FaTag className="w-3 h-3" />
                <span>Featured Story</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                <span>{new Date(blog.created_on || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FaUser className="w-3 h-3 text-gray-400" />
                <span>PTM Editorial Desk</span>
              </span>
            </div>

            {/* Featured Image */}
            {blog.cover_image?.data?.full_url && (
              <div className="rounded-2xl overflow-hidden aspect-[16/9] shadow-md border border-gray-100 bg-gray-100">
                <img
                  src={blog.cover_image.data.full_url}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Blog Content */}
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed prose-headings:font-bold prose-headings:text-gray-900 prose-headings:font-arizona-flare prose-a:text-[#801424] prose-a:font-semibold hover:prose-a:underline">
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>

            {/* Article Footer */}
            <div className="pt-8 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Share:</span>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: blog.title, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  <FaShareAlt className="w-3 h-3" />
                  <span>Share Story</span>
                </button>
              </div>

              <Link
                to="/latest"
                className="btn-primary text-xs"
              >
                <span>Browse What's On</span>
              </Link>
            </div>

          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}