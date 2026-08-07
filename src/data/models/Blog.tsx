export interface BlogImage {
  data: {
    full_url: string;
    url: string;
    asset_url: string;
    thumbnails: {
      key: string;
      url: string;
      relative_url: string;
      dimension: string;
      width: number;
      height: number;
    }[];
    embed: null;
  };
}

export interface Blog {
  id: number;
  status: 'published' | 'draft';
  owner: {
    id: number;
    first_name: string;
    last_name: string;
  };
  created_on: string;
  title: string;
  slug: string;
  content: string;
  cover_image: BlogImage;
}

export interface BlogResponse {
  data: Blog[];
  public: boolean;
} 