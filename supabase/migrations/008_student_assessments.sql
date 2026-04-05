-- Student Assessments table
-- Stores baseline assessment data from student onboarding
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.student_assessments (
  student_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT,
  preferred_name TEXT,
  name_flagged BOOLEAN DEFAULT FALSE,
  age INTEGER,
  interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  other_interests TEXT,
  theme TEXT,
  reading_level TEXT,
  math_level TEXT,
  language_tier TEXT,
  math_performance_q1 TEXT,
  math_performance_q2 TEXT,
  writing_response TEXT,
  multiple_intelligences JSONB DEFAULT '{}'::JSONB,
  logic_reasoning_level TEXT,
  logic_question TEXT,
  logic_answer_given TEXT,
  emotional_intelligence_signals JSONB DEFAULT '{}'::JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.student_assessments ENABLE ROW LEVEL SECURITY;

-- Students can read their own assessment
CREATE POLICY "Students can read own assessment"
  ON public.student_assessments FOR SELECT
  USING (auth.uid() = student_id);

-- Students can insert their own assessment (onboarding)
CREATE POLICY "Students can upsert own assessment"
  ON public.student_assessments FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own assessment (re-assessment)
CREATE POLICY "Students can update own assessment"
  ON public.student_assessments FOR UPDATE
  USING (auth.uid() = student_id);
