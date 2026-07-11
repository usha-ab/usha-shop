"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { StarIcon } from "./icons";

// Where a shopper goes to become a member (Guld/Premium tiers live on the
// platform). Signup, then upgrade → the shared .usha.se session applies the
// discount here automatically.
const JOIN_URL = "https://usha.se/signup";
// The top member tier's discount (Premium = 20%), advertised as "up to X%".
const MAX_DISCOUNT = 20;
// NEXT_PUBLIC_ is inlined at build time — reflects the shop's discount flag.
const discountsEnabled = process.env.NEXT_PUBLIC_DISCOUNTS_ENABLED === "true";

// Pre-checkout membership perk on the product page:
//  • a qualifying logged-in member → "your −X% member discount is applied"
//  • a guest / non-member → an encouragement to join for the discount
// Both only render when discounts are actually enabled, so we never advertise a
// discount that isn't applied (inert during the free beta, flag off).
export function MemberDiscountBanner() {
  const t = useTranslations("member");
  const [percent, setPercent] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d) {
          setPercent(typeof d.discountPercent === "number" ? d.discountPercent : 0);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Beta / discounts off, or /api/me not resolved yet → show nothing.
  if (!discountsEnabled || percent === null) return null;

  // Qualifying member — their discount is applied at checkout.
  if (percent > 0) {
    return (
      <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm font-medium text-gold">
        <StarIcon className="h-4 w-4 shrink-0" />
        {t("discountBanner", { percent })}
      </div>
    );
  }

  // Guest / non-member — encourage joining for the perk.
  return (
    <a
      href={JOIN_URL}
      className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/20"
    >
      <StarIcon className="h-4 w-4 shrink-0" />
      {t("joinForDiscount", { percent: MAX_DISCOUNT })}
    </a>
  );
}
