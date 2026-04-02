'use client';

import Link from 'next/link';
import { CheckCircle, ArrowRight, Sparkle } from '@phosphor-icons/react';

export default function WaitlistConfirmedPage() {
  return (
    <div className="min-h-screen bg-warm-white dark:bg-[#0B1426] flex flex-col">
      {/* Nav */}
      <nav className="bg-[#1F3A5F] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Sparkle size={22} weight="fill" color="white" />
            </div>
            <span className="font-heading font-bold text-xl text-white">TeachingLabs</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-lg w-full text-center">
          {/* Success icon */}
          <div className="w-20 h-20 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={48} weight="fill" className="text-teal" />
          </div>

          <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary mb-4 leading-tight">
            You&apos;re on the list! 🎉
          </h1>

          <p className="text-text-secondary text-lg leading-relaxed mb-10 max-w-md mx-auto">
            We&apos;ll be in touch soon so you can get started building your Teaching Twin. Keep an eye on your inbox!
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-teal text-white font-heading font-semibold text-lg rounded-full hover:bg-teal/90 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            Back to Homepage
            <ArrowRight size={20} weight="bold" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card-bg">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-secondary">
          <p>Questions? <a href="mailto:hello@teachinglabs.com" className="text-teal hover:underline">hello@teachinglabs.com</a></p>
          <p>&copy; 2026 Teaching Labs by Intellectual Creations</p>
        </div>
      </footer>
    </div>
  );
}
