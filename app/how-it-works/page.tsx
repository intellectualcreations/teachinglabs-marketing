import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import MarketingNav from '@/components/shared/MarketingNav';

export const metadata: Metadata = {
  title: 'How It Works — Teaching Labs',
  description: 'Teaching Labs creates an AI assistant built from your teaching style. Here\'s how it works.',
};

export default function HowItWorks() {
  return (
    <>
      <MarketingNav />

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-warm-white dark:bg-deep-navy transition-colors duration-[400ms]">
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[80px] bg-teal opacity-[0.08] dark:opacity-[0.15] top-[10%] left-[15%] animate-[blobDrift1_12s_ease-in-out_infinite] max-md:w-[300px] max-md:h-[300px]" />
          <div className="absolute w-[450px] h-[450px] rounded-full blur-[80px] bg-gold opacity-[0.1] dark:opacity-[0.12] top-[30%] right-[10%] animate-[blobDrift2_14s_ease-in-out_infinite] max-md:w-[280px] max-md:h-[280px]" />
          <div className="absolute w-[350px] h-[350px] rounded-full blur-[80px] bg-coral opacity-0 dark:opacity-[0.06] top-[40%] left-[40%] animate-[blobDrift3_10s_ease-in-out_infinite] max-md:hidden" />
        </div>

        <div className="relative z-[2] text-center max-w-[900px] px-12 max-md:px-6">
          <div className="font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-6 inline-flex items-center before:content-[''] before:inline-block before:w-2 before:h-2 before:bg-gold before:rounded-full before:mr-3 before:flex-shrink-0">
            How It Works
          </div>
          <h1 className="font-heading text-[clamp(44px,7vw,80px)] font-extrabold tracking-[-2px] leading-[1.1] text-dark dark:text-white mb-6">
            Meet Your{' '}
            <span style={{ background: 'linear-gradient(135deg, #00F6ED, #4056F4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Teacher Twin
            </span>
          </h1>
          <p className="font-body text-xl leading-[1.7] text-body dark:text-white/70 mb-10 max-w-[620px] mx-auto">
            Teaching Labs creates an AI assistant built from your teaching style. Here&apos;s how it works.
          </p>
        </div>
      </section>

      <main>
        {/* Hero Image */}
        <section className="p-0 bg-[var(--bg-secondary)] transition-colors duration-[400ms]">
          <div className="max-w-[960px] mx-auto px-10 py-12 max-md:px-6 max-md:py-8 fade-up">
            <Image
              src="/images/teacher-twin-reflection.jpg"
              alt="A teacher interacting with her AI Teacher Twin on a digital display in a modern classroom"
              width={960}
              height={540}
              className="w-full rounded-[20px] shadow-[0_20px_60px_rgba(20,33,61,0.15)]"
              loading="lazy"
            />
            <p className="text-center mt-4 text-sm text-muted font-body transition-colors duration-[400ms]">
              Your expertise, reflected. Your Teacher Twin learns how you teach and extends your reach to every student.
            </p>
          </div>
        </section>

        {/* Steps Section */}
        <section className="transition-colors duration-[400ms] bg-warm-white dark:bg-deep-navy">
          <div className="max-w-[800px] mx-auto px-12 py-[100px] max-md:px-6 max-md:py-[60px]">

            <div className="mb-14 fade-up">
              <div className="font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-4 inline-flex items-center before:content-[''] before:inline-block before:w-2 before:h-2 before:bg-gold before:rounded-full before:mr-3 before:flex-shrink-0">
                Teach the System
              </div>
              <h2 className="font-heading text-2xl font-bold text-dark dark:text-white mb-4 transition-colors duration-[400ms]">
                You share how you teach.
              </h2>
              <p className="font-body text-[17px] text-body dark:text-white/70 leading-[1.8] transition-colors duration-[400ms]">
                Teaching Labs learns from how you explain concepts, guide students through problems, and respond when understanding breaks down. The system builds an AI assistant that reflects your instructional approach, not a generic chatbot.
              </p>
            </div>

            <div className="mb-14 fade-up">
              <div className="font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-4 inline-flex items-center before:content-[''] before:inline-block before:w-2 before:h-2 before:bg-gold before:rounded-full before:mr-3 before:flex-shrink-0">
                Support Every Student
              </div>
              <h2 className="font-heading text-2xl font-bold text-dark dark:text-white mb-4 transition-colors duration-[400ms]">
                Your guidance reaches every learner.
              </h2>
              <p className="font-body text-[17px] text-body dark:text-white/70 leading-[1.8] transition-colors duration-[400ms]">
                Your Teacher Twin provides personalized support that sounds like you and teaches like you. Students who need help get guidance aligned with your classroom instruction, whether you&apos;re available in that moment or not.
              </p>
            </div>

            <div className="mb-14 fade-up">
              <div className="font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-4 inline-flex items-center before:content-[''] before:inline-block before:w-2 before:h-2 before:bg-gold before:rounded-full before:mr-3 before:flex-shrink-0">
                Focus Your Attention
              </div>
              <h2 className="font-heading text-2xl font-bold text-dark dark:text-white mb-4 transition-colors duration-[400ms]">
                You stay in control of what matters.
              </h2>
              <p className="font-body text-[17px] text-body dark:text-white/70 leading-[1.8] transition-colors duration-[400ms]">
                With routine support handled, you see where students are struggling, what questions they&apos;re asking, and where your attention will make the biggest difference. Teaching Labs doesn&apos;t replace your judgment. It gives you better information to act on.
              </p>
            </div>

            <div className="fade-up mt-12 font-heading text-[26px] font-medium italic leading-[1.5] text-dark dark:text-white border-l-4 border-coral p-8 pl-6 bg-[rgba(0,246,237,0.04)] dark:bg-[rgba(0,246,237,0.06)] rounded-xl max-w-[800px] transition-colors duration-[400ms] max-md:text-xl max-md:p-6 max-md:pl-5">
              Teaching Labs doesn&apos;t replace great teaching. It helps great teaching reach every student.
            </div>

          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #14213D 0%, #1a3a4a 50%, #1d4a52 100%)' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, rgba(240, 201, 93, 0.12) 0%, transparent 70%)' }} />
          <div className="max-w-[800px] mx-auto px-12 py-[120px] text-center relative z-[2] max-md:px-6 max-md:py-20 fade-up">
            <h2 className="font-heading text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-1px] text-white mb-5 leading-[1.2]">
              Ready to Meet Your Teacher Twin?
            </h2>
            <p className="text-[17px] leading-[1.7] text-white/65 mb-8 max-w-[500px] mx-auto">
              Get early access and be among the first to see what&apos;s possible.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center font-heading text-[17px] font-bold bg-gold text-white px-12 py-4 rounded-full shadow-[0_4px_20px_rgba(64,86,244,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(64,86,244,0.45)] transition-all duration-300"
            >
              Get Early Access
            </Link>
          </div>
        </section>
      </main>

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
