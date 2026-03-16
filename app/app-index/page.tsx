'use client';

import Link from 'next/link';

const sections = [
  {
    title: 'Entry Points',
    desc: 'Landing, login, signup, password reset',
    icon: '🏠',
    iconBg: 'rgba(31,58,95,0.1)',
    devNote: 'Role selection is on signup only, not login. Login supports email/password + SSO (Google, Microsoft, ClassLink). Password reset page never reveals whether an account exists.',
    links: [
      { num: 1, name: 'Landing Page', href: '/', tag: 'Start here', tagClass: 'tag-flow' },
      { num: 2, name: 'Role Selection (signup)', href: '/signup' },
      { num: 3, name: 'Login (returning users)', href: '/login' },
      { num: 4, name: 'Forgot Password', href: '/forgot-password' },
    ],
  },
  {
    title: 'Teacher Flow',
    desc: 'Signup → School lookup → Twin onboarding → Roster sync → Create classes → Dashboard',
    icon: '📚',
    iconBg: 'rgba(31,58,95,0.1)',
    devNote: 'Teacher signup is two screens (profile then auth). School identity is captured before authentication via zip-code-filtered NCES lookup. The Teaching Twin onboarding quiz personalizes the AI agent\'s teaching style. Roster sync (Google Classroom / Microsoft Teams / ClassLink / CSV) should be offered during initial setup. Dashboard uses localStorage for state. All pages share a sidebar layout. Icons are Phosphor Icons (fill weight) on colored circle backgrounds.',
    links: [
      { num: 5, name: 'Teacher Signup (2 screens: profile + auth)', href: '/teacher/signup' },
      { num: 6, name: 'Teacher Dashboard (progressive setup flow + alerts when populated)', href: '/teacher/dashboard' },
      { num: 7, name: 'Create Class (icon picker, student picker, join code)', href: '/teacher/create-class' },
      { num: 8, name: 'Edit Class (icon, roster, description, archive)', href: '/teacher/edit-class' },
      { num: 9, name: 'Create Activity (file upload, AI-enhanced instructions, Twin guidance)', href: '/teacher/create-activity' },
      { num: 10, name: 'My Classes (class cards, join codes, student counts)', href: '/teacher/my-classes' },
      { num: 11, name: 'Students (roster: first name, last name, student ID, grade)', href: '/teacher/students' },
      { num: 12, name: 'Activities Library (list, filter by class, detail modal, edit mode)', href: '/teacher/library' },
      { num: 13, name: 'Student Chats (monitor conversations, review flags)', href: '/teacher/student-chats' },
      { num: 14, name: 'Student Progress Report (goals, mastery, parent letter)', href: '/teacher/student-detail' },
      { num: 15, name: 'Conversation Intelligence (topics, sentiment, patterns)', href: '/teacher/conversation-detail' },
    ],
  },
  {
    title: 'Student Flow',
    desc: 'Join code or QR → Roster match → Auth → Diagnostic assessment → Dashboard → Chat',
    icon: '🎓',
    iconBg: 'rgba(79,163,165,0.1)',
    devNote: 'Students sign up with a class join code only (no school selection). Roster matching uses last 3 digits of District Student ID as fallback. Never say "AI" in student-facing UI. Student never sees their Communication Profile or assessment results. Chats are organized by class, not a flat list. Students must name each chat before starting.',
    links: [
      { num: 16, name: 'Student Signup (join code or QR scan + roster match + auth)', href: '/student/signup' },
      { num: 17, name: 'Diagnostic Assessment (conversational, 8-12 min, calibrates AI)', href: '/student/onboarding' },
      { num: 18, name: 'Student Dashboard (progress lights, lessons, 5 sections)', href: '/student/dashboard' },
      { num: 19, name: 'Student Chat Interface (class-based sidebar, 4 sections)', href: '/student/main' },
    ],
  },
  {
    title: 'Administrator Flow',
    desc: 'Signup (name + title + district) → Auth → Dashboard',
    icon: '🏛️',
    iconBg: 'rgba(245,158,11,0.1)',
    comingSoon: true,
    devNote: 'Admin signup has two paths: (1) invited by district, (2) self-register. Admins are district-level, not school-level. "Find your district" not "Choose your school."',
    links: [
      { num: 20, name: 'Admin Signup (2 screens: profile + auth)', href: '/admin-signup', tag: 'Coming Soon', tagClass: 'tag-soon' },
      { num: 21, name: 'Admin Dashboard', href: '/admin/dashboard', tag: 'Coming Soon', tagClass: 'tag-soon' },
    ],
  },
  {
    title: 'Parent / Guardian Flow',
    desc: 'Invite code → Child confirmation → Name + relationship → Auth → Dashboard',
    icon: '👨‍👩‍👧',
    iconBg: 'rgba(232,131,107,0.1)',
    comingSoon: true,
    devNote: 'Not in MVP. Complex feature: multiple parents/guardians per student, custody situations, different permissions per parent. Parent-child connection must be teacher-initiated (FERPA).',
    links: [
      { num: 22, name: 'Parent Signup (code + child match + auth)', href: '/parent/signup', tag: 'Coming Soon', tagClass: 'tag-soon' },
      { num: 23, name: 'Parent Dashboard', href: '/parent/dashboard', tag: 'Coming Soon', tagClass: 'tag-soon' },
    ],
  },
  {
    title: 'Marketing Pages',
    desc: 'Public-facing pages for the website',
    icon: '🌐',
    iconBg: 'rgba(16,185,129,0.1)',
    devNote: 'These pages are the public marketing site content. In production, these would live on the marketing domain (teachinglabs.com via Wix), but are included here for completeness.',
    links: [
      { num: 24, name: 'How It Works', href: '/how-it-works' },
      { num: 25, name: 'For Teachers', href: '/for-teachers' },
      { num: 26, name: 'For Students', href: '/for-students' },
      { num: 27, name: 'For Parents', href: '/for-parents' },
      { num: 28, name: 'For Districts', href: '/for-districts' },
      { num: 29, name: 'Pricing', href: '/pricing' },
      { num: 30, name: 'Our Story', href: '/our-story' },
      { num: 31, name: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Reference Documentation',
    desc: 'Data models, platform architecture, AI behavior rules',
    icon: '📐',
    iconBg: 'rgba(139,92,246,0.1)',
    devNote: 'These are the source-of-truth documents for building the backend. The database schema defines all tables and relationships. The platform hierarchy explains the data ownership model. The Teacher Soul Architecture defines every rule the AI teaching agent must follow.',
    links: [
      { num: 32, name: 'Database Schema (15 tables, all relationships)', href: '/docs/database-schema.html' },
      { num: 33, name: 'Platform Hierarchy & Data Model', href: '/docs/platform-hierarchy.html' },
      { num: 34, name: 'Teacher Soul Architecture (22 sections, brain-based AI rules)', href: '/docs/teacher-soul.html' },
    ],
  },
];

const flowLanes = [
  {
    role: 'Student',
    color: '#4FA3A5',
    steps: [
      { label: 'Enter Code or QR', href: '/student/signup' },
      { label: 'Match Name', href: '/student/signup' },
      { label: 'Confirm Identity', href: '/student/signup' },
      { label: 'Login / Create Account', href: '/student/signup' },
      { label: 'First Time Quiz (diagnostic)', href: '/student/onboarding' },
      { label: 'Learn (chat interface)', href: '/student/main' },
    ],
  },
  {
    role: 'Teacher',
    color: '#1F3A5F',
    steps: [
      { label: 'Name + Choose School', href: '/teacher/signup' },
      { label: 'Continue to Login (Google / MS / ClassLink)', href: '/teacher/signup' },
      { label: 'Teacher Quiz', href: '/teacher/dashboard' },
      { label: 'Link Students / Classes', href: '/teacher/dashboard' },
      { label: 'Create Your 1st Activity', href: '/teacher/create-activity' },
    ],
  },
  {
    role: 'Administrator',
    color: '#F59E0B',
    steps: [
      { label: 'Name + Title', href: '/admin-signup' },
      { label: 'Choose District', href: '/admin-signup' },
      { label: 'Continue to Login', href: '/admin-signup' },
      { label: 'Coming Soon', href: '/admin/dashboard', comingSoon: true },
    ],
  },
  {
    role: 'Parent',
    color: '#E8836B',
    steps: [
      { label: 'Connect w/ Child', href: '/parent/signup' },
      { label: 'Parent Invite Code', href: '/parent/signup' },
      { label: 'Email Teacher', href: '/parent/signup' },
      { label: "Thanks! We'll let you know", href: '/parent/dashboard', comingSoon: true },
    ],
  },
];

export default function AppIndexPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F0F4F8', color: '#1E293B', padding: '40px 24px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1F3A5F', marginBottom: 6 }}>
          TeachingLabs App Screens
        </h1>
        <p style={{ color: '#64748B', fontSize: 15 }}>Complete platform prototype — all roles, all flows</p>
        <span style={{ display: 'inline-block', background: '#4FA3A5', color: 'white', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, marginTop: 8 }}>
          34 screens
        </span>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Flowchart */}
        <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: '24px 20px', overflowX: 'auto' }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#1F3A5F', marginBottom: 4 }}>📋 First Entry Flowchart</div>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 20 }}>Role Selection → each role&apos;s signup steps. Click any step to open that page.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, minWidth: 700 }}>
            {flowLanes.map((lane) => (
              <div key={lane.role} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'white', padding: '8px 16px', borderRadius: 8, marginBottom: 12, textAlign: 'center', width: '100%', background: lane.color }}>
                  {lane.role}
                </div>
                {lane.steps.map((step, i) => (
                  <div key={i} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {i > 0 && <div style={{ color: '#64748B', fontSize: 16, lineHeight: 1, padding: '4px 0' }}>↓</div>}
                    <Link
                      href={step.href}
                      style={{
                        background: 'white',
                        border: step.comingSoon ? '1.5px dashed #E8836B' : '1.5px solid #E2E8F0',
                        borderRadius: 8,
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: step.comingSoon ? 600 : 500,
                        color: step.comingSoon ? '#E8836B' : '#1E293B',
                        textAlign: 'center',
                        width: '100%',
                        textDecoration: 'none',
                        display: 'block',
                        lineHeight: 1.4,
                      }}
                    >
                      {step.label}
                    </Link>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.title} style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
            {/* Section header */}
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, background: section.iconBg }}>
                {section.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  {section.title}
                  {section.comingSoon && (
                    <span style={{ display: 'inline-block', background: '#E8836B', color: 'white', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.3, marginLeft: 8, verticalAlign: 'middle' }}>
                      Coming Soon
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#64748B' }}>{section.desc}</div>
              </div>
            </div>

            {/* Dev note */}
            <div style={{ padding: '10px 20px', background: 'rgba(79,163,165,0.04)', borderBottom: '1px solid #E2E8F0', fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>
              <strong style={{ color: '#1F3A5F', fontWeight: 600 }}>Dev notes:</strong> {section.devNote}
            </div>

            {/* Links */}
            <div style={{ padding: '4px 0' }}>
              {section.links.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 20px',
                    textDecoration: 'none',
                    color: '#1E293B',
                    borderBottom: i < section.links.length - 1 ? '1px solid #E2E8F0' : 'none',
                  }}
                >
                  <span style={{ width: 24, height: 24, borderRadius: 6, background: '#F0F4F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#64748B', flexShrink: 0 }}>
                    {link.num}
                  </span>
                  <span style={{ fontWeight: 500, fontSize: 14, flex: 1 }}>{link.name}</span>
                  {link.tag && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 4,
                      textTransform: 'uppercase' as const,
                      letterSpacing: 0.3,
                      background: link.tagClass === 'tag-flow' ? 'rgba(139,92,246,0.1)' : 'rgba(232,131,107,0.15)',
                      color: link.tagClass === 'tag-flow' ? '#8B5CF6' : '#E8836B',
                    }}>
                      {link.tag}
                    </span>
                  )}
                  <span style={{ color: '#64748B', fontSize: 14 }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '40px 0 16px', color: '#64748B', fontSize: 12 }}>
        TeachingLabs MVP Prototype — March 2026<br />
        <span style={{ fontSize: 11, color: '#64748B' }}>React / Next.js · Tailwind CSS · Phosphor Icons · Inter font</span>
      </div>
    </div>
  );
}
