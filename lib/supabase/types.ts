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

export interface Profile {
  id: string;
  display_name: string | null;
  role: UserRole;
  school_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  district: string | null;
  address: string | null;
  admin_id: string | null;
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

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, "id">>;
      };
      schools: {
        Row: School;
        Insert: Omit<School, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<School, "id">>;
      };
      classes: {
        Row: Class;
        Insert: Omit<Class, "id" | "created_at" | "join_code"> & {
          id?: string;
          created_at?: string;
          join_code?: string;
        };
        Update: Partial<Omit<Class, "id">>;
      };
      enrollments: {
        Row: Enrollment;
        Insert: Omit<Enrollment, "id" | "enrolled_at"> & {
          id?: string;
          enrolled_at?: string;
          status?: EnrollmentStatus;
        };
        Update: Partial<Omit<Enrollment, "id">>;
      };
      assignments: {
        Row: Assignment;
        Insert: Omit<Assignment, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Assignment, "id">>;
      };
      submissions: {
        Row: Submission;
        Insert: Omit<Submission, "id" | "submitted_at"> & {
          id?: string;
          submitted_at?: string;
        };
        Update: Partial<Omit<Submission, "id">>;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: Omit<ChatMessage, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ChatMessage, "id">>;
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
