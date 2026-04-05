import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const { courseId, moduleId } = await params;
    const admin = createAdminClient();

    const { data, error } = await (admin.from('assignments') as any)
      .select('id, title, description, created_at')
      .eq('module_id', moduleId)
      .eq('course_id', courseId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ activities: data ?? [] });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string }> }
) {
  try {
    const { courseId, moduleId } = await params;
    const body = await request.json();
    const { title, description, teacher_id } = body;

    if (!title || !teacher_id) {
      return NextResponse.json(
        { error: 'title and teacher_id are required' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // class_id is NOT NULL in assignments table, so find teacher's first class
    const { data: classes } = await (admin.from('classes') as any)
      .select('id')
      .eq('teacher_id', teacher_id)
      .limit(1);

    if (!classes || classes.length === 0) {
      return NextResponse.json(
        { error: 'You need at least one class to create activities. Create a class first.' },
        { status: 400 }
      );
    }

    const insertData: Record<string, unknown> = {
      title: title.trim(),
      description: description?.trim() || null,
      teacher_id,
      class_id: classes[0].id,
      course_id: courseId,
      module_id: moduleId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (admin.from('assignments') as any)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Create module activity error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ activity: data }, { status: 201 });
  } catch (err) {
    console.error('Module activity API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
