import { NextRequest, NextResponse } from 'next/server';
import { getAdminAnalytics } from '@/lib/analytics-store';

/**
 * GET /api/admin/analytics
 * Returns platform-wide analytics for admin dashboard.
 * Demo: no auth check (demo mode).
 */
export async function GET(_request: NextRequest) {
  const analytics = getAdminAnalytics();
  return NextResponse.json({ analytics });
}
