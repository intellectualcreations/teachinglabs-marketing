import { NextRequest, NextResponse } from 'next/server';
import { enrollStudent } from '@/lib/enrollment-store';
import { getCourseById } from '@/lib/courses';
import { getPayment } from '@/lib/payment-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, courseId } = body;

    if (!studentId || !courseId) {
      return NextResponse.json(
        { error: 'studentId and courseId are required' },
        { status: 400 },
      );
    }

    const course = getCourseById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 },
      );
    }

    // If paid course, check for payment record
    if (course.price > 0) {
      const payment = getPayment(studentId, courseId);
      if (!payment) {
        return NextResponse.json(
          { error: 'Payment required', price: course.price, courseId },
          { status: 402 },
        );
      }
    }

    const { enrollment, created } = enrollStudent(studentId, courseId);

    if (!created) {
      return NextResponse.json(
        { error: 'Already enrolled in this course', enrollment },
        { status: 409 },
      );
    }

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
