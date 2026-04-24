'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CaretLeft,
  NotePencil,
  Plus,
  X,
  User,
} from '@phosphor-icons/react';
import { authFetch } from '@/lib/api-fetch';

interface GroupNote {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface GroupNoteEditorProps {
  groupId: string;
  groupName: string;
  currentUserId: string;
  currentUserName: string;
  onBack: () => void;
}

export default function GroupNoteEditor({
  groupId,
  groupName,
  currentUserId,
  currentUserName,
  onBack,
}: GroupNoteEditorProps) {
  const [notes, setNotes] = useState<GroupNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [selectedNote, setSelectedNote] = useState<GroupNote | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await authFetch(`/api/groups/${groupId}/notes`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  async function handleCreate() {
    if (!newTitle.trim() || !newContent.trim() || creating) return;
    setCreating(true);
    try {
      const res = await authFetch(`/api/groups/${groupId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: currentUserId,
          authorName: currentUserName,
          title: newTitle.trim(),
          content: newContent.trim(),
        }),
      });
      if (res.ok) {
        setShowCreate(false);
        setNewTitle('');
        setNewContent('');
        fetchNotes();
      }
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Single note view
  if (selectedNote) {
    return (
      <div>
        <button
          onClick={() => setSelectedNote(null)}
          className="flex items-center gap-1 text-sm text-teal hover:text-teal/80 font-medium mb-4 transition-colors"
        >
          <CaretLeft size={14} weight="bold" />
          Back to notes
        </button>

        <div className="bg-card-bg border border-border rounded-xl p-6">
          <h2 className="font-heading font-bold text-lg text-text-primary mb-1">
            {selectedNote.title}
          </h2>
          <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
            <div className="w-5 h-5 rounded-full bg-teal/10 flex items-center justify-center">
              <User size={10} weight="fill" className="text-teal" />
            </div>
            <span>{selectedNote.authorName}</span>
            <span>·</span>
            <span>{new Date(selectedNote.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed whitespace-pre-wrap">
            {selectedNote.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-teal hover:text-teal/80 font-medium mb-4 transition-colors"
      >
        <CaretLeft size={14} weight="bold" />
        Back to {groupName}
      </button>

      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2">
          <NotePencil size={20} weight="fill" className="text-teal" />
          Shared Notes
        </h2>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 font-heading text-sm font-bold bg-teal text-white px-4 py-2 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
        >
          <Plus size={16} weight="bold" />
          New Note
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-card-bg border border-border rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-sm text-text-primary">Create Note</h3>
            <button onClick={() => setShowCreate(false)} className="text-text-muted hover:text-text-secondary">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Note title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-warm-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors"
            />
            <textarea
              placeholder="Write your note..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={8}
              className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-warm-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors resize-none font-mono"
            />
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim() || !newContent.trim() || creating}
              className="inline-flex items-center gap-2 font-heading text-sm font-bold bg-teal text-white px-5 py-2.5 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="text-center py-10">
          <NotePencil size={40} weight="light" className="text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-secondary">
            No shared notes yet. Start collaborating!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className="bg-card-bg border border-border rounded-xl p-4 hover:border-teal/30 transition-colors cursor-pointer"
            >
              <h4 className="font-heading font-bold text-sm text-text-primary">{note.title}</h4>
              <p className="text-xs text-text-secondary mt-1 line-clamp-2">{note.content}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
                <span>{note.authorName}</span>
                <span>·</span>
                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
