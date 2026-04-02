'use client';

import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { Fire, ChartLineUp, BookOpenText, Trophy, SquaresFour } from '@phosphor-icons/react';

interface QuizScoreTrend {
  quizId: string;
  quizTitle: string;
  score: number;
  takenAt: string;
}

interface CourseProgress {
  courseId: string;
  courseTitle: string;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

interface StudentAnalytics {
  studentId: string;
  learningStreak: number;
  quizScoreTrends: QuizScoreTrend[];
  courseProgress: CourseProgress[];
}

declare const Chart: any;

export default function StudentAnalyticsPage() {
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);

  const quizChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<any[]>([]);

  useEffect(() => {
    fetch('/api/student/analytics')
      .then((r) => r.json())
      .then((data) => {
        setAnalytics(data.analytics);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!analytics || !chartReady) return;

    for (const c of chartInstances.current) c.destroy();
    chartInstances.current = [];

    // Quiz score trend line chart
    if (quizChartRef.current && analytics.quizScoreTrends.length > 0) {
      const ctx = quizChartRef.current.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: analytics.quizScoreTrends.map((t) => {
            const d = new Date(t.takenAt);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          }),
          datasets: [
            {
              label: 'Score',
              data: analytics.quizScoreTrends.map((t) => t.score),
              borderColor: '#0D9488',
              backgroundColor: 'rgba(13, 148, 136, 0.1)',
              fill: true,
              tension: 0.3,
              pointRadius: 4,
              pointBackgroundColor: '#0D9488',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, max: 100, ticks: { callback: (v: number) => v + '%' } },
            x: { ticks: { font: { size: 11 } } },
          },
        },
      });
      chartInstances.current.push(chart);
    }

    return () => {
      for (const c of chartInstances.current) c.destroy();
      chartInstances.current = [];
    };
  }, [analytics, chartReady]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-20 text-text-secondary">Failed to load analytics.</div>
    );
  }

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js"
        onReady={() => setChartReady(true)}
      />

      {/* Top nav bar */}
      <div className="sticky top-0 z-40 bg-warm-white border-b border-border px-4 py-2.5 flex items-center justify-between">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-teal text-white font-semibold text-sm hover:bg-teal/90 transition-colors"
        >
          <SquaresFour size={18} weight="fill" />
          Dashboard
        </Link>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-heading font-bold text-2xl text-text-primary flex items-center gap-2">
            <ChartLineUp size={28} weight="fill" className="text-teal" />
            My Analytics
          </h1>
          <p className="text-sm text-text-secondary mt-1">Track your learning progress and achievements</p>
        </div>

        {/* Learning streak */}
        <div className="bg-gradient-to-br from-coral/10 to-coral/5 border border-coral/20 rounded-xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-coral/20 flex items-center justify-center shrink-0">
            <Fire size={36} weight="fill" className="text-coral" />
          </div>
          <div>
            <div className="font-heading font-bold text-4xl text-text-primary">
              {analytics.learningStreak}
              <span className="text-lg font-medium text-text-secondary ml-2">
                {analytics.learningStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
            <p className="text-sm text-text-secondary mt-0.5">
              {analytics.learningStreak >= 7
                ? 'Amazing streak! Keep the momentum going!'
                : analytics.learningStreak >= 3
                ? "You're building a great habit!"
                : 'Start a learning streak by completing lessons daily!'}
            </p>
          </div>
        </div>

        {/* Quiz score trend */}
        <div className="bg-card-bg border border-border rounded-xl p-5">
          <h2 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2 mb-4">
            <Trophy size={22} weight="fill" className="text-teal" />
            Quiz Score Trend
          </h2>
          {analytics.quizScoreTrends.length > 0 ? (
            <div className="relative h-[280px]">
              <canvas ref={quizChartRef} />
            </div>
          ) : (
            <div className="text-center py-12 text-text-secondary">
              No quiz attempts yet. Take a quiz to see your progress!
            </div>
          )}
        </div>

        {/* Course completion progress */}
        <div className="bg-card-bg border border-border rounded-xl p-5">
          <h2 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2 mb-4">
            <BookOpenText size={22} weight="fill" className="text-teal" />
            Course Progress
          </h2>
          {analytics.courseProgress.length > 0 ? (
            <div className="space-y-4">
              {analytics.courseProgress.map((cp) => (
                <div key={cp.courseId}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-text-primary">{cp.courseTitle}</span>
                    <span className="text-sm font-semibold text-teal">{cp.percentage}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cp.percentage}%`,
                        backgroundColor: cp.percentage === 100 ? '#059669' : '#0D9488',
                      }}
                    />
                  </div>
                  <div className="text-xs text-text-secondary mt-1">
                    {cp.completedLessons} of {cp.totalLessons} lessons completed
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text-secondary">
              Enroll in courses to track your progress!
            </div>
          )}
        </div>
      </div>
    </>
  );
}
