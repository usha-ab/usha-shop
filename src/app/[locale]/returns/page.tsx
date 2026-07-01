import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { LegalPage } from "@/components/LegalPage";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalPage section="returns" />;
}
