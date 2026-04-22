-- ============================================================
-- Migration 012: Profile Fields Cleanup
-- Stops deriving student names from email addresses by adding
-- structured columns on profiles. Aligns with the teacher
-- roster view (first/last/preferred/superhero/level/style).
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS preferred_name TEXT,
  ADD COLUMN IF NOT EXISTS name_flagged BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS superpower_title TEXT,          -- "Superhero Name" in the UI
  ADD COLUMN IF NOT EXISTS superpower_avatar TEXT,          -- avatar URL or key
  ADD COLUMN IF NOT EXISTS primary_intelligence TEXT,       -- "Learning Style" in the UI
  ADD COLUMN IF NOT EXISTS age INTEGER,
  ADD COLUMN IF NOT EXISTS baseline_level TEXT CHECK (baseline_level IN ('Basic','Proficient','Advanced')),
  ADD COLUMN IF NOT EXISTS baseline_assessment_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMPTZ;

-- Best-effort backfill from existing display_name when first/last are missing.
-- Splits on the first space. Safe to run multiple times.
UPDATE public.profiles
SET
  first_name = COALESCE(first_name, NULLIF(split_part(display_name, ' ', 1), '')),
  last_name  = COALESCE(last_name,  NULLIF(trim(substring(display_name from position(' ' in display_name) + 1)), ''))
WHERE display_name IS NOT NULL
  AND (first_name IS NULL OR last_name IS NULL);

UPDATE public.profiles
SET preferred_name = first_name
WHERE preferred_name IS NULL AND first_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_baseline_level ON public.profiles(baseline_level);
CREATE INDEX IF NOT EXISTS idx_profiles_first_last ON public.profiles(first_name, last_name);
