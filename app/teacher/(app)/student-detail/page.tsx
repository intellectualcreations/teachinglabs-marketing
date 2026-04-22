'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  reading_passage?: string;
  reading_question?: string;
  reading_student_answer?: string;
  math_q1_question?: string;
  math_q1_student_answer?: string;
  math_q1_correct_answer?: string;
  math_q2_question?: string;
  math_q2_student_answer?: string;
  math_q2_correct_answer?: string;
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
  ai_overview?: string;
  ai_overview_generated_at?: string;
}

interface Enrollment {
  class_id: string;
  class_name: string;
  enrolled_at: string;
}

interface AssessmentResponse {
  id: string;
  category: string;
  question_key: string;
  question_order: number | null;
  question_text: string | null;
  question_type: string | null;
  options_shown: any;
  student_answer: string | null;
  correct_answer: string | null;
  signal_result: string | null;
  scoring_metadata: any;
  created_at: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

// Unified 5-level proficiency scale: Emerging → Developing → Proficient → Advanced → Exemplary
// Maps every legacy signal value (tier keys like 'lower/middle/upper', gardner 'strong/developing/emerging',
// math 'struggling/on-track/above', and the new capitalized forms) onto a single vocabulary.
const LEVEL_COLORS: Record<string, string> = {
  Emerging:   '#94A3B8', // grey
  Developing: '#F59E0B', // amber
  Proficient: '#3B82F6', // blue
  Advanced:   '#10B981', // emerald
  Exemplary:  '#8B5CF6', // purple
};

const LEVEL_PERCENT: Record<string, number> = {
  Emerging: 20, Developing: 40, Proficient: 60, Advanced: 80, Exemplary: 100,
};

function normalizeLevel(raw: string | null | undefined): string {
  if (!raw) return '';
  const v = String(raw).trim();
  // Already in canonical form
  if (v in LEVEL_COLORS) return v;
  // Legacy mappings
  const mapping: Record<string, string> = {
    // Gardner signals
    strong: 'Advanced', developing: 'Developing', emerging: 'Emerging',
    // Reading/math tier keys
    lower: 'Developing', middle: 'Proficient', upper: 'Advanced',
    // Math performance
    struggling: 'Developing', 'on-track': 'Proficient', above: 'Advanced', below: 'Developing', on: 'Proficient',
    // Profile baseline (old)
    Basic: 'Developing',
  };
  return mapping[v] || v;
}

function getTierLabel(tier: string): string { return normalizeLevel(tier); }
function getTierColor(tier: string): string { const n = normalizeLevel(tier); return LEVEL_COLORS[n] || '#94A3B8'; }
function getTierPercent(tier: string): number { const n = normalizeLevel(tier); return LEVEL_PERCENT[n] ?? 20; }
function getSignalLabel(signal: string): string { return normalizeLevel(signal); }
function getSignalColor(signal: string): string { const n = normalizeLevel(signal); return LEVEL_COLORS[n] || '#94A3B8'; }
function getSignalPercent(signal: string): number { const n = normalizeLevel(signal); return LEVEL_PERCENT[n] ?? 20; }

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

/* ── Inline child that auto-kicks AI overview generation on first open ── */
function GenerateOverviewInline({ studentId, onReady }: { studentId: string; onReady: (text: string, when: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true); setError(null);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError('Not signed in.'); return; }
        const res = await fetch('/api/teacher/generate-overview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, teacherId: user.id }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data.overview) onReady(data.overview, data.generated_at);
        else setError(data.error || 'Could not generate overview.');
      } catch (e) {
        if (!cancelled) setError('Could not generate overview.');
      } finally { if (!cancelled) setLoading(false); }
    }
    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  if (loading) return <p className="text-[13px] text-text-secondary italic">✨ Generating overview…</p>;
  if (error)   return <p className="text-[13px] text-red-500">{error}</p>;
  return <p className="text-[13px] text-text-muted italic">No overview yet.</p>;
}

function StudentDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const studentId = searchParams.get('student');

  const [profile, setProfile] = useState<Profile | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherNotes, setTeacherNotes] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagSaving, setFlagSaving] = useState(false);
  const [flagError, setFlagError] = useState('');
  const [flagSuccess, setFlagSuccess] = useState(false);
  const [showAssessmentPanel, setShowAssessmentPanel] = useState(false);
  const [aiOverview, setAiOverview] = useState<string | null>(null);
  const [aiOverviewLoading, setAiOverviewLoading] = useState(false);
  const [aiOverviewDate, setAiOverviewDate] = useState<string | null>(null);

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
        setResponses(data.responses || []);
        if (data.assessment?.ai_overview) {
          setAiOverview(data.assessment.ai_overview);
          setAiOverviewDate(data.assessment.ai_overview_generated_at || null);
        }
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
      {/* Back button — z-index above the panel click-catcher so a single click always navigates */}
      <button
        onClick={() => { setShowAssessmentPanel(false); router.push('/teacher/students'); }}
        className="relative z-[70] inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border-[1.5px] border-border
          bg-transparent text-text-secondary text-[13px] font-medium cursor-pointer transition-all
          hover:border-navy hover:text-text-primary mb-5"
      >
        <CaretLeft size={16} weight="fill" /> Back to Students
      </button>

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

      {/* ── Interactive Tile Stack (single column on left, panels pop from right) ─────────────── */}
      <div className="flex flex-col gap-4 mb-5 max-w-[720px]">

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
          className="relative text-left bg-card-bg border border-border rounded-[14px] p-5 overflow-hidden opacity-60 cursor-not-allowed"
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
          {/* Transparent click-catcher so page content stays crisp behind the panel */}
          <div
            className="fixed inset-0 z-[55]"
            onClick={() => setShowAssessmentPanel(false)}
          />
          {/* Start below the top nav bar so the panel aligns with the Student Name card on the left */}
          <div className="fixed top-[84px] right-0 h-[calc(100vh-84px)] bg-card-bg border-l border-t border-border rounded-tl-[14px] z-[60] shadow-2xl flex flex-col animate-[slideInRight_0.25s_ease-out] w-full sm:w-[40vw] sm:min-w-[500px] sm:max-w-[900px]">
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
              {/* AI Overview */}
              <section className="rounded-xl border-2 border-[#7C3AED]/30 bg-gradient-to-br from-[#7C3AED]/8 to-[#7C3AED]/0 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkle size={16} weight="fill" className="text-[#7C3AED]" />
                    <h4 className="font-heading font-bold text-[13px] text-text-primary">AI Overview</h4>
                    <span className="text-[10px] font-semibold text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-0.5 rounded-full">AI-generated</span>
                  </div>
                  <button
                    onClick={async () => {
                      if (aiOverviewLoading) return;
                      setAiOverviewLoading(true);
                      try {
                        const supabase = createClient();
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user) return;
                        const res = await fetch('/api/teacher/generate-overview', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ studentId, teacherId: user.id, regenerate: true }),
                        });
                        const data = await res.json();
                        if (res.ok) {
                          setAiOverview(data.overview);
                          setAiOverviewDate(data.generated_at);
                        }
                      } finally { setAiOverviewLoading(false); }
                    }}
                    className="text-[11px] font-semibold text-[#7C3AED] hover:underline cursor-pointer bg-transparent border-0 disabled:opacity-50"
                    disabled={aiOverviewLoading}
                  >
                    {aiOverviewLoading ? 'Regenerating…' : 'Regenerate'}
                  </button>
                </div>
                {aiOverview ? (
                  <>
                    <p className="text-[13px] text-text-primary leading-[1.6]">{aiOverview}</p>
                    {aiOverviewDate && <p className="text-[10px] text-text-muted mt-2">Generated {new Date(aiOverviewDate).toLocaleString()}</p>}
                  </>
                ) : (
                  studentId && (
                    <GenerateOverviewInline
                      studentId={studentId}
                      onReady={(text, when) => { setAiOverview(text); setAiOverviewDate(when); }}
                    />
                  )
                )}
              </section>

              {/* About section */}
              <section>
                <h4 className="text-[11px] font-bold uppercase tracking-[0.5px] text-text-secondary mb-2">About</h4>
                <div className="space-y-2 text-sm">
                  {assessment.preferred_name && <div><span className="text-text-secondary">Preferred name:</span> <span className="text-text-primary font-semibold">{assessment.preferred_name}</span></div>}
                  {assessment.age && <div><span className="text-text-secondary">Age:</span> <span className="text-text-primary font-semibold">{assessment.age}</span></div>}
                  {assessment.theme && <div><span className="text-text-secondary">Theme chosen:</span> <span className="text-text-primary font-semibold capitalize">{assessment.theme}</span></div>}
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

              {/* Generic per-category responses renderer ─────────────────── */}
              {responses.length === 0 ? (
                <section className="rounded-lg border border-border bg-surface p-4 text-center">
                  <p className="text-[12px] text-text-secondary">No detailed responses captured yet. This student completed their baseline assessment before we started capturing per-question answers. Future students will show full Q&amp;A here automatically.</p>
                </section>
              ) : (
                // Group by category in the order they first appear
                Object.entries(
                  responses.reduce<Record<string, AssessmentResponse[]>>((acc, r) => {
                    const key = r.category || 'other';
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(r);
                    return acc;
                  }, {})
                ).map(([category, rows]) => {
                  const categoryLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
                    reading: { label: 'Reading', icon: BookOpenText, color: '#0EA5E9' },
                    math: { label: 'Math', icon: Brain, color: '#F59E0B' },
                    logic: { label: 'Logic & Reasoning', icon: Lightbulb, color: '#EAB308' },
                    writing: { label: 'Writing', icon: PencilSimple, color: '#EC4899' },
                    spatial: { label: 'Visual-Spatial', icon: Eye, color: '#6366F1' },
                    musical: { label: 'Musical', icon: MusicNotes, color: '#8B5CF6' },
                    kinesthetic: { label: 'Bodily-Kinesthetic', icon: Barbell, color: '#EF4444' },
                    interpersonal: { label: 'Interpersonal', icon: PersonArmsSpread, color: '#10B981' },
                    intrapersonal: { label: 'Intrapersonal', icon: HandHeart, color: '#14B8A6' },
                    naturalistic: { label: 'Naturalistic', icon: TreeEvergreen, color: '#84CC16' },
                    eq: { label: 'Emotional Intelligence', icon: HandHeart, color: '#F43F5E' },
                    authenticity: { label: 'Authenticity', icon: Sparkle, color: '#94A3B8' },
                  };
                  const cfg = categoryLabels[category] || { label: category, icon: Brain, color: '#94A3B8' };
                  const IconC = cfg.icon;
                  return (
                    <section key={category} className="rounded-lg border border-border bg-surface p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <IconC size={15} weight="fill" style={{ color: cfg.color }} />
                        <h4 className="text-sm font-bold text-text-primary">{cfg.label}</h4>
                        {rows.some(r => r.signal_result) && (
                          <div className="flex gap-1 ml-auto">
                            {Array.from(new Set(rows.map(r => r.signal_result).filter(Boolean))).map(sig => (
                              <span key={String(sig)} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: getSignalColor(String(sig)), backgroundColor: getSignalColor(String(sig)) + '20' }}>
                                {getSignalLabel(String(sig))}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        {rows.map(r => {
                          const isChecklist = r.question_type === 'checkbox' || r.question_type === 'multi_choice';
                          let parsedAnswer: string[] | null = null;
                          if (isChecklist && r.student_answer) {
                            try { parsedAnswer = JSON.parse(r.student_answer); } catch {}
                          }
                          const isNumberMath = r.category === 'math' && r.correct_answer !== null && r.student_answer !== null;
                          const isCorrect = isNumberMath && String(r.student_answer).trim() === String(r.correct_answer).trim();

                          return (
                            <div key={r.id} className={`rounded-md border p-3 ${
                              isNumberMath
                                ? (isCorrect
                                    ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900'
                                    : 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900')
                                : 'bg-card-bg border-border'
                            }`}>
                              {r.question_text && (
                                <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-text-secondary mb-1">Question</p>
                              )}
                              {r.question_text && (
                                <p className="text-[13px] text-text-primary italic mb-2 whitespace-pre-wrap">{r.question_text}</p>
                              )}
                              <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-text-secondary mb-1">Student&apos;s Answer</p>
                              {parsedAnswer && Array.isArray(parsedAnswer) ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {parsedAnswer.length === 0 ? (
                                    <span className="text-[12px] text-text-muted italic">(none selected)</span>
                                  ) : parsedAnswer.map(v => (
                                    <span key={v} className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-border/40 text-text-primary capitalize">{String(v).replace(/_/g, ' ')}</span>
                                  ))}
                                  {Array.isArray(r.options_shown) && r.options_shown.length > 0 && (
                                    <span className="text-[10px] text-text-muted ml-1">(of {r.options_shown.length} options)</span>
                                  )}
                                </div>
                              ) : (
                                <p className="text-[13px] text-text-primary whitespace-pre-wrap leading-[1.55]">{r.student_answer || <span className="italic text-text-muted">(blank)</span>}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                {r.correct_answer && (
                                  <span className="text-[11px] text-text-secondary">Correct: <span className="font-semibold text-text-primary">{r.correct_answer}</span></span>
                                )}
                                {isNumberMath && (
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                    {isCorrect ? 'Correct' : 'Off'}
                                  </span>
                                )}
                                {r.signal_result && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto" style={{ color: getSignalColor(r.signal_result), backgroundColor: getSignalColor(r.signal_result) + '20' }}>
                                    Signal: {getSignalLabel(r.signal_result)}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })
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
