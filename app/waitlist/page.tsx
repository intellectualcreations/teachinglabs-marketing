'use client';

import { useState, useEffect, useRef } from 'react';
import MarketingNav from '@/components/shared/MarketingNav';
import MarketingFooter from '@/components/shared/MarketingFooter';
import ScrollReveal from '@/components/shared/ScrollReveal';

const ROTATING_WORDS = [
  'Personalized to every student',
  'Adaptive to every level',
  'Safe for every classroom',
  'Built by a teacher, for teachers',
];

const CONFETTI_COLORS = ['#00F6ED', '#4056F4', '#561F37', '#0a1128'];

function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number; y: number; w: number; h: number;
      color: string; rotation: number; rotSpeed: number;
      vx: number; vy: number; gravity: number; opacity: number;
    }[] = [];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * -1,
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3 + 2,
        gravity: 0.05,
        opacity: 1,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        if (p.y > canvas.height) p.opacity -= 0.02;
        if (p.opacity <= 0) continue;
        alive = true;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive) animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
      aria-hidden="true"
    />
  );
}

export default function WaitlistPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [currentWord, setCurrentWord] = useState(0);
  const mountTimeRef = useRef<number>(0);

  useEffect(() => { mountTimeRef.current = Date.now(); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    if (Date.now() - mountTimeRef.current < 2000) return;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, role, email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setEmailError(data.error || 'Something went wrong. Please try again.');
        return;
      }
    } catch {
      setEmailError('Network error. Please try again.');
      return;
    }
    setSubmitted(true);
  };

  const handleShare = () => {
    const shareText = 'I just joined the Teaching Labs waitlist! AI teaching assistants that adapt to every student. Check it out:';
    const shareUrl = 'https://teachinglabs.com/waitlist';
    if (navigator.share) {
      navigator.share({ title: 'Teaching Labs', text: shareText, url: shareUrl });
    } else {
      window.open(
        `mailto:?subject=${encodeURIComponent('Check out Teaching Labs')}&body=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
        '_blank'
      );
    }
  };

  return (
    <>
      <MarketingNav />
      <ScrollReveal />

      <main className="min-h-screen bg-white dark:bg-transparent overflow-x-hidden">
        {/* ── HERO ── */}
        <section className="section-blend relative overflow-hidden">
          {/* Background blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div className="absolute w-[600px] h-[600px] rounded-full top-[5%] left-[10%] max-md:w-[300px] max-md:h-[300px] opacity-[0.10] dark:opacity-[0.08]"
              style={{ background: '#00F6ED', filter: 'blur(80px)' }} />
            <div className="absolute w-[500px] h-[500px] rounded-full top-[20%] right-[5%] max-md:w-[280px] max-md:h-[280px] opacity-[0.10] dark:opacity-[0.08]"
              style={{ background: '#4056F4', filter: 'blur(80px)' }} />
            <div className="absolute w-[400px] h-[400px] rounded-full bottom-[10%] left-[30%] opacity-[0.05] dark:opacity-[0.06] max-md:hidden"
              style={{ background: '#561F37', filter: 'blur(80px)' }} />
          </div>

          <div className="relative z-10 max-w-[1200px] mx-auto px-12 max-md:px-6 py-32 max-md:py-20 text-center">
            <div className="fade-up">
              <h1 className="font-heading font-extrabold tracking-[-2px] leading-[1.15] text-text-primary mb-6"
                style={{ fontSize: 'clamp(48px, 7vw, 80px)' }}>
                Your Teaching.{' '}
                <br className="max-md:hidden" />
                Your{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #00F6ED, #4056F4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>Voice.</span>
                <br />
                Your AI<span className="text-underline">.</span>
              </h1>
            </div>

            <div className="fade-up">
              <p className="font-body text-xl leading-[1.7] text-text-secondary mb-6 max-w-[620px] mx-auto max-md:text-lg">
                AI teaching assistants that sound like you, teach like you,
                <br className="max-md:hidden" />
                and adapt to every student where they are.
              </p>
            </div>

            {/* Rotating words */}
            <div className="flex items-center justify-center gap-3 mb-12 h-8 fade-up">
              <span className="text-text-muted">—</span>
              <span className="font-heading text-sm font-medium text-eyebrow transition-opacity duration-500">
                {ROTATING_WORDS[currentWord]}
              </span>
            </div>

            {/* ── SIMPLE FORM ── */}
            {!submitted ? (
              <div className="max-w-[480px] mx-auto fade-up">
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  {/* Honeypot */}
                  <div className="absolute" style={{ left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
                    <input type="text" name="website" tabIndex={-1} autoComplete="off"
                      value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                  </div>

                  {/* Name row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-heading text-sm font-semibold text-text-primary mb-1.5">First Name</label>
                      <input type="text" required value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="w-full px-4 py-3 rounded-lg border border-[rgba(128,128,128,0.25)] dark:border-white/15 bg-white dark:bg-white/[0.06] text-text-primary placeholder:text-text-muted text-[15px] font-body focus:outline-none focus:ring-2 focus:ring-gold/40 dark:focus:ring-teal/40 transition-shadow" />
                    </div>
                    <div>
                      <label className="block font-heading text-sm font-semibold text-text-primary mb-1.5">Last Name</label>
                      <input type="text" required value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        className="w-full px-4 py-3 rounded-lg border border-[rgba(128,128,128,0.25)] dark:border-white/15 bg-white dark:bg-white/[0.06] text-text-primary placeholder:text-text-muted text-[15px] font-body focus:outline-none focus:ring-2 focus:ring-gold/40 dark:focus:ring-teal/40 transition-shadow" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-heading text-sm font-semibold text-text-primary mb-1.5">Email</label>
                    <input type="email" required value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                      placeholder="you@school.edu"
                      className={`w-full px-4 py-3 rounded-lg border ${emailError ? 'border-red-500' : 'border-[rgba(128,128,128,0.25)] dark:border-white/15'} bg-white dark:bg-white/[0.06] text-text-primary placeholder:text-text-muted text-[15px] font-body focus:outline-none focus:ring-2 focus:ring-gold/40 dark:focus:ring-teal/40 transition-shadow`} />
                    {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block font-heading text-sm font-semibold text-text-primary mb-1.5">I am a...</label>
                    <select required value={role} onChange={(e) => setRole(e.target.value)}
                      style={{ colorScheme: 'dark light' }}
                      className="w-full px-4 py-3 rounded-lg border border-[rgba(128,128,128,0.25)] dark:border-white/15 bg-white dark:bg-[#0e1a35] text-[#0a1128] dark:text-white text-[15px] font-body focus:outline-none focus:ring-2 focus:ring-gold/40 dark:focus:ring-teal/40 transition-shadow">
                      <option value="" disabled className="bg-white dark:bg-[#0e1a35] text-[#0a1128] dark:text-white">Select your role...</option>
                      <option value="teacher" className="bg-white dark:bg-[#0e1a35] text-[#0a1128] dark:text-white">Teacher</option>
                      <option value="admin" className="bg-white dark:bg-[#0e1a35] text-[#0a1128] dark:text-white">School Administrator</option>
                      <option value="district" className="bg-white dark:bg-[#0e1a35] text-[#0a1128] dark:text-white">District Leader</option>
                      <option value="parent" className="bg-white dark:bg-[#0e1a35] text-[#0a1128] dark:text-white">Parent</option>
                      <option value="other" className="bg-white dark:bg-[#0e1a35] text-[#0a1128] dark:text-white">Other</option>
                    </select>
                  </div>

                  {/* Submit */}
                  <button type="submit"
                    className="w-full font-heading text-[15px] font-bold text-white px-6 py-3.5 rounded-lg bg-gold hover:brightness-110 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer mt-2">
                    Join the Waitlist →
                  </button>
                </form>

                <p className="font-heading text-[13px] text-text-muted mt-4 text-center">
                  Free early access · No credit card required · Join 4,000+ teachers
                </p>
              </div>
            ) : (
              <>
                <ConfettiCanvas />
                <div className="relative z-10 flex flex-col items-center justify-center py-10">
                  <svg width="100" height="100" viewBox="0 0 100 100" className="mb-8">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#00F6ED" strokeWidth="4" className="success-circle" />
                    <path d="M30 52 L44 66 L70 38" fill="none" stroke="#00F6ED" strokeWidth="4"
                      strokeLinecap="round" strokeLinejoin="round" className="success-check" />
                  </svg>
                  <h2 className="font-heading font-extrabold text-text-primary mb-4 success-fade-up"
                    style={{ fontSize: 'clamp(36px, 5vw, 56px)', animationDelay: '0.8s' }}>
                    You&apos;re on the list!
                  </h2>
                  <p className="font-body text-xl text-text-secondary mb-2 success-fade-up" style={{ animationDelay: '1.1s' }}>
                    Welcome to the future of learning.
                  </p>
                  <p className="font-body text-lg text-text-muted mb-8 success-fade-up" style={{ animationDelay: '1.4s' }}>
                    We&apos;ll reach out as soon as your spot opens.
                  </p>
                  <button onClick={handleShare}
                    className="font-heading text-[15px] font-bold text-white px-8 py-3 rounded-lg bg-gold hover:brightness-110 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer success-fade-up"
                    style={{ animationDelay: '1.7s' }}>
                    Tell a colleague →
                  </button>
                </div>
              </>
            )}

            {/* Stats strip */}
            <div className="flex flex-wrap justify-center gap-4 mt-16 fade-up">
              {[
                { icon: '🏫', label: 'K–12 Ready' },
                { icon: '🔒', label: 'FERPA & COPPA Compliant' },
                { icon: '🎙️', label: 'Voice-Cloned AI Agents' },
                { icon: '⚡', label: 'Adapts in Real Time' },
              ].map(({ icon, label }) => (
                <div key={label} className="inline-flex items-center gap-2 font-heading text-xs font-semibold text-text-secondary bg-card-bg dark:bg-white/[0.06] px-4 py-2 rounded-full border border-[rgba(128,128,128,0.15)] dark:border-white/10">
                  <span>{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </>
  );
}
