-- Add differentiation field to assignments table
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS differentiation text;
