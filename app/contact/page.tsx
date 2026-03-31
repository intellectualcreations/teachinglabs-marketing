import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingNav from '@/components/shared/MarketingNav';
import ContactForm from './_components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact — Teaching Labs',
  description:
    "Get in touch with Teaching Labs. Whether you're a teacher, district leader, or just curious, we'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <>
      <MarketingNav />

      {/* Hero */}
      <section
        className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-warm-white py-20 pb-[60px] max-md:py-[60px] max-md:pb-10"
      >
        {/* Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute rounded-full"
            style={{
              width: 500,
              height: 500,
              background: '#00F6ED',
              opacity: 0.08,
              top: '10%',
              left: '15%',
              filter: 'blur(80px)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 450,
              height: 450,
              background: '#4056F4',
              opacity: 0.1,
              top: '30%',
              right: '10%',
              filter: 'blur(80px)',
            }}
          />
        </div>

        <div className="relative z-[2] text-center max-w-[900px] px-12 max-md:px-6">
          <div className="font-heading text-xs font-bold tracking-[4px] uppercase text-teal mb-6 inline-flex items-center">
            <span
              className="inline-block w-2 h-2 bg-gold rounded-full mr-3 flex-shrink-0"
            />
            Contact Us
          </div>

          <h1 className="font-heading text-[clamp(40px,6vw,72px)] font-extrabold tracking-[-2px] leading-[1.1] text-[var(--text-dark)] mb-6">
            Let&apos;s Start a{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #00F6ED, #4056F4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Conversation
            </span>
          </h1>

          <p className="font-body text-xl leading-[1.7] text-[var(--text-body)] mb-10 max-w-[620px] mx-auto">
            Whether you&apos;re a teacher, district leader, or just curious — we&apos;d love to hear from you.
          </p>

          <div className="flex gap-4 justify-center flex-wrap mb-5 max-[500px]:flex-col max-[500px]:items-center">
            <Link
              href="/see-the-difference"
              className="inline-flex items-center gap-2 font-heading text-base font-bold bg-gold text-white px-10 py-4 rounded-full shadow-[0_4px_20px_rgba(64,86,244,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(64,86,244,0.45)] transition-all max-[500px]:w-full max-[500px]:justify-center"
            >
              See How It Works
            </Link>
            <Link
              href="https://teaching-labs-demo.netlify.app/landing-page/hero-banner.html"
              className="inline-flex items-center gap-2 font-heading text-base font-semibold bg-transparent text-teal px-10 py-4 rounded-full border-2 border-teal hover:bg-teal hover:text-white hover:-translate-y-0.5 transition-all max-[500px]:w-full max-[500px]:justify-center"
            >
              Join the Waitlist
            </Link>
          </div>

          <p className="font-heading text-[13px] text-[var(--text-muted)]">
            We respond to every message personally.
          </p>
        </div>
      </section>

      {/* Main Content — Contact Section */}
      <div className="fade-up max-w-[1100px] mx-auto px-12 py-24 grid grid-cols-2 gap-20 items-start max-md:grid-cols-1 max-md:gap-12 max-md:px-6 max-md:py-[60px]">
        {/* LEFT: Info */}
        <div>
          <h2 className="font-heading text-[32px] font-bold text-[var(--text-dark)] mb-4">
            How can we help?
          </h2>
          <p className="text-base text-[var(--text-body)] mb-10 leading-[1.7]">
            Teaching Labs is built for educators, by someone who spent 13 years in the classroom. Reach out — we respond to every message personally.
          </p>

          {/* Info Cards */}
          <div
            className="flex gap-[18px] items-start p-6 border border-transparent rounded-[20px] mb-4 bg-white shadow-[0_2px_20px_rgba(20,33,61,0.05)] relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(20,33,61,0.1)] transition-all duration-400"
            style={{ borderLeft: '4px solid transparent', backgroundImage: 'linear-gradient(white, white), linear-gradient(180deg, #00F6ED, rgba(0,246,237,0.3))', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' }}
          >
            <div className="w-11 h-11 bg-[rgba(0,246,237,0.1)] rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
              ✉️
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-[var(--text-dark)] mb-1 tracking-[0.3px]">
                Email Us
              </h3>
              <a
                href="mailto:hello@teachinglabs.com"
                className="text-sm text-[var(--text-body)] hover:text-gold transition-colors"
              >
                hello@teachinglabs.com
              </a>
            </div>
          </div>

          <div
            className="flex gap-[18px] items-start p-6 border border-transparent rounded-[20px] mb-4 bg-white shadow-[0_2px_20px_rgba(20,33,61,0.05)] relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(20,33,61,0.1)] transition-all duration-400"
            style={{ borderLeft: '4px solid transparent', backgroundImage: 'linear-gradient(white, white), linear-gradient(180deg, #00F6ED, rgba(0,246,237,0.3))', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' }}
          >
            <div className="w-11 h-11 bg-[rgba(0,246,237,0.1)] rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
              🏫
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-[var(--text-dark)] mb-1 tracking-[0.3px]">
                District &amp; School Partnerships
              </h3>
              <p className="text-sm text-[var(--text-body)] leading-[1.5]">
                Interested in piloting Teaching Labs at your school? We&apos;re scheduling early access now.
              </p>
            </div>
          </div>

          <div
            className="flex gap-[18px] items-start p-6 border border-transparent rounded-[20px] mb-4 bg-white shadow-[0_2px_20px_rgba(20,33,61,0.05)] relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(20,33,61,0.1)] transition-all duration-400"
            style={{ borderLeft: '4px solid transparent', backgroundImage: 'linear-gradient(white, white), linear-gradient(180deg, #00F6ED, rgba(0,246,237,0.3))', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' }}
          >
            <div className="w-11 h-11 bg-[rgba(0,246,237,0.1)] rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
              🎤
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-[var(--text-dark)] mb-1 tracking-[0.3px]">
                Speaking &amp; Press
              </h3>
              <p className="text-sm text-[var(--text-body)] leading-[1.5]">
                Conference panels, podcast appearances, or media inquiries — we&apos;re happy to connect.
              </p>
            </div>
          </div>

          {/* Audience Tags */}
          <div className="mt-8">
            <h3 className="font-heading text-[11px] font-bold tracking-[2px] uppercase text-[var(--text-muted)] mb-3.5">
              I am a...
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Classroom Teacher', 'School Administrator', 'District Leader', 'EdTech Investor', 'Parent', 'Student', 'Researcher'].map(
                (tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 rounded-[20px] font-heading text-[13px] font-medium border border-[rgba(128,128,128,0.15)] text-[var(--text-body)] bg-white"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Form */}
        <ContactForm />
      </div>

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
