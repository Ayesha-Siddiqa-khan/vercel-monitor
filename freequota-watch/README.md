# LimitLens

Multi-user Vercel Hobby usage monitoring dashboard with proactive Gmail alerts.

## Quick Start

### 1. Prerequisites

- Node.js 20+
- PostgreSQL (or Supabase)
- Vercel access token
- Gmail with App Password

### 2. Install

```bash
cd limitlens
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
DATABASE_URL=postgresql://user:pass@host:5432/limitlens
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
ALERT_TO_EMAIL=your-email@gmail.com
MONITOR_API_SECRET=$(openssl rand -hex 32)
```

### 4. Database Setup

```bash
npm run db:push    # Push schema to database
npm run db:seed    # Seed Hobby plan limits
```

### 5. Run

```bash
npm run dev         # Start dashboard at http://localhost:3000
npm run monitor:usage  # Run usage collector manually
```

## Architecture

```
src/
  app/           # Next.js App Router pages & API routes
  db/            # Drizzle ORM schema, queries, seed data
  lib/           # Encryption, limits config, utilities
  services/      # Vercel collector, email sender, alert engine
scripts/         # Monitor runner, DB seed script
__tests__/       # Unit tests
.github/         # GitHub Actions workflow
```

### Key Files

| File | Purpose |
|------|---------|
| `src/db/schema.ts` | Database tables (users, connections, snapshots, alerts) |
| `src/lib/limits.ts` | Hobby plan limits (configurable, not hardcoded) |
| `src/lib/encryption.ts` | AES-256-GCM token encryption |
| `src/services/vercel-collector.ts` | Fetches usage from Vercel API |
| `src/services/email-sender.ts` | Gmail SMTP adapter |
| `src/services/alert-engine.ts` | Threshold checking + deduplication |
| `scripts/run-monitor.ts` | Main monitor runner |
| `.github/workflows/usage-monitor.yml` | GitHub Actions schedule |

## Hobby Plan Limits (Verified June 2026)

| Resource | Limit |
|----------|-------|
| Active CPU | 4 CPU-hrs/month |
| Provisioned Memory | 360 GB-hrs/month |
| Edge Requests | 1,000,000/month |
| Function Invocations | 1,000,000/month |
| Fast Data Transfer | 100 GB/month |
| ISR Reads | 1,000,000/month |
| ISR Writes | 200,000/month |
| Build Execution | 6,000 minutes/month |
| Projects | 200 |

## Alert Thresholds

| Level | Default | Email |
|-------|---------|-------|
| Safe | 0-49% | No |
| Watch | 50-74% | No |
| Warning | 75-84% | Yes |
| Danger | 85-94% | Yes |
| Critical | 95%+ | Yes |

Alert deduplication: same-level alerts are suppressed during the cooldown period (default 6 hours).

## GitHub Actions Setup

### Required Secrets

| Secret | Description |
|--------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `ENCRYPTION_KEY` | 64-char hex key for token encryption |
| `GMAIL_USER` | Gmail address for sending alerts |
| `GMAIL_APP_PASSWORD` | Gmail App Password |
| `ALERT_TO_EMAIL` | Recipient email for alerts |
| `MONITOR_API_SECRET` | Secret for API endpoint auth |

### Manual Run

Go to Actions > Vercel Usage Monitor > Run workflow

### Schedule

Runs every 6 hours via cron: `0 */6 * * *`

## Testing

```bash
npm test           # Run all 25 unit tests
npm run test:watch # Watch mode
```

Tests cover:
- Percentage calculation
- Status level detection (20%, 76%, 86%, 96%)
- Alert deduplication / cooldown logic
- Email template generation
- Hobby limits configuration
- Encryption round-trip

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/monitor` | Bearer token | Trigger monitor run |
| POST | `/api/vercel/connect` | - | Connect Vercel account |
| GET | `/api/usage?userId=` | - | Get latest usage |
| GET | `/api/usage/history?userId=` | - | Get usage history |
| GET/PUT | `/api/alerts?userId=` | - | Get/update alert rules |

## Security

- Vercel tokens encrypted at rest with AES-256-GCM
- Tokens never exposed in logs, UI, or API responses
- GitHub Actions uses secrets for all credentials
- Monitor API endpoint requires Bearer token auth
- Row-level data isolation per user

## Multi-User Design

The database is designed for multi-user use from the start:
- `users` table with role support
- `vercel_connections` linked to users
- Per-user `alert_rules` and `notification_channels`
- All queries filter by `userId`
- Admin panel ready (future phase)
