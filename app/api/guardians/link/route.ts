import { NextRequest, NextResponse } from 'next/server';
import { linkGuardian } from '@/lib/guardian-store';

export async function POST(req: NextRequest) {
  const { guardianId, studentId } = await req.json();
  if (!guardianId || !studentId) {
    return NextResponse.json({ error: 'guardianId and studentId required' }, { status: 400 });
  }
  const link = linkGuardian(guardianId, studentId);
  return NextResponse.json(link, { status: 201 });
}
