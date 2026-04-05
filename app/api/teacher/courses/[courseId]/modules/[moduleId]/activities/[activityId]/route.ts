import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string; activityId: string }> }
) {
  try {
    const { courseId, moduleId, activityId } = await params;
    const admin = createAdminClient();

    const { error } = await (admin.from('assignments') as any)
      .delete()
      .eq('id', activityId)
      .eq('module_id', moduleId)
      .eq('course_id', courseId);

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
