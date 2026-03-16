import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/users';
import { getStudentGrades } from '@/lib/grade-store';

/**
 * GET /api/student/grades
 * Returns all graded submissions for the logged-in student.
 */
export async function GET() {
  const user = getCurrentUser('student');

  if (!user || user.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const grades = getStudentGrades(user.id);

  return NextResponse.json({ grades, student: user });
}
