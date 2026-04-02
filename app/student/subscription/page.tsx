'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface BillingRecord {
  id: string;
  amount: number;
  status: string;
  date: string;
  courseId: string;
  stripePaymentIntentId: string | null;
}

interface SubscriptionData {
  userId: string;
  name: string;
  tier: 'free' | 'pro';
  stripeSubscriptionId: string | null;
  subscribedSince: string | null;
  proPriceCents: number;
  billingHistory: BillingRecord[];
}

export default function SubscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-warm-white flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SubscriptionContent />
    </Suspense>
  );
}

function SubscriptionContent() {
  const searchParams = useSearchParams();
  const upgraded = searchParams.get('upgraded') === 'true';
  const cancelled = searchParams.get('cancelled') === 'true';

  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetch('/api/subscription?studentId=demo-student')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: 'demo-student' }),
      });
      const result = await res.json();
      if (result.url) {
        if (result.mode === 'stripe') {
          window.location.href = result.url;
        } else {
          // Mock mode: reload to show updated tier
          window.location.href = result.url;
        }
      }
    } catch {
      alert('Failed to start upgrade. Please try again.');
    } finally {
      setUpgrading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Success/cancel banners */}
      {upgraded && (
        <div className="mb-6 bg-teal/10 border border-teal/20 rounded-xl px-5 py-4">
          <p className="text-teal font-heading font-bold text-sm">
            🎉 Welcome to Pro! You now have unlimited course access.
          </p>
        </div>
      )}
      {cancelled && (
        <div className="mb-6 bg-gold/10 border border-gold/20 rounded-xl px-5 py-4">
          <p className="text-gold font-heading font-bold text-sm">
            Upgrade cancelled. You can upgrade anytime.
          </p>
        </div>
      )}

      <h1 className="font-heading text-2xl font-bold text-text-primary mb-1">
        Subscription & Billing
      </h1>
      <p className="text-text-secondary text-[15px] mb-8">
        Manage your plan and view billing history.
      </p>

      {/* Current Plan Card */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Free Tier */}
        <div
          className={`bg-card-bg border rounded-2xl p-6 ${
            data.tier === 'free'
              ? 'border-teal ring-2 ring-teal/20'
              : 'border-border'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-text-primary">
              Free
            </h3>
            {data.tier === 'free' && (
              <span className="px-3 py-1 rounded-full bg-teal/10 text-teal text-xs font-bold">
                Current Plan
              </span>
            )}
          </div>
          <p className="text-3xl font-heading font-bold text-text-primary mb-1">
            $0
          </p>
          <p className="text-text-muted text-sm mb-4">Forever free</p>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-center gap-2">
              <span className="text-teal">✓</span> Up to 3 courses
            </li>
            <li className="flex items-center gap-2">
              <span className="text-teal">✓</span> AI tutor access
            </li>
            <li className="flex items-center gap-2">
              <span className="text-text-muted">—</span> Limited analytics
            </li>
          </ul>
        </div>

        {/* Pro Tier */}
        <div
          className={`bg-card-bg border rounded-2xl p-6 ${
            data.tier === 'pro'
              ? 'border-coral ring-2 ring-coral/20'
              : 'border-border'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold text-text-primary">
              Pro
            </h3>
            {data.tier === 'pro' ? (
              <span className="px-3 py-1 rounded-full bg-coral/10 text-coral text-xs font-bold">
                Current Plan
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-bold">
                Recommended
              </span>
            )}
          </div>
          <p className="text-3xl font-heading font-bold text-text-primary mb-1">
            ${(data.proPriceCents / 100).toFixed(2)}
            <span className="text-base font-normal text-text-muted">/mo</span>
          </p>
          <p className="text-text-muted text-sm mb-4">Unlimited learning</p>
          <ul className="space-y-2 text-sm text-text-secondary mb-6">
            <li className="flex items-center gap-2">
              <span className="text-coral">✓</span> Unlimited courses
            </li>
            <li className="flex items-center gap-2">
              <span className="text-coral">✓</span> AI tutor access
            </li>
            <li className="flex items-center gap-2">
              <span className="text-coral">✓</span> Advanced analytics
            </li>
            <li className="flex items-center gap-2">
              <span className="text-coral">✓</span> Priority support
            </li>
          </ul>
          {data.tier === 'free' && (
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full py-3 rounded-xl bg-coral text-white font-heading font-bold text-[15px] hover:bg-coral/90 transition-colors cursor-pointer border-0 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {upgrading ? 'Starting checkout...' : 'Upgrade to Pro'}
            </button>
          )}
          {data.tier === 'pro' && data.subscribedSince && (
            <p className="text-xs text-text-muted mt-2">
              Member since{' '}
              {new Date(data.subscribedSince).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-card-bg border border-border rounded-2xl p-6">
        <h2 className="font-heading text-lg font-bold text-text-primary mb-4">
          Billing History
        </h2>
        {data.billingHistory.length === 0 ? (
          <p className="text-text-muted text-sm">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-heading font-semibold text-text-secondary">
                    Date
                  </th>
                  <th className="text-left py-2 pr-4 font-heading font-semibold text-text-secondary">
                    Description
                  </th>
                  <th className="text-right py-2 pr-4 font-heading font-semibold text-text-secondary">
                    Amount
                  </th>
                  <th className="text-right py-2 font-heading font-semibold text-text-secondary">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.billingHistory.map((record) => (
                  <tr key={record.id} className="border-b border-border/50">
                    <td className="py-3 pr-4 text-text-secondary">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4 text-text-primary">
                      Course: {record.courseId}
                    </td>
                    <td className="py-3 pr-4 text-right text-text-primary font-medium">
                      ${(record.amount / 100).toFixed(2)}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          record.status === 'completed'
                            ? 'bg-teal/10 text-teal'
                            : record.status === 'pending'
                              ? 'bg-gold/10 text-gold'
                              : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link
          href="/student/dashboard"
          className="text-sm text-teal hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
