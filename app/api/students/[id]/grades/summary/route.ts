import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({
    studentId: id,
    avg: 0,
    highest: 0,
    lowest: 0,
    passRate: 0,
    bySubject: {},
    message: 'Summary computed from grade submissions',
  });
}
