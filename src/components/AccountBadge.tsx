"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createPlatformBrowserClient } from "@/lib/supabase-browser";

// Small storefront indicator: "Signed in as …" when a logged-in Usha Platform
// user is browsing the shop (shared .usha.se session). Renders nothing for
// guests or when auth isn't configured — keeps the storefront static/cacheable
// (this hydrates client-side only, no per-request cookie read on the pages).
export function AccountBadge() {
  const t = useTranslations("nav");
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createPlatformBrowserClient();
    if (!supabase) return;

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (!active || !user) return;
      const meta = user.user_metadata ?? {};
      const name =
        (meta.full_name as string | undefined) ??
        (meta.name as string | undefined) ??
        user.email ??
        null;
      if (name) setLabel(name);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!label) return null;

  return (
    <span className="hidden text-xs text-muted sm:inline" title={label}>
      {t("signedInAs", { name: label })}
    </span>
  );
}
