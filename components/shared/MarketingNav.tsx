'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/shared/ThemeToggle';
import MobileMenu from '@/app/_components/MobileMenu';

function IconChevronDown() {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180">
      <path d="M3 5l3 3 3-3" />
    </svg>
  );
}

export default function MarketingNav() {
  const pathname = usePathname();

  const isAboutActive = ['/our-story', '/how-it-works', '/pricing', '/see-the-difference'].includes(pathname);

  return (
    <>
      <nav className="sticky top-0 z-[100] bg-[var(--bg-nav)] backdrop-blur-[16px] border-b border-[rgba(128,128,128,0.1)] transition-[background,border-color] duration-[400ms]">
        <div className="max-w-[1200px] mx-auto px-12 h-[72px] flex items-center justify-between max-md:px-6">

          {/* Logo — image, matching v4 */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/logo-horizontal-dark.png"
              alt="Teaching Labs"
              width={180}
              height={44}
              className="h-[44px] w-auto transition-[filter] duration-[400ms] block dark:hidden hover:[filter:drop-shadow(0_0_12px_rgba(64,86,244,0.5))]"
              priority
            />
            <Image
              src="/images/logo-horizontal-light.png"
              alt="Teaching Labs"
              width={180}
              height={44}
              className="h-[44px] w-auto transition-[filter] duration-[400ms] hidden dark:block hover:[filter:drop-shadow(0_0_16px_rgba(0,246,237,0.5))]"
              priority
            />
          </Link>

          {/* Desktop links */}
          <ul className="hidden lg:flex items-center gap-6 list-none">
            {[
              { href: '/', label: 'Home' },
              { href: '/for-teachers', label: 'For Teachers' },
              { href: '/for-students', label: 'For Students' },
              { href: '/for-districts', label: 'For Districts' },
              { href: '/for-parents', label: 'For Parents' },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`font-heading text-[13px] font-medium transition-colors duration-300 ${
                    pathname === href
                      ? 'text-gold font-bold dark:text-teal dark:font-bold'
                      : 'text-text-secondary hover:text-gold dark:hover:text-teal'
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
            {/* About dropdown */}
            <li className="group relative">
              <button
                className={`flex items-center gap-1 font-heading text-[14px] font-medium transition-colors duration-300 cursor-pointer bg-transparent border-0 p-0 group-hover:text-gold ${
                  isAboutActive
                    ? 'text-gold font-bold dark:text-teal dark:font-bold'
                    : 'text-text-secondary'
                }`}
              >
                About <IconChevronDown />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-[250ms] translate-y-2 group-hover:translate-y-0">
                <div className="bg-[var(--bg-card,#fff)] dark:bg-[#1a2744] border border-[var(--card-border)] dark:border-[rgba(255,255,255,0.1)] rounded-xl py-2 min-w-[200px] shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
                  {[
                    { href: '/our-story', label: 'Our Story' },
                    { href: '/how-it-works', label: 'How It Works' },
                    { href: '/pricing', label: 'Pricing' },
                  ].map(({ href, label }) => (
                    <Link key={href} href={href} className="block px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-[rgba(0,246,237,0.08)] hover:text-gold transition-colors duration-150">
                      {label}
                    </Link>
                  ))}
                  <span className="block px-5 py-2.5 text-sm font-medium text-text-secondary/50 pointer-events-none">Team <span className="text-[11px] text-[var(--text-muted)]">(Coming Soon)</span></span>
                  <span className="block px-5 py-2.5 text-sm font-medium text-text-secondary/50 pointer-events-none">Testimonials <span className="text-[11px] text-[var(--text-muted)]">(Coming Soon)</span></span>
                  <Link href="/see-the-difference" className="block px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-[rgba(0,246,237,0.08)] hover:text-gold transition-colors duration-150">
                    See the Difference
                  </Link>
                </div>
              </div>
            </li>
            <li>
              <Link href="/contact" className={`font-heading text-[13px] font-medium transition-colors duration-300 ${pathname === '/contact' ? 'text-gold font-bold dark:text-teal dark:font-bold' : 'text-text-secondary hover:text-gold dark:hover:text-teal'}`}>
                Contact
              </Link>
            </li>
          </ul>

          {/* Desktop right */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/waitlist"
              className="font-heading text-sm font-semibold bg-transparent text-deep-navy dark:text-white px-6 py-2.5 rounded-full border-3 border-gold hover:bg-gold hover:text-white hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(64,86,244,0.35)] transition-all duration-200"
            >
              Join Waitlist
            </Link>
            <ThemeToggle className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(128,128,128,0.08)] hover:bg-[rgba(128,128,128,0.15)] hover:rotate-[15deg] transition-all duration-300" />
          </div>

          {/* Mobile: toggle + hamburger */}
          <div className="flex lg:hidden items-center gap-3">
            <ThemeToggle className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(128,128,128,0.08)] hover:bg-[rgba(128,128,128,0.15)] hover:rotate-[15deg] transition-all duration-300" />
            <MobileMenu />
          </div>
        </div>
      </nav>
      <div className="h-0" /> {/* nav is sticky not fixed, no spacer needed */}
    </>
  );
}
