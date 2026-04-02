/**
 * In-memory sliding window rate limiter.
 * FLU-215: Production hardening
 *
 * Default: 100 requests per 60-second window per IP.
 */

import { NextRequest } from 'next/server';

interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
}

const ipRecords = new Map<string, number[]>();

// Clean up stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [ip, timestamps] of ipRecords.entries()) {
    const valid = timestamps.filter((t) => t > cutoff);
    if (valid.length === 0) {
      ipRecords.delete(ip);
    } else {
      ipRecords.set(ip, valid);
    }
  }
}

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  );
}

export function rateLimit(
  req: NextRequest,
  options: RateLimitOptions = {}
): RateLimitResult {
  const { windowMs = 60_000, maxRequests = 100 } = options;
  const now = Date.now();
  const ip = getIP(req);
  const cutoff = now - windowMs;

  cleanup(windowMs);

  const timestamps = (ipRecords.get(ip) || []).filter((t) => t > cutoff);
  timestamps.push(now);
  ipRecords.set(ip, timestamps);

  const remaining = Math.max(0, maxRequests - timestamps.length);

  return {
    success: timestamps.length <= maxRequests,
    remaining,
  };
}
