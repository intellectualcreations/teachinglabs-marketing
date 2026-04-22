-- ============================================================
-- Migration 024: Teacher classroom identity
--
-- Splits teacher identity into 3 layers:
--   display_name     — legal/admin name ("Dottie Stewart"). Never shown to kids.
--   classroom_name   — what students see ("Mrs. Stewart" / "Coach Stewart").
--   twin_name        — name for the teacher's AI co-teacher ("Coach Sparkle").
--                      Students see this label on AI Twin replies.
-- twin_tagline is a short description shown under the Twin's name.
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS classroom_name TEXT,
  ADD COLUMN IF NOT EXISTS twin_name TEXT,
  ADD COLUMN IF NOT EXISTS twin_tagline TEXT;

-- Best-effort backfill for existing teachers:
-- classroom_name = "Mrs. <last_name>" if last_name is set, else first_name
-- twin_name      = "Coach Sparkle"
UPDATE public.profiles
SET classroom_name = COALESCE(
  classroom_name,
  CASE
    WHEN last_name IS NOT NULL AND length(trim(last_name)) > 0 THEN 'Mrs. ' || last_name
    WHEN first_name IS NOT NULL AND length(trim(first_name)) > 0 THEN first_name
    ELSE 'Your Teacher'
  END
)
WHERE role = 'teacher' AND classroom_name IS NULL;

UPDATE public.profiles
SET twin_name = COALESCE(twin_name, 'Coach Sparkle')
WHERE role = 'teacher' AND twin_name IS NULL;
