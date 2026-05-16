# D2P (Deploy to Production) - Intelligent Code Review & Security Platform

## 🎯 Project Overview

**D2P** is an AI-powered code review and security analysis platform that integrates with GitHub to provide comprehensive security scanning, vulnerability detection, and code quality improvements for Pull Requests and CI/CD pipelines. It combines multiple security scanning techniques with AI-powered analysis to help development teams identify and fix issues before they reach production.

### Core Mission

Automatically scan GitHub repositories for security vulnerabilities, code quality issues, and CI/CD failures, providing actionable suggestions directly in pull requests with AI-powered diagnostics and automated fixes.

---

## ✨ Key Features

### 🔐 Security Scanning

#### 1. **Secrets Detection**

- Detects hardcoded secrets including:
  - AWS Access Keys & Secret Keys
  - GitHub Personal Access Tokens
  - Private Keys (RSA, SSH)
  - Docker Registry Credentials
  - NPM/Slack/API Tokens
  - Database Connection Strings
  - Hardcoded Passwords
- Scans both code changes and comments
- Entropy-based detection for random-looking secrets
- Test value filtering to avoid false positives

#### 2. **CVE & Dependency Vulnerability Scanning**

- Queries OSV (Open Source Vulnerabilities) Database
- Scans `package.json` dependencies for known vulnerabilities
- Identifies affected versions and available fixes
- CVSS scoring for severity assessment
- Provides fixed version recommendations
- Comprehensive security scoring for repositories

#### 3. **OWASP Top 10 Analysis**

- Detects code patterns matching OWASP vulnerabilities:
  - SQL Injection risks
  - Hardcoded role checks
  - Weak cryptographic hashes
  - Insecure deserialization
  - Missing authentication/authorization
  - Cross-site scripting (XSS) patterns
  - Insecure direct object references
- AI-powered verification of findings
- Correlation between OWASP patterns and CVEs

#### 4. **Real-time Security Status**

- GitHub commit status updates
- PR review comments with detailed findings
- Configurable merge blocking for critical findings
- Severity-based labeling and sorting

### 🤖 AI-Powered Analysis

#### Code Review

- AI analysis of pull request changes
- Suggestion generation for code improvements
- Context-aware recommendations
- Integration with Google Generative AI (Gemini)

#### CI/CD Failure Diagnosis

- Automatic analysis of CI/CD workflow failures
- AI-powered root cause identification
- Suggested patches for common failures
- Fix suggestion generation with automated PR creation

### 📊 Dashboard & Monitoring

#### Repository Dashboard

- Connected repositories overview
- Security score tracking
- PR review history
- CI failure analysis
- Security finding trends

#### Pull Request Tracking

- All PR reviews and suggestions
- Severity-based filtering
- Application status tracking
- Applied PR links

### 🚀 Automated Fixes

#### Suggestion Application

- One-click suggestion application to new branches
- Automated PR creation for fixes
- Intelligent fix branching from correct HEAD commits
- Support for new code in PR HEAD branch

#### Dependency Updates

- Automatic package.json updates for vulnerable packages
- Suggested version upgrades
- Maintains dev/production dependency structure

---

## ✅ Implementation Status

**Core Features (Production Ready):**

- ✅ Secrets Detection - Pattern & entropy-based
- ✅ CVE Scanning - OSV API integration
- ✅ OWASP Pattern Detection - 8+ vulnerability patterns
- ✅ Security Scoring - Comprehensive scoring system
- ✅ GitHub Integration - Webhooks & PR comments
- ✅ AI Code Review - Gemini integration
- ✅ CI Failure Diagnosis - Workflow log analysis
- ✅ Suggestion Application - Auto PR creation
- ✅ Dashboard - Repository & findings overview
- ✅ Authentication - Better Auth with GitHub OAuth

**Optional Enhancements:**

- 🔄 Custom security rules
- 🔄 Integrations with Slack/Teams
- 🔄 Custom webhook handlers
- 🔄 Advanced filtering & search

---

## 🏗️ Architecture

### Technology Stack

**Frontend & Framework:**

- Next.js 16.1.6 (with Turbopack)
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4
- Radix UI components
- Framer Motion (animations & transitions)

**Backend & Database:**

- Next.js API Routes (Server Actions)
- Prisma ORM 7.8.0
- PostgreSQL
- Better Auth (Authentication)

**AI & Analysis:**

