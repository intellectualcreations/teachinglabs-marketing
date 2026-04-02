import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/users';
import { getStudentAnalytics } from '@/lib/analytics-store';

/**
 * GET /api/student/analytics
 * Returns analytics for the student's learning activity.
 * Demo: accepts ?studentId= query param, defaults to demo-student.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId') || 'demo-student';

  const user = getUserById(studentId);
  if (!user || user.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const analytics = getStudentAnalytics(studentId);
  return NextResponse.json({ analytics, student: user });
}
