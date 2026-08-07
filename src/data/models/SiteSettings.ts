export interface SiteSettings {
  id: number;
  created_on: string;
  modified_by: number;
  modified_on: string;
  location_info: string;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  twitter: string | null;
  phone: string;
  address: string;
  email: string;
}

export interface SiteSettingsResponse {
  data: SiteSettings[];
  public: boolean;
} 