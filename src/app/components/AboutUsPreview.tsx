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
    <div className="w-full py-6 md:py-8 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-stretch gap-6 lg:gap-8">
          {/* Text Content */}
          <div className="w-full md:w-1/2 bg-mall-accent p-6 md:p-8 rounded-xl flex flex-col justify-center shadow-xs">
            <h2
              className="text-2xl md:text-3xl text-mall-brown mb-3 md:mb-4 tracking-wider font-semibold uppercase"
              style={{ fontFamily: "'Arizona Flare', 'Times New Roman', serif" }}
            >
              {page.title}
            </h2>
            <div
              className="prose text-gray-700 text-sm md:text-base leading-relaxed tracking-wide [&_p]:mb-3 [&_p:last-child]:mb-0 font-normal"
              dangerouslySetInnerHTML={{ __html: page.content }}
              style={{ fontFamily: "'Montserrat', 'Poppins', sans-serif" }}
            />
          </div>

          {/* Cover Image matching text section height */}
          <div className="w-full md:w-1/2 relative min-h-[240px] md:min-h-0 rounded-xl overflow-hidden shadow-md">
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
 