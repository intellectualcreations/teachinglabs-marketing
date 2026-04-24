import { NextRequest, NextResponse } from 'next/server';
import { requireTeacher } from '@/lib/api-auth';

// GET — list the authenticated teacher's own activities (for Add Activity modal)
export async function GET(request: NextRequest) {
  try {
    const auth = await requireTeacher(request);
    if ('error' in auth) return auth.error;
    const { user, admin } = auth;
    const teacherId = user.id;
    const { data, error } = await (admin.from('assignments') as any)
      .select('id, title, description, subject, grade_level, activity_type, estimated_minutes')
      .eq('teacher_id', teacherId)
      .eq('is_tl_content', false)
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ activities: data ?? [] });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — remove an activity by id (teacher must own it)
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireTeacher(request);
    if ('error' in auth) return auth.error;
    const { user, admin } = auth;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Verify the caller owns this activity.
    const { data: assignment } = await (admin.from('assignments') as any)
      .select('teacher_id').eq('id', id).maybeSingle();
    if (!assignment) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }
    if (assignment.teacher_id !== user.id) {
      return NextResponse.json({ error: 'You do not own this activity' }, { status: 403 });
    }

    // Delete related enrollments first to avoid FK issues
    await (admin.from('enrollments') as any).delete().eq('assignment_id', id);

    const { error } = await (admin.from('assignments') as any).delete().eq('id', id);
    if (error) {
      console.error('Delete activity error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete activity API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — create a standalone (orphaned) activity for the authenticated teacher
export async function POST(request: NextRequest) {
  try {
    const auth = await requireTeacher(request);
    if ('error' in auth) return auth.error;
    const { user, admin } = auth;
    const teacher_id = user.id;

    const body = await request.json();
    const {
      title, description,
      objective, learning_goal, essential_question,
      materials, vocabulary, directions, hook,
      assessment, differentiation,
      course_id, module_id, // optional — attach later
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    // class_id is NOT NULL, so find teacher's first class
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

    const insertBase: Record<string, unknown> = {
      title: title.trim(),
      description: description?.trim() || null,
      teacher_id,
      class_id: classes[0].id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Optional course/module attachment
    if (course_id) insertBase.course_id = course_id;
    if (module_id) insertBase.module_id = module_id;

    // Detail fields
    const detailFields: Record<string, unknown> = {};
    if (objective?.trim()) detailFields.objective = objective.trim();
    if (learning_goal?.trim()) detailFields.learning_goal = learning_goal.trim();
    if (essential_question?.trim()) detailFields.essential_question = essential_question.trim();
    if (materials?.trim()) detailFields.materials = materials.trim();
    if (vocabulary?.trim()) detailFields.vocabulary = vocabulary.trim();
    if (directions?.trim()) detailFields.directions = directions.trim();
    if (hook?.trim()) detailFields.hook = hook.trim();
    if (assessment?.trim()) detailFields.assessment = assessment.trim();
    if (differentiation?.trim()) detailFields.differentiation = differentiation.trim();

    // Try with detail fields, fall back without if columns missing
    let { data, error } = await (admin.from('assignments') as any)
      .insert({ ...insertBase, ...detailFields })
      .select()
      .single();

    if (error?.message?.includes('column')) {
      ({ data, error } = await (admin.from('assignments') as any)
        .insert(insertBase)
        .select()
        .single());
    }

    if (error) {
      console.error('Create standalone activity error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ activity: data }, { status: 201 });
  } catch (err) {
    console.error('Standalone activity API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
