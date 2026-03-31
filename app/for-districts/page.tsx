import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import MarketingNav from '@/components/shared/MarketingNav';
import ScrollReveal from '@/components/shared/ScrollReveal';

export const metadata: Metadata = {
  title: 'For Districts — Teaching Labs',
  description:
    'AI is entering classrooms. Teaching Labs helps districts introduce AI in a way that protects students, strengthens teaching, and supports real learning.',
};

/* ─── Inline SVG icons ─── */

function IconStar() {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M7 0l1.5 4.5H13l-3.5 2.7 1.3 4.3L7 8.8 3.2 11.5l1.3-4.3L1 4.5h4.5z" />
    </svg>
  );
}

/* Governance principle icons */
function IconTeacherGuided() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true" className="text-teal">
      <ellipse
        cx="20" cy="20" rx="16" ry="7"
        stroke="currentColor" strokeWidth="1.5" opacity="0.7"
        transform="rotate(20 20 20)"
      />
      <ellipse
        cx="20" cy="20" rx="16" ry="7"
        stroke="var(--color-text-primary)" strokeWidth="1.5" opacity="0.4"
        transform="rotate(-20 20 20)"
      />
      <circle cx="20" cy="20" r="3" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

function IconStudentData() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true" className="text-teal">
      <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <circle cx="20" cy="20" r="11" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
      <circle cx="20" cy="20" r="6" stroke="currentColor" strokeWidth="2" opacity="0.7" />
      <circle cx="20" cy="20" r="2" fill="currentColor" />
    </svg>
  );
}

function IconTransparent() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true" className="text-teal">
      <path
        d="M 6 20 Q 14 8 20 20"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.85"
      />
      <path
        d="M 20 20 Q 26 32 34 20"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4"
      />
      <path
        d="M 10 28 Q 20 16 30 28"
        stroke="var(--color-text-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"
      />
      <circle cx="20" cy="20" r="2.5" fill="currentColor" />
    </svg>
  );
}

function IconOversight() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true" className="text-teal">
      <circle cx="20" cy="12" r="3" fill="currentColor" opacity="0.9" />
      <circle cx="10" cy="28" r="2.5" fill="currentColor" opacity="0.5" />
      <circle cx="30" cy="28" r="2.5" fill="currentColor" opacity="0.5" />
      <line x1="20" y1="12" x2="10" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line x1="20" y1="12" x2="30" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <line
        x1="10" y1="28" x2="30" y2="28"
        stroke="var(--color-text-primary)" strokeWidth="1" opacity="0.25"
      />
    </svg>
  );
}

/* ─── Shared sub-components ─── */

