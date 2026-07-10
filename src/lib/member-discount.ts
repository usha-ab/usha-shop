// ---------------------------------------------------------------------------
// Membership discount for the shop — mirrors the platform's discount policy
// (creators-platform: src/lib/stripe/commission.ts).
//
// Guld members get 10% off, Premium members get 20% off. DISABLED by default:
// during the free beta memberships cost nothing, so the tier discounts must not
// apply. Flip NEXT_PUBLIC_DISCOUNTS_ENABLED=true (on the shop, matching the
// platform) once memberships are paid to activate.
//
// Keep DISCOUNT_RATES in sync with the platform's DISCOUNT_RATES.
// ---------------------------------------------------------------------------

export type MemberTier = "gratis" | "guld" | "premium";

export const DISCOUNT_RATES: Record<"guld" | "premium", number> = {
  guld: 0.1,
  premium: 0.2,
};

export function discountsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DISCOUNTS_ENABLED === "true";
}

/**
 * Discount percentage (as an integer, e.g. 10 or 20) that applies to this tier,
 * or 0 when discounts are disabled / the tier doesn't qualify. Integer form is
 * what Stripe's coupon `percent_off` expects.
 */
export function memberDiscountPercent(tier: MemberTier | null | undefined): number {
  if (!discountsEnabled()) return 0;
  if (!tier || tier === "gratis") return 0;
  const rate = DISCOUNT_RATES[tier as "guld" | "premium"];
  return rate === undefined ? 0 : Math.round(rate * 100);
}
