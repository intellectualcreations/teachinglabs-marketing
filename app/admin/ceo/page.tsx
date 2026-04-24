'use client'

import { useEffect, useState, useRef } from 'react'
import Script from 'next/script'
import { authFetch } from '@/lib/api-fetch';

// ── Types ──────────────────────────────────────────────

interface DashboardData {
  signups: {
    totalUsers: number
    totalStudents: number
    totalInstructors: number
    totalAdmins: number
    enrollmentsPerDay: { date: string; count: number }[]
    proSubscribers: number
    freeUsers: number
    churnRate: number
  }
  engagement: {
    totalSessions: number
    totalHours: number
    avgSessionMinutes: number
    dailyActiveUsers: { date: string; count: number }[]
    peakHours: { hour: number; sessions: number }[]
    byRole: Record<string, { sessions: number; avgMinutes: number }>
    topCourses: { courseId: string; courseTitle: string; count: number }[]
    totalEnrollments: number
  }
  costs: {
    totalInputTokens: number
    totalOutputTokens: number
    totalCostCents: number
    byFeature: Record<string, { tokens: number; costCents: number }>
    byModel: Record<string, { tokens: number; costCents: number }>
    dailyTrend: { date: string; costCents: number; tokens: number }[]
    perUserAvgCostCents: number
    projectedMonthlyCostCents: number
  }
  feedback: {
    stats: {
      total: number
      byType: Record<string, number>
      bySentiment: Record<string, number>
      byStatus: Record<string, number>
      avgPerDay: number
    }
    recent: {
      id: string
      userName: string
      userRole: string
      type: string
      subject: string
      message: string
      sentiment: string
      status: string
      createdAt: string
    }[]
  }
  features: {
    requests: {
      id: string
      subject: string
      message: string
      userName: string
      userRole: string
      status: string
      votes: number
      createdAt: string
    }[]
    totalCount: number
  }
}

declare const Chart: any

// ── Helpers ────────────────────────────────────────────

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function sentimentColor(sentiment: string): string {
  switch (sentiment) {
    case 'positive': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'negative': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default: return 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300'
  }
}

function typeIcon(type: string): string {
  switch (type) {
    case 'bug': return '🐛'
    case 'feature': return '💡'
    case 'praise': return '⭐'
    default: return '💬'
  }
}

// ── Component ──────────────────────────────────────────

