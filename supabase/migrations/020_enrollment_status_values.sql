-- ============================================================
-- Migration 020: Extend enrollment_status enum
-- Adds 'archived' (student left, may return) and 'rejected' (join request denied)
-- to the existing enrollment_status enum (which already has active, pending, inactive).
-- ============================================================

ALTER TYPE enrollment_status ADD VALUE IF NOT EXISTS 'archived';
ALTER TYPE enrollment_status ADD VALUE IF NOT EXISTS 'rejected';
