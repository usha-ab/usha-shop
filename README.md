# Usha Shop — `usha-chest-rig`

Conversion-ready, trilingual (🇸🇪 sv / 🇬🇧 en / 🇪🇸 es) product page for the
**Usha Chest Rig — PU Leather Utility Bag**, deployed at **shop.usha.se**.

Dropshipping store of **Usha AB** (org.nr 559401-8326). Zero recurring cost:
built on the same free/owned stack as `creators-platform`.

## Stack

| Layer      | Choice                                            |
| ---------- | ------------------------------------------------- |
| Framework  | Next.js 15 (App Router) · React 18 · Node 24      |
| i18n       | `next-intl` — sv (default, unprefixed), en, es    |
| Styling    | Tailwind CSS 3.4 with Usha brand tokens           |
| Payments   | Stripe **hosted Checkout** (platform account)     |
| Fulfilment | Webhook **stub** → supplier connected at go-live  |
| Hosting    | Vercel (Hobby) — no monthly cost                  |

## Local dev

```bash
npm install
cp .env.example .env.local   # fill in Stripe TEST keys
npm run dev                  # http://localhost:3000  → /sv/usha-chest-rig
npm run typecheck            # tsc --noEmit
npm run build                # production build
```

## Structure

```
src/
├─ i18n/            routing, request config, locale-aware navigation
├─ messages/        sv.json · en.json · es.json  (all copy lives here)
├─ lib/
│  ├─ product.ts    ← SINGLE SOURCE for price, variants, specs, images
│  └─ stripe.ts     Stripe client
├─ app/
│  ├─ [locale]/
│  │  ├─ page.tsx               → redirects to the product
│  │  ├─ usha-chest-rig/        product page + Product JSON-LD
│  │  ├─ success / cancel       post-checkout pages
│  │  └─ terms|privacy|returns|shipping
│  ├─ api/
│  │  ├─ checkout/route.ts      creates the Stripe Checkout Session
│  │  └─ webhook/route.ts       Stripe → fulfilment (STUB)
│  ├─ sitemap.ts · robots.ts
└─ components/       Header, Footer, ProductHero, Accordion, Reviews, …
```

## Editing the product

Everything commercial lives in **`src/lib/product.ts`** (price, currency,
shipping thresholds, colours, image paths) and **`src/messages/*.json`** (all
visible text). Change once; the page, JSON-LD, and Stripe Checkout follow.

Product photos are **placeholders** (`public/images/*.svg`). Replace with real
1200×1200 shots — see `CHECKLIST.md`.

## Deploy

Connected to Vercel project **`usha-shop`** with GitHub auto-deploys:

- Push to **`main`** → Production deploy
- Any other branch / PR → Preview deploy

Live preview: **https://usha-shop.vercel.app** (not the customer domain; no live
payment keys yet). Manual deploy: `vercel deploy` (preview) / `vercel deploy --prod`.

Env vars live in the Vercel project (Production): `NEXT_PUBLIC_SITE_URL`,
`FULFILLMENT_NOTIFY_EMAIL`. The three Stripe secrets are added at go-live —
see `CHECKLIST.md`.

## What's left before going live

See **`CHECKLIST.md`** — supplier account, payment go-live, real photos, DNS.
