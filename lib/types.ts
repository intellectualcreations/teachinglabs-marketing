// TeachingLabs TypeScript Interfaces

export interface Student {
  id: string;
  first: string;
  last: string;
  grade: string;
  status: 'attention' | 'on-track' | 'excelling';
  classes: string[];
  lastActive?: string;
  sessions?: number;
  mastery?: number;
  trend?: 'up' | 'down' | 'stable';
  concern?: string;
}

export interface TeacherClass {
  id: string;
  name: string;
  subject: string;
  studentCount: number;
  icon?: string;
  color?: string;
  archived?: boolean;
}

export interface Activity {
  id: string;
  title: string;
  subject: string;
  standards: { code: string; text: string }[];
  files: { name: string; size: number }[];
  links: string[];
  instructions: string;
  guidance: string;
  status: 'draft' | 'ready' | 'assigned';
  assignedTo: string[];
  createdAt: string;
}

export interface ChatMessage {
  sender: 'twin' | 'student';
  text: string;
}

export interface ChatConversation {
  student: string;
  initials: string;
  topic: string;
  time: string;
  status: 'active' | 'idle' | 'review';
  classIdx: number;
  review: boolean;
  messages: ChatMessage[];
}

export interface StatCardData {
  icon: string;
  value: string | number;
  label: string;
  color: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
}

export interface ConcernAlert {
  type: 'struggling' | 'mastery-drop' | 'inactive';
  student: string;
  detail: string;
  action: string;
}
