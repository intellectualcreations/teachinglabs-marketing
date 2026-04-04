import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

/**
 * GET /api/student/debug-auth
 * Debug endpoint to check what auth methods work.
 */
export async function GET(request: NextRequest) {
  const results: Record<string, unknown> = {};

  // Check cookies
  const cookieHeader = request.headers.get('cookie') || '';
  results.hasCookies = cookieHeader.length > 0;
  results.cookieNames = cookieHeader.split(';').map(c => c.trim().split('=')[0]).filter(Boolean);

  // Method 1: Cookie-based session
  try {
    const userSupabase = await createClient();
    const { data: { user }, error } = await userSupabase.auth.getUser();
    results.cookieAuth = user ? { userId: user.id, email: user.email } : null;
    results.cookieAuthError = error?.message || null;
  } catch (err) {
    results.cookieAuth = null;
    results.cookieAuthError = String(err);
  }

  // Method 2: Authorization header
  const authHeader = request.headers.get('authorization');
  results.hasAuthHeader = !!authHeader;
  results.authHeaderPrefix = authHeader?.substring(0, 10) || null;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    results.tokenLength = token.length;
    try {
      const admin = createAdminClient();
      const { data: { user }, error } = await admin.auth.getUser(token);
      results.tokenAuth = user ? { userId: user.id, email: user.email } : null;
      results.tokenAuthError = error?.message || null;
    } catch (err) {
      results.tokenAuth = null;
      results.tokenAuthError = String(err);
    }
  }

  return NextResponse.json(results);
}
