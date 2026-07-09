import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getProduct, cjVidForColor } from "@/lib/product";
import { isCjConfigured, createCjOrder, type CjShippingAddress } from "@/lib/cj";

export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Stripe → CJdropshipping fulfilment webhook.
//
// On a paid order it extracts the shipping address from the Checkout Session
// and places the order with CJ (when configured). Until CJ_API_* env vars +
// the per-colour CJ variant ids (product.ts → cjVid) are set, it falls back to
// logging the order so nothing is lost. See CHECKLIST.md.
// ---------------------------------------------------------------------------

interface FulfillmentOrder {
  stripeSessionId: string;
  slug: string;
  sku: string;
  color: string;
  quantity: number;
  amountTotal: number | null;
  currency: string | null;
  shipping: CjShippingAddress | null;
}

/** Normalise the Stripe Checkout shipping/customer data into a CJ address. */
function extractShipping(session: Stripe.Checkout.Session): CjShippingAddress | null {
  // Address lives under collected_information.shipping_details in recent API
  // versions; older ones expose session.shipping_details.
  const details =
    (session as unknown as { collected_information?: { shipping_details?: unknown } })
      .collected_information?.shipping_details ??
    (session as unknown as { shipping_details?: unknown }).shipping_details;

  const d = details as
    | { name?: string; address?: Stripe.Address }
    | undefined;
  const addr = d?.address;
  if (!addr?.country || !addr.line1) return null;

  const countryName =
    (() => {
      try {
        return new Intl.DisplayNames(["en"], { type: "region" }).of(addr.country) ?? addr.country;
      } catch {
        return addr.country;
      }
    })();

  return {
    name: d?.name ?? session.customer_details?.name ?? "",
    phone: session.customer_details?.phone ?? "",
    countryCode: addr.country,
    country: countryName,
    // Sweden and most EU countries have no state; CJ still wants a province.
    province: addr.state || addr.city || "",
    city: addr.city ?? "",
    address: addr.line1,
    address2: addr.line2 ?? "",
    zip: addr.postal_code ?? "",
  };
}

async function forwardToSupplier(order: FulfillmentOrder): Promise<void> {
  // Always log for an audit trail / manual replay.
  console.log("[fulfillment] paid order:", JSON.stringify(order));

  const product = getProduct(order.slug);
  const cjVid = product ? cjVidForColor(product, order.color) : "";

  if (!isCjConfigured() || !cjVid || !order.shipping) {
    console.log(
      `[fulfillment] CJ not placed (configured=${isCjConfigured()}, cjVid=${Boolean(
        cjVid,
      )}, shipping=${Boolean(order.shipping)}) — logged only.`,
    );
    return;
  }

  const { cjOrderId } = await createCjOrder({
    orderNumber: order.stripeSessionId,
    vid: cjVid,
    quantity: order.quantity,
    shipping: order.shipping,
  });
  console.log(`[fulfillment] CJ order created: ${cjOrderId}`);
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

    if (session.payment_status === "paid") {
      const order: FulfillmentOrder = {
        stripeSessionId: session.id,
        slug: session.metadata?.slug ?? "",
        sku: session.metadata?.sku ?? "unknown",
        color: session.metadata?.color ?? "unknown",
        quantity: Number(session.metadata?.quantity ?? "1"),
        amountTotal: session.amount_total,
        currency: session.currency,
        shipping: extractShipping(session),
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
