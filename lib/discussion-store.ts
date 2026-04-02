// ── Types ──────────────────────────────────────────────

export interface Reply {
  id: string;
  threadId: string;
  body: string;
  authorId: string;
  authorRole: string;
  accepted: boolean;
  createdAt: string;
}

export interface DiscussionThread {
  id: string;
  courseId: string;
  title: string;
  body: string;
  authorId: string;
  authorRole: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── In-memory stores ───────────────────────────────────

const threads = new Map<string, DiscussionThread>();
const replies = new Map<string, Reply>();

let nextThreadId = 1;
let nextReplyId = 1;

// ── Thread mutations ───────────────────────────────────

export function createThread(
  courseId: string,
  title: string,
  body: string,
  authorId: string,
  authorRole: string,
): DiscussionThread {
  const now = new Date().toISOString();
  const thread: DiscussionThread = {
    id: `discussion_${nextThreadId++}`,
    courseId,
    title,
    body,
    authorId,
    authorRole,
    pinned: false,
    createdAt: now,
    updatedAt: now,
  };
  threads.set(thread.id, thread);
  return thread;
}

export function pinThread(threadId: string, pinned: boolean): DiscussionThread | undefined {
  const thread = threads.get(threadId);
  if (!thread) return undefined;
  thread.pinned = pinned;
  thread.updatedAt = new Date().toISOString();
  return thread;
}

// ── Thread queries ─────────────────────────────────────

export function getThreadsForCourse(courseId: string): DiscussionThread[] {
  return Array.from(threads.values())
    .filter((t) => t.courseId === courseId)
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export function getThread(threadId: string): DiscussionThread | undefined {
  return threads.get(threadId);
}

// ── Reply mutations ────────────────────────────────────

export function addReply(
  threadId: string,
  body: string,
  authorId: string,
  authorRole: string,
): Reply | undefined {
  const thread = threads.get(threadId);
  if (!thread) return undefined;

  const reply: Reply = {
    id: `reply_${nextReplyId++}`,
    threadId,
    body,
    authorId,
    authorRole,
    accepted: false,
    createdAt: new Date().toISOString(),
  };
  replies.set(reply.id, reply);

  thread.updatedAt = new Date().toISOString();
  return reply;
}

export function acceptReply(replyId: string): Reply | undefined {
  const reply = replies.get(replyId);
  if (!reply) return undefined;
  reply.accepted = true;
  return reply;
}

// ── Reply queries ──────────────────────────────────────

export function getRepliesForThread(threadId: string): Reply[] {
  return Array.from(replies.values())
    .filter((r) => r.threadId === threadId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}
