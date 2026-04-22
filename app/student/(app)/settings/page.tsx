'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  ArrowLeft, Gear, Sun, Moon, Desktop, SignOut, User,
} from '@phosphor-icons/react';
import { createClient } from '@/lib/supabase/client';
import { SUPERPOWER_TITLES, INTELLIGENCE_LABELS, INTELLIGENCE_EMOJIS, type Intelligence } from '@/lib/superpower';
import { AVATARS, AVATAR_STYLES } from '@/lib/avatar-manifest';
import Image from 'next/image';

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
  const [superpowerTitle, setSuperpowerTitle] = useState('');
  const [primaryIntelligence, setPrimaryIntelligence] = useState<Intelligence | ''>('');
  const [initialTitle, setInitialTitle] = useState('');
  const [superpowerAvatar, setSuperpowerAvatar] = useState('');
  const [initialAvatar, setInitialAvatar] = useState('');
  const [avatarStyleFilter, setAvatarStyleFilter] = useState('');
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
        setSuperpowerTitle(data?.superpower_title || '');
        setInitialTitle(data?.superpower_title || '');
        setPrimaryIntelligence(data?.primary_intelligence || '');
        setSuperpowerAvatar(data?.superpower_avatar || '');
        setInitialAvatar(data?.superpower_avatar || '');
      } catch {
        /* ignore */
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const isDirty = preferredName !== initialPreferredName || superpowerTitle !== initialTitle || superpowerAvatar !== initialAvatar;

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
        body: JSON.stringify({ preferred_name: preferredName, superpower_title: superpowerTitle, superpower_avatar: superpowerAvatar }),
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
              {/* Preferred Name (editable) — the only identity field students manage */}
              <div>
                {nameFlagged && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-amber-400 mb-1">Your teacher flagged this name.</p>
                    <p className="text-xs text-text-secondary mb-2">Please pick something school-appropriate — a real first name or a nickname you actually go by.</p>
                  </div>
                )}
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Preferred name
                </label>
                <input
                  type="text"
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value.slice(0, 50))}
                  placeholder="Your first name or nickname"
                  maxLength={50}
                  className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
                />
                <p className="text-xs text-text-muted mt-1 leading-snug">
                  This is what your teacher and classmates see every day. Keep it school-appropriate.
                </p>
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

        {/* ─── Superpower Identity Section ─── */}
        {primaryIntelligence && (
          <div>
            <h2 className="font-heading font-bold text-base text-text-primary flex items-center gap-2 mb-4">
              ⚡ My Learning Superpower
            </h2>
            <div className="bg-gradient-to-r from-purple-500/10 to-teal/10 border border-purple-500/20 rounded-xl p-4 mb-4">
              <p className="text-sm font-medium text-text-primary">
                {INTELLIGENCE_EMOJIS[primaryIntelligence as Intelligence]} You are <span className="font-bold text-purple-400">{INTELLIGENCE_LABELS[primaryIntelligence as Intelligence]}</span>
              </p>
            </div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Choose your hero title:</label>
            <div className="grid grid-cols-2 gap-2">
              {SUPERPOWER_TITLES[primaryIntelligence as Intelligence]?.map((title) => (
                <button
                  key={title}
                  onClick={async () => {
                    setSuperpowerTitle(title);
                    const token = (await createClient().auth.getSession()).data.session?.access_token;
                    if (token) {
                      await fetch('/api/student/profile', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ superpower_title: title }),
                      });
                      setSaved(true); setTimeout(() => setSaved(false), 2500);
                    }
                  }}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
                    superpowerTitle === title
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                      : 'bg-white dark:bg-[#1a2332] border-border text-text-secondary hover:border-purple-500/50'
                  }`}
                >
                  {title}
                </button>
              ))}
            </div>

            {/* Avatar Picker */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-text-secondary mb-2">Choose your avatar:</label>
              {/* Style filter tabs */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  onClick={() => setAvatarStyleFilter('')}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                    avatarStyleFilter === '' ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'border-border text-text-muted hover:border-purple-500/50'
                  }`}
                >
                  All
                </button>
                {AVATAR_STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setAvatarStyleFilter(s.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                      avatarStyleFilter === s.id ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'border-border text-text-muted hover:border-purple-500/50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {/* Avatar grid */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
                {AVATARS
                  .filter(a => !avatarStyleFilter || a.style === avatarStyleFilter)
                  .map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={async () => {
                      setSuperpowerAvatar(avatar.path);
                      // Auto-save avatar
                      const token = (await createClient().auth.getSession()).data.session?.access_token;
                      if (token) {
                        await fetch('/api/student/profile', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ superpower_avatar: avatar.path }),
                        });
                        setSaved(true); setTimeout(() => setSaved(false), 2500);
                      }
                    }}
                    className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      superpowerAvatar === avatar.path
                        ? 'border-purple-500 ring-2 ring-purple-500/30 scale-105'
                        : 'border-border hover:border-purple-500/50'
                    }`}
                  >
                    <Image
                      src={avatar.path}
                      alt={avatar.label}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

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
