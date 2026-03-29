'use client';

import { useState, useEffect, useRef } from 'react';
import {
  GraduationCap, Key, BookOpenText, MapPin, UsersThree,
  CheckCircle, CaretLeft, ArrowRight, CircleNotch, EnvelopeSimple,
} from '@phosphor-icons/react';
import Link from 'next/link';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { createClient } from '@/lib/supabase/client';

type Screen = 1 | 2 | 3;

interface ClassInfo {
  id: string;
  name: string;
  subject: string | null;
  teacher_name: string | null;
  school_name: string | null;
}

export default function StudentSignupPage() {
  const supabase = createClient();
  const [screen, setScreen] = useState<Screen>(1);

  // Screen 1: Join class
  const [classCode, setClassCode] = useState('');
  const [codeStatus, setCodeStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const codeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Screen 2: Email
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Validate class code against Supabase
  useEffect(() => {
    if (codeTimerRef.current) clearTimeout(codeTimerRef.current);
    if (!classCode) { setCodeStatus('idle'); setClassInfo(null); return; }
    if (classCode.length < 4) { setCodeStatus('idle'); return; }

    setCodeStatus('checking');
    codeTimerRef.current = setTimeout(async () => {
      try {
        const resp = await fetch(`/api/classes/lookup?code=${encodeURIComponent(classCode.trim())}`);
        const result = await resp.json();

        if (!result.found) {
          setCodeStatus('invalid');
          setClassInfo(null);
        } else {
          setCodeStatus('valid');
          setClassInfo({
            id: result.classInfo.id,
            name: result.classInfo.name,
            subject: result.classInfo.subject ?? null,
            teacher_name: result.classInfo.teacherName ?? null,
            school_name: result.classInfo.schoolName ?? null,
          });
        }
      } catch {
        setCodeStatus('invalid');
        setClassInfo(null);
      }
    }, 600);

    return () => { if (codeTimerRef.current) clearTimeout(codeTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classCode]);

  const formatName = (val: string) => {
    if (!val) return val;
    return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
  };

  const canProceed = classInfo !== null && firstName.trim() && lastName.trim();

  function goToScreen2() {
    if (!canProceed) return;
    setScreen(2);
    window.scrollTo(0, 0);
  }

  async function handleSignup() {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Send magic link with student metadata
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            display_name: `${firstName.trim()} ${lastName.trim()}`,
            role: 'student',
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setSubmitting(false);
        return;
      }

      // Store class info for post-auth enrollment
      if (classInfo) {
        localStorage.setItem('pending_class_id', classInfo.id);
      }
      localStorage.setItem('pending_role', 'student');

      setScreen(3);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const stepDots = [1, 2, 3] as const;

  return (
    <div className="min-h-screen bg-warm-white dark:bg-[#0B1426] flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Back link */}
      <div className="w-full max-w-[460px] mb-4">
        {screen === 1 ? (
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-teal transition-colors"
          >
            <CaretLeft size={14} weight="fill" />
            Choose a different role
          </Link>
        ) : screen === 2 ? (
          <button
            onClick={() => setScreen(1)}
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-teal transition-colors"
          >
            <CaretLeft size={14} weight="fill" />
            Back
          </button>
        ) : null}
      </div>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-navy rounded-lg flex items-center justify-center">
          <svg viewBox="0 0 512 512" fill="none" className="w-5 h-5">
            <g transform="translate(156,106)">
              <rect x="60" y="0" width="80" height="300" fill="#FFF" />
              <rect x="40" y="0" width="160" height="80" fill="#FFF" />
              <circle cx="160" cy="200" r="40" fill="#4FA3A5" />
            </g>
          </svg>
        </div>
        <span className="font-heading font-bold text-navy dark:text-text-primary text-lg">TeachingLabs</span>
      </div>

      {/* Stepper */}
      <div className="flex gap-2 mb-6">
        {stepDots.map(dot => (
          <div
            key={dot}
            className={`h-2 rounded-full transition-all ${dot === screen ? 'bg-teal w-5' : 'bg-border w-2'}`}
          />
        ))}
      </div>

      <div className="w-full max-w-[460px]">
        {/* Role badge */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-teal/10 text-teal rounded-full font-heading text-xs font-semibold">
            <GraduationCap size={14} weight="fill" />
            Student Account
          </span>
        </div>

        {/* ===== SCREEN 1: Join class + name ===== */}
        {screen === 1 && (
          <div className="animate-[fadeUp_0.3s_ease-out]">
            <h1 className="font-heading font-bold text-2xl text-text-primary text-center mb-2">Join your class</h1>
            <p className="text-text-secondary text-sm text-center mb-6">Enter the code your teacher gave you</p>

            {/* Class code input */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Key size={16} weight="fill" className="text-teal" />
                <label className="text-xs font-semibold text-text-primary">Class code</label>
              </div>
              <input
                type="text"
                value={classCode}
                onChange={e => setClassCode(e.target.value.toUpperCase().slice(0, 14))}
                placeholder="TL-XXXX-XXXX"
                maxLength={14}
                autoComplete="off"
                spellCheck={false}
                className={`w-full font-heading font-bold text-2xl tracking-[4px] text-center uppercase py-5 px-4
                  border-2 rounded-[14px] bg-card-bg dark:bg-[#1A2332] text-text-primary outline-none transition-all
                  placeholder:text-sm placeholder:tracking-[3px] placeholder:font-normal placeholder:text-text-muted placeholder:opacity-50
                  focus:border-teal focus:shadow-[0_0_0_3px_rgba(79,163,165,0.15)]
                  ${codeStatus === 'valid' ? 'border-success bg-success/[0.04]' : 'border-border'}`}
              />
              <div className="flex items-center justify-center gap-1.5 text-sm font-medium min-h-6 mt-2">
                {codeStatus === 'checking' && (
                  <span className="text-text-secondary flex items-center gap-1.5">
                    <CircleNotch size={14} className="animate-spin" />
                    Checking code...
                  </span>
                )}
                {codeStatus === 'valid' && (
                  <>
                    <CheckCircle size={16} weight="fill" className="text-success" />
                    <span className="text-success">Class found!</span>
                  </>
                )}
                {codeStatus === 'invalid' && (
                  <span className="text-danger text-sm">Code not found. Check with your teacher.</span>
                )}
              </div>
            </div>

            {/* Class info card */}
            {classInfo && (
              <div className="bg-teal/[0.06] border border-teal/20 rounded-[14px] p-5 mb-5 animate-[fadeUp_0.3s_ease-out]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-[10px] bg-teal text-white flex items-center justify-center flex-shrink-0">
                    <BookOpenText size={20} weight="fill" />
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-base text-text-primary">{classInfo.name}</div>
                    {classInfo.teacher_name && (
                      <div className="text-xs text-text-secondary">with {classInfo.teacher_name}</div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
                  {classInfo.school_name && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} weight="fill" className="text-teal flex-shrink-0" />
                      <span>{classInfo.school_name}</span>
                    </div>
                  )}
                  {classInfo.subject && (
                    <div className="flex items-center gap-1.5">
                      <UsersThree size={14} weight="fill" className="text-teal flex-shrink-0" />
                      <span>{classInfo.subject}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Name entry */}
            {classInfo && (
              <div className="animate-[fadeUp_0.3s_ease-out]">
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-text-muted font-medium">Your name</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1.5">
                      First name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      onBlur={e => setFirstName(formatName(e.target.value))}
                      placeholder="Alex"
                      className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm bg-card-bg dark:bg-[#1A2332] text-text-primary outline-none focus:border-teal transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1.5">
                      Last name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      onBlur={e => setLastName(formatName(e.target.value))}
                      placeholder="Rivera"
                      className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm bg-card-bg dark:bg-[#1A2332] text-text-primary outline-none focus:border-teal transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={goToScreen2}
              disabled={!canProceed}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-teal text-white font-heading font-semibold rounded-xl text-base hover:bg-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight size={18} weight="fill" />
            </button>

            <p className="text-center text-sm text-text-muted mt-5">
              Already have an account?{' '}
              <Link href="/login" className="text-teal font-medium hover:underline">Log in</Link>
            </p>
          </div>
        )}

        {/* ===== SCREEN 2: Email ===== */}
        {screen === 2 && (
          <div className="animate-[fadeUp_0.3s_ease-out]">
            <h1 className="font-heading font-bold text-2xl text-text-primary text-center mb-2">
              Almost there!
            </h1>
            <p className="text-text-secondary text-sm text-center mb-6">
              Enter your email to create your account
            </p>

            {/* SSO buttons — Coming Soon */}
            <div className="flex flex-col gap-2.5 mb-5">
              {['Google', 'Microsoft', 'ClassLink'].map((provider) => (
                <button
                  key={provider}
                  disabled
                  className="relative flex items-center justify-center gap-3 w-full px-4 py-2.5 rounded-xl border border-border bg-surface dark:bg-card-bg font-heading text-sm font-medium text-text-primary opacity-60 cursor-not-allowed"
                >
                  Continue with {provider}
                  <span className="absolute right-3 text-[10px] font-semibold uppercase tracking-wider text-teal bg-teal/10 px-2 py-0.5 rounded-full">Coming Soon</span>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-secondary font-medium">or continue with email</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-text-primary mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="you@email.com"
                className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm bg-card-bg dark:bg-[#1A2332] text-text-primary outline-none focus:border-teal transition-colors"
              />
              <p className="text-xs text-text-muted mt-1.5">
                We&apos;ll send you a magic link. No password needed.
              </p>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSignup}
              disabled={submitting}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-teal text-white font-heading font-semibold rounded-xl text-base hover:bg-teal/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <CircleNotch size={18} className="animate-spin" />
                  Sending magic link...
                </>
              ) : (
                <>
                  Send magic link
                  <ArrowRight size={18} weight="fill" />
                </>
              )}
            </button>

            <p className="text-center text-sm text-text-muted mt-5">
              Already have an account?{' '}
              <Link href="/login" className="text-teal font-medium hover:underline">Log in</Link>
            </p>
          </div>
        )}

        {/* ===== SCREEN 3: Check email ===== */}
        {screen === 3 && (
          <div className="animate-[fadeUp_0.3s_ease-out] text-center">
            <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-6">
              <EnvelopeSimple size={32} weight="duotone" className="text-teal" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-text-primary mb-2">
              Check your email
            </h1>
            <p className="text-text-secondary text-[15px] mb-6">
              We sent a magic link to <strong className="text-text-primary">{email}</strong>.
              Click the link to sign in and join your class.
            </p>
            <div className="flex items-start gap-3 bg-card-bg dark:bg-[#1A2332] rounded-xl p-4 text-left mb-6">
              <CheckCircle size={20} weight="fill" className="text-teal flex-shrink-0 mt-0.5" />
              <div className="text-sm text-text-secondary">
                <p className="mb-1">Don&apos;t see it? Check your spam folder.</p>
                <p>The link expires in 24 hours.</p>
              </div>
            </div>
            <button
              onClick={() => { setScreen(2); setError(''); }}
              className="text-teal font-medium text-sm hover:underline"
            >
              Use a different email
            </button>
          </div>
        )}
      </div>

      <p className="mt-10 text-xs text-text-muted text-center max-w-sm">
        By creating an account, you agree to our{' '}
        <a href="#" className="text-teal hover:underline">Terms of Service</a> and{' '}
        <a href="#" className="text-teal hover:underline">Privacy Policy</a>.
      </p>

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
