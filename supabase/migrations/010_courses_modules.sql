-- ============================================================
-- Migration 010: Courses & Modules
-- Adds Course → Module → Activity hierarchy
-- ============================================================

-- Subjects enum for consistent dropdown values
CREATE TYPE subject_area AS ENUM (
  'english_language_arts', 'reading', 'writing', 'math', 'science',
  'social_studies', 'history', 'geography', 'civics_government', 'economics',
  'stem', 'computer_science_technology', 'digital_literacy', 'engineering',
  'art', 'music', 'theater_drama', 'world_languages',
  'physical_education', 'health', 'social_emotional_learning',
  'study_skills_intervention', 'special_education',
  'career_technical_education', 'library_media', 'other'
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject subject_area NOT NULL DEFAULT 'other',
  grade_level TEXT,                    -- e.g. "7th Grade", "K-2", "9-12"
  is_published BOOLEAN DEFAULT false,  -- visible in catalog/library when true
  is_template BOOLEAN DEFAULT false,   -- can be imported by other teachers
  cover_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Modules table (groups of activities within a course)
CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,        -- ordering within course
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add course/module columns to existing assignments table
-- Activities can be orphaned (null course_id/module_id)
ALTER TABLE assignments
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subject subject_area,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS activity_type TEXT DEFAULT 'assignment',  -- assignment, quiz, project, discussion, reading, other
  ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]',          -- [{name, url, type}]
  ADD COLUMN IF NOT EXISTS standards JSONB DEFAULT '[]';            -- [{code, title, framework}]

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_subject ON courses(subject);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_module ON assignments(module_id);
CREATE INDEX IF NOT EXISTS idx_assignments_subject ON assignments(subject);

-- Course imports tracking (when a teacher imports another teacher's course)
CREATE TABLE IF NOT EXISTS course_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  imported_course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  imported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  imported_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_imports ENABLE ROW LEVEL SECURITY;

-- Teachers can see their own courses + published courses
CREATE POLICY courses_select ON courses FOR SELECT USING (
  teacher_id = auth.uid() OR is_published = true
);
CREATE POLICY courses_insert ON courses FOR INSERT WITH CHECK (
  teacher_id = auth.uid()
);
CREATE POLICY courses_update ON courses FOR UPDATE USING (
  teacher_id = auth.uid()
);
CREATE POLICY courses_delete ON courses FOR DELETE USING (
  teacher_id = auth.uid()
);

-- Modules: accessible if you can see the course
CREATE POLICY modules_select ON modules FOR SELECT USING (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = modules.course_id AND (courses.teacher_id = auth.uid() OR courses.is_published = true))
);
CREATE POLICY modules_insert ON modules FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = modules.course_id AND courses.teacher_id = auth.uid())
);
CREATE POLICY modules_update ON modules FOR UPDATE USING (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = modules.course_id AND courses.teacher_id = auth.uid())
);
CREATE POLICY modules_delete ON modules FOR DELETE USING (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = modules.course_id AND courses.teacher_id = auth.uid())
);
