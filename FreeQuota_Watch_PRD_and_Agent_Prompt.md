# PRD: LimitLens — Multi-User Vercel Hobby Resource Monitoring Dashboard

**Owner:** Ayesha Siddiqa  
**Product Type:** SaaS / multi-user dashboard  
**Primary Goal:** Help Vercel Hobby users monitor free resource usage and receive proactive Gmail alerts before reaching limits.  
**Version:** v1.0 PRD  
**Date:** 2026-06-09  

> Note for the coding agent: In the user's rough wording, “WhatsApp Hobby plan” should be treated as a speech/transcription mistake. The actual product is for monitoring **Vercel Hobby plan** usage, based on the full conversation context.

---

## 1. Product Summary

Build a lightweight, reliable, multi-user resource monitoring dashboard for Vercel Hobby users. The app should show how much of the free usage has been consumed, how much remains, and whether the user is safe, near warning, or at risk. It should also send proactive Gmail alerts before usage reaches dangerous levels.

The first version should be useful for Ayesha’s own Vercel projects, but the architecture must be designed so other users can later sign up, connect their Vercel account, and monitor their own Vercel Hobby usage from the same platform.

---

## 2. Problem Statement

Vercel Hobby users often want to stay within free limits, but checking the dashboard manually is inconvenient. A user may not notice usage growth until they are already close to a limit. The app should reduce this risk by collecting usage data periodically, showing it clearly, and sending early alerts.

---

## 3. Goals

1. Show Vercel Hobby plan usage in a clean dashboard.
2. Track important resource categories such as Active CPU, Edge Requests, Function Invocations, Data Transfer / Fast Origin Transfer, ISR Reads, ISR Writes, Build Execution Minutes, and Project Count where available.
3. Calculate used percentage and remaining quota for each tracked resource.
4. Send Gmail alerts when a resource reaches configured thresholds.
5. Support scheduled checks through GitHub Actions so the background monitor does not consume unnecessary Vercel resources.
6. Store historical usage snapshots for trend analysis.
7. Prepare the app for multi-user/commercial use from the beginning.
8. Use free-tier or low-cost resources wherever possible.

---

## 4. Non-Goals for MVP

1. Do not scrape the Vercel dashboard visually.
2. Do not promise real-time second-by-second monitoring.
3. Do not auto-upgrade, auto-delete, or auto-change Vercel projects without explicit user approval.
4. Do not support WhatsApp monitoring. This product is for Vercel resource monitoring.
5. Do not build a complicated enterprise FinOps platform in MVP.
6. Do not send repeated spam alerts for the same threshold.

---

## 5. Target Users

### 5.1 Primary User
A solo developer using Vercel Hobby who wants to remain within free limits.

### 5.2 Future Users
Freelancers, students, indie hackers, and small teams who deploy projects on Vercel and want simple free-limit monitoring.

### 5.3 Admin User
The app owner/admin who can manage global limits, user accounts, connected integrations, alert templates, and system health.

---

## 6. Product Positioning

The product should feel like a “free-plan safety dashboard” for Vercel users. It should not be presented as a complex enterprise billing tool. The tone should be simple, helpful, and practical.

Suggested product names:
- FreeQuota Watch
- Vercel FreeGuard
- HobbyLimit Monitor
- QuotaPilot

Recommended MVP name: **FreeQuota Watch**

---

## 7. Key User Stories

1. As a user, I want to connect my Vercel account so the app can read my usage.
2. As a user, I want to see my used and remaining free resources in one dashboard.
3. As a user, I want to receive a Gmail alert before I reach a dangerous usage level.
4. As a user, I want to configure warning thresholds such as 60%, 75%, 85%, and 95%.
5. As a user, I want to see which resources are safe, warning, danger, or critical.
6. As a user, I want to view usage history so I can understand whether usage is increasing.
7. As an admin, I want a multi-user-ready structure so other users can sign up later.
8. As an admin, I want secure storage of tokens and notification settings.

---

