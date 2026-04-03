import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import type { Enrollment, Profile, Assignment } from '@/lib/supabase/types';

/**
 * GET /api/teacher/class-details?classId=<uuid>
 * Returns { class, students[], assignments[], studentCount, assignmentCount }
 * Uses admin client to bypass RLS.
 */
export async function GET(request: NextRequest) {
  const classId = request.nextUrl.searchParams.get('classId');
  if (!classId) {
    return NextResponse.json({ error: 'classId required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    // 1. Fetch the class record
    const { data: classRecord, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (classError || !classRecord) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // 2. Fetch active enrollments for this class
    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select('*')
      .eq('class_id', classId)
      .eq('status', 'active');

    if (enrollError) {
      console.error('Enrollments error:', enrollError.message);
    }

    const activeEnrollments: Enrollment[] = enrollments ?? [];
    const studentIds = activeEnrollments.map((e) => e.student_id);

    // 3. Fetch student profiles
    let students: { id: string; display_name: string | null; avatar_url: string | null; enrolled_at: string }[] = [];
    if (studentIds.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', studentIds);

      if (profileError) {
        console.error('Profiles error:', profileError.message);
      }

      // Merge enrollment date with profile data
      const enrollmentMap = new Map(
        activeEnrollments.map((e) => [e.student_id, e.enrolled_at])
      );
      const profileList: Profile[] = profiles ?? [];
      students = profileList.map((p) => ({
        id: p.id,
        display_name: p.display_name,
        avatar_url: p.avatar_url,
        enrolled_at: enrollmentMap.get(p.id) ?? '',
      }));
    }

    // 4. Fetch assignments for this class
    const { data: assignments, error: assignError } = await supabase
      .from('assignments')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (assignError) {
      console.error('Assignments error:', assignError.message);
    }

    const assignmentList: Assignment[] = assignments ?? [];

    return NextResponse.json({
      class: classRecord,
      students,
      assignments: assignmentList,
      studentCount: students.length,
      assignmentCount: assignmentList.length,
    });
  } catch (err) {
    console.error('Class details error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
