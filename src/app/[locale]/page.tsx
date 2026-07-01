import { redirect } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { PRODUCT } from "@/lib/product";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// One product today → the storefront root sends shoppers straight to it.
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect({ href: `/${PRODUCT.slug}`, locale });
}
