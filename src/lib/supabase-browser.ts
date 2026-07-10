"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser-side, READ-ONLY view of the shared Usha Platform session, used purely
// to display "signed in as …" in the storefront. Network is disabled
// (autoRefreshToken false) so it only reads the existing .usha.se cookie via
// getSession() — no token refresh, no calls to Supabase, so no CSP changes and
// no risk of the shop mutating the platform's auth state.
//
// Returns null when Supabase env isn't configured on the shop (guest-only).
export function createPlatformBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  return createBrowserClient(url, anon, {
    cookieOptions: process.env.NEXT_PUBLIC_COOKIE_DOMAIN
      ? { domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN }
      : undefined,
    auth: {
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}
