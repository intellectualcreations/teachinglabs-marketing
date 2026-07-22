'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function WaitlistForm({ variant = 'cta' }: { variant?: 'cta' | 'hero' }) {
  const router = useRouter();
  const [email, setEmail] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    // The one-line CTA only collects an email, but a real signup needs name + role.
    // Hand off to the full waitlist form with the email prefilled instead of
    // posting incomplete data that the API (correctly) rejects.
    router.push(`/waitlist?email=${encodeURIComponent(trimmed)}`);
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
          className="cta-button-pulse inline-flex items-center justify-center font-heading text-[17px] font-bold bg-gold text-white px-10 py-4 rounded-full hover:-translate-y-0.5 transition-transform duration-300"
        >
          Join the Waitlist
        </button>
      </form>
    );
  }

  return null;
}
