// ---------------------------------------------------------------------------
// Product registry — single source of truth for every product in Usha Shop.
// Commercial values (price, colours, images, CJ variant ids) live here; all
// copy lives per-product in src/messages/*.json under `products.<slug>`.
// [verify]/interim values are refined when CJ sources each product.
// ---------------------------------------------------------------------------

export type Currency = "sek" | "eur";

export interface ProductColor {
  /** Colour id — must match a key in messages `products.<slug>.colorNames`. */
  id: string;
  /** Swatch hex shown in the colour selector. */
  swatch: string;
  /** Image for this colour (drop real photos into /public/images). */
  image: string;
  /** CJdropshipping variant id (VID); filled after sourcing. "" = log only. */
  cjVid: string;
}

interface PriceInfo {
  /** Unit price in the currency's minor unit (öre / cents) for Stripe. */
  amount: number;
  /** Human display, e.g. "399 kr" / "€35". */
  display: string;
}

export interface Product {
  /** URL slug + i18n namespace key. */
  slug: string;
  sku: string;
  brand: string;
  price: Record<Currency, PriceInfo>;
  colors: ProductColor[];
  /** Shared gallery shots. gallery[0] = lifestyle hero (shown first). */
  gallery: string[];
  /** Only published products are shown in the catalog, reachable by URL,
   *  listed in the sitemap, and buyable. Flip to true ONLY when the product is
   *  fully sourced (CJ offer accepted, cjVid + real photos in) and sellable
   *  end-to-end like the chest rig. */
  published: boolean;
}

// --- Shipping (shared across products) ---------------------------------------
export const SHIPPING: Record<Currency, { freeThreshold: number; fee: number; freeDisplay: string }> = {
  sek: { freeThreshold: 60000, fee: 4900, freeDisplay: "600 kr" },
  eur: { freeThreshold: 5900, fee: 490, freeDisplay: "€59" },
};

// --- The catalog -------------------------------------------------------------
export const PRODUCTS: Product[] = [
  {
    slug: "usha-chest-rig",
    sku: "USHA-CR-001",
    brand: "Usha",
    published: true,
    price: { sek: { amount: 39900, display: "399 kr" }, eur: { amount: 3500, display: "€35" } },
    colors: [
      { id: "brown", swatch: "#6b4a2b", image: "/images/chest-rig-brown.jpg", cjVid: "2509230333571627700" },
      { id: "olive", swatch: "#4b5320", image: "/images/chest-rig-olive.jpg", cjVid: "2509230333571627800" },
      { id: "black", swatch: "#141414", image: "/images/chest-rig-black.jpg", cjVid: "2509230333571627300" },
      { id: "tan", swatch: "#a9714a", image: "/images/chest-rig-tan.jpg", cjVid: "2605160300351638200" },
      { id: "winered", swatch: "#6e2231", image: "/images/chest-rig-winered.jpg", cjVid: "2509230333571628001" },
      { id: "emerald", swatch: "#2fae99", image: "/images/chest-rig-emerald.jpg", cjVid: "2509230333571628200" },
      { id: "yellow", swatch: "#d99a3a", image: "/images/chest-rig-yellow.jpg", cjVid: "2509230333571628300" },
      { id: "pink", swatch: "#e3a3b3", image: "/images/chest-rig-pink.jpg", cjVid: "2509230333571628500" },
    ],
    gallery: ["/images/chest-rig-worn.jpg", "/images/chest-rig-detail.jpg"],
  },
  {
    slug: "usha-belt-bag",
    sku: "USHA-BB-001",
    brand: "Usha",
    published: false,
    // Slim PU leather belt bag, pin buckle, snap-flap pouch (AliExpress ref 1005008516610559).
    // Interim placeholder photos + empty cjVid — swapped when CJ sourcing lands.
    price: { sek: { amount: 34900, display: "349 kr" }, eur: { amount: 3200, display: "€32" } },
    colors: [
      { id: "black", swatch: "#141414", image: "/images/belt-bag-placeholder.jpg", cjVid: "" },
      { id: "cream", swatch: "#e8e2d6", image: "/images/belt-bag-placeholder.jpg", cjVid: "" },
      { id: "pink", swatch: "#e3a9b4", image: "/images/belt-bag-placeholder.jpg", cjVid: "" },
      { id: "grey", swatch: "#8f8b86", image: "/images/belt-bag-placeholder.jpg", cjVid: "" },
      { id: "nude", swatch: "#d9b79c", image: "/images/belt-bag-placeholder.jpg", cjVid: "" },
    ],
    gallery: [],
  },
];

// --- Helpers -----------------------------------------------------------------

/** Catalog, storefront routes, sitemap and checkout all use this — never the
 *  raw PRODUCTS list — so unpublished (not-yet-sellable) products stay hidden. */
export const PUBLISHED_PRODUCTS: Product[] = PRODUCTS.filter((p) => p.published);

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

/** Like getProduct but only returns the product if it's published — use for
 *  anything public-facing (page render, checkout) so hidden products 404 / reject. */
export function getPublishedProduct(slug: string): Product | undefined {
  return PUBLISHED_PRODUCTS.find((p) => p.slug === slug);
}

/** Swedish shoppers pay in SEK; English/Spanish default to EUR. */
export function currencyForLocale(locale: string): Currency {
  return locale === "sv" ? "sek" : "eur";
}

/** Ordered image strip: lifestyle hero first, then colour shots, then extras. */
export function galleryFor(product: Product): { hero: string; thumbnails: string[] } {
  const hero = product.gallery[0] ?? product.colors[0].image;
  const thumbnails = [
    product.gallery[0],
    ...product.colors.map((c) => c.image),
    ...product.gallery.slice(1),
  ].filter(Boolean) as string[];
  return { hero, thumbnails };
}

/** CJ variant id for a colour, or "" if not sourced/mapped yet. */
export function cjVidForColor(product: Product, colorId: string): string {
  return product.colors.find((c) => c.id === colorId)?.cjVid ?? "";
}
