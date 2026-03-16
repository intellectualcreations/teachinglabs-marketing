export interface CourseModule {
  title: string;
  lessonCount: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  tags: string[];
  modules: CourseModule[];
  instructor: string;
  gradeLevel: string;
  thumbnail?: string; // placeholder color
  published: boolean;
  price: number; // cents — 0 = free, >0 = paid
}

export const SUBJECTS = [
  'Math',
  'Science',
  'English',
  'Social Studies',
  'Electives',
] as const;

export type Subject = (typeof SUBJECTS)[number];

export const SUBJECT_COLORS: Record<Subject, string> = {
  Math: 'bg-teal text-white',
  Science: 'bg-[#059669] text-white',
  English: 'bg-coral text-white',
  'Social Studies': 'bg-navy text-white',
  Electives: 'bg-gold text-deep-navy',
};

export const courses: Course[] = [
  // ─── Math ─────────────────────────────────────────────
  {
    id: 'algebra-1',
    title: 'Algebra I',
    description:
      'Build a strong foundation in algebraic thinking. Students explore variables, equations, inequalities, and functions through real-world problem solving and interactive practice.',
    subject: 'Math',
    tags: ['algebra', 'equations', 'functions', 'variables'],
    modules: [
      { title: 'Expressions & Variables', lessonCount: 8 },
      { title: 'Linear Equations', lessonCount: 10 },
      { title: 'Inequalities & Absolute Value', lessonCount: 7 },
      { title: 'Functions & Graphing', lessonCount: 9 },
    ],
    instructor: 'Mr. Daniel Park',
    gradeLevel: 'Grades 8-9',
    thumbnail: '#4FA3A5',
    published: true,
    price: 0,
  },
  {
    id: 'geometry',
    title: 'Geometry',
    description:
      'Discover the world of shapes, proofs, and spatial reasoning. This course covers angles, triangles, circles, area, volume, and coordinate geometry with hands-on constructions.',
    subject: 'Math',
    tags: ['geometry', 'proofs', 'shapes', 'spatial reasoning'],
    modules: [
      { title: 'Points, Lines & Angles', lessonCount: 6 },
      { title: 'Triangles & Congruence', lessonCount: 9 },
      { title: 'Circles & Arc Length', lessonCount: 7 },
      { title: 'Area, Volume & Surface Area', lessonCount: 8 },
    ],
    instructor: 'Ms. Rachel Torres',
    gradeLevel: 'Grades 9-10',
    thumbnail: '#3B8E8F',
    published: true,
    price: 0,
  },
  {
    id: 'pre-calculus',
    title: 'Pre-Calculus',
    description:
      'Prepare for calculus with an in-depth study of advanced functions, trigonometry, sequences, and limits. Emphasizes both conceptual understanding and problem-solving fluency.',
    subject: 'Math',
    tags: ['pre-calculus', 'trigonometry', 'functions', 'limits'],
    modules: [
      { title: 'Polynomial & Rational Functions', lessonCount: 10 },
      { title: 'Trigonometric Functions', lessonCount: 12 },
      { title: 'Sequences & Series', lessonCount: 6 },
      { title: 'Introduction to Limits', lessonCount: 5 },
    ],
    instructor: 'Dr. James Liu',
    gradeLevel: 'Grades 10-11',
    thumbnail: '#2D7A7C',
    published: true,
    price: 2999,
  },

  // ─── Science ──────────────────────────────────────────
  {
    id: 'biology',
    title: 'Biology',
    description:
      'Explore the living world from cells to ecosystems. Students investigate genetics, evolution, human body systems, and ecology through virtual labs and guided inquiry.',
    subject: 'Science',
    tags: ['biology', 'cells', 'genetics', 'ecology'],
    modules: [
      { title: 'Cell Structure & Function', lessonCount: 8 },
      { title: 'Genetics & Heredity', lessonCount: 10 },
      { title: 'Evolution & Natural Selection', lessonCount: 7 },
      { title: 'Ecosystems & Biodiversity', lessonCount: 8 },
    ],
    instructor: 'Ms. Priya Sharma',
    gradeLevel: 'Grades 9-10',
    thumbnail: '#059669',
    published: true,
    price: 0,
  },
  {
    id: 'chemistry',
    title: 'Chemistry',
    description:
      'Understand the matter that makes up our world. This course covers atomic structure, chemical bonding, reactions, stoichiometry, and thermodynamics with virtual experiments.',
    subject: 'Science',
    tags: ['chemistry', 'atoms', 'reactions', 'stoichiometry'],
    modules: [
      { title: 'Atomic Structure & Periodic Table', lessonCount: 7 },
      { title: 'Chemical Bonding', lessonCount: 8 },
      { title: 'Reactions & Stoichiometry', lessonCount: 11 },
      { title: 'States of Matter & Thermodynamics', lessonCount: 6 },
    ],
    instructor: 'Mr. Alex Chen',
    gradeLevel: 'Grades 10-11',
    thumbnail: '#047857',
    published: true,
    price: 0,
  },
  {
    id: 'physics',
    title: 'Physics',
    description:
      'Uncover the fundamental laws governing motion, energy, and waves. Students build intuition through simulations, problem sets, and real-world applications of Newtonian mechanics.',
    subject: 'Science',
    tags: ['physics', 'mechanics', 'energy', 'waves'],
    modules: [
      { title: 'Motion & Forces', lessonCount: 9 },
      { title: 'Energy & Work', lessonCount: 8 },
      { title: 'Waves & Sound', lessonCount: 7 },
      { title: 'Electricity & Magnetism', lessonCount: 10 },
    ],
    instructor: 'Dr. Maria Gonzalez',
    gradeLevel: 'Grades 11-12',
    thumbnail: '#065F46',
    published: true,
    price: 4999,
  },

  // ─── English ──────────────────────────────────────────
  {
    id: 'creative-writing',
    title: 'Creative Writing',
    description:
      'Find your voice as a writer. Students explore poetry, short fiction, personal narrative, and creative nonfiction through workshops, peer review, and revision.',
    subject: 'English',
    tags: ['writing', 'creative', 'poetry', 'fiction'],
    modules: [
      { title: 'Finding Your Voice', lessonCount: 5 },
      { title: 'Short Fiction Workshop', lessonCount: 8 },
      { title: 'Poetry & Spoken Word', lessonCount: 6 },
      { title: 'Revision & Portfolio', lessonCount: 4 },
    ],
    instructor: 'Ms. Olivia Grant',
    gradeLevel: 'Grades 9-12',
    thumbnail: '#E8836B',
    published: true,
    price: 0,
  },
  {
    id: 'literature',
    title: 'World Literature',
    description:
      'Journey through literature from around the globe. Students analyze novels, plays, and essays that explore universal themes of identity, justice, and the human experience.',
    subject: 'English',
    tags: ['literature', 'analysis', 'novels', 'critical thinking'],
    modules: [
      { title: 'The Hero\'s Journey', lessonCount: 7 },
      { title: 'Social Justice in Literature', lessonCount: 8 },
      { title: 'Global Voices & Perspectives', lessonCount: 9 },
      { title: 'Literary Analysis & Essay Writing', lessonCount: 6 },
    ],
    instructor: 'Mr. David Okafor',
    gradeLevel: 'Grades 10-12',
    thumbnail: '#D97060',
    published: true,
    price: 0,
  },
  {
    id: 'grammar-composition',
    title: 'Grammar & Composition',
    description:
      'Master the building blocks of clear, effective writing. This course strengthens grammar, sentence structure, paragraph development, and essay organization skills.',
    subject: 'English',
    tags: ['grammar', 'writing', 'composition', 'essays'],
    modules: [
      { title: 'Sentence Structure & Mechanics', lessonCount: 8 },
      { title: 'Paragraph Development', lessonCount: 6 },
      { title: 'Essay Organization', lessonCount: 7 },
      { title: 'Style & Revision', lessonCount: 5 },
    ],
    instructor: 'Ms. Hannah Lee',
    gradeLevel: 'Grades 7-9',
    thumbnail: '#C46A55',
    published: true,
    price: 0,
  },

  // ─── Social Studies ───────────────────────────────────
  {
    id: 'us-history',
    title: 'US History',
    description:
      'Trace the American story from the founding era through the modern age. Students examine primary sources, debate historical turning points, and connect past events to present issues.',
    subject: 'Social Studies',
    tags: ['history', 'US', 'government', 'primary sources'],
    modules: [
      { title: 'Founding & Constitution', lessonCount: 8 },
      { title: 'Civil War & Reconstruction', lessonCount: 9 },
      { title: 'Industrialization & Reform', lessonCount: 7 },
      { title: 'Modern America', lessonCount: 8 },
    ],
    instructor: 'Mr. Marcus Johnson',
    gradeLevel: 'Grades 10-11',
    thumbnail: '#1F3A5F',
    published: true,
    price: 0,
  },
  {
    id: 'world-geography',
    title: 'World Geography',
    description:
      'Explore the physical and human geography of our planet. Students study landforms, climate, culture, trade, and global connections through maps, data, and case studies.',
    subject: 'Social Studies',
    tags: ['geography', 'maps', 'culture', 'global studies'],
    modules: [
      { title: 'Physical Geography & Climate', lessonCount: 7 },
      { title: 'Population & Culture', lessonCount: 8 },
      { title: 'Economic Geography & Trade', lessonCount: 6 },
      { title: 'Regions of the World', lessonCount: 10 },
    ],
    instructor: 'Ms. Sofia Martinez',
    gradeLevel: 'Grades 8-9',
    thumbnail: '#2A4A6F',
    published: true,
    price: 0,
  },
  {
    id: 'civics',
    title: 'Civics & Government',
    description:
      'Understand how democracy works and your role in it. Students explore the Constitution, branches of government, civil rights, and civic participation through simulations and debate.',
    subject: 'Social Studies',
    tags: ['civics', 'government', 'democracy', 'rights'],
    modules: [
      { title: 'Foundations of Democracy', lessonCount: 6 },
      { title: 'Branches of Government', lessonCount: 8 },
      { title: 'Rights & Responsibilities', lessonCount: 7 },
      { title: 'Civic Participation', lessonCount: 5 },
    ],
    instructor: 'Dr. Robert Kim',
    gradeLevel: 'Grades 8-9',
    thumbnail: '#14213D',
    published: true,
    price: 0,
  },

  // ─── Electives ────────────────────────────────────────
  {
    id: 'art-foundations',
    title: 'Art Foundations',
    description:
      'Develop artistic skills and creative confidence. Students explore drawing, painting, color theory, and design principles while building a personal portfolio.',
    subject: 'Electives',
    tags: ['art', 'drawing', 'painting', 'design'],
    modules: [
      { title: 'Elements of Art', lessonCount: 6 },
      { title: 'Drawing & Sketching', lessonCount: 8 },
      { title: 'Color Theory & Painting', lessonCount: 7 },
      { title: 'Portfolio Project', lessonCount: 4 },
    ],
    instructor: 'Ms. Aiko Tanaka',
    gradeLevel: 'Grades 7-12',
    thumbnail: '#F0C95D',
    published: true,
    price: 0,
  },
  {
    id: 'computer-science',
    title: 'Intro to Computer Science',
    description:
      'Learn to think like a programmer. Students explore computational thinking, algorithms, and coding fundamentals through hands-on projects in Python and web development.',
    subject: 'Electives',
    tags: ['computer science', 'coding', 'python', 'algorithms'],
    modules: [
      { title: 'Computational Thinking', lessonCount: 5 },
      { title: 'Python Fundamentals', lessonCount: 10 },
      { title: 'Data Structures & Algorithms', lessonCount: 8 },
      { title: 'Web Development Basics', lessonCount: 7 },
    ],
    instructor: 'Mr. Kevin Patel',
    gradeLevel: 'Grades 9-12',
    thumbnail: '#D4A843',
    published: true,
    price: 1999,
  },
  {
    id: 'music-theory',
    title: 'Music Theory & Appreciation',
    description:
      'Understand the language of music. Students study rhythm, melody, harmony, and form while exploring genres from classical to contemporary through listening and composition.',
    subject: 'Electives',
    tags: ['music', 'theory', 'composition', 'appreciation'],
    modules: [
      { title: 'Rhythm & Meter', lessonCount: 5 },
      { title: 'Melody & Harmony', lessonCount: 7 },
      { title: 'Musical Forms & Genres', lessonCount: 6 },
      { title: 'Composition Project', lessonCount: 4 },
    ],
    instructor: 'Mr. Carlos Rivera',
    gradeLevel: 'Grades 7-12',
    thumbnail: '#C49B3D',
    published: false,
    price: 0,
  },
];

export function getCourseById(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}

export function getCoursesBySubject(subject: string): Course[] {
  return courses.filter((c) => c.subject === subject);
}

export function searchCourses(query: string): Course[] {
  const q = query.toLowerCase().trim();
  if (!q) return courses;
  return courses.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q)) ||
      c.instructor.toLowerCase().includes(q)
  );
}

export function getPublishedCourses(): Course[] {
  return courses.filter((c) => c.published);
}

export function searchPublishedCourses(query: string): Course[] {
  return searchCourses(query).filter((c) => c.published);
}

export function togglePublished(courseId: string): Course | undefined {
  const course = courses.find((c) => c.id === courseId);
  if (!course) return undefined;
  course.published = !course.published;
  return course;
}

export function updateCoursePrice(courseId: string, price: number): Course | undefined {
  const course = courses.find((c) => c.id === courseId);
  if (!course) return undefined;
  course.price = price;
  return course;
}

export function getAllCourses(): Course[] {
  return courses;
}
