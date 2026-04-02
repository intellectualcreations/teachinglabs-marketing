import { NextResponse } from "next/server";
import {
  getGradesForCourse,
  calculateWeightedGrade,
  getGradingConfig,
} from "@/lib/gradebook-store";

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

/**
 * GET /api/v1/courses/:courseId/gradebook
 * Returns all students with their weighted course grade.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { courseId } = await params;

  const config = getGradingConfig(courseId);
  if (!config) {
    return NextResponse.json(
      { error: "No grading config found. Set up grading weights first." },
      { status: 404 },
    );
  }

  const allGrades = getGradesForCourse(courseId);

  // Get unique student IDs
  const studentIds = [...new Set(allGrades.map((g) => g.studentId))];

  const students = studentIds.map((studentId) => {
    const grade = calculateWeightedGrade(courseId, studentId);
    return {
      studentId,
      weightedPercentage: grade?.weightedPercentage ?? 0,
      letterGrade: grade?.letterGrade ?? "N/A",
      gpa: grade?.gpa ?? 0,
      breakdown: grade?.breakdown,
    };
  });

  return NextResponse.json({
    courseId,
    gradingConfig: config.weights,
    students,
  });
}
