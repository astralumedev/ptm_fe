# Pokhara Trade Mall website

Public site and content management system for Pokhara Trade Mall. Every word, image, list and setting on the site is edited from the admin panel at **`/admin`**; nothing needs a developer to change.

**Stack:** Vite + React 19 + Tailwind v4, hosted on Vercel. Neon Postgres for content, Vercel Blob for images, Vercel functions for the API.

## How content works

- All content lives in Neon, in one `content` table (`collection`, `slug`, `status`, `data` JSON).
- **Collections** (lists staff add to): `stores`, `blogs`, `events`, `offers`, `pages`, and a single `settings` record (contact details).
- **Blocks** (`collection = 'blocks'`): one record per section of the site, such as the home hero, nav menu, mall timings, About page or mall map labels. They are defined in `src/content/blocks/*.ts`: each definition lists its fields (which the admin turns into a form) and its initial content.
- The public site downloads everything published as one JSON file (`/api/content`), cached at Vercel's edge for 60 s. Pages read from it with `useBlock(def)` and the `api` getters in `src/services/api.tsx`. Changes appear within about a minute of saving.
- Anything time-bound (events, offers, slides, movies, openings) can be hidden or given *show from* / *hide after* dates, evaluated in Nepal time (`src/content/visibility.ts`).
- Store categories are one editable list (`src/content/blocks/categories.ts`). It drives directory filters, the Shop and Dine pages, store counts, the store editor and mall map colours.

## API (7 of the 12 functions allowed on the Hobby plan)

| Function | Purpose |
|---|---|
| `api/content.ts` | Public, edge-cached bundle of all published content |
| `api/forms.ts` | Public contact / RSVP / leasing submissions (validated, rate-limited, honeypot) |
| `api/sitemap.ts` | `/sitemap.xml` and `/robots.txt`, generated from published content |
| `api/auth.ts` | Admin sign in / out, change username and password |
| `api/admin/items.ts` | CRUD for all content, reordering, inbox, full backup download |
| `api/admin/media.ts` | Image library; presigned direct-to-Blob uploads |
| `api/admin/setup.ts` | Creates tables and seeds or tops up content (runs on every admin sign-in; idempotent) |

Shared server code lives in `api/_lib` (not counted as functions).

## Environment variables

Set in Vercel (Project → Settings → Environment Variables):

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Added by the Neon integration |
| `BLOB_STORE_ID`, `BLOB_WEBHOOK_PUBLIC_KEY` | yes | Added when the Blob store is connected |
| `SESSION_SECRET` | recommended | Signs admin sessions. Falls back to a key derived from `DATABASE_URL` |
| `RESEND_API_KEY` | optional | Turns on email alerts for new submissions. Recipients are set in the admin under *Contact & social → Email alerts* |
| `RESEND_FROM` | optional | Sender, e.g. `Pokhara Trade Mall <noreply@yourdomain>` (a domain verified in Resend) |

## Images and free-tier limits

Images are resized in the browser before upload (logos 512 px, covers 1920 px, others 1600 px) and saved as WebP, with a 400 px thumbnail for the admin. Files are named by content hash, so uploading the same photo twice stores it once. The media library is listed from Neon, not from Blob.

## Local development

```bash
npm install
npm run dev
```

The dev server proxies `/api` to production (`https://ptm-fe.vercel.app`), so it shows real content. Set `API_PROXY` to target a preview deployment instead. To run the API locally against the database, use `vercel dev`.

Other scripts: `npm run build` (typecheck and build), `npm run lint`, `npm run typecheck:api`, `npm run seed:blocks`, and `sh scripts/optimize-images.sh` (re-compresses images added to `/public`).

## Adding a new editable section

1. Define it with `defineBlock({...})` in the relevant `src/content/blocks/*.ts` file and add it to that file's exported list.
2. Render it with `const c = useBlock(myBlock)`.
3. Run `npm run seed:blocks` and commit `api/_lib/seed.json`. The next admin sign-in adds the section to the database.

## Deployment

Pushing to `main` deploys to production on Vercel. `vercel deploy` makes a preview; previews share the production database.
