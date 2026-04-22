-- ============================================================
-- Migration 017: Baseline assessment history
--
-- When a teacher clicks Recalibrate, the student's current baseline
-- (student_assessments row + all assessment_responses + AI overview)
-- gets snapshotted into this table before being cleared. This gives
-- us per-student growth tracking — teachers can view any prior
-- baseline and compare to the current one.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.baseline_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  archived_by UUID REFERENCES auth.users(id),     -- the teacher who triggered the recalibrate
  baseline_level TEXT,
  primary_intelligence TEXT,
  ai_overview TEXT,
  assessment_snapshot JSONB NOT NULL,              -- full student_assessments row at time of archive
  responses_snapshot JSONB NOT NULL,               -- array of assessment_responses rows
  completed_at TIMESTAMPTZ,                        -- when the student originally completed this baseline
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now()   -- when the recalibrate happened
);

CREATE INDEX IF NOT EXISTS idx_bh_student_archived ON public.baseline_history(student_id, archived_at DESC);

ALTER TABLE public.baseline_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY bh_read ON public.baseline_history FOR SELECT USING (true);
