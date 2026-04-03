// ── Token Usage Store ──────────────────────────────────
// In-memory AI token usage tracking with seed data for CEO dashboard

export type AIFeature = 'ai-assistant' | 'grading' | 'lesson-gen' | 'quiz-gen' | 'voice-clone'
export type AIModel = 'gpt-4o' | 'claude-sonnet' | 'whisper'

export interface TokenUsageRecord {
  id: string
  userId: string
  feature: AIFeature
  model: AIModel
  inputTokens: number
  outputTokens: number
  costCents: number
  createdAt: string
}

export interface TokenUsageStats {
  totalInputTokens: number
  totalOutputTokens: number
  totalCostCents: number
  byFeature: Record<AIFeature, { tokens: number; costCents: number }>
  byModel: Record<AIModel, { tokens: number; costCents: number }>
  dailyTrend: { date: string; costCents: number; tokens: number }[]
  perUserAvgCostCents: number
  projectedMonthlyCostCents: number
}

// ── Seed Data ──────────────────────────────────────────

const tokenUsageRecords: TokenUsageRecord[] = []

function seedTokenUsage() {
  const now = new Date()
  const userIds = [
    'demo-student', 'student-emma', 'student-liam', 'student-mia', 'student-noah',
    'instructor-harper', 'instructor-park', 'instructor-torres', 'instructor-liu',
    'instructor-sharma', 'instructor-chen',
  ]

  // Feature → model mapping with typical usage patterns
  const featureConfig: { feature: AIFeature; model: AIModel; avgInput: number; avgOutput: number; frequency: number }[] = [
    { feature: 'ai-assistant', model: 'gpt-4o', avgInput: 800, avgOutput: 1200, frequency: 8 },
    { feature: 'ai-assistant', model: 'claude-sonnet', avgInput: 1000, avgOutput: 1500, frequency: 5 },
    { feature: 'grading', model: 'gpt-4o', avgInput: 2000, avgOutput: 800, frequency: 4 },
    { feature: 'grading', model: 'claude-sonnet', avgInput: 2200, avgOutput: 900, frequency: 3 },
    { feature: 'lesson-gen', model: 'gpt-4o', avgInput: 1500, avgOutput: 3000, frequency: 2 },
    { feature: 'lesson-gen', model: 'claude-sonnet', avgInput: 1800, avgOutput: 3500, frequency: 2 },
    { feature: 'quiz-gen', model: 'gpt-4o', avgInput: 1000, avgOutput: 2000, frequency: 3 },
    { feature: 'voice-clone', model: 'whisper', avgInput: 6000, avgOutput: 0, frequency: 1 },
  ]

  // Cost per 1K tokens (in cents)
  const costPer1K: Record<AIModel, { input: number; output: number }> = {
    'gpt-4o': { input: 0.5, output: 1.5 },
    'claude-sonnet': { input: 0.3, output: 1.5 },
    'whisper': { input: 0.6, output: 0 },
  }

  let recordId = 0

  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)

    // More usage on weekdays
    const dayOfWeek = date.getDay()
    const weekdayMultiplier = (dayOfWeek >= 1 && dayOfWeek <= 5) ? 1.0 : 0.4

    for (const config of featureConfig) {
      // Determine how many records for this feature today
      const count = Math.max(1, Math.round(config.frequency * weekdayMultiplier * (0.7 + Math.random() * 0.6)))

      for (let i = 0; i < count; i++) {
        const userId = userIds[Math.floor(Math.random() * userIds.length)]
        const inputVariance = 0.5 + Math.random()
        const outputVariance = 0.5 + Math.random()

        const inputTokens = Math.round(config.avgInput * inputVariance)
        const outputTokens = Math.round(config.avgOutput * outputVariance)

        const costs = costPer1K[config.model]
        const costCents = Math.round(
          (inputTokens / 1000) * costs.input + (outputTokens / 1000) * costs.output
        )

        const hour = 7 + Math.floor(Math.random() * 14) // 7am - 9pm
        const minute = Math.floor(Math.random() * 60)
        date.setHours(hour, minute, 0, 0)

        tokenUsageRecords.push({
          id: `token_${++recordId}`,
          userId,
          feature: config.feature,
          model: config.model,
          inputTokens,
          outputTokens,
          costCents,
          createdAt: date.toISOString(),
        })
      }
    }
  }
}

seedTokenUsage()

// ── Public API ─────────────────────────────────────────

export function getAllTokenUsage(): TokenUsageRecord[] {
  return [...tokenUsageRecords].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function getTokenUsageStats(): TokenUsageStats {
  let totalInputTokens = 0
  let totalOutputTokens = 0
  let totalCostCents = 0

  const byFeature: Record<AIFeature, { tokens: number; costCents: number }> = {
    'ai-assistant': { tokens: 0, costCents: 0 },
    'grading': { tokens: 0, costCents: 0 },
    'lesson-gen': { tokens: 0, costCents: 0 },
    'quiz-gen': { tokens: 0, costCents: 0 },
    'voice-clone': { tokens: 0, costCents: 0 },
  }

  const byModel: Record<AIModel, { tokens: number; costCents: number }> = {
    'gpt-4o': { tokens: 0, costCents: 0 },
    'claude-sonnet': { tokens: 0, costCents: 0 },
    'whisper': { tokens: 0, costCents: 0 },
  }

  const dailyMap = new Map<string, { costCents: number; tokens: number }>()
  const uniqueUsers = new Set<string>()

  for (const record of tokenUsageRecords) {
    const tokens = record.inputTokens + record.outputTokens
    totalInputTokens += record.inputTokens
    totalOutputTokens += record.outputTokens
    totalCostCents += record.costCents
    uniqueUsers.add(record.userId)

    byFeature[record.feature].tokens += tokens
    byFeature[record.feature].costCents += record.costCents

    byModel[record.model].tokens += tokens
    byModel[record.model].costCents += record.costCents

    const dateKey = record.createdAt.slice(0, 10)
    const existing = dailyMap.get(dateKey) || { costCents: 0, tokens: 0 }
    existing.costCents += record.costCents
    existing.tokens += tokens
    dailyMap.set(dateKey, existing)
  }

  // Sort daily trend
  const dailyTrend = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const perUserAvgCostCents = uniqueUsers.size > 0
    ? Math.round(totalCostCents / uniqueUsers.size)
    : 0

  // Project monthly cost from the last 7 days
  const last7Days = dailyTrend.slice(-7)
  const avg7DayCost = last7Days.length > 0
    ? last7Days.reduce((sum, d) => sum + d.costCents, 0) / last7Days.length
    : 0
  const projectedMonthlyCostCents = Math.round(avg7DayCost * 30)

  return {
    totalInputTokens,
    totalOutputTokens,
    totalCostCents,
    byFeature,
    byModel,
    dailyTrend,
    perUserAvgCostCents,
    projectedMonthlyCostCents,
  }
}
