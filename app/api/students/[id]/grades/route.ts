import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Return empty array - grade store is in /api/grades route module
  return NextResponse.json({ studentId: id, grades: [], message: 'Grade data available via /api/grades' });
}
