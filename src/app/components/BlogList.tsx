'use client';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Blog } from '@/data/models/Blog';
import api from '@/services/api';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.8,
      ease: 'easeOut',
    },
  }),
};

const BlogList = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await api.getBlogs({
          fields: '*,cover_image.data.full_url,owner.*',
          filter: {
            status: 'published'
          },
          sort: ['-created_on']
        });
        setBlogs(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError('Failed to load blogs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ac0e28]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        <div className="space-y-12">
          {blogs.map((blog, index) => (
            <motion.div
              key={blog.id}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className={`flex flex-col ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              } gap-8 items-center`}
            >
              <div className="w-full md:w-1/2">
                <Link to={`/blogs/${blog.slug}`} className="block group">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
                    <img
                      src={blog.cover_image?.data?.full_url || '/placeholder.jpg'}
                      alt={blog.title}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </Link>
              </div>
              <div className="w-full md:w-1/2">
                <div className="space-y-4">
                  <Link to={`/blogs/${blog.slug}`} className="block group">
                    <h3 className="text-2xl font-bold text-gray-800 group-hover:text-[#ac0e28] transition-colors duration-300">
                      {blog.title}
                    </h3>
                  </Link>
                  <div className="text-sm text-gray-500 mb-3">
                    By {blog.owner?.first_name} {blog.owner?.last_name} • {new Date(blog.created_on).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-gray-600 mb-4 line-clamp-3">
                    {blog.content.replace(/<[^>]*>/g, '')}
                  </div>
                  <Link 
                    to={`/blogs/${blog.slug}`}
                    className="inline-flex items-center gap-2 text-[#ac0e28] group-hover:text-[#8f0b20] transition-colors duration-300"
                  >
                    Read More
                    <svg
                      className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogList; 