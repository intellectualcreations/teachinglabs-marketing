-- Teacher Soul profiles — stores Teaching Twin quiz results
CREATE TABLE public.teacher_souls (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Act 2: Teaching DNA
  teaching_style    TEXT NOT NULL,         -- 'direct' | 'inquiry' | 'collaborative' | 'experiential'
  classroom_vibe    TEXT[] NOT NULL,       -- up to 2 selections
  feedback_approach TEXT NOT NULL,         -- 'growth' | 'direct' | 'detailed' | 'encouraging'
  mistake_response  TEXT NOT NULL,         -- response to "you got this wrong..."
  
  -- Act 3: Dream Assistant
  assistant_priorities TEXT[] NOT NULL,    -- ordered array of what they want help with
  
  -- Act 4: Voice & Values
  struggling_student_note TEXT,           -- free-text: note to struggling student
  why_learn_response      TEXT,           -- free-text: "why do we learn this?"
  scenario_responses      JSONB,          -- stored scenario answers
  
  -- Act 5: Computed profile
  twin_archetype    TEXT,                 -- computed: "The Warm Strategist", "The Creative Explorer", etc.
  twin_traits       JSONB,               -- computed personality traits object
  
  -- Metadata
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(teacher_id)
);

ALTER TABLE public.teacher_souls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view own soul"
  ON public.teacher_souls FOR SELECT
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert own soul"
  ON public.teacher_souls FOR INSERT
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update own soul"
  ON public.teacher_souls FOR UPDATE
  USING (teacher_id = auth.uid());

CREATE TRIGGER set_teacher_souls_updated_at
  BEFORE UPDATE ON public.teacher_souls
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
