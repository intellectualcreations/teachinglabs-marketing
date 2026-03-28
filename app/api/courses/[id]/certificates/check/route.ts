import { NextRequest, NextResponse } from 'next/server';
import { checkEligibility } from '@/lib/certificate-store';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = await params;
  const { studentId, avgScore } = await req.json();
  if (!studentId) return NextResponse.json({ error: 'studentId required' }, { status: 400 });
  const result = checkEligibility(studentId, courseId, Number(avgScore || 0));
  return NextResponse.json({ courseId, studentId, ...result });
}
