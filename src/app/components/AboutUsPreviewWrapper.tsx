import { useEffect, useState } from 'react';
import api from '@/services/api';
import AboutUsPreview from './AboutUsPreview';

interface Page {
  title: string;
  slug: string;
  content: string;
  cover_image: {
    data: {
      full_url: string;
    };
  };
}

export default function AboutUsPreviewWrapper() {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await api.getPages({
          fields: '*,cover_image.data.full_url',
          filter: {
            slug: 'homepage_intro',
            status: 'published'
          }
        });

        if (response.data && response.data.length > 0) {
          setPage(response.data[0]);
        } else {
          setError('Page not found');
        }
      } catch (error) {
        console.error('Error fetching page:', error);
        setError('Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-8 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-mall-primary rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="w-full py-8 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 text-lg">{error || 'Page not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return <AboutUsPreview page={page} />;
} 