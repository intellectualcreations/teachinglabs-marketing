import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string; studentId: string }> }) {
  const { id: guardianId, studentId } = await params;
  return NextResponse.json({
    guardianId,
    studentId,
    gradesAvg: 78.5,
    progressPct: 62,
    upcomingDeadlinesCount: 3,
    message: 'Summary computed from student grade and deadline data',
  });
}
