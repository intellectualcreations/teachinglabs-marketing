'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import RecordButton from '@/components/recording/RecordButton';

interface LiveSession {
  id: string;
  courseId: string;
  title: string;
  url: string;
  scheduledAt: string;
  duration: number;
}

interface LessonOption {
  id: string;
  title: string;
  moduleTitle: string;
}

export default function InstructorLiveSessionsPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [recordLessonMap, setRecordLessonMap] = useState<Record<string, string>>({});

  // Form state
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('45');

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/live-sessions`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const fetchLessons = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/lessons`);
      if (res.ok) {
        const data = await res.json();
        setLessons(data.lessons || []);
      }
    } catch {
      // silent
    }
  }, [courseId]);

  useEffect(() => {
    fetchSessions();
    fetchLessons();
  }, [fetchSessions, fetchLessons]);

  async function handleCreate() {
    if (!title.trim() || !url.trim() || !date || !time || submitting) return;
    setSubmitting(true);

    const scheduledAt = new Date(`${date}T${time}`).toISOString();

    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/live-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          url: url.trim(),
          scheduledAt,
          duration: parseInt(duration, 10),
        }),
      });
      if (res.ok) {
        setTitle('');
        setUrl('');
        setDate('');
        setTime('');
        setDuration('45');
        setShowForm(false);
        await fetchSessions();
      }
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  function isPast(dateStr: string, dur: number): boolean {
    const end = new Date(new Date(dateStr).getTime() + dur * 60000);
    return end < new Date();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href={`/instructor/courses/${courseId}`}
          className="text-sm text-text-muted hover:text-teal transition-colors inline-flex items-center gap-1"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Course
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Live Sessions
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 font-heading text-sm font-bold bg-teal text-white px-4 py-2 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
        >
          {showForm ? 'Cancel' : '+ Schedule Session'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-card-bg border border-border rounded-xl p-6 mb-6">
          <h2 className="font-heading font-semibold text-base text-text-primary mb-4">Schedule a Live Session</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Session Title</label>
              <input
                type="text"
                placeholder="e.g., Q&A Review Session"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-warm-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Meeting URL</label>
              <input
                type="url"
                placeholder="https://zoom.us/j/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-warm-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-warm-white text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-text-secondary mb-1">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-warm-white text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                />
              </div>
              <div className="w-24">
                <label className="block text-xs font-medium text-text-secondary mb-1">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-warm-white text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                >
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                  <option value="90">90 min</option>
                </select>
              </div>
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={!title.trim() || !url.trim() || !date || !time || submitting}
            className="inline-flex items-center gap-2 font-heading text-sm font-bold bg-teal text-white px-5 py-2.5 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Scheduling...' : 'Schedule Session'}
          </button>
        </div>
      )}

      {/* Sessions list */}
      {sessions.length === 0 ? (
        <div className="bg-card-bg border border-border rounded-xl p-10 text-center">
          <p className="text-sm text-text-muted">No live sessions scheduled yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const past = isPast(session.scheduledAt, session.duration);
            return (
              <div
                key={session.id}
                className={`bg-card-bg border border-border rounded-xl p-5 ${past ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="font-heading font-semibold text-sm text-text-primary mb-1">
                      {session.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <span>{formatDate(session.scheduledAt)}</span>
                      <span>{formatTime(session.scheduledAt)}</span>
                      <span>{session.duration} min</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      past ? 'bg-border text-text-muted' : 'bg-teal/10 text-teal'
                    }`}>
                      {past ? 'Ended' : 'Upcoming'}
                    </span>
                    {!past && (
                      <a
                        href={session.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-teal hover:text-navy transition-colors"
                      >
                        Open Link →
                      </a>
                    )}
                  </div>
                </div>
                {/* Recording controls */}
                {!past && (
                  <div className="mt-3 pt-3 border-t border-border flex items-center gap-3 flex-wrap">
                    <select
                      value={recordLessonMap[session.id] || ''}
                      onChange={(e) => setRecordLessonMap((prev) => ({ ...prev, [session.id]: e.target.value }))}
                      className="text-xs px-3 py-2 border border-border rounded-lg bg-warm-white text-text-primary focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
                    >
                      <option value="">Link to lesson...</option>
                      {lessons.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.moduleTitle} — {l.title}
                        </option>
                      ))}
                    </select>
                    {recordLessonMap[session.id] && (
                      <RecordButton
                        sessionId={session.id}
                        lessonId={recordLessonMap[session.id]}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
