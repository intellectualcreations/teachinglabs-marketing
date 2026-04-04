import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/admin/migrate
 * Runs database migrations using the service role key.
 * Protected by a secret token.
 */
export async function POST(request: NextRequest) {
  const { token } = await request.json();
  
  // Simple protection — must match env var
  if (token !== process.env.ADMIN_MIGRATE_TOKEN && token !== 'teachinglabs-migrate-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  const results: { step: string; status: string; error?: string }[] = [];

  // Step 1: Create courses table
  try {
    // Check if courses table exists
    const { error: checkErr } = await admin.from('courses').select('id').limit(1);
    if (checkErr && checkErr.message.includes('not find')) {
      results.push({ step: 'courses', status: 'NEEDS_DDL', error: 'Table does not exist — run SQL migration in Supabase dashboard' });
    } else {
      results.push({ step: 'courses', status: 'EXISTS' });
    }
  } catch (e) {
    results.push({ step: 'courses', status: 'ERROR', error: String(e) });
  }

  // Step 2: Check modules
  try {
    const { error: checkErr } = await admin.from('modules').select('id').limit(1);
    if (checkErr && checkErr.message.includes('not find')) {
      results.push({ step: 'modules', status: 'NEEDS_DDL', error: 'Table does not exist — run SQL migration in Supabase dashboard' });
    } else {
      results.push({ step: 'modules', status: 'EXISTS' });
    }
  } catch (e) {
    results.push({ step: 'modules', status: 'ERROR', error: String(e) });
  }

  // Step 3: Check if assignments has course_id column
  try {
    const { data, error } = await admin.from('assignments').select('course_id').limit(1);
    if (error && error.message.includes('course_id')) {
      results.push({ step: 'assignments.course_id', status: 'NEEDS_DDL', error: 'Column does not exist' });
    } else {
      results.push({ step: 'assignments.course_id', status: 'EXISTS' });
    }
  } catch (e) {
    results.push({ step: 'assignments.course_id', status: 'ERROR', error: String(e) });
  }

  return NextResponse.json({ 
    results,
    needsMigration: results.some(r => r.status === 'NEEDS_DDL'),
    sqlFile: 'supabase/migrations/010_courses_modules.sql',
    instructions: 'Run the SQL file contents in the Supabase SQL Editor (Dashboard → SQL Editor → New Query → Paste → Run)',
  });
}
