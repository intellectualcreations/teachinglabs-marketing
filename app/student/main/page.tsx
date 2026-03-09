'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  List, HouseLine, Archive, CaretRight, CaretDown, Plus,
  ClipboardText, Check, PaperPlaneRight, Paperclip,
  Camera, FileText, PencilLine, Cube, Microphone, X,
  MathOperations, BookOpenText, Flask, GlobeHemisphereWest,
} from '@phosphor-icons/react';
import Link from 'next/link';

// ============ DATA ============

interface ChatItem {
  id: string;
  name: string;
  preview: string;
  time: string;
  count: number;
  due?: string;
  status?: 'active' | 'due' | 'overdue';
  turned?: string;
  isLesson?: boolean;
}

interface ClassData {
  name: string;
  teacher: string;
  teacherInitial: string;
  icon: React.ReactNode;
  iconBg: string;
  lessons: ChatItem[];
  turnedIn: ChatItem[];
  openChats: ChatItem[];
  archived: ChatItem[];
}

type ClassKey = 'math' | 'science' | 'ela' | 'social';

const CLASS_ICONS: Record<ClassKey, React.ReactNode> = {
  math: <MathOperations size={16} weight="fill" className="text-white" />,
  science: <Flask size={16} weight="fill" className="text-white" />,
  ela: <BookOpenText size={16} weight="fill" className="text-white" />,
  social: <GlobeHemisphereWest size={16} weight="fill" className="text-white" />,
};

const INITIAL_DATA: Record<ClassKey, ClassData> = {
  math: {
    name: '5th Period Math', teacher: 'Mrs. Martinez', teacherInitial: 'M',
    icon: CLASS_ICONS.math, iconBg: 'rgba(59,130,246,0.15)',
    lessons: [
      { id: 'hw-fractions-add', name: 'Adding Fractions Worksheet', due: 'Due tomorrow', status: 'active', time: '2m ago', preview: 'You got it! 7/12 is correct.', count: 8 },
      { id: 'hw-ch7-review', name: 'Chapter 7 Review', due: 'Due Friday', status: 'active', time: 'Yesterday', preview: 'Problem 4 uses the same concept.', count: 11 },
      { id: 'hw-decimals-quiz', name: 'Decimals Quiz Prep', due: 'Due Mar 12', status: 'due', time: 'Mar 5', preview: 'So 0.75 is the same as 75%!', count: 6 },
    ],
    turnedIn: [
      { id: 'hw-ch6-test', name: 'Chapter 6 Test Prep', turned: 'Mar 5', time: 'Mar 5', preview: 'Great job, you got 9 out of 10!', count: 15, isLesson: true },
    ],
    openChats: [
      { id: 'fractions-help', name: 'Help with fractions', time: '2m ago', preview: 'You got it! 7/12 is correct.', count: 8 },
      { id: 'word-problems', name: 'Word problems practice', time: 'Yesterday', preview: 'Let me walk you through this...', count: 14 },
      { id: 'times-tables', name: 'Times tables tricks', time: 'Mar 4', preview: 'The 9s trick with your fingers!', count: 5 },
    ],
    archived: [
      { id: 'geometry-shapes', name: 'Geometry: area of shapes', time: 'Feb 28', preview: 'Length times width gives you the area!', count: 9 },
      { id: 'fractions-intro', name: 'What are fractions?', time: 'Feb 20', preview: 'Think of a pizza cut into equal slices...', count: 12 },
    ],
  },
  science: {
    name: 'Science', teacher: 'Mr. Thompson', teacherInitial: 'T',
    icon: CLASS_ICONS.science, iconBg: 'rgba(16,185,129,0.15)',
    lessons: [
      { id: 'ecosystems-proj', name: 'Ecosystems Project', due: 'Due Mar 14', status: 'active', time: 'Today', preview: 'Great question about food webs!', count: 6 },
      { id: 'lab-report-3', name: 'Lab Report #3', due: 'Due Mar 10', status: 'due', time: 'Mar 4', preview: 'Your hypothesis section looks good!', count: 5 },
    ],
    turnedIn: [],
    openChats: [
      { id: 'water-cycle', name: 'Water cycle quiz prep', time: 'Mar 4', preview: 'Evaporation, condensation, precipitation...', count: 9 },
      { id: 'planets-chat', name: 'Solar system questions', time: 'Feb 28', preview: 'Jupiter is the largest planet!', count: 4 },
    ],
    archived: [],
  },
  ela: {
    name: 'English Language Arts', teacher: 'Ms. Chen', teacherInitial: 'C',
    icon: CLASS_ICONS.ela, iconBg: 'rgba(245,158,11,0.15)',
    lessons: [
      { id: 'book-report', name: 'Book Report: Percy Jackson', due: 'Due Mar 15', status: 'active', time: 'Today', preview: 'What themes did you notice?', count: 4 },
      { id: 'essay-draft', name: 'Persuasive Essay Draft', due: 'Due Mar 11', status: 'due', time: 'Mar 6', preview: "Strong intro! Let's work on transitions.", count: 8 },
    ],
    turnedIn: [],
    openChats: [
      { id: 'vocabulary', name: 'Vocabulary practice', time: 'Mar 1', preview: 'Context clues help figure out meaning.', count: 11 },
    ],
    archived: [],
  },
  social: {
    name: 'Social Studies', teacher: 'Mrs. Johnson', teacherInitial: 'J',
    icon: CLASS_ICONS.social, iconBg: 'rgba(164,139,250,0.15)',
    lessons: [
      { id: 'colonies-worksheet', name: '13 Colonies Worksheet', due: 'Due Mar 10', status: 'active', time: 'Mar 6', preview: 'The Southern colonies had different crops...', count: 7 },
    ],
    turnedIn: [],
    openChats: [
      { id: 'timeline', name: 'Timeline project ideas', time: 'Feb 27', preview: 'Good start! Add dates for each event.', count: 5 },
    ],
    archived: [
      { id: 'hw-map-skills', name: 'Map Skills Quiz', time: 'Feb 15', preview: 'Latitude and longitude practice.', count: 6 },
    ],
  },
};

