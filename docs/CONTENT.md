# Teaching Labs — Content & Feature Audit

> Generated for FLU-19 (Knowledge Base Expansion).
> Last updated: 2026-03-21

---

## Course Catalog (17 courses)

| # | ID | Title | Subject | Grade Level | Modules | Price | Published |
|---|-----|-------|---------|-------------|---------|-------|-----------|
| 1 | `algebra-1` | Algebra I | Math | 8-9 | 4 (34 lessons) | Free | ✅ |
| 2 | `geometry` | Geometry | Math | 9-10 | 4 (30 lessons) | Free | ✅ |
| 3 | `pre-calculus` | Pre-Calculus | Math | 10-11 | 4 (33 lessons) | $29.99 | ✅ |
| 4 | `biology` | Biology | Science | 9-10 | 4 (33 lessons) | Free | ✅ |
| 5 | `chemistry` | Chemistry | Science | 10-11 | 4 (32 lessons) | Free | ✅ |
| 6 | `physics` | Physics | Science | 11-12 | 4 (34 lessons) | $49.99 | ✅ |
| 7 | `creative-writing` | Creative Writing | English | 9-12 | 4 (23 lessons) | Free | ✅ |
| 8 | `literature` | World Literature | English | 10-12 | 4 (30 lessons) | Free | ✅ |
| 9 | `grammar-composition` | Grammar & Composition | English | 7-9 | 4 (26 lessons) | Free | ✅ |
| 10 | `us-history` | US History | Social Studies | 10-11 | 4 (32 lessons) | Free | ✅ |
| 11 | `world-geography` | World Geography | Social Studies | 8-9 | 4 (31 lessons) | Free | ✅ |
| 12 | `civics` | Civics & Government | Social Studies | 8-9 | 4 (26 lessons) | Free | ✅ |
| 13 | `art-foundations` | Art Foundations | Electives | 7-12 | 4 (25 lessons) | Free | ✅ |
| 14 | `computer-science` | Intro to Computer Science | Electives | 9-12 | 4 (30 lessons) | $19.99 | ✅ |
| 15 | `music-theory` | Music Theory & Appreciation | Electives | 7-12 | 4 (22 lessons) | Free | ❌ |
| 16 | `python-fundamentals` | Python Fundamentals | Electives | 9-12 | 5 (33 lessons) | Free | ✅ |
| 17 | `digital-marketing` | Digital Marketing Basics | Electives | 10-12 | 5 (27 lessons) | $14.99 | ✅ |

**Subject breakdown:** Math 3, Science 3, English 3, Social Studies 3, Electives 5.
**Pricing:** 13 free, 4 paid ($14.99 – $49.99). 16 published, 1 draft (Music Theory).

---

## Feature Coverage Matrix

Each row maps a Phase feature area to the app routes, lib stores, and demo data that support it.

| Phase | Feature Area | App Routes | Lib Stores / Services | Demo Data | Coverage |
|-------|-------------|------------|----------------------|-----------|----------|
| 1 | **Auth & Onboarding** | `app/student/signup/`, `app/student/onboarding/`, `app/teacher/signup/` | `lib/auth.ts`, `lib/users.ts` | 3 demo students, 11+ instructors, 1 admin pre-seeded in `users.ts` | ✅ Solid |
| 2 | **Course Catalog** | `app/student/main/`, `app/admin/courses/` | `lib/courses.ts` | 17 courses across 5 subjects with full metadata | ✅ Solid |
| 3 | **Enrollment** | `app/student/my-courses/` | `lib/enrollment-store.ts` | Pre-seeded demo enrollments for `demo-student` (Algebra I, Biology, Creative Writing) | ✅ Solid |
| 4 | **Lessons & Progress** | `app/student/courses/[courseId]/` | `lib/lesson-store.ts`, `lib/streak-store.ts`, `lib/badge-store.ts` | Auto-generated lessons from course modules; streak tracking; badge system (5 badge types) | ✅ Solid |
| 5 | **AI Tutor Chat** | `app/teacher/(app)/student-chats/`, `app/teacher/(app)/conversation-detail/` | `lib/demo-chats.ts` | 6 demo student chat conversations with recaps and tags | ✅ Solid |
| 6 | **Teacher Dashboard** | `app/teacher/(app)/dashboard/`, `app/teacher/(app)/my-classes/`, `app/teacher/(app)/students/`, `app/teacher/(app)/library/` | `lib/demo-data.ts`, `lib/demo-activities.ts` | 5 demo classes, student roster with statuses, activity library | ✅ Solid |
| 7 | **Instructor Grading** | `app/instructor/grades/`, `app/instructor/courses/[id]/` | `lib/grade-store.ts`, `lib/grade-submission-store.ts`, `lib/rubric-store.ts` | Grade store with pending/graded submissions; rubric criteria support | ✅ Solid |
| 8 | **Quizzes** | `app/instructor/courses/[id]/quiz/`, `app/student/grades/` | `lib/quiz-store.ts` | Quiz creation, multiple question types (MC, T/F, short-answer), attempt tracking | ✅ Solid |
| 9 | **Certificates** | `app/student/certificates/[courseId]/` | `lib/certificate-generator.ts` | Certificate generation on 100% course completion; validates enrollment + progress | ✅ Solid |
| 10 | **Payments / Stripe** | `app/student/subscription/` | `lib/stripe.ts`, `lib/payment-store.ts`, `lib/payout-store.ts` | Stripe integration with mock fallback; payment records; payout tracking; subscription tiers (free/pro) | ✅ Solid |
| 11 | **Analytics** | `app/student/analytics/`, `app/instructor/analytics/`, `app/admin/analytics/`, `app/admin/dashboard/` | `lib/analytics-store.ts` | Enrollment trends, completion rates, revenue analytics, quiz performance; admin dashboard | ✅ Solid |
| 12 | **Recordings** | — | `lib/recording-store.ts` | In-memory recording store (CRUD); no dedicated UI page yet | ⚠️ Thin — store exists, no dedicated page |
| 13 | **PWA / Push Notifications** | — | `lib/push-service.ts`, `lib/push-subscription-store.ts`, `lib/notification-store.ts` | VAPID-based web push; subscription management; notification types (quiz_graded, course_completed, etc.) | ⚠️ Thin — backend ready, no visible UI for managing notifications |
| 14 | **AI Auto-Grading** | `app/instructor/ai-grading/` | `lib/ai-grading-service.ts` | OpenAI-backed grading with rubric criteria; mock mode when API key absent | ✅ Solid |
| 15 | **Live Sessions** | `app/student/courses/[courseId]/live-sessions/`, `app/instructor/courses/[id]/live-sessions/` | `lib/live-session-store.ts` | CRUD for scheduled sessions with URL + duration; student and instructor views | ✅ Solid |
| 16 | **Forum / Discussion** | `app/student/courses/[courseId]/forum/`, `app/instructor/courses/[id]/forum/` | `lib/forum-store.ts` | Posts with replies, pinning, per-course threads; student + instructor views | ✅ Solid |
| 17 | **Social Learning** | `app/student/courses/[courseId]/study-groups/`, `app/student/courses/[courseId]/tutors/` | `lib/study-group-store.ts`, `lib/peer-tutor-store.ts` | Study groups (create, join, notes, max members); peer tutor opt-in per course | ✅ Solid |
| 18 | **Knowledge Base (FLU-19)** | — | `lib/courses.ts`, `docs/CONTENT.md` | 17 courses cataloged; this audit document | ✅ This PR |

