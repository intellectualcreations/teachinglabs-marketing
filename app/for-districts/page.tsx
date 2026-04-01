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

/* ─── SVG Icons ─── */
function IconStar() {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M7 0l1.5 4.5H13l-3.5 2.7 1.3 4.3L7 8.8 3.2 11.5l1.3-4.3L1 4.5h4.5z" />
    </svg>
  );
}

/* Governance principle icons (animated SVG) */
function IconTeacherGuided() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true" className="text-teal">
      <ellipse cx="20" cy="20" rx="16" ry="7" stroke="currentColor" strokeWidth="1.5" opacity="0.7" transform="rotate(20 20 20)" />
      <ellipse cx="20" cy="20" rx="16" ry="7" stroke="var(--color-text-primary)" strokeWidth="1.5" opacity="0.4" transform="rotate(-20 20 20)" />
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
      <path d="M 6 20 Q 14 8 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      <path d="M 20 20 Q 26 32 34 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M 10 28 Q 20 16 30 28" stroke="var(--color-text-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
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
      <line x1="10" y1="28" x2="30" y2="28" stroke="var(--color-text-primary)" strokeWidth="1" opacity="0.25" />
    </svg>
  );
}

/* ─── Principle card with animated icon ─── */
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
    <div className="card-accent relative bg-card-bg rounded-[20px] p-9 overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] hover:shadow-[0_8px_40px_rgba(20,33,61,0.10)] hover:-translate-y-1.5 transition-all duration-300">
      <div className={`mb-4 ${floatClass}`}>{icon}</div>
      <h3 className="font-heading text-[17px] font-bold text-text-primary tracking-[-0.2px] mb-3">{title}</h3>
      {paragraphs.map((p, i) => (
        <p key={i} className="text-[14.5px] text-text-secondary leading-[1.75] mb-2 last:mb-0">{p}</p>
      ))}
    </div>
  );
}

/* ─── Eyebrow label (matches homepage) ─── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[#7B2D4A] dark:text-[#00F6ED] font-extrabold flex items-center justify-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase mb-4">
      <span className="bg-[#7B2D4A] dark:bg-[#00F6ED] w-2 h-2 rounded-full flex-shrink-0" />
      {children}
    </div>
  );
}

/* ─── Bridge quote (matches homepage) ─── */
function Bridge({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-coral bg-[rgba(0,246,237,0.04)] dark:bg-[rgba(0,246,237,0.06)] rounded-xl p-8 pl-6 max-w-3xl font-heading text-[26px] font-medium italic leading-[1.5] text-text-primary mx-auto max-md:text-xl max-md:p-6 max-md:pl-5">
      {children}
    </div>
  );
}

/* ─── Bullet item ─── */
function MomentItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3.5 text-base text-text-secondary leading-[1.6]">
      <span className="w-2 h-2 rounded-full bg-teal flex-shrink-0 opacity-70" />
      <span>{children}</span>
    </div>
  );
}


