import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/student/join-class
 * Body: { joinCode: string }
 * Enrolls the authenticated student in a class by join code.
 * Uses admin client to bypass RLS on classes table.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const joinCode = (body.joinCode ?? '').trim().toUpperCase();

  if (!joinCode) {
    return NextResponse.json({ error: 'joinCode required' }, { status: 400 });
  }

  // Get the authenticated user from the user's session
  const userSupabase = await createClient();
  const { data: { user }, error: authErr } = await userSupabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const admin = createAdminClient();

  // Look up class by join code (bypasses RLS)
  const { data: cls, error: clsErr } = await admin
    .from('classes')
    .select('id, name')
    .eq('join_code', joinCode)
    .single();

  if (clsErr || !cls) {
    return NextResponse.json({ error: 'Invalid class code' }, { status: 404 });
  }

  const classId = (cls as { id: string; name: string }).id;
  const className = (cls as { id: string; name: string }).name;

  // Check if already enrolled
  const { data: existing } = await admin
    .from('enrollments')
    .select('id')
    .eq('student_id', user.id)
    .eq('class_id', classId)
    .single();

  if (existing) {
    return NextResponse.json({ error: `Already enrolled in ${className}` }, { status: 409 });
  }

  // Enroll via admin (bypasses RLS)
  const { error: enrollErr } = await admin
    .from('enrollments')
    .insert({ student_id: user.id, class_id: classId, status: 'active' } as never);

  if (enrollErr) {
    console.error('Enrollment error:', enrollErr.message);
    return NextResponse.json({ error: 'Could not enroll' }, { status: 500 });
  }

  return NextResponse.json({ success: true, className });
}
