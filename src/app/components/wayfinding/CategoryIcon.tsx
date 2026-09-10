import React from 'react';

interface CategoryIconProps {
  category: string;
  size?: number;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  size = 20,
  color = '#ffffff',
}) => {
  const cat = category.toLowerCase().replace(/_/g, '-');

  // Dining & Restaurants
  if (['restaurant', 'restaurants', 'thakali', 'fast-food'].includes(cat)) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
        <path d="M15 2v18" />
        <path d="M6 2v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V2" />
        <path d="M8 11v9" />
      </svg>
    );
  }

  // Cafes & Coffee
  if (['cafe', 'cafes'].includes(cat)) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
        <line x1="6" y1="2" x2="6" y2="4" />
        <line x1="10" y1="2" x2="10" y2="4" />
        <line x1="14" y1="2" x2="14" y2="4" />
      </svg>
    );
  }

  // Fashion & Apparel & Retail
  if (
    [
      'womens-fashion',
      'mens-fashion',
      'kids',
      'lingerie',
      'footwear-bags',
      'shop',
      'handicrafts',
    ].includes(cat)
  ) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    );
  }

  // Tech, Electronics, Mobiles
  if (['electronics', 'mobile-phones-gadgets', 'it-tech'].includes(cat)) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
        <path d="M12 18h.01" />
      </svg>
    );
  }

  // Jewelry, Watches, Accessories
  if (['jewelry-watches', 'accessories'].includes(cat)) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 3h12l4 6-10 13L2 9Z" />
        <path d="M11 3 8 9l4 13 4-13-3-6" />
        <path d="M2 9h20" />
      </svg>
    );
  }

  // Beauty, Spa, Wellness, Cosmetics
  if (
    [
      'beauty-fragrance',
      'beauty',
      'cosmetic-shops',
      'perfumes',
      'beauty-wellness',
      'spa',
      'saloon',
    ].includes(cat)
  ) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" />
        <path d="M19 17v4" />
        <path d="M3 5h4" />
        <path d="M17 19h4" />
      </svg>
    );
  }

  // Cinema & Entertainment
  if (['cinema', 'entertainment'].includes(cat)) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="20" x="2" y="2" rx="2.18" ry="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="2" y1="7" x2="7" y2="7" />
        <line x1="2" y1="17" x2="7" y2="17" />
        <line x1="17" y1="17" x2="22" y2="17" />
        <line x1="17" y1="7" x2="22" y2="7" />
      </svg>
    );
  }

  // Gaming & VR
  if (['gaming'].includes(cat)) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="6" y1="12" x2="10" y2="12" />
        <line x1="8" y1="10" x2="8" y2="14" />
        <line x1="15" y1="13" x2="15.01" y2="13" />
        <line x1="18" y1="11" x2="18.01" y2="11" />
        <rect width="20" height="12" x="2" y="6" rx="6" />
      </svg>
    );
  }

  // Banking & Finance
  if (['finance'].includes(cat)) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="3" y1="21" x2="21" y2="21" />
        <line x1="6" y1="18" x2="6" y2="11" />
        <line x1="10" y1="18" x2="10" y2="11" />
        <line x1="14" y1="18" x2="14" y2="11" />
        <line x1="18" y1="18" x2="18" y2="11" />
        <polygon points="12 2 20 7 4 7" />
      </svg>
    );
  }

  // Education & Study
  if (['education'].includes(cat)) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 4 3 6 3s6-1 6-3v-5" />
      </svg>
    );
  }

  // Fitness & Gym
  if (['health-fitness'].includes(cat)) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6.5 6.5 11 11" />
        <path d="m21 21-1-1" />
        <path d="m3 3 1 1" />
        <path d="m18 22 4-4" />
        <path d="m2 6 4-4" />
        <path d="m3 10 7-7" />
        <path d="m14 21 7-7" />
      </svg>
    );
  }

  // Restrooms / Toilets
  if (['restroom', 'toilet', 'washroom', 'wc'].includes(cat)) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Male figure */}
        <circle cx="7" cy="4" r="2" fill={color} />
        <path d="M7 6.5v8M5 9h4M5 14.5v5.5M9 14.5v5.5" />
        {/* Female figure */}
        <circle cx="17" cy="4" r="2" fill={color} />
        <path d="M17 6.5l-2.5 8h5L17 6.5z" />
        <path d="M15.5 14.5v5.5M18.5 14.5v5.5" />
        {/* Center separator line */}
        <line x1="12" y1="3" x2="12" y2="21" strokeDasharray="2 2" strokeOpacity="0.4" />
      </svg>
    );
  }

  // Elevators & Lifts
  if (['elevator', 'lift'].includes(cat)) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Elevator cabin outer box */}
        <rect width="18" height="20" x="3" y="2" rx="3" />
        {/* Center door split line */}
        <line x1="12" y1="2" x2="12" y2="22" strokeOpacity="0.4" />
        {/* Up arrow */}
        <path d="M7.5 13l2-2.5 2 2.5" />
        <line x1="9.5" y1="10.5" x2="9.5" y2="16" />
        {/* Down arrow */}
        <path d="M14.5 11l2 2.5 2-2.5" />
        <line x1="16.5" y1="13.5" x2="16.5" y2="8" />
      </svg>
    );
  }

  // Stairs / Escalators
  if (['stairs', 'staircase', 'escalator'].includes(cat)) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Architectural Staircase steps */}
        <path d="M3 21h5v-4.5h5V12h5V7.5h3" />
        {/* Directional arrow up */}
        <path d="M17 3.5l4 4-4 4" />
        <path d="M21 7.5H13" strokeOpacity="0.6" strokeDasharray="2 2" />
      </svg>
    );
  }

  // Janitor / Cleaning / Maintenance / Service
  if (['janitor', 'service', 'cleaning', 'electrical', 'utility'].includes(cat)) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Cleaning mop & spray bottle / tools */}
        <path d="M3 21l8-8" />
        <path d="M9 11l4 4" />
        <path d="M12 8l4-4 4 4-4 4" />
        <circle cx="17" cy="7" r="1" fill={color} />
        <path d="M3 21h4l-2-2z" fill={color} fillOpacity="0.3" />
      </svg>
    );
  }

  // Default Home / Office / Service
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
};
