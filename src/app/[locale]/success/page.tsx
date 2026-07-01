import { setRequestLocale, getTranslations } from "next-intl/server";
import { CheckIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { PRODUCT } from "@/lib/product";

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "checkout" });

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-usha-gradient">
        <CheckIcon className="h-8 w-8 text-base" />
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">{t("successTitle")}</h1>
      <p className="mt-3 leading-relaxed text-muted">{t("successBody")}</p>
      <Link
        href={`/${PRODUCT.slug}`}
        className="mt-8 rounded-xl border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-gold hover:text-gold"
      >
        {t("continueShopping")}
      </Link>
    </div>
  );
}
