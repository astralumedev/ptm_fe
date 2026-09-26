export interface PageData {
  id: number;
  status: 'published' | 'draft';
  owner: { id: number };
  created_on: string;
  title: string;
  slug: string;
  content: string;
  cover_image: {
    data: {
      full_url: string;
      url: string;
      asset_url: string;
      thumbnails: any[];
      embed: null;
    };
  };
  gallery: any[];
}

