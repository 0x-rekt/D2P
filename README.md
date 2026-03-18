<div align="center">

# D2P — Diff to Perfection

**AI-powered code review for GitHub pull requests**

Ship cleaner code faster. D2P acts as an automated senior engineer — auditing your PRs for logic flaws, security risks, and performance issues before they hit production.

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
- **🔒 Secure Webhooks** — All incoming webhook payloads are verified with HMAC-SHA256 signatures.
- **🌙 Dark Mode UI** — A sleek, modern dashboard built with Tailwind CSS and shadcn/ui.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Server Actions) |
| **Language** | TypeScript |
| **AI** | Google Gemini 2.5 Flash via Vertex AI |
| **Auth** | Better Auth with GitHub OAuth (repo scope) |
| **Database** | PostgreSQL (Neon) via Prisma ORM |
| **Styling** | Tailwind CSS 4 + shadcn/ui + Radix UI |
| **Icons** | Lucide React |
| **GitHub API** | Axios (REST v3) |

---

## 📁 Project Structure

```
d2p/
├── app/
│   ├── api/
│   │   ├── auth/[...all]/     # Better Auth catch-all route
│   │   └── webhooks/github/   # GitHub webhook handler
│   ├── dashboard/
│   │   ├── page.tsx           # Repository listing with pagination
│   │   └── repos/[repoId]/   # PR list & suggestion detail views
│   ├── layout.tsx
│   └── page.tsx               # Landing page (Hero, HowItWorks, Features, CTA)
├── actions/
│   ├── repos.ts               # Server actions: connect/disconnect/list repos
│   └── pulls.ts               # Server actions: PR list, suggestion CRUD, apply
├── components/
│   ├── ConnectButton.tsx       # Repo connect/disconnect toggle
│   ├── Hero.tsx                # Landing hero section with code diff preview
│   ├── SuggestionPanel.tsx     # Accept/reject suggestions + apply to PR
│   ├── RepoCard.tsx            # Repository card with connection status
│   ├── RetriggerBtn.tsx        # Re-trigger AI review button
│   └── ui/                    # shadcn/ui primitives (Button, Badge, etc.)
├── lib/
│   ├── ai-review.ts           # Gemini AI diff analysis pipeline
│   ├── auth.ts                # Better Auth config (GitHub OAuth)
│   ├── auth-client.ts         # Client-side auth hooks
│   ├── gh-apply.ts            # Create branch, apply patches, open PR via GitHub API
│   ├── prisma.ts              # Prisma client singleton
│   └── utils.ts               # Utility helpers
├── prisma/
│   ├── schema.prisma          # Data model (User, Repository, PullRequest, Suggestion)
│   └── migrations/            # Database migrations
└── generated/prisma/          # Generated Prisma client (gitignored)
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

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Better Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Webhook (use ngrok for local dev)
WEBHOOK_BASE_URL=https://your-domain.ngrok-free.app

# Google Cloud / Vertex AI
GCP_PROJECT_ID=your-gcp-project
GCP_REGION=global
GOOGLE_APPLICATION_CREDENTIALS=./gcp-service-account.json
```

> [!TIP]
> For local development, use [ngrok](https://ngrok.com/) to expose your localhost for GitHub webhooks:
> ```bash
> ngrok http 3000
> ```

### 3. Set Up the Database

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Add GCP Credentials

Place your Google service account JSON key at the project root as `gcp-service-account.json`.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see D2P.

---

## 🔄 How It Works

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

1. **Connect** — Sign in with GitHub, browse your repos, and connect the ones you want D2P to review.
2. **Webhook** — D2P registers a `pull_request` webhook on the repo. When a PR is opened or updated, the webhook fires.
3. **Analyze** — The diff is fetched via the GitHub API and sent to Gemini 2.5 Flash for review.
4. **Review** — Up to 10 suggestions are generated, categorized by type and severity, and persisted in the database.
5. **Triage** — You accept or reject each suggestion from the dashboard.
6. **Apply** — Click "Apply & Create PR" to automatically push accepted fixes to a new branch and open a PR on GitHub.

---

## 📊 Data Model

| Model | Purpose |
|---|---|
| `User` | Authenticated users (via Better Auth) |
| `Account` | GitHub OAuth credentials and tokens |
| `Repository` | Connected GitHub repos with webhook config |
| `PullRequest` | Tracked PRs with review status (`pending` → `reviewing` → `reviewed` / `failed`) |
| `Suggestion` | AI-generated code suggestions with status (`pending` / `accepted` / `rejected`) |

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma migrate dev` | Create and apply migrations |

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
