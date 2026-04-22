-- ============================================================
-- Migration 011: Message Board
-- Threaded class discussions (separate from 1-on-1 Chat)
-- ============================================================

-- Add per-class setting to allow/disallow student-created topics
ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS allow_student_topics BOOLEAN NOT NULL DEFAULT true;

-- Topics: a conversation thread inside a class
CREATE TABLE IF NOT EXISTS message_board_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mb_topics_class ON message_board_topics(class_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mb_topics_creator ON message_board_topics(created_by);

-- Participants: only populated when topic is private
-- (public topics are implicitly visible to the whole class)
CREATE TABLE IF NOT EXISTS message_board_participants (
  topic_id UUID NOT NULL REFERENCES message_board_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (topic_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_mb_participants_user ON message_board_participants(user_id);

-- Replies: messages posted within a topic
CREATE TABLE IF NOT EXISTS message_board_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES message_board_topics(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  -- AI moderation fields. Populated async by moderation hook.
  flagged_reason TEXT CHECK (flagged_reason IN ('content','question','urgent')),
  flagged_explanation TEXT,         -- short WHY it was flagged (shown to teacher)
  flagged_highlight TEXT,           -- specific substring/fragment to highlight
  flagged_dismissed_at TIMESTAMPTZ, -- teacher dismissed the flag
  flagged_dismissed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mb_replies_topic ON message_board_replies(topic_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_mb_replies_flagged ON message_board_replies(flagged_reason, flagged_dismissed_at)
  WHERE flagged_reason IS NOT NULL;

-- Keep updated_at fresh on topics when a reply lands
CREATE OR REPLACE FUNCTION mb_touch_topic() RETURNS TRIGGER AS $$
BEGIN
  UPDATE message_board_topics SET updated_at = now() WHERE id = NEW.topic_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS mb_replies_touch_topic ON message_board_replies;
CREATE TRIGGER mb_replies_touch_topic
  AFTER INSERT ON message_board_replies
  FOR EACH ROW EXECUTE FUNCTION mb_touch_topic();

-- Enable RLS; app uses admin client for writes so we keep policies permissive for now
ALTER TABLE message_board_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_board_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_board_replies ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically. Authenticated read policies:
CREATE POLICY mb_topics_read ON message_board_topics
  FOR SELECT USING (true);
CREATE POLICY mb_participants_read ON message_board_participants
  FOR SELECT USING (true);
CREATE POLICY mb_replies_read ON message_board_replies
  FOR SELECT USING (true);
