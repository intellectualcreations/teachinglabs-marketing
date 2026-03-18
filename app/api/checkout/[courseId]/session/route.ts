import { NextRequest, NextResponse } from 'next/server';
import { getCourseById } from '@/lib/courses';
import { stripe, isStripeConfigured, getBaseUrl } from '@/lib/stripe';
import { createPendingPayment, createPayment } from '@/lib/payment-store';
import { enrollStudent } from '@/lib/enrollment-store';

/**
 * POST /api/checkout/[courseId]/session
 * Creates a Stripe Checkout Session for a course purchase.
 * Falls back to mock mode if Stripe is not configured.
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

  // If Stripe is configured, create a real checkout session
  if (isStripeConfigured() && stripe) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: course.title,
                description: `${course.subject} — ${course.gradeLevel} — by ${course.instructor}`,
              },
              unit_amount: course.price,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${getBaseUrl()}/student/my-courses?payment=success&course=${courseId}`,
        cancel_url: `${getBaseUrl()}/checkout/${courseId}?cancelled=true`,
        metadata: {
          courseId,
          studentId,
          type: 'course_purchase',
        },
      });

      // Create pending payment record
      createPendingPayment(studentId, courseId, course.price, session.id);

      return NextResponse.json({
        sessionId: session.id,
        url: session.url,
        mode: 'stripe',
      });
    } catch (err) {
      console.error('Stripe session creation failed:', err);
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 },
      );
    }
  }

  // Mock mode fallback: create payment and enroll immediately
  const payment = createPayment(studentId, courseId, course.price, undefined, `mock_session_${Date.now()}`);
  try {
    enrollStudent(studentId, courseId);
  } catch (err) {
    // Enrollment limit hit
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Enrollment failed' },
      { status: 403 },
    );
  }

  return NextResponse.json({
    sessionId: `mock_${payment.id}`,
    url: `/student/my-courses?payment=success&course=${courseId}`,
    mode: 'mock',
    payment,
  });
}
