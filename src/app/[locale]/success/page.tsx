import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CheckIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { getStripe } from "@/lib/stripe";

// Transactional page — keep it out of search indexes.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { locale } = await params;
  const { session_id } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "checkout" });

  // Only show the confirmation when the Stripe session actually paid — a direct
  // visit / bookmark / abandoned-then-Back must not render a false "confirmed".
  let paid = false;
  if (session_id) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(session_id);
      paid = session.payment_status === "paid";
    } catch {
      paid = false;
    }
  }

  if (!paid) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">{t("pendingTitle")}</h1>
        <p className="mt-3 leading-relaxed text-muted">{t("pendingBody")}</p>
        <Link
          href="/"
          className="mt-8 rounded-xl border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-gold hover:text-gold"
        >
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-usha-gradient">
        <CheckIcon className="h-8 w-8 text-[#0a0a0b]" />
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">{t("successTitle")}</h1>
      <p className="mt-3 leading-relaxed text-muted">{t("successBody")}</p>
      <Link
        href="/"
        className="mt-8 rounded-xl border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-gold hover:text-gold"
      >
        {t("continueShopping")}
      </Link>
    </div>
  );
}
