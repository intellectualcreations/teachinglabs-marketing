// Demo data matching the HTML prototype

export const DEMO_CLASSES = [
  { id: 'cls-1', name: '5th Grade Math', subject: 'Math', grade: '5', studentCount: 52, code: 'MATH-5A' },
  { id: 'cls-2', name: '4th Grade Math', subject: 'Math', grade: '4', studentCount: 48, code: 'MATH-4A' },
  { id: 'cls-3', name: '5th Grade Science', subject: 'Science', grade: '5', studentCount: 28, code: 'SCI-5A' },
  { id: 'cls-4', name: '4th Grade Reading', subject: 'ELA', grade: '4', studentCount: 20, code: 'READ-4A' },
  { id: 'cls-5', name: 'Reading Intervention', subject: 'ELA', grade: '4-5', studentCount: 7, code: 'READ-INT' },
];

export const AVATAR_COLORS = [
  '#1F3A5F', '#4FA3A5', '#E8836B', '#F59E0B', '#8B5CF6',
  '#059669', '#3B82F6', '#DC2626', '#6366F1', '#0891B2',
];

const STATUS_CYCLE: Array<'on-track' | 'attention' | 'excelling'> = [
  'on-track', 'on-track', 'on-track', 'on-track', 'on-track',
  'on-track', 'attention', 'excelling', 'excelling', 'on-track',
];

const CONCERNS = [
  'Asked 12 questions about equivalent fractions in last hour. Possible confusion on simplifying. Consider 1-on-1.',
  "Hasn't started the fractions activity. Due in 2 days. May need a check-in.",
  'Consistently skipping word problems. Avoids multi-step questions.',
  'Submitted 3 answers in a row that suggest guessing rather than working through steps.',
];

const LAST_SESSIONS = [
  '25m ago', '1h ago', '2h ago', 'Yesterday', 'Yesterday',
  '3h ago', 'Just now', '4h ago', 'Yesterday', '2 days ago',
];

const STREAKS = [4, 5, 3, 2, 7, 1, 6, 3, 8, 2];
const ACTIVITIES_COMPLETE = ['2/3', '3/3', '1/3', '2/3', '3/3', '1/3', '0/3', '2/3', '3/3', '1/3'];

export interface DemoStudent {
  first: string;
  last: string;
  id: string;
  grade: string;
  status: 'on-track' | 'attention' | 'excelling';
  color: string;
  lastSession: string;
  streak: number;
  activitiesComplete: string;
  concern: string | null;
  classNames: string[];
}

const STUDENT_NAMES = [
  { first: 'Zara', last: 'Mitchell', g: '5' }, { first: 'Leo', last: 'Fernandez', g: '4' },
  { first: 'Ivy', last: 'Nguyen', g: '5' }, { first: 'Marcus', last: 'Taylor', g: '4' },
  { first: 'Ruby', last: 'Chen', g: '5' }, { first: 'Finn', last: "O'Brien", g: '4' },
  { first: 'Nadia', last: 'Patel', g: '5' }, { first: 'Cole', last: 'Harrison', g: '4' },
  { first: 'Elise', last: 'Kim', g: '5' }, { first: 'Dante', last: 'Morales', g: '5' },
  { first: 'Wren', last: 'Foster', g: '4' }, { first: 'Kai', last: 'Santos', g: '5' },
  { first: 'Leila', last: 'Washington', g: '4' }, { first: 'Oscar', last: 'Reeves', g: '5' },
  { first: 'Hazel', last: 'Cooper', g: '4' }, { first: 'Theo', last: 'Park', g: '5' },
  { first: 'Mila', last: 'Rivera', g: '4' }, { first: 'Jasper', last: 'Adams', g: '5' },
  { first: 'Clara', last: 'Brooks', g: '4' }, { first: 'Rowan', last: 'Hayes', g: '5' },
  { first: 'Iris', last: 'Long', g: '5' }, { first: 'Silas', last: 'Cruz', g: '4' },
  { first: 'Margot', last: 'Webb', g: '5' }, { first: 'Felix', last: 'Stone', g: '4' },
];

export function getDemoStudents(): DemoStudent[] {
  return STUDENT_NAMES.map((n, i) => {
    const status = STATUS_CYCLE[i % STATUS_CYCLE.length];
    const classNames: string[] = [];

    // Assign to classes based on grade
    if (n.g === '5') {
      classNames.push('5th Grade Math');
      if (i % 3 !== 0) classNames.push('5th Grade Science');
    } else {
      classNames.push('4th Grade Math');
      if (i % 2 === 0) classNames.push('4th Grade Reading');
    }
    if (i % 8 === 0) classNames.push('Reading Intervention');

    return {
      first: n.first,
      last: n.last,
      id: `STU-${30001 + i}`,
      grade: n.g,
      status,
      color: AVATAR_COLORS[i % AVATAR_COLORS.length],
      lastSession: LAST_SESSIONS[i % LAST_SESSIONS.length],
      streak: STREAKS[i % STREAKS.length],
      activitiesComplete: ACTIVITIES_COMPLETE[i % ACTIVITIES_COMPLETE.length],
      concern: status === 'attention' ? CONCERNS[i % CONCERNS.length] : null,
      classNames,
    };
  });
}

export const ACTIVITY_HOURS = ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm'];
export const ACTIVITY_VALUES = [12, 28, 47, 38, 8, 41, 36, 37];

export const STATUS_LABELS: Record<string, string> = {
  'on-track': 'On Track',
  attention: 'Needs Attention',
  excelling: 'Excelling',
};
