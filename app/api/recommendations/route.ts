import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/users';
import {
  getRecommendations,
  getContinueLearning,
} from '@/lib/recommendation-engine';

/**
 * GET /api/recommendations?studentId=xxx
 *
 * Returns personalized course recommendations and continue-learning items.
 * FLU-248: AI-powered course recommendations and adaptive learning.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId') || 'demo-student';
  const count = Math.min(
    parseInt(searchParams.get('count') || '3', 10),
    10,
  );

  const user = getUserById(studentId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const result = getRecommendations(studentId, count);
  const continueLearning = getContinueLearning(studentId);

  return NextResponse.json({
    studentId: user.id,
    studentName: user.name,
    bucket: result.bucket,
    isNewUser: result.isNewUser,
    recommendations: result.recommendations,
    continueLearning,
    weakAreas: result.weakAreas.map((w) => ({
      subject: w.subject,
      avgScore: Math.round(w.avgScore),
    })),
  });
}
