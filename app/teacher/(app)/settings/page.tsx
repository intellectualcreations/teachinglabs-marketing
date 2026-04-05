'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  User, Lock, Palette, GearSix, Plugs, Info, Trash,
  Eye, EyeSlash, Bell, Sun, Moon, Desktop, BookOpen, Check,
} from '@phosphor-icons/react';
import { useTheme } from 'next-themes';
import { createClient } from '@/lib/supabase/client';

/* ─── Toggle Switch ─── */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
        on ? 'bg-teal' : 'bg-border'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5 ${
          on ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

/* ─── Section Wrapper ─── */
function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; weight?: 'bold' | 'regular' }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2 mb-4">
        <Icon size={22} weight="bold" /> {title}
      </h2>
      <div className="bg-card-bg border border-border rounded-[20px] p-6">
        {children}
      </div>
    </div>
  );
}

/* ─── Delete Modal ─── */
function DeleteModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] mx-4 border border-border rounded-2xl shadow-xl p-6"
        style={{ backgroundColor: '#1a2744' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-heading font-bold text-lg text-white mb-2">Delete Account</h3>
        <p className="text-sm text-text-secondary mb-6">
          This action is permanent. All your classes, activities, and student data will be permanently deleted.
          This cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Settings Page ─── */
export default function SettingsPage() {
  // Profile
  const [name, setName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [school, setSchool] = useState('');
  const [profileDirty, setProfileDirty] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Set email from auth
        setEmail(user.email || '');

        // Fetch profile via admin API route (bypasses RLS)
        const res = await fetch(`/api/teacher/profile?teacherId=${user.id}`);
        if (!res.ok) return;
        const data = await res.json();

        const p = data.profile as { display_name?: string; first_name?: string; last_name?: string; role?: string; school_id?: string } | null;
        const displayName = p?.display_name
          || (p?.first_name && p?.last_name ? `${p.first_name} ${p.last_name}` : null)
          || user.user_metadata?.full_name as string
          || user.user_metadata?.name as string
          || '';
        setName(displayName);
        setPreferredName((p as { preferred_name?: string })?.preferred_name || '');
        setRole(p?.role || 'Teacher');
        setUserId(user.id);

        const schoolData = data.school as { name?: string } | null;
        setSchool(schoolData?.name || '');
      } catch { /* ignore */ }
    }
    loadProfile();
  }, []);

  const handleProfileChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    setProfileDirty(true);
  };

  // Security
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const pwChecks = {
    length: newPw.length >= 8,
    upper: /[A-Z]/.test(newPw),
    number: /\d/.test(newPw),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPw),
  };

  // Appearance — use global next-themes
  const { theme, setTheme } = useTheme();
  const [peerChat, setPeerChat] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [notifSound, setNotifSound] = useState(true);

  // Classroom Defaults
  const [capacity, setCapacity] = useState(30);
  const [archiveAfter, setArchiveAfter] = useState('30 days');
  const [submissionNotif, setSubmissionNotif] = useState<'immediately' | 'daily' | 'weekly'>('immediately');
  const [aiSensitivity, setAiSensitivity] = useState<'low' | 'medium' | 'high'>('medium');

  // Standards & Frameworks
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [stateInput, setStateInput] = useState('');
  const [customFrameworkInput, setCustomFrameworkInput] = useState('');
  const [frameworkSaved, setFrameworkSaved] = useState(false);

  const frameworkOptions = [
    'Common Core State Standards (CCSS)',
    'Next Generation Science Standards (NGSS)',
    'C3 Framework (Social Studies)',
    'National Core Arts Standards',
    'ISTE Standards for Students',
    'State-Specific Standards',
    'Custom Standards',
  ];

  function toggleFramework(fw: string) {
    setSelectedFrameworks((prev) =>
      prev.includes(fw) ? prev.filter((f) => f !== fw) : [...prev, fw]
    );
    setFrameworkSaved(false);
  }

  function saveFrameworkPreferences() {
    setFrameworkSaved(true);
    setTimeout(() => setFrameworkSaved(false), 2500);
  }

  // Delete modal
  const [showDelete, setShowDelete] = useState(false);

  const themeOptions: { value: 'light' | 'dark' | 'system'; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Desktop },
  ];

  const archiveOptions = ['7 days', '14 days', '30 days', '60 days', 'Never'];

  const connectedAccounts = [
    { name: 'Google Classroom', connected: false },
    { name: 'Clever', connected: false },
    { name: 'Canvas LMS', connected: false },
  ];

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-extrabold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-0.5">Manage your account, preferences, and classroom defaults.</p>
      </div>

      <div className="space-y-8">
        {/* ─── 1. Profile ─── */}
        <Section icon={User} title="Profile">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="group relative shrink-0 self-start">
              <div className="w-20 h-20 rounded-full bg-navy text-white flex items-center justify-center font-heading font-bold text-2xl cursor-pointer">
                {name ? name.split(' ').filter(Boolean).map((w: string) => w[0]).slice(0,2).join('').toUpperCase() : '?'}
              </div>
              <div className="absolute inset-0 w-20 h-20 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-white text-xs font-medium">Edit</span>
              </div>
            </div>

            {/* Fields */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={handleProfileChange(setName)}
                  className="w-full px-3 py-2 rounded-lg bg-card-bg border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={handleProfileChange(setEmail)}
                  className="w-full px-3 py-2 rounded-lg bg-card-bg border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">School</label>
                <p className="px-3 py-2 text-sm text-text-secondary">{school || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={handleProfileChange(setRole)}
                  className="w-full px-3 py-2 rounded-lg bg-card-bg border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Preferred Name
                  <span className="font-normal text-text-muted ml-1">(what students see)</span>
                </label>
                <input
                  type="text"
                  value={preferredName}
                  onChange={(e) => { setPreferredName(e.target.value); setProfileDirty(true); }}
                  placeholder="e.g. Mrs. Stewart, Mr. D, Coach K"
                  className="w-full px-3 py-2 rounded-lg bg-card-bg border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
                />
                <p className="text-xs text-text-muted mt-1">Students will see this name instead of your full name.</p>
              </div>

              {profileDirty && (
                <button
                  onClick={async () => {
                    if (!userId) return;
                    setProfileSaving(true);
                    try {
                      const res = await fetch('/api/teacher/profile', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          teacherId: userId,
                          display_name: name,
                          preferred_name: preferredName,
                        }),
                      });
                      if (res.ok) {
                        setProfileDirty(false);
                        setProfileSaved(true);
                        setTimeout(() => setProfileSaved(false), 2500);
                      }
                    } catch { /* ignore */ }
                    setProfileSaving(false);
                  }}
                  disabled={profileSaving}
                  className="mt-2 px-5 py-2 text-sm font-medium bg-teal text-navy rounded-lg hover:bg-teal/90 transition-colors flex items-center gap-2"
                >
                  {profileSaved ? <><Check size={14} weight="bold" /> Saved!</> : profileSaving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </Section>

        {/* ─── 2. Standards & Frameworks ─── */}
        <Section icon={BookOpen} title="Standards & Frameworks">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-text-primary mb-1">Select the standards frameworks you use</p>
              <p className="text-sm text-text-secondary mb-3">
                Your Teaching Twin will suggest standards from these frameworks when you create activities.
              </p>
            </div>

            <div className="space-y-2.5">
              {frameworkOptions.map((fw) => {
                const checked = selectedFrameworks.includes(fw);
                return (
                  <div key={fw}>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div
                        className={`w-5 h-5 rounded border-[1.5px] flex items-center justify-center transition-colors shrink-0 ${
                          checked
                            ? 'bg-teal border-teal'
                            : 'border-border group-hover:border-teal/50'
                        }`}
                        onClick={(e) => { e.preventDefault(); toggleFramework(fw); }}
                      >
                        {checked && <Check size={14} weight="bold" className="text-navy" />}
                      </div>
                      <span
                        className="text-sm text-text-primary"
                        onClick={(e) => { e.preventDefault(); toggleFramework(fw); }}
                      >
                        {fw}
                      </span>
                    </label>

                    {fw === 'State-Specific Standards' && checked && (
                      <div className="ml-8 mt-2">
                        <label className="block text-sm text-text-secondary mb-1">Which state?</label>
                        <input
                          type="text"
                          value={stateInput}
                          onChange={(e) => setStateInput(e.target.value)}
                          placeholder="e.g., Texas, California"
                          className="w-64 px-3 py-2 rounded-lg bg-card-bg border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
                        />
                      </div>
                    )}

                    {fw === 'Custom Standards' && checked && (
                      <div className="ml-8 mt-2">
                        <label className="block text-sm text-text-secondary mb-1">Name your custom framework</label>
                        <input
                          type="text"
                          value={customFrameworkInput}
                          onChange={(e) => setCustomFrameworkInput(e.target.value)}
                          placeholder="e.g., Our District Math Standards"
                          className="w-64 px-3 py-2 rounded-lg bg-card-bg border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={saveFrameworkPreferences}
              className={`mt-2 px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
                frameworkSaved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-teal text-navy hover:bg-teal/90'
              }`}
            >
              {frameworkSaved ? '✓ Preferences Saved' : 'Save Preferences'}
            </button>
          </div>
        </Section>

        {/* ─── 3. Security ─── */}
        <Section icon={Lock} title="Security">
          <div className="space-y-4 max-w-md">
            {/* Password fields */}
            {([
              { label: 'Current Password', value: currentPw, setter: setCurrentPw, show: showCurrentPw, toggle: () => setShowCurrentPw(!showCurrentPw) },
              { label: 'New Password', value: newPw, setter: setNewPw, show: showNewPw, toggle: () => setShowNewPw(!showNewPw) },
              { label: 'Confirm Password', value: confirmPw, setter: setConfirmPw, show: showConfirmPw, toggle: () => setShowConfirmPw(!showConfirmPw) },
            ] as const).map((field) => (
              <div key={field.label}>
                <label className="block text-sm font-medium text-text-secondary mb-1">{field.label}</label>
                <div className="relative">
                  <input
                    type={field.show ? 'text' : 'password'}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    className="w-full px-3 py-2 pr-10 rounded-lg bg-card-bg border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
                  />
                  <button
                    type="button"
                    onClick={field.toggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    {field.show ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            ))}

            {/* Password requirements */}
            {newPw.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {([
                  { key: 'length' as const, label: '8+ characters' },
                  { key: 'upper' as const, label: 'One uppercase letter' },
                  { key: 'number' as const, label: 'One number' },
                  { key: 'special' as const, label: 'One special character' },
                ]).map((req) => (
                  <div key={req.key} className="flex items-center gap-2 text-sm">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      pwChecks[req.key] ? 'bg-green-500 text-white' : 'bg-border text-text-secondary'
                    }`}>
                      {pwChecks[req.key] ? '✓' : ''}
                    </div>
                    <span className={pwChecks[req.key] ? 'text-green-500' : 'text-text-secondary'}>{req.label}</span>
                  </div>
                ))}
              </div>
            )}

            <button className="mt-2 px-5 py-2 text-sm font-medium bg-teal text-navy rounded-lg hover:bg-teal/90 transition-colors">
              Update Password
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-6" />

          {/* Two-factor */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">Two-Factor Authentication</p>
              <p className="text-sm text-text-secondary mt-0.5">Add an extra layer of security to your account</p>
            </div>
            <Toggle on={twoFactor} onToggle={() => setTwoFactor(!twoFactor)} />
          </div>
        </Section>

        {/* ─── 3. Appearance & Preferences ─── */}
        <Section icon={Palette} title="Appearance & Preferences">
          <div className="space-y-6">
            {/* Theme */}
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

            {/* Default Peer Chat */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">Enable peer chat by default for new activities</p>
                <p className="text-sm text-text-secondary mt-0.5">When ON, new activities will have peer chat enabled. You can still override per activity.</p>
              </div>
              <Toggle on={peerChat} onToggle={() => setPeerChat(!peerChat)} />
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">Email Notifications</p>
                <p className="text-sm text-text-secondary mt-0.5">Receive email notifications for student submissions, AI concerns, and class activity</p>
              </div>
              <Toggle on={emailNotif} onToggle={() => setEmailNotif(!emailNotif)} />
            </div>

            {/* Notification Sound */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">Notification Sound</p>
                <p className="text-sm text-text-secondary mt-0.5">Play a sound for in-app notifications</p>
              </div>
              <Toggle on={notifSound} onToggle={() => setNotifSound(!notifSound)} />
            </div>
          </div>
        </Section>

        {/* ─── 4. Classroom Defaults ─── */}
        <Section icon={GearSix} title="Classroom Defaults">
          <div className="space-y-6">
            {/* Default class capacity */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Default Class Capacity</label>
              <input
                type="number"
                min={1}
                max={100}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-28 px-3 py-2 rounded-lg bg-card-bg border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
              />
            </div>

            {/* Auto-archive */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Auto-Archive Chats After</label>
              <select
                value={archiveAfter}
                onChange={(e) => setArchiveAfter(e.target.value)}
                className="w-48 px-3 py-2 rounded-lg bg-card-bg border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-teal/40"
              >
                {archiveOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Student submission notifications */}
            <div>
              <p className="text-sm font-medium text-text-primary mb-2">Student Submission Notifications</p>
              <div className="space-y-2">
                {([
                  { value: 'immediately' as const, label: 'Immediately' },
                  { value: 'daily' as const, label: 'Daily digest' },
                  { value: 'weekly' as const, label: 'Weekly digest' },
                ]).map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="submissionNotif"
                      checked={submissionNotif === opt.value}
                      onChange={() => setSubmissionNotif(opt.value)}
                      className="w-4 h-4 accent-teal"
                    />
                    <span className="text-sm text-text-primary">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* AI concern sensitivity */}
            <div>
              <p className="text-sm font-medium text-text-primary mb-1">AI Concern Sensitivity</p>
              <p className="text-sm text-text-secondary mb-2">How sensitive the AI should be when flagging student concerns</p>
              <div className="inline-flex rounded-lg border border-border overflow-hidden">
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setAiSensitivity(level)}
                    className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                      aiSensitivity === level
                        ? 'bg-teal text-navy'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ─── 5. Connected Accounts ─── */}
        <Section icon={Plugs} title="Connected Accounts">
          <div className="space-y-4">
            {connectedAccounts.map((acct) => (
              <div key={acct.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-text-primary">{acct.name}</p>
                  <span className="text-xs text-text-secondary">Not connected</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-border text-text-secondary">
                    Coming soon
                  </span>
                </div>
                <button className="px-4 py-1.5 text-sm font-medium border border-teal text-teal rounded-lg hover:bg-teal/10 transition-colors">
                  Connect
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── 6. About & Support ─── */}
        <Section icon={Info} title="About & Support">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">TeachingLabs Version</span>
              <span className="text-sm font-medium text-text-primary">v1.0.0-beta</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Support</span>
              <a href="mailto:support@teachinglabs.com" className="text-sm font-medium text-teal hover:underline">
                support@teachinglabs.com
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-sm text-teal hover:underline">Privacy Policy</a>
              <a href="#" className="text-sm text-teal hover:underline">Terms of Service</a>
            </div>
          </div>

          <div className="border-t border-border mt-6 pt-6">
            <button
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
            >
              <Trash size={16} /> Delete My Account
            </button>
          </div>
        </Section>
      </div>

      {/* Delete Account Modal */}
      {showDelete && (
        <DeleteModal
          onClose={() => setShowDelete(false)}
          onConfirm={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
