# Teaching Labs

AI-powered K-12 teaching platform that helps teachers teach, students learn, and parents stay connected.

Built with Next.js 16, React 19, TailwindCSS v4, and TypeScript.

## Quick Start

```bash
# Clone the repo
git clone <repo-url>
cd teachinglabs-app

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Configure your .env.local:
# - NEXTAUTH_SECRET: generate with `openssl rand -base64 32`
# - GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET: from Google Cloud Console
# - COGNEE_API_URL: Cognee server address (default: http://localhost:18000)

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Routes

### Public Routes
| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/login` | Sign in page |
| `/signup` | Create account |
| `/for-teachers` | Teacher information |
| `/for-students` | Student information |
| `/for-parents` | Parent information |
| `/for-districts` | District information |
| `/pricing` | Pricing plans |
| `/how-it-works` | Platform overview |
| `/our-story` | About Teaching Labs |
| `/see-the-difference` | Product comparison |
| `/waitlist` | Join the waitlist |
| `/demo` | Live demo |
| `/app-index` | App index |
| `/contact` | Contact us |

### Protected Routes (requires authentication)
| Route | Description |
|-------|-------------|
| `/dashboard` | Redirects to student dashboard |
| `/student/dashboard` | Student dashboard |
| `/student/main` | Student main view |
| `/student/onboarding` | Student onboarding |
| `/teacher/dashboard` | Teacher dashboard |
| `/teacher/my-classes` | Class management |
| `/teacher/students` | Student roster |
| `/teacher/library` | Content library |
| `/teacher/settings` | Teacher settings |
| `/admin/dashboard` | Admin dashboard |
| `/lessons` | Lessons listing |
| `/lesson/[id]` | Individual lesson |

## Authentication

Authentication is handled by [NextAuth.js v5](https://authjs.dev/) with Google OAuth.

- Protected routes are enforced via middleware
- JWT-based sessions
- Unauthenticated users are redirected to `/login`

### Setting up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Navigate to APIs & Services > Credentials
4. Create an OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env.local`

## Cognee Integration

The app includes a client utility for the [Cognee](https://github.com/topoteretes/cognee) knowledge graph API.

- Server accessed via SSH tunnel (default: `http://localhost:18000`)
- Auth is disabled on the Cognee server
- Available operations: search, add content, cognify, health check, list datasets

Usage:
```typescript
import { cogneeSearch, cogneeHealth } from '@/lib/cognee';

// Check health
const health = await cogneeHealth();

// Search knowledge graph
const results = await cogneeSearch({
  query: 'fractions lesson plan',
  searchType: 'GRAPH_COMPLETION',
  topK: 5,
});
```

## Development Workflow

This project uses a three-branch workflow:

1. **`dev`** — Active development. Feature branches merge here.
2. **`qa`** — Quality assurance. PRs from `dev` require review.
3. **`main`** — Production. PRs from `qa` require approval.

No direct pushes to `qa` or `main`. All changes go through PRs.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, TailwindCSS v4
- **Auth:** NextAuth.js v5 (Google OAuth)
- **Icons:** Phosphor Icons
- **Knowledge Graph:** Cognee HTTP API
- **Language:** TypeScript 5
