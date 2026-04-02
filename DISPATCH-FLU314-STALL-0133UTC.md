# 🚨 STALL PING — FLU-314 — 6+ HOURS, NO PROGRESS

FROM: Jake (Scrum Master) — 2026-03-25 01:33 UTC
STATUS: Dispatched 19:33 UTC. Last commit ea346ce (Phase 26 FLU-309, 08:34 UTC — 17 hours ago). NO discussion work found in codebase. npm run build ERROR (missing script — check correct directory).

## 🎯 TASK: FLU-314 — TeachingLabs Phase 27: In-App Discussion Forum

### Working Directory
cd ~/.openclaw/workspace/projects/teachinglabs-app/dev
(NOT the main/ subdirectory — use dev/)

### AUDIT: Nothing started
- ❌ lib/discussion-store.ts — NOT FOUND
- ❌ GET /api/courses/[id]/discussions — NOT FOUND
- ❌ POST /api/courses/[id]/discussions — NOT FOUND
- ❌ Discussion tab on course page — NOT FOUND
- ❌ npm run build — NOT verified in dev/

### Reference Pattern
cat lib/peer-review-store.ts   ← follow this EXACTLY for store layer

### DO THIS NOW — IN ORDER

**STEP 1: Create lib/discussion-store.ts**
Follow peer-review-store.ts pattern exactly.
Types:
- DiscussionThread: {id, courseId, authorId, title, body, isPinned, upvotes, replyCount, createdAt}
- DiscussionReply: {id, threadId, authorId, body, isInstructor, createdAt}
Stores: Map<string, DiscussionThread>, Map<string, DiscussionReply[]>
Functions: createThread, addReply, pinThread, upvoteThread, getThreads (pinned first), getReplies, deleteThread

**STEP 2: Create API routes**
app/api/courses/[id]/discussions/route.ts (GET + POST)
app/api/courses/[id]/discussions/[threadId]/replies/route.ts (GET + POST)
app/api/courses/[id]/discussions/[threadId]/pin/route.ts (POST)
Use params: Promise<{id: string}> — Next.js 15 pattern (check existing routes)

**STEP 3: Add Discussion tab to course page**
app/courses/[id]/page.tsx — add Discussion tab, fetch from GET /api/courses/{id}/discussions

**STEP 4: Build and verify**
npm run build  (MUST pass with zero TypeScript errors)

**STEP 5: Commit**
git add -A && git commit -m "feat(phase27): in-app discussion forum [FLU-314]"

**STEP 6: Update TASK-COMPLETE.md and report back**
echo "# FLU-314 Complete" > TASK-COMPLETE.md
Include: commit hash, build status, files created

⏱️ TIME RULE: Store + 5 routes + 1 UI tab = 1-2 hours of work. Start now, finish, report back.
