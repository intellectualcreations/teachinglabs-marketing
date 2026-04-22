import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/classes/lookup?code=BJB644
 * Public endpoint — validates a class join code and returns class info.
 * Uses service role to bypass RLS (classes table has recursive policy issues).
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')?.trim();
  if (!code || code.length < 4) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('classes')
    .select(`
      id, name, subject, join_code,
      teacher:profiles!classes_teacher_id_fkey ( display_name, preferred_name, first_name, last_name, classroom_name ),
      school:schools!classes_school_id_fkey ( name )
    `)
    .ilike('join_code', code)
    .single();

  if (error || !data) {
    return NextResponse.json({ found: false }, { status: 200 });
  }

  const row = data as unknown as Record<string, unknown>;
  const teacher = row.teacher as { display_name?: string; preferred_name?: string; first_name?: string; last_name?: string; classroom_name?: string } | null;
  const school = row.school as { name?: string } | null;

  return NextResponse.json({
    found: true,
    classInfo: {
      id: data.id,
      name: data.name,
      subject: data.subject,
      teacherName: teacher?.classroom_name
        || (teacher?.last_name ? `Mrs. ${teacher.last_name}` : teacher?.preferred_name || teacher?.display_name || 'Teacher'),
      schoolName: school?.name ?? null,
    },
  });
}
