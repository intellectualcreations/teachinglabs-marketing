-- Class Message Board: per-class communication between students and teachers
CREATE TABLE IF NOT EXISTS public.class_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id    UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL DEFAULT '',
  sender_role TEXT NOT NULL DEFAULT 'student' CHECK (sender_role IN ('teacher', 'student')),
  content     TEXT NOT NULL,
  target_type TEXT NOT NULL DEFAULT 'class' CHECK (target_type IN ('class', 'group', 'individual')),
  target_id   UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.class_messages ENABLE ROW LEVEL SECURITY;

-- Students can read messages in classes they're enrolled in
CREATE POLICY "Students can read class messages" ON public.class_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.enrollments
      WHERE enrollments.student_id = auth.uid()
      AND enrollments.class_id = class_messages.class_id
      AND enrollments.status = 'active'
    )
  );

-- Teachers can read messages in their classes
CREATE POLICY "Teachers can read own class messages" ON public.class_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.classes
      WHERE classes.id = class_messages.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_class_messages_class_id ON public.class_messages(class_id, created_at);