- Google Generative AI SDK
- OSV Database API (CVE querying)
- Custom security scanners

**DevOps & Build:**

- Turbopack (Next.js build system)
- ESLint (Code linting)
- PostCSS with Tailwind

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Integration                       │
│  (Webhooks for PR events, Push events, and CI runs)        │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│              Next.js Application Layer                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ API Webhooks (/api/webhooks/github)                │   │
│  │ - PR opened/synchronize events                     │   │
│  │ - CI workflow run completion                       │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────────────┐
│            Security & Analysis Engine                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Secrets    │  │    CVE       │  │   OWASP      │       │
│  │   Scanner    │  │   Detector   │  │   Pattern    │       │
│  │              │  │   (OSV API)  │  │   Matcher    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                  │                │                │
│  ┌──────────────────────────────────────────────────┐        │
│  │   AI Verification & Enhancement                 │        │
│  │   (Google Generative AI - Gemini)               │        │
│  └──────────────────────────────────────────────────┘        │
└────────────────┬─────────────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────────────┐
│              GitHub Interaction Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Commit     │  │   PR Review  │  │   Create     │       │
│  │   Status     │  │   Comments   │  │   Issues     │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└────────────────┬─────────────────────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────────────────────┐
│           Data Storage & Dashboard                           │
│  ┌──────────────────────────────────────────────────┐        │
│  │ PostgreSQL Database (Prisma ORM)                │        │
│  │ - Repositories, PRs, Security Findings          │        │
│  │ - CI Failures, Suggestions, Users               │        │
│  └──────────────────────────────────────────────────┘        │
│                      │                                       │
│  ┌──────────────────▼──────────────────────────┐            │
│  │ Web Dashboard                               │            │
│  │ - Repo overview, Security scores            │            │
│  │ - PR tracking, Finding details              │            │
│  │ - CI failure analysis                       │            │
│  └───────────────────────────────────────────── │            │
└────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
D2P/
├── app/                           # Next.js App Router
│   ├── api/                       # API endpoints
│   │   ├── auth/                  # Authentication routes (Better Auth)
│   │   ├── webhooks/              # GitHub webhook handlers
│   │   │   ├── github/            # Main webhook handler
│   │   │   └── github-ci/         # CI workflow events
│   │   ├── security/              # Security findings API
│   │   ├── ci-status/             # CI failure status
│   │   ├── review-status/         # PR review status
│   │   └── security-status/       # Repository security status
│   ├── dashboard/                 # Protected dashboard pages
│   │   └── repos/                 # Repository management
│   ├── page.tsx                   # Landing page
│   └── layout.tsx                 # Root layout
│
├── components/                    # React components
│   ├── Dashboard/                 # Dashboard components
│   │   ├── CiDiagnosisPanel.tsx   # CI failure diagnosis
│   │   ├── CiFailureCard.tsx      # CI failure display
│   │   └── CiStatusWatcher.tsx    # Real-time CI status
│   ├── Security/                  # Security components
│   │   ├── SecurityFindingCard.tsx
│   │   ├── SecurityFindingsPanel.tsx
│   │   └── SecurityStatusWatcher.tsx
│   ├── Review/                    # Code review components
│   │   ├── ReviewStatusWatcher.tsx
│   │   ├── SuggestionPanel.tsx
│   │   └── RetriggerBtn.tsx
│   ├── Auth/                      # Authentication components
│   │   ├── ConnectButton.tsx
│   │   ├── SignInBtn.tsx
│   │   └── ConnectButton.tsx
│   └── UI/                        # shadcn/ui components
│
├── lib/                           # Utility functions & engines
│   ├── Security Scanners
│   │   ├── secrets-scanner.ts     # Detects hardcoded secrets
│   │   ├── security-scanner.ts    # Orchestrates all security scans
│   │   ├── owasp-scanner.ts       # OWASP pattern detection
│   │   └── cve-query.ts           # CVE lookup from OSV DB
│   │
│   ├── AI Analysis
│   │   ├── ai-review.ts           # PR code review analysis
│   │   ├── ai-ci-review.ts        # CI failure diagnosis
│   │   └── ai-security-review.ts  # OWASP verification & correlation
│   │
│   ├── GitHub Integration
│   │   ├── github-security.ts     # GitHub API interactions
│   │   └── gh-apply.ts            # Fix application & PR creation
│   │
│   ├── Authentication & Utils
│   │   ├── auth.ts                # Better Auth configuration
│   │   ├── auth-helpers.ts        # Token management
│   │   ├── auth-client.ts         # Client-side auth
│   │   ├── prisma.ts              # Database client
│   │   └── utils.ts               # Helper functions
│
├── actions/                       # Server Actions
│   ├── security.ts                # Security findings queries
│   ├── ci.ts                      # CI failure queries
│   ├── pulls.ts                   # PR & suggestion queries
│   └── repos.ts                   # Repository queries
│
├── prisma/                        # Database schema & migrations
│   ├── schema.prisma              # Data models
│   └── migrations/                # Migration history
│
├── public/                        # Static assets
│
└── Configuration Files
    ├── next.config.ts             # Next.js configuration
    ├── tsconfig.json              # TypeScript configuration
    ├── tailwind.config.ts         # Tailwind CSS config
    ├── postcss.config.mjs          # PostCSS config
    ├── eslint.config.mjs           # ESLint rules
    └── package.json               # Dependencies