function Eyebrow({ children, dotColor = 'bg-teal' }: { children: React.ReactNode; dotColor?: string }) {
  return (
    <div className="inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-4">
      <span className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`} />
      {children}
    </div>
  );
}

function MomentItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3.5 font-body text-base text-text-secondary leading-[1.6]">
      <span className="w-2 h-2 rounded-full bg-teal flex-shrink-0 opacity-70" />
      <span>{children}</span>
    </div>
  );
}

/* ─── Principle card (4-col governance grid) ─── */
function PrincipleCard({
  icon,
  title,
  paragraphs,
  floatClass = '',
}: {
  icon: React.ReactNode;
  title: string;
  paragraphs: string[];
  floatClass?: string;
}) {
  return (
    <div className="card-accent relative bg-card-bg border border-border rounded-[20px] p-9 overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] hover:shadow-[0_8px_40px_rgba(20,33,61,0.10)] hover:-translate-y-1.5 transition-all duration-300">
      <div className={`mb-4 ${floatClass}`}>{icon}</div>
      <h3 className="font-heading text-[17px] font-bold text-text-primary tracking-[-0.2px] mb-3">
        {title}
      </h3>
      {paragraphs.map((p, i) => (
        <p key={i} className="font-body text-[14.5px] text-text-secondary leading-[1.75] mb-2 last:mb-0">
          {p}
        </p>
      ))}
    </div>
  );
}

/* ─── Main page ─── */
export default function ForDistrictsPage() {
  return (
    <div
      className="min-h-screen bg-warm-white text-text-secondary overflow-x-hidden"
      style={{ fontFamily: "var(--font-open-sans, 'Open Sans', sans-serif)" }}
    >

      {/* ════════════════════════════════════════
          NAV
      ════════════════════════════════════════ */}
      <MarketingNav />


      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-warm-white">
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div
            className="blob-teal absolute w-[500px] h-[500px] rounded-full opacity-[0.08] top-[10%] left-[15%] max-md:w-[300px] max-md:h-[300px] max-md:opacity-[0.056]"
            style={{ background: 'var(--color-teal)', filter: 'blur(80px)' }}
          />
          <div
            className="blob-gold absolute w-[450px] h-[450px] rounded-full opacity-[0.10] top-[30%] right-[10%] max-md:w-[280px] max-md:h-[280px] max-md:opacity-[0.07]"
            style={{ background: 'var(--color-gold)', filter: 'blur(80px)' }}
          />
        </div>

        <div className="relative z-10 text-center max-w-[960px] px-12 max-md:px-6">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-0 font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-6">
            <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0 mr-3" />
            For District Leaders
          </div>

          {/* Headline — 5 words with staggered reveal */}
          <h1
            className="font-heading font-extrabold tracking-[-2px] leading-[1.15] text-text-primary mb-7"
            style={{ fontSize: 'clamp(38px, 6vw, 68px)' }}
          >
            <span className="hero-word hero-word-0 mr-2">AI</span>
            <span className="hero-word hero-word-1 mr-2">Is</span>
            <span className="hero-word hero-word-2 mr-2">Entering</span>
            <span className="hero-word hero-word-3 mr-2">Classrooms.</span>
            <span
              className="hero-word hero-word-4"
              style={{
                background: 'linear-gradient(135deg, var(--color-teal), var(--color-gold))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Guide&nbsp;It.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="hero-subtitle-anim font-body text-[19px] leading-[1.7] text-text-secondary mb-5 max-w-[680px] mx-auto"
          >
            Teachers and students are already experimenting with AI tools, often without district oversight
            or instructional guardrails. Will AI simply generate answers and shortcuts, or will it strengthen
            teaching and learning?
          </p>

          {/* Resolve */}
          <p
            className="hero-resolve-anim font-heading text-[18px] font-semibold text-gold leading-[1.6] mb-9 max-w-[640px] mx-auto"
          >
            Teaching Labs helps districts take the path that extends teacher expertise so students receive
            guidance that encourages thinking, practice, and growth.
          </p>

          {/* CTA */}
          <div className="hero-buttons-anim-late flex gap-4 justify-center flex-wrap">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 font-heading text-base font-bold bg-gold text-white px-10 py-4 rounded-full shadow-[0_4px_20px_rgba(64,86,244,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(64,86,244,0.45)] transition-all duration-300"
            >
              Request District Access
            </Link>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════════════ */}
            <ScrollReveal />
      <main>

        {/* ── A Responsible Approach to AI in Schools ── */}
        <section className="fade-up bg-warm-white">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="max-w-[860px] mx-auto text-center">
              <Eyebrow>A Responsible Approach to AI in Schools</Eyebrow>
              <h2
                className="font-heading font-bold text-text-primary leading-[1.4] tracking-[-0.5px] mb-6"
                style={{ fontSize: 'clamp(22px, 3vw, 28px)' }}
              >
                Artificial intelligence should strengthen teaching and learning, not replace thinking,
                human interaction, or hands-on discovery.
              </h2>
              <p className="font-body text-base text-text-secondary leading-[1.8] mb-3.5">
                Teaching Labs was designed around a simple belief:
              </p>
              <p className="font-body text-base text-text-secondary leading-[1.8] mb-3.5">
                Students are at the center of learning, and teachers provide the guidance that helps them grow.
              </p>
              <p className="font-body text-base text-text-secondary leading-[1.8] mb-3.5">
                Our technology learns from educators and extends their expertise across the classroom so every
                student stays supported, challenged, and engaged.
              </p>
              <p className="font-heading text-[17px] font-semibold text-gold leading-[1.6] mt-5">
                When designed this way, AI does not replace teachers. It helps great teaching reach every student.
              </p>
            </div>
          </div>
        </section>


        {/* ── Governance Districts Can Trust ── */}
        <section className="fade-up bg-bg-secondary">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            {/* Section header */}
            <div className="text-center mb-12">
              <Eyebrow>Governance Districts Can Trust</Eyebrow>
              <p
                className="font-heading font-medium text-text-secondary leading-[1.6] max-w-[760px] mx-auto"
                style={{ fontSize: 'clamp(17px, 2vw, 20px)' }}
              >
                AI in education requires clear oversight, strong privacy protections, and transparency for
                district leaders. Teaching Labs was designed with these requirements from the beginning.
              </p>
            </div>

            {/* 4-column principles grid */}
            <div className="grid grid-cols-4 gap-9 max-lg:grid-cols-2 max-lg:gap-6 max-sm:grid-cols-1">
              <PrincipleCard
                icon={<IconTeacherGuided />}
                title="Teacher-Guided AI"
                floatClass="card-icon-float-1"
                paragraphs={[
                  'Teaching Labs is built around the expertise of your educators. The system learns from how teachers explain concepts, guide students, and respond when learning breaks down.',
                  'AI supports instruction, but teachers remain the authority guiding learning in every classroom.',
                ]}
              />
              <PrincipleCard
                icon={<IconStudentData />}
                title="Student Data Protection"
                floatClass="card-icon-float-2"
                paragraphs={[
                  'Student privacy is protected by design.',
                  'Teaching Labs is FERPA and COPPA compliant, with no advertising, no data resale, and no external model training on student information.',
                  'Districts retain full ownership and control of their data.',
                ]}
              />
              <PrincipleCard
                icon={<IconTransparent />}
                title="Transparent Learning Systems"
                floatClass="card-icon-float-3"
                paragraphs={[
                  'Teaching Labs is designed to support learning, not simply generate answers.',
                  'Students are guided through explanations, practice, and feedback aligned with classroom instruction.',
                  'District leaders maintain visibility into how the platform supports learning across schools.',
                ]}
              />
              <PrincipleCard
                icon={<IconOversight />}
                title="Human Oversight"
                floatClass="card-icon-float-1"
                paragraphs={[
                  'AI operates within clear human oversight.',
                  'Teachers guide how the system is used in their classrooms while administrators maintain district-level governance and visibility.',
                  'Technology assists instruction, it never operates independently.',
                ]}
              />
            </div>
          </div>
        </section>


        {/* ── Built Around Your Teachers ── */}
        <section className="fade-up bg-warm-white">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="max-w-[800px] mx-auto">
              <h2
                className="font-heading font-extrabold text-text-primary tracking-[-1px] leading-[1.2] mb-6"
                style={{ fontSize: 'clamp(28px, 3.5vw, 40px)' }}
              >
                Built Around Your Teachers
              </h2>
              <p className="font-body text-[17px] text-text-secondary leading-[1.8] mb-4">
                Most AI platforms begin with content libraries and algorithms.
              </p>
              <p className="font-body text-[17px] text-text-secondary leading-[1.8] mb-4">
                Teaching Labs begins with your educators.
              </p>
              <p className="font-body text-[17px] text-text-secondary leading-[1.8] mb-4">
                Each teacher trains their own AI assistant based on how they explain concepts, guide students,
                and respond when learning breaks down.
              </p>
              <p className="font-body text-[17px] text-text-secondary leading-[1.8] mb-4">
                The result is not generic AI.
              </p>
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6]">
                It is an extension of the teaching expertise that already exists in your district, available
                to every student.
              </p>
            </div>
          </div>
        </section>


        {/* ── Photo: Teachers Collaborating ── */}
        <div className="bg-warm-white pb-12 px-12 max-md:px-6 max-w-[800px] mx-auto">
          <div
            className="rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(20,33,61,0.15)] hover:[&>*]:scale-103 transition-transform duration-500"
            style={{ aspectRatio: '16/9' }}
          >
            <Image src="/images/teachers-collaborating.jpg" alt="Diverse group of teachers collaborating around laptops in a professional development session" width={800} height={450} className="w-full h-full object-cover" />
          </div>
        </div>


        {/* ── Adoption That Happens Naturally ── */}
        <section className="fade-up bg-bg-secondary">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="max-w-[800px] mx-auto">
              <h2
                className="font-heading font-extrabold text-text-primary tracking-[-1px] leading-[1.2] mb-6"
                style={{ fontSize: 'clamp(28px, 3.5vw, 40px)' }}
              >
                Adoption That Happens Naturally
              </h2>
              <p className="font-body text-[17px] text-text-secondary leading-[1.8] mb-4">
                District leaders know that the biggest barrier to technology success is teacher adoption.
              </p>
              <p className="font-body text-[17px] text-text-secondary leading-[1.8] mb-4">
                Teaching Labs was designed so that teachers use it because it helps them, not because they are
                required to.
              </p>
              <p className="font-body text-[17px] text-text-secondary leading-[1.8] mb-4">
                Teachers experience value immediately:
              </p>
              <div className="flex flex-col gap-3.5 mb-7">
                <MomentItem>Setup takes minutes, not months</MomentItem>
                <MomentItem>The platform works within existing curriculum</MomentItem>
                <MomentItem>Teachers see their own teaching style reflected back</MomentItem>
                <MomentItem>Time savings appear from the first week of use</MomentItem>
              </div>
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6]">
                When teachers feel ownership, adoption follows.
              </p>
            </div>
          </div>
        </section>


        {/* ── Visibility Without Micromanagement ── */}
        <section className="fade-up bg-warm-white">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="max-w-[800px] mx-auto">
              <h2
                className="font-heading font-extrabold text-text-primary tracking-[-1px] leading-[1.2] mb-6"
                style={{ fontSize: 'clamp(28px, 3.5vw, 40px)' }}
              >
                Visibility Without Micromanagement
              </h2>
              <p className="font-body text-[17px] text-text-secondary leading-[1.8] mb-4">
                District leaders need meaningful insight into learning across schools.
              </p>
              <p className="font-body text-[17px] text-text-secondary leading-[1.8] mb-4">
                Teachers need professional trust.
              </p>
              <p className="font-body text-[17px] text-text-secondary leading-[1.8] mb-4">
                Teaching Labs provides both.
              </p>
              <p className="font-body text-[17px] text-text-secondary leading-[1.8] mb-4">
                District administrators gain visibility into:
              </p>
              <div className="flex flex-col gap-3.5 mb-7">
                <MomentItem>Learning patterns across classrooms and schools</MomentItem>
                <MomentItem>Standards alignment and progress signals</MomentItem>
                <MomentItem>Platform usage tied to real instructional activity</MomentItem>
                <MomentItem>Compliance-ready reporting for district leadership</MomentItem>
              </div>
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6]">
                The result is actionable insight that supports district decision-making, not vanity metrics.
              </p>
            </div>
          </div>
        </section>


        {/* ── Photo: Superintendent Dashboard ── */}
        <div className="bg-warm-white pb-12 px-12 max-md:px-6 max-w-[800px] mx-auto">
          <div
            className="rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(20,33,61,0.15)]"
            style={{ aspectRatio: '16/9' }}
          >
            <Image src="/images/superintendent-dashboard.jpg" alt="Superintendent reviewing student progress dashboard on her office monitor" width={800} height={450} className="w-full h-full object-cover" />
          </div>
        </div>


        {/* ── What Districts Gain ── */}
        <section className="fade-up bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center">
              {/* Eyebrow (light on dark) */}
              <div className="inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase text-white/50 mb-12">
                <span className="w-2 h-2 rounded-full bg-white/30 flex-shrink-0" />
                What Districts Gain
              </div>

              <div className="grid grid-cols-4 gap-8 mt-0 max-lg:grid-cols-2 max-lg:gap-7 max-sm:grid-cols-1">
                {[
                  {
                    word: 'Instructional Integrity',
                    desc: 'AI strengthens teaching and learning rather than replacing it.',
                  },
                  {
                    word: 'Teacher Adoption',
                    desc: 'Tools teachers choose to use because they support the work they already do.',
                  },
                  {
                    word: 'District Visibility',
                    desc: 'Clear insight into learning patterns across schools and classrooms.',
                  },
                  {
                    word: 'Responsible AI',
                    desc: 'Governance, privacy, and transparency built into the platform architecture.',
                  },
                ].map(({ word, desc }) => (
                  <div key={word} className="text-center">
                    <div
                      className="font-heading text-[26px] font-extrabold tracking-[-0.3px] mb-3 whitespace-nowrap"
                      style={{
                        background: 'linear-gradient(135deg, var(--color-teal), var(--color-gold))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {word}
                    </div>
                    <p className="font-body text-[15px] text-white/72 leading-[1.7]">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* ── Leading the Next Era of Learning ── */}
        <section className="fade-up bg-bg-secondary">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="max-w-[860px] mx-auto text-center">
              <h2
                className="font-heading font-extrabold text-text-primary tracking-[-0.5px] leading-[1.2] mb-6"
                style={{ fontSize: 'clamp(26px, 3.5vw, 36px)' }}
              >
                Leading the Next Era of Learning
              </h2>
              <p
                className="font-heading font-medium text-text-primary leading-[1.6] tracking-[-0.3px] mb-3"
                style={{ fontSize: 'clamp(18px, 2.2vw, 22px)' }}
              >
                Artificial intelligence will play a role in the future of education.
              </p>
              <p
                className="font-heading font-medium text-text-primary leading-[1.6] tracking-[-0.3px] mb-3"
                style={{ fontSize: 'clamp(18px, 2.2vw, 22px)' }}
              >
                The question for districts is not whether AI will enter classrooms, but how it will support
                teaching and learning when it does.
              </p>
              <p className="font-heading text-[17px] font-semibold text-gold leading-[1.6] mt-4">
                Teaching Labs helps districts introduce AI in a way that protects students, strengthens
                teaching, and supports real learning.
              </p>
            </div>
          </div>
        </section>


        {/* ── CTA Section ── */}
        <section
          className="fade-up relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, var(--color-deep-navy) 0%, #0e2a3a 50%, #0e3540 100%)',
          }}
        >
          {/* Radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(64,86,244,0.12) 0%, transparent 70%)',
            }}
          />

          <div className="relative z-10 max-w-[800px] mx-auto px-12 py-36 text-center max-md:px-6 max-md:py-20">
            <div className="font-heading text-xs font-bold tracking-[4px] uppercase text-white/50 mb-5">
              District Leadership
            </div>
            <h2
              className="font-heading font-extrabold tracking-[-1.5px] text-white mb-5 leading-[1.15]"
              style={{ fontSize: 'clamp(32px, 4.5vw, 52px)' }}
            >
              Ready to Lead Your District Into the Next Era of Learning?
            </h2>
            <p className="text-lg leading-[1.7] text-white/65 mb-10 max-w-[600px] mx-auto">
              Get early access and help shape responsible AI for your schools.
            </p>
            <Link
              href="/contact"
              className="cta-button-pulse inline-flex items-center font-heading text-[17px] font-bold bg-gold text-white px-12 py-4 rounded-full hover:-translate-y-0.5 transition-transform duration-300"
            >
              Request District Access
            </Link>
          </div>
        </section>

      </main>


      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer
        className="border-t border-gold/20"
        style={{
          background: 'linear-gradient(180deg, var(--color-deep-navy) 0%, #0e1a35 100%)',
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
              <div className="inline-flex items-center gap-2 font-heading text-xs font-semibold text-teal bg-teal/10 px-4 py-2 rounded-full border border-teal/20">
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