## 8. Functional Requirements

### 8.1 Authentication
- Implement user authentication.
- Use Supabase Auth or NextAuth/Auth.js.
- MVP can start with email/password login.
- Future version should support Google login.

### 8.2 Vercel Connection
- Allow a user to connect their Vercel account.
- MVP approach: user enters a Vercel token manually.
- Store the token encrypted at rest.
- Never expose the token in logs, UI, browser responses, or error messages.
- Support optional Team ID for users who use Vercel teams.
- Validate token access before saving connection.

### 8.3 Usage Collection
The collector must retrieve usage data using official Vercel-supported approaches where possible:
- Vercel CLI usage command with JSON output.
- Vercel billing usage/cost API if available and suitable.
- Vercel projects API for project list and project count.

The collector should normalize raw usage into internal resource keys:
- `active_cpu_hours`
- `edge_requests`
- `function_invocations`
- `fast_origin_transfer`
- `data_transfer`
- `isr_reads`
- `isr_writes`
- `build_execution_minutes`
- `project_count`

The coding agent must inspect actual Vercel CLI/API output first before finalizing exact parsing logic.

### 8.4 Resource Limit Configuration
Create a `resource_limits` table or config file that stores free-plan limits. Do not hardcode values deep in business logic.

Each limit should include:
- Plan name: Hobby
- Metric key
- Metric display name
- Limit value
- Unit
- Source/reference note
- Last verified date

Important: The agent must verify current Vercel Hobby limits from official Vercel documentation before implementation.

### 8.5 Dashboard
The dashboard should show:
- Overall health status
- Resource cards
- Used amount
- Remaining amount
- Percentage used
- Progress bar
- Status: Safe, Watch, Warning, Danger, Critical
- Last checked time
- Next scheduled check time
- A short recommendation for risky resources

Status thresholds:
- Safe: 0–49%
- Watch: 50–74%
- Warning: 75–84%
- Danger: 85–94%
- Critical: 95%+

### 8.6 Project Overview
Show:
- Vercel projects connected to the user
- Production URL where available
- Project count versus plan limit
- Last deployment status where available
- Optional future usage contribution per project if Vercel data supports it

### 8.7 Alert Rules
Users should be able to configure:
- Warning threshold
- Danger threshold
- Critical threshold
- Daily summary enabled/disabled
- Email recipient
- Quiet hours
- Alert cooldown period

Default thresholds:
- 75% = Warning email
- 85% = Danger email
- 95% = Critical email

### 8.8 Gmail Notifications
MVP notification method:
- Gmail SMTP using `smtp.gmail.com`
- Use TLS/STARTTLS on port 587 or SSL on port 465
- Use Gmail App Password if using a personal Gmail account with 2-Step Verification
- Store Gmail credentials only in environment variables or encrypted secrets
- Do not store plain text Gmail passwords

Recommended commercial path:
- For multi-user SaaS, avoid relying on one personal Gmail account for all customer alerts.
- Later support either Google OAuth per user or a transactional email provider.
- Keep the notification adapter modular so Gmail can be replaced without rewriting the alert engine.

### 8.9 Alert Deduplication
The app must avoid repeated alert spam.

Rules:
- If a resource crosses 75%, send warning once.
- If it remains above 75%, do not repeat the same warning within the cooldown period.
- If it crosses 85%, send a new danger alert.
- If it crosses 95%, send a new critical alert.
- If usage drops below the threshold and later crosses again, allow a new alert.
- Store every sent alert in `alert_events`.

### 8.10 Historical Snapshots
Store every usage check as a snapshot:
- User ID
- Vercel connection ID
- Metric key
- Used value
- Limit value
- Percentage
- Unit
- Raw source payload reference
- Timestamp

Use this data for:
- Usage trend chart
- Daily summary
- Weekly report
- Future prediction

### 8.11 Multi-User / Commercial Readiness
The system must support:
- Multiple users
- Multiple Vercel connections per user in future
- Per-user alert configuration
- Per-user Gmail or notification channel settings
- Secure token separation
- Row-level security or strict server-side authorization
- Admin dashboard
- Audit logs

