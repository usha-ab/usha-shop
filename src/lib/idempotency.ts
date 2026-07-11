// ---------------------------------------------------------------------------
// Webhook idempotency store (backed by the platform Supabase via SECURITY
// DEFINER RPCs). Stripe delivers events at-least-once and retries on any non-2xx,
// so the fulfilment webhook must process each paid session exactly once —
// otherwise a redelivery after a partial failure could place a duplicate CJ
// order. We CLAIM the event id before any side effect and RELEASE it if the side
// effect fails (so Stripe's retry re-processes it).
//
// Fails OPEN: if the store isn't configured or errors, claim returns true so a
// paid order is never blocked; CJ's orderNumber = session.id dedup is the backstop.
// ---------------------------------------------------------------------------
import { createServerClient } from "@supabase/ssr";

function configured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function client() {
  // No auth/session needed — the RPCs are SECURITY DEFINER. No-op cookie jar.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

/**
 * Returns true if this event id is seen for the first time (proceed with
 * fulfilment), false if it was already processed (skip). Fails open (true).
 */
export async function claimStripeEvent(
  eventId: string,
  sessionId: string | null,
): Promise<boolean> {
  if (!configured()) return true;
  try {
    const { data, error } = await client().rpc("claim_stripe_event", {
      p_event_id: eventId,
      p_session_id: sessionId,
    });
    if (error) {
      console.error("[idempotency] claim failed, proceeding:", error);
      return true;
    }
    return data === true;
  } catch (e) {
    console.error("[idempotency] claim threw, proceeding:", e);
    return true;
  }
}

/** Release a claim so a failed fulfilment attempt is retried by Stripe. */
export async function releaseStripeEvent(eventId: string): Promise<void> {
  if (!configured()) return;
  try {
    await client().rpc("release_stripe_event", { p_event_id: eventId });
  } catch (e) {
    console.error("[idempotency] release failed:", e);
  }
}