```

---

## 📡 API Endpoints

### Webhooks

- **`POST /api/webhooks/github`** - Main GitHub webhook for PR events (opened, synchronize, closed)
- **`POST /api/webhooks/github-ci`** - GitHub Actions workflow completion events

### Authentication

- **`POST /api/auth/signin`** - Sign in with GitHub
- **`POST /api/auth/signout`** - Sign out current user
- **`GET /api/auth/session`** - Get current session info

### Security Analysis

- **`GET /api/security/[...params]`** - Query security findings for a repository
- **`GET /api/security-status/[repoId]`** - Get repository security score and status

### CI/CD

- **`GET /api/ci-status/[ciFailureId]`** - Get CI failure diagnosis and suggested fixes

### Pull Requests

- **`GET /api/review-status/[pullId]`** - Get PR review status and suggestions

---

## 🔄 Core Workflows

### 1. **Repository Connection Flow**

```
User connects GitHub repo
    ↓
App creates GitHub Webhook
    ↓
Webhook registered on PR events:
  - opened
  - synchronize (new commits)
    ↓
Repo stored in database with webhook credentials
```

### 2. **Pull Request Security Scanning**

```
PR opened/updated on GitHub
    ↓
Webhook received at /api/webhooks/github
    ↓
Signature verification (HMAC-SHA256)
    ↓
Security scan initiated:
    ├─ Download PR diff
    ├─ Extract changed files
    ├─ Scan for secrets
    ├─ Scan for CVEs (package.json)
    ├─ Scan for OWASP patterns
    └─ AI verification of findings
    ↓
Results stored in database
    ↓
GitHub interactions:
    ├─ Commit status updated
    ├─ PR comment with findings
    ├─ Request changes if critical
    └─ Add severity labels
    ↓
User views on dashboard
```

### 3. **AI Code Review**

```
PR changes received
    ↓
Extract code diff
    ↓
Send to Google Generative AI with context:
    ├─ Code changes
    ├─ File paths
    ├─ Diff context
    └─ Repository language info
    ↓
AI generates suggestions:
    ├─ Code improvements
    ├─ Security recommendations
    ├─ Performance optimizations
    └─ Best practice suggestions
    ↓
Store suggestions in database
    ↓
Display on PR & dashboard
```

### 4. **CI Failure Diagnosis**

```
GitHub Workflow fails
    ↓
Webhook triggered at /api/webhooks/github-ci
    ↓
Fetch workflow run logs
    ↓
Send to AI for analysis:
    ├─ Error messages
    ├─ Log content
    ├─ Workflow name
    └─ Repository context
    ↓
AI generates:
    ├─ Root cause analysis
    ├─ Suggested fix
    ├─ Patch content
    └─ Explanation
    ↓
Store diagnosis in database
    ↓
Optionally create fix PR:
    ├─ Create fix branch
    ├─ Apply patch
    ├─ Create PR to original branch
    └─ Link to dashboard
```

### 5. **Suggestion Application**

```
User clicks "Apply Suggestion"
    ↓
Create new branch from PR HEAD:
    ├─ Fetch PR HEAD commit
    ├─ Create fix branch
    └─ Apply suggestion code
    ↓
Commit changes with message
    ↓
Push to GitHub
    ↓
Create Pull Request:
    ├─ Title with suggestion context
    ├─ Link to original PR
    ├─ Suggestion details in body
    └─ Auto-request review
    ↓
