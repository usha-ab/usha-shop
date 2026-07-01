import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Stripe → fulfilment webhook (STUB).
//
// This verifies the Stripe signature and, on a paid order, assembles the
// shipping payload we will forward to the dropshipping supplier
// (CJdropshipping / DSers) once that account is connected at go-live.
//
// TODO(go-live): replace `forwardToSupplier()` with a real API call to the
// chosen supplier. Until then it logs the order and (optionally) you can wire
// FULFILLMENT_NOTIFY_EMAIL to an email service. See CHECKLIST.md.
// ---------------------------------------------------------------------------

interface FulfillmentOrder {
  stripeSessionId: string;
  sku: string;
  color: string;
  quantity: number;
  amountTotal: number | null;
  currency: string | null;
  email: string | null;
  /** Buyer + shipping address as collected by Stripe Checkout. */
  shipping: unknown;
}

async function forwardToSupplier(order: FulfillmentOrder): Promise<void> {
  // STUB: no real supplier connected yet. Log the full order so it can be
  // fulfilled manually / replayed once the supplier API is wired in.
  console.log("[fulfillment] order ready to forward:", JSON.stringify(order));
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const payload = await req.text(); // raw body required for signature verification
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    console.error("[webhook] signature verification failed:", err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Only fulfil when actually paid.
    if (session.payment_status === "paid") {
      const order: FulfillmentOrder = {
        stripeSessionId: session.id,
        sku: session.metadata?.sku ?? "unknown",
        color: session.metadata?.color ?? "unknown",
        quantity: Number(session.metadata?.quantity ?? "1"),
        amountTotal: session.amount_total,
        currency: session.currency,
        email: session.customer_details?.email ?? null,
        // Address lives under collected_information in recent API versions,
        // with customer_details as a fallback for older ones.
        shipping:
          (session as unknown as { collected_information?: unknown }).collected_information ??
          session.customer_details ??
          null,
      };

      try {
        await forwardToSupplier(order);
      } catch (err) {
        // Return 500 so Stripe retries delivery rather than dropping the order.
        console.error("[webhook] forwardToSupplier failed:", err);
        return NextResponse.json({ error: "fulfillment_failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
