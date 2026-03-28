import { NextRequest, NextResponse } from 'next/server';
import { getStudentProgress } from '@/lib/progress-store';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const progress = getStudentProgress(id);
  return NextResponse.json(progress);
}
