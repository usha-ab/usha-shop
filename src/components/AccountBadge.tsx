"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

// "Signed in as …" indicator when a logged-in Usha Platform member is browsing
// the shop (shared .usha.se session). Reads identity from the same-origin
// /api/me endpoint (server-side, read-only) — the shop keeps NO client-side
// Supabase session, so it can never refresh, rotate, or clear the platform's
// auth cookie. Renders nothing for guests / when auth isn't configured.
export function AccountBadge() {
  const t = useTranslations("nav");
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d && d.signedIn && d.name) setName(d.name);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (!name) return null;

  return (
    <span className="hidden text-xs text-muted sm:inline" title={name}>
      {t("signedInAs", { name })}
    </span>
  );
}
