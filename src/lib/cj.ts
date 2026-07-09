// ---------------------------------------------------------------------------
// CJdropshipping API v2 client — auth + create-order.
// Docs: https://developers.cjdropshipping.com/
//
// Activated by env vars (all set at go-live, after you source the product):
//   CJ_API_EMAIL      – the email of your CJ account
//   CJ_API_KEY        – API key from CJ → Authorization → API (developer)
//   CJ_FROM_COUNTRY   – warehouse to ship from, e.g. "DE" (EU) or "CN". Optional.
//   CJ_LOGISTIC_NAME  – shipping method label from CJ, e.g. "CJPacket Ordinary".
//
// If CJ_API_EMAIL / CJ_API_KEY are missing, isCjConfigured() returns false and
// the webhook falls back to logging the order (no order is placed).
// ---------------------------------------------------------------------------

const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";

export interface CjShippingAddress {
  name: string;
  phone: string;
  /** ISO-2 country code, e.g. "SE". */
  countryCode: string;
  country: string;
  province: string;
  city: string;
  address: string;
  address2?: string;
  zip: string;
}

export interface CjOrderInput {
  /** Our own order reference (use the Stripe session id). */
  orderNumber: string;
  /** CJ variant id + quantity. */
  vid: string;
  quantity: number;
  shipping: CjShippingAddress;
}

export function isCjConfigured(): boolean {
  return Boolean(process.env.CJ_API_EMAIL && process.env.CJ_API_KEY);
}

// CJ access tokens are valid ~15 days. Cache within a warm serverless instance;
// a cold start just re-authenticates.
let tokenCache: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.token;
  }
  const res = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.CJ_API_EMAIL,
      apiKey: process.env.CJ_API_KEY,
    }),
  });
  const json = (await res.json()) as {
    result?: boolean;
    message?: string;
    data?: { accessToken?: string };
  };
  const token = json.data?.accessToken;
  if (!res.ok || !token) {
    throw new Error(`CJ auth failed: ${json.message ?? res.status}`);
  }
  // Refresh generously ahead of the ~15-day expiry.
  tokenCache = { token, expiresAt: Date.now() + 10 * 24 * 60 * 60 * 1000 };
  return token;
}

/** Place a dropship order with CJ. Throws on any non-success response. */
export async function createCjOrder(input: CjOrderInput): Promise<{ cjOrderId: string }> {
  if (!input.vid) {
    throw new Error(`CJ variant id (cjVid) is not set for this colour`);
  }
  const token = await getAccessToken();
  const s = input.shipping;

  const res = await fetch(`${CJ_BASE}/shopping/order/createOrderV2`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "CJ-Access-Token": token },
    body: JSON.stringify({
      orderNumber: input.orderNumber,
      shippingCountryCode: s.countryCode,
      shippingCountry: s.country,
      shippingProvince: s.province,
      shippingCity: s.city,
      shippingAddress: s.address,
      shippingAddress2: s.address2 ?? "",
      shippingCustomerName: s.name,
      shippingPhone: s.phone,
      shippingZip: s.zip,
      // CJ requires a ship-from warehouse country. Default to CN (where this
      // product's factory stock sits); override per-account via CJ_FROM_COUNTRY.
      fromCountryCode: process.env.CJ_FROM_COUNTRY || "CN",
      // CJ also requires a shipping method. CJPacket Ordinary is the standard
      // tracked global line; override via CJ_LOGISTIC_NAME per route if needed.
      logisticName: process.env.CJ_LOGISTIC_NAME || "CJPacket Ordinary",
      remark: "Usha Shop order",
      products: [{ vid: input.vid, quantity: input.quantity }],
    }),
  });
  const json = (await res.json()) as {
    result?: boolean;
    message?: string;
    data?: { orderId?: string };
  };
  if (!res.ok || json.result === false || !json.data?.orderId) {
    throw new Error(`CJ createOrder failed: ${json.message ?? res.status}`);
  }
  return { cjOrderId: json.data.orderId };
}
