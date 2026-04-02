'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Reply {
  id: string;
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

export default function InstructorForumPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/forum`);
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

  async function handleTogglePin(postId: string) {
    setToggling(postId);
    try {
      const res = await fetch(`/api/courses/${courseId}/forum/${postId}/pin`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchPosts();
      }
    } finally {
      setToggling(null);
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href={`/instructor/courses/${courseId}`}
          className="text-sm text-text-muted hover:text-teal transition-colors inline-flex items-center gap-1"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Course
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-heading font-bold text-text-primary">
          Discussion Forum
        </h1>
        <span className="text-sm text-text-muted">{posts.length} posts</span>
      </div>

      {posts.length === 0 ? (
        <div className="bg-card-bg border border-border rounded-xl p-10 text-center">
          <p className="text-sm text-text-muted">No forum posts yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`bg-card-bg border rounded-xl p-5 ${
                post.pinned ? 'border-coral/30 bg-coral/[0.02]' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {post.pinned && (
                      <span className="text-xs font-bold text-coral bg-coral/10 px-2 py-0.5 rounded-full">📌 Pinned</span>
                    )}
                    <h3 className="font-heading font-semibold text-sm text-text-primary truncate">
                      {post.title}
                    </h3>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2 mb-2">{post.body}</p>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="font-medium">{post.authorName}</span>
                    <span>{formatDate(post.createdAt)}</span>
                    <span>{post.replies.length} {post.replies.length === 1 ? 'reply' : 'replies'}</span>
                  </div>

                  {/* Show replies inline */}
                  {post.replies.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-border space-y-2">
                      {post.replies.map((reply) => (
                        <div key={reply.id} className="text-xs">
                          <span className="font-medium text-text-primary">{reply.authorName}</span>
                          <span className="text-text-muted mx-1">·</span>
                          <span className="text-text-muted">{formatDate(reply.createdAt)}</span>
                          <p className="text-text-secondary mt-0.5">{reply.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleTogglePin(post.id)}
                  disabled={toggling === post.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
                    post.pinned
                      ? 'bg-coral/10 text-coral hover:bg-coral/20'
                      : 'bg-surface text-text-muted hover:text-text-primary hover:bg-border'
                  } disabled:opacity-50`}
                >
                  {toggling === post.id ? '...' : post.pinned ? 'Unpin' : 'Pin'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
