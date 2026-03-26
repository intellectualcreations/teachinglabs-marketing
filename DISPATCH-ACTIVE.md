# 🎯 DISPATCH #3 — FLU-319: TeachingLabs Phase 28 — Live Coding Sandbox
FROM: Jake (Scrum Master)
TIME: 2026-03-25 18:15 UTC
PRIORITY: P2 | Phase 27 done (0c78eea). 4h stall. BUILD IT NOW.

## Working Directory
cd ~/teaching-labs-next

## STEP 1: Install Monaco Editor
```bash
npm install @monaco-editor/react
# OR if pnpm:
pnpm add @monaco-editor/react
```

## STEP 2: Create lib/sandbox-store.ts
```typescript
interface SandboxRun {
  id: string;
  userId: string;
  lessonId: string;
  language: string;
  code: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  createdAt: string;
}

const historyStore: SandboxRun[] = [];

export function addRun(run: Omit<SandboxRun, "id" | "createdAt">): SandboxRun {
  const entry: SandboxRun = { ...run, id: Date.now().toString(), createdAt: new Date().toISOString() };
  historyStore.push(entry);
  return entry;
}

export function getHistory(userId: string, lessonId: string): SandboxRun[] {
  return historyStore
    .filter(r => r.userId === userId && r.lessonId === lessonId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);
}
```

## STEP 3: Create pages/api/sandbox/run.ts
```typescript
import type { NextApiRequest, NextApiResponse } from "next";
import { addRun } from "../../../lib/sandbox-store";
import { execSync } from "child_process";
import vm from "vm";
import fs from "fs";
import path from "path";
import os from "os";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { language, code, lessonId } = req.body;
  const userId = "demo-user";
  let stdout = "", stderr = "", exitCode = 0;

  try {
    if (language === "javascript") {
      try {
        const sandbox = { console: { log: (v: unknown) => { stdout += String(v) + "\\n"; } }, output: "" };
        vm.runInNewContext(code, sandbox, { timeout: 5000 });
      } catch (e: unknown) {
        stderr = e instanceof Error ? e.message : String(e);
        exitCode = 1;
      }
    } else if (language === "python") {
      const tmpFile = path.join(os.tmpdir(), `sandbox_${Date.now()}.py`);
      fs.writeFileSync(tmpFile, code);
      try {
        stdout = execSync(`python3 ${tmpFile}`, { timeout: 5000, encoding: "utf8" });
      } catch (e: unknown) {
        const err = e as { stdout?: string; stderr?: string; status?: number };
        stdout = err.stdout || "";
        stderr = err.stderr || "";
        exitCode = err.status || 1;
      } finally {
        fs.unlinkSync(tmpFile);
      }
    } else {
      stderr = `Unsupported language: ${language}`;
      exitCode = 1;
    }
  } catch (e: unknown) {
    stderr = e instanceof Error ? e.message : String(e);
    exitCode = 1;
  }

  const run = addRun({ userId, lessonId, language, code, stdout, stderr, exitCode });
  res.status(200).json({ stdout, stderr, exitCode, runId: run.id });
}
```

## STEP 4: Create pages/api/sandbox/history/[lessonId].ts
```typescript
import type { NextApiRequest, NextApiResponse } from "next";
import { getHistory } from "../../../../lib/sandbox-store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { lessonId } = req.query;
  const userId = "demo-user";
  const history = getHistory(userId, String(lessonId));
  res.status(200).json({ history });
}
```

## STEP 5: Create components/CodePlayground.tsx
```tsx
"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface Props {
  lessonId: string;
  starterCode?: string;
}

export default function CodePlayground({ lessonId, starterCode = "" }: Props) {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);

  const run = async () => {
    setRunning(true);
    setOutput("Running...");
    try {
      const res = await fetch("/api/sandbox/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, lessonId }),
      });
      const data = await res.json();
      setOutput(data.stdout || data.stderr || "(no output)");
    } catch (e) {
      setOutput("Error running code");
    }
    setRunning(false);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 p-2 bg-gray-100 border-b">
        <select value={language} onChange={e => setLanguage(e.target.value)} className="px-2 py-1 border rounded text-sm">
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
        <button onClick={run} disabled={running} className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50">
          {running ? "Running..." : "▶ Run"}
        </button>
      </div>
      <MonacoEditor height="300px" language={language} value={code} onChange={v => setCode(v || "")} theme="vs-light" />
      {output && (
        <div className="p-3 bg-gray-900 text-green-400 font-mono text-sm min-h-[60px]">
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
}
```

## EXACT STEPS
1. Install @monaco-editor/react
2. Create lib/sandbox-store.ts
3. mkdir -p pages/api/sandbox/history && create the 2 API routes
4. Create components/CodePlayground.tsx
5. npm run build (fix any TS errors)
6. git add -A && git commit -m "feat(phase28): live coding sandbox for lessons [FLU-319]"
7. Update TASK-COMPLETE.md
8. Report back

## DoD
- [ ] components/CodePlayground.tsx exists
- [ ] POST /api/sandbox/run works for JS and Python
- [ ] 5s timeout enforced
- [ ] GET /api/sandbox/history/:lessonId returns last 10
- [ ] npm run build passes
- [ ] git commit done
- [ ] TASK-COMPLETE.md updated

WHEN DONE: Next task is FLU-327 (Phase 29 AI Grading).

