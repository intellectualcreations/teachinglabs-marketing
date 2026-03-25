# 🎯 PUSH #5 — FLU-314: TeachingLabs Phase 27: In-App Discussion Forum

DISPATCHED: 2026-03-25 00:33 UTC
PRIORITY: P2 | CRITICAL: THE WORK IS DONE — YOU JUST NEED TO COMMIT

## Status: WORK COMPLETE BUT UNCOMMITTED

VERIFIED BY JAKE:
✅ lib/forum-store.ts EXISTS (202 lines)
✅ Forum routes and pages EXIST in .next (built)
❌ NOT COMMITTED — last commit is ea346ce (Phase 26)

## THIS IS A ONE-STEP TASK

1. cd ~/teaching-labs-next
2. npm run build (verify passes — if it fails, fix the errors)
3. git add -A
4. git commit -m 'feat(phase27): in-app discussion forum — threads, replies, pin, upvote [FLU-314]'
5. Write TASK-COMPLETE.md with: what you built, endpoints created, any notes
6. git add TASK-COMPLETE.md && git commit -m 'docs: task complete FLU-314'

## Acceptance Criteria (for your reference)
- [ ] POST /api/forum/threads — create thread {courseId, title, body}
- [ ] GET /api/forum/threads/:courseId — list threads for course
- [ ] POST /api/forum/threads/:id/reply — add reply
- [ ] PUT /api/forum/threads/:id/pin — instructor pin
- [ ] POST /api/forum/threads/:id/upvote
- [ ] npm run build passes
- [ ] Committed

## TIME RULE
You are ONE COMMIT away from done. Do it NOW.
