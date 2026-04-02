import { NextRequest, NextResponse } from 'next/server';
import { getCourseById } from '@/lib/courses';
import { getEnrollmentsByCourse } from '@/lib/enrollment-store';
import { getUserById } from '@/lib/users';

/**
 * GET /api/courses/[id]/students
 * Returns enrolled students with their progress for a given course.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const course = getCourseById(id);

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  const enrollments = getEnrollmentsByCourse(id);

  const students = enrollments.map((e) => {
    const user = getUserById(e.studentId);
    return {
      studentId: e.studentId,
      name: user?.name || e.studentId,
      email: user?.email || '',
      enrolledAt: e.enrolledAt,
      progress: e.progress,
      status: e.status,
      completedModules: e.completedModules,
    };
  });

  return NextResponse.json({ course: { id: course.id, title: course.title }, students });
}
