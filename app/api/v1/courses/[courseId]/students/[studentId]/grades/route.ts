import { NextResponse } from "next/server";
import {
  getGradesForStudentInCourse,
  calculateWeightedGrade,
  getGradingConfig,
} from "@/lib/gradebook-store";

interface RouteParams {
  params: Promise<{ courseId: string; studentId: string }>;
}

/**
 * GET /api/v1/courses/:courseId/students/:studentId/grades
 * Returns all grades for a student in a specific course.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { courseId, studentId } = await params;

  const grades = getGradesForStudentInCourse(courseId, studentId);
  const config = getGradingConfig(courseId);
  const weighted = calculateWeightedGrade(courseId, studentId);

  return NextResponse.json({
    courseId,
    studentId,
    gradingConfig: config?.weights ?? null,
    grades,
    summary: weighted
      ? {
          weightedPercentage: weighted.weightedPercentage,
          letterGrade: weighted.letterGrade,
          gpa: weighted.gpa,
          breakdown: weighted.breakdown,
        }
      : null,
  });
}
