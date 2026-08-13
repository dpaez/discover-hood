import type { NextRequest } from "next/server";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

const LIMIT = 10; // requests
const WINDOW_MS = 1000 * 60; // per minute

function getClientIp(request: NextRequest | Request): string {
  const headers = request.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit(
  request: NextRequest | Request,
  {
    limit = LIMIT,
    windowMs = WINDOW_MS,
    prefix = "scores",
  }: { limit?: number; windowMs?: number; prefix?: string } = {},
): { rateLimited: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = `${prefix}:${getClientIp(request)}`;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { rateLimited: false, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { rateLimited: true, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return {
    rateLimited: false,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}