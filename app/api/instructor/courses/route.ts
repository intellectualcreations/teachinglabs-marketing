import { NextRequest, NextResponse } from 'next/server';
import { courses } from '@/lib/courses';
import { getEnrollmentsByCourse } from '@/lib/enrollment-store';
import { getCurrentUser, getInstructorById, getInstructorByName } from '@/lib/users';

/**
 * GET /api/instructor/courses
 * Returns courses owned by the logged-in instructor.
 * Demo: accepts ?instructorId= query param, defaults to demo instructor.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const instructorId = searchParams.get('instructorId');

  const user = instructorId
    ? getInstructorById(instructorId)
    : getCurrentUser('instructor');

  if (!user || user.role !== 'instructor') {
    return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
  }

  const instructorCourses = courses.filter((c) => c.instructor === user.name);

  const result = instructorCourses.map((c) => {
    const enrollments = getEnrollmentsByCourse(c.id);
    return {
      ...c,
      enrollmentCount: enrollments.length,
      avgProgress: enrollments.length > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
        : 0,
    };
  });

  return NextResponse.json({ courses: result, instructor: user });
}
