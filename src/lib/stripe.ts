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
