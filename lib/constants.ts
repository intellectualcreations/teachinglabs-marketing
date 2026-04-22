// TeachingLabs Brand Constants

export const BRAND = {
  name: 'TeachingLabs',
  school: 'Lincoln Elementary',
  district: 'Springfield Public Schools',
} as const;

export const COLORS = {
  navy: '#1F3A5F',
  teal: '#4FA3A5',
  coral: '#E8836B',
  white: '#FFFFFF',
  cardLight: '#F0F4F8',
  cardDark: '#1A2332',
  bgDark: '#0F1419',
  gray: '#64748B',
  borderLight: '#E2E8F0',
  borderDark: '#2D3748',
} as const;

// Class icon subject detection + color mapping
export const SUBJECT_CONFIG: Record<string, { icon: string; color: string }> = {
  math: { icon: 'MathOperations', color: '#1F3A5F' },
  algebra: { icon: 'Calculator', color: '#1F3A5F' },
  geometry: { icon: 'Ruler', color: '#1F3A5F' },
  statistics: { icon: 'ChartBar', color: '#F59E0B' },
  reading: { icon: 'BookOpenText', color: '#4FA3A5' },
  ela: { icon: 'Article', color: '#4FA3A5' },
  english: { icon: 'BookOpenText', color: '#4FA3A5' },
  science: { icon: 'Flask', color: '#7C3AED' },
  chemistry: { icon: 'TestTube', color: '#059669' },
  biology: { icon: 'Dna', color: '#10B981' },
  astronomy: { icon: 'Planet', color: '#6366F1' },
  social: { icon: 'GlobeHemisphereWest', color: '#0891B2' },
  history: { icon: 'Bank', color: '#92400E' },
  geography: { icon: 'MapTrifold', color: '#0D9488' },
  writing: { icon: 'PencilLine', color: '#E8836B' },
  art: { icon: 'Palette', color: '#EC4899' },
  music: { icon: 'MusicNotes', color: '#8B5CF6' },
  computer: { icon: 'Desktop', color: '#334155' },
  spanish: { icon: 'Translate', color: '#DC2626' },
  french: { icon: 'ChatsCircle', color: '#2563EB' },
  pe: { icon: 'Basketball', color: '#EA580C' },
  fitness: { icon: 'PersonSimpleRun', color: '#D97706' },
  library: { icon: 'Books', color: '#7C3AED' },
  drama: { icon: 'MaskHappy', color: '#BE185D' },
  health: { icon: 'Heartbeat', color: '#DC2626' },
  environment: { icon: 'Leaf', color: '#059669' },
  robotics: { icon: 'Robot', color: '#475569' },
  homeroom: { icon: 'HouseLine', color: '#64748B' },
};

// Detect subject from class name
export function detectSubject(className: string): { icon: string; color: string } {
  const lower = className.toLowerCase();
  for (const [keyword, config] of Object.entries(SUBJECT_CONFIG)) {
    if (lower.includes(keyword)) return config;
  }
  return { icon: 'Star', color: '#4FA3A5' };
}

// Teacher sidebar navigation
export const TEACHER_NAV = [
  { label: 'Dashboard', href: '/teacher/dashboard', icon: 'SquaresFour', page: 'dashboard' },
  { label: 'My Classes', href: '/teacher/my-classes', icon: 'BookOpenText', page: 'my-classes' },
  { label: 'Students', href: '/teacher/students', icon: 'UsersThree', page: 'students' },
  { label: 'Library', href: '/teacher/library', icon: 'Books', page: 'library' },
  { label: 'Assessment Guide', href: '/teacher/assessment-guide', icon: 'Brain', page: 'assessment-guide' },
  { label: 'Message Board', href: '/teacher/message-board', icon: 'ChatCircleText', page: 'message-board' },
] as const;
