import { NextRequest, NextResponse } from 'next/server';
import { getStudyGroupById } from '@/lib/study-group-store';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = getStudyGroupById(id);
  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  }
  return NextResponse.json({ members: group.members });
}
