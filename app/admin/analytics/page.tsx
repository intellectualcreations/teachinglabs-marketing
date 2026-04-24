'use client';

import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';
import { ChartLineUp, ChartBar, Users, CurrencyDollar, BookOpenText } from '@phosphor-icons/react';
import { authFetch } from '@/lib/api-fetch';

interface EnrollmentTrend {
  date: string;
  count: number;
}

interface AdminAnalytics {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalAdmins: number;
  mrrCents: number;
  totalEnrollments: number;
  enrollmentsPerDay: EnrollmentTrend[];
  topCoursesByEnrollment: { courseId: string; courseTitle: string; count: number }[];
  proSubscribers: number;
  freeUsers: number;
  churnRate: number;
  totalRevenueCents: number;
}

declare const Chart: any;

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);

  const enrollmentChartRef = useRef<HTMLCanvasElement>(null);
  const topCoursesChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<any[]>([]);

  useEffect(() => {
    authFetch('/api/admin/analytics')
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

    // Enrollments per day line chart
    if (enrollmentChartRef.current) {
      const ctx = enrollmentChartRef.current.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: analytics.enrollmentsPerDay.map((t) => t.date.slice(5)),
          datasets: [
            {
              label: 'Enrollments',
              data: analytics.enrollmentsPerDay.map((t) => t.count),
              borderColor: '#0D9488',
              backgroundColor: 'rgba(13, 148, 136, 0.1)',
              fill: true,
              tension: 0.3,
              pointRadius: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } },
            x: { ticks: { maxTicksLimit: 10, font: { size: 11 } } },
          },
        },
      });
      chartInstances.current.push(chart);
    }

    // Top courses bar chart
    if (topCoursesChartRef.current && analytics.topCoursesByEnrollment.length > 0) {
      const ctx = topCoursesChartRef.current.getContext('2d');
      const colors = ['#0D9488', '#F97066', '#1E293B', '#059669', '#D4A843', '#E8836B', '#3B8E8F', '#2A4A6F'];
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: analytics.topCoursesByEnrollment.map((c) => c.courseTitle),
          datasets: [
            {
              label: 'Enrollments',
              data: analytics.topCoursesByEnrollment.map((c) => c.count),
              backgroundColor: analytics.topCoursesByEnrollment.map(
                (_, i) => colors[i % colors.length]
              ),
              borderRadius: 6,
              maxBarThickness: 48,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, ticks: { stepSize: 1 } },
            y: { ticks: { font: { size: 11 } } },
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
        <div className="w-8 h-8 border-4 border-coral border-t-transparent rounded-full animate-spin" />
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

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-heading font-bold text-2xl text-text-primary flex items-center gap-2">
            <ChartLineUp size={28} weight="fill" className="text-coral" />
            Platform Analytics
          </h1>
          <p className="text-sm text-text-secondary mt-1">Overview of platform health and growth metrics</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card-bg border border-border rounded-xl p-4 text-center">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 bg-navy">
              <Users size={18} weight="fill" color="white" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">{analytics.totalUsers}</div>
            <div className="text-xs text-text-secondary font-medium mt-0.5">Total Users</div>
          </div>

          <div className="bg-card-bg border border-border rounded-xl p-4 text-center">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 bg-coral">
              <CurrencyDollar size={18} weight="fill" color="white" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">
              ${(analytics.mrrCents / 100).toFixed(0)}
            </div>
            <div className="text-xs text-text-secondary font-medium mt-0.5">MRR</div>
          </div>

          <div className="bg-card-bg border border-border rounded-xl p-4 text-center">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 bg-teal">
              <BookOpenText size={18} weight="fill" color="white" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">{analytics.totalEnrollments}</div>
            <div className="text-xs text-text-secondary font-medium mt-0.5">Total Enrollments</div>
          </div>

          <div className="bg-card-bg border border-border rounded-xl p-4 text-center">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 bg-navy">
              <Users size={18} weight="fill" color="white" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">
              {analytics.totalStudents} / {analytics.totalInstructors}
            </div>
            <div className="text-xs text-text-secondary font-medium mt-0.5">Students / Instructors</div>
          </div>
        </div>

        {/* Subscription metrics (FLU-224) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card-bg border border-border rounded-xl p-4 text-center">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 bg-coral">
              <CurrencyDollar size={18} weight="fill" color="white" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">
              ${(analytics.totalRevenueCents / 100).toFixed(0)}
            </div>
            <div className="text-xs text-text-secondary font-medium mt-0.5">Total Revenue</div>
          </div>

          <div className="bg-card-bg border border-border rounded-xl p-4 text-center">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 bg-teal">
              <Users size={18} weight="fill" color="white" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">
              {analytics.proSubscribers}
            </div>
            <div className="text-xs text-text-secondary font-medium mt-0.5">Pro Subscribers</div>
          </div>

          <div className="bg-card-bg border border-border rounded-xl p-4 text-center">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 bg-navy">
              <Users size={18} weight="fill" color="white" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">
              {analytics.freeUsers}
            </div>
            <div className="text-xs text-text-secondary font-medium mt-0.5">Free Tier Users</div>
          </div>

          <div className="bg-card-bg border border-border rounded-xl p-4 text-center">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 bg-gold">
              <ChartBar size={18} weight="fill" color="white" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">
              {analytics.churnRate.toFixed(1)}%
            </div>
            <div className="text-xs text-text-secondary font-medium mt-0.5">Churn Rate</div>
          </div>
        </div>

        {/* Enrollments per day chart */}
        <div className="bg-card-bg border border-border rounded-xl p-5">
          <h2 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2 mb-4">
            <ChartLineUp size={22} weight="fill" className="text-teal" />
            Enrollments per Day (Last 30 Days)
          </h2>
          <div className="relative h-[280px]">
            <canvas ref={enrollmentChartRef} />
          </div>
        </div>

        {/* Top courses by enrollment */}
        <div className="bg-card-bg border border-border rounded-xl p-5">
          <h2 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2 mb-4">
            <ChartBar size={22} weight="fill" className="text-coral" />
            Top Courses by Enrollment
          </h2>
          <div className="relative h-[320px]">
            <canvas ref={topCoursesChartRef} />
          </div>
        </div>
      </div>
    </>
  );
}