/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
export default function ForDistrictsPage() {
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
          <div className="text-[#7B2D4A] dark:text-[#00F6ED] font-extrabold inline-flex items-center gap-3 font-heading text-xs font-bold tracking-[4px] uppercase mb-6">
            <span className="bg-[#7B2D4A] dark:bg-[#00F6ED] w-2 h-2 rounded-full flex-shrink-0" />
            For District Leaders
          </div>

          <h1
            className="font-heading font-extrabold tracking-[-2px] leading-[1.15] mb-6"
            style={{ fontSize: 'clamp(38px, 6vw, 68px)' }}
          >
            <span className="text-black dark:text-white hero-word hero-word-0 dark:text-white">AI Is Here.</span>{' '}
            <span
              className="hero-word hero-word-1"
              style={{
                background: 'linear-gradient(135deg, #00F6ED 0%, #4056F4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Guide&nbsp;It.
            </span>
          </h1>

          <p className="hero-subtitle-anim text-black dark:text-white font-body text-xl leading-[1.7] mb-5 max-w-[680px] mx-auto dark:!text-white/70">
            Teachers and students are already experimenting with AI tools, often without district oversight or instructional guardrails. Will AI simply generate answers and shortcuts, or will it strengthen teaching and learning?
          </p>

          <p className="hero-subtitle-anim font-heading text-[18px] font-semibold text-gold leading-[1.6] mb-10 max-w-[640px] mx-auto">
            Teaching Labs helps districts take the path that extends teacher expertise so students receive guidance that encourages thinking, practice, and growth.
          </p>

          <div className="hero-buttons-anim flex gap-4 justify-center flex-wrap mb-8">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 font-heading text-base font-bold bg-transparent text-deep-navy dark:text-white px-10 py-4 rounded-full border-4 border-gold dark:shadow-[0_0_20px_rgba(64,86,244,0.2)] hover:bg-gold hover:text-white hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(64,86,244,0.4)] transition-all duration-300"
            >
              Request District Access
            </Link>
            <Link
              href="/see-the-difference"
              className="inline-flex items-center justify-center gap-2 font-heading text-base font-bold bg-transparent text-deep-navy dark:text-white px-10 py-4 rounded-full border-4 border-coral dark:border-teal dark:shadow-[0_0_20px_rgba(0,246,237,0.15)] hover:bg-coral dark:hover:bg-teal hover:text-white dark:hover:text-deep-navy hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(86,31,55,0.3)] dark:hover:shadow-[0_6px_28px_rgba(0,246,237,0.35)] transition-all duration-300"
            >
              See the Difference
            </Link>
          </div>
        </div>
      </section>

      <main>

        {/* ── A RESPONSIBLE APPROACH ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>Responsible AI</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                A Responsible Approach to AI in Schools
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-[#561F37] dark:bg-[#e63570] rounded-sm mx-auto mt-3" />
            </div>
            <div className="max-w-[760px] mx-auto fade-up">
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6] mb-4">
                Artificial intelligence should strengthen teaching and learning, not replace thinking, human interaction, or hands-on discovery.
              </p>
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                Teaching Labs was designed around a simple belief: students are at the center of learning, and teachers provide the guidance that helps them grow.
              </p>
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                Our technology learns from educators and extends their expertise across the classroom so every student stays supported, challenged, and engaged.
              </p>
              <Bridge>When designed this way, AI does not replace teachers. It helps great teaching reach every student.</Bridge>
            </div>
          </div>
        </section>

        {/* ── GOVERNANCE DISTRICTS CAN TRUST ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>Governance</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                Governance Districts Can Trust
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-[#561F37] dark:bg-[#e63570] rounded-sm mx-auto mt-3" />
              <p className="text-[17px] text-text-secondary leading-[1.8] mt-6 max-w-[760px] mx-auto">
                AI in education requires clear oversight, strong privacy protections, and transparency for district leaders. Teaching Labs was designed with these requirements from the beginning.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-8 max-lg:grid-cols-2 max-md:grid-cols-1 fade-up">
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

        {/* ── BUILT AROUND YOUR TEACHERS ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>Teacher-Centered</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                Built Around Your Teachers
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-[#561F37] dark:bg-[#e63570] rounded-sm mx-auto mt-3" />
            </div>
            <div className="max-w-[760px] mx-auto fade-up">
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                Most AI platforms begin with content libraries and algorithms. Teaching Labs begins with your educators.
              </p>
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                Each teacher trains their own AI assistant based on how they explain concepts, guide students, and respond when learning breaks down. The result is not generic AI.
              </p>
              <Bridge>It is an extension of the teaching expertise that already exists in your district, available to every student.</Bridge>
              <div className="mt-10 feat-photo-hover">
                <Image src="/images/teachers-collaborating.jpg" alt="Diverse group of teachers collaborating around laptops in a professional development session" width={760} height={400} className="w-full rounded-[20px] object-cover shadow-[0_20px_60px_rgba(20,33,61,0.15)]" />
              </div>
            </div>
          </div>
        </section>

        {/* ── ADOPTION THAT HAPPENS NATURALLY ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>Adoption</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                Adoption That Happens Naturally
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-[#561F37] dark:bg-[#e63570] rounded-sm mx-auto mt-3" />
            </div>
            <div className="max-w-[760px] mx-auto fade-up">
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                District leaders know that the biggest barrier to technology success is teacher adoption. Teaching Labs was designed so that teachers use it because it helps them, not because they are required to.
              </p>
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6] mb-4">
                Teachers experience value immediately:
              </p>
              <div className="flex flex-col gap-3.5 mb-7">
                <MomentItem>Setup takes minutes, not months</MomentItem>
                <MomentItem>The platform works within existing curriculum</MomentItem>
                <MomentItem>Teachers see their own teaching style reflected back</MomentItem>
                <MomentItem>Time savings appear from the first week of use</MomentItem>
              </div>
              <Bridge>When teachers feel ownership, adoption follows.</Bridge>
            </div>
          </div>
        </section>

        {/* ── VISIBILITY WITHOUT MICROMANAGEMENT ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>District Insights</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                Visibility Without Micromanagement
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-[#561F37] dark:bg-[#e63570] rounded-sm mx-auto mt-3" />
            </div>
            <div className="max-w-[760px] mx-auto fade-up">
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                District leaders need meaningful insight into learning across schools. Teachers need professional trust. Teaching Labs provides both.
              </p>
              <p className="font-heading text-[17px] font-semibold text-text-primary leading-[1.6] mb-4">
                District administrators gain visibility into:
              </p>
              <div className="flex flex-col gap-3.5 mb-7">
                <MomentItem>Learning patterns across classrooms and schools</MomentItem>
                <MomentItem>Standards alignment and progress signals</MomentItem>
                <MomentItem>Platform usage tied to real instructional activity</MomentItem>
                <MomentItem>Compliance-ready reporting for district leadership</MomentItem>
              </div>
              <Bridge>The result is actionable insight that supports district decision-making, not vanity metrics.</Bridge>
              <div className="mt-10 feat-photo-hover">
                <Image src="/images/superintendent-dashboard.jpg" alt="Superintendent reviewing student progress dashboard on her office monitor" width={760} height={400} className="w-full rounded-[20px] object-cover shadow-[0_20px_60px_rgba(20,33,61,0.15)]" />
              </div>
            </div>
          </div>
        </section>

        {/* ── WHAT DISTRICTS GAIN ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>Benefits</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                What Districts Gain
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-[#561F37] dark:bg-[#e63570] rounded-sm mx-auto mt-3" />
            </div>
            <div className="grid grid-cols-4 gap-8 max-lg:grid-cols-2 max-md:grid-cols-1 fade-up">
              <div className="card-accent relative bg-card-bg rounded-[20px] p-9 overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] hover:shadow-[0_8px_40px_rgba(20,33,61,0.10)] hover:-translate-y-1.5 transition-all duration-300 text-center">
                <div className="font-heading text-[19px] font-extrabold tracking-[-0.3px] mb-3"
                  style={{ background: 'linear-gradient(135deg, #00F6ED 0%, #4056F4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Instructional Integrity
                </div>
                <p className="text-[15px] leading-[1.78] text-text-secondary">AI strengthens teaching and learning rather than replacing it.</p>
              </div>
              <div className="card-accent relative bg-card-bg rounded-[20px] p-9 overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] hover:shadow-[0_8px_40px_rgba(20,33,61,0.10)] hover:-translate-y-1.5 transition-all duration-300 text-center">
                <div className="font-heading text-[19px] font-extrabold tracking-[-0.3px] mb-3"
                  style={{ background: 'linear-gradient(135deg, #00F6ED 0%, #4056F4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Teacher Adoption
                </div>
                <p className="text-[15px] leading-[1.78] text-text-secondary">Tools teachers choose to use because they support the work they already do.</p>
              </div>
              <div className="card-accent relative bg-card-bg rounded-[20px] p-9 overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] hover:shadow-[0_8px_40px_rgba(20,33,61,0.10)] hover:-translate-y-1.5 transition-all duration-300 text-center">
                <div className="font-heading text-[19px] font-extrabold tracking-[-0.3px] mb-3"
                  style={{ background: 'linear-gradient(135deg, #00F6ED 0%, #4056F4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  District Visibility
                </div>
                <p className="text-[15px] leading-[1.78] text-text-secondary">Clear insight into learning patterns across schools and classrooms.</p>
              </div>
              <div className="card-accent relative bg-card-bg rounded-[20px] p-9 overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] hover:shadow-[0_8px_40px_rgba(20,33,61,0.10)] hover:-translate-y-1.5 transition-all duration-300 text-center">
                <div className="font-heading text-[19px] font-extrabold tracking-[-0.3px] mb-3"
                  style={{ background: 'linear-gradient(135deg, #00F6ED 0%, #4056F4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Responsible AI
                </div>
                <p className="text-[15px] leading-[1.78] text-text-secondary">Governance, privacy, and transparency built into the platform architecture.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── LEADING THE NEXT ERA ── */}
        <section className="bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[1200px] mx-auto px-12 py-24 max-md:px-6 max-md:py-16">
            <div className="text-center mb-14 fade-up">
              <Eyebrow>The Future</Eyebrow>
              <h2 className="font-heading font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                Leading the Next Era of Learning
              </h2>
              <div className="w-[576px] max-w-full h-[3px] bg-[#561F37] dark:bg-[#e63570] rounded-sm mx-auto mt-3" />
            </div>
            <div className="max-w-[760px] mx-auto fade-up">
              <p className="text-[17px] text-text-secondary leading-[1.8] mb-4">
                Artificial intelligence will play a role in the future of education. The question for districts is not whether AI will enter classrooms, but how it will support teaching and learning when it does.
              </p>
              <Bridge>Teaching Labs helps districts introduce AI in a way that protects students, strengthens teaching, and supports real learning.</Bridge>
            </div>
          </div>
        </section>

        {/* ── CTA SECTION ── */}
        <section className="relative overflow-hidden bg-warm-white dark:bg-transparent">
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

          <div className="relative z-10 max-w-[800px] mx-auto px-12 py-36 text-center max-md:px-6 max-md:py-20">
            <div className="text-[#7B2D4A] dark:text-[#00F6ED] font-extrabold font-heading text-xs font-bold tracking-[4px] uppercase mb-5 dark:text-white/50">
              District Leadership
            </div>
            <h2 className="text-black dark:text-white font-heading font-extrabold tracking-[-1.5px] mb-5 leading-[1.15]"
              style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
              Ready to Lead Your District Into the Next Era of Learning?
            </h2>
            <p className="text-black dark:text-white text-lg leading-[1.7] mb-10 max-w-[600px] mx-auto dark:!text-white/65">
              Get early access and help shape responsible AI for your schools.
            </p>
            <Link
              href="/contact"
              className="inline-flex justify-center items-center font-heading text-[17px] font-bold bg-transparent text-deep-navy dark:text-white border-4 border-gold hover:bg-gold hover:text-white px-12 py-4 rounded-full hover:-translate-y-0.5 transition-transform duration-300 shadow-[0_4px_20px_rgba(64,86,244,0.3)]"
            >
              Request District Access
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
              <div className="font-heading text-xl font-bold text-black dark:text-white mb-4">Teaching Labs</div>
              <p className="text-sm leading-[1.7] text-black dark:text-white/90 mb-5 max-w-[280px]">
                AI-powered teaching platform that learns how you teach and helps every student get the support they need.
              </p>
              <div className="inline-flex items-center gap-2 font-heading text-xs font-semibold text-gold dark:text-teal bg-[rgba(64,86,244,0.08)] dark:bg-[rgba(0,246,237,0.1)] px-4 py-2 rounded-full border border-[rgba(64,86,244,0.15)] dark:border-[rgba(0,246,237,0.2)]">
                <IconStar />
                FERPA &amp; COPPA Compliant
              </div>
            </div>
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-black/70 dark:text-white/60 mb-5">Platform</div>
              <ul className="space-y-3 list-none">
                {[
                  { href: '/for-teachers', label: 'For Teachers' },
                  { href: '/for-students', label: 'For Students' },
                  { href: '/for-districts', label: 'For Districts' },
                  { href: '/for-parents', label: 'For Parents' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-black dark:text-white/90 hover:text-gold transition-colors duration-200">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-black/70 dark:text-white/60 mb-5">Company</div>
              <ul className="space-y-3 list-none">
                {[
                  { href: '/our-story', label: 'Our Story' },
                  { href: '/how-it-works', label: 'How It Works' },
                  { href: '/pricing', label: 'Pricing' },
                  { href: '/contact', label: 'Contact' },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-black dark:text-white/90 hover:text-gold transition-colors duration-200">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-heading text-[13px] font-bold tracking-[2px] uppercase text-black/70 dark:text-white/60 mb-5">Legal</div>
              <ul className="space-y-3 list-none">
                {[
                  { href: '#', label: 'Privacy Policy' },
                  { href: '#', label: 'Terms of Service' },
                  { href: '#', label: 'Cookie Policy' },
                  { href: '#', label: 'Accessibility' },
                ].map(({ href, label }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-black dark:text-white/90 hover:text-gold transition-colors duration-200">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-black/10 dark:border-white/[0.08] pt-8 text-center text-[13px] text-black/70 dark:text-white/60">
            &copy; 2026 Intellectual Creations / Teaching Labs. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
