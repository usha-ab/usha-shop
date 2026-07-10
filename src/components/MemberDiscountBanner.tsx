"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { StarIcon } from "./icons";

// Pre-checkout perk hint on the product page: when a logged-in Usha Platform
// member qualifies for a discount (Guld/Premium, and discounts are enabled), it
// shows "your member discount −X% is applied at checkout". Renders nothing for
// guests, gratis members, or during the beta (flag off) — so it's inert until
// Phase 2 is activated. Client-only fetch keeps the product page static.
export function MemberDiscountBanner() {
  const t = useTranslations("member");
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    let active = true;
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d && typeof d.discountPercent === "number" && d.discountPercent > 0) {
          setPercent(d.discountPercent);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (!percent) return null;

  return (
    <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm font-medium text-gold">
      <StarIcon className="h-4 w-4 shrink-0" />
      {t("discountBanner", { percent })}
    </div>
  );
}
