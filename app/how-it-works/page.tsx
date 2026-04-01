import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ScrollReveal from '@/components/shared/ScrollReveal';
import MarketingNav from '@/components/shared/MarketingNav';

export const metadata: Metadata = {
  title: 'How It Works — Teaching Labs',
  description:
    'Teaching Labs creates an AI assistant built from your teaching style. Here\'s how it works.',
};

/* ─── Inline SVG icons ─── */

function IconTeach() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-teal">
      <path d="M24 8 C16 16, 8 28, 8 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <path d="M24 8 C24 18, 24 28, 24 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M24 8 C32 16, 40 28, 40 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function IconStudents() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-teal">
      <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2.5" opacity="0.9" />
      <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="2" opacity="0.6" />
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
    </svg>
  );
}

function IconFocus() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-teal">
      <circle cx="14" cy="14" r="4" stroke="currentColor" strokeWidth="2" opacity="0.7" />
      <circle cx="34" cy="14" r="4" stroke="currentColor" strokeWidth="2" opacity="0.7" />
      <circle cx="24" cy="30" r="4" stroke="currentColor" strokeWidth="2" opacity="0.9" />
      <circle cx="10" cy="38" r="3" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="38" cy="38" r="3" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="14" y1="18" x2="24" y2="26" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="34" y1="18" x2="24" y2="26" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="24" y1="34" x2="10" y2="35" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="24" y1="34" x2="38" y2="35" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
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

/* ─── Card component ─── */
function Card({
  icon,
  title,
  text,
  floatClass,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  floatClass: string;
}) {
  return (
    <div className="card-accent relative bg-card-bg rounded-[20px] p-10 overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] hover:shadow-[0_8px_40px_rgba(20,33,61,0.10)] hover:-translate-y-1.5 transition-all duration-300">
      <div className={`mb-6 ${floatClass}`}>{icon}</div>
      <h3 className="font-heading text-[16.5px] font-semibold text-text-primary mb-3">{title}</h3>
      <p className="text-[15px] leading-[1.78] text-text-secondary">{text}</p>
    </div>
  );
}

/* ─── Bridge quote ─── */
function Bridge({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-coral bg-[rgba(0,246,237,0.04)] dark:bg-[rgba(0,246,237,0.06)] rounded-xl p-8 pl-6 max-w-3xl font-heading text-[26px] font-medium italic leading-[1.5] text-text-primary mt-12 max-md:text-xl max-md:p-6 max-md:pl-5">
      {children}
    </div>
  );
}

