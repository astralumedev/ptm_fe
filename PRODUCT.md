# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- Public visitors of Pokhara Trade Mall (PTM), Pokhara, Nepal: browse stores, dining, services, events, offers, blogs and the mall map.
- Admin panel (`/admin`): 1–3 non-technical mall marketing staff, mostly on a laptop, sometimes on a phone, updating stores, blogs, events, offers, pages and site settings.

## Product Purpose
The official PTM website plus a custom-built CMS so mall staff can keep content current without a developer.

## Capabilities and Constraints
- Vite + React + Tailwind v4 SPA hosted on Vercel Hobby (free) tier: max 12 serverless functions, Neon Postgres free tier, Vercel Blob free tier. Every read/upload must be frugal (CDN-cached public bundle, client-side WebP compression, hash dedup).
- Admin auth: single username `admin` with a password staff can change.

## Brand Commitments
- Admin panel: neutral tool look, but carries the PTM logo (`public/tm_logo_nobg.png`) so it feels custom-built for them — nothing too much.
- Brand colors: navy `#2e3094`, red `#801424` / logo red.
