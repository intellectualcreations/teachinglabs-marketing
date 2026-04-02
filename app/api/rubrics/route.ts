import { NextRequest, NextResponse } from 'next/server';
import { createRubric } from '@/lib/rubric-store';

export async function POST(req: NextRequest) {
  const { name, criteria } = await req.json();
  if (!name || !Array.isArray(criteria)) {
    return NextResponse.json({ error: 'name and criteria[] required' }, { status: 400 });
  }
  const rubric = createRubric(name, criteria);
  return NextResponse.json(rubric, { status: 201 });
}
