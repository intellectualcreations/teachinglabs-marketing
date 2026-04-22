import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * PUT /api/teacher/edit-class
 * Body: { classId, name, subject, grade_level, description, icon }
 * Updates a class record. Uses admin client to bypass RLS.
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { classId, name, subject, grade_level, description, icon, requires_approval } = body;

    if (!classId) {
      return NextResponse.json({ error: 'classId required' }, { status: 400 });
    }
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Class name is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('classes')
      .update({
        name: name.trim(),
        subject: subject || null,
        grade_level: grade_level || null,
        description: description || null,
        icon: icon || null,
        requires_approval: typeof requires_approval === 'boolean' ? requires_approval : undefined,
      } as never)
      .eq('id', classId)
      .select()
      .single();

    if (error) {
      console.error('Update class error:', error.message);
      return NextResponse.json({ error: 'Failed to update class' }, { status: 500 });
    }

    return NextResponse.json({ class: data });
  } catch (err) {
    console.error('Edit class error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/teacher/edit-class?classId=<uuid>
 * Deletes a class and its enrollments. Uses admin client to bypass RLS.
 */
export async function DELETE(request: NextRequest) {
  const classId = request.nextUrl.searchParams.get('classId');
  if (!classId) {
    return NextResponse.json({ error: 'classId required' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    // Delete enrollments first (foreign key)
    const { error: enrollError } = await supabase
      .from('enrollments')
      .delete()
      .eq('class_id', classId);

    if (enrollError) {
      console.error('Delete enrollments error:', enrollError.message);
    }

    // Delete the class
    const { error: classError } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);

    if (classError) {
      console.error('Delete class error:', classError.message);
      return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete class error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
