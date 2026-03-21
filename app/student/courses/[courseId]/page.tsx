'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CaretLeft,
  CaretRight,
  CheckCircle,
  Circle,
  List,
  X,
  Trophy,
  CaretDown,
  CaretUp,
  BookOpenText,
  House,
  Exam,
  ArrowClockwise,
  XCircle,
  Certificate,
  ChatsCircle,
  VideoCamera,
  Play,
  Users,
  GraduationCap,
} from '@phosphor-icons/react';
import VideoPlayer from '@/components/recording/VideoPlayer';

// ── Types ──────────────────────────────────────────────

interface LessonData {
  id: string;
  title: string;
  order: number;
  content: string;
  completed: boolean;
  videoUrl?: string | null;
}

interface ModuleData {
  title: string;
  lessonCount: number;
  lessons: LessonData[];
  completedCount: number;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  subject: string;
  instructor: string;
  gradeLevel: string;
  thumbnail?: string;
}

interface ProgressData {
  completed: number;
  total: number;
  percentage: number;
}

interface CourseDetail {
  course: CourseData;
  modules: ModuleData[];
  progress: ProgressData;
  enrollment: { id: string; status: string; enrolledAt: string };
}

interface QuizQuestion {
  id: string;
  quizId: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options: string[];
}

interface QuizData {
  id: string;
  lessonId: string;
  title: string;
  passingScore: number;
  questions: QuizQuestion[];
  bestAttempt: { score: number; passed: boolean; takenAt: string } | null;
}

interface QuizResult {
  score: number;
  passed: boolean;
  passingScore: number;
  results: { questionId: string; correct: boolean; correctAnswer: string }[];
}

// ── Component ──────────────────────────────────────────

