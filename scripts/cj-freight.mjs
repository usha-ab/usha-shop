// Diagnose CJ fulfillment: list the shipping lines CJ actually offers for a
// given variant + destination, and (optionally) print what createOrderV2
// returns. Use this to pick a valid `logisticName`.
//
// Your CJ API key stays in your terminal. Output (line names, prices, and any
// CJ error message) is not secret — paste it back to Claude.
//
// Usage (defaults: olive chest-rig VID, CN -> SE):
//   CJ_API_EMAIL="you@usha.se" CJ_API_KEY="your-key" node scripts/cj-freight.mjs
//
// Override:
//   CJ_VID="2509230333571627800" CJ_TO="SE" CJ_ZIP="112 17" ... node scripts/cj-freight.mjs

const BASE = "https://developers.cjdropshipping.com/api2.0/v1";
const VID = process.env.CJ_VID || "2509230333571627800"; // chest rig, olive
const FROM = process.env.CJ_FROM || "CN";
const TO = process.env.CJ_TO || "SE";
const ZIP = process.env.CJ_ZIP || "112 17";
const QTY = Number(process.env.CJ_QTY || "1");

const email = process.env.CJ_API_EMAIL;
const apiKey = process.env.CJ_API_KEY;
if (!email || !apiKey) {
  console.error("Set CJ_API_EMAIL and CJ_API_KEY env vars first.");
  process.exit(1);
}

const auth = await fetch(`${BASE}/authentication/getAccessToken`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, apiKey }),
}).then((r) => r.json());
const token = auth?.data?.accessToken;
if (!token) {
  console.error("CJ auth failed:", auth?.message || JSON.stringify(auth).slice(0, 300));
  process.exit(1);
}

// 1) Freight options for this variant -> destination
const freight = await fetch(`${BASE}/logistic/freightCalculate`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "CJ-Access-Token": token },
  body: JSON.stringify({
    startCountryCode: FROM,
    endCountryCode: TO,
    zip: ZIP,
    products: [{ quantity: QTY, vid: VID }],
  }),
}).then((r) => r.json());

console.log("\n=== Freight options (" + FROM + " -> " + TO + ") ===");
if (Array.isArray(freight?.data) && freight.data.length) {
  for (const o of freight.data) {
    console.log(`  logisticName: "${o.logisticName}"   price: ${o.logisticPrice}  aging: ${o.logisticAging || "?"} days`);
  }
} else {
  console.log("  No options returned. Raw response:");
  console.log("  " + JSON.stringify(freight).slice(0, 800));
}

// 2) Actually attempt createOrderV2 with the same params the webhook uses,
//    and print CJ's raw response so we see the exact error (or the orderId).
const logisticName = process.env.CJ_LOGISTIC_NAME || "CJPacket Ordinary";
const orderBody = {
  orderNumber: "diag-" + Date.now(),
  shippingCountryCode: TO,
  shippingCountry: "Sweden",
  shippingProvince: "Stockholm",
  shippingCity: "Stockholm",
  shippingAddress: "Testgatan 1",
  shippingAddress2: "",
  shippingCustomerName: "Diagnostic Test",
  shippingPhone: "+46700000000",
  shippingZip: ZIP,
  fromCountryCode: FROM,
  logisticName,
  remark: "diagnostic — cancel me",
  products: [{ vid: VID, quantity: QTY }],
};

console.log(`\n=== createOrderV2 attempt (logisticName="${logisticName}") ===`);
const orderRes = await fetch(`${BASE}/shopping/order/createOrderV2`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "CJ-Access-Token": token },
  body: JSON.stringify(orderBody),
}).then((r) => r.json());
console.log("  result : " + orderRes?.result);
console.log("  message: " + orderRes?.message);
console.log("  orderId: " + (orderRes?.data?.orderId || "(none)"));
if (orderRes?.result !== true) {
  console.log("  raw    : " + JSON.stringify(orderRes).slice(0, 700));
}
console.log("\nPaste this whole output back to Claude. (If an order WAS created, it's a diagnostic — cancel it in CJ.)\n");
