import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { PUBLISHED_PRODUCTS } from "@/lib/product";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shop.usha.se";

function url(locale: string, path: string) {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${SITE_URL}${prefix}${path}`;
}

// Emit the product + legal pages in every locale, each with hreflang
// alternates so search engines index the right language per market.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    ...PUBLISHED_PRODUCTS.map((p) => `/${p.slug}`),
    "/terms",
    "/privacy",
    "/returns",
    "/shipping",
  ];

  return paths.map((path) => ({
    url: url(routing.defaultLocale, path),
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, url(l, path)])),
    },
  }));
}
