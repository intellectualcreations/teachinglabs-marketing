import type { Metadata } from 'next';
import Link from 'next/link';
import ScrollReveal from '@/components/shared/ScrollReveal';
import MarketingNav from '@/components/shared/MarketingNav';

export const metadata: Metadata = {
  title: 'Pricing — Teaching Labs',
  description:
    'Simple, transparent pricing. Always free for every teacher. Upgrade when you want the full experience.',
};

/* ─── SVG Icons ─── */

function IconStar() {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M7 0l1.5 4.5H13l-3.5 2.7 1.3 4.3L7 8.8 3.2 11.5l1.3-4.3L1 4.5h4.5z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-teal flex-shrink-0 mt-0.5">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

/* ─── Eyebrow label ─── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="eyebrow-plum flex items-center justify-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase mb-4">
      <span className="eyebrow-dot w-2 h-2 rounded-full flex-shrink-0" />
      {children}
    </div>
  );
}

/* ─── Main page ─── */
export default function Pricing() {
  const plans = [
    {
      title: 'Individual',
      price: 'FREE',
      subtitle: '',
      description: 'Be among the first to experience AI-powered teaching. Full platform access, no credit card required.',
      features: [
        'Student conversations',
        'Standards-aligned content',
        'Student analytics',
        'Custom AI personas',
      ],
      cta: 'Join the Waitlist',
      ctaHref: '/waitlist',
      highlighted: true,
    },
    {
      title: 'Classroom',
      price: "Let's Talk",
      subtitle: 'pricing coming soon',
      description: 'The full Teacher Twin experience for your classroom. Your voice, your style, your expertise.',
      features: [
        'Everything in Early Access',
        'Voice cloning (your Teacher Twin)',
        'Unlimited usage',
        'Advanced AI model',
        'Advanced student analytics',
        'Community access',
        'Priority support',
        'Dedicated onboarding',
      ],
      cta: 'Contact Us',
      ctaHref: '/contact',
    },
    {
      title: 'School',
      price: "Let's Talk",
      subtitle: 'pricing coming soon',
      description: 'Site-wide deployment with admin visibility and FERPA compliance.',
      features: [
        'Site license for all teachers',
        'Admin dashboard',
        'LMS integration',
        'FERPA & COPPA compliant',
        'Onboarding support',
      ],
      cta: 'Contact Us',
      ctaHref: '/contact',
    },
    {
      title: 'District',
      price: "Let's Talk",
      subtitle: 'pricing coming soon',
      description: 'Multi-school deployment with district-wide analytics and dedicated support.',
      features: [
        'Multi-school license',
        'District analytics dashboard',
        'Custom integrations',
        'Dedicated success manager',
        'SLA guarantee',
      ],
      cta: 'Contact Us',
      ctaHref: '/contact',
    },
  ];

  return (
    <>
      <MarketingNav />
      <ScrollReveal />

      {/* ── HERO + PRICING CARDS (one section) ── */}
      <section className="relative overflow-hidden bg-warm-white dark:bg-deep-navy pt-32 pb-16 max-md:pt-24 max-md:pb-10">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="blob-teal absolute w-[600px] h-[600px] rounded-full top-[4%] left-[5%] max-md:w-[350px] max-md:h-[350px] opacity-[0.3] dark:opacity-[0.2]"
            style={{ background: '#00F6ED', filter: 'blur(100px)' }} />
          <div className="blob-gold absolute w-[550px] h-[550px] rounded-full top-[10%] right-[2%] max-md:w-[320px] max-md:h-[320px] opacity-[0.3] dark:opacity-[0.18]"
            style={{ background: '#4056F4', filter: 'blur(100px)' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full top-[55%] left-[15%] opacity-[0.15] dark:opacity-[0.1] max-md:hidden"
            style={{ background: '#561F37', filter: 'blur(100px)' }} />
        </div>

        {/* Headline */}
        <div className="relative z-10 text-center max-w-[900px] mx-auto px-12 max-md:px-6 mb-8">
          <div className="eyebrow-plum inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase mb-6">
            <span className="eyebrow-dot w-2 h-2 rounded-full flex-shrink-0" />
            Pricing
          </div>

          <h1 className="font-heading font-extrabold tracking-[-2px] leading-[1.15] mb-6"
            style={{ fontSize: 'clamp(38px, 6vw, 68px)' }}>
            <span className="hero-text-black hero-word hero-word-0 mr-2">Simple,</span>
            <span className="hero-text-black hero-word hero-word-1 mr-2">Transparent</span>
            <span
              className="hero-word hero-word-2"
              style={{
                background: 'linear-gradient(135deg, #00F6ED 0%, #4056F4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Pricing
            </span>
          </h1>

          <p className="hero-subtitle-anim hero-text-black font-body text-xl leading-[1.7] max-w-[620px] mx-auto">
            Always free for every teacher. Upgrade when you want the full experience.
          </p>
        </div>

        {/* Cards */}
        <div className="relative z-10 max-w-[1200px] mx-auto px-12 max-md:px-6">
            <div className="grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1 fade-up">
              {plans.map((plan) => (
                <div
                  key={plan.title}
                  className={`pricing-card relative rounded-[20px] p-8 overflow-hidden transition-all duration-300 flex flex-col ${plan.highlighted ? 'border-4 border-coral dark:border-teal' : 'border border-black/10 dark:border-white/[0.08]'}`}
                >
                  {/* Row 1: Title — bottom-aligned, bigger than price */}
                  <div className="min-h-[64px] flex items-end justify-center text-center w-full">
                    <h3 className="font-heading text-[22px] font-bold tracking-[2px] uppercase text-coral dark:text-teal leading-tight">
                      {plan.title}
                    </h3>
                  </div>
                  {/* Divider line under title */}
                  <div className="w-full h-[3px] bg-[#561F37] dark:bg-[#e63570] rounded-sm mt-3" />

                  {/* Row 2: Price — centered, smaller than title */}
                  <div className="h-[48px] flex items-center justify-center mt-4">
                    <span className="font-heading font-extrabold text-[28px] " style={{ color: '#000000' }}>
                      {plan.price}
                    </span>
                  </div>

                  {/* Row 3: Subtitle — centered */}
                  <div className="h-[28px] flex items-start justify-center mt-2">
                    <p className="text-[13px] " style={{ color: '#000000' }}>{plan.subtitle}</p>
                  </div>

                  {/* Row 4: Description — centered */}
                  <div className="min-h-[100px] flex items-start justify-center mt-6">
                    <p className="text-[14px] leading-[1.6]  text-center" style={{ color: '#000000' }}>{plan.description}</p>
                  </div>

                  {/* Row 5: Features — grows to fill, centered */}
                  <ul className="space-y-6 mt-8 flex-grow">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[13px]  leading-[1.5]" style={{ color: '#000000' }}>
                        <IconCheck />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Row 6: Button — pinned to bottom, same size */}
                  <div className="mt-6">
                    <Link
                      href={plan.ctaHref}
                      className="flex justify-center items-center w-full font-heading text-[14px] font-bold px-6 py-3 rounded-full transition-all duration-300 hover:-translate-y-0.5 bg-transparent text-deep-navy  border-3 border-coral dark:border-teal hover:bg-coral dark:hover:bg-teal hover:text-white dark:hover:text-deep-navy hover:shadow-[0_6px_28px_rgba(86,31,55,0.3)] dark:hover:shadow-[0_6px_28px_rgba(0,246,237,0.35)]"
                    >
                      {plan.cta}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </section>

      <main>

        {/* ── EVERY PLAN INCLUDES ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[800px] mx-auto px-12 py-12 max-md:px-6 max-md:py-8">
            <div className="text-center mb-10 fade-up">
              <Eyebrow>Every Plan</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-black "
                style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
                Every Plan Includes
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-[#561F37] dark:bg-[#e63570] rounded-sm mx-auto mt-3" />
            </div>
            <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1 fade-up">
              {[
                'FERPA & COPPA compliant infrastructure',
                'Brain science-based learning design',
                'Teacher-guided AI (never autonomous)',
                'Real content integration (textbooks, labs, projects)',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-[15px] text-black  leading-[1.7]">
                  <IconCheck />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA SECTION ── */}
        <section className="relative overflow-hidden bg-warm-white dark:bg-transparent" style={{ background: undefined }}>
          <div className="absolute top-0 left-0 right-0 h-[200px] dark:hidden pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, #F7F7F8, transparent)' }} />
          <div className="absolute top-0 left-0 right-0 h-[200px] hidden dark:block pointer-events-none z-[2]"
            style={{ background: 'linear-gradient(to bottom, #0a1128, transparent)' }} />
          <div className="absolute inset-0 pointer-events-none dark:hidden" aria-hidden="true">
            <div className="absolute w-[500px] h-[500px] rounded-full top-[10%] left-[-10%] opacity-[0.25]"
              style={{ background: '#00F6ED', filter: 'blur(120px)' }} />
            <div className="absolute w-[450px] h-[450px] rounded-full top-[5%] right-[-8%] opacity-[0.25]"
              style={{ background: '#4056F4', filter: 'blur(120px)' }} />
            <div className="absolute w-[350px] h-[350px] rounded-full bottom-[10%] left-[40%] opacity-[0.12]"
              style={{ background: '#7B2D4A', filter: 'blur(120px)' }} />
          </div>
          <div className="absolute inset-0 pointer-events-none hidden dark:block" aria-hidden="true"
            style={{ background: 'linear-gradient(180deg, #1a3a4a 0%, #152a3a 40%, #0a1128 100%)' }} />
          <div className="absolute inset-0 pointer-events-none hidden dark:block" aria-hidden="true"
            style={{ background: 'radial-gradient(ellipse at center, rgba(64,86,244,0.12) 0%, transparent 70%)' }} />

          <div className="relative z-10 max-w-[800px] mx-auto px-12 py-24 text-center max-md:px-6 max-md:py-14">
            <div className="eyebrow-plum font-heading text-xs font-bold tracking-[4px] uppercase mb-5 ">
              Get Started
            </div>
            <h2 className="hero-text-black font-heading font-extrabold tracking-[-1.5px] mb-5 leading-[1.15]"
              style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
              Ready to Get Started?
            </h2>
            <p className="hero-text-black text-lg leading-[1.7] mb-10 max-w-[600px] mx-auto dark:!text-white/65">
              Join the waitlist and be among the first to use Teaching Labs.
            </p>
            <Link
              href="/waitlist"
              className="inline-flex justify-center items-center font-heading text-[17px] font-bold bg-transparent text-deep-navy  border-4 border-gold hover:bg-gold hover:text-white px-12 py-4 rounded-full hover:-translate-y-0.5 transition-transform duration-300 shadow-[0_4px_20px_rgba(64,86,244,0.3)]"
            >
              Join Waitlist
            </Link>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="relative overflow-hidden bg-warm-white dark:bg-transparent">
        <div className="absolute inset-0 pointer-events-none dark:hidden" aria-hidden="true">
          <div className="absolute w-[500px] h-[500px] rounded-full top-[-20%] left-[-5%] opacity-[0.2]"
            style={{ background: '#00F6ED', filter: 'blur(130px)' }} />
          <div className="absolute w-[450px] h-[450px] rounded-full bottom-[-10%] right-[-5%] opacity-[0.2]"
            style={{ background: '#4056F4', filter: 'blur(130px)' }} />
        </div>
        <div className="absolute top-0 left-0 right-0 h-[200px] hidden dark:block pointer-events-none z-[2]"
          style={{ background: 'linear-gradient(to bottom, #0a1128, transparent)' }} />
        <div className="absolute inset-0 pointer-events-none hidden dark:block" aria-hidden="true"
          style={{ background: 'linear-gradient(180deg, var(--color-deep-navy) 0%, #1a2a45 100%)' }} />
        <div className="relative z-10 max-w-[1200px] mx-auto px-12 py-[72px] max-md:px-6">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12 max-md:grid-cols-1 max-md:gap-8">
            <div>
              <div className="font-heading text-xl font-bold text-black  mb-4">Teaching Labs</div>
              <p className="text-sm leading-[1.7] text-black/60 /55 mb-5 max-w-[280px]">
                AI-powered teaching platform that learns how you teach and helps every student get the support they need.
              </p>
              <div className="inline-flex items-center gap-2 font-heading text-xs font-semibold text-gold dark:text-teal bg-[rgba(64,86,244,0.08)] dark:bg-[rgba(0,246,237,0.1)] px-4 py-2 rounded-full border border-[rgba(64,86,244,0.15)] dark:border-[rgba(0,246,237,0.2)]">
                <IconStar />
                FERPA &amp; COPPA Compliant
              </div>
            </div>
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-black/40 /35 mb-5">Platform</div>
              <ul className="space-y-3 list-none">
                {[
                  { href: '/for-teachers', label: 'For Teachers' },
                  { href: '/for-students', label: 'For Students' },
                  { href: '/for-districts', label: 'For Districts' },
                  { href: '/for-parents', label: 'For Parents' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-black/60 /55 hover:text-gold transition-colors duration-200">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-black/40 /35 mb-5">Company</div>
              <ul className="space-y-3 list-none">
                {[
                  { href: '/our-story', label: 'Our Story' },
                  { href: '/how-it-works', label: 'How It Works' },
                  { href: '/pricing', label: 'Pricing' },
                  { href: '/contact', label: 'Contact' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-black/60 /55 hover:text-gold transition-colors duration-200">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-black/40 /35 mb-5">Legal</div>
              <ul className="space-y-3 list-none">
                {[
                  { href: '#', label: 'Privacy Policy' },
                  { href: '#', label: 'Terms of Service' },
                  { href: '#', label: 'Cookie Policy' },
                  { href: '#', label: 'Accessibility' },
                ].map(({ href, label }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-black/60 /55 hover:text-gold transition-colors duration-200">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-black/10 dark:border-white/[0.08] pt-8 text-center text-[13px] text-black/40 /35">
            &copy; 2026 Intellectual Creations / Teaching Labs. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
