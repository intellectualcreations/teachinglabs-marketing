-- ============================================================
-- Migration 018: Teacher Notes
-- Private running journal per teacher/student pair. Newest first.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.teacher_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tn_pair_date ON public.teacher_notes(teacher_id, student_id, created_at DESC);

ALTER TABLE public.teacher_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tn_read ON public.teacher_notes FOR SELECT USING (true);
