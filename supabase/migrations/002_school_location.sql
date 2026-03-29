-- Teaching Labs: Add location columns to schools table
-- Supports cascading State → District → School picker

-- Add new columns
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS nces_id TEXT UNIQUE;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS zip TEXT;

-- Indexes for cascading lookups
CREATE INDEX IF NOT EXISTS idx_schools_state ON public.schools(state);
CREATE INDEX IF NOT EXISTS idx_schools_district ON public.schools(district);
CREATE INDEX IF NOT EXISTS idx_schools_state_district ON public.schools(state, district);

-- Allow anon users (during signup) to read schools
CREATE POLICY "Anyone can view schools for signup"
  ON public.schools FOR SELECT
  USING (true);

-- Allow service role inserts (seed script + "add my school")
-- RLS is bypassed by service role, but add an explicit insert policy
-- for authenticated users adding their school
CREATE POLICY "Authenticated users can add schools"
  ON public.schools FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
