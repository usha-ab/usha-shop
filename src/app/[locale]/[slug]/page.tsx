import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import {
  PUBLISHED_PRODUCTS,
  getPublishedProduct,
  currencyForLocale,
  SHIPPING,
  type Product,
} from "@/lib/product";
import { ProductHero } from "@/components/ProductHero";
import { Accordion } from "@/components/Accordion";
import { Reviews } from "@/components/Reviews";
import { FollowInstagram } from "@/components/FollowInstagram";
import { CheckIcon } from "@/components/icons";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shop.usha.se";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => PUBLISHED_PRODUCTS.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = getPublishedProduct(slug);
  if (!product) return {};
  const t = await getTranslations({ locale, namespace: `products.${slug}.seo` });

  // Canonical + hreflang so the same product across sv/en/es isn't treated as
  // duplicate content (next-intl doesn't inject these automatically).
  const productUrl = (loc: string) =>
    `${SITE_URL}${loc === routing.defaultLocale ? "" : `/${loc}`}/${slug}`;
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, productUrl(l)]),
  );
  languages["x-default"] = productUrl(routing.defaultLocale);

  // Use the lifestyle hero (gallery[0]) for social cards, not the flat packshot.
  const ogImage = `${SITE_URL}${product.gallery[0] ?? product.colors[0].image}`;

  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: productUrl(locale), languages },
    openGraph: {
      title: t("title"),
      description: t("description"),
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [ogImage],
    },
  };
}

function ProductJsonLd({ product, name, locale }: { product: Product; name: string; locale: string }) {
  const price = product.price[currencyForLocale(locale)];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    image: product.colors.map((c) => `${SITE_URL}${c.image}`),
    offers: {
      "@type": "Offer",
      priceCurrency: currencyForLocale(locale).toUpperCase(),
      price: (price.amount / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/${locale === "sv" ? "" : locale + "/"}${product.slug}`,
      seller: { "@type": "Organization", name: "Usha AB" },
    },
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
  );
}

function Features({ slug }: { slug: string }) {
  const t = useTranslations(`products.${slug}`);
  const features = t.raw("features") as string[];
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight">{t("featuresHeading")}</h2>
      <ul className="mt-5 space-y-3">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-usha-gradient">
              <CheckIcon className="h-3 w-3 text-[#0a0a0b]" />
            </span>
            <span className="text-sm leading-relaxed text-text">{f}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Specs({ slug }: { slug: string }) {
  const t = useTranslations(`products.${slug}`);
  const includes = t.raw("includes") as string[];
  const rows = ["material", "size", "weight", "fits"] as const;
  return (
    <section className="grid gap-10 sm:grid-cols-2">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{t("specsHeading")}</h2>
        <dl className="mt-5 divide-y divide-border rounded-xl2 border border-border bg-card">
          {rows.map((key) => (
            <div key={key} className="grid grid-cols-3 gap-4 px-5 py-3.5">
              <dt className="text-sm text-muted">{t(`specs.${key}.label`)}</dt>
              <dd className="col-span-2 text-sm text-text">{t(`specs.${key}.value`)}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{t("includesHeading")}</h2>
        <ul className="mt-5 space-y-3">
          {includes.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span className="text-sm text-text">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ShippingAccordion() {
  const shipping = useTranslations("shipping");
  const legal = useTranslations("legal");
  const items = [
    { title: shipping("heading"), content: shipping("body") },
    { title: legal("returns.title"), content: legal("returns.body") },
    { title: legal("privacy.title"), content: legal("privacy.body") },
  ];
  return (
    <section>
      <Accordion items={items} />
    </section>
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = getPublishedProduct(slug);
  if (!product) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: `products.${slug}` });
  const currency = currencyForLocale(locale);
  const price = product.price[currency];

  return (
    <>
      <ProductJsonLd product={product} name={t("name")} locale={locale} />
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
        <ProductHero
          slug={slug}
          colors={[...product.colors]}
          gallery={[...product.gallery]}
          priceDisplay={price.display}
          freeShippingDisplay={SHIPPING[currency].freeDisplay}
        />
        <div className="mt-16 space-y-14 pb-4">
          <Features slug={slug} />
          <Specs slug={slug} />
          <ShippingAccordion />
        </div>
      </div>
      <Reviews />
      <FollowInstagram />
    </>
  );
}