Do not build everything in MVP, but design the database and service layer so multi-user expansion is natural.

---

## 9. Technical Architecture

### 9.1 Recommended Stack

Frontend:
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts or Tremor for simple charts

Backend:
- Next.js Route Handlers or Server Actions
- Node.js monitoring scripts
- Service-layer architecture

Database:
- Supabase PostgreSQL
- Drizzle ORM or Prisma
- Supabase Auth if preferred

Scheduler:
- GitHub Actions scheduled workflow for periodic checks
- Manual workflow dispatch for testing

Email:
- Gmail SMTP for MVP
- Modular email adapter for future providers

Testing:
- Vitest for unit tests
- Playwright for end-to-end tests
- Mock Vercel usage payloads for alert tests

Deployment:
- Dashboard on Vercel Hobby
- Scheduled worker in GitHub Actions
- Database on Supabase free tier for MVP

---

## 10. Why GitHub Actions for Scheduling?

Vercel Hobby cron is limited and should not be the main frequent scheduler. GitHub Actions can run scheduled workflows using cron syntax and can trigger the monitor endpoint or run the collector script directly.

Recommended MVP schedule:
- Every 6 hours: `0 */6 * * *`
- Daily summary: once per day
- Manual run: `workflow_dispatch`

Do not run every 5 minutes for MVP because it may create unnecessary usage, noise, and complexity.

---

## 11. GitHub Actions Workflow Plan

Create:

`.github/workflows/usage-monitor.yml`

Workflow responsibilities:
1. Run on schedule and manual dispatch.
2. Install Node.js.
3. Install dependencies.
4. Run the monitor script.
5. Use GitHub Secrets for sensitive values.
6. Fail safely and send a failure notification if monitoring itself fails.

Required GitHub Secrets:
- `VERCEL_TOKEN`
- `VERCEL_TEAM_ID` optional
- `DATABASE_URL`
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `ALERT_TO_EMAIL`
- `MONITOR_API_SECRET`

Example workflow shape:

```yaml
name: Vercel Usage Monitor

on:
  schedule:
    - cron: "0 */6 * * *"
  workflow_dispatch:

jobs:
  monitor:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Run usage monitor
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_TEAM_ID: ${{ secrets.VERCEL_TEAM_ID }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          GMAIL_USER: ${{ secrets.GMAIL_USER }}
          GMAIL_APP_PASSWORD: ${{ secrets.GMAIL_APP_PASSWORD }}
          ALERT_TO_EMAIL: ${{ secrets.ALERT_TO_EMAIL }}
          MONITOR_API_SECRET: ${{ secrets.MONITOR_API_SECRET }}
        run: npm run monitor:usage
```

---

## 12. Data Model Draft

### `users`
- `id`
- `email`
- `name`
- `role`
- `created_at`

### `vercel_connections`
- `id`
- `user_id`
- `connection_name`
- `encrypted_vercel_token`
- `team_id`
- `account_type`
- `status`
- `last_validated_at`
- `created_at`

### `resource_limits`
- `id`
- `plan_name`
- `metric_key`
- `display_name`
- `limit_value`
- `unit`
- `source_note`
- `last_verified_at`

### `usage_snapshots`
- `id`
- `user_id`
- `vercel_connection_id`
- `metric_key`
- `used_value`
- `limit_value`
- `percentage_used`
- `remaining_value`
- `unit`
- `raw_payload`
- `checked_at`

### `alert_rules`
- `id`
- `user_id`
- `metric_key`
- `warning_threshold`
- `danger_threshold`
- `critical_threshold`
- `cooldown_minutes`
- `enabled`

### `alert_events`
- `id`
- `user_id`
- `metric_key`
- `threshold_level`
- `percentage_used`
- `message`
- `channel`
- `sent_at`
- `status`

