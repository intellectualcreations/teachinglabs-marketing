-- ============================================================
-- Migration 021: Class visibility + archive
--
-- Teacher needs two orthogonal toggles on each class:
--   show_in_sidebar  — hide from left nav without archiving (UI preference)
--   is_archived      — move out of My Classes list into Archived section;
--                      archived classes don't appear in sidebar either.
-- Data is preserved in both cases so teachers can un-archive next semester.
-- ============================================================

ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS show_in_sidebar BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_classes_teacher_archived ON public.classes(teacher_id, is_archived);