export default function CourseViewerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const initialLessonId = searchParams.get('lesson');

  const [data, setData] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notEnrolled, setNotEnrolled] = useState(false);

  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [marking, setMarking] = useState(false);

  // Quiz state
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizMode, setQuizMode] = useState<'preview' | 'taking' | 'results'>('preview');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number | string>>({});
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Fetch course data
  const fetchCourse = useCallback(async () => {
    try {
      const res = await fetch(`/api/student/courses/${courseId}`);
      if (res.status === 403) {
        setNotEnrolled(true);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError('Failed to load course');
        setLoading(false);
        return;
      }
      const json: CourseDetail = await res.json();
      setData(json);

      // Expand all modules by default
      const allModules = new Set(json.modules.map((m) => m.title));
      setExpandedModules(allModules);

      // Set initial lesson
      const allLessons = json.modules.flatMap((m) => m.lessons);
      if (initialLessonId && allLessons.some((l) => l.id === initialLessonId)) {
        setCurrentLessonId(initialLessonId);
      } else {
        // Default: first uncompleted, or first lesson
        const firstUncompleted = allLessons.find((l) => !l.completed);
        setCurrentLessonId(firstUncompleted?.id ?? allLessons[0]?.id ?? null);
      }

      setLoading(false);
    } catch {
      setError('Failed to load course');
      setLoading(false);
    }
  }, [courseId, initialLessonId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  // Fetch quiz when lesson changes
  useEffect(() => {
    if (!currentLessonId) return;

    setQuiz(null);
    setQuizMode('preview');
    setQuizAnswers({});
    setQuizResult(null);
    setQuizLoading(true);

    fetch(`/api/quiz/by-lesson/${currentLessonId}`)
      .then((res) => {
        if (!res.ok) {
          setQuiz(null);
          return null;
        }
        return res.json();
      })
      .then((data: QuizData | null) => {
        if (data) setQuiz(data);
      })
      .catch(() => setQuiz(null))
      .finally(() => setQuizLoading(false));
  }, [currentLessonId]);

  // Get ordered lessons
  const allLessons = data?.modules.flatMap((m) => m.lessons) ?? [];
  const currentLesson = allLessons.find((l) => l.id === currentLessonId) ?? null;
  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Find which module the current lesson belongs to
  const currentModule = data?.modules.find((m) =>
    m.lessons.some((l) => l.id === currentLessonId),
  );

  const allComplete = data ? data.progress.percentage === 100 : false;

  // Toggle module expansion
  function toggleModule(title: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }

  // Mark lesson complete
  async function handleMarkComplete() {
    if (!currentLessonId || marking) return;
    setMarking(true);
    try {
      const res = await fetch(`/api/lessons/${currentLessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: 'demo-student' }),
      });
      if (res.ok) {
        const result = await res.json();
        // Update local state
        setData((prev) => {
          if (!prev) return prev;
          const updatedModules = prev.modules.map((m) => ({
            ...m,
            lessons: m.lessons.map((l) =>
              l.id === currentLessonId ? { ...l, completed: true } : l,
            ),
            completedCount:
              m.completedCount +
              (m.lessons.some((l) => l.id === currentLessonId && !l.completed) ? 1 : 0),
          }));
          return {
            ...prev,
            modules: updatedModules,
            progress: result.progress,
          };
        });
      }
    } finally {
      setMarking(false);
    }
  }

  // Navigate to lesson
  function goToLesson(lessonId: string) {
    setCurrentLessonId(lessonId);
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  }

  // Quiz handlers
  function handleStartQuiz() {
    setQuizAnswers({});
    setQuizResult(null);
    setQuizMode('taking');
  }

  function handleAnswerChange(questionId: string, answer: number | string) {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }

  async function handleSubmitQuiz() {
    if (!quiz || quizSubmitting) return;
    setQuizSubmitting(true);

    const answersPayload = quiz.questions.map((q) => ({
      questionId: q.id,
      answer: quizAnswers[q.id] ?? (q.type === 'short-answer' ? '' : -1),
    }));

    try {
      const res = await fetch(`/api/student/quiz/${quiz.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersPayload }),
      });

      if (res.ok) {
        const result: QuizResult = await res.json();
        setQuizResult(result);
        setQuizMode('results');
        // Update best attempt locally
        setQuiz((prev) => {
          if (!prev) return prev;
          const newBest =
            !prev.bestAttempt || result.score > prev.bestAttempt.score
              ? { score: result.score, passed: result.passed, takenAt: new Date().toISOString() }
              : prev.bestAttempt;
          return { ...prev, bestAttempt: newBest };
        });
      }
    } finally {
      setQuizSubmitting(false);
    }
  }

  const allQuestionsAnswered = quiz
    ? quiz.questions.every((q) => {
        const ans = quizAnswers[q.id];
        if (q.type === 'short-answer') return typeof ans === 'string' && ans.trim() !== '';
        return typeof ans === 'number' && ans >= 0;
      })
    : false;

  // ── Not enrolled state ───────────────────────────────
  if (notEnrolled) {
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
            You need to enroll in this course before you can access the lessons.
          </p>
          <Link
            href={`/catalog/${courseId}`}
            className="inline-flex items-center font-heading text-sm font-bold bg-teal text-white px-6 py-3 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
          >
            View Course &amp; Enroll
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
  if (error || !data || !currentLesson) {
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
            href="/student/my-courses"
            className="inline-flex items-center font-heading text-sm font-bold bg-teal text-white px-6 py-3 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
          >
            Back to My Courses
          </Link>
        </div>
      </div>
    );
  }

  // ── All complete celebration ─────────────────────────
  const showCongrats = allComplete && currentLesson.completed;

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
            href="/student/my-courses"
            className="text-xs text-teal hover:text-teal/80 font-medium transition-colors mb-2 inline-block"
          >
            ← My Courses
          </Link>
          <h2 className="font-heading font-bold text-base text-white leading-tight">
            {data.course.title}
          </h2>
          <p className="text-xs text-white/50 mt-1">{data.course.instructor}</p>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-white/60">Progress</span>
              <span className="font-bold text-teal">{data.progress.percentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal rounded-full transition-all duration-500"
                style={{ width: `${data.progress.percentage}%` }}
              />
            </div>
            <div className="text-[10px] text-white/40 mt-1">
              {data.progress.completed} of {data.progress.total} lessons complete
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

        {/* Module accordion */}
        <nav className="flex-1 overflow-y-auto py-3">
          {data.modules.map((mod) => {
            const isExpanded = expandedModules.has(mod.title);
            const moduleComplete = mod.completedCount === mod.lessons.length && mod.lessons.length > 0;
            const isCurrentModule = currentModule?.title === mod.title;

            return (
              <div key={mod.title} className="mb-1">
                {/* Module header */}
                <button
                  onClick={() => toggleModule(mod.title)}
                  className={`w-full flex items-center gap-2 px-5 py-3 text-left transition-colors hover:bg-white/[0.06] ${
                    isCurrentModule ? 'bg-white/[0.04]' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {moduleComplete ? (
                        <CheckCircle size={16} weight="fill" className="text-teal flex-shrink-0" />
                      ) : (
                        <Circle size={16} weight="regular" className="text-white/30 flex-shrink-0" />
                      )}
                      <span className={`text-xs font-bold truncate ${moduleComplete ? 'text-teal' : 'text-white/90'}`}>
                        {mod.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/40 ml-6">
                      {mod.completedCount}/{mod.lessons.length} lessons
                    </span>
                  </div>
                  {isExpanded ? (
                    <CaretUp size={14} className="text-white/40 flex-shrink-0" />
                  ) : (
                    <CaretDown size={14} className="text-white/40 flex-shrink-0" />
                  )}
                </button>

                {/* Lessons list */}
                {isExpanded && (
                  <div className="pb-1">
                    {mod.lessons.map((lesson) => {
                      const isActive = lesson.id === currentLessonId;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => goToLesson(lesson.id)}
                          className={`w-full flex items-center gap-2.5 pl-10 pr-5 py-2 text-left transition-colors ${
                            isActive
                              ? 'bg-teal/20 border-l-2 border-teal'
                              : 'hover:bg-white/[0.06] border-l-2 border-transparent'
                          }`}
                        >
                          {lesson.completed ? (
                            <CheckCircle size={14} weight="fill" className="text-teal flex-shrink-0" />
                          ) : (
                            <Circle size={14} weight="regular" className="text-white/30 flex-shrink-0" />
                          )}
                          <span
                            className={`text-xs truncate ${
                              isActive
                                ? 'text-white font-semibold'
                                : lesson.completed
                                ? 'text-white/50'
                                : 'text-white/70'
                            }`}
                          >
                            {lesson.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
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
            <Link href="/student/my-courses" className="text-teal hover:text-navy transition-colors">
              My Courses
            </Link>
            <span>/</span>
            <span className="text-text-primary font-medium truncate">{data.course.title}</span>
          </nav>

          {/* Compact progress */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <div className="h-1.5 w-24 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-teal rounded-full transition-all duration-500"
                style={{ width: `${data.progress.percentage}%` }}
              />
            </div>
            <span className="text-xs font-bold text-text-primary">{data.progress.percentage}%</span>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8 lg:px-10">
            {showCongrats && (
              <div className="bg-gold/10 border border-gold/30 rounded-2xl p-8 mb-8 text-center">
                <Trophy size={48} weight="fill" className="text-gold mx-auto mb-3" />
                <h2 className="font-heading font-bold text-2xl text-text-primary mb-2">
                  Congratulations!
                </h2>
                <p className="text-sm text-text-secondary max-w-md mx-auto">
                  You&apos;ve completed all lessons in {data.course.title}. Great work! You can review any lesson by clicking on it in the sidebar.
                </p>
                <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                  <Link
                    href={`/student/certificates/${courseId}`}
                    className="inline-flex items-center gap-2 font-heading text-sm font-bold bg-gold text-deep-navy px-6 py-2.5 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                  >
                    <Certificate size={18} weight="fill" />
                    Download Certificate
                  </Link>
                  <Link
                    href="/student/my-courses"
                    className="inline-flex items-center font-heading text-sm font-bold bg-teal text-white px-6 py-2.5 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                  >
                    Back to My Courses
                  </Link>
                </div>
              </div>
            )}

            {/* Video player */}
            {currentLesson.videoUrl && (
              <div className="mb-6">
                <div className="relative w-full rounded-xl overflow-hidden bg-navy" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={currentLesson.videoUrl}
                    title={`Video: ${currentLesson.title}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                  <Play size={14} weight="fill" className="text-teal" />
                  <span>Watch the video lesson above, then read the summary below</span>
                </div>
              </div>
            )}

            {/* Session recording player */}
            {currentLesson && (
              <VideoPlayer lessonId={currentLesson.id} />
            )}

            {/* Module indicator */}
            {currentModule && (
              <div className="text-xs font-bold text-teal uppercase tracking-wide mb-2">
                {currentModule.title}
              </div>
            )}

            {/* Lesson title */}
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text-primary mb-6 leading-tight">
              {currentLesson.title}
            </h1>

            {/* Lesson content */}
            <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed space-y-4">
              {currentLesson.content.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {/* ── Quiz Section ─────────────────────────────── */}
            {quizLoading && (
              <div className="mt-8 flex items-center gap-2 text-sm text-text-muted">
                <div className="w-4 h-4 border-2 border-teal border-t-transparent rounded-full animate-spin" />
                Loading quiz...
              </div>
            )}

            {quiz && quizMode === 'preview' && (
              <div className="mt-8 bg-card-bg border border-border rounded-xl p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
                      <Exam size={22} weight="fill" className="text-teal" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-text-primary">
                        {quiz.title}
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5">
                        {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''} · {quiz.passingScore}% to pass
                      </p>
                    </div>
                  </div>

                  {quiz.bestAttempt && (
                    <div
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                        quiz.bestAttempt.passed
                          ? 'bg-teal/10 text-teal'
                          : 'bg-coral/10 text-coral'
                      }`}
                    >
                      {quiz.bestAttempt.passed ? (
                        <CheckCircle size={14} weight="fill" />
                      ) : (
                        <XCircle size={14} weight="fill" />
                      )}
                      Best: {quiz.bestAttempt.score}%
                    </div>
                  )}
                </div>

                <button
                  onClick={handleStartQuiz}
                  className="mt-4 inline-flex items-center gap-2 font-heading text-sm font-bold bg-teal text-white px-5 py-2.5 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                >
                  {quiz.bestAttempt ? (
                    <>
                      <ArrowClockwise size={16} weight="bold" />
                      Retake Quiz
                    </>
                  ) : (
                    <>
                      <Exam size={16} weight="bold" />
                      Take Quiz
                    </>
                  )}
                </button>
              </div>
            )}

            {quiz && quizMode === 'taking' && (
              <div className="mt-8 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-lg text-text-primary">
                    {quiz.title}
                  </h3>
                  <button
                    onClick={() => setQuizMode('preview')}
                    className="text-xs text-text-muted hover:text-text-secondary transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                {quiz.questions.map((q, qIdx) => (
                  <div
                    key={q.id}
                    className="bg-card-bg border border-border rounded-xl p-5"
                  >
                    <p className="text-sm font-semibold text-text-primary mb-3">
                      <span className="text-teal mr-1.5">{qIdx + 1}.</span>
                      {q.text}
                    </p>

                    {(q.type === 'multiple-choice' || q.type === 'true-false') && (
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => (
                          <label
                            key={optIdx}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              quizAnswers[q.id] === optIdx
                                ? 'border-teal bg-teal/5'
                                : 'border-border hover:border-teal/30 hover:bg-teal/[0.02]'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              checked={quizAnswers[q.id] === optIdx}
                              onChange={() => handleAnswerChange(q.id, optIdx)}
                              className="w-4 h-4 text-teal accent-teal"
                            />
                            <span className="text-sm text-text-secondary">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {q.type === 'short-answer' && (
                      <input
                        type="text"
                        placeholder="Type your answer..."
                        value={(quizAnswers[q.id] as string) || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-warm-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                      />
                    )}
                  </div>
                ))}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={!allQuestionsAnswered || quizSubmitting}
                    className="inline-flex items-center gap-2 font-heading text-sm font-bold bg-teal text-white px-6 py-3 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {quizSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Grading...
                      </>
                    ) : (
                      'Submit Quiz'
                    )}
                  </button>
                  {!allQuestionsAnswered && (
                    <span className="text-xs text-text-muted">
                      Answer all questions to submit
                    </span>
                  )}
                </div>
              </div>
            )}

            {quiz && quizMode === 'results' && quizResult && (
              <div className="mt-8 space-y-5">
                {/* Score banner */}
                <div
                  className={`rounded-xl p-6 text-center border ${
                    quizResult.passed
                      ? 'bg-teal/5 border-teal/20'
                      : 'bg-coral/5 border-coral/20'
                  }`}
                >
                  <div
                    className={`text-4xl font-heading font-extrabold mb-1 ${
                      quizResult.passed ? 'text-teal' : 'text-coral'
                    }`}
                  >
                    {quizResult.score}%
                  </div>
                  <div
                    className={`text-sm font-semibold mb-1 ${
                      quizResult.passed ? 'text-teal' : 'text-coral'
                    }`}
                  >
                    {quizResult.passed ? 'Passed!' : 'Not Passed'}
                  </div>
                  <div className="text-xs text-text-muted">
                    {quizResult.passingScore}% required to pass
                  </div>
                </div>

                {/* Per-question results */}
                <div className="space-y-3">
                  {quiz.questions.map((q, qIdx) => {
                    const result = quizResult.results.find((r) => r.questionId === q.id);
                    return (
                      <div
                        key={q.id}
                        className={`bg-card-bg border rounded-xl p-4 ${
                          result?.correct ? 'border-teal/30' : 'border-coral/30'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {result?.correct ? (
                            <CheckCircle size={18} weight="fill" className="text-teal flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle size={18} weight="fill" className="text-coral flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-text-primary">
                              <span className="text-text-muted mr-1">{qIdx + 1}.</span>
                              {q.text}
                            </p>
                            {!result?.correct && (
                              <p className="text-xs text-teal mt-1">
                                Correct answer: {result?.correctAnswer}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleStartQuiz}
                  className="inline-flex items-center gap-2 font-heading text-sm font-bold bg-teal text-white px-5 py-2.5 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                >
                  <ArrowClockwise size={16} weight="bold" />
                  Retake Quiz
                </button>
              </div>
            )}

            {/* Mark Complete button */}
            <div className="mt-10 mb-6">
              {currentLesson.completed ? (
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-teal bg-teal/10 border border-teal/20 px-5 py-2.5 rounded-full">
                  <CheckCircle size={18} weight="fill" />
                  Lesson Complete
                </div>
              ) : (
                <button
                  onClick={handleMarkComplete}
                  disabled={marking}
                  className="inline-flex items-center gap-2 font-heading text-sm font-bold bg-teal text-white px-6 py-3 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {marking ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} weight="bold" />
                      Mark Complete
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom navigation */}
        <footer className="flex-shrink-0 bg-card-bg border-t border-border px-6 py-3 flex items-center justify-between gap-4">
          {prevLesson ? (
            <button
              onClick={() => goToLesson(prevLesson.id)}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-teal transition-colors font-medium"
            >
              <CaretLeft size={16} weight="bold" />
              <span className="hidden sm:inline">{prevLesson.title}</span>
              <span className="sm:hidden">Previous</span>
            </button>
          ) : (
            <div />
          )}

          <span className="text-xs text-text-muted">
            {currentIndex + 1} / {allLessons.length}
          </span>

          {nextLesson ? (
            <button
              onClick={() => goToLesson(nextLesson.id)}
              className="flex items-center gap-2 text-sm text-teal hover:text-navy transition-colors font-semibold"
            >
              <span className="hidden sm:inline">{nextLesson.title}</span>
              <span className="sm:hidden">Next</span>
              <CaretRight size={16} weight="bold" />
            </button>
          ) : (
            <div />
          )}
        </footer>
      </main>
    </div>
  );
}
