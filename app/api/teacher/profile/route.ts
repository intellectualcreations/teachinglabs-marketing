import { NextRequest, NextResponse } from 'next/server';
import { requireTeacher } from '@/lib/api-auth';

/**
 * GET /api/teacher/profile
 * Returns { profile, school } for the authenticated teacher.
 * Any `teacherId` query param is ignored.
 */
export async function GET(request: NextRequest) {
  const auth = await requireTeacher(request);
  if ('error' in auth) return auth.error;
  const { user, admin: supabase } = auth;
  const teacherId = user.id;

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
 * Body: { display_name?, preferred_name?, ... }
 * Updates the authenticated teacher's profile fields. Any `teacherId`
 * in the body is ignored.
 */
export async function PATCH(request: NextRequest) {
  const auth = await requireTeacher(request);
  if ('error' in auth) return auth.error;
  const { user, admin: supabase } = auth;
  const teacherId = user.id;

  const body = await request.json();
  const { teacherId: _ignoredTeacherId, ...updates } = body;
  void _ignoredTeacherId;

  // Only allow safe fields
  const allowed: Record<string, string | null> = {};
  if (typeof updates.display_name === 'string') allowed.display_name = updates.display_name;
  if (typeof updates.preferred_name === 'string') allowed.preferred_name = updates.preferred_name;
  // Student-facing identity fields (legacy single strings)
  if ('classroom_name' in updates) allowed.classroom_name = updates.classroom_name ? String(updates.classroom_name).slice(0, 60) : null;
  if ('twin_name' in updates) allowed.twin_name = updates.twin_name ? String(updates.twin_name).slice(0, 60) : null;
  if ('twin_tagline' in updates) allowed.twin_tagline = updates.twin_tagline ? String(updates.twin_tagline).slice(0, 120) : null;
  // Student-facing identity fields (structured parts). We sanitize each piece.
  const clean = (v: any, maxLen: number): string | null => {
    if (v === null) return null;
    if (typeof v !== 'string') return null;
    const cleaned = v.trim().replace(/\s+/g, ' ').slice(0, maxLen).replace(/[\n\r\t]/g, '');
    return cleaned || null;
  };
  const cleanAndStripAi = (v: any, maxLen: number): string | null => {
    const c = clean(v, maxLen);
    if (!c) return null;
    return c.replace(/^AI\s+/i, '') || null;
  };
  if ('classroom_title' in updates) allowed.classroom_title = clean(updates.classroom_title, 20);
  if ('classroom_surname' in updates) allowed.classroom_surname = clean(updates.classroom_surname, 40);
  if ('twin_clarifier' in updates) allowed.twin_clarifier = cleanAndStripAi(updates.twin_clarifier, 30);
  if ('twin_unique_name' in updates) allowed.twin_unique_name = cleanAndStripAi(updates.twin_unique_name, 30);

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

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
