// ---------------------------------------------------------------------------
// Read-only bridge to the Usha Platform (usha.se) auth session.
//
// Phase 1 of the shop↔platform integration: when a logged-in platform user
// visits shop.usha.se, the Supabase auth cookie is shared across the parent
// domain (".usha.se", enabled via NEXT_PUBLIC_COOKIE_DOMAIN on both apps). This
// lets the shop *read* who they are — to prefill their email at checkout — WITHOUT
// ever mutating the session: set/remove are deliberately no-ops so the shop can
// never refresh, rotate, or clear the platform's auth cookies.
//
// Fully gated on env: if the Supabase URL / anon key aren't configured on the
// shop project, getPlatformUser() returns null and everything stays guest-only.
// ---------------------------------------------------------------------------
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { MemberTier } from "./member-discount";

export interface PlatformUser {
  id: string;
  email: string | null;
  name: string | null;
  /** Membership tier from the platform's profiles table (drives shop discounts). */
  tier: MemberTier;
}

export function isPlatformAuthConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Returns the logged-in platform user (verified via Supabase), or null for a
 * guest / when auth isn't configured. Never throws — any error means "guest".
 */
export async function getPlatformUser(): Promise<PlatformUser | null> {
  if (!isPlatformAuthConfigured()) return null;

  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const value = cookieStore.get(name)?.value;
            // Skip a corrupt unchunked session cookie (base64- prefixed) to avoid
            // "Invalid UTF-8" crashes; leave chunk fragments (name ".0", ".1", …)
            // and non-prefixed cookies untouched — mirrors the platform's guard.
            if (value && value.startsWith("base64-") && !/\.\d+$/.test(name)) {
              try {
                atob(value.slice(7).replace(/-/g, "+").replace(/_/g, "/"));
              } catch {
                return undefined;
              }
            }
            return value;
          },
          // Read-only: never write to the platform's auth cookies.
          set() {},
          remove() {},
        },
      },
    );

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;

    const meta = data.user.user_metadata ?? {};
    const name =
      (meta.full_name as string | undefined) ??
      (meta.name as string | undefined) ??
      null;

    // Membership tier lives on the platform's profiles table; RLS scopes the
    // read to the user's own row. Default to "gratis" on any miss.
    const { data: profile } = await supabase
      .from("profiles")
      .select("tier")
      .eq("id", data.user.id)
      .single();
    const tier = ((profile?.tier as MemberTier | undefined) ?? "gratis") as MemberTier;

    return { id: data.user.id, email: data.user.email ?? null, name, tier };
  } catch {
    return null;
  }
}
