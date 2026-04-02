export interface QuizQuestion {
  id: string
  type: 'multiple_choice' | 'short_answer'
  text: string
  correct_answer?: string
  rubric?: string
  maxScore: number
}

export interface QuizGradeBreakdown {
  questionId: string
  score: number
  maxScore: number
  feedback: string
  gradedBy: 'auto' | 'llm' | 'instructor'
}

export interface Submission {
  id: string
  quizId: string
  studentId: string
  answers: Record<string, string>
  submittedAt: string
  status: 'pending' | 'grading' | 'graded'
  total?: number
  breakdown?: QuizGradeBreakdown[]
  gradedAt?: string
}

const submissions = new Map<string, Submission>()
const quizGrades = new Map<string, QuizGradeBreakdown[]>()
let seq = 1

export function gradeMultipleChoice(question: QuizQuestion, answer: string): QuizGradeBreakdown {
  const correct = answer.trim().toLowerCase() === (question.correct_answer || '').trim().toLowerCase()
  return {
    questionId: question.id,
    score: correct ? question.maxScore : 0,
    maxScore: question.maxScore,
    feedback: correct ? 'Correct!' : 'Incorrect. Expected: ' + question.correct_answer,
    gradedBy: 'auto'
  }
}

export async function gradeShortAnswer(question: QuizQuestion, answer: string): Promise<QuizGradeBreakdown> {
  // LLM grading simulation (in production: call Anthropic/OpenAI)
  const rubric = question.rubric || 'Award points based on relevance and accuracy.'
  const wordCount = answer.split(/\s+/).filter(Boolean).length
  const score = Math.min(question.maxScore, Math.round((wordCount / 20) * question.maxScore))
  return {
    questionId: question.id,
    score,
    maxScore: question.maxScore,
    feedback: 'Auto-graded by LLM. Rubric: ' + rubric + '. Score based on response completeness.',
    gradedBy: 'llm'
  }
}

export async function gradeSubmission(quizId: string, studentId: string, answers: Record<string, string>, questions: QuizQuestion[]): Promise<Submission> {
  const sub: Submission = {
    id: 'sub-' + (seq++),
    quizId,
    studentId,
    answers,
    submittedAt: new Date().toISOString(),
    status: 'grading'
  }
  submissions.set(sub.id, sub)

  // Grade all questions
  const breakdown: QuizGradeBreakdown[] = []
  for (const q of questions) {
    const ans = answers[q.id] || ''
    if (q.type === 'multiple_choice') {
      breakdown.push(gradeMultipleChoice(q, ans))
    } else {
      breakdown.push(await gradeShortAnswer(q, ans))
    }
  }

  const total = breakdown.reduce((s, b) => s + b.score, 0)
  sub.status = 'graded'
  sub.total = total
  sub.breakdown = breakdown
  sub.gradedAt = new Date().toISOString()
  submissions.set(sub.id, sub)
  quizGrades.set(quizId + ':' + studentId, breakdown)

  return sub
}

export function getGrades(quizId: string, studentId: string) {
  const breakdown = quizGrades.get(quizId + ':' + studentId)
  if (!breakdown) return null
  const total = breakdown.reduce((s, b) => s + b.score, 0)
  const gradedAt = [...submissions.values()].find(s => s.quizId === quizId && s.studentId === studentId)?.gradedAt
  return { total, breakdown, gradedAt }
}

export function overrideGrade(quizId: string, studentId: string, questionId: string, score: number, feedback: string) {
  const breakdown = quizGrades.get(quizId + ':' + studentId)
  if (!breakdown) return null
  const item = breakdown.find(b => b.questionId === questionId)
  if (item) { item.score = score; item.feedback = feedback; item.gradedBy = 'instructor' }
  quizGrades.set(quizId + ':' + studentId, breakdown)
  return breakdown
}
