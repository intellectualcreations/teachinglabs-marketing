import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/teacher/profile?teacherId=<uuid>
 * Returns { profile, school } for the settings page.
 * Uses admin client to bypass RLS.
 */
export async function GET(request: NextRequest) {
  const teacherId = request.nextUrl.searchParams.get('teacherId');
  if (!teacherId) {
    return NextResponse.json({ error: 'teacherId required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, first_name, last_name, role, school_id, preferred_name')
      .eq('id', teacherId)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError.message);
      return NextResponse.json({ profile: null, school: null });
    }

    let school = null;
    const p = profile as { school_id?: string } | null;
    if (p?.school_id) {
      const { data: schoolData } = await supabase
        .from('schools')
        .select('name')
        .eq('id', p.school_id)
        .single();
      school = schoolData;
    }

    return NextResponse.json({ profile, school });
  } catch (err) {
    console.error('Profile API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/teacher/profile
 * Body: { teacherId, display_name?, preferred_name? }
 * Updates teacher profile fields.
 */
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { teacherId, ...updates } = body;

  if (!teacherId) {
    return NextResponse.json({ error: 'teacherId required' }, { status: 400 });
  }

  // Only allow safe fields
  const allowed: Record<string, string | null> = {};
  if (typeof updates.display_name === 'string') allowed.display_name = updates.display_name;
  if (typeof updates.preferred_name === 'string') allowed.preferred_name = updates.preferred_name;
  // Student-facing identity fields
  if ('classroom_name' in updates) allowed.classroom_name = updates.classroom_name ? String(updates.classroom_name).slice(0, 60) : null;
  if ('twin_name' in updates) allowed.twin_name = updates.twin_name ? String(updates.twin_name).slice(0, 60) : null;
  if ('twin_tagline' in updates) allowed.twin_tagline = updates.twin_tagline ? String(updates.twin_tagline).slice(0, 120) : null;

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('profiles')
    .update(allowed as never)
    .eq('id', teacherId);

  if (error) {
    console.error('Profile update error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
