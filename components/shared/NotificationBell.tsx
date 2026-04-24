'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, Exam, Certificate, Checks, BookOpenText, UserPlus } from '@phosphor-icons/react';
import { authFetch } from '@/lib/api-fetch';

interface NotificationItem {
  id: string;
  userId: string;
  type: 'quiz_graded' | 'quiz_submitted' | 'course_completed' | 'new_lesson' | 'enrollment_approved' | 'new_enrollment';
  message: string;
  read: boolean;
  createdAt: string;
  metadata: Record<string, string>;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function NotifIcon({ type }: { type: NotificationItem['type'] }) {
  switch (type) {
    case 'quiz_graded':
      return <Exam size={16} weight="fill" className="text-teal" />;
    case 'quiz_submitted':
      return <Exam size={16} weight="fill" className="text-coral" />;
    case 'course_completed':
      return <Certificate size={16} weight="fill" className="text-gold" />;
    case 'new_lesson':
      return <BookOpenText size={16} weight="fill" className="text-teal" />;
    case 'enrollment_approved':
      return <CheckCircle size={16} weight="fill" className="text-teal" />;
    case 'new_enrollment':
      return <UserPlus size={16} weight="fill" className="text-coral" />;
    default:
      return <Bell size={16} weight="fill" className="text-text-muted" />;
  }
}

export default function NotificationBell({ role }: { role: 'student' | 'instructor' | 'admin' }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await authFetch(`/api/notifications?role=${role}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [role]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open]);

  const markOneRead = async (id: string) => {
    await authFetch(`/api/notifications/${id}/read`, { method: 'POST' });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllReadAction = async () => {
    setLoading(true);
    await authFetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    setLoading(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} weight={unreadCount > 0 ? 'fill' : 'regular'} className="text-white/80" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-coral text-white text-[10px] font-bold flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card-bg border border-border rounded-xl shadow-xl z-[60] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-text-primary">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllReadAction}
                disabled={loading}
                className="inline-flex items-center gap-1 text-xs text-teal hover:text-teal/80 font-medium transition-colors disabled:opacity-50"
              >
                <Checks size={14} weight="bold" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={28} weight="regular" className="text-text-muted mx-auto mb-2" />
                <p className="text-xs text-text-muted">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.read) markOneRead(n.id);
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-teal/5 border-b border-border/50 last:border-b-0 ${
                    !n.read ? 'bg-teal/[0.03]' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-warm-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <NotifIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed ${!n.read ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-text-muted mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-teal flex-shrink-0 mt-1.5" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
