<div align="center">

# D2P — Diff to Perfection

**AI-powered development assistant for GitHub**

Automate code reviews, fix CI failures, and enhance your development workflow with AI-powered insights and one-click solutions.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-Vertex_AI-4285F4?logo=google-cloud)](https://cloud.google.com/vertex-ai)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql)](https://neon.tech/)

</div>

---

## ✨ Features

- **🔗 GitHub Integration** — Connect any GitHub repository with one click. D2P automatically installs a webhook to listen for PR events.
- **🤖 AI-Powered Reviews** — Every new or updated pull request is analyzed by Gemini 2.5 Flash, producing up to 10 categorized suggestions per review.
- **🏷️ Categorized Suggestions** — Issues are classified by type (bug, security, performance, style, refactor) and severity (critical, major, minor).
- **✅ Accept / Reject Workflow** — Review each suggestion, accept or reject it, and undo any decision at any time.
- **🚀 One-Click Apply** — Accepted suggestions are automatically applied to a new branch and submitted as a GitHub PR — no manual editing required.
- **🔄 Re-trigger Reviews** — Re-run the AI analysis on any PR whenever you want a fresh review.
- **� CI/CD Diagnostics** — Automatically diagnose workflow failures and generate AI-powered patches with one click.
- **🔒 Secure Webhooks** — All incoming webhook payloads are verified with HMAC-SHA256 signatures.
- **🌙 Dark Mode UI** — A sleek, modern dashboard built with Tailwind CSS and shadcn/ui.

---

## 🛠 Tech Stack

| Layer          | Technology                                           |
| -------------- | ---------------------------------------------------- |
| **Framework**  | Next.js 16 (App Router, Server Actions)              |
| **Language**   | TypeScript                                           |
| **AI**         | Google Gemini 2.5 Flash via Vertex AI                |
| **Auth**       | Better Auth with GitHub OAuth (repo scope)           |
| **Database**   | PostgreSQL (Neon) via Prisma ORM                     |
| **Styling**    | Tailwind CSS 4 + shadcn/ui + Radix UI                |
| **Icons**      | Lucide React                                         |
| **GitHub API** | Axios (REST v3)                                      |
| **Utilities**  | adm-zip (CI log parsing), crypto (HMAC verification) |

---

## 📁 Project Structure

```
D2P/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── auth/[...all]/       # Better Auth webhook handler
│   │   ├── ci-status/           # CI analysis SSE endpoint
│   │   ├── review-status/       # PR review SSE endpoint
│   │   └── webhooks/
│   │       ├── github/          # PR webhook handler
│   │       └── github-ci/       # CI webhook handler
│   ├── dashboard/               # Main dashboard
│   │   ├── page.tsx             # Repository list (paginated)
│   │   └── repos/[repoId]/
│   │       ├── page.tsx         # PR list view
│   │       ├── ci/              # CI failure management
│   │       │   ├── page.tsx
│   │       │   └── [ciFailureId]/
│   │       └── pulls/           # PR detail views
│   │           └── [pullId]/
│   ├── layout.tsx               # Root layout with auth context
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles
│
├── actions/                      # Server Actions (Type-safe mutations)
│   ├── ci.ts                    # CI operations: list, get, retrigger, apply patches
│   ├── pulls.ts                 # PR operations: list, get with suggestions, update, apply
│   └── repos.ts                 # Repository operations: connect, disconnect, list
│
├── components/                   # React Components
│   ├── Hero.tsx                 # Landing hero with code diff preview
│   ├── HowItWorks.tsx           # Feature explanation
│   ├── Features.tsx             # Feature list
│   ├── CTA.tsx                  # Call-to-action section
│   ├── Footer.tsx               # Footer
│   ├── NavBar.tsx               # Navigation bar
│   ├── RepoCard.tsx             # Repository card with connect toggle
│   ├── ConnectButton.tsx        # Connect/disconnect button
│   ├── SuggestionPanel.tsx      # Suggestion accept/reject/apply UI
│   ├── ReviewStatusWatcher.tsx  # SSE polling for PR review status
│   ├── CiFailureCard.tsx        # CI failure card display
│   ├── CiDiagnosisPanel.tsx     # CI diagnosis with patches
│   ├── CiStatusWatcher.tsx      # SSE polling for CI analysis
│   ├── RetriggerBtn.tsx         # Re-trigger review button
│   ├── SignInBtn.tsx            # Sign in button
│   ├── ExternalLink.tsx         # External link component
│   └── ui/                      # shadcn/ui components
│       ├── badge.tsx
│       └── button.tsx
│
├── lib/                          # Core Logic & Utilities
│   ├── ai-review.ts             # Gemini diff analysis pipeline
│   ├── ai-ci-review.ts          # CI failure diagnosis pipeline
│   ├── auth.ts                  # Better Auth configuration
│   ├── auth-client.ts           # Client-side auth hooks
│   ├── gh-apply.ts              # GitHub API: branch creation, file updates, PR opening
│   ├── prisma.ts                # Prisma client singleton
│   └── utils.ts                 # Utility functions
│
├── prisma/                       # Database Schema & Migrations
│   ├── schema.prisma            # Prisma schema (User, Repository, PullRequest, Suggestion, CiFailure)
│   └── migrations/              # Database migration history
│
├── generated/prisma/             # Prisma Client (auto-generated, gitignored)
│   ├── client.ts
│   ├── browser.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Repository.ts
│   │   ├── PullRequest.ts
│   │   ├── Suggestion.ts
│   │   └── CiFailure.ts
│   └── ...
│
├── public/                       # Static assets
│
├── .env                         # Environment variables (gitignored)
├── .env.example                 # Example environment variables
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── eslint.config.mjs            # ESLint configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── postcss.config.mjs           # PostCSS configuration
├── package.json                 # Dependencies
└── README.md                    # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (or yarn / pnpm)
- A **PostgreSQL** database (e.g. [Neon](https://neon.tech/))
- A **GitHub OAuth App** with `repo`, `read:user`, and `user:email` scopes
- A **Google Cloud** project with Vertex AI enabled and a service account key

### 1. Clone & Install

```bash
git clone https://github.com/0x-rekt/D2P.git
cd D2P
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the project root:

```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require

# Better Auth (Authentication)
BETTER_AUTH_SECRET=generate-a-random-secret-32-chars-minimum
BETTER_AUTH_URL=http://localhost:3000

# GitHub OAuth (from GitHub Settings > Developer settings > OAuth Apps)
GITHUB_CLIENT_ID=your-github-oauth-app-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-app-client-secret

# Webhook Base URL (use ngrok for local dev)
WEBHOOK_BASE_URL=https://your-domain.ngrok-free.app

# Google Cloud / Vertex AI
GCP_PROJECT_ID=your-gcp-project-id
GCP_REGION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./gcp-service-account.json

# Optional: For Google Cloud Text-to-Speech (if needed)
NEXT_PUBLIC_GOOGLE_CLOUD_TTS_API_KEY=your-api-key
```

**Environment Variable Details:**

| Variable                         | Purpose                                                   | Example                                               |
| -------------------------------- | --------------------------------------------------------- | ----------------------------------------------------- |
| `DATABASE_URL`                   | PostgreSQL connection string                              | `postgresql://user:pass@neon.tech/db?sslmode=require` |
| `BETTER_AUTH_SECRET`             | Secret for signing auth tokens                            | Generated random string                               |
| `BETTER_AUTH_URL`                | Auth callback URL                                         | `http://localhost:3000` or `https://d2p.com`          |
| `GITHUB_CLIENT_ID`               | GitHub OAuth app ID                                       | `Iv1.abc123...`                                       |
| `GITHUB_CLIENT_SECRET`           | GitHub OAuth app secret                                   | `secret_abc123...`                                    |
| `WEBHOOK_BASE_URL`               | Base URL for webhooks (used when registering with GitHub) | `https://d2p.ngrok.io`                                |
| `GCP_PROJECT_ID`                 | Google Cloud project ID                                   | `my-gcp-project`                                      |
| `GCP_REGION`                     | GCP region                                                | `us-central1` or `global`                             |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to GCP service account JSON                          | `./gcp-service-account.json`                          |

> [!TIP]
> For local development with GitHub webhooks, use [ngrok](https://ngrok.com/):
>
> ```bash
> ngrok http 3000
> # Copy the HTTPS URL and set as WEBHOOK_BASE_URL in .env.local
> ```

### 3. Set Up the Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Optional: Seed database or inspect with Prisma Studio
npx prisma studio
```

### 4. Add GCP Credentials

1. Create a service account in Google Cloud Console
2. Generate a JSON key file
3. Place it at the project root as `gcp-service-account.json`
4. Ensure the service account has **Vertex AI User** role

> [!WARNING]
> Keep `gcp-service-account.json` in `.gitignore` — never commit this file!

### 5. Create GitHub OAuth App

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: D2P
   - **Homepage URL**: `http://localhost:3000` (or your domain)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy the **Client ID** and generate a **Client Secret**
5. Add to `.env.local`

> [!NOTE]
> The OAuth app needs `repo`, `read:user`, and `user:email` scopes. These are handled automatically by Better Auth.

### 6. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔄 How It Works

### Pull Request Review Flow

```
┌──────────────┐     webhook      ┌───────────────┐     Gemini AI     ┌─────────────────┐
│   GitHub PR  │ ──────────────►  │  D2P Server   │ ────────────────► │  AI Suggestions │
│  (open/sync) │                  │  (webhook)    │                   │  (stored in DB) │
└──────────────┘                  └───────────────┘                   └────────┬────────┘
                                                                               │
                                                                    accept / reject
                                                                               │
                                                                      ┌───────▼────────┐
                                                                      │  Apply & Create │
                                                                      │   New GitHub PR │
                                                                      └────────────────┘
```

**Step-by-step:**

1. **Sign In** — User authenticates with GitHub OAuth
2. **Connect Repository** — User selects repos to monitor, D2P registers a webhook
3. **PR Webhook Triggered** — GitHub sends `pull_request` event (opened/synchronize)
4. **Fetch Diff** — D2P retrieves the pull request diff (capped at 500KB)
5. **AI Analysis** — Diff sent to Gemini 2.5 Flash with system prompt
6. **Generate Suggestions** — Up to 10 categorized suggestions (bug, security, performance, style, refactor)
7. **Store Results** — Suggestions persisted in database with status `pending`
8. **User Review** — User reviews suggestions in dashboard
9. **Accept/Reject** — User marks suggestions as `accepted` or `rejected`
10. **Apply Patch** — One-click action creates new branch, applies patches, opens PR

### CI/CD Failure Diagnosis Flow

```
┌──────────────────┐      webhook/polling      ┌─────────────┐       AI Analysis       ┌──────────────┐
│  CI Workflow     │ ──────────────────────►   │   D2P       │ ────────────────────►   │ Diagnosis +  │
│  Failure Event   │                           │  (fetch     │                         │  Patches     │
└──────────────────┘                           │   logs)     │                         └──────┬───────┘
                                               └─────────────┘                                │
                                                                                   apply patches
                                                                                        │
                                                                               ┌──────▼────────┐
                                                                               │  Create PR    │
                                                                               │  with fixes   │
                                                                               └───────────────┘
```

**Step-by-step:**

1. **CI Workflow Fails** — GitHub Actions / CI job fails
2. **Fetch Logs** — D2P downloads workflow logs as ZIP
3. **Parse Logs** — Extract error messages and context
4. **Fetch Changed Files** — Get diff of the failing commit
5. **AI Diagnosis** — Send logs + diff to Gemini for root cause analysis
6. **Generate Patches** — AI suggests code fixes
7. **User Review** — User reviews diagnosis and patches
8. **Apply Patch** — One-click to create PR with fixes

---

## 📊 Data Model

### Prisma Schema Overview

| Model          | Purpose                | Key Fields                                                                                                                                                       |
| -------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `User`         | Authenticated users    | id, email, name, sessions                                                                                                                                        |
| `Session`      | Auth sessions          | id, userId, expiresAt                                                                                                                                            |
| `Account`      | OAuth credentials      | id, userId, provider, providerAccountId, accessToken                                                                                                             |
| `Verification` | Email verification     | id, identifier, value, expiresAt                                                                                                                                 |
| `Repository`   | Connected GitHub repos | id, userId, name, owner, webhookId, webhookSecret, isConnected                                                                                                   |
| `PullRequest`  | Tracked PRs            | id, repositoryId, githubId, title, url, status (pending/reviewing/reviewed/failed)                                                                               |
| `Suggestion`   | AI suggestions         | id, pullRequestId, file, lineStart, lineEnd, type (bug/security/performance/style/refactor), severity (critical/major/minor), status (pending/accepted/rejected) |
| `CiFailure`    | CI workflow failures   | id, repositoryId, workflowRunId, jobName, conclusion, logs, diagnosis, status (pending/diagnosed/patched)                                                        |

---

## 🔌 API Routes

### Authentication

| Method     | Route                | Description                                    |
| ---------- | -------------------- | ---------------------------------------------- |
| `GET/POST` | `/api/auth/[...all]` | Better Auth handler (catch-all for OAuth flow) |

### Webhooks

| Method | Route                     | Description                              |
| ------ | ------------------------- | ---------------------------------------- |
| `POST` | `/api/webhooks/github`    | Handles PR webhook events (pull_request) |
| `POST` | `/api/webhooks/github-ci` | Handles CI failure events                |

### Real-time Status

| Method | Route                          | Description                          |
| ------ | ------------------------------ | ------------------------------------ |
| `GET`  | `/api/review-status/[pullId]`  | SSE: Polls PR review analysis status |
| `GET`  | `/api/ci-status/[ciFailureId]` | SSE: Polls CI diagnosis status       |

---

## ⚙️ Server Actions

All data mutations use Server Actions for type-safe client-server communication.

### Repository Actions (`actions/repos.ts`)

```typescript
// Get user's connected repositories (paginated)
getRepositories(page: number, limit?: number)

// Connect a new repository (sets up webhook)
connectRepository(repoId: string)

// Disconnect a repository (removes webhook)
disconnectRepository(repoId: string)

// Check if repository is connected
checkConnection(repoId: string): boolean
```

### Pull Request Actions (`actions/pulls.ts`)

```typescript
// Get PRs for a repository (paginated)
getPullRequests(repoId: string, page: number, limit?: number)

// Get PR with all suggestions
getPullRequestWithSuggestions(pullId: string)

// Update suggestion status (accept/reject)
updateSuggestionStatus(suggestionId: string, status: 'accepted' | 'rejected')

// Apply accepted suggestions to new branch and open PR
applyAcceptedSuggestions(pullId: string, suggestions: Suggestion[])

// Re-trigger AI review on a PR
retriggerPrReview(pullId: string)
```

### CI Actions (`actions/ci.ts`)

```typescript
// Get CI failures for a repository
getCiFailures(repoId: string)

// Get specific CI failure with diagnosis
getCiFailureById(ciFailureId: string)

// Re-trigger CI analysis
retriggerCiAnalysis(ciFailureId: string)

// Apply CI patch to new branch and open PR
applyCiPatch(ciFailureId: string)
```

---

## 📜 Available Scripts

| Command                     | Description                          |
| --------------------------- | ------------------------------------ |
| `npm run dev`               | Start Next.js dev server (port 3000) |
| `npm run build`             | Production build                     |
| `npm run start`             | Start production server              |
| `npm run lint`              | Run ESLint checks                    |
| `npx prisma generate`       | Generate Prisma client               |
| `npx prisma migrate dev`    | Create and apply new migration       |
| `npx prisma migrate deploy` | Apply migrations in production       |
| `npx prisma studio`         | Open Prisma database GUI             |
| `npx prisma db push`        | Push schema changes (dev only)       |

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Environment variables:**
Add all `.env` variables in Vercel dashboard under Project Settings > Environment Variables.

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build
RUN npx prisma generate
RUN npx prisma migrate deploy

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
docker build -t d2p .
docker run -p 3000:3000 --env-file .env.production d2p
```

### Environment for Production

Create `.env.production`:

```env
DATABASE_URL=postgresql://user:password@production-host/dbname?sslmode=require
BETTER_AUTH_SECRET=production-secret-key
BETTER_AUTH_URL=https://d2p.yourdomain.com
GITHUB_CLIENT_ID=production-github-client-id
GITHUB_CLIENT_SECRET=production-github-client-secret
WEBHOOK_BASE_URL=https://d2p.yourdomain.com
GCP_PROJECT_ID=production-gcp-project
GCP_REGION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/app/gcp-service-account.json
```

---

## 📚 Key Implementation Details

### Security

- **Webhook Verification**: HMAC-SHA256 signature validation on all incoming webhooks
- **Rate Limiting**: GitHub API calls are rate-limited (use exponential backoff)
- **Token Storage**: GitHub access tokens stored encrypted in database (via Better Auth)
- **CORS**: API routes implement proper CORS for cross-origin requests

### Performance Optimizations

- **Diff Capping**: PR diffs capped at 500KB to prevent token explosion
- **AI Prompt Limiting**: Diff content capped at 100KB before sending to Gemini
- **CI Log Parsing**: Logs fetched as ZIP, extracted, and capped at 80KB total
- **Database Pagination**: Repositories (12 per page), PRs (10 per page)
- **Prisma Client Singleton**: Single client instance for all server-side operations

### Special Handling

- **Self-review Prevention**: PR branches prefixed with `d2p/` are ignored (prevent loops)
- **Suggestion Reset**: Suggestions reset when PR is updated unless already accepted
- **Concurrent Reviews**: Multiple suggestions can be accepted and applied in parallel
- **Retrigger Throttling**: Prevents spam by tracking last review timestamp

---

## 🐛 Troubleshooting

### Common Issues

**"Unknown argument: regenerate client" when running migrations**

- Regenerate Prisma client: `npx prisma generate`
- Restart Next.js dev server
- Clear `.next` cache: `rm -rf .next`

**Database connection timeout**

- Check `DATABASE_URL` syntax and connectivity
- Ensure PostgreSQL is running
- Try increasing timeout in connection string: `?statement_cache_size=0`

**GitHub OAuth fails**

- Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correct
- Ensure authorization callback URL matches: `http://localhost:3000/api/auth/callback/github`
- Check that GitHub OAuth app has `repo` scope enabled

**Webhook not triggering**

- Verify `WEBHOOK_BASE_URL` is correct (use ngrok for local dev)
- Check webhook logs in GitHub repository settings
- Ensure webhook signature secret matches `WEBHOOK_SECRET` in database

**AI suggestions not generating**

- Verify GCP credentials file exists and is valid
- Check that Vertex AI API is enabled in Google Cloud Console
- Ensure service account has **Vertex AI User** role
- Check GCP project quota limits

**SSE connection drops**

- Increase client timeout settings
- Check server logs for errors
- Verify reverse proxy (if using) supports SSE

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source. See the repository for license details.

---

<div align="center">
  <sub>Built with ❤️ using Next.js, Gemini AI, and the GitHub API</sub>
</div>
