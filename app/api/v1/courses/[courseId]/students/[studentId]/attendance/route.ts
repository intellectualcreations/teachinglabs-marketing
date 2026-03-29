import { NextRequest, NextResponse } from 'next/server';
import { getStudentAttendance } from '@/lib/attendance-store';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string; studentId: string }> },
) {
  const { courseId, studentId } = await params;
  const result = getStudentAttendance(courseId, studentId);
  return NextResponse.json(result);
}
