// Lightweight in-memory rate limiter. Per-instance on serverless (resets on cold
// start), so it's a burst/abuse guard rather than a global quota — good enough
// to stop a single client hammering /api/checkout (creates a Stripe session per
// call) or /api/me. Promote to a shared store (Upstash/Vercel KV) if abuse grows.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}

export function clientKey(req: Request, prefix: string): string {
  // Prefer x-real-ip (Vercel-set true client IP); the leftmost x-forwarded-for
  // entry is client-spoofable, so use the last entry as a fallback.
  const realIp = req.headers.get("x-real-ip")?.trim();
  const xffLast = req.headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .pop();
  return `${prefix}:${realIp || xffLast || "unknown"}`;
}
