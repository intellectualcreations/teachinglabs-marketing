import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingNav from '@/components/shared/MarketingNav';
import ScrollReveal from '@/components/shared/ScrollReveal';

export const metadata: Metadata = {
  title: 'Pricing — Teaching Labs',
  description:
    'Simple, transparent pricing for Teaching Labs. Always free for every teacher. Upgrade when you want the full experience.',
};

/* ─── Icons ─── */

function IconChevronDown() {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3 h-3">
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

function IconCheck() {
  return (
    <span className="absolute left-0 text-teal font-bold text-sm">✓</span>
  );
}

/* ─── Pricing card feature list item ─── */
function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="relative pl-6 py-2 text-sm text-text-secondary border-b border-border/50 last:border-b-0 leading-snug">
      <IconCheck />
      {children}
    </li>
  );
}

/* ─── Pricing Card ─── */
interface PricingCardProps {
  tier: string;
  price: string;
  priceSub: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  ctaVariant: 'primary' | 'secondary' | 'amber';
  featured?: boolean;
  priceSmall?: boolean;
}

function PricingCard({
  tier,
  price,
  priceSub,
  description,
  features,
  ctaLabel,
  ctaHref,
  ctaVariant,
  featured = false,
  priceSmall = false,
}: PricingCardProps) {
  const ctaClasses = {
    primary:
      'bg-teal text-white hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(79,163,165,0.35)]',
    secondary:
      'bg-transparent text-teal border-4 border-teal hover:bg-teal hover:text-white hover:-translate-y-0.5',
    amber:
      'bg-gold text-deep-navy hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(240,201,93,0.35)]',
  };

  return (
    <div
      className={[
        'card-accent relative bg-card-bg rounded-[20px] px-7 py-10 text-center overflow-hidden',
        'shadow-[0_2px_20px_rgba(20,33,61,0.05)] hover:shadow-[0_8px_40px_rgba(20,33,61,0.10)]',
        'hover:-translate-y-1.5 transition-all duration-300',
        featured ? 'border border-teal shadow-[0_4px_20px_rgba(79,163,165,0.15)]' : 'border border-border',
      ].join(' ')}
    >
      {/* Light mode left accent bar */}
      <div className="dark:hidden absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal to-teal/30 rounded-l-[20px]" />

      {/* Featured badge */}
      {featured && (
        <div className="absolute top-0 left-0 right-0 bg-teal text-white font-heading text-xs font-bold py-1.5 tracking-[0.5px] uppercase">
          Most Popular
        </div>
      )}

      {/* Tier name */}
      <div className={`font-heading text-xs font-bold tracking-[1.5px] uppercase text-teal mb-3 ${featured ? 'mt-6' : 'mt-2'}`}>
        {tier}
      </div>

      {/* Price */}
      <div className={`font-heading font-extrabold text-text-primary mb-1 ${priceSmall ? 'text-3xl' : 'text-[40px]'}`}>
        {price}
      </div>

      {/* Price sub */}
      <div className="text-sm text-text-muted mb-6">{priceSub}</div>

      {/* Description */}
      <p className="text-[15px] text-text-secondary leading-relaxed mb-7 min-h-[48px]">
        {description}
      </p>

      {/* Features */}
      <ul className="text-left mb-8 list-none">
        {features.map((f) => (
          <FeatureItem key={f}>{f}</FeatureItem>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href={ctaHref}
        className={`inline-block px-7 py-3 rounded-full font-heading text-sm font-bold transition-all duration-300 ${ctaClasses[ctaVariant]}`}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

/* ─── Page ─── */
export default function PricingPage() {
  return (
    <div className="min-h-screen bg-warm-white text-text-secondary overflow-x-hidden" style={{ fontFamily: "var(--font-open-sans, 'Open Sans', sans-serif)" }}>

      {/* ── NAV ── */}
      <MarketingNav />
      <ScrollReveal />

      {/* ── HERO ── */}
      <section className="relative flex items-center justify-center overflow-hidden bg-warm-white" style={{ minHeight: '50vh', padding: '80px 0 60px' }}>
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div
            className="absolute w-[500px] h-[500px] rounded-full top-[10%] left-[15%] max-md:w-[300px] max-md:h-[300px]"
            style={{ background: '#4FA3A5', opacity: 'var(--blob-teal-opacity, 0.08)', filter: 'blur(80px)', animation: 'blobDrift1 12s ease-in-out infinite' }}
          />
          <div
            className="absolute w-[450px] h-[450px] rounded-full top-[30%] right-[10%] max-md:w-[280px] max-md:h-[280px]"
            style={{ background: '#F0C95D', opacity: 'var(--blob-gold-opacity, 0.10)', filter: 'blur(80px)', animation: 'blobDrift2 14s ease-in-out infinite' }}
          />
        </div>

        <div className="relative z-10 text-center max-w-[900px] px-12 max-md:px-6">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-6">
            <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
            Pricing
          </div>

          {/* Headline */}
          <h1
            className="font-heading font-extrabold tracking-[-2px] leading-[1.15] text-text-primary mb-6"
            style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}
          >
            Simple, Transparent{' '}
            <span style={{ background: 'linear-gradient(135deg, #4FA3A5, #F0C95D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Pricing
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl leading-[1.7] text-text-secondary max-w-[620px] mx-auto">
            Always free for every teacher. Upgrade when you want the full experience.
          </p>
        </div>
      </section>

      {/* ── PRICING GRID ── */}
      <section className="fade-up bg-warm-white">
        <div className="max-w-[1100px] mx-auto px-12 pb-20 max-md:px-6 max-md:pb-16">
          <div className="grid grid-cols-4 gap-6 max-md:grid-cols-1 max-md:max-w-[400px] max-md:mx-auto md:max-lg:grid-cols-2">

            {/* FREE */}
            <PricingCard
              tier="Free"
              price="$0"
              priceSub="forever"
              description="Real AI-guided learning for your classroom. No credit card required."
              features={[
                'Monthly usage included (simple usage meter)',
                'Full student conversations',
                'Standard AI model',
                'Basic student analytics',
                'Standards-aligned content',
                'Community access',
              ]}
              ctaLabel="Get Started Free"
              ctaHref="/waitlist"
              ctaVariant="primary"
            />

            {/* PRO */}
            <PricingCard
              tier="Pro"
              price="$15"
              priceSub="per month"
              description="The full Teacher Twin experience. Your voice, your style, your expertise."
              features={[
                'Everything in Free',
                'Unlimited usage',
                'Advanced AI model',
                'Voice cloning (your Teacher Twin)',
                'Advanced student analytics',
                'Custom AI personas',
                'Priority support',
              ]}
              ctaLabel="Join Waitlist"
              ctaHref="/waitlist"
              ctaVariant="amber"
              featured
            />

            {/* SCHOOL */}
            <PricingCard
              tier="School"
              price="Let's Talk"
              priceSub="custom pricing by school size"
              description="Site-wide deployment with admin visibility and FERPA compliance."
              features={[
                'Site license for all teachers',
                'Admin dashboard',
                'LMS integration',
                'FERPA & COPPA compliant',
                'Onboarding support',
              ]}
              ctaLabel="Contact Us"
              ctaHref="/contact"
              ctaVariant="secondary"
              priceSmall
            />

            {/* DISTRICT */}
            <PricingCard
              tier="District"
              price="Let's Talk"
              priceSub="custom pricing by district size"
              description="Multi-school deployment with district-wide analytics and dedicated support."
              features={[
                'Multi-school license',
                'District analytics dashboard',
                'Custom integrations',
                'Dedicated success manager',
                'SLA guarantee',
              ]}
              ctaLabel="Contact Us"
              ctaHref="/contact"
              ctaVariant="secondary"
              priceSmall
            />

          </div>
        </div>
      </section>

      {/* ── EVERY PLAN INCLUDES ── */}
      <div className="bg-bg-secondary">
        <div className="max-w-[1200px] mx-auto px-12 py-20 text-center max-md:px-6 max-md:py-16">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-4">
            <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
            Every Plan
          </div>

          <h2
            className="font-heading font-extrabold tracking-[-1px] text-text-primary mb-6"
            style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}
          >
            Every Plan Includes
          </h2>

          <div className="space-y-2">
            {[
              'FERPA & COPPA compliant infrastructure',
              'Brain science-based learning design',
              'Teacher-guided AI (never autonomous)',
              'Real content integration (textbooks, labs, projects)',
            ].map((item) => (
              <p key={item} className="text-base text-text-secondary">
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA SECTION ── */}
      <section
        className="fade-up relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #14213D 0%, #1a3a4a 50%, #1d4a52 100%)' }}
      >
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{ background: 'radial-gradient(ellipse at center, rgba(240,201,93,0.12) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 max-w-[800px] mx-auto px-12 py-[120px] text-center max-md:px-6 max-md:py-20">
          <div className="font-heading text-xs font-bold tracking-[4px] uppercase text-white/50 mb-5">
            Get Started
          </div>
          <h2
            className="font-heading font-extrabold tracking-[-1.5px] text-white mb-5 leading-[1.15]"
            style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
          >
            Ready to Get Started?
          </h2>
          <p className="text-lg leading-[1.7] text-white/65 mb-10 max-w-[600px] mx-auto">
            Join the waitlist and be among the first to use Teaching Labs.
          </p>
          <Link
            href="/waitlist"
            className="cta-button-pulse inline-flex items-center font-heading text-[17px] font-bold bg-gold text-deep-navy px-12 py-4 rounded-full hover:-translate-y-0.5 transition-transform duration-300"
          >
            Join Waitlist
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'linear-gradient(180deg, #14213D 0%, #1a2a45 100%)', borderTop: '1px solid rgba(240,201,93,0.2)' }}>
        <div className="max-w-[1200px] mx-auto px-12 py-[72px] max-md:px-6">
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
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-white/35 mb-5">Platform</div>
              <ul className="space-y-3 list-none">
                {[
                  { href: '/for-teachers', label: 'For Teachers' },
                  { href: '/for-students', label: 'For Students' },
                  { href: '/for-districts', label: 'For Districts' },
                  { href: '/for-parents', label: 'For Parents' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-white/55 hover:text-gold transition-colors duration-200">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-white/35 mb-5">Company</div>
              <ul className="space-y-3 list-none">
                {[
                  { href: '/our-story', label: 'Our Story' },
                  { href: '/how-it-works', label: 'How It Works' },
                  { href: '/pricing', label: 'Pricing' },
                  { href: '/contact', label: 'Contact' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-white/55 hover:text-gold transition-colors duration-200">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-white/35 mb-5">Legal</div>
              <ul className="space-y-3 list-none">
                {[
                  { href: '#', label: 'Privacy Policy' },
                  { href: '#', label: 'Terms of Service' },
                  { href: '#', label: 'Cookie Policy' },
                  { href: '#', label: 'Accessibility' },
                ].map(({ href, label }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-white/55 hover:text-gold transition-colors duration-200">
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
