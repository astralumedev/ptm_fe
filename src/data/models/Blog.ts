export interface BlogImage {
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
}

export interface BlogOwner {
  id: number;
  status: string;
  role: number;
  first_name: string;
  last_name: string;
  email: string;
  external_id: string | null;
  theme: string;
  timezone: string;
  locale: string;
  avatar: string | null;
  company: string | null;
  title: string | null;
}

export interface Blog {
  id: number;
  status: string;
  owner: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    status: string;
    role: number;
    external_id: string | null;
    theme: string;
    timezone: string;
    locale: string;
    avatar: string | null;
    company: string | null;
    title: string | null;
  };
  created_on: string;
  updated_on: string | null;
  title: string;
  slug: string;
  content: string;
  cover_image: {
    data: BlogImage;
  };
}

export interface BlogResponse {
  data: Blog[];
  public: boolean;
} 