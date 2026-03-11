'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/shared/ThemeToggle';
import MobileMenu from '@/app/_components/MobileMenu';

function IconChevronDown() {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3 h-3">
      <path d="M3 5l3 3 3-3" />
    </svg>
  );
}

export default function MarketingNav() {
  const pathname = usePathname();
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-surface backdrop-blur-2xl">
        <div className="max-w-[1200px] mx-auto px-12 h-[72px] flex items-center justify-between max-md:px-6">

          {/* Logo */}
          <Link href="/" className="font-heading text-[22px] font-bold text-text-primary">
            Teaching Labs
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8 list-none">
            {[
              { href: '/', label: 'Home' },
              { href: '/for-teachers', label: 'For Teachers' },
              { href: '/for-students', label: 'For Students' },
              { href: '/for-districts', label: 'For Districts' },
              { href: '/for-parents', label: 'For Parents' },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={`font-heading text-[15px] font-semibold transition-colors duration-200 ${pathname === href ? 'text-teal dark:text-gold font-bold' : 'text-text-primary dark:text-text-secondary hover:text-teal dark:hover:text-gold'}`}>
                  {label}
                </Link>
              </li>
            ))}
            {/* About dropdown */}
            <li className="group relative flex items-end self-stretch">
              <button className={`flex items-center gap-1 font-heading text-[15px] font-semibold group-hover:text-teal dark:hover:text-gold transition-colors duration-200 cursor-pointer bg-transparent border-0 p-0 ${['/our-story', '/how-it-works', '/pricing', '/see-the-difference'].includes(pathname) ? 'text-teal dark:text-gold font-bold' : 'text-text-primary dark:text-text-secondary'}`}>
                About <IconChevronDown />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="bg-surface border border-border rounded-xl py-2 min-w-[200px] shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
                  {[
                    { href: '/our-story', label: 'Our Story' },
                    { href: '/how-it-works', label: 'How It Works' },
                    { href: '/pricing', label: 'Pricing' },
                  ].map(({ href, label }) => (
                    <Link key={href} href={href} className="block px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-[rgba(79,163,165,0.08)] hover:text-teal dark:hover:text-gold transition-colors duration-150">
                      {label}
                    </Link>
                  ))}
                  <span className="block px-5 py-2.5 text-sm font-medium text-text-secondary/50">Team <span className="text-xs">(Coming Soon)</span></span>
                  <span className="block px-5 py-2.5 text-sm font-medium text-text-secondary/50">Testimonials <span className="text-xs">(Coming Soon)</span></span>
                  <Link href="/see-the-difference" className="block px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-[rgba(79,163,165,0.08)] hover:text-teal dark:hover:text-gold transition-colors duration-150">
                    See the Difference
                  </Link>
                </div>
              </div>
            </li>
            <li>
              <Link href="/contact" className={`font-heading text-[15px] font-semibold transition-colors duration-200 ${pathname === '/contact' ? 'text-teal dark:text-gold font-bold' : 'text-text-primary dark:text-text-secondary hover:text-teal dark:hover:text-gold'}`}>
                Contact
              </Link>
            </li>
          </ul>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/waitlist"
              className="font-heading text-sm font-semibold bg-gold text-deep-navy px-6 py-2.5 rounded-full hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(240,201,93,0.35)] transition-all duration-200"
            >
              Join Waitlist
            </Link>
            <ThemeToggle className="border-border text-text-secondary hover:text-text-primary hover:border-navy" />
          </div>

          {/* Mobile hamburger */}
          <MobileMenu />
        </div>
      </nav>
      <div className="h-[72px]" /> {/* spacer for fixed nav */}
    </>
  );
}
