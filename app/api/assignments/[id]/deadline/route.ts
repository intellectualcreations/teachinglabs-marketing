import { NextRequest, NextResponse } from 'next/server';
import { setDeadline } from '@/lib/deadline-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await req.json();
  if (!body.dueDate) {
    return NextResponse.json({ error: 'dueDate required' }, { status: 400 });
  }
  const entry = setDeadline(id, body.title || 'Assignment', body.courseId || 'unknown', body.dueDate);
  return NextResponse.json(entry);
}
