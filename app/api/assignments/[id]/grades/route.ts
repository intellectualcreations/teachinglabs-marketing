import { NextResponse } from 'next/server';
import { getGradeSubmissionsByAssignment } from '@/lib/grade-submission-store';
import { getUserById } from '@/lib/users';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/assignments/[id]/grades
 * Returns grade distribution and all AI grade submissions for an assignment.
 * Used by the instructor dashboard.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  const submissions = getGradeSubmissionsByAssignment(id);

  // Calculate distribution buckets (0-10, 11-20, ..., 91-100)
  const distribution: Record<string, number> = {
    '0-10': 0,
    '11-20': 0,
    '21-30': 0,
    '31-40': 0,
    '41-50': 0,
    '51-60': 0,
    '61-70': 0,
    '71-80': 0,
    '81-90': 0,
    '91-100': 0,
  };

  let totalScore = 0;
  let gradedCount = 0;

  for (const sub of submissions) {
    const score = sub.finalScore;
    if (score === null) continue;

    gradedCount++;
    totalScore += score;

    if (score <= 10) distribution['0-10']++;
    else if (score <= 20) distribution['11-20']++;
    else if (score <= 30) distribution['21-30']++;
    else if (score <= 40) distribution['31-40']++;
    else if (score <= 50) distribution['41-50']++;
    else if (score <= 60) distribution['51-60']++;
    else if (score <= 70) distribution['61-70']++;
    else if (score <= 80) distribution['71-80']++;
    else if (score <= 90) distribution['81-90']++;
    else distribution['91-100']++;
  }

  const avgScore = gradedCount > 0 ? Math.round(totalScore / gradedCount) : 0;

  // Enrich with student names
  const enriched = submissions.map((s) => {
    const student = getUserById(s.studentId);
    return {
      ...s,
      studentName: student?.name || 'Unknown Student',
    };
  });

  return NextResponse.json({
    assignmentId: id,
    totalSubmissions: submissions.length,
    gradedCount,
    avgScore,
    distribution,
    submissions: enriched,
  });
}
