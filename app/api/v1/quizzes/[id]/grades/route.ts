import { NextRequest, NextResponse } from 'next/server'
import { getGrades } from '@/lib/quiz-grading'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const studentId = req.nextUrl.searchParams.get('studentId') || ''
  const grades = getGrades(id, studentId)
  if (!grades) return NextResponse.json({ error: 'No grades found' }, { status: 404 })
  return NextResponse.json(grades)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { studentId, questionId, score, feedback } = await req.json()
  const { overrideGrade } = await import('@/lib/quiz-grading')
  const result = overrideGrade(id, studentId, questionId, score, feedback || 'Instructor override')
  if (!result) return NextResponse.json({ error: 'Grades not found' }, { status: 404 })
  return NextResponse.json({ success: true, breakdown: result })
}
