'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  ArrowLeft, Gear, Sun, Moon, Desktop, SignOut, User,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';

/* ─── Helper: get access token from Supabase session ─── */
async function getAccessToken(): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

/* ─── Main Settings Page ─── */
export default function StudentSettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Profile state
  const [displayName, setDisplayName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [initialPreferredName, setInitialPreferredName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [nameFlagged, setNameFlagged] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Load profile on mount
  useEffect(() => {
    async function loadProfile() {
      const token = await getAccessToken();
      if (!token) { setLoading(false); return; }

      try {
        const res = await fetch('/api/student/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        setDisplayName(data?.display_name || '');
        setPreferredName(data?.preferred_name || '');
        setInitialPreferredName(data?.preferred_name || '');
        setNameFlagged(!!data?.name_flagged);
      } catch {
        /* ignore */
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const isDirty = preferredName !== initialPreferredName;

  async function handleSave() {
    const token = await getAccessToken();
    if (!token) return;
    setSaving(true);
    try {
      setSaveError('');
      const res = await fetch('/api/student/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ preferred_name: preferredName }),
      });
      if (res.ok) {
        setInitialPreferredName(preferredName);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        const data = await res.json();
        setSaveError(data.error || 'Failed to save. Please try again.');
      }
    } catch {
      /* ignore */
    }
    setSaving(false);
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    router.push('/student/signup');
  }

  const themeOptions: { value: 'light' | 'dark' | 'system'; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Desktop },
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center px-4 py-8">
      {/* Back link */}
      <div className="w-full max-w-lg mb-6">
        <button
          onClick={() => router.push('/student/dashboard')}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-teal transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
      </div>

      {/* Settings card */}
      <div className="w-full max-w-lg bg-card-bg border border-border rounded-xl p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Gear size={22} weight="bold" className="text-teal" />
          <h1 className="font-heading text-xl font-bold text-text-primary">Settings</h1>
        </div>

        {/* ─── Profile Section ─── */}
        <div>
          <h2 className="font-heading font-bold text-base text-text-primary flex items-center gap-2 mb-4">
            <User size={20} weight="bold" /> Profile
          </h2>

          {loading ? (
            <p className="text-sm text-text-secondary">Loading...</p>
          ) : (
            <div className="space-y-4">
              {/* Full Name (read-only) */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                <p className="px-3 py-2 rounded-lg bg-bg border border-border text-text-primary text-sm">
                  {displayName || 'Not set'}
                </p>
              </div>

              {/* Role (read-only) */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
                <p className="px-3 py-2 rounded-lg bg-bg border border-border text-text-primary text-sm">
                  Student
                </p>
              </div>

              {/* Preferred Name (editable) */}
              <div>
                {nameFlagged && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-amber-400 mb-1">Your nickname was flagged by your teacher.</p>
                    <p className="text-xs text-text-secondary">Please choose a new one that follows these guidelines:</p>
                    <ul className="text-xs text-text-secondary mt-1 ml-3 list-disc space-y-0.5">
                      <li>Use your real first name or a friendly nickname</li>
                      <li>Keep it appropriate and readable</li>
                      <li>No bad words, symbols, or random characters</li>
                      <li>Something your teacher and classmates would be comfortable with</li>
                    </ul>
                  </div>
                )}
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Nickname
                </label>
                <input
                  type="text"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value.slice(0, 50))}
                  placeholder="What should we call you?"
                  maxLength={50}
                  className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
                />
                <p className="text-xs text-text-muted mt-1">{preferredName.length}/50 characters</p>
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saving || !isDirty}
                className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                  isDirty
                    ? 'bg-teal text-navy hover:bg-teal/90 cursor-pointer'
                    : 'bg-border text-text-muted cursor-not-allowed'
                }`}
              >
                {saved ? (
                  <>
                    <span className="text-green-600">✓</span> Saved!
                  </>
                ) : saving ? (
                  'Saving...'
                ) : (
                  'Save Changes'
                )}
              </button>
              {saveError && (
                <p className="text-sm text-red-500 mt-1">{saveError}</p>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* ─── Appearance Section ─── */}
        <div>
          <h2 className="font-heading font-bold text-base text-text-primary flex items-center gap-2 mb-4">
            <Sun size={20} weight="bold" /> Appearance
          </h2>

          <div>
            <p className="text-sm font-medium text-text-primary mb-2">Theme</p>
            <div className="inline-flex rounded-lg border border-border overflow-hidden">
              {themeOptions.map(({ value, label, icon: ThemeIcon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
                    theme === value
                      ? 'bg-teal text-navy'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <ThemeIcon size={16} /> {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* ─── Log Out ─── */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
        >
          <SignOut size={18} />
          {loggingOut ? 'Logging out...' : 'Log Out'}
        </button>
      </div>
    </div>
  );
}
