'use client';

import { useState, useEffect } from 'react';
import { VideoCamera, CircleNotch } from '@phosphor-icons/react';
import { authFetch } from '@/lib/api-fetch';

interface RecordingData {
  id: string;
  sessionId: string;
  lessonId: string;
  storageUrl: string;
  duration: number;
  status: string;
  createdAt: string;
}

interface VideoPlayerProps {
  lessonId: string;
}

export default function VideoPlayer({ lessonId }: VideoPlayerProps) {
  const [recording, setRecording] = useState<RecordingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`/api/lessons/${lessonId}/recording`)
      .then((res) => res.json())
      .then((data: { recording: RecordingData | null }) => {
        setRecording(data.recording ?? null);
      })
      .catch(() => setRecording(null))
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-text-muted py-4">
        <CircleNotch size={16} weight="bold" className="animate-spin" />
        Checking for session recording...
      </div>
    );
  }

  if (!recording) {
    return null;
  }

  function formatDuration(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <VideoCamera size={16} weight="fill" className="text-coral" />
        <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">
          Session Recording
        </span>
        {recording.duration > 0 && (
          <span className="text-xs text-text-muted">
            ({formatDuration(recording.duration)})
          </span>
        )}
      </div>
      <div className="relative w-full rounded-xl overflow-hidden bg-navy" style={{ paddingBottom: '56.25%' }}>
        <video
          src={recording.storageUrl}
          controls
          preload="metadata"
          className="absolute inset-0 w-full h-full"
        >
          Your browser does not support video playback.
        </video>
      </div>
      <p className="text-xs text-text-muted mt-2">
        This is a recording from the live session. Watch it to catch up on what you missed.
      </p>
    </div>
  );
}
