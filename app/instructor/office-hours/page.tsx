'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Clock,
  PlusCircle,
  ChatCircleDots,
  CheckCircle,
  Circle,
  Play,
  Stop,
  ArrowLeft,
  CalendarBlank,
  PaperPlaneTilt,
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

interface CourseOption {
  id: string;
  title: string;
  subject: string;
}

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  live: 'bg-green-100 text-green-800',
  ended: 'bg-gray-100 text-gray-600',
};

export default function InstructorOfficeHoursPage() {
  const [sessions, setSessions] = useState<OfficeHoursSession[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<QAQuestion[]>([]);
  const [sessionCourse, setSessionCourse] = useState<CourseOption | null>(null);
  const [sessionDetail, setSessionDetail] = useState<OfficeHoursSession | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCourseId, setFormCourseId] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Answer state
  const [answerText, setAnswerText] = useState<Record<string, string>>({});
  const [answering, setAnswering] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/office-hours');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Failed to load sessions', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    fetch('/api/instructor/courses')
      .then((r) => r.json())
      .then((d) => setCourses(d.courses || []))
      .catch(console.error);
  }, [fetchSessions]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim() || !formCourseId || !formDate) return;
    setFormSubmitting(true);
    try {
      const res = await fetch('/api/office-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: formCourseId,
          title: formTitle.trim(),
          scheduledAt: new Date(formDate).toISOString(),
        }),
      });
      if (res.ok) {
        setFormTitle('');
        setFormCourseId('');
        setFormDate('');
        setShowForm(false);
        fetchSessions();
      }
    } catch (err) {
      console.error('Failed to create session', err);
    } finally {
      setFormSubmitting(false);
    }
  }

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

  async function toggleStatus(session: OfficeHoursSession) {
    const nextStatus = session.status === 'scheduled' ? 'live' : 'ended';
    try {
      // Optimistic update
      setSessionDetail((s) => (s ? { ...s, status: nextStatus } : s));
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, status: nextStatus } : s)),
      );
      await fetch(`/api/office-hours/${session.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (err) {
      console.error('Failed to update status', err);
      fetchSessions();
    }
  }

  async function handleAnswer(questionId: string) {
    const answer = answerText[questionId]?.trim();
    if (!answer || !selectedSession) return;
    setAnswering(questionId);
    try {
      const res = await fetch(
        `/api/office-hours/${selectedSession}/questions/${questionId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answer }),
        },
      );
      if (res.ok) {
        const data = await res.json();
        setSessionQuestions((prev) =>
          prev.map((q) => (q.id === questionId ? data.question : q)),
        );
        setAnswerText((prev) => {
          const next = { ...prev };
          delete next[questionId];
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to answer question', err);
    } finally {
      setAnswering(null);
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
    const pending = sessionQuestions.filter((q) => q.status === 'pending');
    const answered = sessionQuestions.filter((q) => q.status === 'answered');

    return (
      <div>
        <button
          onClick={() => setSelectedSession(null)}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-teal mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to sessions
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
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[sessionDetail.status]}`}
            >
              {sessionDetail.status}
            </span>
            {sessionDetail.status !== 'ended' && (
              <button
                onClick={() => toggleStatus(sessionDetail)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
                  sessionDetail.status === 'scheduled'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {sessionDetail.status === 'scheduled' ? (
                  <>
                    <Play size={16} weight="fill" /> Go Live
                  </>
                ) : (
                  <>
                    <Stop size={16} weight="fill" /> End Session
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending questions */}
          <div>
            <h2 className="text-lg font-heading font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Circle size={18} className="text-amber-500" weight="fill" />
              Pending ({pending.length})
            </h2>
            {pending.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-6 text-center text-text-secondary text-sm">
                No pending questions
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white rounded-xl border border-border p-4"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-text-primary">
                        {q.studentName}
                      </p>
                      <span className="text-xs text-text-secondary whitespace-nowrap">
                        {formatDate(q.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-text-primary mb-3">{q.question}</p>
                    <div className="flex gap-2">
                      <label htmlFor={`answer-${q.id}`} className="sr-only">
                        Answer for {q.studentName}
                      </label>
                      <input
                        id={`answer-${q.id}`}
                        type="text"
                        placeholder="Type your answer..."
                        value={answerText[q.id] || ''}
                        onChange={(e) =>
                          setAnswerText((prev) => ({
                            ...prev,
                            [q.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAnswer(q.id);
                        }}
                        className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
                      />
                      <button
                        onClick={() => handleAnswer(q.id)}
                        disabled={answering === q.id || !answerText[q.id]?.trim()}
                        className="px-3 py-2 rounded-lg bg-teal text-white text-sm font-semibold hover:bg-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        aria-label={`Answer question from ${q.studentName}`}
                      >
                        <CheckCircle size={16} />
                        {answering === q.id ? 'Saving...' : 'Answer'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Answered questions */}
          <div>
            <h2 className="text-lg font-heading font-semibold text-text-primary mb-3 flex items-center gap-2">
              <CheckCircle size={18} className="text-green-600" weight="fill" />
              Answered ({answered.length})
            </h2>
            {answered.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-6 text-center text-text-secondary text-sm">
                No answered questions yet
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
      </div>
    );
  }

  // Sessions list view
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            Office Hours
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Schedule Q&amp;A sessions and answer student questions
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal text-white font-semibold text-sm hover:bg-teal/90 transition-colors"
        >
          <PlusCircle size={18} />
          {showForm ? 'Cancel' : 'Create Office Hours'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-xl border border-border p-5 mb-6 space-y-4"
        >
          <div>
            <label
              htmlFor="oh-title"
              className="block text-sm font-semibold text-text-primary mb-1"
            >
              Session Title
            </label>
            <input
              id="oh-title"
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Midterm Review Q&A"
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="oh-course"
                className="block text-sm font-semibold text-text-primary mb-1"
              >
                Course
              </label>
              <select
                id="oh-course"
                required
                value={formCourseId}
                onChange={(e) => setFormCourseId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 bg-white"
              >
                <option value="">Select a course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="oh-date"
                className="block text-sm font-semibold text-text-primary mb-1"
              >
                Date &amp; Time
              </label>
              <input
                id="oh-date"
                type="datetime-local"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2.5 rounded-lg bg-teal text-white font-semibold text-sm hover:bg-teal/90 transition-colors disabled:opacity-50"
            >
              {formSubmitting ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      )}

      {/* Sessions list */}
      {sessions.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-8 text-center">
          <ChatCircleDots size={48} className="mx-auto text-text-secondary/40 mb-3" />
          <p className="text-text-secondary">No office hours sessions yet.</p>
          <p className="text-text-secondary text-sm mt-1">
            Create one to start accepting student questions.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
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
                <PaperPlaneTilt
                  size={20}
                  className="text-text-secondary/40 hidden sm:block"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
