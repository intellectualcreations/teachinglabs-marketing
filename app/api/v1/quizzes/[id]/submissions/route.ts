import { NextRequest, NextResponse } from 'next/server'
import { gradeSubmission, QuizQuestion } from '@/lib/quiz-grading'

// Hardcoded sample questions for demo
const sampleQuestions: QuizQuestion[] = [
  { id: 'q1', type: 'multiple_choice', text: 'What is 2+2?', correct_answer: '4', maxScore: 10 },
  { id: 'q2', type: 'short_answer', text: 'Explain photosynthesis.', rubric: 'Award points for mentioning light, CO2, and glucose.', maxScore: 20 }
]

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { studentId, answers } = await req.json()
  if (!studentId || !answers) return NextResponse.json({ error: 'Missing studentId or answers' }, { status: 400 })
  const submission = await gradeSubmission(params.id, studentId, answers, sampleQuestions)
  return NextResponse.json({ submissionId: submission.id, status: submission.status, total: submission.total }, { status: 201 })
}