Store PR URL in database
    ↓
Update dashboard
```

---

## 🔐 Security Features in Detail

### Secrets Detection Algorithm

1. **Pattern-based Detection**
   - Regular expressions for known secret formats
   - Multiple patterns for each secret type:
     - AWS credentials (AKIA... prefixed keys)
     - GitHub tokens (ghp_... or github_pat_...)
     - Private keys (RSA, SSH, PGP)
     - Docker registry credentials
     - API tokens (Slack, NPM, SendGrid, etc.)
   - Test value filtering (to ignore mock credentials)

2. **Entropy-based Detection**
   - Analyzes randomness in extracted strings
   - Shannon entropy calculation
   - Configurable entropy threshold (default: 4.0)
   - Filters common non-secret patterns

3. **Context Filtering**
   - Skips test directories (`node_modules`, `dist`, `build`, `test`)
   - Ignores documentation files (`.md`, `.txt`)
   - Skips lock files and config files
   - Filters mock/test data and example values
   - Excludes commented-out code

### CVE Scanning

1. **Dependency Extraction**
   - Parses `package.json` dependencies
   - Combines `dependencies` and `devDependencies`
   - Handles multiple versions

2. **OSV Database Query**
   - Batch queries to OSV API (max 1000 at once)
   - Timeout: 60 seconds for batch operations
   - Caches results for performance
   - Graceful degradation on API failures

3. **Severity Mapping**
   - CRITICAL → Block merge
   - HIGH → Request review
   - MEDIUM → Comment warning
   - LOW → Informational

### OWASP Pattern Detection

Detects 8+ OWASP Top 10 patterns including:

- **SQL Injection**: String concatenation in queries
- **Weak Cryptography**: MD5, SHA1 usage
- **Hardcoded Access Control**: Hardcoded role checks
- **Insecure Deserialization**: Unsafe parsing
- **Missing Auth**: Unprotected endpoints
- **XSS**: Unsafe HTML injection
- **IDOR**: Missing authorization checks
- **Security Misconfiguration**: Exposed debug info

---

## ⚡ Quick Start

Get D2P running in 5 minutes:

```bash
# 1. Clone and install
git clone https://github.com/0x-rekt/D2P.git
cd D2P
npm install

# 2. Setup database
createdb d2p
npx prisma migrate dev

# 3. Create .env.local with required variables (see Setup section below)

# 4. Start development server
npm run dev

# 5. Visit http://localhost:3000
```

---

## 🚀 Setup & Deployment

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- GitHub App or OAuth credentials
- Google Cloud Generative AI API key (optional, for AI features)

### Local Development Setup

1. **Clone Repository**

   ```bash
   git clone https://github.com/your-org/d2p.git
   cd d2p
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env.local`:

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/d2p"

   # GitHub OAuth/App
   # Get from https://github.com/settings/developers
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_WEBHOOK_SECRET=your_webhook_secret

   # Better Auth - Must be at least 32 characters
   BETTER_AUTH_SECRET=your_secret_min_32_chars_for_auth_encryption
   BETTER_AUTH_URL=http://localhost:3000

   # Google Generative AI (Gemini) - Get from https://ai.google.dev/
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key

   # Optional: AI Review features
   ENABLE_AI_REVIEW=true
   ```

   **Environment Variable Details:**

   - `DATABASE_URL`: PostgreSQL connection string. Local format: `postgresql://postgres:password@localhost:5432/d2p`
   - `GITHUB_WEBHOOK_SECRET`: Used to verify webhook signatures from GitHub (HMAC-SHA256)
   - `BETTER_AUTH_SECRET`: Encryption key for sessions (generate with `openssl rand -base64 32`)
   - `GOOGLE_GENERATIVE_AI_API_KEY`: For AI-powered code review and CI failure diagnosis

4. **Database Setup**

   ```bash
   # Create database
   createdb d2p

   # Run migrations
   npx prisma migrate dev

   # Generate Prisma Client
   npx prisma generate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`

### GitHub Integration Setup

#### Option 1: OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret

#### Option 2: GitHub App (Recommended for Webhooks)

1. Create GitHub App at Settings → Developer settings → GitHub Apps
2. Set Webhook URL to `your-domain.com/api/webhooks/github`
3. Subscribe to events:
   - Pull Request (opened, synchronize, closed)
   - Push
   - Workflow run