### `notification_channels`
- `id`
- `user_id`
- `channel_type`
- `email_to`
- `enabled`
- `created_at`

### `monitor_runs`
- `id`
- `started_at`
- `finished_at`
- `status`
- `error_message`
- `users_checked`
- `alerts_sent`

---

## 13. UI Pages

### 13.1 Landing Page
Explain:
- Monitor your Vercel Hobby usage
- Stay inside free limits
- Get Gmail alerts before risk
- Simple dashboard for solo developers

### 13.2 Dashboard
Cards:
- Overall Health
- Active CPU
- Edge Requests
- Function Invocations
- Data Transfer
- ISR Reads/Writes
- Build Minutes
- Projects

### 13.3 Usage History
Charts:
- Daily usage trend
- Resource-by-resource history
- Risk trend

### 13.4 Projects
List connected Vercel projects:
- Name
- Domain
- Latest deployment
- Status
- Count toward project limit

### 13.5 Alerts
Manage:
- Email recipient
- Thresholds
- Cooldown
- Daily summary
- Test email button

### 13.6 Settings
Manage:
- Vercel connection
- Gmail settings
- Account security
- Delete connection
- Export data

### 13.7 Admin Panel
For future commercial version:
- Users count
- Active connections
- Monitor job health
- Failed alerts
- System logs

---

## 14. Email Templates

### Warning Email
Subject: Vercel usage warning: {{metric}} reached {{percentage}}%

Body:
Hello {{name}},

Your Vercel Hobby usage for {{metric}} has reached {{percentage}}%.

Used: {{used}} {{unit}}
Limit: {{limit}} {{unit}}
Remaining: {{remaining}} {{unit}}

Recommended action:
{{recommendation}}

This is an early warning so you can stay within your free limits.

### Daily Summary
Subject: Daily Vercel usage summary

Body:
Hello {{name}},

Here is your daily Vercel usage summary:

Overall status: {{status}}

{{resource_summary}}

You are currently {{safe_or_risky_message}}.

---

## 15. Security Requirements

1. Encrypt Vercel tokens at rest.
2. Never expose secrets to the frontend.
3. Use GitHub Secrets for workflow credentials.
4. Use server-side validation for every user request.
5. Add rate limiting to monitor endpoints.
6. Require a secret key for any endpoint triggered by GitHub Actions.
7. Avoid logging raw Vercel API responses if they contain sensitive data.
8. Implement strict user isolation.
9. Add audit logs for connection changes and alert changes.
10. Add token revocation/delete connection feature.

---

## 16. Free Resource Strategy

Use free-tier resources carefully:
- Vercel Hobby only for dashboard hosting.
- GitHub Actions for scheduled worker.
- Supabase free tier for MVP database.
- Gmail for MVP email alerts.
- Avoid heavy serverless jobs on Vercel.
- Cache dashboard data from snapshots instead of fetching usage on every page load.
- Keep check frequency reasonable, such as every 6 or 12 hours.

---

## 17. Acceptance Criteria

The MVP is complete when:

1. A user can sign up and log in.
2. A user can connect a Vercel token.
3. The system can fetch Vercel usage successfully.
4. The system stores usage snapshots.
5. The dashboard shows used, remaining, and percentage for each resource.
6. The alert engine sends Gmail email when thresholds are crossed.
7. Duplicate alerts are prevented by cooldown logic.
8. GitHub Actions can run the monitor on schedule and manually.
9. Mock usage tests prove warning, danger, and critical alerts work.
10. The codebase is structured for future multi-user/commercial use.

---

## 18. Suggested Development Phases

### Phase 1: Investigation
- Inspect official Vercel docs.
- Run Vercel CLI usage command manually.
- Inspect actual JSON shape.
- Confirm whether API endpoint or CLI is better for MVP.
- Confirm Gmail SMTP/app-password setup.

### Phase 2: Core Data Model
- Add database schema.
- Add user auth.
- Add encrypted Vercel connection storage.
- Add resource limit config.