interface ChatMsg {
  id: string;
  role: 'ai' | 'student';
  text: string;
  attachment?: { type: string; name: string; size: string };
}

const DEMO_MSGS: ChatMsg[] = [
  { id: 'm1', role: 'ai', text: "Hi Alex! What are you working on today? 😊" },
  { id: 'm2', role: 'student', text: "I don't get fractions. Like adding them when the bottom numbers are different." },
  { id: 'm3', role: 'ai', text: "Got it! Adding fractions with different denominators (the bottom numbers). Let's break it down step by step.<br><br>Say you want to add <strong>1/3 + 1/4</strong>.<br><br>First question: can you add them if the bottom numbers are different?" },
  { id: 'm4', role: 'student', text: "No? You need them to be the same?" },
  { id: 'm5', role: 'ai', text: "Exactly right! You need a <strong>common denominator</strong>. Think of it like this — you can't add thirds and fourths because they're different-sized pieces. 🍕<br><br>So we need to find a number that both 3 and 4 can divide into evenly. What do you think that number might be?" },
  { id: 'm6', role: 'student', text: "12?" },
  { id: 'm7', role: 'ai', text: "Yes! 12 works great. Now we convert:<br><br>• 1/3 = <strong>4/12</strong> (multiply top and bottom by 4)<br>• 1/4 = <strong>3/12</strong> (multiply top and bottom by 3)<br><br>Now add them: 4/12 + 3/12 = ?" },
  { id: 'm8', role: 'student', text: "7/12!" },
  { id: 'm9', role: 'ai', text: "🎉 You got it! 7/12 is correct. See, you DO get fractions.<br><br>Now let's try something a little harder: <strong>mixed numbers</strong>. Grab a piece of paper and solve this:<br><br><strong>1 3/5 + 1 7/10 = ?</strong><br><br>Show all your work and upload a photo when you're done!" },
  { id: 'm10', role: 'student', text: "Ok let me try" },
  { id: 'm11', role: 'ai', text: "This is really good work, Alex! Every step is correct. I love that you drew the fraction bars — that shows you really understand what the numbers mean. Mrs. Martinez is going to be proud of this one. 💪" },
];

