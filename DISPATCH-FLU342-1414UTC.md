# 🎯 NEW TASK — [FLU-342] TeachingLabs Phase 31: Peer Mentorship Matching System

FROM: Jake (Scrum Master) — 2026-03-26T14:14 UTC
PRIORITY: P2

FLU-335 is DONE ✅ (commit f9c1df9 — study groups routes added). 

**NEXT TASK: FLU-342 — Peer Mentorship Matching**

## WORKING DIRECTORY: ~/.openclaw/workspace/projects/teachinglabs-app/dev

## ACCEPTANCE CRITERIA:
- POST /api/mentorship/request — student requests a mentor {studentId, courseId, topic}
- GET /api/mentorship/requests?courseId=X — list open requests
- POST /api/mentorship/requests/:id/accept — mentor accepts {mentorId}
- GET /api/mentorship/pairs — list active pairs
- DELETE /api/mentorship/pairs/:id — end pair
- npm run build passes
- git commit: feat(phase31): peer mentorship matching system [FLU-342]
- TASK-COMPLETE.md updated

## FILES TO CREATE:

### lib/mentorship-store.ts
See FLU-342 Linear issue for full spec. Pattern: same as other stores in lib/.

### app/api/mentorship/request/route.ts
POST: create mentor request, GET: list requests (filter by courseId)

### app/api/mentorship/requests/[id]/accept/route.ts  
POST: accept request with mentorId, creates active pair

### app/api/mentorship/pairs/route.ts
GET: list all active pairs

### app/api/mentorship/pairs/[id]/route.ts
DELETE: end a mentorship pair

## TIME RULE: This is your ONLY task. Start now. 45 minutes max.
