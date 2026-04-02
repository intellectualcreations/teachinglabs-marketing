'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CaretLeft,
  VideoCamera,
  Calendar,
  Clock,
  ArrowSquareOut,
} from '@phosphor-icons/react';

interface LiveSession {
  id: string;
  courseId: string;
  title: string;
  url: string;
  scheduledAt: string;
  duration: number;
}

export default function StudentLiveSessionsPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/courses/${courseId}/live-sessions`)
      .then((res) => res.json())
      .then((data) => setSessions(data.sessions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }

  function formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  function isHappeningSoon(dateStr: string): boolean {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    return diff > 0 && diff < 2 * 60 * 60 * 1000; // within 2 hours
  }

  function isPast(dateStr: string, duration: number): boolean {
    const end = new Date(new Date(dateStr).getTime() + duration * 60000);
    return end < new Date();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const upcoming = sessions.filter((s) => !isPast(s.scheduledAt, s.duration));
  const past = sessions.filter((s) => isPast(s.scheduledAt, s.duration));

  return (
    <div className="min-h-screen bg-warm-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/student/courses/${courseId}`}
            className="flex items-center gap-1 text-sm text-text-muted hover:text-teal transition-colors"
          >
            <CaretLeft size={16} weight="bold" />
            Back to Course
          </Link>
        </div>

        <h1 className="font-heading font-bold text-xl sm:text-2xl text-text-primary flex items-center gap-2 mb-6">
          <VideoCamera size={24} weight="fill" className="text-coral" />
          Live Sessions
        </h1>

        {/* Upcoming */}
        {upcoming.length > 0 ? (
          <div className="space-y-3 mb-8">
            <h2 className="text-xs font-bold text-teal uppercase tracking-wide mb-2">Upcoming</h2>
            {upcoming.map((session) => {
              const soon = isHappeningSoon(session.scheduledAt);
              return (
                <div
                  key={session.id}
                  className={`bg-card-bg border rounded-xl p-5 ${
                    soon ? 'border-coral shadow-md' : 'border-border'
                  }`}
                >
                  {soon && (
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-coral bg-coral/10 px-2.5 py-1 rounded-full mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
                      Starting Soon
                    </div>
                  )}
                  <h3 className="font-heading font-semibold text-base text-text-primary mb-2">
                    {session.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} weight="fill" className="text-text-muted" />
                      <span>{formatDate(session.scheduledAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} weight="fill" className="text-text-muted" />
                      <span>{formatTime(session.scheduledAt)} · {session.duration} min</span>
                    </div>
                  </div>
                  <a
                    href={session.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-heading text-sm font-bold bg-teal text-white px-5 py-2.5 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                  >
                    <ArrowSquareOut size={16} weight="bold" />
                    Join Session
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-card-bg border border-border rounded-xl p-10 text-center mb-8">
            <VideoCamera size={40} weight="fill" className="text-text-muted/30 mx-auto mb-3" />
            <p className="text-sm text-text-muted">No upcoming live sessions scheduled.</p>
          </div>
        )}

        {/* Past sessions */}
        {past.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">Past Sessions</h2>
            <div className="space-y-2">
              {past.map((session) => (
                <div
                  key={session.id}
                  className="bg-card-bg border border-border rounded-xl p-4 opacity-60"
                >
                  <h3 className="font-heading font-semibold text-sm text-text-primary mb-1">
                    {session.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span>{formatDate(session.scheduledAt)}</span>
                    <span>{formatTime(session.scheduledAt)}</span>
                    <span>{session.duration} min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
