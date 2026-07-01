# Go-live checklist — Usha Shop

The page is built and deployable. These are the **manual steps only you can do**
(accounts, keys, domains, photos). Grouped by what blocks a real sale.

## 1. Stripe (payments) — required for any order

- [ ] In the **platform Stripe account** (same as usha.se), confirm the payment
      methods are enabled for the shop's currencies: **Card, Klarna, Apple Pay,
      Google Pay** (SEK + EUR). **Swish** is SEK-only and currently paused by
      Stripe for new businesses — see the `swish-blocked` note; leave off until
      Stripe re-opens it.
- [ ] Create env vars in Vercel (use `printf`, never `echo` — trailing newline
      breaks keys):
      ```
      printf "%s" "sk_live_…"  | vercel env add STRIPE_SECRET_KEY production
      printf "%s" "pk_live_…"  | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
      printf "%s" "https://shop.usha.se" | vercel env add NEXT_PUBLIC_SITE_URL production
      ```
- [ ] Add a **webhook endpoint** in Stripe → `https://shop.usha.se/api/webhook`,
      event `checkout.session.completed`. Copy its signing secret:
      ```
      printf "%s" "whsec_…" | vercel env add STRIPE_WEBHOOK_SECRET production
      ```
- [ ] Test end-to-end with a real card in **test mode** first (test keys), then
      flip to live keys.

## 2. Fulfilment (dropshipping) — required to actually ship

Currently a **stub**: `src/app/api/webhook/route.ts → forwardToSupplier()` only
logs paid orders. Nothing ships automatically yet.

- [ ] Create the supplier account (CJdropshipping **or** AliExpress + DSers) and
      import the exact chest-rig listing.
- [ ] Confirm the real **specs** against that listing and update
      `src/messages/*.json` (size/weight are marked *approx.* / *[verify]*).
- [ ] Wire `forwardToSupplier()` to the supplier's order API (or DSers), or —
      as an interim — connect `FULFILLMENT_NOTIFY_EMAIL` to an email service so
      you fulfil manually. Until then, orders are in the Vercel function logs.

## 3. Product photos — replace placeholders

- [ ] Drop real 1200×1200 images into `public/images/`, replacing the `.svg`
      placeholders, then point `src/lib/product.ts` at them (`chest-rig-brown`,
      `-olive`, `-black`, `-detail`, `-worn`, `-dustbag`).
- [ ] Replace `public/images/og-cover.svg` with a real **1200×630 JPG/PNG** for
      social sharing (SVG OG images are ignored by most platforms).

## 4. Domain & deploy

- [ ] `vercel link` this repo to a **new Vercel project** `usha-shop`.
- [ ] Add domain **shop.usha.se** in Vercel and create the DNS record (CNAME →
      `cname.vercel-dns.com`) at the usha.se registrar.
- [ ] Verify `hreflang` / sitemap at `https://shop.usha.se/sitemap.xml`.

## 5. Legal review (light)

- [ ] Skim the auto-generated **Terms / Privacy / Returns / Shipping** pages
      (`src/messages/*.json → legal.*`) and adjust to match actual delivery
      times, return address, and data processors. They're solid defaults for an
      EU-warehouse distance sale (14-day ångerrätt) but not lawyer-reviewed.

## Compliance guardrails already enforced in code

- Material is labelled **"PU / vegan leather"**, never "genuine leather"
  (Swedish marketing law).
- The product is positioned as a **streetwear utility chest bag** — never a
  holster / concealed-carry item (payment & ad policy risk).
- API responses are `no-store`; security headers + a strict CSP are set in
  `next.config.js`.
