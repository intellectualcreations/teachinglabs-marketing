// Demo activity data for Library page

export interface DemoActivity {
  id: string;
  title: string;
  subject: string;
  standards: { code: string; text: string }[];
  files: string[];
  links: string[];
  instructions: string;
  status: 'assigned' | 'ready' | 'draft';
  assignedTo: string[];
  createdAt: string;
}

export const DEMO_ACTIVITIES: DemoActivity[] = [
  {
    id: 'act-1',
    title: 'Adding Fractions with Unlike Denominators',
    subject: 'math',
    standards: [{ code: '5.NF.A.1', text: 'Add and subtract fractions with unlike denominators' }],
    files: ['fractions-worksheet.pdf', 'answer-key.pdf'],
    links: ['Khan Academy: Fractions'],
    instructions: 'Complete the worksheet by solving each problem. Show all your work.',
    status: 'assigned',
    assignedTo: ['5th Period Math', '3rd Period Math'],
    createdAt: '2026-02-15',
  },
  {
    id: 'act-2',
    title: 'Multiplying Fractions by Whole Numbers',
    subject: 'math',
    standards: [
      { code: '4.NF.B.4', text: 'Multiply a fraction by a whole number' },
      { code: '5.NF.B.4', text: 'Multiply a fraction or whole number' },
    ],
    files: ['multiply-fractions.pdf', 'practice-problems.docx'],
    links: [],
    instructions: 'Work through the practice problems. Draw models to show your thinking.',
    status: 'ready',
    assignedTo: [],
    createdAt: '2026-02-20',
  },
  {
    id: 'act-3',
    title: 'Equivalent Fractions Visual Activity',
    subject: 'math',
    standards: [{ code: '4.NF.A.1', text: 'Explain why a fraction a/b is equivalent to (n x a)/(n x b)' }],
    files: ['equivalent-fractions-handout.pdf', 'fraction-strips.png'],
    links: ['Fraction Visualizer Tool'],
    instructions: 'Use the fraction strips to find equivalent fractions. Color and label each strip.',
    status: 'assigned',
    assignedTo: ['5th Period Math'],
    createdAt: '2026-02-22',
  },
  {
    id: 'act-4',
    title: "Theme Analysis: Charlotte's Web",
    subject: 'reading',
    standards: [{ code: 'RL.5.2', text: 'Determine a theme of a story from details in the text' }],
    files: ['theme-graphic-organizer.pdf'],
    links: [],
    instructions: 'Read chapters 10-12 and identify the main theme. Use evidence from the text.',
    status: 'ready',
    assignedTo: [],
    createdAt: '2026-03-01',
  },
  {
    id: 'act-5',
    title: 'Ratios in Real Life',
    subject: 'math',
    standards: [
      { code: '6.RP.A.1', text: 'Understand the concept of a ratio' },
      { code: '6.RP.A.3', text: 'Use ratio reasoning to solve real-world problems' },
    ],
    files: ['ratios-project.pdf', 'rubric.docx'],
    links: ['Ratio Video Intro'],
    instructions: 'Find 5 examples of ratios in your daily life. Document them with photos or drawings.',
    status: 'draft',
    assignedTo: [],
    createdAt: '2026-03-05',
  },
  {
    id: 'act-7',
    title: 'Opinion Essay: Should Schools Have Longer Recess?',
    subject: 'writing',
    standards: [{ code: 'W.5.1', text: 'Write opinion pieces on topics or texts, supporting a point of view with reasons' }],
    files: ['opinion-essay-rubric.pdf', 'graphic-organizer.docx'],
    links: ['ReadWriteThink: Opinion Writing'],
    instructions: 'Pick a side and write a 5-paragraph essay. Use at least 3 reasons with evidence.',
    status: 'ready',
    assignedTo: [],
    createdAt: '2026-03-04',
  },
  {
    id: 'act-6',
    title: 'Properties of Matter Lab',
    subject: 'science',
    standards: [{ code: '5-PS1-1', text: 'Matter is made of particles too small to be seen' }],
    files: ['lab-worksheet.pdf', 'safety-guidelines.pdf', 'observation-sheet.xlsx'],
    links: [],
    instructions: 'Follow the lab procedure. Record observations in your data table.',
    status: 'assigned',
    assignedTo: ['Science'],
    createdAt: '2026-03-02',
  },
];

export const LIBRARY_CLASSES = [
  { name: '5th Period Math', students: 28 },
  { name: '3rd Period Math', students: 26 },
  { name: 'English Language Arts', students: 30 },
  { name: 'Science', students: 27 },
  { name: 'Social Studies', students: 29 },
];
