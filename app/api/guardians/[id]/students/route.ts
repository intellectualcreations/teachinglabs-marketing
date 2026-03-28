import { NextRequest, NextResponse } from 'next/server';
import { getGuardianStudents } from '@/lib/guardian-store';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const students = getGuardianStudents(id);
  return NextResponse.json({ guardianId: id, students });
}
