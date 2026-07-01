import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "./Logo";
import { InstagramIcon } from "./icons";
import { PaymentBadges } from "./PaymentBadges";

const INSTAGRAM_URL = "https://instagram.com/usha.shop";
const CONTACT_EMAIL = "pablo.acosta@usha.se";

export function Footer() {
  const t = useTranslations("footer");

  const links = [
    { href: "/terms", label: t("links.terms") },
    { href: "/privacy", label: t("links.privacy") },
    { href: "/returns", label: t("links.returns") },
    { href: "/shipping", label: t("links.shipping") },
  ] as const;

  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <Logo className="h-7 w-7" />
              <span className="font-semibold">Usha Shop</span>
            </div>
            <p className="mt-3 font-mono text-xs text-muted">{t("companyLine")}</p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-1 block text-sm text-muted transition-colors hover:text-text"
            >
              {t("contact")}: {CONTACT_EMAIL}
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-gold"
            >
              <InstagramIcon className="h-4 w-4" />
              @usha.shop
            </a>
          </div>

          <nav className="flex flex-col gap-2 text-sm" aria-label="Legal">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-muted transition-colors hover:text-text"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div>
            <PaymentBadges />
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-xs text-muted">
          © {new Date().getFullYear()} Usha AB. {t("rights")}
        </div>
      </div>
    </footer>
  );
}
