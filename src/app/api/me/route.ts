import { NextResponse } from "next/server";
import { getPlatformUser } from "@/lib/platform-session";
import { memberDiscountPercent } from "@/lib/member-discount";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Same-origin endpoint the storefront calls client-side to learn whether the
// visitor is a logged-in Usha Platform member and what discount they get. Keeps
// the product pages static (they don't read cookies) while the banner hydrates
// from here. Returns discountPercent 0 for guests / when discounts are disabled.
export async function GET(req: Request) {
  const { rateLimit, clientKey } = await import("@/lib/rate-limit");
  if (!rateLimit(clientKey(req, "me"), 60, 60_000)) {
    return NextResponse.json(
      { signedIn: false, name: null, tier: null, discountPercent: 0 },
      { status: 429, headers: { "Cache-Control": "no-store" } },
    );
  }

  const user = await getPlatformUser();
  const discountPercent = memberDiscountPercent(user?.tier);
  return NextResponse.json(
    {
      signedIn: Boolean(user),
      name: user?.name ?? user?.email ?? null,
      tier: user?.tier ?? null,
      discountPercent,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
