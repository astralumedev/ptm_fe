export interface Shop {
  id: number;
  name: string;
  slug: string;
  status: 'published' | 'draft';
  tagline?: string;
  description: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  logo?: {
    data?: {
      full_url: string;
    };
  };
  cover_image?: {
    data?: {
      full_url: string;
    };
  };
}

export interface ShopResponse {
  data: Shop[];
  public: boolean;
} 