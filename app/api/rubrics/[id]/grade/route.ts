import { NextRequest, NextResponse } from 'next/server';
import { gradeByRubric } from '@/lib/rubric-store';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { studentId, scores } = await req.json();
  if (!studentId || !Array.isArray(scores)) {
    return NextResponse.json({ error: 'studentId and scores[] required' }, { status: 400 });
  }
  const grade = gradeByRubric(id, studentId, scores);
  return NextResponse.json(grade);
}
