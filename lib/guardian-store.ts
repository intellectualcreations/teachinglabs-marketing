export interface GuardianLink {
  guardianId: string;
  studentId: string;
  linkedAt: string;
}

const links: GuardianLink[] = [];

export function linkGuardian(guardianId: string, studentId: string): GuardianLink {
  const existing = links.find(l => l.guardianId === guardianId && l.studentId === studentId);
  if (existing) return existing;
  const link: GuardianLink = { guardianId, studentId, linkedAt: new Date().toISOString() };
  links.push(link);
  return link;
}

export function getGuardianStudents(guardianId: string): string[] {
  return links.filter(l => l.guardianId === guardianId).map(l => l.studentId);
}
