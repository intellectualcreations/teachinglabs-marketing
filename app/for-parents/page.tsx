import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import MarketingNav from '@/components/shared/MarketingNav';

export const metadata: Metadata = {
  title: 'For Parents — Teaching Labs',
  description:
    "Teaching Labs keeps your child's teacher in the driver's seat, and keeps you in the loop. Safe, teacher-guided AI for K-12.",
};

export default function ForParentsPage() {
  return (
    <>
      <MarketingNav />

      {/* ─── Hero ─── */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-warm-white dark:bg-deep-navy transition-colors duration-[400ms]">
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[80px] bg-teal opacity-[0.08] dark:opacity-[0.15] top-[10%] left-[15%] animate-[blobDrift1_12s_ease-in-out_infinite] max-md:w-[300px] max-md:h-[300px]" />
          <div className="absolute w-[450px] h-[450px] rounded-full blur-[80px] bg-gold opacity-[0.1] dark:opacity-[0.12] top-[30%] right-[10%] animate-[blobDrift2_14s_ease-in-out_infinite] max-md:w-[280px] max-md:h-[280px]" />
          <div className="absolute w-[350px] h-[350px] rounded-full blur-[80px] bg-coral opacity-0 dark:opacity-[0.06] top-[40%] left-[40%] animate-[blobDrift3_10s_ease-in-out_infinite] max-md:hidden" />
        </div>

        <div className="relative z-[2] text-center max-w-[900px] px-12 max-md:px-6">
          <div className="font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-6 inline-flex items-center before:content-[''] before:inline-block before:w-2 before:h-2 before:bg-gold before:rounded-full before:mr-3 before:flex-shrink-0">
            For Parents
          </div>

          <h1 className="font-heading text-[clamp(40px,6vw,72px)] font-extrabold tracking-[-2px] leading-[1.1] text-text-primary dark:text-white mb-6">
            You Don&apos;t Have to Wonder What Your Child Is{' '}
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(135deg, #561F37, #8B3A62)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Learning
            </span>
          </h1>

          <p className="font-body text-xl leading-[1.7] text-text-secondary dark:text-white/70 mb-10 max-w-[620px] mx-auto">
            Teaching Labs keeps your child&apos;s teacher in the driver&apos;s seat, and keeps you in the loop.
          </p>

          <div className="flex gap-4 justify-center flex-wrap max-[500px]:flex-col max-[500px]:items-center">
            <Link
              href="/see-the-difference"
              className="inline-flex items-center gap-2 font-heading text-base font-bold bg-transparent text-white border-4 border-gold hover:bg-gold px-10 py-4 rounded-full hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(64,86,244,0.45)] transition-all duration-300"
            >
              See How It Works
            </Link>
            <Link
              href="/waitlist"
              className="inline-flex items-center gap-2 font-heading text-base font-semibold bg-transparent text-teal dark:text-white px-10 py-4 rounded-full border-4 border-teal hover:bg-teal hover:text-white hover:-translate-y-0.5 transition-all duration-300"
            >
              Join the Waitlist
            </Link>
          </div>
        </div>
      </section>

      <main>
        {/* ─── Section 1: Teacher Built This ─── */}
        <section className="bg-warm-white dark:bg-deep-navy transition-colors duration-[400ms]">
          <div className="max-w-[1200px] mx-auto px-12 py-[100px] max-md:px-6 max-md:py-[60px]">
            <div className="max-w-[800px] mx-auto text-center fade-up">
              <h2 className="font-heading text-[clamp(28px,3.5vw,40px)] font-extrabold text-text-primary dark:text-white tracking-[-1px] leading-[1.2] mb-5 transition-colors duration-[400ms]">
                Your Child&apos;s Teacher Built This
              </h2>
              <p className="font-heading text-xl font-semibold text-gold leading-[1.6] mb-6">
                This isn&apos;t a random chatbot from the internet.
              </p>
              <p className="font-body text-base text-text-secondary dark:text-white/70 leading-[1.8] text-left mb-7 transition-colors duration-[400ms]">
                Every Teaching Labs AI is created by your child&apos;s actual teacher. It teaches the way they teach, uses their materials, and follows their standards. When your child works with Teaching Labs, they&apos;re getting guidance shaped by the person who knows their classroom best.
              </p>
              <div className="text-[26px] font-medium italic font-heading text-text-primary dark:text-white leading-[1.5] border-l-4 border-coral p-6 pl-6 bg-[rgba(0,246,237,0.04)] dark:bg-[rgba(0,246,237,0.06)] rounded-xl mt-7 text-left transition-colors duration-[400ms] max-md:text-xl max-md:p-6 max-md:pl-5">
                It&apos;s an extension of the classroom your child is already in.
              </div>
            </div>
          </div>
        </section>

        {/* Scenario Image 1 */}
        <div className="max-w-[800px] mx-auto px-12 max-md:px-6 fade-up">
          <Image
            src="/images/teacher-with-student.jpg"
            alt="Teacher kneeling beside a student, offering warm one-on-one guidance"
            width={800}
            height={533}
            className="w-full rounded-[20px] shadow-[0_20px_60px_rgba(20,33,61,0.15)]"
          />
        </div>

        {/* ─── Section 2: Doesn't Give Answers ─── */}
        <section className="bg-bg-secondary dark:bg-[#0D1B30] transition-colors duration-[400ms]">
          <div className="max-w-[1200px] mx-auto px-12 py-[100px] max-md:px-6 max-md:py-[60px]">
            <div className="max-w-[800px] mx-auto text-center fade-up">
              <h2 className="font-heading text-[clamp(28px,3.5vw,40px)] font-extrabold text-text-primary dark:text-white tracking-[-1px] leading-[1.2] mb-5 transition-colors duration-[400ms]">
                It Doesn&apos;t Give Answers. It Asks Questions.
              </h2>
              <p className="font-heading text-xl font-semibold text-gold leading-[1.6] mb-6">
                When your child asks Teaching Labs to write their homework, it says no.
              </p>
              <p className="font-body text-base text-text-secondary dark:text-white/70 leading-[1.8] text-left mb-7 transition-colors duration-[400ms]">
                Instead, it asks them what they think. It pushes them to develop their own ideas, find their own sources, and build their own arguments. The same thing a great tutor would do sitting at the kitchen table, except it&apos;s available whenever your child needs it.
              </p>
              <div className="text-[26px] font-medium italic font-heading text-text-primary dark:text-white leading-[1.5] border-l-4 border-coral p-6 pl-6 bg-[rgba(0,246,237,0.04)] dark:bg-[rgba(0,246,237,0.06)] rounded-xl mt-7 text-left transition-colors duration-[400ms] max-md:text-xl max-md:p-6 max-md:pl-5">
                Your child does the thinking. Teaching Labs just makes sure they don&apos;t get stuck.
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section 3: Catches Shortcuts ─── */}
        <section className="bg-warm-white dark:bg-deep-navy transition-colors duration-[400ms]">
          <div className="max-w-[1200px] mx-auto px-12 py-[100px] max-md:px-6 max-md:py-[60px]">
            <div className="max-w-[800px] mx-auto text-center fade-up">
              <h2 className="font-heading text-[clamp(28px,3.5vw,40px)] font-extrabold text-text-primary dark:text-white tracking-[-1px] leading-[1.2] mb-5 transition-colors duration-[400ms]">
                It Catches Shortcuts
              </h2>
              <p className="font-heading text-xl font-semibold text-gold leading-[1.6] mb-6">
                If your child copies and pastes text from another AI tool, Teaching Labs flags it.
              </p>
              <p className="font-body text-base text-text-secondary dark:text-white/70 leading-[1.8] text-left mb-7 transition-colors duration-[400ms]">
                It asks them to explain it in their own words. No sneaking around. No fake learning. Teaching Labs is designed to make sure the work your child turns in is actually theirs.
              </p>

              {/* Screenshot placeholder */}
              <div className="mx-auto my-8 max-w-[520px] rounded-[20px] overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)] border border-transparent dark:border-white/[0.08] bg-white dark:bg-white/[0.04] px-6 py-12 text-center text-text-muted dark:text-white/45 text-sm transition-colors duration-[400ms]">
                <p className="m-0">📸 Screenshot coming soon</p>
                <p className="mt-2 mb-0 text-xs">
                  Teaching Labs detecting copied AI text and asking the student to explain
                </p>
              </div>

              <div className="text-[26px] font-medium italic font-heading text-text-primary dark:text-white leading-[1.5] border-l-4 border-coral p-6 pl-6 bg-[rgba(0,246,237,0.04)] dark:bg-[rgba(0,246,237,0.06)] rounded-xl mt-7 text-left transition-colors duration-[400ms] max-md:text-xl max-md:p-6 max-md:pl-5">
                Other AI tools make it easy to cheat. Teaching Labs makes it hard to pretend.
              </div>
            </div>
          </div>
        </section>

        {/* ─── Section 4: Teacher Stays Connected ─── */}
        <section className="bg-bg-secondary dark:bg-[#0D1B30] transition-colors duration-[400ms]">
          <div className="max-w-[1200px] mx-auto px-12 py-[100px] max-md:px-6 max-md:py-[60px]">
            <div className="max-w-[800px] mx-auto text-center fade-up">
              <h2 className="font-heading text-[clamp(28px,3.5vw,40px)] font-extrabold text-text-primary dark:text-white tracking-[-1px] leading-[1.2] mb-5 transition-colors duration-[400ms]">
                Your Child&apos;s Teacher Stays Connected
              </h2>
              <p className="font-heading text-xl font-semibold text-gold leading-[1.6] mb-6">
                Teaching Labs gives teachers a window into how your child learns, not just what they turn in.
              </p>
              <p className="font-body text-base text-text-secondary dark:text-white/70 leading-[1.8] text-left mb-7 transition-colors duration-[400ms]">
                If your child is struggling with a concept, their teacher knows before the next class. If they&apos;re ready for a challenge, their teacher knows that too. It&apos;s the kind of insight that used to require a one-on-one conversation, now available for every student.
              </p>
              <div className="text-[26px] font-medium italic font-heading text-text-primary dark:text-white leading-[1.5] border-l-4 border-coral p-6 pl-6 bg-[rgba(0,246,237,0.04)] dark:bg-[rgba(0,246,237,0.06)] rounded-xl mt-7 text-left transition-colors duration-[400ms] max-md:text-xl max-md:p-6 max-md:pl-5">
                Your child isn&apos;t alone with a machine. Their teacher is always part of the conversation.
              </div>
            </div>
          </div>
        </section>

        {/* Scenario Image 2 */}
        <div className="max-w-[800px] mx-auto px-12 max-md:px-6 fade-up">
          <Image
            src="/images/parent-teacher-conference.jpg"
            alt="Teacher and parent reviewing student progress data together on a tablet"
            width={800}
            height={533}
            className="w-full rounded-[20px] shadow-[0_20px_60px_rgba(20,33,61,0.15)]"
          />
        </div>

        {/* ─── Section 5: What Comes Home Is Real ─── */}
        <section className="bg-warm-white dark:bg-deep-navy transition-colors duration-[400ms]">
          <div className="max-w-[1200px] mx-auto px-12 py-[100px] max-md:px-6 max-md:py-[60px]">
            <div className="max-w-[800px] mx-auto text-center fade-up">
              <h2 className="font-heading text-[clamp(28px,3.5vw,40px)] font-extrabold text-text-primary dark:text-white tracking-[-1px] leading-[1.2] mb-5 transition-colors duration-[400ms]">
                What Comes Home Is Real
              </h2>
              <p className="font-heading text-xl font-semibold text-gold leading-[1.6] mb-6">
                When your child finishes an assignment with Teaching Labs, they did the work.
              </p>
              <p className="font-body text-base text-text-secondary dark:text-white/70 leading-[1.8] text-left mb-7 transition-colors duration-[400ms]">
                They built the argument. They found the evidence. They figured out where they were wrong and tried again. Teaching Labs guided them through the hard parts, but the thinking, the learning, and the growth are all theirs.
              </p>
              <div className="text-[26px] font-medium italic font-heading text-text-primary dark:text-white leading-[1.5] border-l-4 border-coral p-6 pl-6 bg-[rgba(0,246,237,0.04)] dark:bg-[rgba(0,246,237,0.06)] rounded-xl mt-7 text-left transition-colors duration-[400ms] max-md:text-xl max-md:p-6 max-md:pl-5">
                You can trust that what they&apos;re turning in represents what they actually know.
              </div>
            </div>
          </div>
        </section>

        {/* ─── Gains / Benefits Section ─── */}
        <section className="bg-bg-secondary dark:bg-[#0D1B30] transition-colors duration-[400ms]">
          <div className="max-w-[1200px] mx-auto px-12 py-[100px] max-md:px-6 max-md:py-[60px]">
            <div className="fade-up text-center mb-14">
              <div className="font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-4 inline-flex items-center relative before:content-[''] before:inline-block before:w-2 before:h-2 before:bg-gold before:rounded-full before:mr-3 before:flex-shrink-0">
                Benefits
              </div>
              <h2 className="font-heading text-[clamp(36px,5vw,56px)] font-extrabold tracking-[-1.5px] leading-[1.15] text-text-primary dark:text-white inline-block transition-colors duration-[400ms]">
                What This Means for Your Family
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-8 max-md:grid-cols-1">
              {/* Card 1 */}
              <div className="fade-up bg-white dark:bg-white/[0.04] border border-transparent dark:border-white/[0.08] rounded-[20px] px-8 py-10 relative overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)] hover:-translate-y-1.5 hover:shadow-[0_8px_40px_rgba(20,33,61,0.1)] dark:hover:shadow-[0_8px_32px_rgba(64,86,244,0.08),0_4px_20px_rgba(255,107,107,0.06)] transition-all duration-[400ms] before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-teal before:to-teal/30 before:rounded-l-[20px] dark:before:hidden">
                <div className="text-[32px] mb-6 animate-[gentleFloat_3s_ease-in-out_infinite_0s]">🛡️</div>
                <h3 className="font-heading text-lg font-bold text-text-primary dark:text-white mb-3 transition-colors duration-[400ms]">
                  Safety You Can Trust
                </h3>
                <p className="font-body text-[15px] leading-[1.78] text-text-secondary dark:text-white/70 transition-colors duration-[400ms]">
                  FERPA and COPPA compliant. Your child&apos;s data is protected, and the AI is guided by their teacher&apos;s standards, not the internet.
                </p>
              </div>

              {/* Card 2 */}
              <div className="fade-up bg-white dark:bg-white/[0.04] border border-transparent dark:border-white/[0.08] rounded-[20px] px-8 py-10 relative overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)] hover:-translate-y-1.5 hover:shadow-[0_8px_40px_rgba(20,33,61,0.1)] dark:hover:shadow-[0_8px_32px_rgba(64,86,244,0.08),0_4px_20px_rgba(255,107,107,0.06)] transition-all duration-[400ms] before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-teal before:to-teal/30 before:rounded-l-[20px] dark:before:hidden">
                <div className="text-[32px] mb-6 animate-[gentleFloat_3s_ease-in-out_infinite_0.5s]">📚</div>
                <h3 className="font-heading text-lg font-bold text-text-primary dark:text-white mb-3 transition-colors duration-[400ms]">
                  Real Learning, Not Shortcuts
                </h3>
                <p className="font-body text-[15px] leading-[1.78] text-text-secondary dark:text-white/70 transition-colors duration-[400ms]">
                  Teaching Labs doesn&apos;t do the work for your child. It teaches them how to do it themselves, building skills that last beyond the assignment.
                </p>
              </div>

              {/* Card 3 */}
              <div className="fade-up bg-white dark:bg-white/[0.04] border border-transparent dark:border-white/[0.08] rounded-[20px] px-8 py-10 relative overflow-hidden shadow-[0_2px_20px_rgba(20,33,61,0.05)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)] hover:-translate-y-1.5 hover:shadow-[0_8px_40px_rgba(20,33,61,0.1)] dark:hover:shadow-[0_8px_32px_rgba(64,86,244,0.08),0_4px_20px_rgba(255,107,107,0.06)] transition-all duration-[400ms] before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-teal before:to-teal/30 before:rounded-l-[20px] dark:before:hidden">
                <div className="text-[32px] mb-6 animate-[gentleFloat_3s_ease-in-out_infinite_1s]">🤝</div>
                <h3 className="font-heading text-lg font-bold text-text-primary dark:text-white mb-3 transition-colors duration-[400ms]">
                  Teacher in the Loop
                </h3>
                <p className="font-body text-[15px] leading-[1.78] text-text-secondary dark:text-white/70 transition-colors duration-[400ms]">
                  Every interaction helps the teacher understand your child better. More insight means more personalized support in the classroom.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CTA Section ─── */}
        <section
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #14213D 0%, #1a3a4a 50%, #1d4a52 100%)',
          }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(64,86,244,0.12) 0%, transparent 70%)' }} />
          <div className="max-w-[800px] mx-auto px-12 py-[120px] text-center relative z-[2] max-md:px-6 max-md:py-[80px] fade-up">
            <div className="font-heading text-xs font-bold tracking-[4px] uppercase text-white/50 mb-5">
              For Families
            </div>
            <h2 className="font-heading text-[clamp(32px,4.5vw,48px)] font-extrabold tracking-[-1.5px] text-white mb-5 leading-[1.15]">
              Ready to See What Your Child&apos;s Classroom Could Look Like?
            </h2>
            <p className="text-lg leading-[1.7] text-white/65 mb-10 max-w-[600px] mx-auto">
              Teaching Labs is built by teachers, for students, with families in mind. Join the waitlist to be among the first to experience it.
            </p>
            <Link
              href="/waitlist"
              className="inline-flex items-center font-heading text-[17px] font-bold bg-transparent text-white border-4 border-gold hover:bg-gold px-12 py-4 rounded-full animate-[gentlePulse_2.5s_ease-in-out_infinite] hover:-translate-y-0.5 transition-transform duration-300"
            >
              Join the Waitlist
            </Link>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
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
