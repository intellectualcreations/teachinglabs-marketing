import { NextRequest, NextResponse } from 'next/server';
import { courses, getCourseById } from '@/lib/courses';

/**
 * PUT /api/courses/[id]
 * Update a course (title, description, modules).
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const idx = courses.findIndex((c) => c.id === id);

  if (idx === -1) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  const body = await request.json();
  const { title, description, modules } = body;

  if (title !== undefined) courses[idx].title = title;
  if (description !== undefined) courses[idx].description = description;
  if (modules !== undefined) courses[idx].modules = modules;

  return NextResponse.json({ course: courses[idx] });
}
