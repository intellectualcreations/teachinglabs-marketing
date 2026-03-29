-- Add unique student number column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_number TEXT UNIQUE;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_student_number ON public.profiles(student_number);
