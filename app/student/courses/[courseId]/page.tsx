'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CaretDown,
  CaretUp,
  CheckCircle,
  Circle,
  List,
  X,
  BookOpenText,
  House,
  ChatsCircle,
  VideoCamera,
  Users,
  GraduationCap,
  ClipboardText,
  PaperPlaneTilt,
  Clock,
  Trophy,
  ChatText,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import type { Profile, Class, Enrollment, Assignment, Submission, ChatMessage } from '@/lib/supabase/types';

// ── Types ──────────────────────────────────────────────

interface CoursePageData {
  classInfo: Class;
  teacher: Profile;
  assignments: Assignment[];
  submissions: Map<string, Submission>;
  chatMessages: ChatMessage[];
  enrollment: Enrollment;
}

// ── Helpers ────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'No due date';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function isDueSoon(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const due = new Date(dateStr);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  return diffMs > 0 && diffMs < 48 * 60 * 60 * 1000;
}

function isPastDue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

// ── Component ──────────────────────────────────────────

export default function CourseViewerPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [data, setData] = useState<CoursePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assignmentsExpanded, setAssignmentsExpanded] = useState(true);
  const [chatExpanded, setChatExpanded] = useState(false);

  // Fetch all course data from Supabase
  const fetchCourse = useCallback(async () => {
    try {
      const supabase = createClient();

      // 1. Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError('Please log in to view this course.');
        setLoading(false);
        return;
      }

      // 2. Verify enrollment
      const { data: enrollmentData, error: enrollError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', user.id)
        .eq('class_id', courseId)
        .eq('status', 'active')
        .single();

      if (enrollError || !enrollmentData) {
        setError('not_enrolled');
        setLoading(false);
        return;
      }
      const enrollment = enrollmentData as unknown as Enrollment;

      // 3. Fetch class details
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', courseId)
        .single();

      if (classError || !classData) {
        setError('Course not found.');
        setLoading(false);
        return;
      }
      const classInfo = classData as unknown as Class;

      // 4. Fetch teacher profile
      const { data: teacherData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', classInfo.teacher_id)
        .single();

      const teacher = (teacherData as unknown as Profile) || {
        id: classInfo.teacher_id,
        display_name: 'Teacher',
        role: 'teacher' as const,
        avatar_url: null,
        school_id: null,
        student_number: null,
        created_at: '',
        updated_at: '',
      };

      // 5. Fetch assignments
      const { data: assignmentData } = await supabase
        .from('assignments')
        .select('*')
        .eq('class_id', courseId)
        .order('due_date', { ascending: true, nullsFirst: false });

      const assignments = (assignmentData ?? []) as unknown as Assignment[];

      // 6. Fetch submissions for this student
      const assignmentIds = assignments.map(a => a.id);
      let submissions = new Map<string, Submission>();
      if (assignmentIds.length > 0) {
        const { data: submissionData } = await supabase
          .from('submissions')
          .select('*')
          .eq('student_id', user.id)
          .in('assignment_id', assignmentIds);

        const subs = (submissionData ?? []) as unknown as Submission[];
        submissions = new Map(subs.map(s => [s.assignment_id, s]));
      }

      // 7. Fetch chat messages for this student in this class
      const { data: chatData } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('class_id', courseId)
        .or(`sender_id.eq.${user.id},message_type.eq.ai,message_type.eq.teacher`)
        .order('created_at', { ascending: true })
        .limit(200);

      const chatMessages = (chatData ?? []) as unknown as ChatMessage[];

      setData({
        classInfo,
        teacher,
        assignments,
        submissions,
        chatMessages,
        enrollment,
      });

      // Select first assignment by default
      if (assignments.length > 0) {
        setSelectedAssignmentId(assignments[0].id);
      }

      setLoading(false);
    } catch {
      setError('Failed to load course.');
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  // Derived data
  const selectedAssignment = data?.assignments.find(a => a.id === selectedAssignmentId) ?? null;
  const selectedSubmission = selectedAssignmentId ? data?.submissions.get(selectedAssignmentId) ?? null : null;

  const completedCount = data ? data.assignments.filter(a => data.submissions.has(a.id)).length : 0;
  const totalCount = data?.assignments.length ?? 0;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const allComplete = totalCount > 0 && completedCount === totalCount;

  // Navigate to assignment
  function goToAssignment(assignmentId: string) {
    setSelectedAssignmentId(assignmentId);
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  }

  // ── Not enrolled state ───────────────────────────────
  if (error === 'not_enrolled') {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center p-6">
        <div className="bg-card-bg border border-border rounded-2xl p-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-4">
            <BookOpenText size={32} weight="fill" className="text-coral/60" />
          </div>
          <h1 className="font-heading font-bold text-xl text-text-primary mb-2">
            Not Enrolled
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            You need to enroll in this course before you can access it.
          </p>
          <Link
            href="/student/dashboard"
            className="inline-flex items-center font-heading text-sm font-bold bg-teal text-white px-6 py-3 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading state ────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────
  if (error || !data) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center p-6">
        <div className="bg-card-bg border border-border rounded-2xl p-10 text-center max-w-md">
          <h1 className="font-heading font-bold text-xl text-text-primary mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            {error || 'Could not load course content.'}
          </p>
          <Link
            href="/student/dashboard"
            className="inline-flex items-center font-heading text-sm font-bold bg-teal text-white px-6 py-3 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-warm-white">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-lg bg-navy text-white flex items-center justify-center shadow-lg"
        aria-label="Open lesson menu"
      >
        <List size={22} weight="bold" />
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-[300px] bg-navy flex-shrink-0 flex flex-col z-50
          transition-transform duration-200 overflow-hidden
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Close (mobile) */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-white/60 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>

        {/* Course title */}
        <div className="px-5 py-5 border-b border-white/10">
          <Link
            href="/student/dashboard"
            className="text-xs text-teal hover:text-teal/80 font-medium transition-colors mb-2 inline-block"
          >
            ← Dashboard
          </Link>
          <h2 className="font-heading font-bold text-base text-white leading-tight">
            {data.classInfo.name}
          </h2>
          <p className="text-xs text-white/50 mt-1">{data.teacher.display_name || 'Teacher'}</p>
          {data.classInfo.subject && (
            <p className="text-[10px] text-white/40 mt-0.5">
              {data.classInfo.subject}
              {data.classInfo.grade_level ? ` · Grade ${data.classInfo.grade_level}` : ''}
            </p>
          )}

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-white/60">Progress</span>
              <span className="font-bold text-teal">{progressPercentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-[10px] text-white/40 mt-1">
              {completedCount} of {totalCount} assignments complete
            </div>
          </div>
        </div>

        {/* Course links */}
        <div className="px-5 py-3 border-b border-white/10 space-y-1">
          <Link
            href={`/student/courses/${courseId}/forum`}
            className="flex items-center gap-2 text-xs font-medium text-white/70 hover:text-white transition-colors py-1.5"
          >
            <ChatsCircle size={16} weight="fill" className="text-teal" />
            Discussion Forum
          </Link>
          <Link
            href={`/student/courses/${courseId}/live-sessions`}
            className="flex items-center gap-2 text-xs font-medium text-white/70 hover:text-white transition-colors py-1.5"
          >
            <VideoCamera size={16} weight="fill" className="text-coral" />
            Live Sessions
          </Link>
          <Link
            href={`/student/courses/${courseId}/study-groups`}
            className="flex items-center gap-2 text-xs font-medium text-white/70 hover:text-white transition-colors py-1.5"
          >
            <Users size={16} weight="fill" className="text-gold" />
            Study Groups
          </Link>
          <Link
            href={`/student/courses/${courseId}/tutors`}
            className="flex items-center gap-2 text-xs font-medium text-white/70 hover:text-white transition-colors py-1.5"
          >
            <GraduationCap size={16} weight="fill" className="text-teal" />
            Peer Tutors
          </Link>
        </div>

        {/* Assignments accordion */}
        <nav className="flex-1 overflow-y-auto py-3">
          {/* Assignments section */}
          <div className="mb-1">
            <button
              onClick={() => setAssignmentsExpanded(!assignmentsExpanded)}
              className="w-full flex items-center gap-2 px-5 py-3 text-left transition-colors hover:bg-white/[0.06] bg-white/[0.04]"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <ClipboardText size={16} weight="fill" className="text-teal flex-shrink-0" />
                  <span className="text-xs font-bold text-white/90">
                    Assignments
                  </span>
                </div>
                <span className="text-[10px] text-white/40 ml-6">
                  {completedCount}/{totalCount} submitted
                </span>
              </div>
              {assignmentsExpanded ? (
                <CaretUp size={14} className="text-white/40 flex-shrink-0" />
              ) : (
                <CaretDown size={14} className="text-white/40 flex-shrink-0" />
              )}
            </button>

            {assignmentsExpanded && (
              <div className="pb-1">
                {data.assignments.length === 0 ? (
                  <div className="pl-10 pr-5 py-3 text-xs text-white/40">
                    No assignments yet
                  </div>
                ) : (
                  data.assignments.map((assignment) => {
                    const isActive = assignment.id === selectedAssignmentId;
                    const isSubmitted = data.submissions.has(assignment.id);
                    return (
                      <button
                        key={assignment.id}
                        onClick={() => goToAssignment(assignment.id)}
                        className={`w-full flex items-center gap-2.5 pl-10 pr-5 py-2 text-left transition-colors ${
                          isActive
                            ? 'bg-teal/20 border-l-2 border-teal'
                            : 'hover:bg-white/[0.06] border-l-2 border-transparent'
                        }`}
                      >
                        {isSubmitted ? (
                          <CheckCircle size={14} weight="fill" className="text-teal flex-shrink-0" />
                        ) : (
                          <Circle size={14} weight="regular" className="text-white/30 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-xs truncate block ${
                              isActive
                                ? 'text-white font-semibold'
                                : isSubmitted
                                ? 'text-white/50'
                                : 'text-white/70'
                            }`}
                          >
                            {assignment.title}
                          </span>
                          {assignment.due_date && (
                            <span className={`text-[10px] ${
                              isDueSoon(assignment.due_date) && !isSubmitted
                                ? 'text-coral/80'
                                : 'text-white/30'
                            }`}>
                              Due {formatDate(assignment.due_date)}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Chat messages section */}
          <div className="mb-1">
            <button
              onClick={() => setChatExpanded(!chatExpanded)}
              className="w-full flex items-center gap-2 px-5 py-3 text-left transition-colors hover:bg-white/[0.06]"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <ChatText size={16} weight="fill" className="text-teal flex-shrink-0" />
                  <span className="text-xs font-bold text-white/90">
                    Chat History
                  </span>
                </div>
                <span className="text-[10px] text-white/40 ml-6">
                  {data.chatMessages.length} messages
                </span>
              </div>
              {chatExpanded ? (
                <CaretUp size={14} className="text-white/40 flex-shrink-0" />
              ) : (
                <CaretDown size={14} className="text-white/40 flex-shrink-0" />
              )}
            </button>

            {chatExpanded && (
              <div className="pb-1 px-5">
                {data.chatMessages.length === 0 ? (
                  <div className="py-3 text-xs text-white/40">
                    No messages yet
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-1.5 py-2">
                    {data.chatMessages.slice(-20).map((msg) => (
                      <div key={msg.id} className="text-[11px] text-white/60">
                        <span className={`font-semibold ${
                          msg.message_type === 'student'
                            ? 'text-teal/80'
                            : msg.message_type === 'teacher'
                            ? 'text-gold/80'
                            : 'text-white/50'
                        }`}>
                          {msg.message_type === 'student' ? 'You' : msg.message_type === 'teacher' ? 'Teacher' : 'AI'}:
                        </span>{' '}
                        <span className="text-white/50">{msg.content.length > 80 ? msg.content.slice(0, 80) + '...' : msg.content}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* ── Main content ────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 bg-card-bg border-b border-border px-6 py-3 flex items-center gap-3">
          <nav className="flex items-center gap-1.5 text-xs text-text-muted flex-1 min-w-0">
            <Link href="/student/dashboard" className="text-teal hover:text-navy transition-colors flex items-center gap-1">
              <House size={12} weight="fill" />
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-text-primary font-medium truncate">{data.classInfo.name}</span>
          </nav>

          {/* Compact progress */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <div className="h-1.5 w-24 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-teal rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-xs font-bold text-text-primary">{progressPercentage}%</span>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8 lg:px-10">
            {/* All complete celebration */}
            {allComplete && totalCount > 0 && (
              <div className="bg-gold/10 border border-gold/30 rounded-2xl p-8 mb-8 text-center">
                <Trophy size={48} weight="fill" className="text-gold mx-auto mb-3" />
                <h2 className="font-heading font-bold text-2xl text-text-primary mb-2">
                  Congratulations!
                </h2>
                <p className="text-sm text-text-secondary max-w-md mx-auto">
                  You&apos;ve completed all assignments in {data.classInfo.name}. Great work!
                </p>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <Link
                    href="/student/dashboard"
                    className="inline-flex items-center font-heading text-sm font-bold bg-teal text-white px-6 py-2.5 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            )}

            {/* No assignments state */}
            {data.assignments.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
                  <ClipboardText size={32} weight="fill" className="text-teal/60" />
                </div>
                <h2 className="font-heading font-bold text-xl text-text-primary mb-2">
                  No assignments yet
                </h2>
                <p className="text-sm text-text-secondary max-w-sm mx-auto">
                  Your teacher hasn&apos;t posted any assignments for this class yet. Check back soon!
                </p>
              </div>
            ) : selectedAssignment ? (
              <>
                {/* Assignment detail */}
                <div className="text-xs font-bold text-teal uppercase tracking-wide mb-2">
                  {data.classInfo.subject || 'Assignment'}
                </div>

                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary mb-4 leading-tight">
                  {selectedAssignment.title}
                </h1>

                {/* Assignment meta */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {selectedAssignment.due_date && (
                    <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${
                      selectedSubmission
                        ? 'bg-teal/10 text-teal'
                        : isPastDue(selectedAssignment.due_date)
                        ? 'bg-coral/10 text-coral'
                        : isDueSoon(selectedAssignment.due_date)
                        ? 'bg-gold/10 text-gold'
                        : 'bg-border text-text-muted'
                    }`}>
                      <Clock size={14} weight="fill" />
                      Due {formatDate(selectedAssignment.due_date)}
                    </div>
                  )}
                  {selectedSubmission && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-teal/10 text-teal">
                      <CheckCircle size={14} weight="fill" />
                      Submitted {formatDateTime(selectedSubmission.submitted_at)}
                    </div>
                  )}
                  {selectedSubmission?.grade !== null && selectedSubmission?.grade !== undefined && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-navy/10 text-navy">
                      <Trophy size={14} weight="fill" />
                      Grade: {selectedSubmission.grade}
                    </div>
                  )}
                </div>

                {/* Assignment description */}
                <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed space-y-4">
                  {selectedAssignment.description ? (
                    selectedAssignment.description.split('\n\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))
                  ) : (
                    <p className="text-text-muted italic">No description provided for this assignment.</p>
                  )}
                </div>

                {/* Submission status card */}
                <div className="mt-8 bg-card-bg border border-border rounded-xl p-6">
                  {selectedSubmission ? (
                    <div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
                          <PaperPlaneTilt size={22} weight="fill" className="text-teal" />
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-base text-text-primary">
                            Submitted
                          </h3>
                          <p className="text-xs text-text-muted mt-0.5">
                            Turned in {formatDateTime(selectedSubmission.submitted_at)}
                          </p>
                        </div>
                      </div>
                      {selectedSubmission.content && (
                        <div className="mt-4 p-4 bg-warm-white rounded-lg border border-border">
                          <p className="text-xs font-semibold text-text-muted mb-1.5">Your response:</p>
                          <p className="text-sm text-text-secondary whitespace-pre-wrap">
                            {selectedSubmission.content}
                          </p>
                        </div>
                      )}
                      {selectedSubmission.feedback && (
                        <div className="mt-3 p-4 bg-teal/5 rounded-lg border border-teal/20">
                          <p className="text-xs font-semibold text-teal mb-1.5">Teacher feedback:</p>
                          <p className="text-sm text-text-secondary whitespace-pre-wrap">
                            {selectedSubmission.feedback}
                          </p>
                        </div>
                      )}
                      {selectedSubmission.grade !== null && selectedSubmission.grade !== undefined && (
                        <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-teal bg-teal/10 border border-teal/20 px-5 py-2.5 rounded-full">
                          <Trophy size={18} weight="fill" />
                          Grade: {selectedSubmission.grade}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-border flex items-center justify-center flex-shrink-0">
                          <ClipboardText size={22} weight="fill" className="text-text-muted" />
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-base text-text-primary">
                            Not Yet Submitted
                          </h3>
                          <p className="text-xs text-text-muted mt-0.5">
                            {selectedAssignment.due_date
                              ? isPastDue(selectedAssignment.due_date)
                                ? 'This assignment is past due.'
                                : `Due ${formatDate(selectedAssignment.due_date)}`
                              : 'No due date set.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat messages section for this class */}
                {data.chatMessages.length > 0 && (
                  <div className="mt-8 bg-card-bg border border-border rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <ChatText size={20} weight="fill" className="text-teal" />
                      <h3 className="font-heading font-bold text-base text-text-primary">
                        Recent Chat
                      </h3>
                      <span className="text-xs text-text-muted">({data.chatMessages.length} messages)</span>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {data.chatMessages.slice(-10).map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-2.5 ${msg.message_type === 'student' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
                              msg.message_type === 'student'
                                ? 'bg-teal text-white rounded-br-sm'
                                : msg.message_type === 'teacher'
                                ? 'bg-navy/10 text-text-primary rounded-bl-sm'
                                : 'bg-border text-text-secondary rounded-bl-sm'
                            }`}
                          >
                            <div className="text-[10px] font-semibold mb-0.5 opacity-70">
                              {msg.message_type === 'student' ? 'You' : msg.message_type === 'teacher' ? 'Teacher' : 'AI Tutor'}
                            </div>
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <div className="text-[10px] opacity-50 mt-1">
                              {formatDateTime(msg.created_at)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-border">
                      <Link
                        href={`/student/main?class=${courseId}`}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-teal hover:text-navy transition-colors"
                      >
                        <ChatsCircle size={14} weight="fill" />
                        Continue chatting →
                      </Link>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>

        {/* Bottom navigation between assignments */}
        {data.assignments.length > 0 && selectedAssignment && (
          <footer className="flex-shrink-0 bg-card-bg border-t border-border px-6 py-3 flex items-center justify-between gap-4">
            {(() => {
              const currentIdx = data.assignments.findIndex(a => a.id === selectedAssignmentId);
              const prevAssignment = currentIdx > 0 ? data.assignments[currentIdx - 1] : null;
              const nextAssignment = currentIdx < data.assignments.length - 1 ? data.assignments[currentIdx + 1] : null;

              return (
                <>
                  {prevAssignment ? (
                    <button
                      onClick={() => goToAssignment(prevAssignment.id)}
                      className="flex items-center gap-2 text-sm text-text-secondary hover:text-teal transition-colors font-medium"
                    >
                      <span className="hidden sm:inline truncate max-w-[200px]">← {prevAssignment.title}</span>
                      <span className="sm:hidden">← Previous</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <span className="text-xs text-text-muted">
                    {currentIdx + 1} / {data.assignments.length}
                  </span>

                  {nextAssignment ? (
                    <button
                      onClick={() => goToAssignment(nextAssignment.id)}
                      className="flex items-center gap-2 text-sm text-teal hover:text-navy transition-colors font-semibold"
                    >
                      <span className="hidden sm:inline truncate max-w-[200px]">{nextAssignment.title} →</span>
                      <span className="sm:hidden">Next →</span>
                    </button>
                  ) : (
                    <div />
                  )}
                </>
              );
            })()}
          </footer>
        )}
      </main>
    </div>
  );
}
