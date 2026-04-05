// ── Feedback Store ─────────────────────────────────────
// In-memory feedback items with seed data for CEO dashboard

export type FeedbackType = 'bug' | 'feature' | 'general' | 'praise'
export type FeedbackSentiment = 'positive' | 'neutral' | 'negative'
export type FeedbackStatus = 'new' | 'reviewed' | 'resolved'

export interface FeedbackItem {
  id: string
  userId: string
  userName: string
  userRole: 'student' | 'instructor' | 'admin' | 'parent'
  type: FeedbackType
  subject: string
  message: string
  sentiment: FeedbackSentiment
  status: FeedbackStatus
  createdAt: string
}

export interface FeedbackStats {
  total: number
  byType: Record<FeedbackType, number>
  bySentiment: Record<FeedbackSentiment, number>
  byStatus: Record<FeedbackStatus, number>
  avgPerDay: number
}

// ── Seed Data ──────────────────────────────────────────

const feedbackItems: FeedbackItem[] = []

function seedFeedback() {
  const now = new Date()

  const items: Omit<FeedbackItem, 'id' | 'createdAt'>[] = [
    { userId: 'student-emma', userName: 'Emma Wilson', userRole: 'student', type: 'praise', subject: 'AI tutor is amazing!', message: 'The AI tutor helped me understand quadratic equations in a way my textbook never could. I went from a C to an A on my last test.', sentiment: 'positive', status: 'reviewed' },
    { userId: 'instructor-harper', userName: 'Ms. Harper', userRole: 'instructor', type: 'feature', subject: 'Bulk grade export', message: 'Would love to export all grades for a class period as a CSV. Currently I have to go student by student.', sentiment: 'neutral', status: 'new' },
    { userId: 'parent-johnson', userName: 'Sarah Johnson', userRole: 'parent', type: 'general', subject: 'Progress reports', message: 'Is there a way to get weekly progress reports emailed to me? I want to stay on top of my son\'s work.', sentiment: 'neutral', status: 'reviewed' },
    { userId: 'student-liam', userName: 'Liam Brooks', userRole: 'student', type: 'bug', subject: 'Quiz timer keeps resetting', message: 'When I switch tabs during a timed quiz, the timer resets to the beginning. Lost 10 minutes of work.', sentiment: 'negative', status: 'resolved' },
    { userId: 'instructor-park', userName: 'Mr. Daniel Park', userRole: 'instructor', type: 'feature', subject: 'Assignment templates', message: 'It would save me hours if I could create assignment templates and reuse them across classes.', sentiment: 'neutral', status: 'new' },
    { userId: 'student-mia', userName: 'Mia Rodriguez', userRole: 'student', type: 'praise', subject: 'Love the study groups', message: 'The peer study group feature is so helpful. We quiz each other before tests and my grades have improved.', sentiment: 'positive', status: 'reviewed' },
    { userId: 'parent-williams', userName: 'Marcus Williams', userRole: 'parent', type: 'bug', subject: 'Can\'t see daughter\'s assignments', message: 'The parent portal shows no assignments for my daughter even though she says she has homework every night.', sentiment: 'negative', status: 'new' },
    { userId: 'instructor-torres', userName: 'Ms. Rachel Torres', userRole: 'instructor', type: 'praise', subject: 'Grading AI saves me hours', message: 'The AI-assisted grading is a game changer. What used to take me 3 hours now takes 45 minutes.', sentiment: 'positive', status: 'reviewed' },
    { userId: 'student-noah', userName: 'Noah Kim', userRole: 'student', type: 'general', subject: 'Dark mode request', message: 'Is there a dark mode? I do a lot of studying at night and the bright screen hurts my eyes.', sentiment: 'neutral', status: 'resolved' },
    { userId: 'instructor-liu', userName: 'Dr. James Liu', userRole: 'instructor', type: 'feature', subject: 'Analytics per student', message: 'Need individual student analytics showing time spent per topic, quiz attempt patterns, and predicted risk areas.', sentiment: 'neutral', status: 'new' },
    { userId: 'parent-garcia', userName: 'Ana Garcia', userRole: 'parent', type: 'praise', subject: 'My son actually enjoys math now', message: 'For the first time ever, my son voluntarily does math practice. The gamification elements really work.', sentiment: 'positive', status: 'reviewed' },
    { userId: 'student-emma', userName: 'Emma Wilson', userRole: 'student', type: 'bug', subject: 'Notification spam', message: 'I\'m getting 5-6 notifications for every single assignment posted. Should only be one.', sentiment: 'negative', status: 'resolved' },
    { userId: 'instructor-sharma', userName: 'Ms. Priya Sharma', userRole: 'instructor', type: 'feature', subject: 'Lesson plan AI generator', message: 'Would be incredible to have AI generate lesson plan drafts based on learning objectives and state standards.', sentiment: 'positive', status: 'new' },
    { userId: 'student-liam', userName: 'Liam Brooks', userRole: 'student', type: 'general', subject: 'Mobile app?', message: 'Is there a mobile app coming? I mostly use my phone and the website is hard to navigate on small screens.', sentiment: 'neutral', status: 'reviewed' },
    { userId: 'parent-chen', userName: 'David Chen', userRole: 'parent', type: 'general', subject: 'Pricing for families', message: 'We have 3 kids in the system. Is there a family discount for Pro subscriptions?', sentiment: 'neutral', status: 'new' },
    { userId: 'instructor-chen', userName: 'Mr. Alex Chen', userRole: 'instructor', type: 'praise', subject: 'Best platform I\'ve used', message: 'After trying 5 different platforms, TeachingLabs is the only one that doesn\'t feel like it was designed by someone who has never taught.', sentiment: 'positive', status: 'reviewed' },
    { userId: 'student-mia', userName: 'Mia Rodriguez', userRole: 'student', type: 'bug', subject: 'Video player buffering', message: 'Lesson videos buffer constantly even on fast WiFi. Other streaming sites work fine.', sentiment: 'negative', status: 'new' },
    { userId: 'instructor-gonzalez', userName: 'Dr. Maria Gonzalez', userRole: 'instructor', type: 'feature', subject: 'Parent communication hub', message: 'A built-in messaging system for parent-teacher communication would replace the 3 other tools I currently juggle.', sentiment: 'neutral', status: 'new' },
    { userId: 'parent-lee', userName: 'Jennifer Lee', userRole: 'parent', type: 'praise', subject: 'Teacher responsiveness', message: 'The platform makes it so easy to see what\'s happening in class. I feel more connected to my child\'s education.', sentiment: 'positive', status: 'reviewed' },
    { userId: 'student-noah', userName: 'Noah Kim', userRole: 'student', type: 'feature', subject: 'Flashcard mode', message: 'Could you add a flashcard study mode? I learn best by repetition and spaced review.', sentiment: 'neutral', status: 'new' },
    { userId: 'instructor-grant', userName: 'Ms. Olivia Grant', userRole: 'instructor', type: 'bug', subject: 'Rubric editor crashes', message: 'The rubric editor crashes when I try to add more than 6 criteria. Have to keep my rubrics simple.', sentiment: 'negative', status: 'new' },
    { userId: 'parent-patel', userName: 'Raj Patel', userRole: 'parent', type: 'general', subject: 'Data privacy question', message: 'What data do you collect on students? We\'re concerned about privacy and want to understand your policies.', sentiment: 'neutral', status: 'reviewed' },
    { userId: 'demo-student', userName: 'Alex Demo', userRole: 'student', type: 'praise', subject: 'Code playground is fire', message: 'The interactive code playground for CS class is amazing. Being able to run code right in the lesson is so much better than switching to a separate IDE.', sentiment: 'positive', status: 'reviewed' },
    { userId: 'instructor-okafor', userName: 'Mr. David Okafor', userRole: 'instructor', type: 'feature', subject: 'Attendance tracking', message: 'Need built-in attendance tracking that integrates with the gradebook. Currently using a separate spreadsheet.', sentiment: 'neutral', status: 'new' },
    { userId: 'student-emma', userName: 'Emma Wilson', userRole: 'student', type: 'general', subject: 'Keyboard shortcuts', message: 'Would love keyboard shortcuts for navigating between lessons and submitting assignments. Would speed up my workflow a lot.', sentiment: 'neutral', status: 'new' },
  ]

  items.forEach((item, index) => {
    const daysAgo = Math.floor((index / items.length) * 30)
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)
    date.setHours(8 + (index % 12), (index * 17) % 60, 0, 0)

    feedbackItems.push({
      ...item,
      id: `feedback_${index + 1}`,
      createdAt: date.toISOString(),
    })
  })
}

seedFeedback()

// ── Public API ─────────────────────────────────────────

export function getAllFeedback(): FeedbackItem[] {
  return [...feedbackItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getFeedbackStats(): FeedbackStats {
  const total = feedbackItems.length

  const byType: Record<FeedbackType, number> = { bug: 0, feature: 0, general: 0, praise: 0 }
  const bySentiment: Record<FeedbackSentiment, number> = { positive: 0, neutral: 0, negative: 0 }
  const byStatus: Record<FeedbackStatus, number> = { new: 0, reviewed: 0, resolved: 0 }

  for (const item of feedbackItems) {
    byType[item.type]++
    bySentiment[item.sentiment]++
    byStatus[item.status]++
  }

  // Calculate avg per day based on date range
  const dates = new Set(feedbackItems.map((f) => f.createdAt.slice(0, 10)))
  const avgPerDay = dates.size > 0 ? Math.round((total / dates.size) * 10) / 10 : 0

  return { total, byType, bySentiment, byStatus, avgPerDay }
}
