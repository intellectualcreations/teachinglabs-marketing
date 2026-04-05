import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET  /api/teacher/activities/:id/classes — list classes this activity is assigned to
 * POST /api/teacher/activities/:id/classes — assign to classes { classIds: string[] }
 * PUT  /api/teacher/activities/:id/classes — replace all assignments { classIds: string[] }
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data, error } = await (admin.from('class_activities') as any)
    .select('class_id, assigned_at')
    .eq('activity_id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ classIds: (data || []).map((r: any) => r.class_id) });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { classIds } = await request.json() as { classIds: string[] };
  const admin = createAdminClient();

  // Remove all existing assignments
  await (admin.from('class_activities') as any)
    .delete()
    .eq('activity_id', id);

  // Insert new ones
  if (classIds && classIds.length > 0) {
    const rows = classIds.map((cid: string) => ({
      class_id: cid,
      activity_id: id,
    }));

    const { error } = await (admin.from('class_activities') as any).insert(rows);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, classIds: classIds || [] });
}
