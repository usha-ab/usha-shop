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

## 2. Fulfilment — CJdropshipping (chosen supplier)

The webhook (`src/app/api/webhook/route.ts` → `forwardToSupplier()`) already has
a **real CJ integration** (`src/lib/cj.ts`). It activates once the env vars +
per-colour variant ids are set; until then it logs each paid order.

Reference source listing (AliExpress Choice, 4.9★, 700+ sold, EU shipping):
`https://www.aliexpress.com/item/1005011587329202.html`

- [ ] Create a free **CJdropshipping** account (cjdropshipping.com).
- [ ] **Source Products** → paste the AliExpress URL above. CJ sources it,
      warehouses it (pick the **EU/DE warehouse** for 3–5 day Sweden delivery),
      and gives you reseller-licensed photos + per-colour **variant ids (VID)**.
- [ ] Optionally request custom **Usha dust-bag** branding (matches the copy).
- [ ] Put each colour's VID into `src/lib/product.ts` → `colors[].cjVid`.
- [ ] CJ → Authorization → **API**: create an API key. Add to Vercel Production:
      ```
      printf "%s" "you@usha.se"      | vercel env add CJ_API_EMAIL production
      printf "%s" "cj_api_key_xxx"   | vercel env add CJ_API_KEY production
      printf "%s" "DE"               | vercel env add CJ_FROM_COUNTRY production   # optional
      printf "%s" "CJPacket Ordinary"| vercel env add CJ_LOGISTIC_NAME production  # optional
      ```
- [ ] Confirm the real **specs** against the CJ listing and update
      `src/messages/*.json` (size/weight are marked *approx.* / *[verify]*).
- [ ] Place one live test order end-to-end and confirm it appears in CJ.

Send me the CJ **VIDs per colour** + **licensed image URLs** and I'll wire them
in (photos + Canva OG) and confirm the fulfilment path.

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
