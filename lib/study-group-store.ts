// ── Types ──────────────────────────────────────────────

export type MemberRole = 'OWNER' | 'MEMBER';

export interface StudyGroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
}

export interface GroupNote {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  courseId: string;
  createdById: string;
  maxMembers: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  members: StudyGroupMember[];
  notes: GroupNote[];
}

// ── In-memory store ────────────────────────────────────

const groups: StudyGroup[] = [];
let nextGroupId = 1;
let nextMemberId = 1;
let nextNoteId = 1;

// ── Group mutations ────────────────────────────────────

export function createStudyGroup(
  name: string,
  description: string,
  courseId: string,
  createdById: string,
  maxMembers: number = 10,
  isPublic: boolean = true,
): StudyGroup {
  const now = new Date().toISOString();
  const groupId = `sg_${nextGroupId++}`;

  const ownerMember: StudyGroupMember = {
    id: `sgm_${nextMemberId++}`,
    groupId,
    userId: createdById,
    role: 'OWNER',
    joinedAt: now,
  };

  const group: StudyGroup = {
    id: groupId,
    name,
    description,
    courseId,
    createdById,
    maxMembers,
    isPublic,
    createdAt: now,
    updatedAt: now,
    members: [ownerMember],
    notes: [],
  };

  groups.push(group);
  return group;
}

export function updateStudyGroup(
  groupId: string,
  updates: Partial<Pick<StudyGroup, 'name' | 'description' | 'maxMembers' | 'isPublic'>>,
): StudyGroup | null {
  const group = groups.find((g) => g.id === groupId);
  if (!group) return null;

  if (updates.name !== undefined) group.name = updates.name;
  if (updates.description !== undefined) group.description = updates.description;
  if (updates.maxMembers !== undefined) group.maxMembers = updates.maxMembers;
  if (updates.isPublic !== undefined) group.isPublic = updates.isPublic;
  group.updatedAt = new Date().toISOString();

  return group;
}

export function deleteStudyGroup(groupId: string): boolean {
  const idx = groups.findIndex((g) => g.id === groupId);
  if (idx === -1) return false;
  groups.splice(idx, 1);
  return true;
}

// ── Member mutations ───────────────────────────────────

export function joinStudyGroup(groupId: string, userId: string): StudyGroupMember | null {
  const group = groups.find((g) => g.id === groupId);
  if (!group) return null;

  // Already a member
  if (group.members.some((m) => m.userId === userId)) return null;

  // Group full
  if (group.members.length >= group.maxMembers) return null;

  const member: StudyGroupMember = {
    id: `sgm_${nextMemberId++}`,
    groupId,
    userId,
    role: 'MEMBER',
    joinedAt: new Date().toISOString(),
  };

  group.members.push(member);
  group.updatedAt = new Date().toISOString();
  return member;
}

export function leaveStudyGroup(groupId: string, userId: string): boolean {
  const group = groups.find((g) => g.id === groupId);
  if (!group) return false;

  const idx = group.members.findIndex((m) => m.userId === userId);
  if (idx === -1) return false;

  // Owner can't leave (must delete group instead)
  if (group.members[idx].role === 'OWNER') return false;

  group.members.splice(idx, 1);
  group.updatedAt = new Date().toISOString();
  return true;
}

// ── Note mutations ─────────────────────────────────────

export function createGroupNote(
  groupId: string,
  authorId: string,
  authorName: string,
  title: string,
  content: string,
): GroupNote | null {
  const group = groups.find((g) => g.id === groupId);
  if (!group) return null;

  // Only members can add notes
  if (!group.members.some((m) => m.userId === authorId)) return null;

  const now = new Date().toISOString();
  const note: GroupNote = {
    id: `gn_${nextNoteId++}`,
    groupId,
    authorId,
    authorName,
    title,
    content,
    createdAt: now,
    updatedAt: now,
  };

  group.notes.push(note);
  group.updatedAt = now;
  return note;
}

// ── Queries ────────────────────────────────────────────

export function getStudyGroupById(groupId: string): StudyGroup | undefined {
  return groups.find((g) => g.id === groupId);
}

export function getStudyGroupsByCourse(courseId: string): StudyGroup[] {
  return groups
    .filter((g) => g.courseId === courseId && g.isPublic)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getAllStudyGroups(courseId?: string): StudyGroup[] {
  const filtered = courseId ? groups.filter((g) => g.courseId === courseId) : groups;
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getStudyGroupsForUser(userId: string): StudyGroup[] {
  return groups
    .filter((g) => g.members.some((m) => m.userId === userId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getGroupNotes(groupId: string): GroupNote[] {
  const group = groups.find((g) => g.id === groupId);
  if (!group) return [];
  return [...group.notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function isMember(groupId: string, userId: string): boolean {
  const group = groups.find((g) => g.id === groupId);
  return group ? group.members.some((m) => m.userId === userId) : false;
}

// ── Seed data ──────────────────────────────────────────

function seed() {
  const g1 = createStudyGroup(
    'Algebra Study Squad',
    'Working through practice problems together before quizzes. All skill levels welcome!',
    'algebra-1',
    'student-liam',
    8,
    true,
  );
  joinStudyGroup(g1.id, 'demo-student');
  joinStudyGroup(g1.id, 'student-emma');
  createGroupNote(
    g1.id,
    'student-liam',
    'Liam Brooks',
    'Multi-step Equations Cheat Sheet',
    'Step 1: Distribute if needed\nStep 2: Combine like terms on each side\nStep 3: Move variables to one side\nStep 4: Isolate the variable\n\nRemember: whatever you do to one side, do to the other!',
  );
  createGroupNote(
    g1.id,
    'demo-student',
    'Alex Demo',
    'Inequality Signs Reminder',
    'When you multiply or divide by a negative number, FLIP the inequality sign.\n\nExample: -2x > 6 becomes x < -3',
  );

  const g2 = createStudyGroup(
    'Bio Lab Partners',
    'Reviewing lab procedures and studying for exams together.',
    'biology',
    'student-mia',
    6,
    true,
  );
  joinStudyGroup(g2.id, 'demo-student');
  createGroupNote(
    g2.id,
    'student-mia',
    'Mia Rodriguez',
    'Cell Transport Summary',
    'Passive Transport: No energy needed (diffusion, osmosis, facilitated diffusion)\nActive Transport: Energy (ATP) required (sodium-potassium pump, endocytosis, exocytosis)',
  );

  createStudyGroup(
    'Creative Writers Circle',
    'Share your work, give feedback, and improve together.',
    'creative-writing',
    'demo-student',
    10,
    true,
  );
}

seed();
