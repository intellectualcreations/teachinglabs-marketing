/**
 * FLU-319: In-memory sandbox execution history store.
 */

export interface SandboxRun {
  id: string;
  userId: string;
  lessonId: string;
  language: 'javascript' | 'python';
  code: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  createdAt: string;
}

const sandboxHistory: SandboxRun[] = [];
let nextId = 1;

export function addSandboxRun(
  run: Omit<SandboxRun, 'id' | 'createdAt'>,
): SandboxRun {
  const entry: SandboxRun = {
    ...run,
    id: `run-${nextId++}`,
    createdAt: new Date().toISOString(),
  };
  sandboxHistory.push(entry);
  return entry;
}

export function getSandboxHistory(
  userId: string,
  lessonId: string,
  limit = 10,
): SandboxRun[] {
  return sandboxHistory
    .filter((r) => r.userId === userId && r.lessonId === lessonId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}
