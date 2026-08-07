'use client';

interface AboutUsPreviewProps {
  page: {
    title: string;
    slug: string;
    content: string;
    cover_image: {
      data: {
        full_url: string;
      };
    };
  };
}

function AboutUsPreview({ page }: AboutUsPreviewProps) {
  const imageUrl = page?.cover_image?.data?.full_url || '/mall_images/ptm_hero.webp';

  return (
    <div className="w-full py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-stretch gap-8 lg:gap-12">
          {/* Text Content */}
          <div className="w-full md:w-1/2 bg-mall-accent p-8 md:p-10 lg:p-12 rounded-xl flex flex-col justify-center shadow-xs">
            <h2
              className="text-3xl md:text-4xl text-mall-brown mb-6 tracking-wider font-semibold"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              {page.title.toUpperCase()}
            </h2>
            <div
              className="prose prose-lg text-gray-700 text-base md:text-lg leading-relaxed md:leading-loose tracking-wide [&_p]:mb-5 [&_p:last-child]:mb-0 font-normal"
              dangerouslySetInnerHTML={{ __html: page.content }}
              style={{ fontFamily: "'Montserrat', 'Poppins', sans-serif" }}
            />
          </div>

          {/* Cover Image matching text section height */}
          <div className="w-full md:w-1/2 relative min-h-[340px] md:min-h-0 rounded-xl overflow-hidden shadow-lg">
            <img
              src={imageUrl}
              alt={page.title}
              className="absolute inset-0 object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUsPreview; 