4. Configure permissions:
   - Pull requests: Read & write (for PR comments and status)
   - Contents: Read (for accessing file content in PRs)
   - Commit statuses: Read & write (for commit status checks)
   - Issues: Read & write (for creating issues)
   - Workflows: Read (for accessing workflow logs)
5. Under "Where can this GitHub App be installed?", select "Only on this account" for development
6. Generate a private key and store it securely
7. Install the app on your repositories

**Webhook Security:**

- Generate a strong webhook secret (min 128 bits): `openssl rand -hex 32`
- Set this as `GITHUB_WEBHOOK_SECRET` in your environment
- D2P verifies all webhook signatures using HMAC-SHA256 (timing-safe comparison)

### Production Deployment

#### Vercel (Recommended)

```bash
vercel link
vercel env add DATABASE_URL
vercel env add GITHUB_CLIENT_SECRET
vercel env add BETTER_AUTH_SECRET
# ... add other env vars

vercel deploy --prod
```

#### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

#### Database Migration in Production

```bash
# Run migrations
npx prisma migrate deploy

# Or: Reset and migrate (⚠️ Data loss!)
npx prisma migrate reset
```

---

## 📊 Data Models

### Database Schema Overview

```
User (1) ──────┐
    │          │
    ├─ (M) Session
    ├─ (M) Account
    └─ (M) Repository ──┐
                        │
                   (M) PullRequest ──┐
                        │            │
                        ├─ (M) Suggestion
                        └─ (M) SecurityFinding
    
    Repository ──┐
                 ├─ (1) RepositorySecurityScore
                 └─ (M) CiFailure
```

### User

- **id**: Unique identifier
- **email**: User email (unique)
- **name**: Display name
- **emailVerified**: Email verification status
- **image**: Profile picture URL
- **Relations**: Sessions, Accounts, Repositories

### Repository

- **id**: UUID
- **repoGithubId**: GitHub repository ID (unique)
- **fullName**: Repository full name (e.g., "owner/repo")
- **name**: Repository name
- **webhookSecret**: HMAC secret for webhook signature verification
- **private**: Whether repository is private
- **userId**: Owner user ID
- **Relations**: User, PullRequests, SecurityFindings, CiFailures, RepositorySecurityScore

### PullRequest

- **id**: UUID
- **prNumber**: GitHub PR number
- **prGithubId**: GitHub PR ID (unique)
- **title**: PR title
- **body**: PR description
- **state**: Current state (open/closed)
- **headSha**: Latest commit SHA
- **baseBranch**: Target branch
- **headBranch**: Source branch
- **authorLogin**: GitHub username of author
- **reviewStatus**: Review status (pending/analyzed/applied)
- **appliedPrUrl**: Link to fix PR if suggestion was applied
- **Relations**: Repository, Suggestions, SecurityFindings

### SecurityFinding

- **id**: UUID
- **findingType**: Type (secret, CVE, OWASP, dependency)
- **severity**: Level (critical, high, medium, low)
- **message**: Human-readable finding description
- **cvssScore**: CVE CVSS score (if applicable)
- **cveId**: CVE identifier (if applicable)
- **packageName**: Affected package (for CVE findings)
- **Relations**: Repository, PullRequest

### CiFailure

- **id**: UUID
- **workflowName**: GitHub Actions workflow name
- **runId**: GitHub workflow run ID
- **failureReason**: Error summary
- **logs**: Full workflow logs
- **diagnosis**: AI-generated root cause analysis
- **suggestedFix**: Proposed patch or fix
- **fixPrUrl**: Link to auto-created fix PR (if applicable)
- **Relations**: Repository

### Suggestion

- **id**: UUID
- **type**: Suggestion type (code-improvement, security, performance, etc.)
- **severity**: Importance level
- **filePath**: File path in repository
- **startLine**: Start line number
- **endLine**: End line number
- **originalCode**: Original code snippet
- **suggestedCode**: Suggested replacement
- **status**: Status (pending, applied, dismissed)
- **Relations**: PullRequest

### RepositorySecurityScore

- **id**: UUID
- **overallScore**: Comprehensive security score (0-100)
- **secretsScore**: Secrets detection score
- **cvesScore**: CVE/dependency score
- **owaspScore**: OWASP pattern score
- **lastUpdated**: Last scan timestamp
- **Relations**: Repository

---

