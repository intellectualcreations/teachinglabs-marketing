import { NextResponse } from 'next/server';
import { getStudyGroupById, updateStudyGroup, deleteStudyGroup } from '@/lib/study-group-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const group = getStudyGroupById(id);
  if (!group) {
    return NextResponse.json({ error: 'Study group not found' }, { status: 404 });
  }
  return NextResponse.json({ group });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const { name, description, maxMembers, isPublic } = body;

  const group = updateStudyGroup(id, { name, description, maxMembers, isPublic });
  if (!group) {
    return NextResponse.json({ error: 'Study group not found' }, { status: 404 });
  }
  return NextResponse.json({ group });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const deleted = deleteStudyGroup(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Study group not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
