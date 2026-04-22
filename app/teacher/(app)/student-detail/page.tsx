'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  CaretLeft, CheckCircle, XCircle, UsersThree, Brain,
  ArrowsClockwise, ChatsCircle, Export, EnvelopeSimple,
  BookOpenText, MusicNotes, PersonArmsSpread, HandHeart,
  TreeEvergreen, Barbell, Lightbulb, Sparkle, Eye, PencilSimple, X,
} from '@phosphor-icons/react';

// ── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  id: string;
  display_name: string;
  email: string;
  role: string;
  updated_at: string;
  created_at: string;
}

interface Assessment {
  student_id: string;
  student_name: string;
  preferred_name: string;
  age: number;
  interests: string[];
  other_interests: string | null;
  theme: string;
  reading_level: string;
  math_level: string;
  language_tier: string;
  logic_reasoning_level: string;
  writing_response?: string;
  math_performance_q1?: string;
  math_performance_q2?: string;
  logic_question?: string;
  logic_answer_given?: string;
  multiple_intelligences: {
    linguistic: string;
    logical_mathematical: string;
    spatial: string;
    musical: string;
    bodily_kinesthetic: string;
    interpersonal: string;
    intrapersonal: string;
    naturalistic: string;
    musical_signals_raw?: string[];
    kinesthetic_signals_raw?: string[];
  };
  emotional_intelligence_signals?: {
    friend_response: string;
    self_response: string;
  };
  completed_at: string;
}

