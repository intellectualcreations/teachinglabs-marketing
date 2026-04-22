import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Profanity blocklist (same as student profile API)
const BLOCKED_WORDS = [
  'ass', 'asshole', 'bastard', 'bitch', 'bullshit', 'crap', 'cunt',
  'damn', 'dick', 'dumbass', 'fag', 'fuck', 'goddamn', 'hell',
  'jackass', 'nigger', 'nigga', 'piss', 'pussy', 'retard', 'shit',
  'slut', 'whore', 'cock', 'penis', 'vagina', 'boob', 'tits',
  'stfu', 'wtf', 'lmfao', 'milf',
];

function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase().replace(/[^a-z]/g, ' ');
  return BLOCKED_WORDS.some(word => {
    const regex = new RegExp(`\\b${word}\\b`);
    return regex.test(lower);
  });
}

/**
 * GET /api/teacher/student-detail?studentId=<uuid>&teacherId=<uuid>
 * Returns { profile, assessment, enrollments: [{class_id, class_name, enrolled_at}] }
 * Uses admin client to bypass RLS.
 */
export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get('studentId');
  const teacherId = request.nextUrl.searchParams.get('teacherId');

  if (!studentId || !teacherId) {
    return NextResponse.json(
      { error: 'studentId and teacherId are required' },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  try {
    // 1. Get student profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', studentId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // 2. Get student assessment data (table may not exist yet)
    let assessment = null;
    try {
      const { data: assessmentData } = await supabase
        .from('student_assessments')
        .select('*')
        .eq('student_id', studentId)
        .single();
      assessment = assessmentData;
    } catch {
      // Table may not exist yet
    }

    // 2b. Get the generic per-question assessment responses
    let responses: any[] = [];
    try {
      const { data: respData } = await (supabase as any)
        .from('assessment_responses')
        .select('*')
        .eq('student_id', studentId)
        .order('question_order', { ascending: true });
      responses = respData ?? [];
    } catch {
      // Table may not exist yet (migration 014 not applied)
    }

    // 3. Get enrollments for this student in this teacher's classes
    const { data: classes } = await supabase
      .from('classes')
      .select('id, name')
      .eq('teacher_id', teacherId);

    const teacherClasses = classes ?? [];
    let enrollments: { class_id: string; class_name: string; enrolled_at: string }[] = [];

    if (teacherClasses.length > 0) {
      const classIds = teacherClasses.map((c: { id: string }) => c.id);
      const classMap = new Map(teacherClasses.map((c: { id: string; name: string }) => [c.id, c.name]));

      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select('class_id, enrolled_at')
        .eq('student_id', studentId)
        .in('class_id', classIds)
        .eq('status', 'active');

      enrollments = (enrollmentData ?? []).map((e: { class_id: string; enrolled_at: string }) => ({
        class_id: e.class_id,
        class_name: classMap.get(e.class_id) || 'Unknown Class',
        enrolled_at: e.enrolled_at,
      }));
    }

    return NextResponse.json({ profile, assessment, enrollments, responses });
  } catch (err) {
    console.error('Student detail API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/teacher/student-detail
 * Teacher can update a student's preferred_name (override).
 * Body: { studentId, teacherId, preferred_name }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, teacherId, preferred_name, flagged } = body;

    if (!studentId || !teacherId || typeof preferred_name !== 'string') {
      return NextResponse.json(
        { error: 'studentId, teacherId, and preferred_name are required' },
        { status: 400 }
      );
    }

    const name = preferred_name.trim().slice(0, 50);
    if (containsProfanity(name)) {
      return NextResponse.json(
        { error: 'That name contains inappropriate language.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify teacher has this student in one of their classes
    const { data: classes } = await supabase
      .from('classes')
      .select('id')
      .eq('teacher_id', teacherId);

    if (!classes || classes.length === 0) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', studentId)
      .in('class_id', classes.map((c: { id: string }) => c.id))
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();

    if (!enrollment) {
      return NextResponse.json({ error: 'Student not in your classes' }, { status: 403 });
    }

    const updateData: Record<string, unknown> = { preferred_name: name };
    if (flagged) {
      updateData.name_flagged = true;
    }
    const { error } = await supabase
      .from('profiles')
      .update(updateData as never)
      .eq('id', studentId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Teacher name override error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
