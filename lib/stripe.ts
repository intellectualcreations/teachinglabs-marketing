import Stripe from 'stripe';

/**
 * Stripe client instance — uses test keys.
 * Requires STRIPE_SECRET_KEY in .env.local
 */
function createStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.warn('⚠️  STRIPE_SECRET_KEY not set — Stripe features will use mock mode');
    return null;
  }
  return new Stripe(key, {
    apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
    typescript: true,
  });
}

export const stripe = createStripeClient();

/** Check whether Stripe is configured and available */
export function isStripeConfigured(): boolean {
  return stripe !== null;
}

/** Base URL for Stripe checkout redirects */
export function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
}
