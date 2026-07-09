import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { getStripe } from "@/lib/stripe";
import { getProduct, currencyForLocale, SHIPPING } from "@/lib/product";
import { routing } from "@/i18n/routing";

export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shop.usha.se";

// Countries we ship to (EU warehouse). Extend as fulfilment coverage grows.
const SHIP_TO = [
  "SE", "DK", "FI", "NO", "DE", "NL", "BE", "FR", "ES", "PT", "IT", "AT",
  "IE", "PL", "CZ", "EE", "LV", "LT", "LU", "GR", "HU", "RO", "BG", "HR",
  "SI", "SK", "GB",
] as const;

/** Build a locale-prefixed absolute URL (sv is the unprefixed default). */
function localeUrl(locale: string, path: string): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${SITE_URL}${prefix}${path}`;
}

export async function POST(req: Request) {
  let body: { slug?: string; colorId?: string; quantity?: number; locale?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { slug, colorId, quantity, locale } = body;

  // --- validate ---
  const product = getProduct(slug ?? "");
  if (!product) {
    return NextResponse.json({ error: "invalid_product" }, { status: 400 });
  }
  const color = product.colors.find((c) => c.id === colorId);
  if (!color) {
    return NextResponse.json({ error: "invalid_color" }, { status: 400 });
  }
  const qty = Number.isInteger(quantity) ? Math.min(10, Math.max(1, quantity!)) : 1;
  const activeLocale = routing.locales.includes(locale as never)
    ? (locale as string)
    : routing.defaultLocale;

  const currency = currencyForLocale(activeLocale);
  const price = product.price[currency];
  const ship = SHIPPING[currency];

  const subtotal = price.amount * qty;
  const shippingAmount = subtotal >= ship.freeThreshold ? 0 : ship.fee;

  // Localised product name for the Stripe line item.
  const t = await getTranslations({ locale: activeLocale, namespace: `products.${product.slug}` });
  const name = t("name");

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: activeLocale as "sv" | "en" | "es",
      // Payment methods (Klarna / cards / Apple Pay / Google Pay) are presented
      // automatically per the methods enabled on the platform Stripe account.
      line_items: [
        {
          quantity: qty,
          price_data: {
            currency,
            unit_amount: price.amount,
            product_data: {
              name,
              description: `Color: ${color.id}`,
              images: [`${SITE_URL}${color.image}`],
              metadata: { sku: product.sku, slug: product.slug, color: color.id },
            },
          },
        },
      ],
      shipping_address_collection: { allowed_countries: [...SHIP_TO] },
      // CJdropshipping requires a phone number for the shipping label.
      phone_number_collection: { enabled: true },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: shippingAmount, currency },
            display_name: shippingAmount === 0 ? "Free shipping" : "Standard shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 9 },
            },
          },
        },
      ],
      // Carried through to the webhook for fulfilment.
      metadata: {
        sku: product.sku,
        slug: product.slug,
        color: color.id,
        quantity: String(qty),
        locale: activeLocale,
      },
      success_url: localeUrl(activeLocale, "/success?session_id={CHECKOUT_SESSION_ID}"),
      cancel_url: localeUrl(activeLocale, "/cancel"),
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] stripe error:", err);
    return NextResponse.json({ error: "stripe_error" }, { status: 500 });
  }
}
