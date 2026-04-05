import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/teacher/dashboard?teacherId=<uuid>
 * Returns { profile, classes, students[] } for the teacher dashboard.
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
      .select('*')
      .eq('id', teacherId)
      .single();

    if (profileError) {
      console.error('Dashboard profile error:', profileError.message);
    }

    // Fetch teacher's classes
    const { data: classes, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (classError) {
      console.error('Dashboard classes error:', classError.message);
      return NextResponse.json({ error: classError.message }, { status: 500 });
    }

    const teacherClasses = classes ?? [];

    if (teacherClasses.length === 0) {
      return NextResponse.json({ profile, classes: [], students: [] });
    }

    const classIds = teacherClasses.map((c: { id: string }) => c.id);

    // Fetch enrollments
    const { data: enrollmentData } = await supabase
      .from('enrollments')
      .select('student_id, class_id, enrolled_at, status')
      .in('class_id', classIds)
      .eq('status', 'active');

    const enrollments = enrollmentData ?? [];

    if (enrollments.length === 0) {
      return NextResponse.json({ profile, classes: teacherClasses, students: [] });
    }

    // Get unique student IDs and fetch their profiles
    const studentIds = [...new Set(enrollments.map((e: { student_id: string }) => e.student_id))];
    const { data: studentProfiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', studentIds);

    // Fetch activity chat stats via activity_id → class_activities join
    // Get activity IDs that belong to these classes
    const { data: classActivityRows } = await (supabase as any)
      .from('class_activities')
      .select('activity_id')
      .in('class_id', classIds);
    const classActivityIds = (classActivityRows ?? []).map((r: any) => r.activity_id);

    // Also get assignments created by this teacher (they may not be in class_activities yet)
    const { data: teacherAssignments } = await (supabase as any)
      .from('assignments')
      .select('id')
      .eq('teacher_id', teacherId);
    const teacherActivityIds = (teacherAssignments ?? []).map((a: any) => a.id);

    const allActivityIds = [...new Set([...classActivityIds, ...teacherActivityIds])];

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();

    let chatMessages: any[] = [];
    if (allActivityIds.length > 0) {
      const { data } = await (supabase as any)
        .from('activity_chats')
        .select('id, student_id, activity_id, created_at')
        .in('activity_id', allActivityIds)
        .eq('role', 'user')
        .gte('created_at', todayISO);
      chatMessages = data ?? [];
    }

    const totalInteractions = chatMessages.length;

    // Unique student+activity combos = sessions
    const sessionSet = new Set(chatMessages.map((m: any) => `${m.student_id}-${m.activity_id}`));
    const chatSessions = sessionSet.size;

    // Activity by hour (today, 8am–3pm)
    const hourBuckets: number[] = Array(8).fill(0);
    for (const msg of chatMessages) {
      const h = new Date(msg.created_at).getHours();
      const idx = h - 8;
      if (idx >= 0 && idx < 8) hourBuckets[idx]++;
    }

    // Active students this week
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    let weekChats: any[] = [];
    if (allActivityIds.length > 0) {
      const { data } = await (supabase as any)
        .from('activity_chats')
        .select('student_id')
        .in('activity_id', allActivityIds)
        .gte('created_at', weekAgo);
      weekChats = data ?? [];
    }
    const activeStudentIds = new Set(weekChats.map((m: any) => m.student_id));
    const activeThisWeek = activeStudentIds.size;

    return NextResponse.json({
      profile,
      classes: teacherClasses,
      students: studentProfiles ?? [],
      enrollments,
      totalInteractions,
      chatSessions,
      activityByHour: hourBuckets,
      activeThisWeek,
      totalStudents: studentIds.length,
    });
  } catch (err) {
    console.error('Dashboard API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