export default function CEODashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartReady, setChartReady] = useState(false)

  // Chart refs
  const growthChartRef = useRef<HTMLCanvasElement>(null)
  const sessionsChartRef = useRef<HTMLCanvasElement>(null)
  const featuresChartRef = useRef<HTMLCanvasElement>(null)
  const peakHoursChartRef = useRef<HTMLCanvasElement>(null)
  const modelCostChartRef = useRef<HTMLCanvasElement>(null)
  const featureCostChartRef = useRef<HTMLCanvasElement>(null)
  const costTrendChartRef = useRef<HTMLCanvasElement>(null)
  const chartInstances = useRef<any[]>([])

  useEffect(() => {
    authFetch('/api/admin/ceo-dashboard')
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!data || !chartReady) return

    // Clean up previous charts
    for (const c of chartInstances.current) c.destroy()
    chartInstances.current = []

    const gridColor = 'rgba(148, 163, 184, 0.1)'
    const tickColor = 'rgba(148, 163, 184, 0.6)'

    // 1. Growth Chart (signups over time)
    if (growthChartRef.current) {
      const ctx = growthChartRef.current.getContext('2d')
      const cumulativeData = data.signups.enrollmentsPerDay.reduce<number[]>((acc, item) => {
        const prev = acc.length > 0 ? acc[acc.length - 1] : 0
        acc.push(prev + item.count)
        return acc
      }, [])
      chartInstances.current.push(new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.signups.enrollmentsPerDay.map((t) => t.date.slice(5)),
          datasets: [
            {
              label: 'Daily Enrollments',
              data: data.signups.enrollmentsPerDay.map((t) => t.count),
              borderColor: '#0D9488',
              backgroundColor: 'rgba(13, 148, 136, 0.1)',
              fill: true,
              tension: 0.3,
              pointRadius: 1.5,
              borderWidth: 2,
            },
            {
              label: 'Cumulative',
              data: cumulativeData,
              borderColor: '#1E3A5F',
              borderDash: [5, 3],
              fill: false,
              tension: 0.3,
              pointRadius: 0,
              borderWidth: 1.5,
              yAxisID: 'y1',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: { legend: { display: true, labels: { color: tickColor, font: { size: 11 } } } },
          scales: {
            y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: tickColor, stepSize: 1 } },
            y1: { position: 'right', beginAtZero: true, grid: { display: false }, ticks: { color: tickColor } },
            x: { grid: { display: false }, ticks: { color: tickColor, maxTicksLimit: 10, font: { size: 11 } } },
          },
        },
      }))
    }

    // 2. Sessions per day
    if (sessionsChartRef.current) {
      const ctx = sessionsChartRef.current.getContext('2d')
      chartInstances.current.push(new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.engagement.dailyActiveUsers.map((d) => d.date.slice(5)),
          datasets: [{
            label: 'Active Users',
            data: data.engagement.dailyActiveUsers.map((d) => d.count),
            backgroundColor: 'rgba(13, 148, 136, 0.6)',
            borderColor: '#0D9488',
            borderWidth: 1,
            borderRadius: 4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: tickColor, stepSize: 1 } },
            x: { grid: { display: false }, ticks: { color: tickColor, maxTicksLimit: 10, font: { size: 11 } } },
          },
        },
      }))
    }

    // 3. Most-used features (top courses)
    if (featuresChartRef.current) {
      const ctx = featuresChartRef.current.getContext('2d')
      const topCourses = data.engagement.topCourses.slice(0, 6)
      chartInstances.current.push(new Chart(ctx, {
        type: 'bar',
        data: {
          labels: topCourses.map((c) => c.courseTitle.length > 20 ? c.courseTitle.slice(0, 18) + '…' : c.courseTitle),
          datasets: [{
            label: 'Enrollments',
            data: topCourses.map((c) => c.count),
            backgroundColor: ['#0D9488', '#1E3A5F', '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'],
            borderRadius: 6,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: tickColor } },
            y: { grid: { display: false }, ticks: { color: tickColor, font: { size: 11 } } },
          },
        },
      }))
    }

    // 4. Peak hours
    if (peakHoursChartRef.current) {
      const ctx = peakHoursChartRef.current.getContext('2d')
      const allHours = Array.from({ length: 24 }, (_, i) => {
        const match = data.engagement.peakHours.find((h) => h.hour === i)
        return { hour: i, sessions: match ? match.sessions : 0 }
      })
      chartInstances.current.push(new Chart(ctx, {
        type: 'bar',
        data: {
          labels: allHours.map((h) => `${h.hour}:00`),
          datasets: [{
            label: 'Sessions',
            data: allHours.map((h) => h.sessions),
            backgroundColor: allHours.map((h) =>
              h.sessions > 10 ? '#0D9488' : h.sessions > 5 ? 'rgba(13, 148, 136, 0.5)' : 'rgba(13, 148, 136, 0.2)'
            ),
            borderRadius: 3,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: tickColor } },
            x: { grid: { display: false }, ticks: { color: tickColor, font: { size: 10 }, maxRotation: 45 } },
          },
        },
      }))
    }

    // 5. Token usage by model (doughnut)
    if (modelCostChartRef.current) {
      const ctx = modelCostChartRef.current.getContext('2d')
      const models = Object.entries(data.costs.byModel)
      chartInstances.current.push(new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: models.map(([m]) => m),
          datasets: [{
            data: models.map(([, d]) => d.costCents),
            backgroundColor: ['#0D9488', '#1E3A5F', '#FF6B6B'],
            borderWidth: 0,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: tickColor, padding: 16, font: { size: 12 } } },
          },
        },
      }))
    }

    // 6. Cost per feature (bar)
    if (featureCostChartRef.current) {
      const ctx = featureCostChartRef.current.getContext('2d')
      const features = Object.entries(data.costs.byFeature)
      chartInstances.current.push(new Chart(ctx, {
        type: 'bar',
        data: {
          labels: features.map(([f]) => f.replace('-', ' ')),
          datasets: [{
            label: 'Cost ($)',
            data: features.map(([, d]) => d.costCents / 100),
            backgroundColor: ['#0D9488', '#1E3A5F', '#FF6B6B', '#4ECDC4', '#FFE66D'],
            borderRadius: 6,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: tickColor, callback: (v: number) => `$${v}` } },
            x: { grid: { display: false }, ticks: { color: tickColor, font: { size: 11 } } },
          },
        },
      }))
    }

    // 7. Cost trend over time
    if (costTrendChartRef.current) {
      const ctx = costTrendChartRef.current.getContext('2d')
      const projected30 = data.costs.projectedMonthlyCostCents / 100
      chartInstances.current.push(new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.costs.dailyTrend.map((d) => d.date.slice(5)),
          datasets: [
            {
              label: 'Daily Cost ($)',
              data: data.costs.dailyTrend.map((d) => d.costCents / 100),
              borderColor: '#FF6B6B',
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              fill: true,
              tension: 0.3,
              pointRadius: 1.5,
              borderWidth: 2,
            },
            {
              label: `Alert ($${(projected30 * 1.2).toFixed(0)}/mo)`,
              data: data.costs.dailyTrend.map(() => (projected30 * 1.2) / 30),
              borderColor: 'rgba(255, 107, 107, 0.4)',
              borderDash: [8, 4],
              pointRadius: 0,
              borderWidth: 1,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: true, labels: { color: tickColor, font: { size: 11 } } } },
          scales: {
            y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: tickColor, callback: (v: number) => `$${v}` } },
            x: { grid: { display: false }, ticks: { color: tickColor, maxTicksLimit: 10, font: { size: 11 } } },
          },
        },
      }))
    }

    return () => {
      for (const c of chartInstances.current) c.destroy()
      chartInstances.current = []
    }
  }, [data, chartReady])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal border-t-transparent" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-text-muted">
        Failed to load dashboard data.
      </div>
    )
  }

  const costPerUser = data.signups.totalUsers > 0
    ? data.costs.totalCostCents / data.signups.totalUsers
    : 0

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"
        strategy="beforeInteractive"
        onReady={() => setChartReady(true)}
        onLoad={() => setChartReady(true)}
      />

      <div className="space-y-6 pb-12">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">CEO Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">Platform health at a glance. Last 30 days.</p>
        </div>

        {/* ── KPI Cards ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Total Users"
            value={data.signups.totalUsers.toString()}
            sub={`${data.signups.proSubscribers} Pro · ${data.signups.freeUsers} Free`}
            accent="teal"
          />
          <KPICard
            label="Active Users (DAU)"
            value={data.engagement.dailyActiveUsers.length > 0
              ? data.engagement.dailyActiveUsers[data.engagement.dailyActiveUsers.length - 1].count.toString()
              : '0'}
            sub={`${data.engagement.totalSessions} sessions · ${data.engagement.totalHours}h total`}
            accent="navy"
          />
          <KPICard
            label="Avg Session"
            value={`${data.engagement.avgSessionMinutes}m`}
            sub={Object.entries(data.engagement.byRole).map(([r, d]) => `${r}: ${d.avgMinutes}m`).join(' · ')}
            accent="teal"
          />
          <KPICard
            label="AI Token Cost"
            value={formatCurrency(data.costs.totalCostCents)}
            sub={`Projected: ${formatCurrency(data.costs.projectedMonthlyCostCents)}/mo`}
            accent="coral"
          />
        </div>

        {/* ── Growth Chart ──────────────────────────────── */}
        <div className="bg-card-bg border border-border rounded-xl p-5">
          <h2 className="font-heading font-semibold text-text-primary mb-4">Enrollment Growth (30 days)</h2>
          <div className="h-64">
            <canvas ref={growthChartRef} />
          </div>
        </div>

        {/* ── Engagement Section ────────────────────────── */}
        <div>
          <h2 className="font-heading font-semibold text-text-primary mb-4 text-lg">Engagement</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card-bg border border-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-text-muted mb-3">Daily Active Users</h3>
              <div className="h-48">
                <canvas ref={sessionsChartRef} />
              </div>
            </div>
            <div className="bg-card-bg border border-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-text-muted mb-3">Top Courses by Enrollment</h3>
              <div className="h-48">
                <canvas ref={featuresChartRef} />
              </div>
            </div>
            <div className="bg-card-bg border border-border rounded-xl p-5 lg:col-span-2">
              <h3 className="text-sm font-medium text-text-muted mb-3">Peak Usage Hours</h3>
              <div className="h-48">
                <canvas ref={peakHoursChartRef} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Cost Management ───────────────────────────── */}
        <div>
          <h2 className="font-heading font-semibold text-text-primary mb-4 text-lg">Cost Management</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <MiniStat label="Cost per User" value={formatCurrency(costPerUser)} />
            <MiniStat label="30-day Burn" value={formatCurrency(data.costs.totalCostCents)} />
            <MiniStat label="Projected Monthly" value={formatCurrency(data.costs.projectedMonthlyCostCents)} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-card-bg border border-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-text-muted mb-3">Cost by Model</h3>
              <div className="h-56">
                <canvas ref={modelCostChartRef} />
              </div>
            </div>
            <div className="bg-card-bg border border-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-text-muted mb-3">Cost by Feature</h3>
              <div className="h-56">
                <canvas ref={featureCostChartRef} />
              </div>
            </div>
            <div className="bg-card-bg border border-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-text-muted mb-3">Daily Cost Trend</h3>
              <div className="h-56">
                <canvas ref={costTrendChartRef} />
              </div>
            </div>
          </div>

          {/* Projection table */}
          <div className="bg-card-bg border border-border rounded-xl p-5 mt-4">
            <h3 className="text-sm font-medium text-text-muted mb-3">Burn Rate Projections</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-text-muted mb-1">30 days</div>
                <div className="text-lg font-semibold text-text-primary">{formatCurrency(data.costs.projectedMonthlyCostCents)}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted mb-1">60 days</div>
                <div className="text-lg font-semibold text-text-primary">{formatCurrency(data.costs.projectedMonthlyCostCents * 2)}</div>
              </div>
              <div>
                <div className="text-xs text-text-muted mb-1">90 days</div>
                <div className="text-lg font-semibold text-text-primary">{formatCurrency(data.costs.projectedMonthlyCostCents * 3)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Feedback & Requests ───────────────────────── */}
        <div>
          <h2 className="font-heading font-semibold text-text-primary mb-4 text-lg">Feedback & Requests</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
            <MiniStat label="Total Feedback" value={data.feedback.stats.total.toString()} />
            <MiniStat label="Bugs" value={data.feedback.stats.byType.bug?.toString() || '0'} />
            <MiniStat label="Feature Requests" value={data.feedback.stats.byType.feature?.toString() || '0'} />
            <MiniStat label="Avg/Day" value={data.feedback.stats.avgPerDay.toString()} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent feedback */}
            <div className="bg-card-bg border border-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-text-muted mb-3">Recent Feedback</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {data.feedback.recent.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-surface/50">
                    <span className="text-lg">{typeIcon(item.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-text-primary">{item.subject}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${sentimentColor(item.sentiment)}`}>
                          {item.sentiment}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{item.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-text-muted">{item.userName}</span>
                        <span className="text-[11px] text-text-muted">·</span>
                        <span className="text-[11px] text-text-muted">{item.userRole}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature requests */}
            <div className="bg-card-bg border border-border rounded-xl p-5">
              <h3 className="text-sm font-medium text-text-muted mb-3">Top Feature Requests</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {data.features.requests.map((req) => (
                  <div key={req.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface/50">
                    <div className="flex flex-col items-center min-w-[40px]">
                      <span className="text-lg font-bold text-teal">{req.votes}</span>
                      <span className="text-[10px] text-text-muted">votes</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-text-primary">{req.subject}</div>
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{req.message}</p>
                      <span className="text-[11px] text-text-muted">{req.userName} · {req.userRole}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      req.status === 'new' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sentiment breakdown */}
          <div className="bg-card-bg border border-border rounded-xl p-5 mt-4">
            <h3 className="text-sm font-medium text-text-muted mb-3">Sentiment Breakdown</h3>
            <div className="flex gap-4">
              {Object.entries(data.feedback.stats.bySentiment).map(([sentiment, count]) => {
                const total = data.feedback.stats.total
                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                  <div key={sentiment} className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm capitalize text-text-primary">{sentiment}</span>
                      <span className="text-sm font-semibold text-text-primary">{pct}%</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          sentiment === 'positive' ? 'bg-emerald-500' : sentiment === 'negative' ? 'bg-red-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Investor Summary Card ─────────────────────── */}
        <div className="bg-gradient-to-br from-navy to-navy/90 rounded-xl p-6 text-white">
          <h2 className="font-heading font-bold text-lg mb-1">Investor Summary</h2>
          <p className="text-white/60 text-sm mb-5">Key metrics snapshot. Last 30 days.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <InvestorMetric label="Total Users" value={data.signups.totalUsers.toString()} />
            <InvestorMetric label="Pro Conversion" value={`${data.signups.totalUsers > 0 ? Math.round((data.signups.proSubscribers / data.signups.totalUsers) * 100) : 0}%`} />
            <InvestorMetric label="Total Sessions" value={data.engagement.totalSessions.toString()} />
            <InvestorMetric label="Avg Session" value={`${data.engagement.avgSessionMinutes}m`} />
            <InvestorMetric label="Total Enrollments" value={data.engagement.totalEnrollments.toString()} />
            <InvestorMetric label="Churn Rate" value={`${data.signups.churnRate}%`} />
            <InvestorMetric label="Cost/User" value={formatCurrency(costPerUser)} />
            <InvestorMetric label="Monthly Burn" value={formatCurrency(data.costs.projectedMonthlyCostCents)} />
          </div>

          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-white/50 text-xs mb-0.5">Token Efficiency</div>
                <div className="font-medium">{formatNumber(data.costs.totalInputTokens + data.costs.totalOutputTokens)} tokens</div>
              </div>
              <div>
                <div className="text-white/50 text-xs mb-0.5">Feedback Score</div>
                <div className="font-medium">{data.feedback.stats.bySentiment.positive || 0} positive / {data.feedback.stats.total} total</div>
              </div>
              <div>
                <div className="text-white/50 text-xs mb-0.5">Platform Hours</div>
                <div className="font-medium">{data.engagement.totalHours}h logged</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Sub-components ─────────────────────────────────────

function KPICard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent: 'teal' | 'navy' | 'coral' }) {
  const accentClasses = {
    teal: 'border-l-teal',
    navy: 'border-l-navy',
    coral: 'border-l-coral',
  }
  return (
    <div className={`bg-card-bg border border-border rounded-xl p-4 border-l-4 ${accentClasses[accent]}`}>
      <div className="text-xs text-text-muted font-medium mb-1">{label}</div>
      <div className="text-2xl font-heading font-bold text-text-primary">{value}</div>
      <div className="text-[11px] text-text-muted mt-1">{sub}</div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card-bg border border-border rounded-xl p-4 text-center">
      <div className="text-xs text-text-muted mb-1">{label}</div>
      <div className="text-xl font-heading font-bold text-text-primary">{value}</div>
    </div>
  )
}

function InvestorMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-white/50 text-xs mb-0.5">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  )
}
