import { NextRequest, NextResponse } from 'next/server';
import { getAggregate } from '@/lib/progress-store';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const agg = getAggregate(id);
  return NextResponse.json(agg);
}
