import { NextRequest, NextResponse } from 'next/server';
import { getCourseById } from '@/lib/courses';
import { createPayment } from '@/lib/payment-store';
import { enrollStudent } from '@/lib/enrollment-store';

/**
 * POST /api/checkout/[courseId]/complete
 * Mock checkout completion — creates payment record and auto-enrolls.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;
  const course = getCourseById(courseId);

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  if (course.price <= 0) {
    return NextResponse.json(
      { error: 'This course is free. No payment needed.' },
      { status: 400 },
    );
  }

  const body = await request.json();
  const { studentId } = body as { studentId?: string };

  if (!studentId) {
    return NextResponse.json(
      { error: 'studentId is required' },
      { status: 400 },
    );
  }

  // Create payment record
  const payment = createPayment(studentId, courseId, course.price);

  // Auto-enroll student
  const { enrollment, created } = enrollStudent(studentId, courseId);

  return NextResponse.json(
    {
      payment,
      enrollment,
      alreadyEnrolled: !created,
    },
    { status: 201 },
  );
}
