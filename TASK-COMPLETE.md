# Phase 44 — Student Attendance Tracking ✅

## Completed: 2026-03-29

### What was built:
- `lib/attendance-store.ts` — in-memory store for class sessions and attendance records
- `POST /api/v1/courses/:courseId/sessions` — create a class session (date, topic)
- `GET /api/v1/courses/:courseId/sessions` — list sessions for a course
- `POST /api/v1/sessions/:sessionId/attendance` — mark attendance (single or array of {studentId, status})
- `GET /api/v1/sessions/:sessionId/attendance` — get all attendance for a session
- `GET /api/v1/courses/:courseId/students/:studentId/attendance` — student history + attendance percentage
- `POST /api/v1/sessions/:sessionId/attendance/bulk-present` — marks all enrolled students as present

### Key details:
- Follows existing in-memory store pattern (like discussion-store.ts)
- Attendance supports upsert (re-marking updates existing record)
- Status options: present, absent, late
- Attendance percentage counts both "present" and "late" as attended
- Bulk-present uses enrollment-store to find enrolled students
- `npm run build` passes ✅

---

# Phase 46 — Student Portfolio Builder ✅

## Completed: 2026-03-30

### What was built:
- `lib/portfolio-store.ts` — in-memory store for portfolio items, endorsements, and share tokens
- `POST /api/v1/students/:id/portfolio` — create a portfolio item
- `GET /api/v1/students/:id/portfolio` — list all portfolio items for a student
- `GET /api/v1/students/:id/portfolio/:itemId` — get single item
- `DELETE /api/v1/students/:id/portfolio/:itemId` — remove item
- `POST /api/v1/students/:id/portfolio/share` — generate a public share token
- `GET /api/v1/portfolio/:token` — public view (no auth required)
- `POST /api/v1/portfolio/:token/endorse/:itemId` — add instructor endorsement

### Key details:
- PortfolioItem: id, studentId, title, description, type, createdAt, endorsements
- Endorsement: id, instructorId, comment, createdAt
- ShareToken: token, studentId, createdAt
- Public share link works without authentication
- Follows existing in-memory store pattern
- `npm run build` passes ✅
- Commit: 0c5e7ab feat(phase46): student portfolio builder [TeachingLabs-P46]
