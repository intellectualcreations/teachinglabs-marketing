'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ChatCircleDots,
  CheckCircle,
  Circle,
  ArrowLeft,
  CalendarBlank,
  PaperPlaneTilt,
  Clock,
} from '@phosphor-icons/react';

interface OfficeHoursSession {
  id: string;
  courseId: string;
  instructorId: string;
  title: string;
  scheduledAt: string;
  status: 'scheduled' | 'live' | 'ended';
  createdAt: string;
}

interface QAQuestion {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  question: string;
  answer: string | null;
  answeredAt: string | null;
  status: 'pending' | 'answered';
  createdAt: string;
}

interface CourseInfo {
  id: string;
  title: string;
  subject: string;
}

interface EnrolledCourse {
  courseId: string;
  course?: { title: string; subject: string };
}

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  live: 'bg-green-100 text-green-800',
  ended: 'bg-gray-100 text-gray-600',
};

export default function StudentOfficeHoursPage() {
  const [sessions, setSessions] = useState<OfficeHoursSession[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionDetail, setSessionDetail] = useState<OfficeHoursSession | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<QAQuestion[]>([]);
  const [sessionCourse, setSessionCourse] = useState<CourseInfo | null>(null);

  // Question form
  const [newQuestion, setNewQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // Get enrolled courses
        const enrollRes = await fetch('/api/enrollments/student/demo-student');
        const enrollData = await enrollRes.json();
        const courseIds: string[] = (enrollData.enrollments || []).map(
          (e: EnrolledCourse) => e.courseId,
        );
        setEnrolledCourseIds(courseIds);

        // Get sessions for all enrolled courses
        const allSessions: OfficeHoursSession[] = [];
        for (const cid of courseIds) {
          const res = await fetch(`/api/office-hours?courseId=${cid}`);
          const data = await res.json();
          allSessions.push(...(data.sessions || []));
        }
        // Deduplicate and sort
        const unique = Array.from(
          new Map(allSessions.map((s) => [s.id, s])).values(),
        ).sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
        setSessions(unique);
      } catch (err) {
        console.error('Failed to load office hours', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function openSession(id: string) {
    setSelectedSession(id);
    try {
      const res = await fetch(`/api/office-hours/${id}`);
      const data = await res.json();
      setSessionDetail(data.session);
      setSessionQuestions(data.questions || []);
      setSessionCourse(data.course || null);
    } catch (err) {
      console.error('Failed to load session', err);
    }
  }

  async function handleSubmitQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.trim() || !selectedSession) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/office-hours/${selectedSession}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQuestion.trim() }),
      });
      if (res.ok) {
        setNewQuestion('');
        // Refresh questions
        const refreshRes = await fetch(`/api/office-hours/${selectedSession}`);
        const data = await refreshRes.json();
        setSessionQuestions(data.questions || []);
      }
    } catch (err) {
      console.error('Failed to submit question', err);
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Detail view for a selected session
  if (selectedSession && sessionDetail) {
    const isEnded = sessionDetail.status === 'ended';
    const pending = sessionQuestions.filter((q) => q.status === 'pending');
    const answered = sessionQuestions.filter((q) => q.status === 'answered');

    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <button
          onClick={() => setSelectedSession(null)}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-teal mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to office hours
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-heading font-bold text-text-primary">
              {sessionDetail.title}
            </h1>
            {sessionCourse && (
              <p className="text-text-secondary text-sm mt-1">
                {sessionCourse.title} &middot; {formatDate(sessionDetail.scheduledAt)}
              </p>
            )}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize self-start ${STATUS_STYLES[sessionDetail.status]}`}
          >
            {sessionDetail.status}
          </span>
        </div>

        {/* Submit question form (only if not ended) */}
        {!isEnded && (
          <form
            onSubmit={handleSubmitQuestion}
            className="bg-white rounded-xl border border-border p-4 mb-6"
          >
            <label
              htmlFor="student-question"
              className="block text-sm font-semibold text-text-primary mb-2"
            >
              Ask a Question
            </label>
            <div className="flex gap-2">
              <input
                id="student-question"
                type="text"
                required
                placeholder="Type your question..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
              />
              <button
                type="submit"
                disabled={submitting || !newQuestion.trim()}
                className="px-4 py-2 rounded-lg bg-teal text-white text-sm font-semibold hover:bg-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <PaperPlaneTilt size={16} />
                {submitting ? 'Sending...' : 'Ask'}
              </button>
            </div>
          </form>
        )}

        {/* Questions */}
        <div className="space-y-6">
          {/* Pending */}
          {pending.length > 0 && (
            <div>
              <h2 className="text-base font-heading font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Clock size={16} className="text-amber-500" />
                Waiting for Answer ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white rounded-xl border border-border p-4"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-text-primary">
                        {q.studentName}
                      </p>
                      <span className="text-xs text-text-secondary whitespace-nowrap">
                        {formatDate(q.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-text-primary">{q.question}</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                      <Circle size={10} weight="fill" />
                      Pending
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Answered / Transcript */}
          <div>
            <h2 className="text-base font-heading font-semibold text-text-primary mb-3 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" weight="fill" />
              {isEnded ? 'Transcript' : 'Answered'} ({answered.length})
            </h2>
            {answered.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-6 text-center text-text-secondary text-sm">
                {isEnded
                  ? 'No questions were answered in this session.'
                  : 'No answered questions yet. Check back soon!'}
              </div>
            ) : (
              <div className="space-y-3">
                {answered.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white rounded-xl border border-border p-4"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-text-primary">
                        {q.studentName}
                      </p>
                      <span className="text-xs text-text-secondary whitespace-nowrap">
                        {formatDate(q.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-text-primary mb-2">{q.question}</p>
                    <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                      <p className="text-sm text-green-900">{q.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {sessionQuestions.length === 0 && (
          <div className="bg-white rounded-xl border border-border p-8 text-center">
            <ChatCircleDots
              size={48}
              className="mx-auto text-text-secondary/40 mb-3"
            />
            <p className="text-text-secondary">No questions yet.</p>
            {!isEnded && (
              <p className="text-text-secondary text-sm mt-1">
                Be the first to ask a question!
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Sessions list view
  const upcoming = sessions.filter((s) => s.status !== 'ended');
  const past = sessions.filter((s) => s.status === 'ended');

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Office Hours
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Ask questions during live Q&amp;A sessions with your instructors
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-8 text-center">
          <ChatCircleDots
            size={48}
            className="mx-auto text-text-secondary/40 mb-3"
          />
          <p className="text-text-secondary">
            No office hours sessions available for your courses.
          </p>
        </div>
      ) : (
        <>
          {/* Upcoming / Live */}
          {upcoming.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-heading font-semibold text-text-primary mb-3">
                Upcoming &amp; Live
              </h2>
              <div className="space-y-3">
                {upcoming.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => openSession(s.id)}
                    className="w-full text-left bg-white rounded-xl border border-border p-4 hover:border-teal/40 hover:shadow-sm transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-text-primary truncate">
                            {s.title}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLES[s.status]}`}
                          >
                            {s.status === 'live' ? '● Live' : s.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-text-secondary">
                          <span className="flex items-center gap-1">
                            <CalendarBlank size={13} />
                            {formatDate(s.scheduledAt)}
                          </span>
                        </div>
                      </div>
                      <PaperPlaneTilt
                        size={20}
                        className="text-text-secondary/40 hidden sm:block"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Past sessions */}
          {past.length > 0 && (
            <div>
              <h2 className="text-lg font-heading font-semibold text-text-primary mb-3">
                Past Sessions (Transcripts)
              </h2>
              <div className="space-y-3">
                {past.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => openSession(s.id)}
                    className="w-full text-left bg-white rounded-xl border border-border p-4 hover:border-teal/40 hover:shadow-sm transition-all opacity-80"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-text-primary truncate">
                            {s.title}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLES[s.status]}`}
                          >
                            {s.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-text-secondary">
                          <span className="flex items-center gap-1">
                            <CalendarBlank size={13} />
                            {formatDate(s.scheduledAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