### Phase 3: Usage Collector
- Build `npm run monitor:usage`.
- Fetch usage data.
- Normalize metrics.
- Store snapshots.

### Phase 4: Alert Engine
- Add threshold logic.
- Add Gmail email sender.
- Add dedupe/cooldown.
- Add daily summary.

### Phase 5: Dashboard UI
- Build dashboard cards.
- Build history page.
- Build alerts settings.
- Build connection settings.

### Phase 6: GitHub Actions
- Add workflow.
- Add secrets documentation.
- Test manual workflow dispatch.
- Test scheduled run.

### Phase 7: Multi-User Hardening
- Add strict authorization.
- Add admin view.
- Add audit logs.
- Add token deletion/revocation flow.

---

## 19. Testing Requirements

Unit tests:
- Percentage calculation
- Remaining quota calculation
- Threshold detection
- Alert dedupe
- Gmail email payload generation
- Vercel payload normalization

Integration tests:
- Mock Vercel usage fetch
- Snapshot storage
- Alert event creation
- Monitor run logging

E2E tests:
- Login
- Connect Vercel account
- View dashboard
- Configure alert rule
- Trigger test email

Manual tests:
- Run GitHub Action manually
- Confirm email received
- Confirm no duplicate alert on repeated run
- Confirm critical alert sends when mock usage is 95%+

---

## 20. Coding Agent ProPrompt

### Role
You are a senior full-stack engineer, backend automation specialist, and SaaS architect. You are building a production-quality, multi-user Vercel Hobby usage monitoring dashboard with proactive Gmail alerts.

### Task
Build the MVP for **FreeQuota Watch**, a dashboard and monitoring agent that tracks Vercel Hobby plan usage, calculates used and remaining free quota, stores historical snapshots, and sends Gmail alerts before the user reaches risky usage levels.

### Context
The user is currently using Vercel Hobby and wants to stay within free limits. The app should first work for the user’s own Vercel account, but it must be architected for future multi-user/commercial use where other users can sign up, connect their own Vercel account, and monitor their own free-plan usage. The user wants to use Gmail for alerts and GitHub Actions for scheduled background checks. Use free-tier services where practical.

### Rules/Constraints
1. Investigate first. Do not assume the exact Vercel usage JSON shape.
2. Use official Vercel CLI/API sources for usage data. Do not scrape the dashboard visually.
3. Verify current Vercel Hobby limits from official Vercel documentation before hardcoding or seeding limits.
4. Keep resource limits configurable in a table or config file.
5. Use GitHub Actions as the scheduled worker for MVP, not frequent Vercel Cron.
6. Use Gmail SMTP/App Password for MVP alerts, but keep the email adapter modular for future providers.
7. Store Vercel tokens securely and never expose them to the frontend or logs.
8. Design the database for multi-user isolation from the beginning.
9. Prevent duplicate alert spam with cooldown/deduplication logic.
10. Use existing project architecture if this is added to an existing codebase.
11. Use MCP tools when useful:
    - filesystem for repo inspection and edits
    - git for status, diffs, and history
    - github for workflow and repo checks
    - context7 for current framework/library docs
    - playwright for E2E browser testing
    - chrome-devtools for live UI/console/network inspection
12. Test with simulated usage payloads at 20%, 76%, 86%, and 96%.
13. Do not report completion until unit tests, monitor script tests, and at least one manual GitHub Actions run path are documented.

### Output
Deliver:
1. A working Next.js dashboard.
2. A usage collector service/script.
3. A Supabase/PostgreSQL schema or migration plan.
4. Gmail alert sender.
5. Alert rules and deduplication.
6. GitHub Actions scheduled workflow.
7. Setup documentation for secrets and local testing.
8. Test results and a clear final implementation summary.

---

## 21. Final Notes for the Agent

Keep the MVP simple, reliable, and honest. The app should not pretend to be real-time if Vercel usage data is delayed. The first version should help the user understand risk early, avoid surprise usage growth, and stay within free limits.

