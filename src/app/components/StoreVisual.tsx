import { useState } from 'react';
import { useCategories } from '@/content/blocks/categories';
import { CmsIcon } from '@/content/icons';
import { hexRgb } from '@/lib/color';

interface StoreVisualProps {
  src?: string | null;
  alt: string;
  /** Store category code (or alias); picks the icon and tint used when there is no photo. */
  category?: string | null;
  /** cover: wide photo area; logo: small square mark. */
  variant?: 'cover' | 'logo';
  className?: string;
  imgClassName?: string;
  /** Logos on dark surfaces (the mall map) use a darker tile. */
  tone?: 'light' | 'dark';
  eager?: boolean;
}

/**
 * A store's photo or logo. When none was uploaded (or it fails to load), shows the store
 * category's icon on a tint of the category colour, so a card never looks broken or empty.
 */
export function StoreVisual({ src, alt, category, variant = 'cover', className = '', imgClassName = '', tone = 'light', eager }: StoreVisualProps) {
  const [failed, setFailed] = useState(false);
  const cats = useCategories();
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        loading={eager ? undefined : 'lazy'}
        decoding="async"
        onError={() => setFailed(true)}
        className={`${className} ${imgClassName}`}
      />
    );
  }
  const cat = cats.find(category);
  const [r, g, b] = hexRgb(cat?.color || '#801424');
  const rgb = `${r} ${g} ${b}`;
  const dark = tone === 'dark';
  const style = {
    color: dark ? `rgb(${Math.min(255, r + 90)} ${Math.min(255, g + 90)} ${Math.min(255, b + 90)})` : `rgb(${Math.round(r * 0.72)} ${Math.round(g * 0.72)} ${Math.round(b * 0.72)})`,
    background: variant === 'cover'
      ? `radial-gradient(120% 90% at 85% 10%, rgb(${rgb} / ${dark ? 0.32 : 0.22}), transparent 60%), radial-gradient(90% 80% at 0% 100%, rgb(${rgb} / ${dark ? 0.22 : 0.12}), transparent 65%), ${dark ? '#12152c' : `rgb(${rgb} / 0.06)`}`
      : dark ? `rgb(${rgb} / 0.2)` : `rgb(${rgb} / 0.1)`,
  };

  if (variant === 'logo') {
    return (
      <span role="img" aria-label={alt} className={`${className} grid place-items-center`} style={style}>
        <CmsIcon name={cat?.icon} className="w-[46%] h-[46%]" />
      </span>
    );
  }
  return (
    <span role="img" aria-label={alt} className={`${className} relative grid place-items-center overflow-hidden`} style={style}>
      {/* Oversized, cropped icon as a quiet watermark; the small one is the readable mark. */}
      <CmsIcon name={cat?.icon} className="absolute -right-[6%] -bottom-[14%] w-[52%] h-[80%] opacity-[0.09]" />
      <span className="relative grid place-items-center w-14 h-14 rounded-2xl shadow-[0_6px_18px_-8px_rgb(0_0_0/0.35)]" style={{ background: dark ? `rgb(${rgb} / 0.28)` : '#fff' }}>
        <CmsIcon name={cat?.icon} className="w-6 h-6" />
      </span>
    </span>
  );
}
