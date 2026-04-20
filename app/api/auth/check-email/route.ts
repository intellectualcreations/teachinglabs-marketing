import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/check-email
 * Checks if an email is registered in the system.
 * Returns { exists: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check auth.users via admin API
    const { data } = await supabase.auth.admin.listUsers();
    const exists = data?.users?.some(
      (u: { email?: string }) => u.email?.toLowerCase() === email.trim().toLowerCase()
    ) ?? false;

    return NextResponse.json({ exists });
  } catch (err) {
    console.error('[check-email] Error:', err);
    // On error, allow the flow to continue (fail open for UX)
    return NextResponse.json({ exists: true });
  }
}
