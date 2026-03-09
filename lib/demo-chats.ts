// Demo student chat data

export interface ChatConvo {
  id: string;
  student: string;
  initials: string;
  topic: string;
  time: string;
  status: 'active' | 'idle' | 'review';
  className: string;
  review: boolean;
  recap: {
    summary: string;
    tags: { label: string; color: 'green' | 'amber' | 'teal' }[];
  };
}

export const DEMO_STUDENTS_CHAT = [
  { name: 'Emma Johnson', initials: 'EJ' },
  { name: 'Liam Martinez', initials: 'LM' },
  { name: 'Noah Brown', initials: 'NB' },
  { name: 'Sophia Williams', initials: 'SW' },
  { name: 'Isabella Rodriguez', initials: 'IR' },
  { name: 'Aiden Davis', initials: 'AD' },
];

export const CHAT_CLASSES = ['All Classes', '5th Period Math', '3rd Period Math', 'ELA', 'Science', 'Social Studies'];

export const DEMO_CHATS: ChatConvo[] = [
  {
    id: 'c1', student: 'Emma Johnson', initials: 'EJ', topic: 'Adding fractions help',
    time: '10 min ago', status: 'active', className: '5th Period Math', review: false,
    recap: { summary: 'Phrased answer as question. Confidence gap, not comprehension.', tags: [
      { label: 'Confidence gap identified', color: 'amber' },
      { label: 'Try positive reinforcement', color: 'teal' },
    ]},
  },
  {
    id: 'c2', student: 'Emma Johnson', initials: 'EJ', topic: "Charlotte's Web themes",
    time: '2h ago', status: 'idle', className: 'ELA', review: false,
    recap: { summary: 'Connected gratitude to loyalty theme without prompting. Ready for compare/contrast.', tags: [
      { label: 'Independent connection', color: 'green' },
      { label: 'Ready for advanced analysis', color: 'teal' },
    ]},
  },
  {
    id: 'c3', student: 'Emma Johnson', initials: 'EJ', topic: 'Properties of matter questions',
    time: 'Yesterday', status: 'idle', className: 'Science', review: false,
    recap: { summary: "Didn't respond to molecular question. Too abstract. Try analogies.", tags: [
      { label: 'Abstract concepts difficult', color: 'amber' },
      { label: 'Use concrete analogies', color: 'teal' },
    ]},
  },
  {
    id: 'c4', student: 'Liam Martinez', initials: 'LM', topic: 'Decimal to fraction conversion',
    time: '1h ago', status: 'active', className: '5th Period Math', review: false,
    recap: { summary: 'Short but accurate. Decimals mastered.', tags: [
      { label: 'Concept mastered', color: 'green' },
    ]},
  },
  {
    id: 'c5', student: 'Liam Martinez', initials: 'LM', topic: 'Opinion essay brainstorm',
    time: 'Yesterday', status: 'idle', className: 'ELA', review: true,
    recap: { summary: "Responded 'idk'. Red flag for ELA engagement. Try cross-subject prompts.", tags: [
      { label: 'Low engagement', color: 'amber' },
      { label: 'Cross-subject prompts needed', color: 'teal' },
    ]},
  },
  {
    id: 'c6', student: 'Noah Brown', initials: 'NB', topic: 'Area of triangles',
    time: '3h ago', status: 'idle', className: '3rd Period Math', review: false,
    recap: { summary: 'Identified base and height. Needs formula application.', tags: [
      { label: 'Conceptual understanding', color: 'green' },
      { label: 'Practice formula application', color: 'teal' },
    ]},
  },
  {
    id: 'c7', student: 'Sophia Williams', initials: 'SW', topic: 'Essay draft review',
    time: '4h ago', status: 'review', className: 'ELA', review: true,
    recap: { summary: "Review flagged: vocabulary doesn't match her profile. Possible copied text.", tags: [
      { label: 'Vocabulary mismatch', color: 'amber' },
      { label: 'Review for authenticity', color: 'amber' },
    ]},
  },
  {
    id: 'c8', student: 'Isabella Rodriguez', initials: 'IR', topic: 'Multiplication tables practice',
    time: 'Yesterday', status: 'idle', className: '3rd Period Math', review: false,
    recap: { summary: '9s table needs more practice for automaticity.', tags: [
      { label: '9s table needs work', color: 'amber' },
    ]},
  },
  {
    id: 'c9', student: 'Isabella Rodriguez', initials: 'IR', topic: 'Map skills vocabulary',
    time: '2 days ago', status: 'idle', className: 'Social Studies', review: false,
    recap: { summary: 'Building vocabulary for map terms.', tags: [
      { label: 'Vocabulary building', color: 'green' },
    ]},
  },
  {
    id: 'c10', student: 'Aiden Davis', initials: 'AD', topic: 'Word problem strategies',
    time: '30 min ago', status: 'active', className: '5th Period Math', review: false,
    recap: { summary: 'Division solid. Ready for multi-step.', tags: [
      { label: 'Division mastered', color: 'green' },
      { label: 'Advance to multi-step', color: 'teal' },
    ]},
  },
  {
    id: 'c11', student: 'Aiden Davis', initials: 'AD', topic: 'Civil War timeline',
    time: 'Yesterday', status: 'idle', className: 'Social Studies', review: false,
    recap: { summary: 'Factual recall strong. Needs analytical depth.', tags: [
      { label: 'Strong recall', color: 'green' },
      { label: 'Develop analytical skills', color: 'teal' },
    ]},
  },
];
