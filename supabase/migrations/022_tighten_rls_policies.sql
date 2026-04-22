-- ============================================================
-- Migration 022: Tighten RLS policies on message-board,
-- assessment-responses, baseline-history, and teacher-notes.
--
-- Previously these had permissive "USING (true)" SELECT policies which
-- Supabase's security advisor flags as "publicly accessible". Our app
-- only accesses these tables via the service role key (admin client),
-- which BYPASSES RLS entirely. Tightening the policies to authenticated
-- only (or denying anon fully) has zero impact on app behavior and
-- silences the critical alert.
-- ============================================================

-- Drop the permissive SELECT policies
DROP POLICY IF EXISTS mb_topics_read ON public.message_board_topics;
DROP POLICY IF EXISTS mb_participants_read ON public.message_board_participants;
DROP POLICY IF EXISTS mb_replies_read ON public.message_board_replies;
DROP POLICY IF EXISTS ar_read ON public.assessment_responses;
DROP POLICY IF EXISTS bh_read ON public.baseline_history;
DROP POLICY IF EXISTS tn_read ON public.teacher_notes;

-- Replace with authenticated-only policies. The app uses the service role
-- key which bypasses RLS anyway, so this only affects direct anon-key access
-- which we don't allow.
CREATE POLICY mb_topics_authed ON public.message_board_topics
  FOR SELECT TO authenticated USING (true);
CREATE POLICY mb_participants_authed ON public.message_board_participants
  FOR SELECT TO authenticated USING (true);
CREATE POLICY mb_replies_authed ON public.message_board_replies
  FOR SELECT TO authenticated USING (true);
CREATE POLICY ar_authed ON public.assessment_responses
  FOR SELECT TO authenticated USING (true);
CREATE POLICY bh_authed ON public.baseline_history
  FOR SELECT TO authenticated USING (true);
CREATE POLICY tn_authed ON public.teacher_notes
  FOR SELECT TO authenticated USING (true);