let msgIdCounter = 100;
function newMsgId() { return `msg-${++msgIdCounter}`; }

type ViewMode = 'chat' | 'new-chat' | 'welcome';

export default function StudentMainPage() {
  const [classData, setClassData] = useState(INITIAL_DATA);
  const [currentClass, setCurrentClass] = useState<ClassKey>('math');
  const [currentChatId, setCurrentChatId] = useState<string>('fractions-help');
  const [currentChatType, setCurrentChatType] = useState<'lesson' | 'open' | 'archived' | 'turnedin'>('open');
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [expandedClasses, setExpandedClasses] = useState<Set<ClassKey>>(new Set(['math']));
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [expandedArchives, setExpandedArchives] = useState<Set<ClassKey>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>(DEMO_MSGS);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [chatName, setChatName] = useState('Help with fractions');
  const [newChatName, setNewChatName] = useState('');
  const [showTurnInConfirm, setShowTurnInConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [turnedIn, setTurnedIn] = useState(false);
  const chatViewRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const cls = classData[currentClass];

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (chatViewRef.current) {
        chatViewRef.current.scrollTop = chatViewRef.current.scrollHeight;
      }
    }, 100);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

  const currentChat: ChatItem | undefined = [...cls.lessons, ...cls.openChats, ...cls.archived, ...cls.turnedIn]
    .find(c => c.id === currentChatId);

  // Sidebar interactions
  const toggleClass = (id: ClassKey) => {
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

  const toggleArchive = (id: ClassKey) => {
    setExpandedArchives(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openChat = (classId: ClassKey, chatId: string, type: 'lesson' | 'open' | 'archived' | 'turnedin') => {
    setCurrentClass(classId);
    setCurrentChatId(chatId);
    setCurrentChatType(type);
    setViewMode('chat');
    setTurnedIn(false);

    const chatItem = [...classData[classId].lessons, ...classData[classId].openChats,
      ...classData[classId].archived, ...classData[classId].turnedIn].find(c => c.id === chatId);
    if (chatItem) setChatName(chatItem.name);

    setMessages(DEMO_MSGS);
    setSidebarOpen(false);
    if (!expandedClasses.has(classId)) {
      setExpandedClasses(prev => new Set([...prev, classId]));
    }
  };

  const startNewChat = (classId: ClassKey) => {
    setCurrentClass(classId);
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
    const id = `chat-${Date.now()}`;
    const newItem: ChatItem = { id, name, preview: '', time: 'Just now', count: 0 };
    setClassData(prev => ({
      ...prev,
      [currentClass]: { ...prev[currentClass], openChats: [newItem, ...prev[currentClass].openChats] },
    }));
    setCurrentChatId(id);
    setChatName(name);
    setCurrentChatType('open');
    setViewMode('chat');
    setMessages([{
      id: newMsgId(),
      role: 'ai',
      text: `Hi Alex! What would you like to work on in ${classData[currentClass].name.toLowerCase()} today? 😊`,
    }]);
  };

  // Chat send
  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;
    setMessages(prev => [...prev, { id: newMsgId(), role: 'student', text }]);
    setInputText('');
    if (inputRef.current) inputRef.current.style.height = 'auto';

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: newMsgId(),
        role: 'ai',
        text: "That's a great question! Let me help you work through that. What do you already know about this topic?",
      }]);
    }, 1800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // Upload
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
      photo: "Got it! Let me take a look at your work... I can see your answers for problems 1–5. Nice job on #1 and #2! Let's look at #3 together.",
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

  // Turn in
  const confirmTurnIn = () => {
    setShowTurnInConfirm(false);
    setTurnedIn(true);

    const noticeId = newMsgId();
    const aiId = newMsgId();
    setMessages(prev => [
      ...prev,
      { id: noticeId, role: 'ai', text: '🎉__TURNIN_NOTICE__' },
    ]);
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: aiId, role: 'ai', text: `Nice work, Alex! Your assignment has been turned in. ${cls.teacher} will review it. If you have any more questions before then, I'm still here!` },
      ]);
    }, 600);

    // Move from lessons to turnedIn
    setClassData(prev => {
      const clsData = prev[currentClass];
      const idx = clsData.lessons.findIndex(l => l.id === currentChatId);
      if (idx === -1) return prev;
      const item = { ...clsData.lessons[idx], turned: 'Just now', isLesson: true };
      return {
        ...prev,
        [currentClass]: {
          ...clsData,
          lessons: clsData.lessons.filter(l => l.id !== currentChatId),
          turnedIn: [item, ...clsData.turnedIn],
        },
      };
    });
    setCurrentChatType('turnedin');
  };

  // Archive
  const confirmArchive = () => {
    setShowArchiveConfirm(false);

    const noticeId = newMsgId();
    setMessages(prev => [...prev, { id: noticeId, role: 'ai', text: '📦__ARCHIVE_NOTICE__' }]);

    setClassData(prev => {
      const clsData = prev[currentClass];
      let item: ChatItem | undefined;
      let updated = { ...clsData };

      const fromLessons = clsData.lessons.findIndex(l => l.id === currentChatId);
      if (fromLessons !== -1) { item = clsData.lessons[fromLessons]; updated.lessons = clsData.lessons.filter(l => l.id !== currentChatId); }
      const fromOpen = clsData.openChats.findIndex(c => c.id === currentChatId);
      if (!item && fromOpen !== -1) { item = clsData.openChats[fromOpen]; updated.openChats = clsData.openChats.filter(c => c.id !== currentChatId); }
      const fromTurnedIn = clsData.turnedIn.findIndex(t => t.id === currentChatId);
      if (!item && fromTurnedIn !== -1) { item = clsData.turnedIn[fromTurnedIn]; updated.turnedIn = clsData.turnedIn.filter(t => t.id !== currentChatId); }

      if (item) updated.archived = [item, ...clsData.archived];
      return { ...prev, [currentClass]: updated };
    });
    setCurrentChatType('archived');
  };

  // Status color
  const statusColor = (status?: string) => {
    if (status === 'due') return 'bg-warning/10 text-warning';
    if (status === 'overdue') return 'bg-coral/10 text-coral';
    return 'bg-teal/10 text-teal';
  };

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
          w-[280px] min-w-[280px] bg-card-bg border-r border-border flex flex-col overflow-hidden
          fixed lg:static top-0 bottom-0 left-0 z-[100] transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Sidebar header */}
          <div className="px-4 py-4 border-b border-border flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal text-white flex items-center justify-center font-heading font-bold text-sm flex-shrink-0">AR</div>
            <div>
              <div className="font-heading font-semibold text-sm text-text-primary">Alex Rivera</div>
              <div className="text-[11px] text-text-muted">5th Grade · Lincoln Elementary</div>
            </div>
          </div>

          {/* Class list */}
          <div className="flex-1 overflow-y-auto pb-4">
            <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-[1.2px] text-text-muted">My Classes</div>

            {(Object.keys(classData) as ClassKey[]).map(classId => {
              const c = classData[classId];
              const isExpanded = expandedClasses.has(classId);
              const isCurrent = classId === currentClass;

              return (
                <div key={classId} className="mx-2 mb-0.5">
                  {/* Class header */}
                  <div
                    onClick={() => toggleClass(classId)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${isCurrent ? 'bg-teal/[0.08]' : 'hover:bg-teal/[0.04]'}`}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: c.iconBg }}>
                      {c.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs text-text-primary truncate">{c.name}</div>
                      <div className="text-[11px] text-text-muted">{c.teacher}</div>
                    </div>
                    <div className={`w-5 h-5 flex items-center justify-center text-text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                      <CaretRight size={14} weight="fill" />
                    </div>
                  </div>

                  {/* Class body */}
                  {isExpanded && (
                    <div className="pb-2">
                      {/* Open Activities */}
                      {c.lessons.length > 0 && (
                        <>
                          <button
                            onClick={() => toggleSection(`${classId}-lessons`)}
                            className="flex items-center w-full pl-[54px] pr-3 py-1.5 text-left text-[10px] font-bold uppercase tracking-[0.8px] text-text-muted hover:text-text-primary transition-colors"
                          >
                            <span className={`mr-1 transition-transform ${collapsedSections.has(`${classId}-lessons`) ? '-rotate-90' : ''}`}>
                              <CaretDown size={10} weight="fill" />
                            </span>
                            Open Activities
                            <span className="ml-auto text-[9px] font-semibold bg-border text-text-muted px-1.5 py-0.5 rounded-md">{c.lessons.length}</span>
                          </button>
                          {!collapsedSections.has(`${classId}-lessons`) && c.lessons.map(item => (
                            <div
                              key={item.id}
                              onClick={() => openChat(classId, item.id, 'lesson')}
                              className={`flex items-center gap-2 pl-[54px] pr-3 py-1.5 mx-2 rounded-md cursor-pointer text-xs transition-colors
                                ${classId === currentClass && item.id === currentChatId ? 'bg-teal/10 text-teal font-medium' : 'text-text-primary hover:bg-teal/[0.05]'}`}
                            >
                              <span className="flex-shrink-0 text-[13px]">📋</span>
                              <span className="flex-1 truncate">{item.name}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${statusColor(item.status)}`}>{item.due}</span>
                            </div>
                          ))}
                        </>
                      )}

                      {/* Turned In */}
                      {c.turnedIn.length > 0 && (
                        <>
                          <button
                            onClick={() => toggleSection(`${classId}-turnedin`)}
                            className="flex items-center w-full pl-[54px] pr-3 py-1.5 text-left text-[10px] font-bold uppercase tracking-[0.8px] text-text-muted hover:text-text-primary transition-colors"
                          >
                            <span className={`mr-1 transition-transform ${collapsedSections.has(`${classId}-turnedin`) ? '-rotate-90' : ''}`}>
                              <CaretDown size={10} weight="fill" />
                            </span>
                            Turned In
                            <span className="ml-auto text-[9px] font-semibold bg-border text-text-muted px-1.5 py-0.5 rounded-md">{c.turnedIn.length}</span>
                          </button>
                          {!collapsedSections.has(`${classId}-turnedin`) && c.turnedIn.map(item => (
                            <div
                              key={item.id}
                              onClick={() => openChat(classId, item.id, 'turnedin')}
                              className={`flex items-center gap-2 pl-[54px] pr-3 py-1.5 mx-2 rounded-md cursor-pointer text-xs transition-colors opacity-70
                                ${classId === currentClass && item.id === currentChatId ? 'bg-teal/10 text-teal font-medium opacity-100' : 'text-text-primary hover:bg-teal/[0.05]'}`}
                            >
                              <span className="flex-shrink-0 text-[13px]">✅</span>
                              <span className="flex-1 truncate">{item.name}</span>
                              <span className="text-[10px] text-text-muted flex-shrink-0">{item.turned}</span>
                            </div>
                          ))}
                        </>
                      )}

                      {/* Open Chats */}
                      <button
                        onClick={() => toggleSection(`${classId}-chats`)}
                        className="flex items-center w-full pl-[54px] pr-3 py-1.5 text-left text-[10px] font-bold uppercase tracking-[0.8px] text-text-muted hover:text-text-primary transition-colors"
                      >
                        <span className={`mr-1 transition-transform ${collapsedSections.has(`${classId}-chats`) ? '-rotate-90' : ''}`}>
                          <CaretDown size={10} weight="fill" />
                        </span>
                        Open Chats
                        <span className="ml-auto text-[9px] font-semibold bg-border text-text-muted px-1.5 py-0.5 rounded-md">{c.openChats.length}</span>
                      </button>
                      {!collapsedSections.has(`${classId}-chats`) && (
                        <>
                          {c.openChats.map(item => (
                            <div
                              key={item.id}
                              onClick={() => openChat(classId, item.id, 'open')}
                              className={`flex items-center gap-2 pl-[54px] pr-3 py-1.5 mx-2 rounded-md cursor-pointer text-xs transition-colors
                                ${classId === currentClass && item.id === currentChatId ? 'bg-teal/10 text-teal font-medium' : 'text-text-primary hover:bg-teal/[0.05]'}`}
                            >
                              <span className="flex-shrink-0 text-[13px]">💬</span>
                              <span className="flex-1 truncate">{item.name}</span>
                              <span className="text-[10px] text-text-muted flex-shrink-0">{item.time}</span>
                            </div>
                          ))}
                          <button
                            onClick={() => startNewChat(classId)}
                            className="flex items-center gap-1.5 pl-[54px] pr-3 py-1.5 mx-2 rounded-md w-full text-left text-xs text-teal font-medium hover:bg-teal/[0.06] transition-colors"
                          >
                            <Plus size={14} weight="fill" /> New chat
                          </button>
                        </>
                      )}

                      {/* Archived */}
                      {c.archived.length > 0 && (
                        <>
                          <button
                            onClick={() => toggleArchive(classId)}
                            className="flex items-center gap-1.5 pl-[54px] pr-3 py-1.5 w-full text-left text-[11px] text-text-muted font-medium hover:text-text-primary transition-colors"
                          >
                            <span className={`transition-transform ${expandedArchives.has(classId) ? 'rotate-90' : ''}`}>
                              <CaretRight size={12} weight="fill" />
                            </span>
                            Archived
                            <span className="ml-1 text-[9px] font-semibold bg-border text-text-muted px-1.5 py-0.5 rounded-md">{c.archived.length}</span>
                          </button>
                          {expandedArchives.has(classId) && c.archived.map(item => (
                            <div
                              key={item.id}
                              onClick={() => openChat(classId, item.id, 'archived')}
                              className="flex items-center gap-2 pl-[54px] pr-3 py-1.5 mx-2 rounded-md cursor-pointer text-xs text-text-primary opacity-60 hover:opacity-100 hover:bg-teal/[0.05] transition-all"
                            >
                              <span className="flex-shrink-0 text-[13px]">💬</span>
                              <span className="flex-1 truncate">{item.name}</span>
                              <span className="text-[10px] text-text-muted flex-shrink-0">{item.time}</span>
                            </div>
                          ))}
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
          <div className="flex items-center gap-3 px-6 py-3.5 border-b border-border bg-card-bg min-h-14">
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
            {viewMode === 'chat' && currentChat ? (
              <>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cls.iconBg }}>
                  {cls.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-semibold text-sm text-text-primary truncate">{chatName}</div>
                  <div className="text-xs text-text-muted">{cls.name} · {cls.teacher}</div>
                </div>
                <button
                  onClick={() => setShowArchiveConfirm(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-text-muted hover:border-teal hover:text-teal transition-colors flex-shrink-0"
                  title="Archive this chat"
                >
                  <Archive size={16} weight="fill" />
                </button>
              </>
            ) : viewMode === 'new-chat' ? (
              <>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cls.iconBg }}>
                  {cls.icon}
                </div>
                <div className="flex-1">
                  <div className="font-heading font-semibold text-sm text-text-primary">New Chat</div>
                  <div className="text-xs text-text-muted">{cls.name} · {cls.teacher}</div>
                </div>
              </>
            ) : (
              <div className="flex-1">
                <div className="font-heading font-semibold text-sm text-text-primary">My Classes</div>
              </div>
            )}
          </div>

          {/* ---- WELCOME VIEW ---- */}
          {viewMode === 'welcome' && (
            <div className="flex-1 flex items-center justify-center p-10">
              <div className="text-center max-w-sm">
                <div className="text-5xl mb-4 opacity-60">👋</div>
                <h2 className="font-heading font-bold text-xl text-text-primary mb-2">Hi Alex!</h2>
                <p className="text-sm text-text-secondary leading-relaxed">Pick a class from the sidebar to continue a chat, or start a new one.</p>
              </div>
            </div>
          )}

          {/* ---- NEW CHAT VIEW ---- */}
          {viewMode === 'new-chat' && (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              <div className="flex gap-2.5 max-w-[90%] self-start">
                <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center text-xs font-semibold text-white mt-1 flex-shrink-0">
                  {cls.teacherInitial}
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
                      className="px-4 py-2 bg-teal text-white rounded-lg font-heading font-semibold text-sm hover:bg-teal/90 transition-colors whitespace-nowrap"
                    >
                      Start chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---- CHAT VIEW ---- */}
          {viewMode === 'chat' && (
            <>
              <div ref={chatViewRef} className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
                {/* Assignment banner */}
                {currentChatType === 'lesson' && currentChat && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-info/[0.06] border border-info/15 rounded-[10px] mb-2">
                    <ClipboardText size={20} weight="fill" className="text-teal flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-text-primary">{currentChat.name}</div>
                      <div className="text-xs text-text-muted">{currentChat.due} · {cls.name}</div>
                    </div>
                  </div>
                )}

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
                        {msg.role === 'ai' ? cls.teacherInitial : 'A'}
                      </div>
                      <div>
                        {msg.attachment ? (
                          <div className={`px-3.5 py-3 rounded-2xl ${msg.role === 'student' ? 'bg-teal rounded-br-sm' : 'bg-card-bg border border-border rounded-bl-sm'}`}>
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
                                ? 'bg-card-bg border border-border rounded-bl-sm text-text-primary'
                                : 'bg-teal text-white rounded-br-sm'}`}
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
                      {cls.teacherInitial}
                    </div>
                    <div className="bg-card-bg border border-border rounded-2xl rounded-bl-sm px-3.5 py-3">
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
              <div className="px-6 py-3 border-t border-border bg-card-bg">
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
                    placeholder={currentChatType === 'lesson' ? 'Ask about this assignment...' : `Ask anything about ${cls.name.toLowerCase()}...`}
                    rows={1}
                    className="flex-1 px-3.5 py-2.5 border border-border rounded-xl text-sm font-[var(--font-body)] bg-warm-white text-text-primary outline-none resize-none min-h-[42px] max-h-[120px] leading-relaxed focus:border-teal transition-colors placeholder:text-text-muted"
                  />

                  {/* Send button */}
                  <button
                    onClick={sendMessage}
                    className="w-[42px] h-[42px] rounded-[10px] bg-teal text-white flex items-center justify-center hover:bg-teal/90 active:scale-95 transition-all flex-shrink-0"
                  >
                    <PaperPlaneRight size={18} weight="fill" />
                  </button>
                </div>
                <p className="text-center text-[11px] text-text-muted mt-1.5">{cls.teacher}&apos;s assistant can see this conversation</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Turn in confirm modal */}
      {showTurnInConfirm && (
        <div className="fixed inset-0 bg-black/30 z-[200] flex items-center justify-center" onClick={() => setShowTurnInConfirm(false)}>
          <div className="bg-card-bg border border-border rounded-[14px] p-6 max-w-[360px] w-[90%] text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-3xl mb-3">✅</div>
            <div className="font-heading font-bold text-base text-text-primary mb-1.5">Turn in this assignment?</div>
            <div className="text-sm text-text-secondary mb-1.5">{chatName}</div>
            <div className="text-xs text-text-muted mb-5 leading-relaxed">{cls.teacher} will be able to see this entire conversation, including any files you uploaded.</div>
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
              <button onClick={confirmArchive} className="px-5 py-2 bg-teal text-white rounded-lg text-sm font-semibold hover:bg-teal/90 transition-colors">Archive</button>
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
