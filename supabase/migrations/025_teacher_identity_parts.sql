-- ============================================================
-- Migration 025: Teacher identity parts
--
-- Replaces the single-string classroom_name / twin_name fields with
-- structured parts so teachers pick a title prefix + last name for
-- themselves, and an AI clarifier + optional unique name for their Twin.
--
-- classroom_title    — 'Mr.' | 'Mrs.' | 'Ms.' | 'Mx.' | 'Coach' | 'Dr.' | custom
-- classroom_surname  — what follows the title (usually last_name, editable)
-- twin_clarifier     — 'Coach' | 'Spark' | 'Mentor' | 'Assistant' | 'Helper' | custom
--                      (always rendered with a mandatory 'AI ' prefix)
-- twin_unique_name   — optional ('Sparkle', 'Genius', 'Bot'); appended
--
-- The existing classroom_name / twin_name / twin_tagline columns stay as
-- computed/fallback fields \u2014 the app will read the parts and render, but
-- falling back to the string fields for any data that already exists.
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS classroom_title TEXT,
  ADD COLUMN IF NOT EXISTS classroom_surname TEXT,
  ADD COLUMN IF NOT EXISTS twin_clarifier TEXT,
  ADD COLUMN IF NOT EXISTS twin_unique_name TEXT;

-- Best-effort backfill for teachers who have a classroom_name already:
-- extract title + surname from the existing string.
UPDATE public.profiles
SET classroom_title = CASE
    WHEN classroom_name ILIKE 'Mr. %' THEN 'Mr.'
    WHEN classroom_name ILIKE 'Mrs. %' THEN 'Mrs.'
    WHEN classroom_name ILIKE 'Ms. %' THEN 'Ms.'
    WHEN classroom_name ILIKE 'Mx. %' THEN 'Mx.'
    WHEN classroom_name ILIKE 'Dr. %' THEN 'Dr.'
    WHEN classroom_name ILIKE 'Coach %' THEN 'Coach'
    ELSE 'Mrs.'
  END,
  classroom_surname = CASE
    WHEN classroom_name ILIKE 'Mr. %' THEN trim(substring(classroom_name from 5))
    WHEN classroom_name ILIKE 'Mrs. %' THEN trim(substring(classroom_name from 6))
    WHEN classroom_name ILIKE 'Ms. %' THEN trim(substring(classroom_name from 5))
    WHEN classroom_name ILIKE 'Mx. %' THEN trim(substring(classroom_name from 5))
    WHEN classroom_name ILIKE 'Dr. %' THEN trim(substring(classroom_name from 5))
    WHEN classroom_name ILIKE 'Coach %' THEN trim(substring(classroom_name from 7))
    ELSE COALESCE(last_name, classroom_name)
  END
WHERE role = 'teacher' AND classroom_title IS NULL;

-- Default Twin parts for existing teachers: "AI Coach Sparkle".
UPDATE public.profiles
SET twin_clarifier = COALESCE(twin_clarifier, 'Coach')
WHERE role = 'teacher' AND twin_clarifier IS NULL;
