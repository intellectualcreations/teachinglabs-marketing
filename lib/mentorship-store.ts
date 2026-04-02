// ── Types ──────────────────────────────────────────────

export type MentorshipRequestStatus = 'OPEN' | 'ACCEPTED' | 'CANCELLED';

export interface MentorshipRequest {
  id: string;
  studentId: string;
  courseId: string;
  topic: string;
  status: MentorshipRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipPair {
  id: string;
  requestId: string;
  studentId: string;
  mentorId: string;
  courseId: string;
  topic: string;
  active: boolean;
  startedAt: string;
  endedAt: string | null;
}

// ── In-memory store ────────────────────────────────────

const requests: MentorshipRequest[] = [];
const pairs: MentorshipPair[] = [];
let nextRequestId = 1;
let nextPairId = 1;

// ── Request queries ────────────────────────────────────

export function getRequestById(id: string): MentorshipRequest | undefined {
  return requests.find((r) => r.id === id);
}

export function getOpenRequestsByCourse(courseId: string): MentorshipRequest[] {
  return requests.filter((r) => r.courseId === courseId && r.status === 'OPEN');
}

export function getAllOpenRequests(): MentorshipRequest[] {
  return requests.filter((r) => r.status === 'OPEN');
}

// ── Request mutations ──────────────────────────────────

export function createRequest(data: {
  studentId: string;
  courseId: string;
  topic: string;
}): MentorshipRequest {
  const now = new Date().toISOString();
  const request: MentorshipRequest = {
    id: `mr-${nextRequestId++}`,
    studentId: data.studentId,
    courseId: data.courseId,
    topic: data.topic,
    status: 'OPEN',
    createdAt: now,
    updatedAt: now,
  };
  requests.push(request);
  return request;
}

export function updateRequestStatus(
  id: string,
  status: MentorshipRequestStatus,
): MentorshipRequest | undefined {
  const request = requests.find((r) => r.id === id);
  if (request) {
    request.status = status;
    request.updatedAt = new Date().toISOString();
  }
  return request;
}

// ── Pair queries ───────────────────────────────────────

export function getPairById(id: string): MentorshipPair | undefined {
  return pairs.find((p) => p.id === id);
}

export function getActivePairs(): MentorshipPair[] {
  return pairs.filter((p) => p.active);
}

export function getActivePairsByCourse(courseId: string): MentorshipPair[] {
  return pairs.filter((p) => p.courseId === courseId && p.active);
}

// ── Pair mutations ─────────────────────────────────────

export function createPair(data: {
  requestId: string;
  studentId: string;
  mentorId: string;
  courseId: string;
  topic: string;
}): MentorshipPair {
  const pair: MentorshipPair = {
    id: `mp-${nextPairId++}`,
    requestId: data.requestId,
    studentId: data.studentId,
    mentorId: data.mentorId,
    courseId: data.courseId,
    topic: data.topic,
    active: true,
    startedAt: new Date().toISOString(),
    endedAt: null,
  };
  pairs.push(pair);
  return pair;
}

export function endPair(id: string): MentorshipPair | undefined {
  const pair = pairs.find((p) => p.id === id);
  if (pair && pair.active) {
    pair.active = false;
    pair.endedAt = new Date().toISOString();
  }
  return pair;
}
