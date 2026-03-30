'use client';

import { useState, FormEvent } from 'react';

export default function WaitlistForm({ variant = 'cta' }: { variant?: 'cta' | 'hero' }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || "You're on the list!");
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="success-fade-up" style={{ animationDelay: '0s' }}>
          <svg viewBox="0 0 100 100" className="w-16 h-16 mx-auto mb-4">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#00F6ED" strokeWidth="3" className="success-circle" />
            <path d="M30 52 L44 66 L70 38" fill="none" stroke="#00F6ED" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="success-check" />
          </svg>
        </div>
        <p className={variant === 'cta' ? 'text-lg font-semibold text-white' : 'text-lg font-semibold text-text-primary'}>
          {message}
        </p>
      </div>
    );
  }

  if (variant === 'cta') {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 font-heading text-base focus:outline-none focus:border-teal focus:bg-white/15 transition-all duration-200"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="cta-button-pulse inline-flex items-center justify-center font-heading text-[17px] font-bold bg-gold text-deep-navy px-10 py-4 rounded-full hover:-translate-y-0.5 transition-transform duration-300 disabled:opacity-60"
        >
          {status === 'loading' ? 'Joining...' : 'Join the Waitlist'}
        </button>
      </form>
    );
  }

  return null;
}
