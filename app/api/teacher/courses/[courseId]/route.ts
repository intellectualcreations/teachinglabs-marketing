import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const body = await request.json();
    const admin = createAdminClient();

    const updates: Record<string, unknown> = {};
    if (typeof body.is_published === 'boolean') updates.is_published = body.is_published;
    if (body.title) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.subject !== undefined) updates.subject = body.subject;
    if (body.grade_level !== undefined) updates.grade_level = body.grade_level;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await (admin.from('courses') as any)
      .update(updates)
      .eq('id', courseId)
      .select()
      .single();

    if (error) {
      console.error('Update course error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ course: data });
  } catch (err) {
    console.error('Update course API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const admin = createAdminClient();

    const { data, error } = await (admin.from('courses') as any)
      .select('*, modules:modules(id, title, description, position)')
      .eq('id', courseId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ course: data });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
