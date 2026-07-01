import { useTranslations } from "next-intl";
import { InstagramIcon } from "./icons";

const INSTAGRAM_URL = "https://instagram.com/usha.shop";

export function FollowInstagram() {
  const t = useTranslations("follow");

  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
      <div className="overflow-hidden rounded-xl2 border border-border bg-card p-8 text-center sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-usha-gradient">
          <InstagramIcon className="h-7 w-7 text-base" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight">{t("heading")}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">{t("body")}</p>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-gold px-6 py-3 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-base"
        >
          <InstagramIcon className="h-4 w-4" />
          {t("cta")} · @usha.shop
        </a>
      </div>
    </section>
  );
}
