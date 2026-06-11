// Lightweight in-memory sliding-window rate limiter.
//
// On Vercel each serverless instance keeps its own window, so the effective
// global limit is (limit × warm instances) — still a meaningful brake on
// abuse from a single IP, which lands on the same warm instance most of the
// time. For a hard global limit swap this for Upstash/Vercel KV later.

type Bucket = { timestamps: number[] };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();

  // Cheap protection against unbounded memory growth from spoofed keys.
  if (buckets.size > MAX_BUCKETS) buckets.clear();

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(key, bucket);
  }

  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0];
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((oldest + windowMs - now) / 1000),
    };
  }

  bucket.timestamps.push(now);
  return { ok: true, retryAfterSeconds: 0 };
}

// Client IP as seen by Vercel's proxy. x-forwarded-for's first hop is the
// real client; fall back to x-real-ip, then a shared bucket.
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
