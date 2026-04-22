-- ============================================================
-- Migration 019: Teacher-requested preferred name change
--
-- Teacher clicks "Request preferred name change" → we reset preferred_name
-- to first_name, set preferred_name_change_requested_at, and optionally
-- persist the AI's borderline reason. Student's next login shows an
-- immovable modal prompting them to choose a new preferred name.
-- Once they pick one, requested_at is cleared and the loop is done.
-- No persistent "flag" state on the table.
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS preferred_name_change_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS preferred_name_change_requested_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS preferred_name_borderline_reason TEXT;

-- Nothing about name_flagged is persistent; keep the column for back-compat
-- but flip the semantics so true means "AI currently considers the chosen
-- preferred_name borderline". It's recomputed on every name save, not a sticky flag.
