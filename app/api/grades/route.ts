import { NextRequest, NextResponse } from 'next/server';

interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  assignmentId: string;
  score: number;
  maxScore: number;
  date: string;
}

const gradeStore: Grade[] = [];
let idCounter = 1;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, courseId, assignmentId, score, maxScore } = body;
    if (!studentId || score === undefined) {
      return NextResponse.json({ error: 'studentId and score required' }, { status: 400 });
    }
    const grade: Grade = {
      id: String(idCounter++),
      studentId,
      courseId: courseId || 'unknown',
      assignmentId: assignmentId || 'unknown',
      score: Number(score),
      maxScore: Number(maxScore || 100),
      date: new Date().toISOString(),
    };
    gradeStore.push(grade);
    return NextResponse.json(grade, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
