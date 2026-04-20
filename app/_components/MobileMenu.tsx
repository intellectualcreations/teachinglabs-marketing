'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger — visible below lg breakpoint, matches v4 .hamburger */}
      <button
        className="flex flex-col gap-[5px] w-7 py-1 lg:hidden"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span
          className="block h-0.5 bg-[#0a1128] dark:bg-white rounded-sm transition-transform duration-300"
          style={{ transform: open ? 'rotate(45deg) translate(5px, 5px)' : undefined }}
        />
        <span
          className="block h-0.5 bg-[#0a1128] dark:bg-white rounded-sm transition-opacity duration-300"
          style={{ opacity: open ? 0 : 1 }}
        />
        <span
          className="block h-0.5 bg-[#0a1128] dark:bg-white rounded-sm transition-transform duration-300"
          style={{ transform: open ? 'rotate(-45deg) translate(5px, -5px)' : undefined }}
        />
      </button>

      {/* Mobile nav — matches v4 .mobile-nav */}
      {open && (
        <div className="fixed top-[72px] left-0 right-0 z-[99] px-6 py-6 border-b border-[rgba(128,128,128,0.1)] backdrop-blur-2xl bg-[rgba(245,244,239,0.97)] dark:bg-[rgba(10,17,40,0.95)]">
          {[
            { href: '/', label: 'Home' },
            { href: '/for-teachers', label: 'For Teachers' },
            { href: '/for-students', label: 'For Students' },
            { href: '/for-districts', label: 'For Districts' },
            { href: '/for-parents', label: 'For Parents' },
            { href: '/our-story', label: 'Our Story' },
            { href: '/how-it-works', label: 'How It Works' },
            { href: '/pricing', label: 'Pricing' },
            { href: '/see-the-difference', label: 'See the Difference' },
            { href: '/contact', label: 'Contact' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block py-3 font-heading text-base font-medium text-[#334155] dark:text-white/70 border-b border-[rgba(128,128,128,0.08)] last:border-0 hover:text-gold dark:hover:text-teal transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/waitlist"
            onClick={() => setOpen(false)}
            className="block mt-4 bg-gold text-white text-center py-3 px-8 rounded-full font-heading font-semibold text-base hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(64,86,244,0.35)] transition-all"
          >
            Join Waitlist
          </Link>
        </div>
      )}
    </>
  );
}
