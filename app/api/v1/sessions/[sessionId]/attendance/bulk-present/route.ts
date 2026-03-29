import { NextRequest, NextResponse } from 'next/server';
import { getSession, markAttendance } from '@/lib/attendance-store';
import { getEnrollmentsByCourse } from '@/lib/enrollment-store';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const enrollments = getEnrollmentsByCourse(session.courseId);
  if (enrollments.length === 0) {
    return NextResponse.json({ error: 'No enrolled students found' }, { status: 404 });
  }

  const results = enrollments.map((e) => markAttendance(sessionId, e.studentId, 'present'));
  return NextResponse.json({ marked: results.length, records: results }, { status: 201 });
}
