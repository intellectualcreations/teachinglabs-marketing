'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MarketingNav from '@/components/shared/MarketingNav';
import MarketingFooter from '@/components/shared/MarketingFooter';

function UnsubscribePanel() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleUnsubscribe() {
    if (!token) {
      setStatus('error');
      setMessage('This unsubscribe link is missing a valid token.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setStatus('error');
        setMessage(data.error || 'We could not unsubscribe this address.');
        return;
      }

      setStatus('success');
      setMessage(
        data.alreadyUnsubscribed
          ? 'This email address was already unsubscribed from Teaching Labs waitlist emails.'
          : 'You have been unsubscribed from Teaching Labs waitlist emails.'
      );
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please email hello@teachinglabs.com and we will help.');
    }
  }

  return (
    <div className="max-w-[640px] mx-auto px-6 py-24 text-center">
      <div className="rounded-[28px] border border-[#dbe3ef] bg-white dark:bg-[#0e1a35] dark:border-white/10 p-8 md:p-12 shadow-[0_16px_60px_rgba(20,33,61,0.08)]">
        <p className="font-heading text-xs font-bold tracking-[3px] uppercase text-indigo dark:text-teal mb-4">
          Email preferences
        </p>
        <h1 className="font-heading text-[clamp(32px,5vw,48px)] font-extrabold leading-tight text-text-primary mb-5">
          Unsubscribe from Teaching Labs emails
        </h1>
        <p className="text-[#24324a] dark:text-text-secondary leading-[1.7] mb-8">
          You are receiving waitlist emails because you signed up for early access to Teaching Labs.
          Click below to stop receiving waitlist and early-access updates.
        </p>

        {status === 'success' ? (
          <div className="rounded-2xl bg-[#eef2ff] dark:bg-white/5 border border-indigo/20 dark:border-teal/20 p-5 text-left mb-8">
            <p className="font-heading font-bold text-text-primary mb-1">You’re all set.</p>
            <p className="text-[#24324a] dark:text-text-secondary leading-[1.6]">{message}</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleUnsubscribe}
            disabled={status === 'loading'}
            className="inline-flex items-center justify-center rounded-full bg-indigo px-8 py-4 font-heading text-sm font-bold uppercase tracking-[2px] text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === 'loading' ? 'Unsubscribing...' : 'Unsubscribe me'}
          </button>
        )}

        {status === 'error' && (
          <p className="mt-5 text-sm text-red-600 dark:text-red-300">{message}</p>
        )}

        <div className="mt-8 border-t border-[#dbe3ef] dark:border-white/10 pt-6">
          <Link href="/" className="text-sm font-semibold text-indigo dark:text-teal hover:underline">
            Return to Teaching Labs
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <>
      <MarketingNav />
      <main className="min-h-screen bg-[#f4f7fb] dark:bg-deep-navy">
        <Suspense fallback={<div className="min-h-screen" />}>
          <UnsubscribePanel />
        </Suspense>
      </main>
      <MarketingFooter />
    </>
  );
}
