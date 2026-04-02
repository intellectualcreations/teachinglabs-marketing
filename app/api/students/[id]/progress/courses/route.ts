import { NextRequest, NextResponse } from 'next/server';
import { getCourseBreakdown } from '@/lib/progress-store';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const breakdown = getCourseBreakdown(id);
  return NextResponse.json(breakdown);
}
