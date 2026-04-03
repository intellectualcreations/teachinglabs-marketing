/**
 * Supabase Database type definitions for Teaching Labs.
 * These types mirror the schema defined in supabase/migrations/001_initial_schema.sql.
 *
 * For full auto-generated types, run:
 *   npx supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts
 */

export type UserRole = "admin" | "teacher" | "student" | "parent";
export type EnrollmentStatus = "active" | "inactive" | "withdrawn";
export type MessageType = "student" | "ai" | "teacher";
export type AttendanceStatusType = "present" | "absent" | "late";

export interface Profile {
  id: string;
  display_name: string | null;
  role: UserRole;
  school_id: string | null;
  avatar_url: string | null;
  student_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  district: string | null;
  address: string | null;
  admin_id: string | null;
  state: string | null;
  nces_id: string | null;
  city: string | null;
  zip: string | null;
  created_at: string;
}

export interface Class {
  id: string;
  name: string;
  subject: string | null;
  grade_level: string | null;
  teacher_id: string;
  school_id: string | null;
  join_code: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  class_id: string;
  enrolled_at: string;
  status: EnrollmentStatus;
}

export interface Assignment {
  id: string;
  title: string;
  description: string | null;
  class_id: string;
  teacher_id: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string | null;
  submitted_at: string;
  grade: number | null;
  feedback: string | null;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  class_id: string;
  content: string;
  message_type: MessageType;
  created_at: string;
}

export interface TeacherSoul {
  id: string;
  teacher_id: string;
  teaching_style: string;
  classroom_vibe: string[];
  feedback_approach: string;
  mistake_response: string;
  assistant_priorities: string[];
  struggling_student_note: string | null;
  why_learn_response: string | null;
  scenario_responses: Record<string, string> | null;
  twin_archetype: string | null;
  twin_traits: Record<string, unknown> | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbAttendanceSession {
  id: string;
  course_id: string;
  date: string;
  created_at: string;
}

export interface DbAttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  status: AttendanceStatusType;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at" | "student_number"> & {
          created_at?: string;
          updated_at?: string;
          student_number?: string | null;
        };
        Update: Partial<Omit<Profile, "id">>;
        Relationships: [];
      };
      schools: {
        Row: School;
        Insert: Omit<School, "id" | "created_at" | "state" | "nces_id" | "city" | "zip"> & {
          id?: string;
          created_at?: string;
          state?: string | null;
          nces_id?: string | null;
          city?: string | null;
          zip?: string | null;
        };
        Update: Partial<Omit<School, "id">>;
        Relationships: [];
      };
      classes: {
        Row: Class;
        Insert: Omit<Class, "id" | "created_at" | "join_code"> & {
          id?: string;
          created_at?: string;
          join_code?: string;
        };
        Update: Partial<Omit<Class, "id">>;
        Relationships: [];
      };
      enrollments: {
        Row: Enrollment;
        Insert: Omit<Enrollment, "id" | "enrolled_at"> & {
          id?: string;
          enrolled_at?: string;
          status?: EnrollmentStatus;
        };
        Update: Partial<Omit<Enrollment, "id">>;
        Relationships: [];
      };
      assignments: {
        Row: Assignment;
        Insert: Omit<Assignment, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Assignment, "id">>;
        Relationships: [];
      };
      submissions: {
        Row: Submission;
        Insert: Omit<Submission, "id" | "submitted_at"> & {
          id?: string;
          submitted_at?: string;
        };
        Update: Partial<Omit<Submission, "id">>;
        Relationships: [];
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: Omit<ChatMessage, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ChatMessage, "id">>;
        Relationships: [];
      };
      teacher_souls: {
        Row: TeacherSoul;
        Insert: Omit<TeacherSoul, "id" | "created_at" | "updated_at" | "completed_at" | "twin_archetype" | "twin_traits" | "struggling_student_note" | "why_learn_response" | "scenario_responses"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          twin_archetype?: string | null;
          twin_traits?: Record<string, unknown> | null;
          struggling_student_note?: string | null;
          why_learn_response?: string | null;
          scenario_responses?: Record<string, string> | null;
        };
        Update: Partial<Omit<TeacherSoul, "id">>;
        Relationships: [];
      };
      attendance_sessions: {
        Row: DbAttendanceSession;
        Insert: Omit<DbAttendanceSession, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DbAttendanceSession, "id">>;
        Relationships: [];
      };
      attendance_records: {
        Row: DbAttendanceRecord;
        Insert: Omit<DbAttendanceRecord, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DbAttendanceRecord, "id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      enrollment_status: EnrollmentStatus;
      message_type: MessageType;
    };
  };
}
