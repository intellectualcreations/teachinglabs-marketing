import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingNav from '@/components/shared/MarketingNav';

export const metadata: Metadata = {
  title: 'Pricing — Teaching Labs',
  description: 'Simple, transparent pricing for Teaching Labs. Always free for every teacher. Upgrade when you want the full experience.',
};

export default function PricingPage() {
  return (
    <>
      <MarketingNav />

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-warm-white dark:bg-deep-navy transition-colors duration-[400ms] py-[80px] pb-[60px] max-md:py-[60px] max-md:pb-[40px]">
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[80px] bg-teal opacity-[0.08] dark:opacity-[0.15] top-[10%] left-[15%] animate-[blobDrift1_12s_ease-in-out_infinite]" />
          <div className="absolute w-[450px] h-[450px] rounded-full blur-[80px] bg-gold opacity-[0.1] dark:opacity-[0.12] top-[30%] right-[10%] animate-[blobDrift2_14s_ease-in-out_infinite]" />
          <div className="absolute w-[350px] h-[350px] rounded-full blur-[80px] bg-coral opacity-0 dark:opacity-[0.06] top-[40%] left-[40%] animate-[blobDrift3_10s_ease-in-out_infinite]" />
        </div>

        <div className="relative z-[2] text-center max-w-[900px] px-12 max-md:px-6">
          <div className="font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-6 inline-flex items-center before:content-[''] before:inline-block before:w-2 before:h-2 before:bg-gold before:rounded-full before:mr-3 before:flex-shrink-0">
            Pricing
          </div>
          <h1 className="font-heading text-[clamp(40px,6vw,72px)] font-extrabold tracking-[-2px] leading-[1.1] text-[var(--text-dark)] dark:text-white mb-6">
            Simple, Transparent{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #00F6ED, #4056F4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Pricing
            </span>
          </h1>
          <p className="font-body text-xl leading-[1.7] text-[var(--text-body)] dark:text-white/70 max-w-[620px] mx-auto">
            Always free for every teacher. Upgrade when you want the full experience.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="bg-warm-white dark:bg-deep-navy transition-colors duration-[400ms]">
        <div className="grid grid-cols-4 gap-6 max-w-[1100px] mx-auto px-12 pb-20 max-md:grid-cols-1 max-md:max-w-[400px] max-md:px-6 max-md:pb-[60px] md:max-lg:grid-cols-2 md:max-lg:max-w-[700px]">

          {/* FREE */}
          <div className="fade-up bg-white dark:bg-white/[0.04] border border-transparent dark:border-white/[0.08] rounded-[20px] px-7 py-10 text-center relative overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)] hover:-translate-y-1.5 hover:shadow-[0_8px_40px_rgba(20,33,61,0.1)] dark:hover:shadow-[0_8px_32px_rgba(64,86,244,0.08),0_4px_20px_rgba(255,107,107,0.06)] transition-all duration-[400ms] before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-teal before:to-teal/30 before:rounded-l-[20px] dark:before:hidden">
            <div className="font-heading text-sm font-bold tracking-[1.5px] uppercase text-teal mb-3 mt-2">Free</div>
            <div className="font-heading text-[40px] font-extrabold text-[var(--text-dark)] dark:text-white mb-1">$0</div>
            <div className="text-sm text-[var(--text-muted)] dark:text-white/45 mb-6">forever</div>
            <p className="font-body text-[15px] text-[var(--text-body)] dark:text-white/70 leading-[1.6] mb-7 min-h-[48px]">
              Real AI-guided learning for your classroom. No credit card required.
            </p>
            <ul className="list-none text-left mb-8">
              {[
                'Monthly usage included (simple usage meter)',
                'Full student conversations',
                'Standard AI model',
                'Basic student analytics',
                'Standards-aligned content',
                'Community access',
              ].map((item) => (
                <li
                  key={item}
                  className="font-body text-sm text-[var(--text-body)] dark:text-white/70 py-2 border-b border-gray-500/10 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-teal before:font-bold"
                >
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="https://teaching-labs-demo.netlify.app/landing-page/hero-banner.html"
              className="inline-block px-7 py-3 rounded-full font-heading text-sm font-bold bg-transparent text-deep-navy dark:text-white border-4 border-coral hover:bg-coral hover:text-white hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(86,31,55,0.35)] transition-all duration-300"
            >
              Get Started Free
            </Link>
          </div>

          {/* PRO (Featured) */}
          <div className="fade-up bg-white dark:bg-white/[0.04] border border-teal dark:border-teal rounded-[20px] px-7 py-10 text-center relative overflow-hidden shadow-[0_4px_20px_rgba(0,246,237,0.15)] hover:-translate-y-1.5 hover:shadow-[0_8px_40px_rgba(20,33,61,0.1)] dark:hover:shadow-[0_8px_32px_rgba(64,86,244,0.08),0_4px_20px_rgba(255,107,107,0.06)] transition-all duration-[400ms]">
            {/* Most Popular badge */}
            <div className="absolute top-0 left-0 right-0 bg-teal text-white font-heading text-xs font-bold py-1.5 px-4 tracking-[0.5px] uppercase text-center">
              Most Popular
            </div>
            <div className="font-heading text-sm font-bold tracking-[1.5px] uppercase text-teal mb-3 mt-6">Pro</div>
            <div className="font-heading text-[40px] font-extrabold text-[var(--text-dark)] dark:text-white mb-1">$15</div>
            <div className="text-sm text-[var(--text-muted)] dark:text-white/45 mb-6">per month</div>
            <p className="font-body text-[15px] text-[var(--text-body)] dark:text-white/70 leading-[1.6] mb-7 min-h-[48px]">
              The full Teacher Twin experience. Your voice, your style, your expertise.
            </p>
            <ul className="list-none text-left mb-8">
              {[
                'Everything in Free',
                'Unlimited usage',
                'Advanced AI model',
                'Voice cloning (your Teacher Twin)',
                'Advanced student analytics',
                'Custom AI personas',
                'Priority support',
              ].map((item) => (
                <li
                  key={item}
                  className="font-body text-sm text-[var(--text-body)] dark:text-white/70 py-2 border-b border-gray-500/10 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-teal before:font-bold"
                >
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="https://teaching-labs-demo.netlify.app/landing-page/hero-banner.html"
              className="inline-block px-7 py-3 rounded-full font-heading text-sm font-bold bg-transparent text-white border-4 border-gold hover:bg-gold hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(64,86,244,0.35)] transition-all duration-300"
            >
              Join Waitlist
            </Link>
          </div>

          {/* SCHOOL */}
          <div className="fade-up bg-white dark:bg-white/[0.04] border border-transparent dark:border-white/[0.08] rounded-[20px] px-7 py-10 text-center relative overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)] hover:-translate-y-1.5 hover:shadow-[0_8px_40px_rgba(20,33,61,0.1)] dark:hover:shadow-[0_8px_32px_rgba(64,86,244,0.08),0_4px_20px_rgba(255,107,107,0.06)] transition-all duration-[400ms] before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-teal before:to-teal/30 before:rounded-l-[20px] dark:before:hidden">
            <div className="font-heading text-sm font-bold tracking-[1.5px] uppercase text-teal mb-3 mt-2">School</div>
            <div className="font-heading text-[28px] font-extrabold text-[var(--text-dark)] dark:text-white mb-1">Let&apos;s Talk</div>
            <div className="text-sm text-[var(--text-muted)] dark:text-white/45 mb-6">custom pricing by school size</div>
            <p className="font-body text-[15px] text-[var(--text-body)] dark:text-white/70 leading-[1.6] mb-7 min-h-[48px]">
              Site-wide deployment with admin visibility and FERPA compliance.
            </p>
            <ul className="list-none text-left mb-8">
              {[
                'Site license for all teachers',
                'Admin dashboard',
                'LMS integration',
                'FERPA & COPPA compliant',
                'Onboarding support',
              ].map((item) => (
                <li
                  key={item}
                  className="font-body text-sm text-[var(--text-body)] dark:text-white/70 py-2 border-b border-gray-500/10 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-teal before:font-bold"
                >
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              className="inline-block px-7 py-3 rounded-full font-heading text-sm font-bold bg-transparent text-deep-navy dark:text-teal border-4 border-coral dark:border-teal hover:bg-coral dark:hover:bg-teal hover:text-white hover:-translate-y-0.5 transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>

          {/* DISTRICT */}
          <div className="fade-up bg-white dark:bg-white/[0.04] border border-transparent dark:border-white/[0.08] rounded-[20px] px-7 py-10 text-center relative overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)] hover:-translate-y-1.5 hover:shadow-[0_8px_40px_rgba(20,33,61,0.1)] dark:hover:shadow-[0_8px_32px_rgba(64,86,244,0.08),0_4px_20px_rgba(255,107,107,0.06)] transition-all duration-[400ms] before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-teal before:to-teal/30 before:rounded-l-[20px] dark:before:hidden">
            <div className="font-heading text-sm font-bold tracking-[1.5px] uppercase text-teal mb-3 mt-2">District</div>
            <div className="font-heading text-[28px] font-extrabold text-[var(--text-dark)] dark:text-white mb-1">Let&apos;s Talk</div>
            <div className="text-sm text-[var(--text-muted)] dark:text-white/45 mb-6">custom pricing by district size</div>
            <p className="font-body text-[15px] text-[var(--text-body)] dark:text-white/70 leading-[1.6] mb-7 min-h-[48px]">
              Multi-school deployment with district-wide analytics and dedicated support.
            </p>
            <ul className="list-none text-left mb-8">
              {[
                'Multi-school license',
                'District analytics dashboard',
                'Custom integrations',
                'Dedicated success manager',
                'SLA guarantee',
              ].map((item) => (
                <li
                  key={item}
                  className="font-body text-sm text-[var(--text-body)] dark:text-white/70 py-2 border-b border-gray-500/10 pl-6 relative before:content-['✓'] before:absolute before:left-0 before:text-teal before:font-bold"
                >
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              className="inline-block px-7 py-3 rounded-full font-heading text-sm font-bold bg-transparent text-deep-navy dark:text-teal border-4 border-coral dark:border-teal hover:bg-coral dark:hover:bg-teal hover:text-white hover:-translate-y-0.5 transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Every Plan Includes */}
      <div className="bg-[var(--bg-secondary)] dark:bg-[#0D1B30] transition-colors duration-[400ms]">
        <div className="fade-up max-w-[1200px] mx-auto px-12 py-20 text-center max-md:px-6 max-md:py-[60px]">
          <div className="font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-4 block text-center relative inline-flex items-center before:content-[''] before:inline-block before:w-2 before:h-2 before:bg-gold before:rounded-full before:mr-3 before:flex-shrink-0 mx-auto">
            Every Plan
          </div>
          <h2 className="font-heading text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-1px] text-[var(--text-dark)] dark:text-white mb-6">
            Every Plan Includes
          </h2>
          <p className="font-body text-base text-[var(--text-body)] dark:text-white/70 max-w-[500px] mx-auto mb-2">
            FERPA &amp; COPPA compliant infrastructure
          </p>
          <p className="font-body text-base text-[var(--text-body)] dark:text-white/70 max-w-[500px] mx-auto mb-2">
            Brain science-based learning design
          </p>
          <p className="font-body text-base text-[var(--text-body)] dark:text-white/70 max-w-[500px] mx-auto mb-2">
            Teacher-guided AI (never autonomous)
          </p>
          <p className="font-body text-base text-[var(--text-body)] dark:text-white/70 max-w-[500px] mx-auto mb-2">
            Real content integration (textbooks, labs, projects)
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #14213D 0%, #1a3a4a 50%, #1d4a52 100%)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(240, 201, 93, 0.12) 0%, transparent 70%)',
          }}
        />
        <div className="fade-up max-w-[800px] mx-auto px-12 py-[120px] text-center relative z-[2] max-md:px-6 max-md:py-20">
          <div className="font-heading text-xs font-bold tracking-[4px] uppercase text-white/50 mb-5">
            Get Started
          </div>
          <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-extrabold tracking-[-1.5px] text-white mb-5 leading-[1.15]">
            Ready to Get Started?
          </h2>
          <p className="font-body text-lg leading-[1.7] text-white/65 mb-10 max-w-[600px] mx-auto">
            Join the waitlist and be among the first to use Teaching Labs.
          </p>
          <Link
            href="https://teaching-labs-demo.netlify.app/landing-page/hero-banner.html"
            className="inline-flex items-center font-heading text-[17px] font-bold bg-transparent text-white border-4 border-gold hover:bg-gold px-12 py-4 rounded-full animate-[gentlePulse_2.5s_ease-in-out_infinite] hover:-translate-y-0.5 transition-transform duration-300"
          >
            Join Waitlist
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'linear-gradient(180deg, var(--color-deep-navy) 0%, #1a2a45 100%)', borderTop: '1px solid rgba(64,86,244,0.2)' }}>
        <div className="max-w-[1200px] mx-auto px-12 py-[72px] max-md:px-6">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12 max-md:grid-cols-1 max-md:gap-8">
            <div>
              <div className="font-heading text-xl font-bold text-white mb-4">Teaching Labs</div>
              <p className="text-sm leading-[1.7] text-white/55 mb-5 max-w-[280px]">AI-powered teaching platform that learns how you teach and helps every student get the support they need.</p>
              <div className="inline-flex items-center gap-2 font-heading text-xs font-semibold text-teal bg-[rgba(0,246,237,0.1)] px-4 py-2 rounded-full border border-[rgba(0,246,237,0.2)]">
                <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5"><path d="M7 0l1.5 4.5H13l-3.5 2.7 1.3 4.3L7 8.8 3.2 11.5l1.3-4.3L1 4.5h4.5z" /></svg>
                FERPA &amp; COPPA Compliant
              </div>
            </div>
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-white/35 mb-5">Platform</div>
              <ul className="space-y-3 list-none">
                {[{href:'/for-teachers',label:'For Teachers'},{href:'/for-students',label:'For Students'},{href:'/for-districts',label:'For Districts'},{href:'/for-parents',label:'For Parents'}].map(({href,label})=>(<li key={href}><Link href={href} className="text-sm text-white/55 hover:text-gold transition-colors duration-200">{label}</Link></li>))}
              </ul>
            </div>
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-white/35 mb-5">Company</div>
              <ul className="space-y-3 list-none">
                {[{href:'/our-story',label:'Our Story'},{href:'/how-it-works',label:'How It Works'},{href:'/pricing',label:'Pricing'},{href:'/contact',label:'Contact'}].map(({href,label})=>(<li key={href}><Link href={href} className="text-sm text-white/55 hover:text-gold transition-colors duration-200">{label}</Link></li>))}
              </ul>
            </div>
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-white/35 mb-5">Legal</div>
              <ul className="space-y-3 list-none">
                {[{href:'#',label:'Privacy Policy'},{href:'#',label:'Terms of Service'},{href:'#',label:'Cookie Policy'},{href:'#',label:'Accessibility'}].map(({href,label})=>(<li key={label}><Link href={href} className="text-sm text-white/55 hover:text-gold transition-colors duration-200">{label}</Link></li>))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.08] pt-8 text-center text-[13px] text-white/35">&copy; 2026 Intellectual Creations / Teaching Labs. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}
