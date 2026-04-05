-- Add activity detail fields to assignments table
-- All nullable so existing activities aren't affected

ALTER TABLE assignments ADD COLUMN IF NOT EXISTS objective text;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS materials text;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS directions text;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS assessment text;

-- Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'assignments'
  AND column_name IN ('objective', 'materials', 'directions', 'assessment');
