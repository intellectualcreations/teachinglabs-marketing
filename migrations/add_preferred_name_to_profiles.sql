-- Add preferred_name column to profiles table
-- Teachers use this to set what students see (e.g. "Mrs. Stewart", "Mr. D", "Coach K")
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_name TEXT DEFAULT NULL;
