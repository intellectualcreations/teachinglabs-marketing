'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Envelope,
  UserPlus,
  SignOut,
} from '@phosphor-icons/react';

interface PeerTutor {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  bio: string;
  optedInAt: string;
}

interface TutorDirectoryProps {
  courseId: string;
  currentUserId: string;
  currentUserName: string;
  onRequestTutor?: (tutorUserId: string) => void;
}

export default function TutorDirectory({
  courseId,
  currentUserId,
  currentUserName,
  onRequestTutor,
}: TutorDirectoryProps) {
  const [tutors, setTutors] = useState<PeerTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [showOptIn, setShowOptIn] = useState(false);
  const [bio, setBio] = useState('');

  const fetchTutors = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/tutors`);
      if (res.ok) {
        const data = await res.json();
        setTutors(data.tutors || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  const isTutor = tutors.some((t) => t.userId === currentUserId);

  async function handleOptIn() {
    if (toggling) return;
    setToggling(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/tutors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          userName: currentUserName,
          bio: bio.trim(),
        }),
      });
      if (res.ok) {
        setShowOptIn(false);
        setBio('');
        fetchTutors();
      }
    } finally {
      setToggling(false);
    }
  }

  async function handleOptOut() {
    if (toggling) return;
    setToggling(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/tutors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, optOut: true }),
      });
      if (res.ok) fetchTutors();
    } finally {
      setToggling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h3 className="font-heading font-bold text-base text-text-primary flex items-center gap-2">
          <GraduationCap size={20} weight="fill" className="text-teal" />
          Peer Tutors
        </h3>
        {isTutor ? (
          <button
            onClick={handleOptOut}
            disabled={toggling}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-coral hover:text-coral/80 px-3 py-1.5 rounded-full border border-coral/20 hover:bg-coral/5 transition-colors"
          >
            <SignOut size={12} weight="bold" />
            Stop Tutoring
          </button>
        ) : (
          <button
            onClick={() => setShowOptIn(true)}
            disabled={toggling}
            className="inline-flex items-center gap-1.5 font-heading text-xs font-bold bg-teal text-white px-4 py-1.5 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
          >
            <UserPlus size={12} weight="bold" />
            Become a Tutor
          </button>
        )}
      </div>

      {/* Opt-in form */}
      {showOptIn && (
        <div className="bg-card-bg border border-border rounded-xl p-4 mb-4">
          <p className="text-xs text-text-secondary mb-2">
            Help your classmates by sharing what you know. Add a short bio so students know what topics you can help with.
          </p>
          <textarea
            placeholder="e.g., I'm good at equations and can help with homework..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 text-sm border border-border rounded-lg bg-warm-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors resize-none mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={handleOptIn}
              disabled={toggling}
              className="text-xs font-bold bg-teal text-white px-4 py-1.5 rounded-full hover:-translate-y-0.5 transition-all duration-200"
            >
              {toggling ? 'Saving...' : 'Confirm'}
            </button>
            <button
              onClick={() => setShowOptIn(false)}
              className="text-xs font-medium text-text-muted hover:text-text-secondary px-3 py-1.5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tutors list */}
      {tutors.length === 0 ? (
        <div className="text-center py-8">
          <GraduationCap size={36} weight="light" className="text-text-muted mx-auto mb-2" />
          <p className="text-sm text-text-secondary">
            No peer tutors yet. Be the first to help your classmates!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tutors.map((tutor) => (
            <div
              key={tutor.id}
              className="bg-card-bg border border-border rounded-xl p-4 flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0">
                <GraduationCap size={18} weight="fill" className="text-teal" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-text-primary">{tutor.userName}</span>
                  {tutor.userId === currentUserId && (
                    <span className="text-[10px] text-text-muted">(you)</span>
                  )}
                </div>
                {tutor.bio && (
                  <p className="text-xs text-text-secondary mt-0.5">{tutor.bio}</p>
                )}
                <span className="text-[10px] text-text-muted mt-1 block">
                  Tutoring since {new Date(tutor.optedInAt).toLocaleDateString()}
                </span>
              </div>
              {tutor.userId !== currentUserId && onRequestTutor && (
                <button
                  onClick={() => onRequestTutor(tutor.userId)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal hover:text-teal/80 px-3 py-1.5 rounded-full border border-teal/20 hover:bg-teal/5 transition-colors flex-shrink-0"
                >
                  <Envelope size={12} weight="bold" />
                  Contact
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
