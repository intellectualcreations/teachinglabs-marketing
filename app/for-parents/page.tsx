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

/* ─── SVG Icons ─── */
function IconStar() {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M7 0l1.5 4.5H13l-3.5 2.7 1.3 4.3L7 8.8 3.2 11.5l1.3-4.3L1 4.5h4.5z" />
    </svg>
  );
}

/* ─── Eyebrow label ─── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-eyebrow font-extrabold flex items-center justify-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase mb-4">
      <span className="bg-eyebrow w-2 h-2 rounded-full flex-shrink-0" />
      {children}
    </div>
  );
}

/* ─── Bridge quote ─── */
function Bridge({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-coral bg-[rgba(0,246,237,0.04)] dark:bg-[rgba(0,246,237,0.06)] rounded-xl p-8 pl-6 max-w-3xl font-heading text-[26px] font-medium italic leading-[1.5] text-text-primary mx-auto max-md:text-xl max-md:p-6 max-md:pl-5">
      {children}
    </div>
  );
}

/* ─── Card component ─── */
function Card({
  emoji,
  title,
  text,
}: {
  emoji: string;
  title: string;
  text: string;
}) {
  return (
    <div className="card-accent relative bg-card-bg rounded-[20px] p-10 overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] hover:shadow-[0_8px_40px_rgba(20,33,61,0.10)] hover:-translate-y-1.5 transition-all duration-300">
      <div className="text-[32px] mb-6">{emoji}</div>
      <h3 className="font-heading text-[16.5px] font-semibold text-text-primary mb-3">{title}</h3>
      <p className="text-[15px] leading-[1.78] text-text-secondary">{text}</p>
    </div>
  );
}

/* ─── Section heading with plum underline ─── */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h2
        className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
        style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}
      >
        {children}
      </h2>
      <div className="w-[576px] max-w-full h-[3px] bg-[#561F37] dark:bg-[#e63570] rounded-sm mx-auto mt-3" />
    </>
  );
}

/* ─── (ScenarioSection removed — using inline sections to match homepage format) ─── */


