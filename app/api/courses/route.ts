import { NextRequest, NextResponse } from 'next/server';
import { courses, type Course, type CourseModule } from '@/lib/courses';
import { getCurrentUser } from '@/lib/users';

/**
 * POST /api/courses
 * Create a new course. Assigns to the current instructor.
 */
export async function POST(request: NextRequest) {
  const user = getCurrentUser('instructor');

  if (user.role !== 'instructor') {
    return NextResponse.json({ error: 'Only instructors can create courses' }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, subject, modules } = body as {
    title?: string;
    description?: string;
    subject?: string;
    modules?: CourseModule[];
  };

  if (!title || !description || !subject) {
    return NextResponse.json(
      { error: 'title, description, and subject are required' },
      { status: 400 },
    );
  }

  const id = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Check for duplicate
  if (courses.find((c) => c.id === id)) {
    return NextResponse.json({ error: 'A course with this ID already exists' }, { status: 409 });
  }

  const newCourse: Course = {
    id,
    title,
    description,
    subject,
    tags: [],
    modules: modules || [],
    instructor: user.name,
    gradeLevel: 'All Grades',
    thumbnail: '#4FA3A5',
    published: false,
    price: 0,
  };

  // Mutate the in-memory array (fine for demo)
  courses.push(newCourse);

  return NextResponse.json({ course: newCourse }, { status: 201 });
}
