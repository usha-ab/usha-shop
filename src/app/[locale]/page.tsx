import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { PUBLISHED_PRODUCTS, currencyForLocale, galleryFor } from "@/lib/product";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shop.usha.se";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Canonical + hreflang for the storefront root across sv/en/es.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const homeUrl = (loc: string) => `${SITE_URL}${loc === routing.defaultLocale ? "" : `/${loc}`}`;
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, homeUrl(l)]),
  );
  languages["x-default"] = homeUrl(routing.defaultLocale);
  return { alternates: { canonical: homeUrl(locale), languages } };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tc = await getTranslations({ locale, namespace: "catalog" });
  const currency = currencyForLocale(locale);

  const cards = await Promise.all(
    PUBLISHED_PRODUCTS.map(async (p) => {
      const t = await getTranslations({ locale, namespace: `products.${p.slug}` });
      return {
        slug: p.slug,
        name: t("name"),
        tagline: t("tagline"),
        price: p.price[currency].display,
        hero: galleryFor(p).hero,
      };
    }),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{tc("heading")}</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">{tc("subheading")}</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.slug} href={`/${c.slug}`} className="group block">
            <div className="overflow-hidden rounded-2xl border border-border bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.hero}
                alt={c.name}
                className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold leading-tight transition-colors group-hover:text-gold">
                  {c.name}
                </h2>
                <p className="mt-1 text-sm text-muted">{c.tagline}</p>
              </div>
              <span className="shrink-0 whitespace-nowrap font-semibold text-gradient">
                {tc("fromPrice", { price: c.price })}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
