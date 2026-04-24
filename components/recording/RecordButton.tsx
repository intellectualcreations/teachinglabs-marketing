'use client';

import { useState, useRef, useCallback } from 'react';
import { Record, Stop, CircleNotch } from '@phosphor-icons/react';
import { authFetch } from '@/lib/api-fetch';

interface RecordButtonProps {
  sessionId: string;
  lessonId: string;
  /** Optional stream to record; if omitted, captures screen+audio via getDisplayMedia */
  stream?: MediaStream;
  onRecordingComplete?: (recordingId: string) => void;
}

type RecordingState = 'idle' | 'starting' | 'recording' | 'stopping' | 'uploading' | 'done' | 'error';

export default function RecordButton({
  sessionId,
  lessonId,
  stream: externalStream,
  onRecordingComplete,
}: RecordButtonProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current && !externalStream) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, [externalStream]);

  const startRecording = useCallback(async () => {
    setErrorMsg(null);
    setState('starting');

    try {
      // 1. Tell the server we are starting
      const startRes = await authFetch(`/api/sessions/${sessionId}/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', lessonId }),
      });

      if (!startRes.ok) {
        const err = await startRes.json();
        throw new Error(err.error || 'Failed to start recording');
      }

      const { recording } = await startRes.json();
      setRecordingId(recording.id);

      // 2. Get the media stream
      let captureStream: MediaStream;
      if (externalStream) {
        captureStream = externalStream;
      } else {
        captureStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
      }
      streamRef.current = captureStream;

      // 3. Set up MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(captureStream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        // Upload will be triggered from stopRecording
      };

      // Handle the user clicking the browser's "Stop sharing" button
      captureStream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          if (mediaRecorderRef.current?.state === 'recording') {
            stopRecording();
          }
        };
      });

      recorder.start(1000); // collect data every second
      startTimeRef.current = Date.now();
      setState('recording');

      // Elapsed timer
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start recording';
      setErrorMsg(message);
      setState('error');
      cleanup();
    }
  }, [sessionId, lessonId, externalStream, cleanup]);

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || !recordingId) return;

    setState('stopping');

    // Stop the recorder — this fires the final ondataavailable
    const recorder = mediaRecorderRef.current;
    const stopPromise = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
    });
    recorder.stop();
    await stopPromise;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

    setState('uploading');

    try {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const formData = new FormData();
      formData.append('action', 'stop');
      formData.append('recordingId', recordingId);
      formData.append('duration', String(duration));
      formData.append('video', blob, `recording-${recordingId}.webm`);

      const res = await authFetch(`/api/sessions/${sessionId}/record`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to upload recording');
      }

      setState('done');
      onRecordingComplete?.(recordingId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setErrorMsg(message);
      setState('error');
    } finally {
      cleanup();
    }
  }, [recordingId, sessionId, cleanup, onRecordingComplete]);

  function formatElapsed(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // ── Render ─────────────────────────────────────────

  if (state === 'done') {
    return (
      <div className="inline-flex items-center gap-2 text-sm font-semibold text-teal bg-teal/10 border border-teal/20 px-4 py-2 rounded-full">
        <Record size={16} weight="fill" />
        Recording Saved
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-coral bg-coral/10 border border-coral/20 px-4 py-2 rounded-full">
          {errorMsg || 'Recording failed'}
        </div>
        <button
          onClick={() => { setState('idle'); setErrorMsg(null); }}
          className="text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (state === 'recording') {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-coral bg-coral/10 border border-coral/20 px-4 py-2 rounded-full">
          <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
          Recording {formatElapsed(elapsed)}
        </div>
        <button
          onClick={stopRecording}
          className="inline-flex items-center gap-1.5 font-heading text-sm font-bold bg-coral text-white px-4 py-2 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
        >
          <Stop size={16} weight="fill" />
          Stop
        </button>
      </div>
    );
  }

  if (state === 'starting' || state === 'stopping' || state === 'uploading') {
    const label =
      state === 'starting' ? 'Starting...' :
      state === 'stopping' ? 'Stopping...' :
      'Uploading...';
    return (
      <div className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted bg-card-bg border border-border px-4 py-2 rounded-full">
        <CircleNotch size={16} weight="bold" className="animate-spin" />
        {label}
      </div>
    );
  }

  // idle
  return (
    <button
      onClick={startRecording}
      className="inline-flex items-center gap-1.5 font-heading text-sm font-bold bg-coral text-white px-4 py-2 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
    >
      <Record size={16} weight="fill" />
      Record Session
    </button>
  );
}
