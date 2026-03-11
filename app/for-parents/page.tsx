import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import MarketingNav from '@/components/shared/MarketingNav';
import ScrollReveal from '@/components/shared/ScrollReveal';

export const metadata: Metadata = {
  title: 'For Parents — Teaching Labs',
  description:
    "Teaching Labs keeps your child's teacher in the driver's seat, and keeps you in the loop. Safe, teacher-guided AI for K-12.",
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

/* ─── Sub-components ─── */

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase mb-4 ${
        light ? 'text-white/50' : 'text-teal'
      }`}
    >
      {!light && <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />}
      {children}
    </div>
  );
}

/**
 * The italic blockquote / "bridge" callout used after each scenario body.
 * Matches the HTML's .scenario-resolve styling.
 */
function ScenarioResolve({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mt-7 border-l-4 border-[#FF6B6B] rounded-xl p-6 pl-6 font-heading text-[1.625rem] font-medium italic leading-[1.5] text-text-primary text-left max-md:text-xl max-md:p-5 max-md:pl-5"
      style={{ background: 'rgba(79,163,165,0.04)' }}
    >
      {children}
    </div>
  );
}

/**
 * A single scenario/story section: centered content block with heading,
 * a gold lead paragraph, body text, and a resolve callout.
 */
function ScenarioBlock({
  heading,
  lead,
  body,
  resolve,
  extra,
}: {
  heading: string;
  lead: string;
  body: string;
  resolve: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="max-w-[800px] mx-auto text-center">
      <h2 className="font-heading font-extrabold tracking-[-1px] text-text-primary leading-[1.2] mb-5 text-[clamp(28px,3.5vw,40px)]">
        {heading}
      </h2>
      <p className="font-heading text-xl font-semibold text-gold leading-[1.6] mb-6">{lead}</p>
      <p className="text-base leading-[1.8] text-text-secondary text-left mb-7">{body}</p>
      {extra}
      <ScenarioResolve>{resolve}</ScenarioResolve>
    </div>
  );
}

/** Three-column benefit card */
function BenefitCard({
  icon,
  title,
  text,
  floatClass,
}: {
  icon: string;
  title: string;
  text: string;
  floatClass: string;
}) {
  return (
    <div className="card-accent relative bg-card-bg rounded-[20px] p-10 overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] hover:shadow-[0_8px_40px_rgba(20,33,61,0.10)] hover:-translate-y-1.5 transition-all duration-300">
      <div className={`text-[32px] mb-6 ${floatClass}`}>{icon}</div>
      <h3 className="font-heading text-[18px] font-bold text-text-primary mb-3">{title}</h3>
      <p className="text-[15px] leading-[1.78] text-text-secondary">{text}</p>
    </div>
  );
}

/* ─── Page component ─── */

export default function ForParentsPage() {
  return (
    <div
      className="min-h-screen bg-warm-white text-text-secondary overflow-x-hidden"
      style={{ fontFamily: "var(--font-open-sans, 'Open Sans', sans-serif)" }}
    >
      {/* ══════════════════════════════════════════
          NAV
      ══════════════════════════════════════════ */}
      <MarketingNav />

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-warm-white">
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div
            className="blob-teal absolute w-[500px] h-[500px] rounded-full top-[10%] left-[15%] max-md:w-[300px] max-md:h-[300px]"
            style={{ background: '#4FA3A5', filter: 'blur(80px)', opacity: 'var(--blob-teal-opacity, 0.08)' }}
          />
          <div
            className="blob-gold absolute w-[450px] h-[450px] rounded-full top-[30%] right-[10%] max-md:w-[280px] max-md:h-[280px]"
            style={{ background: '#F0C95D', filter: 'blur(80px)', opacity: 'var(--blob-gold-opacity, 0.10)' }}
          />
        </div>

        <div className="relative z-10 text-center max-w-[900px] px-12 max-md:px-6">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-6">
            <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
            For Parents
          </div>

          {/* Headline — staggered word reveal via hero-word class + inline animation-delay */}
          <h1
            className="font-heading font-extrabold tracking-[-2px] leading-[1.15] text-text-primary mb-6"
            style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}
          >
            {[
              { text: 'You', delay: '0.3s' },
              { text: "Don't", delay: '0.4s' },
              { text: 'Have', delay: '0.5s' },
              { text: 'to', delay: '0.6s' },
              { text: 'Wonder', delay: '0.7s' },
              { text: 'What', delay: '0.8s' },
              { text: 'Your', delay: '0.9s' },
              { text: 'Child', delay: '1.0s' },
              { text: 'Is', delay: '1.1s' },
            ].map(({ text, delay }) => (
              <span
                key={text}
                className="hero-word mr-3"
                style={{ animationDelay: delay }}
              >
                {text}
              </span>
            ))}
            {/* Gradient word */}
            <span
              className="hero-word"
              style={{
                animationDelay: '1.2s',
                background: 'linear-gradient(135deg, #4FA3A5, #F0C95D)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Learning
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="hero-subtitle-anim font-body text-xl leading-[1.7] text-text-secondary mb-10 max-w-[620px] mx-auto"
            style={{ animationDelay: '1.55s' }}
          >
            Teaching Labs keeps your child&apos;s teacher in the driver&apos;s seat, and keeps you in the loop.
          </p>

          {/* Buttons */}
          <div
            className="hero-buttons-anim flex gap-4 justify-center flex-wrap max-sm:flex-col max-sm:items-center"
            style={{ animationDelay: '1.75s' }}
          >
            <Link
              href="/see-the-difference"
              className="inline-flex items-center gap-2 font-heading text-base font-bold bg-transparent text-text-primary px-10 py-4 rounded-full border-4 border-gold hover:-translate-y-0.5 hover:bg-gold hover:text-deep-navy transition-all duration-300 max-sm:w-full max-sm:justify-center"
            >
              What Is Different
            </Link>
            <Link
              href="/waitlist"
              className="inline-flex items-center gap-2 font-heading text-base font-semibold bg-transparent text-text-primary px-10 py-4 rounded-full border-4 border-teal hover:bg-teal hover:text-white hover:-translate-y-0.5 transition-all duration-300 max-sm:w-full max-sm:justify-center"
            >
              Join the Waitlist
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
            <ScrollReveal />
      <main>

        {/* ── Section 1: Teacher Built This ── */}
        <section className="fade-up bg-warm-white">
          <div className="max-w-[1200px] mx-auto px-12 py-[100px] max-md:px-6 max-md:py-[60px]">
            <ScenarioBlock
              heading="Your Child's Teacher Built This"
              lead="This isn't a random chatbot from the internet."
              body="Every Teaching Labs AI is created by your child's actual teacher. It teaches the way they teach, uses their materials, and follows their standards. When your child works with Teaching Labs, they're getting guidance shaped by the person who knows their classroom best."
              resolve="It's an extension of the classroom your child is already in."
            />
          </div>
        </section>

        {/* Feature image */}
        <div className="fade-up feat-photo-hover max-w-[800px] mx-auto px-12 py-16 max-md:px-6 max-md:py-10">
          <Image src="/images/teacher-with-student.jpg" alt="Teacher kneeling beside a student, offering warm one-on-one guidance" width={800} height={450} className="w-full rounded-[20px] object-cover object-center shadow-[0_20px_60px_rgba(20,33,61,0.15)]" />
        </div>

        {/* ── Section 2: Doesn't Give Answers ── */}
        <section className="fade-up bg-bg-secondary">
          <div className="max-w-[1200px] mx-auto px-12 py-[100px] max-md:px-6 max-md:py-[60px]">
            <ScenarioBlock
              heading="It Doesn't Give Answers. It Asks Questions."
              lead="When your child asks Teaching Labs to write their homework, it says no."
              body="Instead, it asks them what they think. It pushes them to develop their own ideas, find their own sources, and build their own arguments. The same thing a great tutor would do sitting at the kitchen table, except it's available whenever your child needs it."
              resolve="Your child does the thinking. Teaching Labs just makes sure they don't get stuck."
            />
          </div>
        </section>

        {/* ── Section 3: Catches Shortcuts ── */}
        <section className="fade-up bg-warm-white">
          <div className="max-w-[1200px] mx-auto px-12 py-[100px] max-md:px-6 max-md:py-[60px]">
            <ScenarioBlock
              heading="It Catches Shortcuts"
              lead="If your child copies and pastes text from another AI tool, Teaching Labs flags it."
              body="It asks them to explain it in their own words. No sneaking around. No fake learning. Teaching Labs is designed to make sure the work your child turns in is actually theirs."
              resolve="Other AI tools make it easy to cheat. Teaching Labs makes it hard to pretend."
            />
          </div>
        </section>



        {/* ── Section 4: Teacher Stays Connected ── */}
        <section className="fade-up bg-bg-secondary">
          <div className="max-w-[1200px] mx-auto px-12 py-[100px] max-md:px-6 max-md:py-[60px]">
            <ScenarioBlock
              heading="Your Child's Teacher Stays Connected"
              lead="Teaching Labs gives teachers a window into how your child learns, not just what they turn in."
              body="If your child is struggling with a concept, their teacher knows before the next class. If they're ready for a challenge, their teacher knows that too. It's the kind of insight that used to require a one-on-one conversation, now available for every student."
              resolve="Your child isn't alone with a machine. Their teacher is always part of the conversation."
            />
          </div>
        </section>

        {/* Feature image */}
        <div className="fade-up feat-photo-hover max-w-[800px] mx-auto px-12 py-16 max-md:px-6 max-md:py-10">
          <Image src="/images/parent-teacher-conference.jpg" alt="Teacher and parent reviewing student progress data together on a tablet" width={800} height={450} className="w-full rounded-[20px] object-cover object-center shadow-[0_20px_60px_rgba(20,33,61,0.15)]" />
        </div>

        {/* ── Section 5: What Comes Home Is Real ── */}
        <section className="fade-up bg-warm-white">
          <div className="max-w-[1200px] mx-auto px-12 py-[100px] max-md:px-6 max-md:py-[60px]">
            <ScenarioBlock
              heading="What Comes Home Is Real"
              lead="When your child finishes an assignment with Teaching Labs, they did the work."
              body="They built the argument. They found the evidence. They figured out where they were wrong and tried again. Teaching Labs guided them through the hard parts, but the thinking, the learning, and the growth are all theirs."
              resolve="You can trust that what they're turning in represents what they actually know."
            />
          </div>
        </section>

        {/* ── Benefits / Gains Cards ── */}
        <section className="fade-up bg-bg-secondary">
          <div className="max-w-[1200px] mx-auto px-12 py-[100px] max-md:px-6 max-md:py-[60px]">
            {/* Header */}
            <div className="text-center mb-14">
              <Eyebrow>Benefits</Eyebrow>
              <h2
                className="section-title-underline font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary inline-block"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}
              >
                What This Means for Your Family
              </h2>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-3 gap-8 max-md:grid-cols-1">
              <BenefitCard
                floatClass="card-icon-float-1"
                icon="🛡️"
                title="Safety You Can Trust"
                text="FERPA and COPPA compliant. Your child's data is protected, and the AI is guided by their teacher's standards, not the internet."
              />
              <BenefitCard
                floatClass="card-icon-float-2"
                icon="📚"
                title="Real Learning, Not Shortcuts"
                text="Teaching Labs doesn't do the work for your child. It teaches them how to do it themselves, building skills that last beyond the assignment."
              />
              <BenefitCard
                floatClass="card-icon-float-3"
                icon="🤝"
                title="Teacher in the Loop"
                text="Every interaction helps the teacher understand your child better. More insight means more personalized support in the classroom."
              />
            </div>
          </div>
        </section>

        {/* ── CTA Section ── */}
        <section
          className="fade-up relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #14213D 0%, #1a3a4a 50%, #1d4a52 100%)',
          }}
        >
          {/* Radial glow overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(240,201,93,0.12) 0%, transparent 70%)',
            }}
          />

          <div className="relative z-10 max-w-[800px] mx-auto px-12 py-[120px] text-center max-md:px-6 max-md:py-20">
            <div className="font-heading text-xs font-bold tracking-[4px] uppercase text-white/50 mb-5">
              For Families
            </div>
            <h2
              className="font-heading font-extrabold tracking-[-1.5px] text-white mb-5 leading-[1.15]"
              style={{ fontSize: 'clamp(32px, 4.5vw, 48px)' }}
            >
              Ready to See What Your Child&apos;s Classroom Could Look Like?
            </h2>
            <p className="text-lg leading-[1.7] text-white/65 mb-10 max-w-[600px] mx-auto">
              Teaching Labs is built by teachers, for students, with families in mind. Join the
              waitlist to be among the first to experience it.
            </p>
            <Link
              href="/waitlist"
              className="cta-button-pulse inline-flex items-center font-heading text-[17px] font-bold bg-gold text-deep-navy px-12 py-4 rounded-full hover:-translate-y-0.5 transition-transform duration-300"
            >
              Join the Waitlist
            </Link>
          </div>
        </section>

      </main>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer
        style={{
          background: 'linear-gradient(180deg, #14213D 0%, #1a2a45 100%)',
          borderTop: '1px solid rgba(240,201,93,0.2)',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-12 py-[72px] max-md:px-6">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12 max-md:grid-cols-1 max-md:gap-8">

            {/* Brand */}
            <div>
              <div className="font-heading text-xl font-bold text-white mb-4">Teaching Labs</div>
              <p className="text-sm leading-[1.7] text-white/55 mb-5 max-w-[280px]">
                AI-powered teaching platform that learns how you teach and helps every student get the
                support they need.
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
