import { NextRequest, NextResponse } from 'next/server';
import { getRubric } from '@/lib/rubric-store';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rubric = getRubric(id);
  if (!rubric) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(rubric);
}
