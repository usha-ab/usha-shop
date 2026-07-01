"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABELS: Record<string, string> = { sv: "SV", en: "EN", es: "ES" };

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1 font-mono text-xs" role="group" aria-label="Language">
      {routing.locales.map((loc) => {
        const active = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            disabled={active || isPending}
            onClick={() =>
              startTransition(() => {
                // Keep the current path, swap the locale.
                router.replace(pathname, { locale: loc });
              })
            }
            className={
              active
                ? "rounded-md bg-usha-gradient px-2 py-1 font-semibold text-base"
                : "rounded-md px-2 py-1 text-muted transition-colors hover:text-text"
            }
            aria-current={active ? "true" : undefined}
          >
            {LABELS[loc]}
          </button>
        );
      })}
    </div>
  );
}
