import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';

/**
 * POST /api/student/join-class
 * Body: { joinCode: string }
 * Enrolls the authenticated student in a class by join code.
 * Auth: tries cookie-based session first, falls back to Authorization header.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const joinCode = (body.joinCode ?? '').trim().toUpperCase();

  if (!joinCode) {
    return NextResponse.json({ error: 'joinCode required' }, { status: 400 });
  }

  const admin = createAdminClient();
  let userId: string | null = null;

  // Method 1: Cookie-based session
  try {
    const userSupabase = await createClient();
    const { data: { user } } = await userSupabase.auth.getUser();
    if (user) userId = user.id;
  } catch { /* try header */ }

  // Method 2: Authorization header — use admin client to verify JWT
  if (!userId) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { data: { user }, error } = await admin.auth.getUser(token);
      if (!error && user) userId = user.id;
    }
  }

  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Look up class by join code (bypasses RLS)
  const { data: cls, error: clsErr } = await admin
    .from('classes')
    .select('id, name, requires_approval')
    .eq('join_code', joinCode)
    .single();

  if (clsErr || !cls) {
    return NextResponse.json({ error: 'Invalid class code. Check with your teacher and try again.' }, { status: 404 });
  }

  const classId = (cls as { id: string; name: string; requires_approval: boolean }).id;
  const className = (cls as { id: string; name: string; requires_approval: boolean }).name;
  const requiresApproval = (cls as { id: string; name: string; requires_approval: boolean }).requires_approval;

  // Check if already enrolled
  const { data: existing } = await admin
    .from('enrollments')
    .select('id')
    .eq('student_id', userId)
    .eq('class_id', classId)
    .single();

  if (existing) {
    return NextResponse.json({ error: `Already enrolled in ${className}` }, { status: 409 });
  }

  // Enroll via admin (bypasses RLS)
  // If class requires approval, set status to 'pending' instead of 'active'
  const enrollStatus = requiresApproval ? 'pending' : 'active';
  const { error: enrollErr } = await admin
    .from('enrollments')
    .insert({ student_id: userId, class_id: classId, status: enrollStatus } as never);

  if (enrollErr) {
    console.error('Enrollment error:', enrollErr.message);
    return NextResponse.json({ error: 'Could not enroll' }, { status: 500 });
  }

  if (requiresApproval) {
    return NextResponse.json({
      success: true,
      className,
      status: 'pending',
      message: `Your request to join ${className} has been sent to your teacher for approval.`,
    });
  }

  return NextResponse.json({ success: true, className, status: 'active' });
}
