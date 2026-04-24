'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  CaretLeft,
  PushPin,
  ChatCircleDots,
  PaperPlaneTilt,
  Plus,
  X,
  User,
} from '@phosphor-icons/react';
import { authFetch } from '@/lib/api-fetch';

interface Reply {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

interface ForumPost {
  id: string;
  courseId: string;
  authorId: string;
  authorName: string;
  title: string;
  body: string;
  createdAt: string;
  pinned: boolean;
  replies: Reply[];
}

const DEMO_USER = { id: 'demo-student', name: 'Alex Demo' };

export default function StudentForumPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await authFetch(`/api/courses/${courseId}/forum`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  async function handleCreatePost() {
    if (!newTitle.trim() || !newBody.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await authFetch(`/api/courses/${courseId}/forum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: DEMO_USER.id,
          authorName: DEMO_USER.name,
          title: newTitle.trim(),
          content: newBody.trim(),
        }),
      });
      if (res.ok) {
        setNewTitle('');
        setNewBody('');
        setShowNewPost(false);
        await fetchPosts();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply() {
    if (!selectedPost || !replyBody.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await authFetch(`/api/courses/${courseId}/forum/${selectedPost.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: DEMO_USER.id,
          authorName: DEMO_USER.name,
          body: replyBody.trim(),
        }),
      });
      if (res.ok) {
        setReplyBody('');
        await fetchPosts();
        // Refresh selected post
        const updated = (await (await authFetch(`/api/courses/${courseId}/forum`)).json()).posts;
        const refreshed = updated.find((p: ForumPost) => p.id === selectedPost.id);
        if (refreshed) setSelectedPost(refreshed);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/student/courses/${courseId}`}
              className="flex items-center gap-1 text-sm text-text-muted hover:text-teal transition-colors"
            >
              <CaretLeft size={16} weight="bold" />
              Back to Course
            </Link>
          </div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl text-text-primary flex items-center gap-2">
            <ChatCircleDots size={24} weight="fill" className="text-teal" />
            Discussion Forum
          </h1>
          <button
            onClick={() => { setShowNewPost(true); setSelectedPost(null); }}
            className="inline-flex items-center gap-1.5 font-heading text-sm font-bold bg-teal text-navy px-4 py-2 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
          >
            <Plus size={16} weight="bold" />
            New Post
          </button>
        </div>

        {/* New post form */}
        {showNewPost && (
          <div className="bg-card-bg border border-border rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-base text-text-primary">Create a Post</h2>
              <button onClick={() => setShowNewPost(false)} className="text-text-muted hover:text-text-secondary">
                <X size={18} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Post title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-warm-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors mb-3"
            />
            <textarea
              placeholder="What's on your mind?"
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-warm-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors resize-none mb-3"
            />
            <button
              onClick={handleCreatePost}
              disabled={!newTitle.trim() || !newBody.trim() || submitting}
              className="inline-flex items-center gap-2 font-heading text-sm font-bold bg-teal text-navy px-5 py-2.5 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        )}

        {/* Thread detail view */}
        {selectedPost && (
          <div className="bg-card-bg border border-border rounded-xl overflow-hidden mb-6">
            <div className="p-5 border-b border-border">
              <button
                onClick={() => setSelectedPost(null)}
                className="text-xs text-text-muted hover:text-teal transition-colors mb-3 inline-flex items-center gap-1"
              >
                <CaretLeft size={12} weight="bold" />
                Back to all posts
              </button>
              <div className="flex items-start gap-3">
                {selectedPost.pinned && (
                  <PushPin size={16} weight="fill" className="text-coral flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <h2 className="font-heading font-bold text-lg text-text-primary mb-1">
                    {selectedPost.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
                    <div className="w-5 h-5 rounded-full bg-teal/20 flex items-center justify-center">
                      <User size={12} weight="fill" className="text-teal" />
                    </div>
                    <span className="font-medium text-text-secondary">{selectedPost.authorName}</span>
                    <span>·</span>
                    <span>{formatDate(selectedPost.createdAt)}</span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{selectedPost.body}</p>
                </div>
              </div>
            </div>

            {/* Replies */}
            <div className="divide-y divide-border">
              {selectedPost.replies.map((reply) => (
                <div key={reply.id} className="p-5 pl-10">
                  <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                    <div className="w-5 h-5 rounded-full bg-navy/10 flex items-center justify-center">
                      <User size={12} weight="fill" className="text-navy" />
                    </div>
                    <span className="font-medium text-text-secondary">{reply.authorName}</span>
                    <span>·</span>
                    <span>{formatDate(reply.createdAt)}</span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{reply.body}</p>
                </div>
              ))}
            </div>

            {/* Reply input */}
            <div className="p-5 bg-surface border-t border-border">
              <div className="flex gap-3">
                <textarea
                  placeholder="Write a reply..."
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={2}
                  className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg bg-warm-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors resize-none"
                />
                <button
                  onClick={handleReply}
                  disabled={!replyBody.trim() || submitting}
                  className="self-end inline-flex items-center gap-1.5 font-heading text-sm font-bold bg-teal text-navy px-4 py-2.5 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <PaperPlaneTilt size={14} weight="fill" />
                  Reply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts list */}
        {!selectedPost && (
          <div className="space-y-3">
            {posts.length === 0 ? (
              <div className="bg-card-bg border border-border rounded-xl p-10 text-center">
                <ChatCircleDots size={40} weight="fill" className="text-text-muted/30 mx-auto mb-3" />
                <p className="text-sm text-text-muted">No posts yet. Start the conversation!</p>
              </div>
            ) : (
              posts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => { setSelectedPost(post); setReplyBody(''); }}
                  className="w-full text-left bg-card-bg border border-border rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    {post.pinned && (
                      <PushPin size={16} weight="fill" className="text-coral flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-semibold text-sm text-text-primary mb-1 truncate">
                        {post.title}
                      </h3>
                      <p className="text-xs text-text-secondary line-clamp-2 mb-2">{post.body}</p>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <div className="flex items-center gap-1">
                          <User size={12} weight="fill" />
                          <span>{post.authorName}</span>
                        </div>
                        <span>{formatDate(post.createdAt)}</span>
                        {post.replies.length > 0 && (
                          <div className="flex items-center gap-1 text-teal">
                            <ChatCircleDots size={12} weight="fill" />
                            <span>{post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
