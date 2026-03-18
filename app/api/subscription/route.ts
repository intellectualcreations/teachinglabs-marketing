import { NextRequest, NextResponse } from 'next/server';
import { stripe, isStripeConfigured, getBaseUrl } from '@/lib/stripe';
import {
  getUserById,
  updateUserSubscription,
  PRO_PRICE_CENTS,
  getSubscriptionStats,
} from '@/lib/users';
import { getPaymentsByStudent } from '@/lib/payment-store';

/**
 * GET /api/subscription?studentId=xxx
 * Returns the student's subscription status, billing history, and tier info.
 */
export async function GET(request: NextRequest) {
  const studentId =
    request.nextUrl.searchParams.get('studentId') || 'demo-student';
  const user = getUserById(studentId);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const payments = getPaymentsByStudent(studentId);

  return NextResponse.json({
    userId: user.id,
    name: user.name,
    tier: user.subscriptionTier,
    stripeSubscriptionId: user.stripeSubscriptionId || null,
    subscribedSince: user.subscriptionStartedAt || null,
    proPriceCents: PRO_PRICE_CENTS,
    billingHistory: payments.map((p) => ({
      id: p.id,
      amount: p.amountCents,
      status: p.status,
      date: p.createdAt,
      courseId: p.courseId,
      stripePaymentIntentId: p.stripePaymentIntentId || null,
    })),
  });
}

/**
 * POST /api/subscription
 * Creates a Stripe Checkout Session for Pro subscription upgrade.
 * Falls back to mock mode if Stripe is not configured.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { studentId } = body as { studentId?: string };

  if (!studentId) {
    return NextResponse.json(
      { error: 'studentId is required' },
      { status: 400 },
    );
  }

  const user = getUserById(studentId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.subscriptionTier === 'pro') {
    return NextResponse.json(
      { error: 'Already on Pro plan', tier: 'pro' },
      { status: 409 },
    );
  }

  // Real Stripe checkout for subscription
  if (isStripeConfigured() && stripe) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Teaching Labs Pro',
                description:
                  'Unlimited course access, priority support, and advanced analytics.',
              },
              unit_amount: PRO_PRICE_CENTS,
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${getBaseUrl()}/student/subscription?upgraded=true`,
        cancel_url: `${getBaseUrl()}/student/subscription?cancelled=true`,
        metadata: {
          studentId,
          type: 'pro_subscription',
        },
      });

      return NextResponse.json({
        sessionId: session.id,
        url: session.url,
        mode: 'stripe',
      });
    } catch (err) {
      console.error('Stripe subscription session failed:', err);
      return NextResponse.json(
        { error: 'Failed to create subscription checkout' },
        { status: 500 },
      );
    }
  }

  // Mock mode: upgrade immediately
  updateUserSubscription(studentId, 'pro', `mock_sub_${Date.now()}`);

  return NextResponse.json({
    sessionId: `mock_sub_${studentId}`,
    url: `/student/subscription?upgraded=true`,
    mode: 'mock',
    tier: 'pro',
  });
}
