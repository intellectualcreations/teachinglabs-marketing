import { NextResponse } from 'next/server';
import { users } from '@/lib/users';
import { courses } from '@/lib/courses';
import { getAllEnrollments } from '@/lib/enrollment-store';

/**
 * GET /api/admin/stats
 * Returns aggregate stats for the admin dashboard.
 */
export async function GET() {
  const enrollments = getAllEnrollments();

  return NextResponse.json({
    totalUsers: users.length,
    totalCourses: courses.length,
    totalEnrollments: enrollments.length,
    publishedCourses: courses.filter((c) => c.published).length,
    totalStudents: users.filter((u) => u.role === 'student').length,
    totalInstructors: users.filter((u) => u.role === 'instructor').length,
  });
}
