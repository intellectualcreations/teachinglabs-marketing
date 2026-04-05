-- Migration 007: Add description and icon columns to classes table
-- These fields are used by the create-class UI but were missing from the schema.

ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS icon TEXT;
