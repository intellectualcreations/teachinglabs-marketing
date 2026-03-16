/**
 * Health check endpoint.
 * FLU-215: Production hardening
 *
 * GET /api/health → { status, timestamp, version, uptime }
 * Rate limited: 100 req/min per IP.
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

const startTime = Date.now();

// Read version from package.json at module load
const APP_VERSION = process.env.npm_package_version || '0.1.0';

export async function GET(req: NextRequest) {
  const limit = rateLimit(req);

  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Remaining': String(limit.remaining),
        },
      }
    );
  }

  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: APP_VERSION,
      uptime: Math.floor((Date.now() - startTime) / 1000),
    },
    {
      headers: {
        'X-RateLimit-Remaining': String(limit.remaining),
      },
    }
  );
}
