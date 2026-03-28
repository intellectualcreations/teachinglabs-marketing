import { createClient as createServerClient } from '@/lib/supabase/server';
import type { Assignment, Submission } from '@/lib/supabase/types';

export async function getAssignmentsByClass(classId: string): Promise<Assignment[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('class_id', classId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getAssignmentsByClass error:', error.message);
    return [];
  }
  return (data ?? []) as Assignment[];
}

export async function createAssignment(assignmentData: {
  title: string;
  description?: string;
  class_id: string;
  teacher_id: string;
  due_date?: string;
}): Promise<Assignment | null> {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('assignments') as any)
    .insert(assignmentData)
    .select()
    .single();

  if (error) {
    console.error('createAssignment error:', error.message);
    return null;
  }
  return data as Assignment | null;
}

export async function getSubmissionsByAssignment(assignmentId: string): Promise<Submission[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('getSubmissionsByAssignment error:', error.message);
    return [];
  }
  return (data ?? []) as Submission[];
}
