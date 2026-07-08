import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PRODUCT } from "@/lib/product";

export default async function CancelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "checkout" });

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">{t("cancelTitle")}</h1>
      <p className="mt-3 leading-relaxed text-muted">{t("cancelBody")}</p>
      <Link
        href={`/${PRODUCT.slug}`}
        className="mt-8 rounded-xl bg-usha-gradient px-6 py-3 text-sm font-semibold text-[#0a0a0b]"
      >
        {t("backToProduct")}
      </Link>
    </div>
  );
}
