import { NextRequest, NextResponse } from 'next/server';
import { getStudentIdsByCourse, getStudentProgress } from '@/lib/progress-store';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: classId } = await context.params;
  const studentIds = getStudentIdsByCourse(classId);

  const classProgress = studentIds.map(studentId => getStudentProgress(studentId));

  const avgCompletion = classProgress.length > 0
    ? Math.round(
        classProgress.reduce((sum, p) => sum + p.completionRate, 0) / classProgress.length * 100
      ) / 100
    : 0;

  const avgScore = classProgress.length > 0
    ? Math.round(
        classProgress.reduce((sum, p) => sum + p.avgScore, 0) / classProgress.length
      )
    : 0;

  return NextResponse.json({
    classId,
    studentCount: studentIds.length,
    avgCompletion,
    avgScore,
    students: classProgress,
  });
}
