-- ============================================================
-- Migration 014: Generic assessment_responses table
--
-- One row per question the student answered during assessment.
-- Replaces the narrow Q&A columns on student_assessments.
-- Adding a new assessment question = no migration needed;
-- it just flows into this table and into the teacher panel.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,              -- 'reading' | 'math' | 'logic' | 'writing' | 'musical' | 'kinesthetic' | 'spatial' | 'linguistic' | 'interpersonal' | 'intrapersonal' | 'eq' | 'authenticity'
  question_key TEXT NOT NULL,          -- stable identifier, e.g. 'math_q1', 'eq_friend_response'
  question_order INT,
  question_text TEXT,                  -- the text the student literally saw
  question_type TEXT,                  -- 'text' | 'number' | 'checkbox' | 'multi_choice' | 'scale'
  options_shown JSONB,                 -- for checkbox / multi-choice: full option list
  student_answer TEXT,                 -- raw text; JSON string for arrays
  correct_answer TEXT,                 -- nullable (only for math/logic)
  signal_result TEXT,                  -- derived signal: 'strong' | 'developing' | 'emerging' | 'above' | 'on-track' | etc.
  scoring_metadata JSONB,              -- any extra scoring data
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, question_key)    -- one response per student per question
);

CREATE INDEX IF NOT EXISTS idx_ar_student ON public.assessment_responses(student_id, category, question_order);
CREATE INDEX IF NOT EXISTS idx_ar_category ON public.assessment_responses(category);

ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY ar_read ON public.assessment_responses FOR SELECT USING (true);

-- ── Drop the narrow Q&A columns added in migration 013 ─────────────────
-- These are replaced by assessment_responses rows. Safe to drop once
-- onboarding writes to the new table and the teacher panel reads from it.
ALTER TABLE public.student_assessments
  DROP COLUMN IF EXISTS reading_passage,
  DROP COLUMN IF EXISTS reading_question,
  DROP COLUMN IF EXISTS reading_student_answer,
  DROP COLUMN IF EXISTS math_q1_question,
  DROP COLUMN IF EXISTS math_q1_student_answer,
  DROP COLUMN IF EXISTS math_q1_correct_answer,
  DROP COLUMN IF EXISTS math_q2_question,
  DROP COLUMN IF EXISTS math_q2_student_answer,
  DROP COLUMN IF EXISTS math_q2_correct_answer;
