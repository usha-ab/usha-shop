import Stripe from "stripe";

// Lazily instantiate so a missing key fails loudly at request time (in the API
// route) rather than at module load / build time.
let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  // Pin to the SDK's built-in API version (avoids a hard-coded string drifting
  // out of sync with the installed stripe package).
  cached = new Stripe(key);
  return cached;
}

/**
 * Get-or-create a reusable percent-off coupon for a member discount, keyed by
 * a deterministic id (e.g. "usha-member-10"). The first discounted checkout
 * creates it; every later one reuses it — so no manual Stripe setup is needed
 * and the account never accumulates duplicate coupons. Returns the coupon id.
 */
export async function getMemberDiscountCoupon(
  stripe: Stripe,
  percentOff: number,
): Promise<string> {
  const id = `usha-member-${percentOff}`;
  try {
    await stripe.coupons.retrieve(id);
  } catch {
    // Not found (or first use) — create it with the fixed id. `duration` is
    // required by Stripe but only affects subscriptions; one-time charges apply
    // the percent once regardless.
    await stripe.coupons.create({
      id,
      percent_off: percentOff,
      duration: "forever",
      name: `Usha medlemsrabatt ${percentOff}%`,
    });
  }
  return id;
}
