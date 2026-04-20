'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/shared/ThemeToggle';
import MobileMenu from '@/app/_components/MobileMenu';

function IconChevronDown() {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="w-3 h-3 transition-transform duration-300 group-hover:rotate-180"
    >
      <path d="M3 5l3 3 3-3" />
    </svg>
  );
}

export default function MarketingNav() {
  const pathname = usePathname();
  const aboutPaths = ['/our-story', '/how-it-works', '/pricing', '/see-the-difference'];
  const isAboutActive = aboutPaths.includes(pathname);

  // Matches v4: light=rgba(245,244,239,0.97), dark=rgba(10,17,40,0.95)
  // Handled via a wrapper div with Tailwind arbitrary values + dark: variant.

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="sticky top-0 z-[100] backdrop-blur-2xl border-b border-[rgba(128,128,128,0.1)] bg-[rgba(245,244,239,0.97)] dark:bg-[rgba(10,17,40,0.95)] transition-colors duration-300"
    >
      <div className="max-w-[1200px] mx-auto px-12 max-md:px-6 h-[72px] flex items-center justify-between">
        {/* Logo — image swap based on theme, matches v4 */}
        <Link href="/" className="flex items-center group" aria-label="Teaching Labs home">
          <Image
            src="/images/logo-horizontal-dark.png"
            alt="Teaching Labs"
            width={220}
            height={44}
            priority
            className="h-11 w-auto block dark:hidden transition-[filter] duration-400 group-hover:[filter:drop-shadow(0_0_12px_rgba(64,86,244,0.5))]"
          />
          <Image
            src="/images/logo-horizontal-light.png"
            alt="Teaching Labs"
            width={220}
            height={44}
            priority
            className="h-11 w-auto hidden dark:block transition-[filter] duration-400 group-hover:[filter:drop-shadow(0_0_16px_rgba(0,246,237,0.5))]"
          />
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden lg:flex items-center gap-6 list-none">
          {[
            { href: '/', label: 'Home' },
            { href: '/for-teachers', label: 'For Teachers' },
            { href: '/for-students', label: 'For Students' },
            { href: '/for-districts', label: 'For Districts' },
            { href: '/for-parents', label: 'For Parents' },
          ].map(({ href, label }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`font-heading text-[13px] font-medium transition-colors duration-300 ${
                    active
                      ? 'font-bold text-gold dark:text-teal'
                      : 'text-[#334155] dark:text-white/70 hover:text-gold dark:hover:text-teal'
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}

          {/* About dropdown */}
          <li className="group relative">
            <button
              type="button"
              aria-expanded="false"
              aria-haspopup="true"
              className={`flex items-center gap-1 font-heading text-[14px] font-medium bg-transparent border-0 p-0 cursor-pointer transition-colors duration-300 ${
                isAboutActive
                  ? 'font-bold text-gold dark:text-teal'
                  : 'text-[#334155] dark:text-white/70 hover:text-gold dark:hover:text-teal'
              }`}
            >
              About
              <IconChevronDown />
            </button>

            <div
              role="menu"
              className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 focus-within:opacity-100 focus-within:visible focus-within:translate-y-0 transition-all duration-250 ease-out"
            >
              <div className="min-w-[200px] py-2 rounded-xl border border-[rgba(0,0,0,0.08)] dark:border-white/10 bg-white dark:bg-[#1a2744] shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
                {[
                  { href: '/our-story', label: 'Our Story' },
                  { href: '/how-it-works', label: 'How It Works' },
                  { href: '/pricing', label: 'Pricing' },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    role="menuitem"
                    className="block px-5 py-2.5 text-[14px] font-medium text-[#334155] dark:text-white/70 hover:bg-[rgba(0,246,237,0.08)] hover:text-gold transition-colors duration-200"
                  >
                    {label}
                  </Link>
                ))}
                <span
                  role="menuitem"
                  aria-disabled="true"
                  className="block px-5 py-2.5 text-[14px] font-medium text-[#334155]/50 dark:text-white/30 pointer-events-none"
                >
                  Team <span className="text-[11px] text-[#64748B]">(Coming Soon)</span>
                </span>
                <span
                  role="menuitem"
                  aria-disabled="true"
                  className="block px-5 py-2.5 text-[14px] font-medium text-[#334155]/50 dark:text-white/30 pointer-events-none"
                >
                  Testimonials <span className="text-[11px] text-[#64748B]">(Coming Soon)</span>
                </span>
                <Link
                  href="/see-the-difference"
                  role="menuitem"
                  className="block px-5 py-2.5 text-[14px] font-medium text-[#334155] dark:text-white/70 hover:bg-[rgba(0,246,237,0.08)] hover:text-gold transition-colors duration-200"
                >
                  See the Difference
                </Link>
              </div>
            </div>
          </li>

          <li>
            <Link
              href="/contact"
              className={`font-heading text-[13px] font-medium transition-colors duration-300 ${
                pathname === '/contact'
                  ? 'font-bold text-gold dark:text-teal'
                  : 'text-[#334155] dark:text-white/70 hover:text-gold dark:hover:text-teal'
              }`}
            >
              Contact
            </Link>
          </li>
        </ul>

        {/* Right side: CTA + theme toggle */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/waitlist"
            className="font-heading text-[14px] font-semibold bg-gold text-white px-6 py-2.5 rounded-full transition-all duration-300 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(64,86,244,0.35)]"
          >
            Join Waitlist
          </Link>
          <ThemeToggle className="!w-10 !h-10 !rounded-full !border-0 bg-[rgba(128,128,128,0.08)] hover:bg-[rgba(128,128,128,0.15)] hover:rotate-[15deg]" />
        </div>

        {/* Mobile hamburger */}
        <div className="lg:hidden flex items-center gap-3">
          <ThemeToggle className="!w-10 !h-10 !rounded-full !border-0 bg-[rgba(128,128,128,0.08)] hover:bg-[rgba(128,128,128,0.15)]" />
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
}
