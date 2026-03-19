'use client';

import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';
import { ChartLineUp, ChartBar, CurrencyDollar, Users, DownloadSimple, Wallet, Clock, CheckCircle } from '@phosphor-icons/react';

interface EnrollmentTrend {
  date: string;
  count: number;
}

interface CourseCompletionRate {
  courseId: string;
  courseTitle: string;
  totalEnrolled: number;
  completedCount: number;
  rate: number;
}

interface CourseRevenue {
  courseId: string;
  courseTitle: string;
  totalCents: number;
  enrollments: number;
}

interface InstructorAnalytics {
  instructorId: string;
  enrollmentTrends: EnrollmentTrend[];
  completionRates: CourseCompletionRate[];
  revenuePerCourse: CourseRevenue[];
  totalStudents: number;
  totalRevenueCents: number;
}

interface PayoutRecord {
  id: string;
  amount: number;
  status: 'pending' | 'paid' | 'processing';
  periodStart: string;
  periodEnd: string;
  paidAt: string | null;
  note: string | null;
  createdAt: string;
}

interface PayoutSummary {
  totalEarned: number;
  totalPaid: number;
  pending: number;
  payoutCount: number;
}

declare const Chart: any;

export default function InstructorAnalyticsPage() {
  const [analytics, setAnalytics] = useState<InstructorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [payoutSummary, setPayoutSummary] = useState<PayoutSummary | null>(null);

  const enrollmentChartRef = useRef<HTMLCanvasElement>(null);
  const completionChartRef = useRef<HTMLCanvasElement>(null);
  const revenueChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<any[]>([]);

  useEffect(() => {
    fetch('/api/instructor/analytics')
      .then((r) => r.json())
      .then((data) => {
        setAnalytics(data.analytics);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch payout history (FLU-242)
    fetch('/api/instructor/payouts')
      .then((r) => r.json())
      .then((data) => {
        setPayouts(data.payouts || []);
        setPayoutSummary(data.summary || null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!analytics || !chartReady) return;

    // Destroy previous chart instances
    for (const c of chartInstances.current) c.destroy();
    chartInstances.current = [];

    // Enrollment trend line chart
    if (enrollmentChartRef.current) {
      const ctx = enrollmentChartRef.current.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: analytics.enrollmentTrends.map((t) => t.date.slice(5)), // MM-DD
          datasets: [
            {
              label: 'Enrollments',
              data: analytics.enrollmentTrends.map((t) => t.count),
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

    // Completion rate bar chart
    if (completionChartRef.current) {
      const ctx = completionChartRef.current.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: analytics.completionRates.map((c) => c.courseTitle),
          datasets: [
            {
              label: 'Completion Rate %',
              data: analytics.completionRates.map((c) => c.rate),
              backgroundColor: '#0D9488',
              borderRadius: 6,
              maxBarThickness: 48,
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

    // Revenue bar chart
    if (revenueChartRef.current) {
      const ctx = revenueChartRef.current.getContext('2d');
      const chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: analytics.revenuePerCourse.map((r) => r.courseTitle),
          datasets: [
            {
              label: 'Revenue ($)',
              data: analytics.revenuePerCourse.map((r) => r.totalCents / 100),
              backgroundColor: '#F97066',
              borderRadius: 6,
              maxBarThickness: 48,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { callback: (v: number) => '$' + v } },
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

  function handleExportCSV() {
    const link = document.createElement('a');
    link.href = '/api/instructor/analytics/export';
    link.download = 'earnings.csv';
    link.click();
  }

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

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading font-bold text-2xl text-text-primary flex items-center gap-2">
              <ChartLineUp size={28} weight="fill" className="text-teal" />
              Analytics
            </h1>
            <p className="text-sm text-text-secondary mt-1">Track your course performance and earnings</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal text-white rounded-lg text-sm font-semibold hover:bg-teal/90 transition-colors"
          >
            <DownloadSimple size={18} weight="bold" />
            Export Earnings CSV
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card-bg border border-border rounded-xl p-4 text-center">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 bg-teal">
              <Users size={18} weight="fill" color="white" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">{analytics.totalStudents}</div>
            <div className="text-xs text-text-secondary font-medium mt-0.5">Total Students</div>
          </div>
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
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 bg-navy">
              <ChartBar size={18} weight="fill" color="white" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">{analytics.completionRates.length}</div>
            <div className="text-xs text-text-secondary font-medium mt-0.5">Courses</div>
          </div>
          <div className="bg-card-bg border border-border rounded-xl p-4 text-center">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 bg-teal">
              <ChartLineUp size={18} weight="fill" color="white" />
            </div>
            <div className="font-heading font-bold text-2xl text-text-primary">
              {analytics.enrollmentTrends.reduce((s, t) => s + t.count, 0)}
            </div>
            <div className="text-xs text-text-secondary font-medium mt-0.5">Enrollments (30d)</div>
          </div>
        </div>

        {/* Enrollment trend chart */}
        <div className="bg-card-bg border border-border rounded-xl p-5">
          <h2 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2 mb-4">
            <ChartLineUp size={22} weight="fill" className="text-teal" />
            Enrollment Trends (Last 30 Days)
          </h2>
          <div className="relative h-[280px]">
            <canvas ref={enrollmentChartRef} />
          </div>
        </div>

        {/* Two-column charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card-bg border border-border rounded-xl p-5">
            <h2 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2 mb-4">
              <ChartBar size={22} weight="fill" className="text-teal" />
              Course Completion Rates
            </h2>
            <div className="relative h-[260px]">
              <canvas ref={completionChartRef} />
            </div>
          </div>

          <div className="bg-card-bg border border-border rounded-xl p-5">
            <h2 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2 mb-4">
              <CurrencyDollar size={22} weight="fill" className="text-coral" />
              Revenue per Course
            </h2>
            <div className="relative h-[260px]">
              <canvas ref={revenueChartRef} />
            </div>
          </div>
        </div>

        {/* Payout Summary Cards (FLU-242) */}
        {payoutSummary && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-card-bg border border-border rounded-xl p-4 text-center">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 bg-teal">
                <Wallet size={18} weight="fill" color="white" />
              </div>
              <div className="font-heading font-bold text-2xl text-text-primary">
                ${(payoutSummary.totalEarned / 100).toFixed(0)}
              </div>
              <div className="text-xs text-text-secondary font-medium mt-0.5">Total Earned</div>
            </div>
            <div className="bg-card-bg border border-border rounded-xl p-4 text-center">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 bg-coral">
                <Clock size={18} weight="fill" color="white" />
              </div>
              <div className="font-heading font-bold text-2xl text-text-primary">
                ${(payoutSummary.pending / 100).toFixed(0)}
              </div>
              <div className="text-xs text-text-secondary font-medium mt-0.5">Pending Payout</div>
            </div>
            <div className="bg-card-bg border border-border rounded-xl p-4 text-center">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 bg-navy">
                <CheckCircle size={18} weight="fill" color="white" />
              </div>
              <div className="font-heading font-bold text-2xl text-text-primary">
                ${(payoutSummary.totalPaid / 100).toFixed(0)}
              </div>
              <div className="text-xs text-text-secondary font-medium mt-0.5">Paid to Date</div>
            </div>
          </div>
        )}

        {/* Payout History Table (FLU-242) */}
        {payouts.length > 0 && (
          <div className="bg-card-bg border border-border rounded-xl p-5">
            <h2 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2 mb-4">
              <Wallet size={22} weight="fill" className="text-teal" />
              Payout History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-text-secondary">
                    <th className="text-left py-3 px-2 font-medium">Period</th>
                    <th className="text-right py-3 px-2 font-medium">Amount</th>
                    <th className="text-center py-3 px-2 font-medium">Status</th>
                    <th className="text-right py-3 px-2 font-medium">Paid On</th>
                    <th className="text-left py-3 px-2 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="py-3 px-2 text-text-primary">
                        {new Date(p.periodStart).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        {' — '}
                        {new Date(p.periodEnd).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-text-primary">
                        ${(p.amount / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            p.status === 'paid'
                              ? 'bg-teal/10 text-teal'
                              : p.status === 'pending'
                                ? 'bg-gold/10 text-gold'
                                : 'bg-navy/10 text-navy'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-text-secondary">
                        {p.paidAt
                          ? new Date(p.paidAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="py-3 px-2 text-text-muted text-xs">
                        {p.note || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Earnings table */}
        <div className="bg-card-bg border border-border rounded-xl p-5">
          <h2 className="font-heading font-bold text-lg text-text-primary mb-4">Earnings Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-secondary">
                  <th className="text-left py-3 px-2 font-medium">Course</th>
                  <th className="text-right py-3 px-2 font-medium">Enrollments</th>
                  <th className="text-right py-3 px-2 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics.revenuePerCourse.map((r) => (
                  <tr key={r.courseId} className="border-b border-border/50">
                    <td className="py-3 px-2 font-medium text-text-primary">{r.courseTitle}</td>
                    <td className="py-3 px-2 text-right text-text-secondary">{r.enrollments}</td>
                    <td className="py-3 px-2 text-right font-semibold text-text-primary">
                      ${(r.totalCents / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border">
                  <td className="py-3 px-2 font-bold text-text-primary">Total</td>
                  <td className="py-3 px-2" />
                  <td className="py-3 px-2 text-right font-bold text-teal">
                    ${(analytics.totalRevenueCents / 100).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
