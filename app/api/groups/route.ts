import { NextRequest, NextResponse } from 'next/server';
import { getAllStudyGroups, createStudyGroup } from '@/lib/study-group-store';

export async function GET(request: NextRequest) {
  const courseId = request.nextUrl.searchParams.get('courseId') ?? undefined;
  const groups = getAllStudyGroups(courseId);
  return NextResponse.json({ groups });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, courseId, createdById, maxMembers, isPublic } = body;

  if (!name || !description || !courseId || !createdById) {
    return NextResponse.json(
      { error: 'Missing required fields: name, description, courseId, createdById' },
      { status: 400 },
    );
  }

  const group = createStudyGroup(
    name,
    description,
    courseId,
    createdById,
    maxMembers ?? 10,
    isPublic ?? true,
  );
  return NextResponse.json({ group }, { status: 201 });
}
