-- Teacher waitlist for controlled early access rollout
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  school_name TEXT,
  grade_level TEXT,
  state TEXT,
  how_heard TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'invited', 'joined')),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (public signup)
CREATE POLICY "Anyone can join waitlist" ON public.waitlist
  FOR INSERT WITH CHECK (true);

-- Only authenticated service role can read/update
CREATE POLICY "Service role can manage waitlist" ON public.waitlist
  FOR ALL USING (auth.role() = 'service_role');

-- Index for lookups
CREATE INDEX idx_waitlist_email ON public.waitlist (email);
CREATE INDEX idx_waitlist_status ON public.waitlist (status);
