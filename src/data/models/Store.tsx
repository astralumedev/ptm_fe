export interface StoreImage {
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

export interface StoreCategory {
  store_category_id: {
    category_name: string;
    parent: {
      category_name: string;
    };
  };
}

export interface StoreGalleryItem {
  directus_files_id: {
    id: number;
    storage: string;
    private_hash: string;
    filename_disk: string;
    filename_download: string;
    title: string;
    type: string;
    uploaded_by: number;
    uploaded_on: string;
    charset: string;
    filesize: number;
    width: number | null;
    height: number | null;
    duration: number;
    embed: null;
    folder: null;
    description: string;
    location: string;
    tags: string[];
    checksum: string;
    metadata: null;
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
      }[] | null;
      embed: null;
    };
  };
}

export interface Store {
  id: number;
  status: 'published' | 'draft';
  owner: {
    id: number;
  };
  created_on: string;
  name: string;
  logo: StoreImage;
  cover: StoreImage;
  store_description: string;
  slug: string;
  featured: boolean;
  type: 'retail' | 'eatery' | 'service' | 'hotel';
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  store_gallery: StoreGalleryItem[];
  contact_number: string | null;
  operation_hours: string | null;
  subtitle: string | null;
}

export interface StoreResponse {
  data: Store[];
  public: boolean;
} 