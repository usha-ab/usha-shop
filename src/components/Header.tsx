import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "./Logo";
import { InstagramIcon } from "./icons";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { AccountBadge } from "./AccountBadge";

const INSTAGRAM_URL = "https://instagram.com/usha.shop";

export function Header() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-base/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="text-lg font-semibold tracking-tight">
            Usha <span className="text-muted">Shop</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <AccountBadge />
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("instagram")}
            className="text-muted transition-colors hover:text-gold"
          >
            <InstagramIcon className="h-5 w-5" />
          </a>
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
