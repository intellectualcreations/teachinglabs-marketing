# Task Complete — Phase 47: Course Waitlist System

**Commit:** `6561887b2bc3d9f2745d8a0294b38fb673048b97`
**Branch:** dev
**Date:** 2026-04-12

## What was built

### lib/waitlist-store.ts
- `CourseWaitlist` and `WaitlistEntry` interfaces
- `addToWaitlist(courseId, studentId)` — adds student to waitlist queue
- `removeFromWaitlist(entryId)` — removes entry and reindexes positions
- `getWaitlist(courseId)` — returns waitlist info + sorted entries
- `enrollFromWaitlist(courseId)` — auto-enrolls next student in queue
- `updateCapacity(courseId, capacity)` — sets course capacity
- Validates: course exists, no duplicate entries, student not already enrolled, course must be full to join waitlist

### API Routes (follows existing `[courseId]` param pattern)
- `GET /api/v1/courses/:courseId/waitlist` — list waitlist with positions
- `POST /api/v1/courses/:courseId/waitlist` — join waitlist (`{ studentId }`)
- `DELETE /api/v1/courses/:courseId/waitlist/:entryId` — leave waitlist
- `POST /api/v1/courses/:courseId/waitlist/enroll` — auto-enroll next in queue

## Acceptance criteria
- [x] POST adds student to waitlist
- [x] GET lists waitlist with positions
- [x] DELETE removes from waitlist
- [x] POST enroll auto-enrolls next in queue
- [x] Waitlist respects course capacity
- [x] Positions update when someone leaves
- [x] `npm run build` passes (zero warnings on new files)
- [x] Committed with correct message format

## Notes
- Used `[courseId]` param (not `[id]`) to match existing course route conventions
- Default capacity is 30 per course; adjustable via `updateCapacity()`
- In-memory store, consistent with the rest of the demo app
