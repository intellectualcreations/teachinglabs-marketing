// ── Types ──────────────────────────────────────────────

export interface Reply {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  courseId: string;
  authorId: string;
  authorName: string;
  title: string;
  body: string;
  createdAt: string;
  pinned: boolean;
  replies: Reply[];
}

// ── In-memory store ────────────────────────────────────

const posts: ForumPost[] = [];
let nextPostId = 1;
let nextReplyId = 1;

// ── Mutations ──────────────────────────────────────────

export function createPost(
  courseId: string,
  authorId: string,
  authorName: string,
  title: string,
  body: string,
): ForumPost {
  const post: ForumPost = {
    id: `post_${nextPostId++}`,
    courseId,
    authorId,
    authorName,
    title,
    body,
    createdAt: new Date().toISOString(),
    pinned: false,
    replies: [],
  };
  posts.push(post);
  return post;
}

export function addReply(
  postId: string,
  authorId: string,
  authorName: string,
  body: string,
): Reply | null {
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;

  const reply: Reply = {
    id: `reply_${nextReplyId++}`,
    postId,
    authorId,
    authorName,
    body,
    createdAt: new Date().toISOString(),
  };
  post.replies.push(reply);
  return reply;
}

export function togglePin(postId: string): ForumPost | null {
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;
  post.pinned = !post.pinned;
  return post;
}

// ── Queries ────────────────────────────────────────────

export function getPostsByCourse(courseId: string): ForumPost[] {
  return posts
    .filter((p) => p.courseId === courseId)
    .sort((a, b) => {
      // Pinned first, then by date descending
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export function getPostById(postId: string): ForumPost | undefined {
  return posts.find((p) => p.id === postId);
}

// ── Seed data ──────────────────────────────────────────

function seed() {
  // Algebra I posts
  const p1: ForumPost = {
    id: `post_${nextPostId++}`,
    courseId: 'algebra-1',
    authorId: 'demo-student',
    authorName: 'Alex Demo',
    title: 'Tips for solving multi-step equations?',
    body: 'I keep getting stuck when there are variables on both sides of the equation. Does anyone have a good strategy for keeping track of the steps?',
    createdAt: '2026-03-10T14:30:00Z',
    pinned: false,
    replies: [
      {
        id: `reply_${nextReplyId++}`,
        postId: `post_1`,
        authorId: 'student-emma',
        authorName: 'Emma Wilson',
        body: 'I like to always move variables to the left side first, then combine like terms. Writing each step on a new line really helps!',
        createdAt: '2026-03-10T15:00:00Z',
      },
      {
        id: `reply_${nextReplyId++}`,
        postId: `post_1`,
        authorId: 'instructor-park',
        authorName: 'Mr. Daniel Park',
        body: 'Great question, Alex! Emma\'s approach is solid. Remember: whatever you do to one side, do to the other. I\'ll cover a shortcut in tomorrow\'s lesson.',
        createdAt: '2026-03-10T16:00:00Z',
      },
    ],
  };

  const p2: ForumPost = {
    id: `post_${nextPostId++}`,
    courseId: 'algebra-1',
    authorId: 'instructor-park',
    authorName: 'Mr. Daniel Park',
    title: '📌 Homework reminder: Chapter 3 due Friday',
    body: 'Don\'t forget that the Chapter 3 practice problems are due this Friday. Focus on problems 5-15 for the best exam prep.',
    createdAt: '2026-03-12T09:00:00Z',
    pinned: true,
    replies: [],
  };

  const p3: ForumPost = {
    id: `post_${nextPostId++}`,
    courseId: 'algebra-1',
    authorId: 'student-liam',
    authorName: 'Liam Brooks',
    title: 'Study group for the upcoming quiz',
    body: 'Anyone want to form a study group for the inequalities quiz next week? We could meet after school or do a video call.',
    createdAt: '2026-03-13T11:00:00Z',
    pinned: false,
    replies: [
      {
        id: `reply_${nextReplyId++}`,
        postId: `post_3`,
        authorId: 'demo-student',
        authorName: 'Alex Demo',
        body: 'I\'m in! A video call would work best for me. Maybe Thursday afternoon?',
        createdAt: '2026-03-13T12:30:00Z',
      },
    ],
  };

  // Biology posts
  const p4: ForumPost = {
    id: `post_${nextPostId++}`,
    courseId: 'biology',
    authorId: 'student-mia',
    authorName: 'Mia Rodriguez',
    title: 'Difference between active and passive transport?',
    body: 'Can someone explain in simple terms how active transport is different from passive transport? The textbook explanation is confusing.',
    createdAt: '2026-03-11T10:00:00Z',
    pinned: false,
    replies: [
      {
        id: `reply_${nextReplyId++}`,
        postId: `post_4`,
        authorId: 'demo-student',
        authorName: 'Alex Demo',
        body: 'Think of it like this: passive transport is like rolling a ball downhill (no energy needed). Active transport is like pushing a ball uphill (requires energy/ATP).',
        createdAt: '2026-03-11T11:15:00Z',
      },
    ],
  };

  const p5: ForumPost = {
    id: `post_${nextPostId++}`,
    courseId: 'biology',
    authorId: 'instructor-torres',
    authorName: 'Ms. Rachel Torres',
    title: '📌 Lab safety reminder',
    body: 'Please review the lab safety guidelines before our hands-on session on Wednesday. Closed-toe shoes and safety goggles are mandatory.',
    createdAt: '2026-03-14T08:00:00Z',
    pinned: true,
    replies: [],
  };

  posts.push(p1, p2, p3, p4, p5);
}

seed();
