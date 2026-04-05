'use client';

import { useState } from 'react';
import Link from 'next/link';

interface EnrollButtonProps {
  courseId: string;
  courseTitle: string;
  price: number;
}

export default function EnrollButton({ courseId, courseTitle, price }: EnrollButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'enrolled' | 'already' | 'error' | 'payment_required'>('idle');

  async function handleEnroll() {
    setState('loading');
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: 'demo-student', courseId }),
      });

      if (res.status === 409) {
        setState('already');
      } else if (res.status === 402) {
        setState('payment_required');
      } else if (res.ok) {
        setState('enrolled');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  }

  if (state === 'enrolled') {
    return (
      <div className="bg-card-bg border border-border rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-teal">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
          You&apos;re enrolled in {courseTitle}!
        </h3>
        <p className="text-[15px] text-text-secondary mb-5">
          Start learning and track your progress.
        </p>
        <Link
          href="/student/my-courses"
          className="inline-flex items-center font-heading text-[15px] font-bold bg-teal text-navy px-8 py-3 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
        >
          Go to My Courses
        </Link>
      </div>
    );
  }

  if (state === 'already') {
    return (
      <div className="bg-card-bg border border-border rounded-2xl p-8 text-center">
        <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
          Already Enrolled
        </h3>
        <p className="text-[15px] text-text-secondary mb-5">
          You&apos;re already enrolled in {courseTitle}. Continue where you left off.
        </p>
        <Link
          href="/student/my-courses"
          className="inline-flex items-center font-heading text-[15px] font-bold bg-teal text-navy px-8 py-3 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
        >
          Go to My Courses
        </Link>
      </div>
    );
  }

  if (state === 'payment_required') {
    return (
      <div className="bg-card-bg border border-border rounded-2xl p-8 text-center">
        <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
          Payment Required
        </h3>
        <p className="text-[15px] text-text-secondary mb-5">
          {courseTitle} costs ${(price / 100).toFixed(2)}. Complete your purchase to start learning.
        </p>
        <Link
          href={`/checkout/${courseId}`}
          className="inline-flex items-center font-heading text-[15px] font-bold bg-coral text-white px-8 py-3 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
        >
          Go to Checkout
        </Link>
      </div>
    );
  }

  const isPaid = price > 0;

  return (
    <div className="bg-card-bg border border-border rounded-2xl p-8 text-center">
      <h3 className="font-heading text-lg font-bold text-text-primary mb-2">
        Ready to learn {courseTitle}?
      </h3>
      <p className="text-[15px] text-text-secondary mb-5">
        {isPaid
          ? `This course is $${(price / 100).toFixed(2)}. Purchase to start learning.`
          : 'Enroll now and start tracking your progress.'}
      </p>
      {isPaid ? (
        <Link
          href={`/checkout/${courseId}`}
          className="inline-flex items-center font-heading text-[15px] font-bold bg-coral text-white px-8 py-3 rounded-full hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(232,131,107,0.35)] transition-all duration-200"
        >
          Purchase — ${(price / 100).toFixed(2)}
        </Link>
      ) : (
        <button
          onClick={handleEnroll}
          disabled={state === 'loading'}
          className="inline-flex items-center font-heading text-[15px] font-bold bg-gold text-deep-navy px-8 py-3 rounded-full hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(240,201,93,0.35)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-0"
        >
          {state === 'loading' ? 'Enrolling...' : 'Enroll Now — Free'}
        </button>
      )}
      {state === 'error' && (
        <p className="text-sm text-red-500 mt-3">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}
