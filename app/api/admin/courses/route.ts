import { NextResponse } from 'next/server';
import { courses } from '@/lib/courses';
import { getEnrollmentsByCourse } from '@/lib/enrollment-store';

/**
 * GET /api/admin/courses
 * Returns all courses with enrollment counts for admin view.
 */
export async function GET() {
  const result = courses.map((c) => ({
    id: c.id,
    title: c.title,
    subject: c.subject,
    instructor: c.instructor,
    published: c.published,
    price: c.price,
    enrollmentCount: getEnrollmentsByCourse(c.id).length,
  }));

  return NextResponse.json({ courses: result });
}
