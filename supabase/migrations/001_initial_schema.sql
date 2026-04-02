-- Teaching Labs: Initial Database Schema
-- Run this in the Supabase SQL Editor or via supabase db push

-- ============================================================
-- Custom enum types
-- ============================================================

CREATE TYPE public.user_role AS ENUM ('admin', 'teacher', 'student', 'parent');
CREATE TYPE public.enrollment_status AS ENUM ('active', 'inactive', 'withdrawn');
CREATE TYPE public.message_type AS ENUM ('student', 'ai', 'teacher');

-- ============================================================
-- Schools
-- ============================================================

CREATE TABLE public.schools (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  district   TEXT,
  address    TEXT,
  admin_id   UUID,                              -- set after profiles exist
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Profiles (extends auth.users)
-- ============================================================

CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role         public.user_role NOT NULL DEFAULT 'student',
  school_id    UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Now that profiles exists, add the FK on schools.admin_id
ALTER TABLE public.schools
  ADD CONSTRAINT fk_schools_admin
  FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ============================================================
-- Classes
-- ============================================================

CREATE TABLE public.classes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  subject     TEXT,
  grade_level TEXT,
  teacher_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  school_id   UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  join_code   TEXT NOT NULL UNIQUE DEFAULT substr(md5(gen_random_uuid()::text), 1, 8),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Enrollments
-- ============================================================

CREATE TABLE public.enrollments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id    UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status      public.enrollment_status NOT NULL DEFAULT 'active',
  UNIQUE (student_id, class_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Assignments
-- ============================================================

CREATE TABLE public.assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  class_id    UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  due_date    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Submissions
-- ============================================================

CREATE TABLE public.submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content       TEXT,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  grade         NUMERIC(5,2),
  feedback      TEXT,
  UNIQUE (assignment_id, student_id)
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Chat Messages
-- ============================================================

CREATE TABLE public.chat_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id     UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  message_type public.message_type NOT NULL DEFAULT 'student',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_profiles_school   ON public.profiles(school_id);
CREATE INDEX idx_profiles_role     ON public.profiles(role);
CREATE INDEX idx_classes_teacher   ON public.classes(teacher_id);
CREATE INDEX idx_classes_school    ON public.classes(school_id);
CREATE INDEX idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX idx_enrollments_class   ON public.enrollments(class_id);
CREATE INDEX idx_assignments_class   ON public.assignments(class_id);
CREATE INDEX idx_submissions_assignment ON public.submissions(assignment_id);
CREATE INDEX idx_submissions_student    ON public.submissions(student_id);
CREATE INDEX idx_chat_messages_class    ON public.chat_messages(class_id);
CREATE INDEX idx_chat_messages_sender   ON public.chat_messages(sender_id);

-- ============================================================
-- Row Level Security Policies
-- ============================================================

-- Profiles: users can read and update their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Profiles: teachers can read profiles of students enrolled in their classes
CREATE POLICY "Teachers can view students in their classes"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.enrollments e ON e.class_id = c.id
      WHERE c.teacher_id = auth.uid()
        AND e.student_id = profiles.id
    )
  );

-- Schools: anyone authenticated can read schools
CREATE POLICY "Authenticated users can view schools"
  ON public.schools FOR SELECT
  USING (auth.role() = 'authenticated');

-- Classes: teachers can manage their own classes
CREATE POLICY "Teachers can manage own classes"
  ON public.classes FOR ALL
  USING (teacher_id = auth.uid());

-- Classes: enrolled students can view their classes
CREATE POLICY "Students can view enrolled classes"
  ON public.classes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.class_id = classes.id
        AND e.student_id = auth.uid()
        AND e.status = 'active'
    )
  );

-- Enrollments: students can view their own enrollments
CREATE POLICY "Students can view own enrollments"
  ON public.enrollments FOR SELECT
  USING (student_id = auth.uid());

-- Enrollments: teachers can manage enrollments for their classes
CREATE POLICY "Teachers can manage class enrollments"
  ON public.enrollments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = enrollments.class_id
        AND c.teacher_id = auth.uid()
    )
  );

-- Assignments: teachers can manage assignments in their classes
CREATE POLICY "Teachers can manage assignments"
  ON public.assignments FOR ALL
  USING (teacher_id = auth.uid());

-- Assignments: enrolled students can view assignments
CREATE POLICY "Students can view class assignments"
  ON public.assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.class_id = assignments.class_id
        AND e.student_id = auth.uid()
        AND e.status = 'active'
    )
  );

-- Submissions: students can view and create their own submissions
CREATE POLICY "Students can view own submissions"
  ON public.submissions FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Students can create submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- Submissions: teachers can view and update submissions in their classes
CREATE POLICY "Teachers can view and grade submissions"
  ON public.submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = submissions.assignment_id
        AND a.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update submissions (grading)"
  ON public.submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = submissions.assignment_id
        AND a.teacher_id = auth.uid()
    )
  );

-- Chat messages: class members can view messages
CREATE POLICY "Class members can view messages"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = chat_messages.class_id
        AND (
          c.teacher_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.class_id = c.id
              AND e.student_id = auth.uid()
              AND e.status = 'active'
          )
        )
    )
  );

-- Chat messages: class members can send messages
CREATE POLICY "Class members can send messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = chat_messages.class_id
        AND (
          c.teacher_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.enrollments e
            WHERE e.class_id = c.id
              AND e.student_id = auth.uid()
              AND e.status = 'active'
          )
        )
    )
  );

-- ============================================================
-- Auto-create profile on signup (trigger)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Auto-update updated_at columns
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
