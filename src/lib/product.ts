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
  /**
   * CJdropshipping variant id (VID) for this colour. Filled in after you
   * source the product in CJ — the fulfilment webhook orders by this id.
   * Empty until then (fulfilment falls back to logging).
   */
  cjVid: string;
}

export const PRODUCT = {
  /** Stable SKU / slug — also the URL path. */
  slug: "usha-chest-rig",
  sku: "USHA-CR-001",
  /** Brand for JSON-LD. */
  brand: "Usha",
  colors: [
    // black/brown = real supplier photos (interim, from the AliExpress source
    // listing); olive is the black shot recoloured to olive (duotone) so it
    // matches the framing until CJ's real olive photo lands.
    { id: "brown", swatch: "#6b4a2b", image: "/images/chest-rig-brown.jpg", cjVid: "" },
    { id: "olive", swatch: "#4b5320", image: "/images/chest-rig-olive.jpg", cjVid: "" },
    { id: "black", swatch: "#141414", image: "/images/chest-rig-black.jpg", cjVid: "" },
  ] as ProductColor[],
  /** Gallery shots shared across colors (detail / worn). */
  gallery: [
    "/images/chest-rig-detail.jpg",
    "/images/chest-rig-worn.jpg",
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
  /** Human display, e.g. "399 kr" / "€35". */
  display: string;
  freeShippingDisplay: string;
}

export const PRICING: Record<Currency, PriceInfo> = {
  sek: {
    currency: "sek",
    unitAmount: 39900, // 399 kr
    freeShippingThreshold: 60000, // 600 kr
    shippingFee: 4900, // 49 kr flat under threshold
    display: "399 kr",
    freeShippingDisplay: "600 kr",
  },
  eur: {
    currency: "eur",
    unitAmount: 3500, // €35 (≈ 399 kr)
    freeShippingThreshold: 5900, // €59
    shippingFee: 490, // €4.90 flat under threshold
    display: "€35",
    freeShippingDisplay: "€59",
  },
};

/** CJ variant id for a colour, or "" if not sourced/mapped yet. */
export function cjVidForColor(colorId: string): string {
  return PRODUCT.colors.find((c) => c.id === colorId)?.cjVid ?? "";
}

/** Swedish shoppers pay in SEK; English/Spanish default to EUR. */
export function currencyForLocale(locale: Locale): Currency {
  return locale === "sv" ? "sek" : "eur";
}

export function priceForLocale(locale: Locale): PriceInfo {
  return PRICING[currencyForLocale(locale)];
}
