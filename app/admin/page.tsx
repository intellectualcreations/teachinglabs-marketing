'use client';

import { useState, useEffect, useCallback } from 'react';

type Counts = { waitlist: number; contact: number };

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [counts, setCounts] = useState<Counts | null>(null);

  // Probe session by trying to load counts (401 = not authed)
  const loadCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/counts', { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as Counts;
        setCounts(data);
        setAuthed(true);
      } else {
        setAuthed(false);
      }
    } catch {
      setAuthed(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setPassword('');
        setChecking(true);
        await loadCounts();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || 'Incorrect password.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthed(false);
    setCounts(null);
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0a1128 0%, #0d1a3a 100%)',
        color: '#F7F7F8',
        fontFamily: 'var(--font-open-sans, sans-serif)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      {checking ? (
        <p style={{ opacity: 0.6 }}>Loading…</p>
      ) : authed ? (
        <Dashboard counts={counts} onLogout={handleLogout} onRefresh={loadCounts} />
      ) : (
        <LoginCard
          password={password}
          setPassword={setPassword}
          error={error}
          submitting={submitting}
          onSubmit={handleLogin}
        />
      )}
    </main>
  );
}

function Logo() {
  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 14,
        background: '#0a1128',
        border: '1px solid rgba(0,246,237,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/favicon.ico" alt="Teaching Labs" width={32} height={32} />
    </div>
  );
}

function LoginCard({
  password,
  setPassword,
  error,
  submitting,
  onSubmit,
}: {
  password: string;
  setPassword: (v: string) => void;
  error: string;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 380,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: '40px 32px',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Logo />
      <h1
        style={{
          fontFamily: 'var(--font-inter, sans-serif)',
          fontSize: 22,
          fontWeight: 700,
          textAlign: 'center',
          margin: '0 0 6px',
        }}
      >
        Admin Access
      </h1>
      <p style={{ textAlign: 'center', fontSize: 14, opacity: 0.55, margin: '0 0 28px' }}>
        Teaching Labs · Internal
      </p>
      <form onSubmit={onSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '13px 16px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(255,255,255,0.06)',
            color: '#F7F7F8',
            fontSize: 15,
            outline: 'none',
            marginBottom: 16,
          }}
        />
        {error && (
          <p style={{ color: '#EB0A55', fontSize: 13, margin: '0 0 16px', textAlign: 'center' }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting || !password}
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: 10,
            border: 'none',
            background: submitting || !password ? 'rgba(0,246,237,0.3)' : '#00F6ED',
            color: '#0a1128',
            fontWeight: 700,
            fontSize: 15,
            cursor: submitting || !password ? 'default' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

function Dashboard({
  counts,
  onLogout,
  onRefresh,
}: {
  counts: Counts | null;
  onLogout: () => void;
  onRefresh: () => void;
}) {
  return (
    <div style={{ width: '100%', maxWidth: 720 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 32,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.ico" alt="Teaching Labs" width={36} height={36} style={{ borderRadius: 8 }} />
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-inter, sans-serif)',
                fontSize: 22,
                fontWeight: 700,
                margin: 0,
              }}
            >
              Admin Dashboard
            </h1>
            <p style={{ fontSize: 13, opacity: 0.5, margin: '2px 0 0' }}>Teaching Labs</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            padding: '9px 16px',
            borderRadius: 9,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'transparent',
            color: '#F7F7F8',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Log out
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <ExportCard
          label="Waitlist Signups"
          count={counts?.waitlist}
          href="/api/admin/export/waitlist"
          filename="waitlist"
          accent="#00F6ED"
        />
        <ExportCard
          label="Contact Submissions"
          count={counts?.contact}
          href="/api/admin/export/contact"
          filename="contacts"
          accent="#4056F4"
        />
      </div>

      <button
        onClick={onRefresh}
        style={{
          marginTop: 24,
          padding: '8px 14px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'transparent',
          color: 'rgba(247,247,248,0.6)',
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        ↻ Refresh counts
      </button>
    </div>
  );
}

function ExportCard({
  label,
  count,
  href,
  filename,
  accent,
}: {
  label: string;
  count: number | undefined;
  href: string;
  filename: string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 28,
      }}
    >
      <p style={{ fontSize: 14, opacity: 0.6, margin: '0 0 4px' }}>{label}</p>
      <p
        style={{
          fontFamily: 'var(--font-inter, sans-serif)',
          fontSize: 40,
          fontWeight: 800,
          margin: '0 0 20px',
          color: accent,
        }}
      >
        {count ?? '—'}
      </p>
      <a
        href={href}
        download={`${filename}-export.csv`}
        style={{
          display: 'inline-block',
          padding: '11px 20px',
          borderRadius: 10,
          background: accent,
          color: '#0a1128',
          fontWeight: 700,
          fontSize: 14,
          textDecoration: 'none',
        }}
      >
        ↓ Download CSV
      </a>
    </div>
  );
}
