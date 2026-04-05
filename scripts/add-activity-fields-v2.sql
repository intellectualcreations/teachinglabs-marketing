-- Add activity detail fields (v2) to assignments table
-- Run this in Supabase SQL Editor

ALTER TABLE assignments ADD COLUMN IF NOT EXISTS learning_goal text;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS essential_question text;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS vocabulary text;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS hook text;

-- Verify all 8 detail columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'assignments'
  AND column_name IN ('objective', 'materials', 'directions', 'assessment',
                       'learning_goal', 'essential_question', 'vocabulary', 'hook');
