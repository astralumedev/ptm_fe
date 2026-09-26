import type { Schedulable } from '@/content/visibility';

export interface MallEvent extends Schedulable {
  id: string;
  title: string;
  category: string;
  date: string;
  dateBadge: {
    month: string;
    day: string;
  };
  time: string;
  location: string;
  description: string;
  fullDescription?: string;
  imageUrl: string;
  tag: string;
  featured?: boolean;
  ticketInfo?: string;
}

export interface MallOffer extends Schedulable {
  id: string;
  storeName: string;
  storeCategory: string;
  storeLogo?: string;
  title: string;
  discount: string;
  discountType: 'percentage' | 'bogo' | 'voucher' | 'combo';
  promoCode?: string;
  description: string;
  validUntil: string;
  terms: string;
  imageUrl: string;
  storeLink: string;
  featured?: boolean;
  badge?: string;
}
