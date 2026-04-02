/**
 * POST /api/sandbox/run
 * FLU-319: Execute code in a sandboxed environment.
 *
 * Input:  { language: 'javascript'|'python', code: string, lessonId: string }
 * Output: { stdout: string, stderr: string, exitCode: number }
 */

import { NextRequest, NextResponse } from 'next/server';
import vm from 'node:vm';
import { spawn } from 'node:child_process';
import { getCurrentUser } from '@/lib/users';
import { addSandboxRun } from '@/lib/sandbox-store';
import { rateLimit } from '@/lib/rate-limit';

const TIMEOUT_MS = 5_000;

function runJavaScript(code: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const logs: string[] = [];
    const errors: string[] = [];

    const sandbox = {
      console: {
        log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
        error: (...args: unknown[]) => errors.push(args.map(String).join(' ')),
        warn: (...args: unknown[]) => errors.push(args.map(String).join(' ')),
      },
      setTimeout: undefined,
      setInterval: undefined,
      fetch: undefined,
      process: undefined,
      require: undefined,
    };

    try {
      vm.runInNewContext(code, sandbox, { timeout: TIMEOUT_MS });
      resolve({ stdout: logs.join('\n'), stderr: errors.join('\n'), exitCode: 0 });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(message);
      resolve({ stdout: logs.join('\n'), stderr: errors.join('\n'), exitCode: 1 });
    }
  });
}

function runPython(code: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const proc = spawn('python3', ['-c', code], { timeout: TIMEOUT_MS });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
    proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

    proc.on('close', (exitCode) => {
      resolve({ stdout: stdout.trimEnd(), stderr: stderr.trimEnd(), exitCode: exitCode ?? 1 });
    });

    proc.on('error', (err) => {
      resolve({ stdout: '', stderr: err.message, exitCode: 1 });
    });
  });
}

export async function POST(req: NextRequest) {
  const limit = rateLimit(req);
  if (!limit.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '60' } });
  }

  const user = getCurrentUser();

  let body: { language?: string; code?: string; lessonId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { language, code, lessonId } = body;

  if (!language || !code || !lessonId) {
    return NextResponse.json({ error: 'Missing required fields: language, code, lessonId' }, { status: 400 });
  }

  if (language !== 'javascript' && language !== 'python') {
    return NextResponse.json({ error: 'Unsupported language. Use javascript or python.' }, { status: 400 });
  }

  if (code.length > 10_000) {
    return NextResponse.json({ error: 'Code exceeds maximum length of 10,000 characters' }, { status: 400 });
  }

  const result = language === 'javascript' ? await runJavaScript(code) : await runPython(code);

  const run = addSandboxRun({
    userId: user.id,
    lessonId,
    language,
    code,
    ...result,
  });

  return NextResponse.json({
    id: run.id,
    stdout: result.stdout,
    stderr: result.stderr,
    exitCode: result.exitCode,
  });
}
