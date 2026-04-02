/**
 * Student Portfolio store for TeachingLabs.
 *
 * In-memory store for portfolio items, endorsements, and share tokens.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Endorsement {
  id: string;
  instructorId: string;
  comment: string;
  createdAt: string;
}

export interface PortfolioItem {
  id: string;
  studentId: string;
  title: string;
  description: string;
  type: string;
  createdAt: string;
  endorsements: Endorsement[];
}

export interface ShareToken {
  token: string;
  studentId: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------

const items: PortfolioItem[] = [];
const shareTokens: ShareToken[] = [];

// ---------------------------------------------------------------------------
// Portfolio item helpers
// ---------------------------------------------------------------------------

export function createItem(
  studentId: string,
  title: string,
  description: string,
  type: string,
): PortfolioItem {
  const item: PortfolioItem = {
    id: crypto.randomUUID(),
    studentId,
    title,
    description,
    type,
    createdAt: new Date().toISOString(),
    endorsements: [],
  };
  items.push(item);
  return item;
}

export function getItems(studentId: string): PortfolioItem[] {
  return items.filter((i) => i.studentId === studentId);
}

export function getItem(studentId: string, itemId: string): PortfolioItem | undefined {
  return items.find((i) => i.id === itemId && i.studentId === studentId);
}

export function deleteItem(studentId: string, itemId: string): boolean {
  const index = items.findIndex((i) => i.id === itemId && i.studentId === studentId);
  if (index === -1) return false;
  items.splice(index, 1);
  return true;
}

// ---------------------------------------------------------------------------
// Endorsement helpers
// ---------------------------------------------------------------------------

export function addEndorsement(
  studentId: string,
  itemId: string,
  instructorId: string,
  comment: string,
): Endorsement | undefined {
  const item = items.find((i) => i.id === itemId && i.studentId === studentId);
  if (!item) return undefined;
  const endorsement: Endorsement = {
    id: crypto.randomUUID(),
    instructorId,
    comment,
    createdAt: new Date().toISOString(),
  };
  item.endorsements.push(endorsement);
  return endorsement;
}

// ---------------------------------------------------------------------------
// Share token helpers
// ---------------------------------------------------------------------------

export function createShareToken(studentId: string): ShareToken {
  const token: ShareToken = {
    token: crypto.randomUUID(),
    studentId,
    createdAt: new Date().toISOString(),
  };
  shareTokens.push(token);
  return token;
}

export function getByToken(token: string): PortfolioItem[] | undefined {
  const shareToken = shareTokens.find((t) => t.token === token);
  if (!shareToken) return undefined;
  return items.filter((i) => i.studentId === shareToken.studentId);
}