/* ─── Eyebrow label ─── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-eyebrow font-extrabold flex items-center justify-center gap-3 font-heading text-sm font-bold tracking-[4px] uppercase mb-4">
      <span className="bg-eyebrow w-2 h-2 rounded-full flex-shrink-0" />
      {children}
    </div>
  );
}

/* ─── Main page ─── */
export default function HowItWorks() {
  return (
    <>
      <MarketingNav />
      <ScrollReveal />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-warm-white dark:bg-deep-navy">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="blob-teal absolute w-[600px] h-[600px] rounded-full top-[8%] left-[5%] max-md:w-[350px] max-md:h-[350px] opacity-[0.3] dark:opacity-[0.2]"
            style={{ background: '#00F6ED', filter: 'blur(100px)' }} />
          <div className="blob-gold absolute w-[550px] h-[550px] rounded-full top-[20%] right-[2%] max-md:w-[320px] max-md:h-[320px] opacity-[0.3] dark:opacity-[0.18]"
            style={{ background: '#4056F4', filter: 'blur(100px)' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full top-[55%] left-[15%] opacity-[0.15] dark:opacity-[0.1] max-md:hidden"
            style={{ background: '#561F37', filter: 'blur(100px)' }} />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-[200px] dark:hidden"
            style={{ background: 'linear-gradient(to bottom, transparent, #F7F7F8)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-[200px] hidden dark:block"
            style={{ background: 'linear-gradient(to bottom, transparent, #0a1128)' }} />
        </div>

        <div className="relative z-10 text-center max-w-[900px] px-12 max-md:px-6">
          {/* Eyebrow */}
          <div className="text-eyebrow font-extrabold inline-flex items-center gap-3 font-heading text-sm font-bold tracking-[4px] uppercase mb-6">
            <span className="bg-eyebrow w-2 h-2 rounded-full flex-shrink-0" />
            How It Works
          </div>

          {/* Headline */}
          <h1 className="font-heading font-extrabold tracking-[-2px] leading-[1.15] mb-6"
            style={{ fontSize: 'clamp(38px, 6vw, 68px)' }}>
            <span className="text-text-primary hero-word hero-word-0 mr-2">Meet</span>
            <span className="text-text-primary hero-word hero-word-1 mr-2">Your</span>
            <span
              className="hero-word hero-word-2"
              style={{
                background: 'linear-gradient(135deg, #00F6ED 0%, #4056F4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Teacher Twin
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle-anim text-text-primary font-body text-xl leading-[1.7] mb-10 max-w-[620px] mx-auto">
            Teaching Labs creates an AI assistant built from your teaching style. Here&apos;s how it works.
          </p>

          {/* Hero Image */}
          <div className="max-w-[760px] mx-auto mt-4">
            <Image
              src="/images/teacher-twin-reflection.jpg"
              alt="A teacher interacting with her AI Teacher Twin on a digital display in a modern classroom"
              width={960}
              height={540}
              className="w-full rounded-[20px] object-cover shadow-[0_20px_60px_rgba(20,33,61,0.15)]"
              priority
            />
            <p className="text-center mt-4 text-sm text-white/60">
              Your expertise, reflected. Your Teacher Twin learns how you teach and extends your reach to every student.
            </p>
          </div>
        </div>
      </section>

      <main>

        {/* ── THREE STEPS SECTION ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>Your Teacher Twin</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                How Teaching Labs Works
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-[#561F37] dark:bg-[#e63570] rounded-sm mx-auto mt-3" />
            </div>

            <div className="grid grid-cols-3 gap-8 mb-12 max-md:grid-cols-1 fade-up">
              <Card
                floatClass="card-icon-float-1"
                icon={<IconTeach />}
                title="You share how you teach."
                text="Teaching Labs learns from how you explain concepts, guide students through problems, and respond when understanding breaks down. The system builds an AI assistant that reflects your instructional approach, not a generic chatbot."
              />
              <Card
                floatClass="card-icon-float-2"
                icon={<IconStudents />}
                title="Your guidance reaches every learner."
                text="Your Teacher Twin provides personalized support that sounds like you and teaches like you. Students who need help get guidance aligned with your classroom instruction, whether you're available in that moment or not."
              />
              <Card
                floatClass="card-icon-float-3"
                icon={<IconFocus />}
                title="You stay in control of what matters."
                text="With routine support handled, you see where students are struggling, what questions they're asking, and where your attention will make the biggest difference. Teaching Labs doesn't replace your judgment. It gives you better information to act on."
              />
            </div>

            <div className="fade-up">
              <Bridge>Teaching Labs doesn&apos;t replace great teaching. It helps great teaching reach every student.</Bridge>
            </div>
          </div>
        </section>

        {/* ── CTA SECTION ── */}
        <section className="relative overflow-hidden bg-warm-white dark:bg-transparent">
          {/* Top fade */}
          <div className="absolute top-0 left-0 right-0 h-[200px] dark:hidden pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, #F7F7F8, transparent)' }} />
          <div className="absolute top-0 left-0 right-0 h-[200px] hidden dark:block pointer-events-none z-[2]"
            style={{ background: 'linear-gradient(to bottom, #0a1128, transparent)' }} />
          {/* Light mode blobs */}
          <div className="absolute inset-0 pointer-events-none dark:hidden" aria-hidden="true">
            <div className="absolute w-[500px] h-[500px] rounded-full top-[10%] left-[-10%] opacity-[0.25]"
              style={{ background: '#00F6ED', filter: 'blur(120px)' }} />
            <div className="absolute w-[450px] h-[450px] rounded-full top-[5%] right-[-8%] opacity-[0.25]"
              style={{ background: '#4056F4', filter: 'blur(120px)' }} />
            <div className="absolute w-[350px] h-[350px] rounded-full bottom-[10%] left-[40%] opacity-[0.12]"
              style={{ background: '#7B2D4A', filter: 'blur(120px)' }} />
          </div>
          {/* Dark mode gradient */}
          <div className="absolute inset-0 pointer-events-none hidden dark:block" aria-hidden="true"
            style={{ background: 'linear-gradient(180deg, #1a3a4a 0%, #152a3a 40%, #0a1128 100%)' }} />
          <div className="absolute inset-0 pointer-events-none hidden dark:block" aria-hidden="true"
            style={{ background: 'radial-gradient(ellipse at center, rgba(64,86,244,0.12) 0%, transparent 70%)' }} />

          <div className="relative z-10 max-w-[800px] mx-auto px-12 py-36 text-center max-md:px-6 max-md:py-20">
            <div className="text-eyebrow font-extrabold font-heading text-sm font-bold tracking-[4px] uppercase mb-5">
              Early Access
            </div>
            <h2 className="text-text-primary font-heading font-extrabold tracking-[-1.5px] mb-5 leading-[1.15]"
              style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
              Ready to Meet Your Teacher Twin?
            </h2>
            <p className="text-text-primary text-lg leading-[1.7] mb-10 max-w-[600px] mx-auto dark:!text-white/65">
              Get early access and be among the first to see what&apos;s possible.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/see-the-difference"
                className="inline-flex justify-center items-center font-heading text-[17px] font-bold bg-transparent text-deep-navy dark:text-white border-4 border-coral dark:border-teal hover:bg-coral dark:hover:bg-teal hover:text-white dark:hover:text-deep-navy px-12 py-4 rounded-full hover:-translate-y-0.5 transition-all duration-300 shadow-[0_4px_20px_rgba(86,31,55,0.2)] dark:shadow-[0_4px_20px_rgba(0,246,237,0.2)]"
              >
                What Is Different
              </Link>
              <Link
                href="/contact"
                className="inline-flex justify-center items-center font-heading text-[17px] font-bold bg-transparent text-deep-navy dark:text-white border-4 border-gold hover:bg-gold hover:text-white px-12 py-4 rounded-full hover:-translate-y-0.5 transition-all duration-300 shadow-[0_4px_20px_rgba(64,86,244,0.3)]"
              >
                Get Early Access
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="relative overflow-hidden bg-warm-white dark:bg-transparent">
        {/* Light mode blobs */}
        <div className="absolute inset-0 pointer-events-none dark:hidden" aria-hidden="true">
          <div className="absolute w-[500px] h-[500px] rounded-full top-[-20%] left-[-5%] opacity-[0.2]"
            style={{ background: '#00F6ED', filter: 'blur(130px)' }} />
          <div className="absolute w-[450px] h-[450px] rounded-full bottom-[-10%] right-[-5%] opacity-[0.2]"
            style={{ background: '#4056F4', filter: 'blur(130px)' }} />
        </div>
        {/* Dark mode gradient */}
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
    </>
  );
}