## 📜 Available npm Scripts

```bash
npm run dev         # Start development server with hot reload (http://localhost:3000)
npm run build       # Build for production with Turbopack
npm start           # Start production server
npm run lint        # Run ESLint to check code quality
```

---

## 🛠️ Development Guide

### Adding New Security Scanner

```typescript
// lib/new-scanner.ts
export type NewFinding = {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  message: string;
};

export const scanForNewVulnerability = (
  content: string,
  filePath?: string,
): NewFinding[] => {
  // Implementation
};
```

### Adding New AI Analysis

1. Create new analysis file in `lib/ai-*.ts`
2. Use Google Generative AI SDK
3. Integrate in webhook handler
4. Store results in database

### Testing Webhooks Locally

1. **Setup ngrok tunnel**

   ```bash
   # Install ngrok: https://ngrok.com/download
   ngrok http 3000
   # This will give you a URL like https://xxxx-xx-xxx-xx-xx.ngrok.io
   ```

2. **Update GitHub webhook**

   - Go to Repository Settings → Webhooks
   - Update Payload URL to your ngrok URL: `https://xxxx-xx-xxx-xx-xx.ngrok.io/api/webhooks/github`
   - Keep webhook secret the same

3. **Test with actual GitHub events**

   - Create a PR in your test repository
   - Check logs: `npm run dev` output should show webhook events
   - Verify database entries created with: `psql d2p`

4. **Manual webhook testing**

   ```bash
   # Generate valid signature
   SECRET="your_webhook_secret"
   PAYLOAD='{"action":"opened","pull_request":{"number":1,"id":123456},"repository":{"id":987654}}'
   
   SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -hex | cut -d' ' -f2)
   SIGNATURE="sha256=$SIGNATURE"
   
   # Send test request
   curl -X POST http://localhost:3000/api/webhooks/github \
     -H "X-GitHub-Event: pull_request" \
     -H "X-Hub-Signature-256: $SIGNATURE" \
     -H "Content-Type: application/json" \
     -d "$PAYLOAD"
   ```

---

## 🐛 Troubleshooting

### Common Issues

**Build Error: "Unterminated regexp literal"**

- Check regex patterns in scanner files
- Ensure all backslashes are properly escaped
- Run `npm run build` to validate

**Prisma Client Not Found**

- Run `npx prisma generate`
- Clear `.next` cache: `rm -rf .next`

**Webhook Signature Validation Fails**

- Verify webhook secret matches in GitHub settings
- Check signature calculation in `verifySignature()`

**CVE API Timeout**

- Batch size may be too large
- Reduce dependency count or increase timeout
- Check OSV API status

**AI Review Not Working**

- Verify `GOOGLE_GENERATIVE_AI_API_KEY` is set in `.env.local`
- Check Google Generative AI API is enabled in Google Cloud Console
- Ensure billing is configured for your Google Cloud project
- Verify API key has proper permissions
- Test with: `curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent -H "x-goog-api-key: YOUR_KEY"`

**Database Connection Errors**

- Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- Verify DATABASE_URL is correct
- Check database exists: `psql postgres -c "\\l"`
- Try recreating database: `dropdb d2p && createdb d2p && npx prisma migrate dev`

**Port 3000 Already in Use**

```bash
# Kill process using port 3000
npx lsof -i :3000  # Find process ID
kill -9 <PID>      # Kill the process
# Or use a different port
npm run dev -- -p 3001
```

**Next.js Compilation Errors**

- Clear all caches: `rm -rf .next node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`
- Verify all imports are correct (check file paths)

---

## 📈 Performance Optimization

### Database Queries

- Indexed on frequently queried fields
- Pagination for large result sets
- Connection pooling via Prisma

### API Calls

- Batch CVE queries (1000 per request)
- Webhook signature verification (timing-safe)
- Rate limiting on AI API calls

### Frontend

- Code splitting with Next.js
- Image optimization
- CSS-in-JS with Tailwind
- Component lazy loading

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-scanner`
3. Make changes with tests
4. Submit pull request with description

### Code Standards

- TypeScript strict mode
- ESLint configuration
- Tailwind CSS for styling
- Prisma for database queries

## 📞 Support

For issues, questions, or suggestions:

- GitHub Issues: https://github.com/0x-rekt/D2P/issues
- Email: kolaysowdarjya@gmail.com

---

**Built with ❤️ for secure development**
