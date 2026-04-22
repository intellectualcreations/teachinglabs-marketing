-- ============================================================
-- Migration 023: Teacher Twin flag on message_board_replies
--
-- When the AI Teacher Twin auto-posts a reply in a topic, we store it
-- with the teacher's sender_id (keeps FK intact) plus a boolean flag
-- so the UI can distinguish Twin replies from the teacher's own replies.
-- ============================================================

ALTER TABLE public.message_board_replies
  ADD COLUMN IF NOT EXISTS is_twin BOOLEAN NOT NULL DEFAULT false;

-- Track Twin usage per-topic in case teacher wants to disable in future
ALTER TABLE public.message_board_topics
  ADD COLUMN IF NOT EXISTS twin_enabled BOOLEAN NOT NULL DEFAULT true;
