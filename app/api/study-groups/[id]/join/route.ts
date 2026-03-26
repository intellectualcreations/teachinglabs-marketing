import { NextRequest, NextResponse } from 'next/server';
import { joinStudyGroup, getStudyGroupById } from '@/lib/study-group-store';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { userId } = body;
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }
  const group = getStudyGroupById(id);
  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 });
  }
  if (group.members.length >= group.maxMembers) {
    return NextResponse.json({ error: 'Group is full' }, { status: 400 });
  }
  const member = joinStudyGroup(id, userId);
  if (!member) {
    return NextResponse.json({ error: 'Could not join group (already member or group full)' }, { status: 400 });
  }
  return NextResponse.json({ member }, { status: 201 });
}