---

## Content Gaps & Recommendations

| Area | Gap | Recommendation |
|------|-----|----------------|
| **Recordings** | `recording-store.ts` exists but no UI page surfaces recordings to students or instructors. | Add `app/student/courses/[courseId]/recordings/` and `app/instructor/courses/[id]/recordings/` pages. |
| **PWA / Push Notifications** | Backend push service and subscription store are complete. No UI for users to manage notification preferences or view notification history. | Add a notifications bell/dropdown component and a settings page for push preferences. |
| **New course instructors** | The two new courses reference `Ms. Priya Nair` and `Mr. Trevor Banks` who are not yet in `lib/users.ts`. | Add instructor entries to `users.ts` for full demo consistency. |
| **Music Theory** | Only unpublished course. No demo enrollments or quiz data associated with it. | Either publish with sample content or note as intentional draft. |
| **Quiz seed data** | Quizzes are created at runtime. No pre-seeded quiz content exists for browsing without instructor action. | Consider seeding 2-3 sample quizzes for demo courses. |
| **Forum seed data** | Forum store starts empty. First-time visitors see blank discussion boards. | Seed a few demo forum posts for popular courses. |
| **Study group / tutor seed data** | Both stores start empty. Features only populate after student action. | Seed 1-2 study groups and tutors for demo walkthrough. |

---

## Directory Structure Reference

```
app/
├── admin/         → Dashboard, courses management, users, analytics
├── instructor/    → Dashboard, grades, analytics, per-course (quiz, forum, live sessions, AI grading)
├── student/       → Signup, onboarding, main catalog, my-courses, grades, analytics,
│                    certificates, subscription, per-course (lessons, forum, live sessions,
│                    study groups, peer tutors)
└── teacher/       → Signup, dashboard, classes, students, library, chats, settings

lib/
├── courses.ts              → 17 courses (catalog)
├── users.ts                → Demo user directory
├── auth.ts                 → NextAuth server-side helpers
├── enrollment-store.ts     → Enrollment CRUD + pre-seeded data
├── lesson-store.ts         → Auto-generated lessons from course modules
├── quiz-store.ts           → Quiz + question + attempt management
├── grade-store.ts          → Grading + pending submission tracking
├── grade-submission-store.ts → Submission + rubric scoring
├── rubric-store.ts         → Rubric criteria
├── certificate-generator.ts → Completion certificates
├── payment-store.ts        → Payment records
├── payout-store.ts         → Instructor payouts
├── stripe.ts               → Stripe client
├── analytics-store.ts      → Platform-wide analytics
├── notification-store.ts   → In-app notifications
├── push-service.ts         → Web push (VAPID)
├── push-subscription-store.ts → Push subscription management
├── recording-store.ts      → Session recordings
├── live-session-store.ts   → Live session scheduling
├── forum-store.ts          → Discussion forums
├── study-group-store.ts    → Study groups
├── peer-tutor-store.ts     → Peer tutoring
├── streak-store.ts         → Activity streaks
├── badge-store.ts          → Achievement badges
├── recommendation-engine.ts → AI course recommendations
├── demo-data.ts            → Teacher-side demo classes + students
├── demo-activities.ts      → Teacher library activities
├── demo-chats.ts           → AI tutor chat demo data
└── ...config (env, constants, cognee, etc.)
```
