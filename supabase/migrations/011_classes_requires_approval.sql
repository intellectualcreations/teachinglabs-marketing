-- Add requires_approval column to classes table
-- When true, students joining via join code go to 'pending' status
-- and require teacher approval before becoming 'active'
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN NOT NULL DEFAULT false;
