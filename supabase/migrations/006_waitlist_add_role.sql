-- Add role column to waitlist (teacher, admin, district, parent, other)
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS role TEXT;

-- Remove old columns that are no longer collected
-- (keeping them nullable so existing data isn't lost, just not required)
