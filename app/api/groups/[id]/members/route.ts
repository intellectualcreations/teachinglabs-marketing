import { NextResponse } from 'next/server';
import { joinStudyGroup, leaveStudyGroup } from '@/lib/study-group-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const { userId } = body;

  if (!userId) {
    return NextResponse.json({ error: 'Missing required field: userId' }, { status: 400 });
  }

  const member = joinStudyGroup(id, userId);
  if (!member) {
    return NextResponse.json(
      { error: 'Cannot join group. It may be full, not found, or you are already a member.' },
      { status: 400 },
    );
  }
  return NextResponse.json({ member }, { status: 201 });
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const { userId } = body;

  if (!userId) {
    return NextResponse.json({ error: 'Missing required field: userId' }, { status: 400 });
  }

  const left = leaveStudyGroup(id, userId);
  if (!left) {
    return NextResponse.json(
      { error: 'Cannot leave group. You may not be a member or you are the owner.' },
      { status: 400 },
    );
  }
  return NextResponse.json({ success: true });
}
