-- ============================================================
-- Migration 026: Add authenticity_signals to student_assessments
--
-- The onboarding flow saves an `authenticity_signals` field that was never
-- added to the table. Result: every attempted assessment save silently
-- errored with "Could not find the 'authenticity_signals' column", which
-- broke the entire save \u2014 profile updates (superpower_title,
-- primary_intelligence, superpower_avatar) also never landed.
--
-- JSONB so we can add/remove signal flags without another migration.
-- ============================================================

ALTER TABLE public.student_assessments
  ADD COLUMN IF NOT EXISTS authenticity_signals JSONB;
