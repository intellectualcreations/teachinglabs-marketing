'use client';

/**
 * FLU-319: Live Coding Sandbox — Monaco Editor playground with sandboxed execution.
 */

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodePlaygroundProps {
  lessonId: string;
  starterCode?: string;
}

interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export default function CodePlayground({ lessonId, starterCode }: CodePlaygroundProps) {
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
  const [code, setCode] = useState(starterCode || '// Write your code here\nconsole.log("Hello, world!");');
  const [output, setOutput] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<Array<{ id: string; language: string; createdAt: string; exitCode: number }>>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleRun = useCallback(async () => {
    setRunning(true);
    setOutput(null);
    try {
      const res = await fetch('/api/sandbox/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code, lessonId }),
      });
      const data = await res.json();
      if (res.ok) {
        setOutput({ stdout: data.stdout, stderr: data.stderr, exitCode: data.exitCode });
      } else {
        setOutput({ stdout: '', stderr: data.error || 'Unknown error', exitCode: 1 });
      }
    } catch (err) {
      setOutput({ stdout: '', stderr: 'Network error — could not reach sandbox.', exitCode: 1 });
    } finally {
      setRunning(false);
    }
  }, [language, code, lessonId]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/sandbox/history/${lessonId}`);
      const data = await res.json();
      setHistory(data.history || []);
      setShowHistory(true);
    } catch {
      setHistory([]);
    }
  }, [lessonId]);

  const handleLanguageChange = (lang: 'javascript' | 'python') => {
    setLanguage(lang);
    if (!starterCode) {
      setCode(lang === 'javascript'
        ? '// Write your code here\nconsole.log("Hello, world!");'
        : '# Write your code here\nprint("Hello, world!")');
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-surface-alt">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-secondary">Language:</span>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as 'javascript' | 'python')}
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadHistory}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover transition-colors"
          >
            History
          </button>
          <button
            onClick={handleRun}
            disabled={running}
            className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {running ? 'Running…' : '▶ Run'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="h-72">
        <MonacoEditor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
          }}
        />
      </div>

      {/* Output */}
      {output && (
        <div className="border-t border-border">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-alt">
            <span className="text-sm font-medium text-text-secondary">Output</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              output.exitCode === 0
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {output.exitCode === 0 ? 'Success' : `Exit ${output.exitCode}`}
            </span>
          </div>
          <pre className="px-4 py-3 text-sm font-mono text-text-primary whitespace-pre-wrap max-h-48 overflow-y-auto bg-gray-950 text-gray-100">
            {output.stdout && <span>{output.stdout}</span>}
            {output.stderr && <span className="text-red-400">{output.stdout ? '\n' : ''}{output.stderr}</span>}
            {!output.stdout && !output.stderr && <span className="text-gray-500">(no output)</span>}
          </pre>
        </div>
      )}

      {/* History panel */}
      {showHistory && (
        <div className="border-t border-border">
          <div className="flex items-center justify-between px-4 py-2 bg-surface-alt">
            <span className="text-sm font-medium text-text-secondary">Recent Runs</span>
            <button onClick={() => setShowHistory(false)} className="text-xs text-text-muted hover:text-text-secondary">
              Close
            </button>
          </div>
          <div className="px-4 py-2 space-y-1 max-h-40 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-sm text-text-muted">No runs yet.</p>
            ) : (
              history.map((run) => (
                <div key={run.id} className="flex items-center justify-between text-xs text-text-secondary py-1 border-b border-border/50 last:border-0">
                  <span className="font-mono">{run.language}</span>
                  <span className={run.exitCode === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {run.exitCode === 0 ? '✓' : '✗'}
                  </span>
                  <span>{new Date(run.createdAt).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
