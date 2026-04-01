'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button */}
      <button
        className="flex flex-col gap-[5px] w-7 py-1 xl:hidden"
        aria-label="Toggle menu"
        onClick={() => setOpen(!open)}
      >
        <span
          className="block h-0.5 bg-[#1A1A2E] dark:bg-white rounded-sm transition-transform duration-300"
          style={{ transform: open ? 'rotate(45deg) translate(5px, 5px)' : undefined }}
        />
        <span
          className="block h-0.5 bg-[#1A1A2E] dark:bg-white rounded-sm transition-opacity duration-300"
          style={{ opacity: open ? 0 : 1 }}
        />
        <span
          className="block h-0.5 bg-[#1A1A2E] dark:bg-white rounded-sm transition-transform duration-300"
          style={{ transform: open ? 'rotate(-45deg) translate(5px, -5px)' : undefined }}
        />
      </button>

      {/* Mobile nav */}
      {open && (
        <div
          className="fixed top-[72px] left-0 right-0 z-[99] bg-white dark:bg-[#0a1128] border-b border-black/10 dark:border-white/10 px-6 py-6"
          style={{ backdropFilter: 'blur(16px)' }}
        >
          {[
            { href: '/', label: 'Home' },
            { href: '/for-teachers', label: 'Teachers' },
            { href: '/for-students', label: 'Students' },
            { href: '/for-districts', label: 'Districts' },
            { href: '/for-parents', label: 'Parents' },
            { href: '/our-story', label: 'About' },
            { href: '/contact', label: 'Contact' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block py-3 font-['Inter',sans-serif] text-xl font-medium text-[#4A5568] dark:text-white/80 border-b border-black/5 dark:border-white/10 last:border-0"
            >
              {label}
            </Link>
          ))}
          <span className="block py-3 font-['Inter',sans-serif] text-base font-medium text-[#4A5568] dark:text-white/80 border-b border-black/5 dark:border-white/10">
            Sign In <span className="text-sm text-[#4A5568]/60 dark:text-white/40 ml-2">Coming Soon</span>
          </span>
          <Link
            href="/waitlist"
            onClick={() => setOpen(false)}
            className="block mt-4 bg-[#4056F4] text-[#ffffff] text-center py-3 px-8 rounded-full font-['Inter',sans-serif] font-semibold text-base"
          >
            Join the Waitlist
          </Link>
        </div>
      )}
    </>
  );
}
