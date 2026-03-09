import type { Metadata } from 'next';
import Link from 'next/link';
import ThemeToggle from '@/components/shared/ThemeToggle';
import MobileMenu from '../_components/MobileMenu';
import ContactForm from './_components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact — Teaching Labs',
  description:
    'Get in touch with Teaching Labs. Whether you\'re a teacher, district leader, or just curious, we\'d love to hear from you.',
};

/* ─── Inline SVG icons ─── */

function IconChevronDown() {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="w-3 h-3"
    >
      <path d="M3 5l3 3 3-3" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M7 0l1.5 4.5H13l-3.5 2.7 1.3 4.3L7 8.8 3.2 11.5l1.3-4.3L1 4.5h4.5z" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <div
      className="min-h-screen bg-warm-white text-text-secondary overflow-x-hidden"
      style={{ fontFamily: "var(--font-open-sans, 'Open Sans', sans-serif)" }}
    >

      {/* ── NAV ── */}
      <nav
        className="sticky top-0 z-50 border-b border-border backdrop-blur-2xl"
        role="navigation"
        aria-label="Main navigation"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 97%, transparent)' }}
      >
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
                <Link
                  href={href}
                  className="font-heading text-sm font-medium text-text-secondary hover:text-gold transition-colors duration-200"
                >
                  {label}
                </Link>
              </li>
            ))}

            {/* About dropdown */}
            <li className="group relative">
              <button className="flex items-center gap-1 font-heading text-sm font-medium text-text-secondary group-hover:text-gold transition-colors duration-200 cursor-pointer bg-transparent border-0 p-0">
                About <IconChevronDown />
              </button>
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="bg-card-bg border border-border rounded-xl py-2 min-w-[220px] shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
                {[
                  { href: '/our-story', label: 'Our Story' },
                  { href: '/how-it-works', label: 'How It Works' },
                  { href: '/pricing', label: 'Pricing' },
                  { href: '/see-the-difference', label: 'See the Difference' },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="block px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-[rgba(79,163,165,0.08)] hover:text-gold transition-colors duration-150"
                  >
                    {label}
                  </Link>
                ))}
              </div>
              </div>
            </li>

            {/* Contact — active */}
            <li>
              <Link
                href="/contact"
                className="font-heading text-sm font-medium text-gold transition-colors duration-200"
              >
                Contact
              </Link>
            </li>
          </ul>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle className="border-border text-text-secondary hover:text-text-primary hover:border-navy" />
            <Link
              href="/teacher/dashboard"
              className="font-heading text-sm font-medium text-text-secondary hover:text-gold transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              href="https://teaching-labs-demo.netlify.app/landing-page/hero-banner.html"
              className="font-heading text-sm font-semibold bg-gold text-deep-navy px-6 py-2.5 rounded-full hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(240,201,93,0.35)] transition-all duration-200"
            >
              Join Waitlist
            </Link>
          </div>

          {/* Mobile hamburger */}
          <MobileMenu />
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative flex items-center justify-center overflow-hidden bg-warm-white py-20 md:py-[80px] md:pb-[60px]">
        {/* Animated blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div
            className="absolute w-[500px] h-[500px] rounded-full top-[10%] left-[15%] max-md:w-[300px] max-md:h-[300px]"
            style={{
              background: '#4FA3A5',
              filter: 'blur(80px)',
              opacity: 'var(--blob-teal-opacity, 0.08)',
              animation: 'blobDrift1 12s ease-in-out infinite',
            }}
          />
          <div
            className="absolute w-[450px] h-[450px] rounded-full top-[30%] right-[10%] max-md:w-[280px] max-md:h-[280px]"
            style={{
              background: '#F0C95D',
              filter: 'blur(80px)',
              opacity: 'var(--blob-gold-opacity, 0.10)',
              animation: 'blobDrift2 14s ease-in-out infinite',
            }}
          />
          <div
            className="absolute w-[350px] h-[350px] rounded-full top-[40%] left-[40%]"
            style={{
              background: '#FF6B6B',
              filter: 'blur(80px)',
              opacity: 'var(--blob-coral-opacity, 0)',
              animation: 'blobDrift3 10s ease-in-out infinite',
            }}
          />
        </div>

        <div className="relative z-10 text-center max-w-[900px] px-12 max-md:px-6">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-6">
            <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
            Contact Us
          </div>

          {/* Headline */}
          <h1
            className="font-heading font-extrabold tracking-[-2px] leading-[1.1] text-text-primary mb-6"
            style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}
          >
            Let&apos;s Start a{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #4FA3A5, #F0C95D)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Conversation
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl leading-[1.7] text-text-secondary mb-10 max-w-[620px] mx-auto">
            Whether you&apos;re a teacher, district leader, or just curious — we&apos;d love to hear from you.
          </p>

          {/* Buttons */}
          <div className="flex gap-4 justify-center flex-wrap mb-5 max-sm:flex-col max-sm:items-center">
            <Link
              href="/see-the-difference"
              className="inline-flex items-center gap-2 font-heading text-base font-bold bg-gold text-deep-navy px-10 py-4 rounded-full shadow-[0_4px_20px_rgba(240,201,93,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(240,201,93,0.45)] hover:bg-[#f2d06e] transition-all duration-300 max-sm:w-full max-sm:justify-center"
            >
              See How It Works
            </Link>
            <a
              href="https://teaching-labs-demo.netlify.app/landing-page/hero-banner.html"
              className="inline-flex items-center gap-2 font-heading text-base font-semibold bg-transparent text-teal px-10 py-4 rounded-full border-2 border-[#4FA3A5] hover:bg-teal hover:text-white hover:-translate-y-0.5 transition-all duration-300 max-sm:w-full max-sm:justify-center"
            >
              Join the Waitlist
            </a>
          </div>

          <p className="font-heading text-[13px] text-text-muted">
            We respond to every message personally.
          </p>
        </div>
      </section>

      {/* ── CONTACT SECTION ── */}
      <main>
        <div className="max-w-[1100px] mx-auto px-12 py-24 grid grid-cols-2 gap-20 items-start max-md:grid-cols-1 max-md:gap-12 max-md:px-6 max-md:py-16">

          {/* ── LEFT: Contact Info ── */}
          <div>
            <h2 className="font-heading text-[32px] font-bold text-text-primary mb-4">
              How can we help?
            </h2>
            <p className="text-base leading-[1.7] text-text-secondary mb-10">
              Teaching Labs is built for educators, by someone who spent 13 years in the classroom.
              Reach out — we respond to every message personally.
            </p>

            {/* Email card */}
            <div className="card-accent flex gap-[18px] items-start p-6 rounded-[20px] mb-4 bg-card-bg shadow-[var(--card-shadow,0_2px_20px_rgba(20,33,61,0.05))] hover:-translate-y-1 hover:shadow-[var(--card-hover-shadow,0_8px_40px_rgba(20,33,61,0.10))] transition-all duration-300 relative overflow-hidden">
              <div className="w-11 h-11 bg-[rgba(79,163,165,0.1)] rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                ✉️
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold text-text-primary mb-1 tracking-[0.3px]">
                  Email Us
                </h3>
                <a
                  href="mailto:hello@teachinglabs.com"
                  className="text-sm text-text-secondary hover:text-gold transition-colors duration-200"
                >
                  hello@teachinglabs.com
                </a>
              </div>
            </div>

            {/* District & School Partnerships card */}
            <div className="card-accent flex gap-[18px] items-start p-6 rounded-[20px] mb-4 bg-card-bg shadow-[var(--card-shadow,0_2px_20px_rgba(20,33,61,0.05))] hover:-translate-y-1 hover:shadow-[var(--card-hover-shadow,0_8px_40px_rgba(20,33,61,0.10))] transition-all duration-300 relative overflow-hidden">
              <div className="w-11 h-11 bg-[rgba(79,163,165,0.1)] rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                🏫
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold text-text-primary mb-1 tracking-[0.3px]">
                  District &amp; School Partnerships
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Interested in piloting Teaching Labs at your school? We&apos;re scheduling early access now.
                </p>
              </div>
            </div>

            {/* Speaking & Press card */}
            <div className="card-accent flex gap-[18px] items-start p-6 rounded-[20px] mb-4 bg-card-bg shadow-[var(--card-shadow,0_2px_20px_rgba(20,33,61,0.05))] hover:-translate-y-1 hover:shadow-[var(--card-hover-shadow,0_8px_40px_rgba(20,33,61,0.10))] transition-all duration-300 relative overflow-hidden">
              <div className="w-11 h-11 bg-[rgba(79,163,165,0.1)] rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                🎤
              </div>
              <div>
                <h3 className="font-heading text-sm font-bold text-text-primary mb-1 tracking-[0.3px]">
                  Speaking &amp; Press
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Conference panels, podcast appearances, or media inquiries — we&apos;re happy to connect.
                </p>
              </div>
            </div>

            {/* Audience tags */}
            <div className="mt-8">
              <h3 className="font-heading text-[11px] font-bold tracking-[2px] uppercase text-text-muted mb-3.5">
                I am a...
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Classroom Teacher',
                  'School Administrator',
                  'District Leader',
                  'EdTech Investor',
                  'Parent',
                  'Student',
                  'Researcher',
                ].map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 rounded-full font-heading text-[13px] font-medium border border-border text-text-secondary bg-card-bg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Contact Form ── */}
          <ContactForm />
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: 'linear-gradient(180deg, #14213D 0%, #1a2a45 100%)',
          borderTop: '1px solid rgba(240,201,93,0.2)',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-12 py-[72px] max-md:px-6 max-md:py-12">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12 max-md:grid-cols-1 max-md:gap-8">

            {/* Brand */}
            <div>
              <div className="font-heading text-xl font-bold text-white mb-4">Teaching Labs</div>
              <p className="text-sm leading-[1.7] text-white/55 mb-5 max-w-[280px]">
                AI-powered teaching platform that learns how you teach and helps every student get the support they need.
              </p>
              <div className="inline-flex items-center gap-2 font-heading text-xs font-semibold text-teal bg-[rgba(79,163,165,0.1)] px-4 py-2 rounded-full border border-[rgba(79,163,165,0.2)]">
                <IconStar />
                FERPA &amp; COPPA Compliant
              </div>
            </div>

            {/* Platform */}
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-white/35 mb-5">
                Platform
              </div>
              <ul className="space-y-3 list-none">
                {[
                  { href: '/for-teachers', label: 'For Teachers' },
                  { href: '/for-students', label: 'For Students' },
                  { href: '/for-districts', label: 'For Districts' },
                  { href: '/for-parents', label: 'For Parents' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-white/55 hover:text-gold transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-white/35 mb-5">
                Company
              </div>
              <ul className="space-y-3 list-none">
                {[
                  { href: '/our-story', label: 'Our Story' },
                  { href: '/how-it-works', label: 'How It Works' },
                  { href: '/pricing', label: 'Pricing' },
                  { href: '/contact', label: 'Contact' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-white/55 hover:text-gold transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-white/35 mb-5">
                Legal
              </div>
              <ul className="space-y-3 list-none">
                {[
                  { href: '#', label: 'Privacy Policy' },
                  { href: '#', label: 'Terms of Service' },
                  { href: '#', label: 'Cookie Policy' },
                  { href: '#', label: 'Accessibility' },
                ].map(({ href, label }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-white/55 hover:text-gold transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/[0.08] pt-8 text-center text-[13px] text-white/35">
            &copy; 2026 Intellectual Creations / Teaching Labs. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
