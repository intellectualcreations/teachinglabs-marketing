// ── Session Tracking Store ─────────────────────────────
// In-memory session records with seed data for CEO dashboard

export interface SessionRecord {
  id: string
  userId: string
  userRole: 'student' | 'instructor' | 'admin'
  startedAt: string
  endedAt: string
  durationMinutes: number
  pagesVisited: string[]
}

export interface SessionStats {
  totalSessions: number
  totalHours: number
  avgSessionMinutes: number
  dailyActiveUsers: { date: string; count: number }[]
  peakHours: { hour: number; sessions: number }[]
  byRole: Record<string, { sessions: number; avgMinutes: number }>
}

// ── Seed Data ──────────────────────────────────────────

const sessionRecords: SessionRecord[] = []

function seedSessions() {
  const now = new Date()

  const userPool: { id: string; role: 'student' | 'instructor' | 'admin' }[] = [
    { id: 'demo-student', role: 'student' },
    { id: 'student-emma', role: 'student' },
    { id: 'student-liam', role: 'student' },
    { id: 'student-mia', role: 'student' },
    { id: 'student-noah', role: 'student' },
    { id: 'instructor-harper', role: 'instructor' },
    { id: 'instructor-park', role: 'instructor' },
    { id: 'instructor-torres', role: 'instructor' },
    { id: 'instructor-liu', role: 'instructor' },
    { id: 'instructor-sharma', role: 'instructor' },
    { id: 'instructor-chen', role: 'instructor' },
    { id: 'admin-dottie', role: 'admin' },
  ]

  const studentPages = [
    '/dashboard', '/courses', '/courses/algebra-1', '/courses/biology',
    '/lessons', '/quizzes', '/chat', '/study-groups', '/grades', '/profile',
  ]
  const instructorPages = [
    '/dashboard', '/courses', '/grading', '/analytics', '/students',
    '/assignments', '/lessons/create', '/quizzes/create', '/messages',
  ]
  const adminPages = [
    '/admin', '/admin/users', '/admin/courses', '/admin/analytics',
    '/admin/waitlist', '/admin/settings',
  ]

  let sessionId = 0

  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)

    // More sessions on weekdays
    const dayOfWeek = date.getDay()
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5
    const sessionsToday = isWeekday
      ? 4 + Math.floor(Math.random() * 5) // 4-8 on weekdays
      : 2 + Math.floor(Math.random() * 3) // 2-4 on weekends

    for (let i = 0; i < sessionsToday; i++) {
      const user = userPool[Math.floor(Math.random() * userPool.length)]

      // Realistic hours: students 15-22, instructors 7-18, admin 9-17
      let startHour: number
      if (user.role === 'student') {
        startHour = 15 + Math.floor(Math.random() * 7) // 3pm-10pm
      } else if (user.role === 'instructor') {
        startHour = 7 + Math.floor(Math.random() * 11) // 7am-6pm
      } else {
        startHour = 9 + Math.floor(Math.random() * 8) // 9am-5pm
      }

      const startMinute = Math.floor(Math.random() * 60)
      const startDate = new Date(date)
      startDate.setHours(startHour, startMinute, 0, 0)

      // Duration: students 5-35min, instructors 10-45min, admin 5-20min
      let durationMinutes: number
      if (user.role === 'student') {
        durationMinutes = 5 + Math.floor(Math.random() * 30)
      } else if (user.role === 'instructor') {
        durationMinutes = 10 + Math.floor(Math.random() * 35)
      } else {
        durationMinutes = 5 + Math.floor(Math.random() * 15)
      }

      const endDate = new Date(startDate.getTime() + durationMinutes * 60000)

      // Pages visited based on role
      const pagePool = user.role === 'student'
        ? studentPages
        : user.role === 'instructor'
          ? instructorPages
          : adminPages

      const pageCount = 2 + Math.floor(Math.random() * 4)
      const pagesVisited: string[] = []
      for (let p = 0; p < pageCount; p++) {
        pagesVisited.push(pagePool[Math.floor(Math.random() * pagePool.length)])
      }

      sessionRecords.push({
        id: `session_${++sessionId}`,
        userId: user.id,
        userRole: user.role,
        startedAt: startDate.toISOString(),
        endedAt: endDate.toISOString(),
        durationMinutes,
        pagesVisited,
      })
    }
  }
}

seedSessions()

// ── Public API ─────────────────────────────────────────

export function getAllSessions(): SessionRecord[] {
  return [...sessionRecords].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  )
}

export function getSessionStats(): SessionStats {
  const totalSessions = sessionRecords.length
  const totalMinutes = sessionRecords.reduce((sum, s) => sum + s.durationMinutes, 0)
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10
  const avgSessionMinutes = totalSessions > 0
    ? Math.round((totalMinutes / totalSessions) * 10) / 10
    : 0

  // Daily active users
  const dailyUsers = new Map<string, Set<string>>()
  for (const session of sessionRecords) {
    const dateKey = session.startedAt.slice(0, 10)
    if (!dailyUsers.has(dateKey)) dailyUsers.set(dateKey, new Set())
    dailyUsers.get(dateKey)!.add(session.userId)
  }
  const dailyActiveUsers = Array.from(dailyUsers.entries())
    .map(([date, users]) => ({ date, count: users.size }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Peak hours
  const hourCounts = new Map<number, number>()
  for (const session of sessionRecords) {
    const hour = new Date(session.startedAt).getHours()
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1)
  }
  const peakHours = Array.from(hourCounts.entries())
    .map(([hour, sessions]) => ({ hour, sessions }))
    .sort((a, b) => a.hour - b.hour)

  // By role
  const roleData = new Map<string, { sessions: number; totalMinutes: number }>()
  for (const session of sessionRecords) {
    const existing = roleData.get(session.userRole) || { sessions: 0, totalMinutes: 0 }
    existing.sessions++
    existing.totalMinutes += session.durationMinutes
    roleData.set(session.userRole, existing)
  }
  const byRole: Record<string, { sessions: number; avgMinutes: number }> = {}
  for (const [role, data] of roleData.entries()) {
    byRole[role] = {
      sessions: data.sessions,
      avgMinutes: Math.round((data.totalMinutes / data.sessions) * 10) / 10,
    }
  }

  return {
    totalSessions,
    totalHours,
    avgSessionMinutes,
    dailyActiveUsers,
    peakHours,
    byRole,
  }
}
