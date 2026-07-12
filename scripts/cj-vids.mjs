// One-off helper: list CJ variant IDs (VID) per colour for a product.
// The VIDs are what src/lib/product.ts needs in each colour's `cjVid`.
//
// Your CJ API key stays in your terminal — it is never printed. Only the
// (non-secret) colour → VID mapping is shown, which you can paste back.
//
// Usage (chest rig is the default product):
//   CJ_API_EMAIL="you@usha.se" CJ_API_KEY="your-cj-api-key" node scripts/cj-vids.mjs
//
// Override the product if needed:
//   CJ_PID="2509230333571626900" ... node scripts/cj-vids.mjs
//   CJ_SKU="CJYD2538710"          ... node scripts/cj-vids.mjs

const BASE = "https://developers.cjdropshipping.com/api2.0/v1";
const PID = process.env.CJ_PID || "2509230333571626900"; // chest rig CJ product id
const SKU = process.env.CJ_SKU || "CJYD2538710"; // chest rig SPU (fallback)

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
  console.error("(Note: getAccessToken is rate-limited to ~1 call / 5 min.)");
  process.exit(1);
}

const query = (url) =>
  fetch(url, { headers: { "CJ-Access-Token": token } }).then((r) => r.json());

// Prefer the SKU query when CJ_SKU is explicitly given without CJ_PID —
// otherwise the default chest-rig PID wins and returns the wrong product.
const preferSku = !!process.env.CJ_SKU && !process.env.CJ_PID;
const byPid = () => query(`${BASE}/product/query?pid=${encodeURIComponent(PID)}`);
const bySku = () => query(`${BASE}/product/query?productSku=${encodeURIComponent(SKU)}`);
let res = await (preferSku ? bySku() : byPid());
let variants = res?.data?.variants;
if (!variants || !variants.length) {
  res = await (preferSku ? byPid() : bySku());
  variants = res?.data?.variants;
}

if (!variants || !variants.length) {
  console.error("No variants found. Raw response:");
  console.error(JSON.stringify(res, null, 2).slice(0, 1200));
  process.exit(1);
}

for (const v of variants) {
  const name = (v.variantKey || v.variantNameEn || v.variantName || "?").toString();
  const img = v.variantImage || v.variantImg || (Array.isArray(v.variantImages) ? v.variantImages[0] : "") || "";
  console.log(`${name}\t${v.vid}\t${img}`);
}
console.log(
  "\n(Each line: colour <tab> VID <tab> image URL. Paste the whole block back to Claude — none of it is secret.)\n"
);
