import { IconType } from 'react-icons/lib';
import { MdOutlineContactMail, MdOutlineVisibility, MdBusinessCenter, MdOutlinePeople } from 'react-icons/md';

export interface NavItem {
  name: string;
  icon: IconType;
  page: string;
  outlink: boolean;
}

export const navItems: NavItem[] = [
  { name: 'Happenings', icon: MdBusinessCenter, page: '/blogs', outlink: false },
  { name: 'Shopping', icon: MdOutlineVisibility, page: '/shops/retail', outlink: false },
  { name: 'Dining', icon: MdOutlinePeople, page: '/shops/eatery', outlink: false },
  { name: '31 Park Hotel', icon: MdOutlineContactMail, page: '/shops/details/31_park_hotel', outlink: false },
  { name: 'About Us', icon: MdOutlineContactMail, page: '/page/about_us', outlink: false },
]; 