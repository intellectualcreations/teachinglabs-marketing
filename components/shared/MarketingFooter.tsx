import Link from 'next/link';

function IconStar() {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" className="w-3 h-3">
      <path d="M7 0l1.5 4.5H13l-3.5 2.7 1.3 4.3L7 8.8 3.2 11.5l1.3-4.3L1 4.5h4.5z" />
    </svg>
  );
}

export default function MarketingFooter() {
  return (
    <footer className="relative overflow-hidden bg-white dark:bg-transparent">
      {/* Dark mode: gradient with top blend */}
      <div className="absolute top-0 left-0 right-0 h-[200px] hidden dark:block pointer-events-none z-[2]"
        style={{ background: 'linear-gradient(to bottom, #0a1128, transparent)' }} />
      <div className="absolute inset-0 pointer-events-none hidden dark:block" aria-hidden="true"
        style={{ background: 'linear-gradient(180deg, var(--color-deep-navy) 0%, #1a2a45 100%)' }} />
      <div className="relative z-10 max-w-[1200px] mx-auto px-12 py-[72px] max-md:px-6">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12 max-md:grid-cols-1 max-md:gap-8">

          {/* Brand */}
          <div>
            <div className="font-heading text-xl font-bold text-text-primary mb-4">Teaching Labs</div>
            <p className="text-sm leading-[1.7] text-text-secondary mb-5 max-w-[280px]">
              AI-powered teaching platform that learns how you teach and helps every student get the support they need.
            </p>
            <div className="inline-flex items-center gap-2 font-heading text-xs font-semibold text-gold dark:text-teal bg-[rgba(64,86,244,0.08)] dark:bg-[rgba(0,246,237,0.1)] px-4 py-2 rounded-full border border-[rgba(64,86,244,0.15)] dark:border-[rgba(0,246,237,0.2)]">
              <IconStar />
              FERPA &amp; COPPA Compliant
            </div>
          </div>

          {/* Platform */}
          <div>
            <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-text-muted mb-5">Platform</div>
            <ul className="space-y-3 list-none">
              {[
                { href: '/for-teachers', label: 'For Teachers' },
                { href: '/for-students', label: 'For Students' },
                { href: '/for-districts', label: 'For Districts' },
                { href: '/for-parents', label: 'For Parents' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-text-secondary hover:text-gold transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-text-muted mb-5">Company</div>
            <ul className="space-y-3 list-none">
              {[
                { href: '/our-story', label: 'Our Story' },
                { href: '/how-it-works', label: 'How It Works' },
                { href: '/pricing', label: 'Pricing' },
                { href: '/contact', label: 'Contact' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-text-secondary hover:text-gold transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-text-muted mb-5">Legal</div>
            <ul className="space-y-3 list-none">
              {[
                { href: '#', label: 'Privacy Policy' },
                { href: '#', label: 'Terms of Service' },
                { href: '#', label: 'Cookie Policy' },
                { href: '#', label: 'Accessibility' },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-text-secondary hover:text-gold transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-black/10 dark:border-white/[0.08] pt-8 text-center text-[13px] text-text-muted">
          &copy; 2026 Intellectual Creations / Teaching Labs. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
