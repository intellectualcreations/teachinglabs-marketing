-- ============================================================
-- Migration 015: Unified 5-level proficiency scale
--
-- Scale: Emerging → Developing → Proficient → Advanced → Exemplary
-- Applies to: profiles.baseline_level and assessment_responses.signal_result
-- ============================================================

-- ── 1) Update profiles.baseline_level CHECK constraint ─────────
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_baseline_level_check;

-- Re-map any existing values: Basic → Developing
UPDATE public.profiles SET baseline_level = 'Developing' WHERE baseline_level = 'Basic';

-- Add the new 5-level CHECK
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_baseline_level_check
  CHECK (baseline_level IN ('Emerging','Developing','Proficient','Advanced','Exemplary'));

-- ── 2) Re-map assessment_responses.signal_result to the unified scale ──
-- Old → New
--   'emerging'    → 'Emerging'
--   'developing'  → 'Developing'
--   'strong'      → 'Advanced'
--   'lower'       → 'Developing'   (reading/math tier)
--   'middle'      → 'Proficient'
--   'upper'       → 'Advanced'
--   'struggling'  → 'Developing'   (math performance)
--   'on-track'    → 'Proficient'
--   'above'       → 'Advanced'
--   'below'       → 'Developing'
--   'on'          → 'Proficient'
UPDATE public.assessment_responses SET signal_result = 'Emerging'    WHERE signal_result IN ('emerging');
UPDATE public.assessment_responses SET signal_result = 'Developing'  WHERE signal_result IN ('developing','lower','struggling','below');
UPDATE public.assessment_responses SET signal_result = 'Proficient'  WHERE signal_result IN ('middle','on-track','on');
UPDATE public.assessment_responses SET signal_result = 'Advanced'    WHERE signal_result IN ('strong','upper','above');
-- Exemplary is reserved for brand-new students who demonstrate exemplary mastery;
-- no automatic upgrade from existing values.
