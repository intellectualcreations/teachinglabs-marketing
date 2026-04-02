import { NextRequest, NextResponse } from 'next/server';
import { enrollStudent, getAllEnrollments } from '@/lib/enrollment-store';
import { getCourseById } from '@/lib/courses';
import { getUserById } from '@/lib/users';

/**
 * POST /api/admin/enrollments
 * Admin can enroll or unenroll a student.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { studentId, courseId, action } = body as {
    studentId?: string;
    courseId?: string;
    action?: 'enroll' | 'unenroll';
  };

  if (!studentId || !courseId) {
    return NextResponse.json(
      { error: 'studentId and courseId are required' },
      { status: 400 },
    );
  }

  const student = getUserById(studentId);
  if (!student || student.role !== 'student') {
    return NextResponse.json(
      { error: 'Student not found' },
      { status: 404 },
    );
  }

  const course = getCourseById(courseId);
  if (!course) {
    return NextResponse.json(
      { error: 'Course not found' },
      { status: 404 },
    );
  }

  if (action === 'unenroll') {
    // Find and remove enrollment from the store
    const allEnrollments = getAllEnrollments();
    const enrollment = allEnrollments.find(
      (e) => e.studentId === studentId && e.courseId === courseId,
    );
    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 },
      );
    }
    // Mark as completed (soft removal in demo)
    enrollment.status = 'completed';
    return NextResponse.json({ message: 'Student unenrolled', enrollment });
  }

  // Default: enroll (admin bypass payment check)
  const { enrollment, created } = enrollStudent(studentId, courseId);
  return NextResponse.json(
    { enrollment, created },
    { status: created ? 201 : 200 },
  );
}
