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

      {/* Baseline Assessment */}
      {hasBaseline && assessment && mi ? (
        <div className="relative bg-card-bg border border-border rounded-[14px] p-6 mb-5 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#7C3AED]" />

          <div className="flex items-start justify-between mb-1">
            <div className="font-heading font-bold text-[15px] text-text-primary flex items-center gap-2">
              <Brain size={20} weight="fill" className="text-[#7C3AED]" />
              Baseline Assessment
            </div>
            <div className="flex gap-2">
              <button className="text-[12px] font-semibold text-[#7C3AED] hover:underline cursor-pointer bg-transparent border-0">
                View Rubric &amp; Scoring Guide
              </button>
            </div>
          </div>
          <div className="text-xs text-text-secondary mb-[18px]">
            {assessment.theme && (
              <span className="capitalize">{assessment.theme} theme</span>
            )}
            {assessment.age && (
              <span> · Age {assessment.age}</span>
            )}
            {assessment.completed_at && (
              <span> · Completed {formatDate(assessment.completed_at)}</span>
            )}
            {profile.updated_at && (
              <span> · Last updated {formatDate(profile.updated_at)}</span>
            )}
          </div>

          {/* Interests */}
          {assessment.interests && assessment.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-[18px]">
              {assessment.interests.map((interest) => (
                <span key={interest} className="px-3 py-1 rounded-full text-xs font-semibold bg-[#7C3AED]/8 text-[#7C3AED] capitalize">
                  <Sparkle size={10} weight="fill" className="inline mr-1" />
                  {interest}
                </span>
              ))}
              {assessment.other_interests && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#7C3AED]/8 text-[#7C3AED]">
                  <Sparkle size={10} weight="fill" className="inline mr-1" />
                  {assessment.other_interests}
                </span>
              )}
            </div>
          )}

          {/* Academic Tiers */}
          <div className="mb-[18px]">
            <div className="text-xs font-bold uppercase tracking-[0.5px] text-text-secondary mb-3 flex items-center gap-1.5">
              <BookOpenText size={14} weight="fill" /> Academic Levels
            </div>
            <div className="flex flex-col gap-[14px]">
              {[
                { name: 'Reading Level', tier: assessment.reading_level },
                { name: 'Math Level', tier: assessment.math_level },
                { name: 'Logic & Reasoning', tier: assessment.logic_reasoning_level },
              ].map(({ name, tier }) => (
                <div key={name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[13px] font-semibold text-text-primary">{name}</span>
                    <span className="text-xs font-semibold" style={{ color: getTierColor(tier) }}>
                      {getTierLabel(tier)}
                    </span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${getTierPercent(tier)}%`, backgroundColor: getTierColor(tier) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gardner Intelligence Signals */}
          <div className="mb-[18px]">
            <div className="text-xs font-bold uppercase tracking-[0.5px] text-text-secondary mb-3 flex items-center gap-1.5">
              <Lightbulb size={14} weight="fill" /> Gardner Intelligence Signals
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['spatial', 'musical', 'bodily_kinesthetic', 'interpersonal', 'intrapersonal', 'naturalistic'] as const).map((key) => {
                const signal = mi[key] || 'emerging';
                const Icon = GARDNER_ICONS[key] || Brain;
                return (
                  <div key={key} className="flex items-center gap-3 bg-surface border border-border rounded-[10px] px-4 py-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${getSignalColor(signal)}15` }}
                    >
                      <Icon size={16} weight="fill" style={{ color: getSignalColor(signal) }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[12px] font-semibold text-text-primary">{GARDNER_LABELS[key]}</span>
                        <span className="text-[11px] font-semibold" style={{ color: getSignalColor(signal) }}>
                          {getSignalLabel(signal)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${getSignalPercent(signal)}%`, backgroundColor: getSignalColor(signal) }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end mt-3 gap-2">
            <button
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border-[1.5px] border-border
                bg-transparent text-text-secondary text-[13px] font-semibold font-heading cursor-pointer
                hover:border-navy hover:text-text-primary transition-all"
            >
              <ArrowsClockwise size={14} weight="fill" /> Recalibrate
            </button>
          </div>
        </div>
      ) : (
        <div className="relative bg-card-bg border border-border rounded-[14px] p-6 mb-5 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#7C3AED]" />
          <div className="font-heading font-bold text-[15px] text-text-primary flex items-center gap-2 mb-3">
            <Brain size={20} weight="fill" className="text-[#7C3AED]" />
            Baseline Assessment
          </div>
          <div className="text-center py-8">
            <div className="text-[36px] mb-2">📋</div>
            <p className="text-sm text-text-secondary mb-1">No baseline assessment yet</p>
            <p className="text-xs text-text-secondary">
              This student hasn&apos;t completed their onboarding assessment. The assessment generates automatically when students first log in.
            </p>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <a
          href="/teacher/conversation-detail"
          className="inline-flex items-center gap-1.5 px-[18px] py-2 rounded-lg bg-navy text-white
            font-heading font-semibold text-[13px] cursor-pointer hover:opacity-85 transition-opacity no-underline"
        >
          <ChatsCircle size={14} weight="fill" /> View Conversations
        </a>
        <button className="inline-flex items-center gap-1.5 px-[18px] py-2 rounded-lg bg-teal text-navy
          font-heading font-semibold text-[13px] cursor-pointer hover:opacity-85 transition-opacity border-0">
          <Export size={14} weight="fill" /> Export Report
        </button>
        <button className="inline-flex items-center gap-1.5 px-[18px] py-2 rounded-lg border-[1.5px] border-border
          bg-transparent text-text-secondary font-heading font-semibold text-[13px] cursor-pointer
          hover:border-navy hover:text-text-primary transition-all">
          <EnvelopeSimple size={14} weight="fill" /> Send to Parents
        </button>
        <button
          onClick={() => { setShowFlagModal(true); setFlagError(''); setFlagSuccess(false); }}
          className="inline-flex items-center gap-1.5 px-[18px] py-2 rounded-lg border-[1.5px] border-orange-400/50
            bg-transparent text-orange-400 font-heading font-semibold text-[13px] cursor-pointer
            hover:border-orange-400 hover:text-orange-300 transition-all"
        >
          <PencilSimple size={14} weight="fill" /> Flag Name
        </button>
      </div>

      {/* Flag Name Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowFlagModal(false)}>
          <div className="bg-white dark:bg-[#0f1a2e] border border-border rounded-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-base text-text-primary">Flag Nickname as Inappropriate</h3>
              <button onClick={() => setShowFlagModal(false)} className="text-text-secondary hover:text-text-primary transition-colors bg-transparent border-0 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-text-secondary mb-3">This will reset the student&apos;s nickname back to their first name. Next time they log in, they&apos;ll see a message asking them to choose a new, appropriate nickname.</p>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-amber-400 mb-1">The student will see:</p>
              <p className="text-xs text-text-secondary italic">&quot;Your nickname was flagged by your teacher. Please choose a new one that follows the guidelines in Settings.&quot;</p>
            </div>
            {flagError && <p className="text-sm text-red-500 mb-3">{flagError}</p>}
            {flagSuccess && <p className="text-sm text-green-500 mb-3">Nickname flagged and reset!</p>}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowFlagModal(false)}
                className="px-4 py-2 rounded-lg border border-border text-text-secondary text-sm font-medium hover:text-text-primary transition-colors bg-transparent cursor-pointer"
              >Cancel</button>
              <button
                onClick={async () => {
                  if (!studentId) return;
                  setFlagSaving(true);
                  setFlagError('');
                  try {
                    const supabase = createClient();
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;
                    // Get student's first name from profile
                    const firstName = profile?.display_name?.split(' ')[0] || 'Student';
                    const res = await fetch('/api/teacher/student-detail', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ studentId, teacherId: user.id, preferred_name: firstName, flagged: true }),
                    });
                    if (res.ok) {
                      setFlagSuccess(true);
                      if (assessment) assessment.preferred_name = firstName;
                      setTimeout(() => { setShowFlagModal(false); setFlagSuccess(false); }, 1500);
                    } else {
                      const data = await res.json();
                      setFlagError(data.error || 'Failed to flag name');
                    }
                  } catch { setFlagError('Failed to flag name'); }
                  setFlagSaving(false);
                }}
                disabled={flagSaving}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors border-0 cursor-pointer disabled:opacity-50"
              >{flagSaving ? 'Flagging...' : 'Flag & Reset Name'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon Section */}
      <div className="relative bg-card-bg border border-border rounded-[14px] p-8 mb-5 text-center overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal to-navy" />
        <div className="text-[40px] mb-3">🚀</div>
        <h3 className="font-heading font-bold text-base text-text-primary mb-2">More Insights Coming Soon</h3>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          Activity tracking, badges, and AI insights will appear here as students use the platform.
        </p>
      </div>

      {/* Teacher Notes */}
      <div className="bg-card-bg rounded-[20px] border border-border p-6">
        <h2 className="font-heading font-bold text-sm text-text-primary mb-4">Teacher Notes</h2>
        <textarea
          value={teacherNotes}
          onChange={(e) => setTeacherNotes(e.target.value)}
          placeholder="Add private notes about this student..."
          className="w-full min-h-[120px] p-3 rounded-lg border border-border bg-surface text-[13px]
            text-text-primary placeholder:text-text-secondary resize-y outline-none focus:border-navy"
        />
      </div>
    </div>
  );
}
