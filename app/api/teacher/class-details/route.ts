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

    // 2. Fetch all enrollments for this class (active + pending)
    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select('*')
      .eq('class_id', classId)
      .in('status', ['active', 'pending']);

    if (enrollError) {
      console.error('Enrollments error:', enrollError.message);
    }

    const allEnrollments: Enrollment[] = enrollments ?? [];
    const activeEnrollments = allEnrollments.filter(e => e.status === 'active');
    const pendingEnrollments = allEnrollments.filter(e => e.status === 'pending');
    const studentIds = allEnrollments.map((e) => e.student_id);

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

      // Merge enrollment data with profile data
      const enrollmentMap = new Map(
        allEnrollments.map((e) => [e.student_id, { enrolled_at: e.enrolled_at, status: e.status, enrollment_id: e.id }])
      );
      const profileList: Profile[] = profiles ?? [];
      students = profileList.map((p) => {
        const enr = enrollmentMap.get(p.id);
        return {
          id: p.id,
          display_name: p.display_name,
          avatar_url: p.avatar_url,
          enrolled_at: enr?.enrolled_at ?? '',
          enrollment_status: enr?.status ?? 'active',
          enrollment_id: enr?.enrollment_id ?? '',
        };
      });
    }

    // 4. Fetch assignments for this class via junction table (include is_open, due_date)
    const { data: classActivityRows } = await supabase
      .from('class_activities')
      .select('activity_id, is_open, due_date')
      .eq('class_id', classId);

    const activityIds = (classActivityRows ?? []).map((r: any) => r.activity_id);
    // Build map of activity_id -> { is_open, due_date }
    const caMap = new Map<string, { is_open: boolean; due_date: string | null }>();
    for (const r of (classActivityRows ?? []) as any[]) {
      caMap.set(r.activity_id, { is_open: r.is_open, due_date: r.due_date });
    }

    let assignmentList: any[] = [];
    if (activityIds.length > 0) {
      const { data: acts, error: assignError } = await supabase
        .from('assignments')
        .select('*')
        .in('id', activityIds)
        .order('created_at', { ascending: false });
      if (assignError) {
        console.error('Assignments error:', assignError.message);
      }
      // Merge junction table fields
      assignmentList = (acts ?? []).map((a: any) => ({
        ...a,
        is_open: caMap.get(a.id)?.is_open ?? true,
        due_date: caMap.get(a.id)?.due_date ?? null,
      }));
    }

    return NextResponse.json({
      class: classRecord,
      students,
      assignments: assignmentList,
      studentCount: activeEnrollments.length,
      pendingCount: pendingEnrollments.length,
      assignmentCount: assignmentList.length,
    });
  } catch (err) {
    console.error('Class details error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
