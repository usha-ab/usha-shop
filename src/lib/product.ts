// ---------------------------------------------------------------------------
// Single source of truth for the Usha Chest Rig product.
// Edit numbers here once — the page, JSON-LD, and Stripe Checkout all read this.
// [verify] marks values that MUST be confirmed against the supplier listing.
// ---------------------------------------------------------------------------

import type { Locale } from "@/i18n/routing";

export type ColorId = "brown" | "olive" | "black";

export interface ProductColor {
  id: ColorId;
  /** Swatch hex shown in the color selector. */
  swatch: string;
  /** Hero image for this color (drop real photos into /public/images). */
  image: string;
}

export const PRODUCT = {
  /** Stable SKU / slug — also the URL path. */
  slug: "usha-chest-rig",
  sku: "USHA-CR-001",
  /** Brand for JSON-LD. */
  brand: "Usha",
  colors: [
    { id: "brown", swatch: "#6b4a2b", image: "/images/chest-rig-brown.svg" },
    { id: "olive", swatch: "#4b5320", image: "/images/chest-rig-olive.svg" },
    { id: "black", swatch: "#141414", image: "/images/chest-rig-black.svg" },
  ] as ProductColor[],
  /** Gallery shots shared across colors (detail / worn / packaging). */
  gallery: [
    "/images/chest-rig-detail.svg",
    "/images/chest-rig-worn.svg",
    "/images/chest-rig-dustbag.svg",
  ],
} as const;

// --- Pricing -----------------------------------------------------------------
// Amounts are in the currency's minor unit (öre / cents) for Stripe.
export type Currency = "sek" | "eur";

interface PriceInfo {
  currency: Currency;
  /** Unit price in minor units (öre / cents). */
  unitAmount: number;
  /** Free-shipping threshold in minor units. */
  freeShippingThreshold: number;
  /** Flat shipping charged below the threshold, in minor units. */
  shippingFee: number;
  /** Human display, e.g. "449 kr" / "€39". */
  display: string;
  freeShippingDisplay: string;
}

export const PRICING: Record<Currency, PriceInfo> = {
  sek: {
    currency: "sek",
    unitAmount: 44900, // 449 kr
    freeShippingThreshold: 60000, // 600 kr
    shippingFee: 4900, // 49 kr flat under threshold
    display: "449 kr",
    freeShippingDisplay: "600 kr",
  },
  eur: {
    currency: "eur",
    unitAmount: 3900, // €39
    freeShippingThreshold: 5900, // €59
    shippingFee: 490, // €4.90 flat under threshold
    display: "€39",
    freeShippingDisplay: "€59",
  },
};

/** Swedish shoppers pay in SEK; English/Spanish default to EUR. */
export function currencyForLocale(locale: Locale): Currency {
  return locale === "sv" ? "sek" : "eur";
}

export function priceForLocale(locale: Locale): PriceInfo {
  return PRICING[currencyForLocale(locale)];
}
