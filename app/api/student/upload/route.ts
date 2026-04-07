import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/student/upload
 * Server-side file upload for chat attachments.
 * 
 * Client sends FormData with file + userId + classId.
 * Server uploads to Supabase storage using service role (bypasses RLS).
 * Returns public URL.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const classId = formData.get('classId') as string;

    if (!file || !userId || !classId) {
      return NextResponse.json(
        { error: 'file, userId, and classId required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify student is enrolled in the class (security check)
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', userId)
      .eq('class_id', classId)
      .eq('status', 'active')
      .maybeSingle();

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this class' },
        { status: 403 }
      );
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop() || 'bin';
    const path = `${userId}/${Date.now()}.${ext}`;

    // Upload using service role (bypasses RLS)
    const { error: uploadError } = await supabase.storage
      .from('chat-attachments')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('[upload] Storage error:', uploadError);
      return NextResponse.json(
        { error: 'Upload failed: ' + uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(path);

    return NextResponse.json({
      url: data.publicUrl,
      path,
      name: file.name,
      type: file.type,
    });
  } catch (err) {
    console.error('[upload] Error:', err);
    return NextResponse.json(
      { error: 'Upload error: ' + (err instanceof Error ? err.message : 'unknown') },
      { status: 500 }
    );
  }
}
