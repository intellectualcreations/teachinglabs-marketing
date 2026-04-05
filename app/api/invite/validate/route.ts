import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/invite/validate
 * Body: { code: string }
 * Returns: { valid: boolean, role?: string, message?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, message: 'Invite code required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await (supabase as any)
      .from('invite_codes')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .single();

    if (error || !data) {
      return NextResponse.json({ valid: false, message: 'Invalid invite code' });
    }

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, message: 'This invite code has expired' });
    }

    // Check uses
    if (data.use_count >= data.max_uses) {
      return NextResponse.json({ valid: false, message: 'This invite code has already been used' });
    }

    return NextResponse.json({ valid: true, role: data.role });
  } catch (err) {
    console.error('Invite validate error:', err);
    return NextResponse.json({ valid: false, message: 'Something went wrong' }, { status: 500 });
  }
}
