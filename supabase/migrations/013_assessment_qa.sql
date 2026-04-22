-- ============================================================
-- Migration 013: Capture full assessment Q&A
-- So teachers can see the literal question each student was asked
-- and the answer they gave. Everything was displayed during the
-- assessment; only the tier label was persisted. Fix that.
-- ============================================================

ALTER TABLE public.student_assessments
  ADD COLUMN IF NOT EXISTS reading_passage TEXT,
  ADD COLUMN IF NOT EXISTS reading_question TEXT,
  ADD COLUMN IF NOT EXISTS reading_student_answer TEXT,
  ADD COLUMN IF NOT EXISTS math_q1_question TEXT,
  ADD COLUMN IF NOT EXISTS math_q1_student_answer TEXT,
  ADD COLUMN IF NOT EXISTS math_q1_correct_answer TEXT,
  ADD COLUMN IF NOT EXISTS math_q2_question TEXT,
  ADD COLUMN IF NOT EXISTS math_q2_student_answer TEXT,
  ADD COLUMN IF NOT EXISTS math_q2_correct_answer TEXT;

COMMENT ON COLUMN public.student_assessments.reading_passage IS 'The reading passage text the student was shown during baseline assessment.';
COMMENT ON COLUMN public.student_assessments.math_q1_student_answer IS 'What the student literally typed as their answer to math Q1.';
