import { NextRequest, NextResponse } from 'next/server';
import { stripe, isStripeConfigured } from '@/lib/stripe';
import { confirmPaymentBySession, createPayment } from '@/lib/payment-store';
import { enrollStudent } from '@/lib/enrollment-store';
import { updateUserSubscription } from '@/lib/users';
import { createNotification } from '@/lib/notification-store';
import type Stripe from 'stripe';

/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events for payment confirmations and subscription changes.
 */
export async function POST(request: NextRequest) {
  if (!isStripeConfigured() || !stripe) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 503 },
    );
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  // Verify webhook signature if secret is configured
  if (webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 },
      );
    }
  } else {
    // In dev/test without webhook secret, parse body directly
    try {
      event = JSON.parse(body) as Stripe.Event;
    } catch {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 },
      );
    }
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        const { courseId, studentId, type } = metadata;

        if (type === 'course_purchase' && courseId && studentId) {
          // Confirm payment and enroll
          const paymentIntentId =
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id || '';

          // Try to confirm existing pending payment
          const confirmed = confirmPaymentBySession(session.id, paymentIntentId);

          if (!confirmed) {
            // Create a new payment record if no pending one found
            createPayment(
              studentId,
              courseId,
              session.amount_total || 0,
              paymentIntentId,
              session.id,
            );
          }

          // Auto-enroll student (skip tier check since they just paid)
          try {
            enrollStudent(studentId, courseId, true);
          } catch {
            // Already enrolled or course not found — that's okay
          }

          // Notify student
          createNotification(
            studentId,
            'payment_confirmed',
            `Your payment has been confirmed! You're now enrolled.`,
            { courseId },
          );
        }

        if (type === 'pro_subscription' && studentId) {
          // Activate Pro subscription
          const subscriptionId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription?.id || '';

          updateUserSubscription(studentId, 'pro', subscriptionId);

          createNotification(
            studentId,
            'subscription_activated',
            'Welcome to Pro! You now have unlimited course access.',
            {},
          );
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const studentId = subscription.metadata?.studentId;

        if (studentId) {
          if (subscription.status === 'active') {
            updateUserSubscription(studentId, 'pro', subscription.id);
          } else if (
            subscription.status === 'canceled' ||
            subscription.status === 'unpaid'
          ) {
            updateUserSubscription(studentId, 'free');
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const studentId = subscription.metadata?.studentId;

        if (studentId) {
          updateUserSubscription(studentId, 'free');
          createNotification(
            studentId,
            'subscription_cancelled',
            'Your Pro subscription has been cancelled. You still have access to your enrolled courses.',
            {},
          );
        }
        break;
      }

      default:
        // Unhandled event type — ignore
        break;
    }
  } catch (err) {
    console.error(`Error processing webhook event ${event.type}:`, err);
    // Return 200 anyway to prevent Stripe retries on processing errors
  }

  return NextResponse.json({ received: true });
}
