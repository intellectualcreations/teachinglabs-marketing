'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  List, HouseLine, Archive, CaretRight, CaretDown, Plus,
  ClipboardText, Check, PaperPlaneRight, Paperclip,
  Camera, FileText, PencilLine, Cube, Microphone, X,
  MathOperations, BookOpenText, Flask, GlobeHemisphereWest, SquaresFour,
  ChatCircle, Trophy, Lightning, Clock, CalendarBlank, EnvelopeSimple,
} from '@phosphor-icons/react';
import Link from 'next/link';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { createClient } from '@/lib/supabase/client';
import type { Profile, Class, Enrollment, Assignment, Submission, ChatMessage } from '@/lib/supabase/types';

// ============ HELPERS ============

const SUBJECT_STYLES: Record<string, { icon: 'math' | 'science' | 'ela' | 'social'; color: string; iconBg: string }> = {
  math: { icon: 'math', color: '#3B82F6', iconBg: 'rgba(59,130,246,0.15)' },
  mathematics: { icon: 'math', color: '#3B82F6', iconBg: 'rgba(59,130,246,0.15)' },
  algebra: { icon: 'math', color: '#3B82F6', iconBg: 'rgba(59,130,246,0.15)' },
  science: { icon: 'science', color: '#10B981', iconBg: 'rgba(16,185,129,0.15)' },
  biology: { icon: 'science', color: '#10B981', iconBg: 'rgba(16,185,129,0.15)' },
  chemistry: { icon: 'science', color: '#10B981', iconBg: 'rgba(16,185,129,0.15)' },
  physics: { icon: 'science', color: '#10B981', iconBg: 'rgba(16,185,129,0.15)' },
  english: { icon: 'ela', color: '#F59E0B', iconBg: 'rgba(245,158,11,0.15)' },
  ela: { icon: 'ela', color: '#F59E0B', iconBg: 'rgba(245,158,11,0.15)' },
  reading: { icon: 'ela', color: '#F59E0B', iconBg: 'rgba(245,158,11,0.15)' },
  writing: { icon: 'ela', color: '#F59E0B', iconBg: 'rgba(245,158,11,0.15)' },
  social: { icon: 'social', color: '#A48BFA', iconBg: 'rgba(164,139,250,0.15)' },
  history: { icon: 'social', color: '#A48BFA', iconBg: 'rgba(164,139,250,0.15)' },
  geography: { icon: 'social', color: '#A48BFA', iconBg: 'rgba(164,139,250,0.15)' },
};

function getSubjectStyle(subject: string | null) {
  if (!subject) return { icon: 'ela' as const, color: '#F59E0B', iconBg: 'rgba(245,158,11,0.15)' };
  const key = subject.toLowerCase();
  for (const [k, v] of Object.entries(SUBJECT_STYLES)) {
    if (key.includes(k)) return v;
  }
  return { icon: 'ela' as const, color: '#F59E0B', iconBg: 'rgba(245,158,11,0.15)' };
}

const CLASS_ICONS = {
  math: <MathOperations size={16} weight="fill" className="text-white" />,
  science: <Flask size={16} weight="fill" className="text-white" />,
  ela: <BookOpenText size={16} weight="fill" className="text-white" />,
  social: <GlobeHemisphereWest size={16} weight="fill" className="text-white" />,
};

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============ TYPES ============

interface ChatMsg {
  id: string;
  role: 'ai' | 'student';
  text: string;
  attachment?: { type: string; name: string; size: string };
  image?: { src: string; alt: string; fileName: string };
}

interface SidebarClass {
  id: string;
  name: string;
  teacher: string;
  teacherInitial: string;
  iconKey: 'math' | 'science' | 'ela' | 'social';
  iconBg: string;
  assignments: Assignment[];
  submissions: Submission[];
}

type ViewMode = 'chat' | 'new-chat' | 'welcome' | 'class-dashboard';

let msgIdCounter = 100;
function newMsgId() { return `msg-${++msgIdCounter}`; }

export default function StudentMainPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-warm-white"><div className="text-text-muted text-sm">Loading...</div></div>}>
      <StudentMainInner />
    </Suspense>
  );
}

function StudentMainInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialClassParam = searchParams.get('class') || '';
  const initialView = searchParams.get('view') === 'class-dashboard' ? 'class-dashboard' as ViewMode : 'welcome' as ViewMode;

  // Loading / error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User state
  const [userId, setUserId] = useState('');
  const [studentName, setStudentName] = useState('Student');
  const [studentInitials, setStudentInitials] = useState('S');

  // Data state
  const [sidebarClasses, setSidebarClasses] = useState<SidebarClass[]>([]);
  const [chatMessagesMap, setChatMessagesMap] = useState<Map<string, ChatMessage[]>>(new Map());

  // UI state
  const [currentClassId, setCurrentClassId] = useState<string>('');
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [currentChatType, setCurrentChatType] = useState<'lesson' | 'open' | 'archived' | 'turnedin'>('open');
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [chatName, setChatName] = useState('');
  const [newChatName, setNewChatName] = useState('');
  const [showTurnInConfirm, setShowTurnInConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [turnedIn, setTurnedIn] = useState(false);
  const chatViewRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (chatViewRef.current) {
        chatViewRef.current.scrollTop = chatViewRef.current.scrollHeight;
      }
    }, 100);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

  // Fetch all data from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUserId(user.id);

        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        const profile = profileData as unknown as Profile | null;
        const displayName = profile?.display_name || 'Student';
        setStudentName(displayName);
        setStudentInitials(getInitials(displayName));

        // Fetch enrollments
        const { data: enrollmentData } = await supabase
          .from('enrollments')
          .select('*')
          .eq('student_id', user.id)
          .eq('status', 'active');
        const enrollments = (enrollmentData ?? []) as unknown as Enrollment[];

        if (enrollments.length === 0) {
          setSidebarClasses([]);
          setLoading(false);
          return;
        }

        const classIds = enrollments.map(e => e.class_id);

        // Fetch classes
        const { data: classData } = await supabase
          .from('classes')
          .select('*')
          .in('id', classIds);
        const classRows = (classData ?? []) as unknown as Class[];

        // Fetch teacher profiles
        const teacherIds = [...new Set(classRows.map(c => c.teacher_id))];
        const { data: teacherData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', teacherIds);
        const teachers = (teacherData ?? []) as unknown as Profile[];
        const teacherMap = new Map(teachers.map(t => [t.id, t]));

        // Fetch assignments for all classes
        const { data: assignmentData } = await supabase
          .from('assignments')
          .select('*')
          .in('class_id', classIds)
          .order('created_at', { ascending: false });
        const assignments = (assignmentData ?? []) as unknown as Assignment[];

        // Fetch submissions for this student
        const assignmentIds = assignments.map(a => a.id);
        let submissions: Submission[] = [];
        if (assignmentIds.length > 0) {
          const { data: submissionData } = await supabase
            .from('submissions')
            .select('*')
            .eq('student_id', user.id)
            .in('assignment_id', assignmentIds);
          submissions = (submissionData ?? []) as unknown as Submission[];
        }

        // Fetch chat messages for all classes
        const { data: chatData } = await supabase
          .from('chat_messages')
          .select('*')
          .in('class_id', classIds)
          .order('created_at', { ascending: true });
        const allChats = (chatData ?? []) as unknown as ChatMessage[];

        // Group chat messages by class_id
        const chatMap = new Map<string, ChatMessage[]>();
        for (const msg of allChats) {
          const arr = chatMap.get(msg.class_id) || [];
          arr.push(msg);
          chatMap.set(msg.class_id, arr);
        }
        setChatMessagesMap(chatMap);

        // Build sidebar classes
        const sClasses: SidebarClass[] = classRows.map(cls => {
          const style = getSubjectStyle(cls.subject);
          const teacher = teacherMap.get(cls.teacher_id);
          const classAssignments = assignments.filter(a => a.class_id === cls.id);
          const classSubmissions = submissions.filter(s => classAssignments.some(a => a.id === s.assignment_id));

          return {
            id: cls.id,
            name: cls.name,
            teacher: teacher?.display_name || 'Teacher',
            teacherInitial: getInitials(teacher?.display_name || 'Teacher').charAt(0),
            iconKey: style.icon,
            iconBg: style.iconBg,
            assignments: classAssignments,
            submissions: classSubmissions,
          };
        });

        setSidebarClasses(sClasses);

        // If a class was specified in URL, select it
        if (initialClassParam && sClasses.some(c => c.id === initialClassParam)) {
          setCurrentClassId(initialClassParam);
          setExpandedClasses(new Set([initialClassParam]));
          if (initialView === 'class-dashboard') {
            setViewMode('class-dashboard');
          } else {
            setViewMode('class-dashboard');
          }
        } else if (sClasses.length > 0) {
          setViewMode('welcome');
        }

        setLoading(false);
      } catch (err) {
        console.error('Main page fetch error:', err);
        setError('Something went wrong. Please try refreshing.');
        setLoading(false);
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Current class data
  const currentClass = sidebarClasses.find(c => c.id === currentClassId);

  // Get lessons (assignments without submissions) and turned in (with submissions)
  const submittedAssignmentIds = new Set(currentClass?.submissions.map(s => s.assignment_id) || []);
  const openLessons = (currentClass?.assignments || []).filter(a => !submittedAssignmentIds.has(a.id));
  const turnedInItems = (currentClass?.assignments || []).filter(a => submittedAssignmentIds.has(a.id));

  // Get chat messages for current class
  const currentClassChats = chatMessagesMap.get(currentClassId) || [];

  // Status color helper
  const statusColor = (dueDate: string | null) => {
    if (!dueDate) return 'bg-teal/10 text-teal';
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'bg-coral/10 text-coral';
    if (diffDays <= 2) return 'bg-warning/10 text-warning';
    return 'bg-teal/10 text-teal';
  };

  const dueLabel = (dueDate: string | null) => {
    if (!dueDate) return 'No due date';
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  // Sidebar interactions
  const toggleClass = (id: string) => {
    setExpandedClasses(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const openClassDashboard = (classId: string) => {
    setCurrentClassId(classId);
    setViewMode('class-dashboard');
    setSidebarOpen(false);
  };

  const openAssignmentChat = (classId: string, assignmentId: string, type: 'lesson' | 'turnedin') => {
    setCurrentClassId(classId);
    setCurrentChatId(assignmentId);
    setCurrentChatType(type);
    setViewMode('chat');
    setTurnedIn(type === 'turnedin');

    const cls = sidebarClasses.find(c => c.id === classId);
    const assignment = cls?.assignments.find(a => a.id === assignmentId);
    if (assignment) setChatName(assignment.title);

    // Load chat messages for this class
    const classChats = chatMessagesMap.get(classId) || [];
    if (classChats.length > 0) {
      setMessages(classChats.map(m => ({
        id: m.id,
        role: m.message_type === 'student' ? 'student' as const : 'ai' as const,
        text: m.content,
      })));
    } else {
      setMessages([{
        id: newMsgId(),
        role: 'ai',
        text: `Hi ${studentName.split(' ')[0]}! What would you like to work on today? 😊`,
      }]);
    }

    setSidebarOpen(false);
    if (!expandedClasses.has(classId)) {
      setExpandedClasses(prev => new Set([...prev, classId]));
    }
  };

  const openFreeChat = (classId: string) => {
    setCurrentClassId(classId);
    setCurrentChatId('free-chat');
    setCurrentChatType('open');
    setViewMode('chat');
    setTurnedIn(false);

    const cls = sidebarClasses.find(c => c.id === classId);
    setChatName(cls?.name || 'Chat');

    const classChats = chatMessagesMap.get(classId) || [];
    if (classChats.length > 0) {
      setMessages(classChats.map(m => ({
        id: m.id,
        role: m.message_type === 'student' ? 'student' as const : 'ai' as const,
        text: m.content,
      })));
    } else {
      setMessages([{
        id: newMsgId(),
        role: 'ai',
        text: `Hi ${studentName.split(' ')[0]}! What would you like to work on in ${cls?.name.toLowerCase() || 'this class'} today? 😊`,
      }]);
    }

    setSidebarOpen(false);
    if (!expandedClasses.has(classId)) {
      setExpandedClasses(prev => new Set([...prev, classId]));
    }
  };

  const startNewChat = (classId: string) => {
    setCurrentClassId(classId);
    setCurrentChatId('');
    setViewMode('new-chat');
    setNewChatName('');
    setSidebarOpen(false);
    if (!expandedClasses.has(classId)) {
      setExpandedClasses(prev => new Set([...prev, classId]));
    }
  };

  const beginNamedChat = () => {
    const name = newChatName.trim() || 'New chat';
    setChatName(name);
    setCurrentChatId(`chat-${Date.now()}`);
    setCurrentChatType('open');
    setViewMode('chat');
    setMessages([{
      id: newMsgId(),
      role: 'ai',
      text: `Hi ${studentName.split(' ')[0]}! What would you like to work on in ${currentClass?.name.toLowerCase() || 'this class'} today? 😊`,
    }]);
  };

  // Chat send
  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || !currentClassId) return;

    const localId = newMsgId();
    setMessages(prev => [...prev, { id: localId, role: 'student', text }]);
    setInputText('');
    if (inputRef.current) inputRef.current.style.height = 'auto';

    setIsTyping(true);

    try {
      const res = await fetch('/api/student/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ class_id: currentClassId, content: text }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsTyping(false);
        if (data.aiMessage) {
          setMessages(prev => [...prev, {
            id: data.aiMessage.id || newMsgId(),
            role: 'ai',
            text: data.aiMessage.content || "Thanks for your message! Your AI tutor will respond shortly.",
          }]);
        }
      } else {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: newMsgId(),
          role: 'ai',
          text: "Sorry, I couldn't send that message. Please try again.",
        }]);
      }
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: newMsgId(),
        role: 'ai',
        text: "Sorry, something went wrong. Please try again.",
      }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // Upload (keep demo behavior for now)
  const simulateUpload = (type: string) => {
    setShowUploadMenu(false);
    const files: Record<string, { name: string; size: string }> = {
      photo: { name: 'homework_page1.jpg', size: '1.2 MB' },
      file: { name: 'chapter7_worksheet.pdf', size: '245 KB' },
      drawing: { name: 'my_work.png', size: '890 KB' },
      '3d': { name: 'my_design.stl', size: '3.4 MB' },
      audio: { name: 'my_recording.mp4', size: '8.2 MB' },
    };
    const f = files[type] || { name: 'project_file.zip', size: '1.5 MB' };
    const typeLabels: Record<string, string> = { photo: '📷', file: '📄', drawing: '✏️', '3d': '🧊', audio: '🎙️' };
    setMessages(prev => [...prev, {
      id: newMsgId(), role: 'student', text: '',
      attachment: { type: typeLabels[type] || '📎', name: f.name, size: f.size },
    }]);
    setIsTyping(true);
    const responses: Record<string, string> = {
      photo: "Got it! Let me take a look at your work... I can see your answers. Nice job! Let me review them.",
      file: "I see the worksheet! Let me read through it. Which problems do you want help with?",
      drawing: "I can see your drawing! Walk me through your thinking and I'll help where you got stuck.",
      '3d': "Cool 3D model! Want me to check the dimensions, or are you looking for design feedback?",
      audio: "Got your recording! Is this for a presentation, or do you want feedback?",
    };
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: newMsgId(), role: 'ai',
        text: responses[type] || "Got your file! What would you like me to help with?",
      }]);
    }, 1500);
  };

  // Turn in (confirmation + status change)
  const confirmTurnIn = () => {
    setShowTurnInConfirm(false);
    setTurnedIn(true);

    setMessages(prev => [
      ...prev,
      { id: newMsgId(), role: 'ai', text: '🎉__TURNIN_NOTICE__' },
    ]);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: newMsgId(), role: 'ai', text: `Nice work, ${studentName.split(' ')[0]}! Your assignment has been turned in. ${currentClass?.teacher || 'Your teacher'} will review it.` },
      ]);
    }, 600);

    setCurrentChatType('turnedin');
  };

  // Archive
  const confirmArchive = () => {
    setShowArchiveConfirm(false);
    setMessages(prev => [...prev, { id: newMsgId(), role: 'ai', text: '📦__ARCHIVE_NOTICE__' }]);
    setCurrentChatType('archived');
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-warm-white">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-teal border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-muted">Loading your classes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-warm-white">
        <div className="text-center max-w-sm bg-card-bg border border-border rounded-2xl shadow-sm px-8 py-10">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="font-heading font-bold text-lg text-text-primary mb-2">Oops!</h2>
          <p className="text-sm text-text-secondary mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-5 py-2 bg-teal text-navy rounded-lg text-sm font-semibold hover:bg-teal/90 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No classes empty state
  if (sidebarClasses.length === 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-warm-white">
        <div className="text-center max-w-sm bg-card-bg border border-border rounded-2xl shadow-sm px-8 py-10">
          <div className="text-5xl mb-4 opacity-60">📚</div>
          <h2 className="font-heading font-bold text-xl text-text-primary mb-2">Join a class to start chatting with your AI tutor!</h2>
          <p className="text-sm text-text-secondary mb-4">Ask your teacher for a class code to get started.</p>
          <Link href="/student/dashboard" className="inline-flex items-center gap-2 px-5 py-2 bg-teal text-navy rounded-lg text-sm font-semibold hover:bg-teal/90 transition-colors">
            <SquaresFour size={16} weight="fill" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[99] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex h-screen w-screen overflow-hidden bg-warm-white">
        {/* ============ SIDEBAR ============ */}
        <aside className={`
          w-[280px] min-w-[280px] bg-navy flex flex-col overflow-hidden
          fixed lg:static top-0 bottom-0 left-0 z-[100] transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Sidebar header */}
          <div className="px-4 py-4 border-b border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal text-white flex items-center justify-center font-heading font-bold text-sm flex-shrink-0">{studentInitials}</div>
            <div>
              <div className="font-heading font-semibold text-sm text-white">{studentName}</div>
              <div className="text-[11px] text-white/50">Student</div>
            </div>
          </div>

          {/* Dashboard button */}
          <nav className="px-2 py-2 border-b border-white/10">
            <Link
              href="/student/dashboard"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-teal text-white font-semibold text-sm hover:bg-teal/90 transition-colors"
            >
              <SquaresFour size={18} weight="fill" />
              Dashboard
            </Link>
          </nav>

          {/* Class list */}
          <div className="flex-1 overflow-y-auto pb-4">
            <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-[1.2px] text-white/50">My Classes</div>

            {sidebarClasses.map(cls => {
              const isExpanded = expandedClasses.has(cls.id);
              const isCurrent = cls.id === currentClassId;
              const clsOpenLessons = cls.assignments.filter(a => !cls.submissions.some(s => s.assignment_id === a.id));
              const clsTurnedIn = cls.assignments.filter(a => cls.submissions.some(s => s.assignment_id === a.id));
              const clsChats = chatMessagesMap.get(cls.id) || [];
              const hasChats = clsChats.length > 0;

              return (
                <div key={cls.id} className="mx-2 mb-0.5">
                  {/* Class header */}
                  <div
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${isCurrent ? 'bg-white/[0.15] border-l-2 border-teal' : 'hover:bg-white/[0.12]'}`}
                  >
                    <div
                      onClick={() => openClassDashboard(cls.id)}
                      className="flex items-center gap-2.5 flex-1 min-w-0"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cls.iconBg }}>
                        {CLASS_ICONS[cls.iconKey]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs text-white truncate">{cls.name}</div>
                        <div className="text-[11px] text-white/50">{cls.teacher}</div>
                      </div>
                    </div>
                    <div
                      onClick={(e) => { e.stopPropagation(); toggleClass(cls.id); }}
                      className={`w-5 h-5 flex items-center justify-center text-white/40 transition-transform hover:text-white ${isExpanded ? 'rotate-90' : ''}`}
                    >
                      <CaretRight size={14} weight="fill" />
                    </div>
                  </div>

                  {/* Expanded class body */}
                  {isExpanded && (
                    <div className="pb-2">
                      {/* Open Activities */}
                      {clsOpenLessons.length > 0 && (
                        <>
                          <button
                            onClick={() => toggleSection(`${cls.id}-lessons`)}
                            className="flex items-center w-full pl-[54px] pr-3 py-1.5 text-left text-[10px] font-bold uppercase tracking-[0.8px] text-white/50 hover:text-white/70 transition-colors"
                          >
                            <span className={`mr-1 transition-transform ${collapsedSections.has(`${cls.id}-lessons`) ? '-rotate-90' : ''}`}>
                              <CaretDown size={10} weight="fill" />
                            </span>
                            Open Activities
                            <span className="ml-auto text-[9px] font-semibold bg-white/10 text-white/50 px-1.5 py-0.5 rounded-md">{clsOpenLessons.length}</span>
                          </button>
                          {!collapsedSections.has(`${cls.id}-lessons`) && clsOpenLessons.map(item => (
                            <div
                              key={item.id}
                              onClick={() => openAssignmentChat(cls.id, item.id, 'lesson')}
                              className={`flex items-center gap-2 pl-[54px] pr-3 py-1.5 mx-2 rounded-md cursor-pointer text-xs transition-colors
                                ${cls.id === currentClassId && item.id === currentChatId ? 'bg-teal/20 text-teal font-medium' : 'text-white/70 hover:text-white hover:bg-white/[0.08]'}`}
                            >
                              <span className="flex-shrink-0 text-[13px]">📋</span>
                              <span className="flex-1 truncate">{item.title}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${statusColor(item.due_date)}`}>{dueLabel(item.due_date)}</span>
                            </div>
                          ))}
                        </>
                      )}

                      {/* Turned In */}
                      {clsTurnedIn.length > 0 && (
                        <>
                          <button
                            onClick={() => toggleSection(`${cls.id}-turnedin`)}
                            className="flex items-center w-full pl-[54px] pr-3 py-1.5 text-left text-[10px] font-bold uppercase tracking-[0.8px] text-white/50 hover:text-white/70 transition-colors"
                          >
                            <span className={`mr-1 transition-transform ${collapsedSections.has(`${cls.id}-turnedin`) ? '-rotate-90' : ''}`}>
                              <CaretDown size={10} weight="fill" />
                            </span>
                            Turned In
                            <span className="ml-auto text-[9px] font-semibold bg-white/10 text-white/50 px-1.5 py-0.5 rounded-md">{clsTurnedIn.length}</span>
                          </button>
                          {!collapsedSections.has(`${cls.id}-turnedin`) && clsTurnedIn.map(item => (
                            <div
                              key={item.id}
                              onClick={() => openAssignmentChat(cls.id, item.id, 'turnedin')}
                              className={`flex items-center gap-2 pl-[54px] pr-3 py-1.5 mx-2 rounded-md cursor-pointer text-xs transition-colors opacity-70
                                ${cls.id === currentClassId && item.id === currentChatId ? 'bg-teal/20 text-teal font-medium opacity-100' : 'text-white/70 hover:text-white hover:bg-white/[0.08]'}`}
                            >
                              <span className="flex-shrink-0 text-[13px]">✅</span>
                              <span className="flex-1 truncate">{item.title}</span>
                            </div>
                          ))}
                        </>
                      )}

                      {/* Open Chats */}
                      <button
                        onClick={() => toggleSection(`${cls.id}-chats`)}
                        className="flex items-center w-full pl-[54px] pr-3 py-1.5 text-left text-[10px] font-bold uppercase tracking-[0.8px] text-white/50 hover:text-white/70 transition-colors"
                      >
                        <span className={`mr-1 transition-transform ${collapsedSections.has(`${cls.id}-chats`) ? '-rotate-90' : ''}`}>
                          <CaretDown size={10} weight="fill" />
                        </span>
                        Open Chats
                        <span className="ml-auto text-[9px] font-semibold bg-white/10 text-white/50 px-1.5 py-0.5 rounded-md">{hasChats ? 1 : 0}</span>
                      </button>
                      {!collapsedSections.has(`${cls.id}-chats`) && (
                        <>
                          {hasChats && (
                            <div
                              onClick={() => openFreeChat(cls.id)}
                              className={`flex items-center gap-2 pl-[54px] pr-3 py-1.5 mx-2 rounded-md cursor-pointer text-xs transition-colors
                                ${cls.id === currentClassId && currentChatId === 'free-chat' ? 'bg-teal/20 text-teal font-medium' : 'text-white/70 hover:text-white hover:bg-white/[0.08]'}`}
                            >
                              <span className="flex-shrink-0 text-[13px]">💬</span>
                              <span className="flex-1 truncate">Chat with tutor</span>
                              <span className="text-[10px] text-white/40 flex-shrink-0">{timeAgo(clsChats[clsChats.length - 1].created_at)}</span>
                            </div>
                          )}
                          <button
                            onClick={() => startNewChat(cls.id)}
                            className="flex items-center gap-1.5 pl-[54px] pr-3 py-1.5 mx-2 rounded-md w-full text-left text-xs text-teal font-medium hover:bg-white/[0.08] transition-colors"
                          >
                            <Plus size={14} weight="fill" /> New chat
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* ============ MAIN AREA ============ */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 sm:px-6 py-3.5 border-b border-border bg-card-bg shadow-sm min-h-14">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-teal/[0.06] text-text-primary transition-colors"
            >
              <List size={22} weight="fill" />
            </button>
            <Link
              href="/student/dashboard"
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-text-muted hover:border-teal hover:text-teal transition-colors flex-shrink-0"
            >
              <HouseLine size={16} weight="fill" />
            </Link>
            {viewMode === 'chat' && currentClass ? (
              <>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: currentClass.iconBg }}>
                  {CLASS_ICONS[currentClass.iconKey]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-semibold text-sm text-text-primary truncate">{chatName}</div>
                  <div className="text-xs text-text-muted">{currentClass.name} · {currentClass.teacher}</div>
                </div>
                <button
                  onClick={() => setShowArchiveConfirm(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-text-muted hover:border-teal hover:text-teal transition-colors flex-shrink-0"
                  title="Archive this chat"
                >
                  <Archive size={16} weight="fill" />
                </button>
                <ThemeToggle />
              </>
            ) : viewMode === 'new-chat' && currentClass ? (
              <>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: currentClass.iconBg }}>
                  {CLASS_ICONS[currentClass.iconKey]}
                </div>
                <div className="flex-1">
                  <div className="font-heading font-semibold text-sm text-text-primary">New Chat</div>
                  <div className="text-xs text-text-muted">{currentClass.name} · {currentClass.teacher}</div>
                </div>
                <ThemeToggle />
              </>
            ) : viewMode === 'class-dashboard' && currentClass ? (
              <>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: currentClass.iconBg }}>
                  {CLASS_ICONS[currentClass.iconKey]}
                </div>
                <div className="flex-1">
                  <div className="font-heading font-semibold text-sm text-text-primary">{currentClass.name}</div>
                  <div className="text-xs text-text-muted">{currentClass.teacher} · Class Dashboard</div>
                </div>
                <ThemeToggle />
              </>
            ) : (
              <>
                <div className="flex-1">
                  <div className="font-heading font-semibold text-sm text-text-primary">My Classes</div>
                </div>
                <ThemeToggle />
              </>
            )}
          </div>

          {/* ---- WELCOME VIEW ---- */}
          {viewMode === 'welcome' && (
            <div className="flex-1 flex items-center justify-center p-10">
              <div className="text-center max-w-sm bg-card-bg border border-border rounded-2xl shadow-sm px-8 py-10">
                <div className="text-5xl mb-4 opacity-60">👋</div>
                <h2 className="font-heading font-bold text-xl text-text-primary mb-2">Hi {studentName.split(' ')[0]}!</h2>
                <p className="text-sm text-text-secondary leading-relaxed">Pick a class from the sidebar to continue a chat, or start a new one.</p>
              </div>
            </div>
          )}

          {/* ---- CLASS DASHBOARD VIEW ---- */}
          {viewMode === 'class-dashboard' && currentClass && (() => {
            const classChats = chatMessagesMap.get(currentClassId) || [];
            const studentMsgCount = classChats.filter(m => m.message_type === 'student').length;
            const clsOpenLessons = currentClass.assignments.filter(a => !submittedAssignmentIds.has(a.id));
            const clsTurnedIn = currentClass.assignments.filter(a => submittedAssignmentIds.has(a.id));

            return (
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
                {/* Class Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: currentClass.iconBg }}>
                    {CLASS_ICONS[currentClass.iconKey]}
                  </div>
                  <div>
                    <h1 className="font-heading font-bold text-xl text-text-primary">{currentClass.name}</h1>
                    <p className="text-sm text-text-secondary">{currentClass.teacher}</p>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Messages', value: studentMsgCount, icon: <ChatCircle size={20} weight="fill" className="text-teal" />, bg: 'bg-teal/[0.08]' },
                    { label: 'Open Activities', value: clsOpenLessons.length, icon: <ClipboardText size={20} weight="fill" className="text-[#D4A843]" />, bg: 'bg-[#D4A843]/[0.08]' },
                    { label: 'Turned In', value: clsTurnedIn.length, icon: <Lightning size={20} weight="fill" className="text-[#1F3A5F]" />, bg: 'bg-[#1F3A5F]/[0.08]' },
                    { label: 'Total Assignments', value: currentClass.assignments.length, icon: <Trophy size={20} weight="fill" className="text-[#D4A843]" />, bg: 'bg-[#D4A843]/[0.08]' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-card-bg border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${stat.bg}`}>
                        {stat.icon}
                      </div>
                      <div className="font-heading font-bold text-2xl text-text-primary">{stat.value}</div>
                      <div className="text-xs text-text-muted">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Recent messages */}
                {classChats.length > 0 && (
                  <div className="bg-card-bg border border-border rounded-xl p-4 mb-4">
                    <h2 className="font-heading font-semibold text-sm text-text-primary mb-3 flex items-center gap-2">
                      <EnvelopeSimple size={16} weight="fill" className="text-teal" />
                      Recent Messages
                    </h2>
                    <div className="flex flex-col gap-3">
                      {classChats.slice(-5).reverse().map(msg => (
                        <div key={msg.id} className="flex gap-3 px-3 py-3 rounded-lg hover:bg-teal/[0.05] transition-colors cursor-pointer"
                          onClick={() => openFreeChat(currentClassId)}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5 ${msg.message_type === 'student' ? 'bg-teal' : 'bg-navy'}`}
                          >
                            {msg.message_type === 'student' ? studentInitials : currentClass.teacherInitial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-heading font-semibold text-sm text-text-primary truncate">
                                {msg.message_type === 'student' ? 'You' : `${currentClass.teacher}'s Assistant`}
                              </span>
                              {msg.message_type === 'ai' && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal/[0.1] text-teal flex-shrink-0">AI</span>
                              )}
                              <span className="text-[11px] text-text-muted flex-shrink-0 ml-auto">{timeAgo(msg.created_at)}</span>
                            </div>
                            <p className="text-sm text-text-secondary leading-relaxed truncate">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Open Activities */}
                {clsOpenLessons.length > 0 && (
                  <div className="bg-card-bg border border-border rounded-xl p-4 mb-4">
                    <h2 className="font-heading font-semibold text-sm text-text-primary mb-3 flex items-center gap-2">
                      <CalendarBlank size={16} weight="fill" className="text-[#D4A843]" />
                      Open Activities
                    </h2>
                    <div className="flex flex-col gap-1">
                      {clsOpenLessons.map(item => (
                        <div
                          key={item.id}
                          onClick={() => openAssignmentChat(currentClassId, item.id, 'lesson')}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-teal/[0.05] transition-colors"
                        >
                          <span className="text-[15px] flex-shrink-0">📋</span>
                          <span className="flex-1 text-sm text-text-primary truncate">{item.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 ${statusColor(item.due_date)}`}>{dueLabel(item.due_date)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat section */}
                <div className="bg-card-bg border border-border rounded-xl p-4 mb-4">
                  <h2 className="font-heading font-semibold text-sm text-text-primary mb-3 flex items-center gap-2">
                    <ChatCircle size={16} weight="fill" className="text-teal" />
                    Chat with AI Tutor
                  </h2>
                  <div className="flex flex-col gap-1">
                    <div
                      onClick={() => openFreeChat(currentClassId)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-teal/[0.05] transition-colors"
                    >
                      <span className="text-[15px] flex-shrink-0">💬</span>
                      <span className="flex-1 text-sm text-text-primary">
                        {classChats.length > 0 ? 'Continue chatting' : 'Start a conversation'}
                      </span>
                      {classChats.length > 0 && (
                        <span className="text-xs text-text-muted flex-shrink-0">{classChats.length} messages</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ---- NEW CHAT VIEW ---- */}
          {viewMode === 'new-chat' && currentClass && (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              <div className="flex gap-2.5 max-w-[90%] self-start">
                <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center text-xs font-semibold text-white mt-1 flex-shrink-0">
                  {currentClass.teacherInitial}
                </div>
                <div className="bg-card-bg border border-border rounded-2xl rounded-bl-sm px-4 py-4 max-w-md">
                  <div className="font-semibold text-sm text-text-primary mb-1.5">Name this chat</div>
                  <div className="text-xs text-text-secondary mb-3">Give it a short name so you can find it later.</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newChatName}
                      onChange={e => setNewChatName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') beginNamedChat(); }}
                      placeholder="e.g. Help with fractions"
                      autoFocus
                      className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-warm-white text-text-primary outline-none focus:border-teal"
                    />
                    <button
                      onClick={beginNamedChat}
                      className="px-4 py-2 bg-teal text-navy rounded-lg font-heading font-semibold text-sm hover:bg-teal/90 transition-colors whitespace-nowrap"
                    >
                      Start chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---- CHAT VIEW ---- */}
          {viewMode === 'chat' && currentClass && (
            <>
              <div ref={chatViewRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 flex flex-col gap-4">
                {/* Assignment banner */}
                {currentChatType === 'lesson' && (() => {
                  const assignment = currentClass.assignments.find(a => a.id === currentChatId);
                  return assignment ? (
                    <div className="flex items-center gap-3 px-4 py-3 bg-info/[0.06] border border-info/15 rounded-[10px] mb-2">
                      <ClipboardText size={20} weight="fill" className="text-teal flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-text-primary">{assignment.title}</div>
                        <div className="text-xs text-text-muted">{dueLabel(assignment.due_date)} · {currentClass.name}</div>
                      </div>
                    </div>
                  ) : null;
                })()}

                {messages.map(msg => {
                  // Special notice messages
                  if (msg.text === '🎉__TURNIN_NOTICE__') {
                    return (
                      <div key={msg.id} className="text-center py-2">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-success/[0.08] rounded-full text-xs font-medium text-success">
                          ✅ Assignment turned in
                        </span>
                      </div>
                    );
                  }
                  if (msg.text === '📦__ARCHIVE_NOTICE__') {
                    return (
                      <div key={msg.id} className="text-center py-2">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-teal/[0.08] rounded-full text-xs font-medium text-teal">
                          📦 Chat archived
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 max-w-[72%] ${msg.role === 'student' ? 'self-end flex-row-reverse' : 'self-start'}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold mt-1
                        ${msg.role === 'ai' ? 'bg-navy text-white' : 'bg-teal text-white'}`}>
                        {msg.role === 'ai' ? currentClass.teacherInitial : studentInitials.charAt(0)}
                      </div>
                      <div>
                        {msg.image ? (
                          <div className="flex flex-col items-end gap-1">
                            <img
                              src={msg.image.src}
                              alt={msg.image.alt}
                              className="max-w-[220px] rounded-xl border border-border object-cover"
                            />
                            <span className="text-[11px] text-text-muted">{msg.image.fileName}</span>
                          </div>
                        ) : msg.attachment ? (
                          <div className={`px-3.5 py-3 rounded-2xl ${msg.role === 'student' ? 'bg-teal rounded-br-sm shadow-sm' : 'bg-card-bg border border-border rounded-bl-sm shadow-sm'}`}>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{msg.attachment.type}</span>
                              <div>
                                <div className={`font-semibold text-sm ${msg.role === 'student' ? 'text-white' : 'text-text-primary'}`}>{msg.attachment.name}</div>
                                <div className={`text-xs ${msg.role === 'student' ? 'text-white/70' : 'text-text-muted'}`}>{msg.attachment.size}</div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                              ${msg.role === 'ai'
                                ? 'bg-card-bg border border-border rounded-bl-sm shadow-sm text-text-primary'
                                : 'bg-teal text-white rounded-br-sm shadow-sm'}`}
                            dangerouslySetInnerHTML={{ __html: msg.text }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-2.5 self-start max-w-[72%]">
                    <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center text-xs font-semibold text-white mt-1 flex-shrink-0">
                      {currentClass.teacherInitial}
                    </div>
                    <div className="bg-card-bg border border-border rounded-2xl rounded-bl-sm shadow-sm px-3.5 py-3">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-text-muted opacity-40"
                            style={{ animation: `typingBounce 1.4s infinite ease-in-out ${i * 0.2}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input bar */}
              <div className="px-4 sm:px-6 py-3 border-t border-border bg-card-bg shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
                {/* Turn in row */}
                {currentChatType === 'lesson' && (
                  <div className="mb-2.5">
                    <button
                      onClick={() => !turnedIn && setShowTurnInConfirm(true)}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] border font-heading font-semibold text-sm transition-all
                        ${turnedIn
                          ? 'bg-success/10 border-success/30 text-success cursor-default pointer-events-none'
                          : 'border-success text-success hover:bg-success hover:text-white'}`}
                    >
                      <Check size={16} weight="fill" />
                      {turnedIn ? 'Turned in ✓' : 'Turn in'}
                    </button>
                  </div>
                )}

                <div className="flex gap-2 items-end">
                  {/* Upload button */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); setShowUploadMenu(v => !v); }}
                      className="w-[42px] h-[42px] rounded-[10px] border border-border text-text-muted flex items-center justify-center hover:border-teal hover:text-teal transition-colors"
                    >
                      <Paperclip size={18} weight="fill" />
                    </button>
                    {showUploadMenu && (
                      <div className="absolute bottom-12 left-0 bg-card-bg border border-border rounded-[10px] p-1.5 min-w-[190px] shadow-lg z-10">
                        {[
                          { type: 'photo', Icon: Camera, color: '#4FA3A5', label: 'Photo', sub: 'Take or choose a photo' },
                          { type: 'file', Icon: FileText, color: '#1F3A5F', label: 'Document', sub: 'PDF, Word, or text file' },
                          { type: 'drawing', Icon: PencilLine, color: '#E8836B', label: 'Drawing', sub: 'Sketch or handwritten work' },
                          { type: '3d', Icon: Cube, color: '#8B5CF6', label: '3D Model', sub: 'STL file' },
                          { type: 'audio', Icon: Microphone, color: '#F59E0B', label: 'Audio / Video', sub: 'Recording or presentation' },
                        ].map(opt => (
                          <button
                            key={opt.type}
                            onClick={() => simulateUpload(opt.type)}
                            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg hover:bg-teal/[0.06] transition-colors text-left"
                          >
                            <span className="w-6 text-center flex-shrink-0">
                              <opt.Icon size={20} weight="fill" style={{ color: opt.color }} />
                            </span>
                            <div>
                              <div className="text-sm font-medium text-text-primary">{opt.label}</div>
                              <div className="text-xs text-text-muted">{opt.sub}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Text input */}
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={currentChatType === 'lesson' ? 'Ask about this assignment...' : `Ask anything about ${currentClass.name.toLowerCase()}...`}
                    rows={1}
                    className="flex-1 px-3.5 py-2.5 border border-border rounded-xl text-sm font-[var(--font-body)] bg-warm-white text-text-primary outline-none resize-none min-h-[42px] max-h-[120px] leading-relaxed focus:border-teal transition-colors placeholder:text-text-muted"
                  />

                  {/* Send button */}
                  <button
                    onClick={sendMessage}
                    className="w-[42px] h-[42px] rounded-[10px] bg-teal text-navy flex items-center justify-center hover:bg-teal/90 active:scale-95 transition-all flex-shrink-0"
                  >
                    <PaperPlaneRight size={18} weight="fill" />
                  </button>
                </div>
                <p className="text-center text-[11px] text-text-muted mt-1.5">{currentClass.teacher}&apos;s assistant can see this conversation</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Turn in confirm modal */}
      {showTurnInConfirm && currentClass && (
        <div className="fixed inset-0 bg-black/30 z-[200] flex items-center justify-center" onClick={() => setShowTurnInConfirm(false)}>
          <div className="bg-card-bg border border-border rounded-[14px] p-6 max-w-[360px] w-[90%] text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-3xl mb-3">✅</div>
            <div className="font-heading font-bold text-base text-text-primary mb-1.5">Turn in this assignment?</div>
            <div className="text-sm text-text-secondary mb-1.5">{chatName}</div>
            <div className="text-xs text-text-muted mb-5 leading-relaxed">{currentClass.teacher} will be able to see this entire conversation, including any files you uploaded.</div>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setShowTurnInConfirm(false)} className="px-5 py-2 border border-border rounded-lg text-sm font-semibold text-text-primary hover:bg-warm-white transition-colors">Not yet</button>
              <button onClick={confirmTurnIn} className="px-5 py-2 bg-success text-white rounded-lg text-sm font-semibold hover:bg-success/90 transition-colors">Turn in</button>
            </div>
          </div>
        </div>
      )}

      {/* Archive confirm modal */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 bg-black/30 z-[200] flex items-center justify-center" onClick={() => setShowArchiveConfirm(false)}>
          <div className="bg-card-bg border border-border rounded-[14px] p-6 max-w-[340px] w-[90%] text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-3xl mb-3">📦</div>
            <div className="font-heading font-bold text-base text-text-primary mb-1.5">Archive this chat?</div>
            <div className="text-sm text-text-muted mb-5 leading-relaxed">You can still find it in the Archive section if you need it later.</div>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setShowArchiveConfirm(false)} className="px-5 py-2 border border-border rounded-lg text-sm font-semibold text-text-primary hover:bg-warm-white transition-colors">Cancel</button>
              <button onClick={confirmArchive} className="px-5 py-2 bg-teal text-navy rounded-lg text-sm font-semibold hover:bg-teal/90 transition-colors">Archive</button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close upload menu */}
      {showUploadMenu && (
        <div className="fixed inset-0 z-[5]" onClick={() => setShowUploadMenu(false)} />
      )}

      <style>{`
        @keyframes typingBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
