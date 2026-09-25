import { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

/**
 * Renders a link typed into the CMS: internal paths ("/dine", "/latest#events") use the router,
 * anything else (https://, tel:, mailto:) is a normal anchor; external sites open in a new tab.
 */
export function CmsLink({ href, children, ...rest }: { href?: string; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const to = (href || '').trim();
  if (!to) return <span className={rest.className}>{children}</span>;
  if (to.startsWith('/')) return <Link to={to} {...rest}>{children}</Link>;
  const external = /^https?:\/\//.test(to);
  return (
    <a href={to} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
      {children}
    </a>
  );
}
