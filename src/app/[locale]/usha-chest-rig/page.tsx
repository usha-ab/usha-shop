import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { PRODUCT, priceForLocale, currencyForLocale } from "@/lib/product";
import { ProductHero } from "@/components/ProductHero";
import { Accordion } from "@/components/Accordion";
import { Reviews } from "@/components/Reviews";
import { FollowInstagram } from "@/components/FollowInstagram";
import { CheckIcon } from "@/components/icons";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shop.usha.se";

function ProductJsonLd({ locale }: { locale: string }) {
  const price = priceForLocale(locale as (typeof routing.locales)[number]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Usha Chest Rig — PU Leather Utility Bag",
    sku: PRODUCT.sku,
    brand: { "@type": "Brand", name: PRODUCT.brand },
    material: "PU (vegan) leather",
    image: PRODUCT.colors.map((c) => `${SITE_URL}${c.image}`),
    offers: {
      "@type": "Offer",
      priceCurrency: price.currency.toUpperCase(),
      price: (price.unitAmount / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/${locale === "sv" ? "" : locale + "/"}${PRODUCT.slug}`,
      seller: { "@type": "Organization", name: "Usha AB" },
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

function Features() {
  const t = useTranslations("product");
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

function Specs() {
  const t = useTranslations("product");
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
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await getTranslations({ locale, namespace: "product" });

  const price = priceForLocale(locale as (typeof routing.locales)[number]);
  currencyForLocale(locale as (typeof routing.locales)[number]); // (currency resolution lives in product.ts)

  return (
    <>
      <ProductJsonLd locale={locale} />
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
        <ProductHero
          colors={[...PRODUCT.colors]}
          gallery={[...PRODUCT.gallery]}
          priceDisplay={price.display}
          freeShippingDisplay={price.freeShippingDisplay}
        />
        <div className="mt-16 space-y-14 pb-4">
          <Features />
          <Specs />
          <ShippingAccordion />
        </div>
      </div>
      <Reviews />
      <FollowInstagram />
    </>
  );
}
