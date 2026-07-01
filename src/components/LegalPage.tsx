import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Section = "terms" | "privacy" | "returns" | "shipping";

export function LegalPage({ section }: { section: Section }) {
  const t = useTranslations("legal");

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Link href="/" className="font-mono text-xs text-muted transition-colors hover:text-text">
        ← {t("backToShop")}
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">{t(`${section}.title`)}</h1>
      <p className="mt-6 whitespace-pre-line leading-relaxed text-muted">{t(`${section}.body`)}</p>
    </article>
  );
}
