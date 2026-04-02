import { NextResponse } from 'next/server';
import { getGroupNotes, createGroupNote, getStudyGroupById } from '@/lib/study-group-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const group = getStudyGroupById(id);
  if (!group) {
    return NextResponse.json({ error: 'Study group not found' }, { status: 404 });
  }
  const notes = getGroupNotes(id);
  return NextResponse.json({ notes });
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const { authorId, authorName, title, content } = body;

  if (!authorId || !authorName || !title || !content) {
    return NextResponse.json(
      { error: 'Missing required fields: authorId, authorName, title, content' },
      { status: 400 },
    );
  }

  const note = createGroupNote(id, authorId, authorName, title, content);
  if (!note) {
    return NextResponse.json(
      { error: 'Cannot create note. Group not found or you are not a member.' },
      { status: 400 },
    );
  }
  return NextResponse.json({ note }, { status: 201 });
}