interface Enrollment {
  class_id: string;
  class_name: string;
  enrolled_at: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getTierLabel(tier: string): string {
  switch (tier) {
    case 'lower': return 'Building Strong Foundations';
    case 'middle': return 'Expanding Your Skills';
    case 'upper': return 'Advanced Explorer';
    default: return tier;
  }
}

function getTierColor(tier: string): string {
  switch (tier) {
    case 'lower': return '#F59E0B';
    case 'middle': return '#4FA3A5';
    case 'upper': return '#10B981';
    default: return '#94A3B8';
  }
}

function getTierPercent(tier: string): number {
  switch (tier) {
    case 'lower': return 33;
    case 'middle': return 66;
    case 'upper': return 100;
    default: return 20;
  }
}

function getSignalLabel(signal: string): string {
  switch (signal) {
    case 'strong': return 'Strong';
    case 'developing': return 'Developing';
    case 'emerging': return 'Emerging';
    default: return signal;
  }
}

function getSignalColor(signal: string): string {
  switch (signal) {
    case 'strong': return '#10B981';
    case 'developing': return '#F59E0B';
    case 'emerging': return '#94A3B8';
    default: return '#94A3B8';
  }
}

function getSignalPercent(signal: string): number {
  switch (signal) {
    case 'strong': return 100;
    case 'developing': return 60;
    case 'emerging': return 25;
    default: return 15;
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.[0] || '?').toUpperCase();
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const GARDNER_ICONS: Record<string, React.ElementType> = {
  spatial: Eye,
  musical: MusicNotes,
  bodily_kinesthetic: Barbell,
  interpersonal: PersonArmsSpread,
  intrapersonal: HandHeart,
  naturalistic: TreeEvergreen,
};

const GARDNER_LABELS: Record<string, string> = {
  spatial: 'Spatial',
  musical: 'Musical',
  bodily_kinesthetic: 'Bodily-Kinesthetic',
  interpersonal: 'Interpersonal',
  intrapersonal: 'Intrapersonal',
  naturalistic: 'Naturalistic',
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StudentDetailPage() {
  return (
    <Suspense fallback={<div className="p-6 text-text-secondary">Loading student...</div>}>
      <StudentDetailContent />
    </Suspense>
  );
}

function StudentDetailContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student');

  const [profile, setProfile] = useState<Profile | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherNotes, setTeacherNotes] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagSaving, setFlagSaving] = useState(false);
  const [flagError, setFlagError] = useState('');
  const [flagSuccess, setFlagSuccess] = useState(false);
  const [showAssessmentPanel, setShowAssessmentPanel] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!studentId) {
        setError('No student ID provided');
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { window.location.href = '/login'; return; }

        const res = await fetch(
          `/api/teacher/student-detail?studentId=${studentId}&teacherId=${user.id}`
        );

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to load student');
        }

        const data = await res.json();
        setProfile(data.profile);
        setAssessment(data.assessment || null);
        setEnrollments(data.enrollments || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load student');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [studentId]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-text-secondary text-sm">Loading student details...</div>
      </div>
    );
  }

  // Error / not found state
  if (error || !profile) {
    return (
      <div>
        <a
          href="/teacher/students"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border-[1.5px] border-border
            bg-transparent text-text-secondary text-[13px] font-medium cursor-pointer transition-all
            hover:border-navy hover:text-text-primary mb-5 no-underline"
        >
          <CaretLeft size={16} weight="fill" /> Back to Students
        </a>
        <div className="relative bg-card-bg border border-border rounded-[14px] p-8 text-center">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy to-teal" />
          <div className="text-[48px] mb-3">🔍</div>
          <h2 className="font-heading font-bold text-lg text-text-primary mb-2">Student Not Found</h2>
          <p className="text-sm text-text-secondary mb-5">
            {error || 'The student you are looking for does not exist or you do not have access to their profile.'}
          </p>
          <a
            href="/teacher/students"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-navy text-white
              font-heading font-semibold text-[13px] cursor-pointer hover:opacity-85 transition-opacity no-underline"
          >
            <CaretLeft size={14} weight="fill" /> Return to Students
          </a>
        </div>
      </div>
    );
  }

  const studentName = profile.display_name || 'Unknown Student';
  const initials = getInitials(studentName);
  const hasBaseline = !!assessment;
  const mi = assessment?.multiple_intelligences;

  return (
    <div>
      {/* Back button */}
      <a
        href="/teacher/students"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border-[1.5px] border-border
          bg-transparent text-text-secondary text-[13px] font-medium cursor-pointer transition-all
          hover:border-navy hover:text-text-primary mb-5 no-underline"
      >
        <CaretLeft size={16} weight="fill" /> Back to Students
      </a>

      {/* Student Header */}
      <div className="relative bg-card-bg border border-border rounded-[14px] p-6 mb-5 flex flex-col sm:flex-row sm:items-center gap-5 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-navy to-teal" />

        <div
          className="w-16 h-16 rounded-full bg-navy text-white flex items-center justify-center
            font-heading font-extrabold text-[22px] shrink-0"
        >
          {initials}
        </div>

        <div className="flex-1">
          <div className="font-heading text-[22px] font-bold text-text-primary">{studentName}</div>
          <div className="text-[13px] text-text-secondary mt-0.5">
            {enrollments.length > 0
              ? enrollments.map(e => e.class_name).join(' · ')
              : 'No classes enrolled'}
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {hasBaseline ? (
              <span className="inline-flex items-center gap-1 px-3 py-[3px] rounded-full text-xs font-semibold bg-success/10 text-success">
                <CheckCircle size={12} weight="fill" /> Baseline Complete
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-[3px] rounded-full text-xs font-semibold bg-warning/10 text-warning">
                <XCircle size={12} weight="fill" /> Baseline Incomplete
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-3 py-[3px] rounded-full text-xs font-semibold bg-error/10 text-error">
              <UsersThree size={12} weight="fill" /> Parent Not Connected
            </span>
          </div>
        </div>
      </div>

      {/* ── Interactive Tile Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">

        {/* Tile 1: Baseline Assessment */}
        <button
          onClick={() => hasBaseline && setShowAssessmentPanel(true)}
          disabled={!hasBaseline}
          className={`relative text-left bg-card-bg border border-border rounded-[14px] p-5 overflow-hidden transition-all ${
            hasBaseline ? 'hover:border-[#7C3AED] hover:shadow-lg cursor-pointer' : 'opacity-60 cursor-not-allowed'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#7C3AED]" />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain size={18} weight="fill" className="text-[#7C3AED]" />
              <span className="font-heading font-bold text-sm text-text-primary">Baseline Assessment</span>
            </div>
            {hasBaseline ? (
              <span className="text-[11px] font-bold text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-0.5 rounded-full">View Answers →</span>
            ) : (
              <span className="text-[11px] font-semibold text-text-muted">Not yet</span>
            )}
          </div>
          {hasBaseline && assessment && mi ? (
            <div className="space-y-2">
              <div className="text-[11px] text-text-secondary">
                {assessment.theme && <span className="capitalize">{assessment.theme} theme</span>}
                {assessment.completed_at && <span> · {formatDate(assessment.completed_at)}</span>}
              </div>
              {[
                { name: 'Reading', tier: assessment.reading_level },
                { name: 'Math', tier: assessment.math_level },
                { name: 'Logic', tier: assessment.logic_reasoning_level },
              ].map(({ name, tier }) => (
                <div key={name} className="flex items-center gap-2">
                  <span className="text-[11px] text-text-secondary w-12">{name}</span>
                  <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${getTierPercent(tier)}%`, backgroundColor: getTierColor(tier) }} />
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: getTierColor(tier) }}>{getTierLabel(tier)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-[28px] mb-1">📋</div>
              <p className="text-xs text-text-secondary">Assessment not completed yet</p>
            </div>
          )}
        </button>

        {/* Tile 2: Conversations (placeholder) */}
        <button
          disabled
          className="relative text-left bg-card-bg border border-border rounded-[14px] p-5 overflow-hidden opacity-60 cursor-not-allowed"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-navy" />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ChatsCircle size={18} weight="fill" className="text-navy" />
              <span className="font-heading font-bold text-sm text-text-primary">Conversations</span>
            </div>
            <span className="text-[11px] font-semibold text-text-muted">Coming in next update</span>
          </div>
          <p className="text-xs text-text-secondary">Recent AI tutor chats will preview here.</p>
        </button>

        {/* Tile 3: Classes (placeholder) */}
        <button
          disabled
          className="relative text-left bg-card-bg border border-border rounded-[14px] p-5 overflow-hidden opacity-60 cursor-not-allowed"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-teal" />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpenText size={18} weight="fill" className="text-teal" />
              <span className="font-heading font-bold text-sm text-text-primary">Classes</span>
            </div>
            <span className="text-[11px] font-semibold text-text-muted">Coming in next update</span>
          </div>
          <p className="text-xs text-text-secondary">
            Enrolled in {enrollments.length} {enrollments.length === 1 ? 'class' : 'classes'}
            {enrollments.length > 0 && `: ${enrollments.slice(0, 3).map(e => e.class_name).join(', ')}${enrollments.length > 3 ? '…' : ''}`}
          </p>
        </button>

        {/* Tile 4: Teacher Notes (placeholder) */}
        <button
          disabled
          className="relative text-left bg-card-bg border border-border rounded-[14px] p-5 overflow-hidden opacity-60 cursor-not-allowed"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PencilSimple size={18} weight="fill" className="text-amber-500" />
              <span className="font-heading font-bold text-sm text-text-primary">Teacher Notes</span>
            </div>
            <span className="text-[11px] font-semibold text-text-muted">Coming in next update</span>
          </div>
          <p className="text-xs text-text-secondary">Private running journal — newest first, filter by date.</p>
        </button>

        {/* Tile 5: More Insights (placeholder) */}
        <button
          disabled
          className="relative text-left bg-card-bg border border-border rounded-[14px] p-5 overflow-hidden opacity-60 cursor-not-allowed lg:col-span-2"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal to-navy" />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkle size={18} weight="fill" className="text-teal" />
              <span className="font-heading font-bold text-sm text-text-primary">More Insights</span>
            </div>
            <span className="text-[11px] font-semibold text-text-muted">Coming soon</span>
          </div>
          <p className="text-xs text-text-secondary">Activity tracking, badges, AI-generated insights, and trend analysis as students use the platform.</p>
        </button>

      </div>

      {/* Recalibrate action stays visible when baseline is complete */}
      {hasBaseline && (
        <div className="flex justify-end mb-5">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border-[1.5px] border-border bg-transparent text-text-secondary text-[13px] font-semibold font-heading cursor-pointer hover:border-navy hover:text-text-primary transition-all">
            <ArrowsClockwise size={14} weight="fill" /> Recalibrate
          </button>
        </div>
      )}


      {/* Assessment Slide-Out Panel */}
      {showAssessmentPanel && assessment && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55]"
            onClick={() => setShowAssessmentPanel(false)}
          />
          <div className="fixed top-0 right-0 h-screen w-full max-w-[560px] bg-card-bg border-l border-border z-[60] shadow-2xl flex flex-col animate-[slideInRight_0.25s_ease-out]">
            <style jsx>{`
              @keyframes slideInRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
            `}</style>

            {/* Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-gradient-to-r from-[#7C3AED]/5 to-transparent">
              <div>
                <div className="flex items-center gap-2">
                  <Brain size={20} weight="fill" className="text-[#7C3AED]" />
                  <h3 className="font-heading font-bold text-base text-text-primary">Baseline Assessment Answers</h3>
                </div>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  {profile?.display_name} · Completed {assessment.completed_at && formatDate(assessment.completed_at)}
                </p>
              </div>
              <button onClick={() => setShowAssessmentPanel(false)} className="w-8 h-8 rounded-lg hover:bg-border/30 flex items-center justify-center cursor-pointer text-text-secondary">
                <X size={18} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* About section */}
              <section>
                <h4 className="text-[11px] font-bold uppercase tracking-[0.5px] text-text-secondary mb-2">About</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-text-secondary">Preferred name:</span> <span className="text-text-primary font-semibold">{assessment.preferred_name}</span></div>
                  <div><span className="text-text-secondary">Age:</span> <span className="text-text-primary font-semibold">{assessment.age}</span></div>
                  <div><span className="text-text-secondary">Theme chosen:</span> <span className="text-text-primary font-semibold capitalize">{assessment.theme}</span></div>
                </div>
              </section>

              {/* Interests */}
              {assessment.interests && assessment.interests.length > 0 && (
                <section>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.5px] text-text-secondary mb-2">Interests Picked</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {assessment.interests.map(i => (
                      <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#7C3AED]/10 text-[#7C3AED] capitalize">{i.replace(/_/g, ' ')}</span>
                    ))}
                    {assessment.other_interests && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#7C3AED]/10 text-[#7C3AED]">{assessment.other_interests}</span>
                    )}
                  </div>
                </section>
              )}

              {/* Reading */}
              <section className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5"><BookOpenText size={14} weight="fill" /> Reading Level</h4>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: getTierColor(assessment.reading_level), backgroundColor: getTierColor(assessment.reading_level) + '20' }}>{getTierLabel(assessment.reading_level)}</span>
                </div>
                <p className="text-[12px] text-text-secondary">Assessed from reading passage comprehension + language tier ({assessment.language_tier}).</p>
              </section>

              {/* Math */}
              <section className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5"><Brain size={14} weight="fill" /> Math Level</h4>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: getTierColor(assessment.math_level), backgroundColor: getTierColor(assessment.math_level) + '20' }}>{getTierLabel(assessment.math_level)}</span>
                </div>
                <div className="space-y-1.5 text-[12px]">
                  {assessment.math_performance_q1 && (
                    <div><span className="text-text-secondary">Math Q1 performance:</span> <span className="text-text-primary font-semibold capitalize">{assessment.math_performance_q1.replace(/-/g, ' ')}</span></div>
                  )}
                  {assessment.math_performance_q2 && (
                    <div><span className="text-text-secondary">Math Q2 performance:</span> <span className="text-text-primary font-semibold capitalize">{assessment.math_performance_q2.replace(/-/g, ' ')}</span></div>
                  )}
                </div>
              </section>

              {/* Logic */}
              {(assessment.logic_question || assessment.logic_answer_given || assessment.logic_reasoning_level) && (
                <section className="rounded-lg border border-border bg-surface p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5"><Lightbulb size={14} weight="fill" /> Logic & Reasoning</h4>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: getTierColor(assessment.logic_reasoning_level), backgroundColor: getTierColor(assessment.logic_reasoning_level) + '20' }}>{getTierLabel(assessment.logic_reasoning_level)}</span>
                  </div>
                  {assessment.logic_question && (
                    <div className="mb-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-text-secondary mb-1">Question</p>
                      <p className="text-[13px] text-text-primary italic">“{assessment.logic_question}”</p>
                    </div>
                  )}
                  {assessment.logic_answer_given && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-text-secondary mb-1">Student&apos;s Answer</p>
                      <p className="text-[13px] text-text-primary bg-card-bg rounded-md border border-border px-3 py-2">{assessment.logic_answer_given}</p>
                    </div>
                  )}
                </section>
              )}

              {/* Writing Response */}
              {assessment.writing_response && (
                <section className="rounded-lg border border-border bg-surface p-4">
                  <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5 mb-2"><PencilSimple size={14} weight="fill" /> Writing Sample</h4>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-text-secondary mb-1">What the student wrote</p>
                  <p className="text-[13px] text-text-primary bg-card-bg rounded-md border border-border px-3 py-2 whitespace-pre-wrap leading-[1.55]">{assessment.writing_response}</p>
                </section>
              )}

              {/* Multiple Intelligences (full breakdown) */}
              {mi && (
                <section>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.5px] text-text-secondary mb-2">Multiple Intelligences — All 8</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {([
                      ['linguistic', 'Linguistic'],
                      ['logical_mathematical', 'Logical-Mathematical'],
                      ['spatial', 'Visual-Spatial'],
                      ['musical', 'Musical'],
                      ['bodily_kinesthetic', 'Bodily-Kinesthetic'],
                      ['interpersonal', 'Interpersonal'],
                      ['intrapersonal', 'Intrapersonal'],
                      ['naturalistic', 'Naturalistic'],
                    ] as const).map(([key, label]) => {
                      const signal = (mi as any)[key] || 'emerging';
                      return (
                        <div key={key} className="flex items-center justify-between px-3 py-2 rounded-md bg-surface border border-border">
                          <span className="text-[12px] text-text-primary">{label}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: getSignalColor(signal), backgroundColor: getSignalColor(signal) + '20' }}>{getSignalLabel(signal)}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Emotional Intelligence Signals */}
              {assessment.emotional_intelligence_signals && Object.keys(assessment.emotional_intelligence_signals).length > 0 && (
                <section>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.5px] text-text-secondary mb-2">Emotional Intelligence Signals</h4>
                  <div className="space-y-1.5 text-[12px]">
                    {Object.entries(assessment.emotional_intelligence_signals).map(([k, v]) => (
                      <div key={k} className="flex justify-between px-3 py-2 rounded-md bg-surface border border-border">
                        <span className="text-text-primary capitalize">{k.replace(/_/g, ' ')}</span>
                        <span className="font-semibold text-text-secondary">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-border bg-surface flex justify-between items-center">
              <p className="text-[11px] text-text-secondary">Assessment answers are private to this teacher.</p>
              <button onClick={() => setShowAssessmentPanel(false)} className="px-3 py-1.5 rounded-lg border border-border text-xs text-text-secondary hover:bg-border/20 cursor-pointer">Close</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
