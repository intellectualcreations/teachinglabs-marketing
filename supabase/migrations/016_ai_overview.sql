-- ============================================================
-- Migration 016: AI-generated student overview paragraph
-- A teacher-facing 1-paragraph summary of the student's baseline.
-- Cached on the assessment row; regenerated on demand.
-- ============================================================

ALTER TABLE public.student_assessments
  ADD COLUMN IF NOT EXISTS ai_overview TEXT,
  ADD COLUMN IF NOT EXISTS ai_overview_generated_at TIMESTAMPTZ;
