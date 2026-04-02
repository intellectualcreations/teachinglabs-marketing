'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface CheckoutInfo {
  courseId: string;
  title: string;
  price: number;
  instructor: string;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [info, setInfo] = useState<CheckoutInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/checkout/${courseId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setInfo(data);
        }
      })
      .catch(() => setError('Failed to load checkout'))
      .finally(() => setLoading(false));
  }, [courseId]);

  async function handlePurchase() {
    if (!info) return;
    setPurchasing(true);
    setError(null);
    try {
      const res = await fetch(`/api/checkout/${courseId}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: 'demo-student' }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Checkout failed');
        return;
      }

      if (data.mode === 'stripe' && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
        return;
      }

      // Mock mode: redirect to success
      if (data.url) {
        router.push(data.url);
        return;
      }

      setCompleted(true);
    } catch {
      setError('Checkout failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !info) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted mb-4">{error}</p>
          <Link href="/catalog" className="text-teal hover:underline">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  if (!info) return null;

  if (completed) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-card-bg border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-teal">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="font-heading text-xl font-bold text-text-primary mb-2">
            Purchase Complete!
          </h2>
          <p className="text-text-secondary text-[15px] mb-6">
            You&apos;re now enrolled in {info.title}. Start learning right away.
          </p>
          <Link
            href="/student/my-courses"
            className="inline-flex items-center font-heading text-[15px] font-bold bg-teal text-white px-8 py-3 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
          >
            Go to My Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href={`/catalog/${courseId}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal hover:text-navy transition-colors duration-200 mb-6"
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="w-4 h-4"
          >
            <path d="M10 4l-4 4 4 4" />
          </svg>
          Back to Course
        </Link>

        <div className="bg-card-bg border border-border rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-navy px-8 py-6">
            <p className="text-white/60 text-xs font-heading font-bold uppercase tracking-widest mb-1">
              Checkout
            </p>
            <h1 className="font-heading text-xl font-bold text-white">
              {info.title}
            </h1>
            <p className="text-white/60 text-sm mt-1">by {info.instructor}</p>
          </div>

          {/* Body */}
          <div className="px-8 py-6">
            {/* Test mode banner */}
            <div className="bg-gold/10 border border-gold/20 rounded-lg px-4 py-3 mb-6">
              <p className="text-xs font-semibold text-gold">
                🧪 Test Mode — Stripe test checkout (no real charges)
              </p>
            </div>

            {/* Order summary */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">Course</span>
                <span className="text-text-primary text-sm font-medium">{info.title}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-text-primary font-heading font-bold">Total</span>
                <span className="text-text-primary font-heading text-xl font-bold">
                  ${(info.price / 100).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Purchase button — now routes through Stripe */}
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-full py-3.5 rounded-xl bg-coral text-white font-heading font-bold text-[15px] hover:bg-coral/90 transition-colors cursor-pointer border-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {purchasing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M3 10h18v2H3v-2zm0 4h12v2H3v-2zm0-8h18v2H3V6z" />
                  </svg>
                  Proceed to Checkout
                </>
              )}
            </button>

            <p className="text-xs text-text-muted text-center mt-3">
              Secure payment powered by Stripe
            </p>

            {error && (
              <p className="text-sm text-red-500 mt-3 text-center">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
