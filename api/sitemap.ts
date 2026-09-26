import { sql } from './_lib/db';
import { route } from './_lib/http';

const STATIC_PATHS = ['/', '/shop', '/shops/directory', '/dine', '/entertain', '/services', '/latest', '/mall-map', '/about', '/contact', '/privacy-policy'];
// Page slugs whose addresses are served by dedicated routes (see src/app/layout.tsx).
const ROUTED_PAGES = new Set(['about_us', 'privacy_policy', 'homepage_intro']);

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * /sitemap.xml and /robots.txt (via rewrites in vercel.json), generated from published content
 * so new stores and posts are discoverable without anyone touching a file.
 */
export default route(async (req, res) => {
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '');
  const origin = `https://${host}`;
  res.setHeader('CDN-Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');

  if (req.query.type === 'robots') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`);
  }

  const rows = (await sql()`SELECT collection, slug, updated_at FROM content
    WHERE status = 'published' AND collection IN ('stores', 'blogs', 'pages')`) as { collection: string; slug: string; updated_at: string }[];

  const urls: { loc: string; lastmod?: string }[] = STATIC_PATHS.map((p) => ({ loc: origin + p }));
  for (const r of rows) {
    const lastmod = new Date(r.updated_at).toISOString().slice(0, 10);
    if (r.collection === 'stores') urls.push({ loc: `${origin}/stores/${r.slug}`, lastmod });
    if (r.collection === 'blogs') urls.push({ loc: `${origin}/blogs/${r.slug}`, lastmod });
    if (r.collection === 'pages' && !ROUTED_PAGES.has(r.slug)) urls.push({ loc: `${origin}/page/${r.slug}`, lastmod });
  }

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
    .join('\n')}\n</urlset>\n`);
});