/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
export default function ForParentsPage() {
  return (
    <>
      <MarketingNav />
      <ScrollReveal />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-warm-white dark:bg-deep-navy">
        {/* Blobs */}
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
          <div className="text-eyebrow font-extrabold inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase mb-6">
            <span className="bg-eyebrow w-2 h-2 rounded-full flex-shrink-0" />
            For Parents
          </div>

          <h1
            className="font-heading font-extrabold tracking-[-2px] leading-[1.15] mb-6"
            style={{ fontSize: 'clamp(38px, 6vw, 68px)' }}
          >
            <span className="text-text-primary hero-word hero-word-0 dark:text-white">You Don&apos;t Have to Wonder</span>
            <br />
            <span className="text-text-primary hero-word hero-word-1 dark:text-white">What Your Child Is</span>{' '}
            <span
              className="hero-word hero-word-2"
              style={{
                background: 'linear-gradient(135deg, #00F6ED 0%, #4056F4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Learning
            </span>
          </h1>

          <p className="hero-subtitle-anim text-text-primary font-body text-xl leading-[1.7] mb-10 max-w-[620px] mx-auto dark:!text-white/70">
            Teaching Labs keeps your child&apos;s teacher in the driver&apos;s seat, and keeps you in the loop.
          </p>

          <div className="hero-buttons-anim flex gap-4 justify-center flex-wrap mb-8">
            <Link
              href="/see-the-difference"
              className="inline-flex items-center justify-center gap-2 font-heading text-base font-bold bg-transparent text-deep-navy dark:text-white px-10 py-4 rounded-full border-4 border-gold dark:shadow-[0_0_20px_rgba(64,86,244,0.2)] hover:bg-gold hover:text-white hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(64,86,244,0.4)] transition-all duration-300"
            >
              See How It Works
            </Link>
            <Link
              href="/waitlist"
              className="inline-flex items-center justify-center gap-2 font-heading text-base font-bold bg-transparent text-deep-navy dark:text-white px-10 py-4 rounded-full border-4 border-coral dark:border-teal dark:shadow-[0_0_20px_rgba(0,246,237,0.15)] hover:bg-coral dark:hover:bg-teal hover:text-white dark:hover:text-deep-navy hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(86,31,55,0.3)] dark:hover:shadow-[0_6px_28px_rgba(0,246,237,0.35)] transition-all duration-300"
            >
              Join the Waitlist
            </Link>
          </div>
        </div>
      </section>

      <main>

        {/* ── 1. YOUR CHILD'S TEACHER BUILT THIS ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>Teacher-Created</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                Your Child&apos;s Teacher Built This
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-[#561F37] dark:bg-[#e63570] rounded-sm mx-auto mt-3" />
            </div>
            <div className="max-w-[760px] mx-auto fade-up">
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6] mb-4">
                This isn&apos;t a random chatbot from the internet.
              </p>
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-7">
                Every Teaching Labs AI is created by your child&apos;s actual teacher. It teaches the way they teach, uses their materials, and follows their standards. When your child works with Teaching Labs, they&apos;re getting guidance shaped by the person who knows their classroom best.
              </p>
              <Bridge>It&apos;s an extension of the classroom your child is already&nbsp;in.</Bridge>
              {/* Photo */}
              <div className="mt-10 feat-photo-hover">
                <Image src="/images/teacher-with-student.jpg" alt="Teacher kneeling beside a student, offering warm one-on-one guidance" width={760} height={400} className="w-full rounded-[20px] object-cover shadow-[0_20px_60px_rgba(20,33,61,0.15)]" />
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. IT DOESN'T GIVE ANSWERS ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>Real Learning</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                It Doesn&apos;t Give Answers. It Asks Questions.
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-[#561F37] dark:bg-[#e63570] rounded-sm mx-auto mt-3" />
            </div>
            <div className="max-w-[760px] mx-auto fade-up">
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6] mb-4">
                When your child asks Teaching Labs to write their homework, it says no.
              </p>
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-7">
                Instead, it asks them what they think. It pushes them to develop their own ideas, find their own sources, and build their own arguments. The same thing a great tutor would do sitting at the kitchen table, except it&apos;s available whenever your child needs it.
              </p>
              <Bridge>Your child does the thinking.<br />Teaching Labs just makes sure they don&apos;t get&nbsp;stuck.</Bridge>
            </div>
          </div>
        </section>

        {/* ── 3. IT CATCHES SHORTCUTS ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>Academic Integrity</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                It Catches Shortcuts
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-[#561F37] dark:bg-[#e63570] rounded-sm mx-auto mt-3" />
            </div>
            <div className="max-w-[760px] mx-auto fade-up">
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6] mb-4">
                If your child copies and pastes text from another AI tool,<br />Teaching Labs flags&nbsp;it.
              </p>
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-7">
                It asks them to explain it in their own words. No sneaking around. Teaching Labs is designed to make sure the work your child turns in is actually theirs.
              </p>
              {/* Three comparison screenshots */}
              <div className="grid grid-cols-3 gap-4 my-8 max-md:grid-cols-1">
                <div className="rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(20,33,61,0.15)]">
                  <Image src="/images/chatgpt-butterflies-screenshot.jpg" alt="ChatGPT writes a full report on butterflies for the student" width={400} height={500} className="w-full h-auto block" />
                </div>
                <div className="rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(20,33,61,0.15)]">
                  <Image src="/images/gemini-butterflies-screenshot.jpg" alt="Gemini writes a full report on butterflies for the student" width={400} height={500} className="w-full h-auto block" />
                </div>
                <div className="rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(20,33,61,0.15)]">
                  <Image src="/images/teachinglabs-butterflies-response.jpg" alt="Teaching Labs refuses to write the report and teaches instead" width={400} height={500} className="w-full h-auto block" />
                </div>
              </div>
              <Bridge>Other AI tools make it easy to be passive. Teaching Labs makes it hard not to learn.</Bridge>
            </div>
          </div>
        </section>

        {/* ── 4. TEACHER STAYS CONNECTED ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>Always Connected</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                Your Child&apos;s Teacher Stays Connected
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-[#561F37] dark:bg-[#e63570] rounded-sm mx-auto mt-3" />
            </div>
            <div className="max-w-[760px] mx-auto fade-up">
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6] mb-4">
                Teaching Labs gives teachers a window into how your child learns, not just what they turn in.
              </p>
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-7">
                If your child is struggling with a concept, their teacher knows before the next class. If they&apos;re ready for a challenge, their teacher knows that too. It&apos;s the kind of insight that used to require a one-on-one conversation, now available for every student.
              </p>
              <Bridge>Your child isn&apos;t alone with a machine. Their teacher is always part of the conversation.</Bridge>
              {/* Photo */}
              <div className="mt-10 feat-photo-hover">
                <Image src="/images/parent-teacher-conference.jpg" alt="Teacher and parent reviewing student progress data together on a tablet" width={760} height={400} className="w-full rounded-[20px] object-cover shadow-[0_20px_60px_rgba(20,33,61,0.15)]" />
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. WHAT COMES HOME IS REAL ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>Authentic Work</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                What Comes Home Is Real
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-[#561F37] dark:bg-[#e63570] rounded-sm mx-auto mt-3" />
            </div>
            <div className="max-w-[760px] mx-auto fade-up">
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6] mb-4">
                When your child finishes an assignment with Teaching Labs, they did the work.
              </p>
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-7">
                They built the argument. They found the evidence. They figured out where they were wrong and tried again. Teaching Labs guided them through the hard parts, but the thinking, the learning, and the growth are all theirs.
              </p>
              <Bridge>You can trust that what they&apos;re turning in represents what they actually know.</Bridge>
            </div>
          </div>
        </section>

        {/* ── GAINS CARDS ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>Benefits</Eyebrow>
              <SectionHeading>What This Means for Your Family</SectionHeading>
            </div>
            <div className="grid grid-cols-3 gap-8 max-md:grid-cols-1 fade-up">
              <Card
                emoji="🛡️"
                title="Safety You Can Trust"
                text="FERPA and COPPA compliant. Your child's data is protected, and the AI is guided by their teacher's standards, not the internet."
              />
              <Card
                emoji="📚"
                title="Real Learning, Not Shortcuts"
                text="Teaching Labs doesn't do the work for your child. It teaches them how to do it themselves, building skills that last beyond the assignment."
              />
              <Card
                emoji="🤝"
                title="Teacher in the Loop"
                text="Every interaction helps the teacher understand your child better. More insight means more personalized support in the classroom."
              />
            </div>
          </div>
        </section>

        {/* ── CTA SECTION ── */}
        <section className="relative overflow-hidden bg-warm-white dark:bg-transparent">
          <div className="absolute top-0 left-0 right-0 h-[200px] dark:hidden pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, #F7F7F8, transparent)' }} />
          <div className="absolute top-0 left-0 right-0 h-[200px] hidden dark:block pointer-events-none z-[2]"
            style={{ background: 'linear-gradient(to bottom, #0a1128, transparent)' }} />
          {/* Light mode: radiant blobs */}
          <div className="absolute inset-0 pointer-events-none dark:hidden" aria-hidden="true">
            <div className="absolute w-[500px] h-[500px] rounded-full top-[10%] left-[-10%] opacity-[0.25]"
              style={{ background: '#00F6ED', filter: 'blur(120px)' }} />
            <div className="absolute w-[450px] h-[450px] rounded-full top-[5%] right-[-8%] opacity-[0.25]"
              style={{ background: '#4056F4', filter: 'blur(120px)' }} />
            <div className="absolute w-[350px] h-[350px] rounded-full bottom-[10%] left-[40%] opacity-[0.12]"
              style={{ background: '#7B2D4A', filter: 'blur(120px)' }} />
          </div>
          {/* Dark mode: gradient */}
          <div className="absolute inset-0 pointer-events-none hidden dark:block" aria-hidden="true"
            style={{ background: 'linear-gradient(180deg, #1a3a4a 0%, #152a3a 40%, #0a1128 100%)' }} />
          <div className="absolute inset-0 pointer-events-none hidden dark:block" aria-hidden="true"
            style={{ background: 'radial-gradient(ellipse at center, rgba(64,86,244,0.12) 0%, transparent 70%)' }} />

          <div className="relative z-10 max-w-[800px] mx-auto px-12 py-36 text-center max-md:px-6 max-md:py-20">
            <div className="text-eyebrow font-extrabold font-heading text-xs font-bold tracking-[4px] uppercase mb-5 dark:text-white/50">
              For Families
            </div>
            <h2 className="text-text-primary font-heading font-extrabold tracking-[-1.5px] mb-5 leading-[1.15]"
              style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
              Ready to See What Your Child&apos;s Classroom Could Look Like?
            </h2>
            <p className="text-text-primary text-lg leading-[1.7] mb-10 max-w-[600px] mx-auto dark:!text-white/65">
              Teaching Labs is built by teachers, for students, with families in mind. Join the waitlist to be among the first to experience it.
            </p>
            <Link
              href="/waitlist"
              className="inline-flex justify-center items-center font-heading text-[17px] font-bold bg-transparent text-deep-navy dark:text-white border-4 border-gold hover:bg-gold hover:text-white px-12 py-4 rounded-full hover:-translate-y-0.5 transition-transform duration-300 shadow-[0_4px_20px_rgba(64,86,244,0.3)]"
            >
              Join the Waitlist
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
              <div className="font-heading text-xl font-bold text-text-primary mb-4">Teaching Labs</div>
              <p className="text-sm leading-[1.7] text-text-secondary mb-5 max-w-[280px]">
                AI-powered teaching platform that learns how you teach and helps every student get the support they need.
              </p>
              <div className="inline-flex items-center gap-2 font-heading text-xs font-semibold text-gold dark:text-teal bg-[rgba(64,86,244,0.08)] dark:bg-[rgba(0,246,237,0.1)] px-4 py-2 rounded-full border border-[rgba(64,86,244,0.15)] dark:border-[rgba(0,246,237,0.2)]">
                <IconStar />
                FERPA &amp; COPPA Compliant
              </div>
            </div>
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
          <div className="border-t border-black/10 dark:border-white/[0.08] pt-8 text-center text-[13px] text-text-muted">
            &copy; 2026 Intellectual Creations / Teaching Labs. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
