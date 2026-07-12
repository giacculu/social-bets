# SocialBets v1 -> v2 — Migration Roadmap

**Date:** 2026-07-12
**Scope:** Incremental migration from MVP to production-grade platform
**Constraint:** Every milestone must leave the application in a working, deployable state
**Current codebase:** 55 source files, ~6,928 lines (26 .ts, 25 .tsx, 1 .prisma, 3 .sql)

---

## Current vs. Target State Summary

| Dimension | v1 (Current) | v2 (Target) | Delta |
|-----------|-------------|-------------|-------|
| Source files | 55 | ~180 | +125 new files |
| Total lines | ~6,928 | ~18,000 | +11,000 lines |
| Components | 4 | ~80 | +76 components |
| API routes | 13 | ~40 | +27 routes |
| Services | 0 | 14 | +14 services |
| Repositories | 0 | 12 | +12 repositories |
| Validators | 0 | 8 | +8 validator files |
| Prisma models | 14 | ~28 | +14 models |
| Prisma enums | 14 | ~25 | +11 enums |
| Dependencies | 22 | ~35 | +13 packages |
| Middleware | 0 | 1 | +1 middleware.ts |
| Background jobs | 0 (in-process cron) | ~20 (Inngest) | Full replacement |
| Caching | None | Redis (Upstash) | New layer |
| Error tracking | None | Sentry | New layer |
| Logging | console.* | Pino + Logtail | Full replacement |
| Testing | Zero | Vitest + Playwright | New layer |

---

## Migration Milestones

The migration is split into **8 milestones** executed in strict dependency order. Each milestone is independently deployable and leaves the app functional.

---

### MILESTONE 1: Critical Security Fixes

**Priority:** CRITICAL — Blocks all other work
**Objective:** Close all P0 security vulnerabilities that are exploitable today
**Complexity:** Low
**Estimated effort:** 2-3 days
**Estimated risk:** Low (surgical fixes, minimal surface area)

#### Dependencies

- None — this is the first milestone

#### Tasks

| # | Task | Classification | Files Involved |
|---|------|---------------|----------------|
| 1.1 | Add `role` enum (USER, ADMIN, MODERATOR) to User model | Critical | `prisma/schema.prisma` |
| 1.2 | Add `version` Int field to User model (optimistic locking) | Critical | `prisma/schema.prisma` |
| 1.3 | Create and run Prisma migration for 1.1 + 1.2 | Critical | `prisma/migrations/` |
| 1.4 | Seed existing admin user with role=ADMIN | Critical | `prisma/seed.ts` |
| 1.5 | Create `src/middleware.ts` with admin role check on `/api/admin/*` | Critical | **NEW** `src/middleware.ts` |
| 1.6 | Remove odds-from-client in bet placement — read odds from DB Outcome | Critical | `src/app/api/bets/route.ts` |
| 1.7 | Add rate limiting to login endpoint (5 attempts/min per IP) | High | `src/app/api/auth/register/route.ts`, **NEW** `src/lib/rateLimit.ts` |
| 1.8 | Add admin role check to admin page server component | Critical | `src/app/(dashboard)/admin/page.tsx` |
| 1.9 | Normalize login error messages ("Invalid email or password") | High | `src/lib/auth.ts` |
| 1.10 | Add security headers in `next.config.ts` | High | `next.config.ts` |

#### Database Impact

- User model gains `role` column (default: USER) and `version` column (default: 1)
- Migration: `ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER'; ALTER TABLE "User" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;`
- Backward compatible: existing rows get safe defaults
- No data loss

#### Frontend Impact

- Admin page now shows "Access Denied" for non-admin users
- Bet slip outcome buttons no longer send odds to API (invisible change)

#### Backend Impact

- Middleware intercepts all `/api/admin/*` requests and checks `session.user.role`
- Bet placement API reads odds from `prisma.outcome.findUnique()` instead of request body
- Login returns generic error message

#### Risk Assessment

- **Risk:** Admin user might not have role set if seed hasn't run
- **Mitigation:** Migration sets default USER; manually update admin user in DB
- **Risk:** Rate limiting might block legitimate users
- **Mitigation:** 5 attempts/min is generous; IP-based not user-based

---

### MILESTONE 2: Infrastructure Foundation

**Priority:** HIGH — Enables all subsequent work
**Objective:** Add Redis, structured logging, error tracking, and base infrastructure
**Complexity:** Medium
**Estimated effort:** 3-4 days
**Estimated risk:** Low (additive, no existing behavior changes)

#### Dependencies

- Milestone 1 complete (middleware exists to build upon)

#### Tasks

| # | Task | Classification | Files Involved |
|---|------|---------------|----------------|
| 2.1 | Install Upstash Redis, create Redis client singleton | High | **NEW** `src/lib/redis.ts`, `package.json` |
| 2.2 | Install Pino, create logger with request context | High | **NEW** `src/lib/logger.ts`, `package.json` |
| 2.3 | Install Sentry Next.js integration | High | `package.json`, `next.config.ts`, **NEW** `src/lib/sentry.ts` |
| 2.4 | Create custom error classes (AppError hierarchy) | High | **NEW** `src/lib/errors.ts` |
| 2.5 | Create Zod validation schemas for common patterns (pagination, IDs, amounts) | High | **NEW** `src/server/validators/common.validator.ts` |
| 2.6 | Create validation middleware wrapper | Medium | **NEW** `src/server/middleware/validation.middleware.ts` |
| 2.7 | Create error handling middleware (catch AppError, format JSON response) | High | **NEW** `src/server/middleware/error.middleware.ts` |
| 2.8 | Add `.env.example` entries for UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, SENTRY_DSN | Medium | `.env.example` |
| 2.9 | Replace all `console.log`/`console.error` in data pipeline with Pino logger | Medium | `src/lib/data/engine/orchestrator.ts`, `settlement.ts`, `pipeline.ts` |
| 2.10 | Replace `console.log`/`console.error` in API routes with Pino logger | Medium | All `src/app/api/**/route.ts` files |

#### Database Impact

- None. Purely additive infrastructure.

#### Frontend Impact

- None visible. Sentry captures client-side errors automatically.

#### Backend Impact

- All existing `console.log` calls replaced with structured logging
- Errors now produce structured JSON logs with request context
- Sentry captures unhandled exceptions in production
- Redis client available for caching (not yet used by business logic)

#### Risk Assessment

- **Risk:** Redis connection failure could break app if accidentally used
- **Mitigation:** Redis client has graceful degradation (returns null on failure)
- **Risk:** Sentry might capture sensitive data in error reports
- **Mitigation:** Configure Sentry to scrub passwords, tokens, and balance data

---

### MILESTONE 3: Service & Repository Layers

**Priority:** HIGH — Core architectural improvement
**Objective:** Extract business logic from API routes into testable service/repository layers
**Complexity:** High
**Estimated effort:** 5-7 days
**Estimated risk:** Medium (refactoring existing working code)

#### Dependencies

- Milestone 2 complete (error classes, logger, validation schemas exist)

#### Tasks

| # | Task | Classification | Files Involved |
|---|------|---------------|----------------|
| 3.1 | Create WalletService with atomic balance operations | Critical | **NEW** `src/server/services/wallet.service.ts`, **NEW** `src/server/repositories/wallet.repository.ts` |
| 3.2 | Create BetService extracting logic from `api/bets/route.ts` | Critical | **NEW** `src/server/services/bet.service.ts`, **NEW** `src/server/repositories/bet.repository.ts` |
| 3.3 | Create EventService extracting logic from page components | High | **NEW** `src/server/services/event.service.ts`, **NEW** `src/server/repositories/event.repository.ts` |
| 3.4 | Create ContestService extracting logic from `api/contests/route.ts` | High | **NEW** `src/server/services/contest.service.ts`, **NEW** `src/server/repositories/contest.repository.ts` |
| 3.5 | Create FriendshipService extracting logic from `api/friends/route.ts` | High | **NEW** `src/server/services/friendship.service.ts`, **NEW** `src/server/repositories/friendship.repository.ts` |
| 3.6 | Create AuthService extracting logic from `lib/auth.ts` + `api/auth/register/route.ts` | High | **NEW** `src/server/services/auth.service.ts` |
| 3.7 | Create UserService for profile/stats operations | Medium | **NEW** `src/server/services/user.service.ts`, **NEW** `src/server/repositories/user.repository.ts` |
| 3.8 | Create LeaderboardService | Medium | **NEW** `src/server/services/leaderboard.service.ts`, **NEW** `src/server/repositories/leaderboard.repository.ts` |
| 3.9 | Refactor all API route handlers to delegate to services | High | All `src/app/api/**/route.ts` files (13 files) |
| 3.10 | Add Zod validation to every API endpoint | High | `src/server/validators/*.validator.ts` (7 new files) |
| 3.11 | Add optimistic locking to WalletService balance operations | Critical | `wallet.service.ts`, `wallet.repository.ts` |
| 3.12 | Add idempotency to WalletService deposit/withdraw | Critical | `wallet.service.ts`, **NEW** `prisma/migrations/` (IdempotencyKey model) |

#### Database Impact

- New `IdempotencyKey` model (id, userId, operation, result, createdAt)
- New indexes on existing tables for query optimization
- Migration is additive, no changes to existing tables

#### Frontend Impact

- None. API contracts remain identical. Services are internal refactor.

#### Backend Impact

- All API routes become thin wrappers: validate -> call service -> format response
- Business logic centralized in services (testable independently)
- Database queries centralized in repositories (cache-ready)
- Atomic balance operations prevent race conditions
- Idempotency prevents duplicate financial operations

#### Risk Assessment

- **Risk:** Refactoring could introduce subtle behavior changes
- **Mitigation:** Test each service method against existing API behavior before replacing
- **Risk:** Services might not perfectly replicate edge cases in existing routes
- **Mitigation:** Keep old route code commented out during transition; compare responses

---

### MILESTONE 4: Database Schema Evolution

**Priority:** HIGH — Required for new features
**Objective:** Extend database schema to support predictions, social features, notifications, and achievements
**Complexity:** Medium
**Estimated effort:** 3-4 days
**Estimated risk:** Medium (schema changes affect many files)

#### Dependencies

- Milestone 3 complete (repository layer can handle new models)

#### Tasks

| # | Task | Classification | Files Involved |
|---|------|---------------|----------------|
| 4.1 | Add `deletedAt` DateTime? to User, Event, Bet, Contest models | High | `prisma/schema.prisma` |
| 4.2 | Add `sportId` direct foreign key to Event model | Medium | `prisma/schema.prisma` |
| 4.3 | Create Prediction model (separate from Bet) | High | `prisma/schema.prisma` |
| 4.4 | Create Wallet model (separate from User balance fields) | High | `prisma/schema.prisma` |
| 4.5 | Create Achievement + AchievementType models | Medium | `prisma/schema.prisma` |
| 4.6 | Create Reputation model | Medium | `prisma/schema.prisma` |
| 4.7 | Create ActivityFeedEntry model | High | `prisma/schema.prisma` |
| 4.8 | Create Notification model | High | `prisma/schema.prisma` |
| 4.9 | Create Comment model | Medium | `prisma/schema.prisma` |
| 4.10 | Create Reaction model | Medium | `prisma/schema.prisma` |
| 4.11 | Create SyncJob model (replace in-memory syncHistory) | High | `prisma/schema.prisma` |
| 4.12 | Create UserStats model (pre-computed aggregates) | Medium | `prisma/schema.prisma` |
| 4.13 | Create EventStats model | Medium | `prisma/schema.prisma` |
| 4.14 | Add `confidence` and `isPublic` to Bet model | Medium | `prisma/schema.prisma` |
| 4.15 | Add `visibility` and `autoSettle` to Contest model | Medium | `prisma/schema.prisma` |
| 4.16 | Add all new indexes (see SPECIFICATION 11.3) | High | `prisma/schema.prisma` |
| 4.17 | Create and run migration | High | `prisma/migrations/` |
| 4.18 | Migrate existing User balance to Wallet model | Critical | **NEW** `prisma/migrations/` (data migration script) |
| 4.19 | Update seed script for new models | Medium | `prisma/seed.ts` |

#### Database Impact

- 14 new models added
- 11 new enums added
- User model: `balance` and `realBalance` migrated to Wallet model
- Event model: gains `sportId` direct FK
- Bet model: gains `confidence`, `isPublic`, `version` fields
- Contest model: gains `visibility`, `autoSettle` fields
- All models gain `deletedAt` where applicable
- Data migration: existing User balances moved to Wallet records

#### Frontend Impact

- None yet. New models are not consumed by UI until later milestones.

#### Backend Impact

- Prisma client regenerated with new types
- All existing queries continue to work (old fields remain until migrated)
- Repository layer needs updates to use new models

#### Risk Assessment

- **Risk:** Data migration (User balance -> Wallet) could lose data
- **Mitigation:** Run migration in a transaction; verify balance sums before/after; keep backup
- **Risk:** Schema changes might break existing Prisma queries
- **Mitigation:** Run `prisma generate` and fix all type errors before deploying
- **Risk:** New models without indexes could slow down queries
- **Mitigation:** All new models created with proper indexes from day one

---

### MILESTONE 5: Caching, Jobs & Pipeline Upgrade

**Priority:** MEDIUM — Performance and reliability
**Objective:** Add Redis caching, replace in-process cron with Inngest, fix settlement engine
**Complexity:** High
**Estimated effort:** 5-7 days
**Estimated risk:** Medium (replacing working but fragile systems)

#### Dependencies

- Milestone 2 complete (Redis client exists)
- Milestone 3 complete (services exist to wrap with caching)
- Milestone 4 complete (SyncJob model exists for persistent job history)

#### Tasks

| # | Task | Classification | Files Involved |
|---|------|---------------|----------------|
| 5.1 | Add cache-first reads to EventRepository | High | `src/server/repositories/event.repository.ts` |
| 5.2 | Add cache-first reads to LeaderboardRepository | High | `src/server/repositories/leaderboard.repository.ts` |
| 5.3 | Add cache-first reads to UserRepository (profile) | Medium | `src/server/repositories/user.repository.ts` |
| 5.4 | Add cache invalidation to all repository write methods | High | All repository files |
| 5.5 | Install Inngest, create Inngest client | High | **NEW** `src/lib/inngest.ts`, `package.json` |
| 5.6 | Create sync jobs (syncAll, syncSport, syncOdds, syncLiveScores) | High | **NEW** `src/jobs/sync.jobs.ts` |
| 5.7 | Create settlement jobs (settleEvent, settleContest, settleChallenge) | High | **NEW** `src/jobs/settlement.jobs.ts` |
| 5.8 | Create leaderboard jobs (recalculate, archive) | Medium | **NEW** `src/jobs/leaderboard.jobs.ts` |
| 5.9 | Create cleanup jobs (idempotency keys, old notifications, old sync jobs) | Medium | **NEW** `src/jobs/cleanup.jobs.ts` |
| 5.10 | Create Inngest API route (`/api/inngest`) | High | **NEW** `src/app/api/inngest/route.ts` |
| 5.11 | Fix settlement engine: atomic transactions, balance snapshots, idempotency | Critical | `src/lib/data/engine/settlement.ts` |
| 5.12 | Fix settlement engine: premature settled=true marking | Critical | `src/lib/data/engine/settlement.ts` |
| 5.13 | Fix leaderboard getCurrentPeriod() to use ISO weeks | Medium | `src/lib/data/engine/settlement.ts` |
| 5.14 | Fix forceSettleEvent (broken status assignment) | High | `src/lib/data/engine/orchestrator.ts` |
| 5.15 | Migrate syncHistory from in-memory to SyncJob model | High | `src/lib/data/engine/orchestrator.ts` |
| 5.16 | Remove node-cron dependency, delete `src/lib/data/cron.ts` | Medium | `src/lib/data/cron.ts`, `package.json` |
| 5.17 | Update vercel.json to trigger Inngest via cron endpoint | Medium | `vercel.json`, `src/app/api/cron/route.ts` |
| 5.18 | Add Inngest scheduled functions for all cron jobs | High | `src/jobs/*.jobs.ts` |

#### Database Impact

- SyncJob model now persists sync history (was in-memory, lost between invocations)
- Settlement engine uses DB transactions for atomicity
- IdempotencyKey model used for settlement idempotency
- No new tables beyond what Milestone 4 created

#### Frontend Impact

- None. All changes are backend infrastructure.

#### Backend Impact

- All reads go through Redis cache first (reduces DB load by ~60%)
- All writes invalidate related cache keys
- Cron jobs now run via Inngest (reliable, retryable, observable)
- Settlement engine is now atomic and idempotent
- Sync history persists across serverless invocations
- node-cron dependency removed (no more in-process scheduling)

#### Risk Assessment

- **Risk:** Cache invalidation bugs could serve stale data
- **Mitigation:** Conservative TTLs; write-through invalidation; TTL as safety net
- **Risk:** Inngest migration could miss jobs during transition
- **Mitigation:** Keep Vercel cron as fallback; both trigger the same Inngest events
- **Risk:** Settlement engine refactoring could miss edge cases
- **Mitigation:** Write unit tests for settlement logic BEFORE refactoring

---

### MILESTONE 6: UI Foundation & Component Library

**Priority:** MEDIUM — Frontend quality and consistency
**Objective:** Install shadcn/ui, create component library, add error/loading states, fix mobile navigation
**Complexity:** High
**Estimated effort:** 5-7 days
**Estimated risk:** Low (additive, no backend changes)

#### Dependencies

- Milestone 1 complete (for auth guard patterns)
- No dependency on Milestones 3-5 (UI work is independent of backend refactor)

#### Tasks

| # | Task | Classification | Files Involved |
|---|------|---------------|----------------|
| 6.1 | Install shadcn/ui, configure theme (dark mode, emerald accent) | High | `package.json`, `components.json`, `src/app/globals.css` |
| 6.2 | Install base shadcn components (Button, Input, Card, Badge, Avatar, Modal, Tabs, Toast, Skeleton, DropdownMenu, Tooltip, ScrollArea, Separator, Progress) | High | **NEW** `src/components/ui/*.tsx` (~15 files) |
| 6.3 | Create shared components (TimeAgo, CurrencyDisplay, OddsDisplay, SportIcon, LeagueBadge, UserAvatar, StatusBadge, ShareButton) | High | **NEW** `src/components/shared/*.tsx` (~8 files) |
| 6.4 | Create layout components (PageContainer, SectionHeader, AuthGuard) | High | **NEW** `src/components/layout/*.tsx` (~3 files) |
| 6.5 | Create `loading.tsx` for every route group | High | **NEW** `src/app/loading.tsx`, `src/app/(auth)/loading.tsx`, `src/app/(dashboard)/loading.tsx` |
| 6.6 | Create `error.tsx` for every route group | High | **NEW** `src/app/error.tsx`, `src/app/(auth)/error.tsx`, `src/app/(dashboard)/error.tsx`, `src/app/(dashboard)/admin/error.tsx` |
| 6.7 | Create `not-found.tsx` | Medium | **NEW** `src/app/not-found.tsx` |
| 6.8 | Create toast notification system (install sonner) | High | `package.json`, `src/components/layout/RootProviders.tsx` |
| 6.9 | Create RootProviders component (ThemeProvider, AuthProvider, QueryClientProvider, Toaster) | High | **NEW** `src/components/layout/RootProviders.tsx` |
| 6.10 | Create MobileNavigation component (bottom tab bar with badges) | High | **NEW** `src/components/layout/MobileNavigation.tsx` |
| 6.11 | Create DesktopNavigation component (top nav bar) | High | **NEW** `src/components/layout/DesktopNavigation.tsx` |
| 6.12 | Refactor root layout to use RootProviders + responsive nav | High | `src/app/layout.tsx` |
| 6.13 | Refactor dashboard layout to use new navigation components | High | `src/app/(dashboard)/layout.tsx` |
| 6.14 | Create NotificationCenter slide-over component | Medium | **NEW** `src/components/features/notifications/NotificationCenter.tsx` |
| 6.15 | Create CommandPalette (Cmd+K search overlay) | Medium | **NEW** `src/components/features/search/CommandPalette.tsx` |
| 6.16 | Install `sonner` for toast notifications | Medium | `package.json` |
| 6.17 | Install `nuqs` for URL state management | Medium | `package.json` |
| 6.18 | Install `@hookform/resolvers` + `zod` for form validation | Medium | `package.json` |

#### Database Impact

- None. Purely frontend work.

#### Frontend Impact

- Every page gets loading states (skeleton placeholders)
- Every page gets error boundaries (catch + retry)
- 404 page gets custom design
- Mobile users get bottom tab navigation
- Desktop users get improved top nav
- All interactive feedback via toasts (not inline divs)
- Consistent component library across all pages
- Dark theme refined with proper design tokens

#### Backend Impact

- None.

#### Risk Assessment

- **Risk:** shadcn/ui might conflict with existing Tailwind classes
- **Mitigation:** shadcn is designed to coexist with Tailwind; use `tailwind-merge` for class conflicts
- **Risk:** New providers might affect server component rendering
- **Mitigation:** Providers only wrap client components; server components pass through

---

### MILESTONE 7: Feature Implementation

**Priority:** MEDIUM — New user-facing features
**Objective:** Implement new features: activity feed, notifications, achievements, reputation, search, contest redesign
**Complexity:** High
**Estimated effort:** 10-14 days
**Estimated risk:** Medium (new features, new code paths)

#### Dependencies

- Milestone 3 complete (services exist)
- Milestone 4 complete (database models exist)
- Milestone 5 complete (caching + jobs exist)
- Milestone 6 complete (component library exists)

#### Tasks — Phase A: Social Features (Days 1-4)

| # | Task | Classification | Files Involved |
|---|------|---------------|----------------|
| 7.1 | Create ActivityFeedService | High | **NEW** `src/server/services/feed.service.ts`, **NEW** `src/server/repositories/feed.repository.ts` |
| 7.2 | Create NotificationService | High | **NEW** `src/server/services/notification.service.ts`, **NEW** `src/server/repositories/notification.repository.ts` |
| 7.3 | Create feed API routes (`/api/v1/feed`) | High | **NEW** `src/app/api/v1/feed/route.ts` |
| 7.4 | Create notification API routes (`/api/v1/notifications`) | High | **NEW** `src/app/api/v1/notifications/route.ts` |
| 7.5 | Create ActivityFeed feature components | High | **NEW** `src/components/features/feed/*.tsx` (~6 files) |
| 7.6 | Create ActivityFeed page | High | **NEW** `src/app/(dashboard)/feed/page.tsx` |
| 7.7 | Create NotificationItem + NotificationBadge components | High | **NEW** `src/components/features/notifications/*.tsx` |
| 7.8 | Create Notifications page | Medium | **NEW** `src/app/(dashboard)/notifications/page.tsx` |
| 7.9 | Create CommentService + Comment model integration | Medium | **NEW** `src/server/services/comment.service.ts`, **NEW** `src/server/repositories/comment.repository.ts` |
| 7.10 | Create ReactionService + Reaction model integration | Medium | **NEW** `src/server/services/reaction.service.ts` |
| 7.11 | Add activity feed generation to BetService (on win/loss) | High | `src/server/services/bet.service.ts` |
| 7.12 | Add activity feed generation to ContestService (on join/win) | High | `src/server/services/contest.service.ts` |
| 7.13 | Add activity feed generation to FriendshipService (on add) | Medium | `src/server/services/friendship.service.ts` |
| 7.14 | Add notification creation to BetService (on settlement) | High | `src/server/services/bet.service.ts` |
| 7.15 | Add notification creation to FriendshipService (on request) | Medium | `src/server/services/friendship.service.ts` |
| 7.16 | Create Inngest notification jobs (push delivery) | Medium | **NEW** `src/jobs/notification.jobs.ts` |
| 7.17 | Register Web Push API Service Worker | Medium | **NEW** `public/sw.js`, `src/components/features/notifications/PushNotificationManager.tsx` |

#### Tasks — Phase B: Gamification (Days 5-7)

| # | Task | Classification | Files Involved |
|---|------|---------------|----------------|
| 7.18 | Create AchievementService | Medium | **NEW** `src/server/services/achievement.service.ts`, **NEW** `src/server/repositories/achievement.repository.ts` |
| 7.19 | Create ReputationService | Medium | **NEW** `src/server/services/reputation.service.ts`, **NEW** `src/server/repositories/reputation.repository.ts` |
| 7.20 | Create UserStats computation job | Medium | **NEW** `src/jobs/analytics.jobs.ts` |
| 7.21 | Create Achievement checking logic (triggered by bet settlement) | Medium | `src/jobs/settlement.jobs.ts` |
| 7.22 | Create Achievement page (profile tab) | Medium | **NEW** `src/app/(dashboard)/profile/achievements/page.tsx` |
| 7.23 | Create AchievementGrid component | Medium | **NEW** `src/components/features/profile/AchievementGrid.tsx` |
| 7.24 | Create ProfileStats component with charts | Medium | **NEW** `src/components/features/profile/ProfileStats.tsx` |
| 7.25 | Create Profile page (replaces wallet-only profile) | High | **NEW** `src/app/(dashboard)/profile/page.tsx` |

#### Tasks — Phase C: Search & Discovery (Days 8-10)

| # | Task | Classification | Files Involved |
|---|------|---------------|----------------|
| 7.26 | Create SearchService with PostgreSQL full-text search | Medium | **NEW** `src/server/services/search.service.ts` |
| 7.27 | Add tsvector columns to Event, User, Contest models | Medium | `prisma/schema.prisma`, migration |
| 7.28 | Create search API route (`/api/v1/search`) | Medium | **NEW** `src/app/api/v1/search/route.ts` |
| 7.29 | Create SearchBar component (desktop) | Medium | **NEW** `src/components/features/search/SearchBar.tsx` |
| 7.30 | Create SearchResults component | Medium | **NEW** `src/components/features/search/SearchResults.tsx` |
| 7.31 | Integrate search into CommandPalette | Medium | `src/components/features/search/CommandPalette.tsx` |
| 7.32 | Create HomeFeed page (replaces sports-only landing) | High | **NEW** `src/app/(dashboard)/home/page.tsx` |
| 7.33 | Create HomeFeed components (TodayEvents, FriendsActivity, FeaturedContests, Trending) | High | **NEW** `src/components/features/feed/HomeFeed*.tsx` (~4 files) |

#### Tasks — Phase D: Contest Redesign (Days 11-14)

| # | Task | Classification | Files Involved |
|---|------|---------------|----------------|
| 7.34 | Redesign ContestService with prediction requirements | High | `src/server/services/contest.service.ts` |
| 7.35 | Add contest prediction submission flow | High | **NEW** `src/app/api/v1/contests/[id]/predictions/route.ts` |
| 7.36 | Create ContestDetail page (standings, predictions, discussion) | High | **NEW** `src/app/(dashboard)/contests/[id]/page.tsx` |
| 7.37 | Create ContestForm wizard (multi-step) | High | **NEW** `src/components/features/contests/ContestForm.tsx` |
| 7.38 | Create ContestStandings component | Medium | **NEW** `src/components/features/contests/ContestStandings.tsx` |
| 7.39 | Create ContestPredictions component | Medium | **NEW** `src/components/features/contests/ContestPredictions.tsx` |
| 7.40 | Create PrizePoolBreakdown component | Medium | **NEW** `src/components/features/contests/PrizePoolBreakdown.tsx` |
| 7.41 | Add contest visibility (PUBLIC, FRIENDS, PRIVATE) | Medium | `src/server/services/contest.service.ts` |
| 7.42 | Redesign ChallengeService with escrow and deadline | High | `src/server/services/challenge.service.ts` |
| 7.43 | Create ChallengeDetail page | High | **NEW** `src/app/(dashboard)/challenges/[id]/page.tsx` |
| 7.44 | Create ChallengeForm component | Medium | **NEW** `src/components/features/challenges/ChallengeForm.tsx` |

#### Database Impact

- New tsvector columns on Event, User, Contest for full-text search
- GIN indexes for search performance
- All new feature tables (ActivityFeedEntry, Notification, Achievement, etc.) now actively used

#### Frontend Impact

- New pages: Home Feed, Activity Feed, Notifications, Profile, Search
- New components: ~40 feature components
- Existing pages: Contests and Challenges pages redesigned
- All new pages have loading.tsx, error.tsx, proper mobile/desktop layouts

#### Backend Impact

- 14 new services and 12 new repositories actively serving requests
- Activity feed generation on all social actions
- Notification delivery on all relevant events
- Achievement checking after every settlement
- Search available via API and CommandPalette
- All new API routes under `/api/v1/` (versioned)

#### Risk Assessment

- **Risk:** Activity feed generation at scale could be expensive
- **Mitigation:** Lazy generation (only when feed is loaded) + Redis caching
- **Risk:** Notification delivery could fail silently
- **Mitigation:** Dead letter queue + admin dashboard visibility
- **Risk:** Search performance could degrade with data growth
- **Mitigation:** GIN indexes + Meilisearch migration path at v2.5

---

### MILESTONE 8: Polish, Testing & Launch Prep

**Priority:** MEDIUM — Quality assurance and production readiness
**Objective:** Add tests, analytics, admin dashboard upgrade, performance optimization, documentation
**Complexity:** Medium
**Estimated effort:** 5-7 days
**Estimated risk:** Low (additive quality improvements)

#### Dependencies

- All previous milestones complete

#### Tasks

| # | Task | Classification | Files Involved |
|---|------|---------------|----------------|
| 8.1 | Install Vitest, configure test environment | High | `package.json`, `vitest.config.ts` |
| 8.2 | Write unit tests for OddsEngine (mathematical correctness) | Critical | **NEW** `src/__tests__/lib/odds-engine.test.ts` |
| 8.3 | Write unit tests for SettlementEngine | Critical | **NEW** `src/__tests__/lib/settlement.test.ts` |
| 8.4 | Write unit tests for WalletService (atomic operations) | Critical | **NEW** `src/__tests__/services/wallet.service.test.ts` |
| 8.5 | Write unit tests for BetService | High | **NEW** `src/__tests__/services/bet.service.test.ts` |
| 8.6 | Write unit tests for ContestService | High | **NEW** `src/__tests__/services/contest.service.test.ts` |
| 8.7 | Write unit tests for AuthService | High | **NEW** `src/__tests__/services/auth.service.test.ts` |
| 8.8 | Write integration tests for bet placement flow | High | **NEW** `src/__tests__/integration/bet-flow.test.ts` |
| 8.9 | Write integration tests for settlement flow | High | **NEW** `src/__tests__/integration/settlement-flow.test.ts` |
| 8.10 | Install Playwright, write e2e tests for registration -> first prediction | High | `package.json`, **NEW** `e2e/registration.spec.ts` |
| 8.11 | Write e2e tests for contest join -> settlement -> prize distribution | High | **NEW** `e2e/contest-flow.spec.ts` |
| 8.12 | Add PostHog analytics integration | Medium | `package.json`, **NEW** `src/lib/analytics.ts` |
| 8.13 | Add analytics tracking to key events (signup, prediction, contest join) | Medium | Various service files |
| 8.14 | Redesign admin dashboard with system status, user management, content moderation | High | `src/app/(dashboard)/admin/page.tsx`, **NEW** admin components |
| 8.15 | Add API versioning (`/api/v1/` prefix) | Medium | All API route files |
| 8.16 | Add cursor-based pagination to all list endpoints | Medium | All service/repository files |
| 8.17 | Performance audit (Lighthouse, bundle analysis) | Medium | `next.config.ts` |
| 8.18 | Add ISR revalidation to static-ish pages | Medium | Page files |
| 8.19 | Add Suspense boundaries for streaming SSR | Medium | Page files |
| 8.20 | Update seed script with realistic data (100+ users, 500+ events, 1000+ bets) | Medium | `prisma/seed.ts` |
| 8.21 | Document API endpoints (OpenAPI/Swagger) | Low | **NEW** `docs/api.md` |
| 8.22 | Update README with setup instructions, architecture overview | Low | `README.md` |
| 8.23 | Add GitHub Actions CI (lint, typecheck, test, build) | Medium | **NEW** `.github/workflows/ci.yml` |
| 8.24 | Configure Sentry source maps upload | Medium | `.github/workflows/ci.yml`, `next.config.ts` |

#### Database Impact

- None. All schema changes complete.

#### Frontend Impact

- Admin dashboard fully redesigned
- ISR on static pages (faster loads)
- Streaming SSR with Suspense (progressive loading)
- Analytics events tracked

#### Backend Impact

- All endpoints versioned under `/api/v1/`
- Cursor-based pagination on all lists
- Test coverage for critical financial flows
- CI/CD pipeline for automated quality checks

#### Risk Assessment

- **Risk:** Test setup might take longer than estimated
- **Mitigation:** Start with critical financial tests; skip low-value test coverage
- **Risk:** API versioning might confuse existing consumers
- **Mitigation:** Keep old `/api/` routes as aliases during transition

---

## Summary: Milestone Dependencies

```
M1: Security Fixes (2-3 days)
 |
 v
M2: Infrastructure (3-4 days)
 |
 +---> M6: UI Foundation (5-7 days) [can run in parallel with M3-M5]
 |
 v
M3: Service Layer (5-7 days)
 |
 +---> M4: Database Schema (3-4 days) [depends on M3]
 |       |
 |       v
 |     M5: Caching & Jobs (5-7 days) [depends on M2, M3, M4]
 |       |
 |       v
 |     M7: Feature Implementation (10-14 days) [depends on M3-M6]
 |       |
 |       v
 |     M8: Polish & Launch Prep (5-7 days) [depends on all]
```

**Critical path:** M1 -> M2 -> M3 -> M4 -> M5 -> M7 -> M8
**Parallel track:** M6 can start after M2 (runs parallel to M3-M5)

---

## Effort Summary

| Milestone | Days | Priority | Classification |
|-----------|------|----------|---------------|
| M1: Security Fixes | 2-3 | Critical | P0 |
| M2: Infrastructure | 3-4 | High | P1 |
| M3: Service Layer | 5-7 | High | P1 |
| M4: Database Schema | 3-4 | High | P1 |
| M5: Caching & Jobs | 5-7 | Medium | P2 |
| M6: UI Foundation | 5-7 | Medium | P2 |
| M7: Feature Implementation | 10-14 | Medium | P2 |
| M8: Polish & Launch Prep | 5-7 | Medium | P2 |
| **Total** | **39-53 days** | | |

With parallel execution (M6 alongside M3-M5): **35-47 working days** (~7-10 weeks)

---

## Safest Implementation Order

The milestones are ordered by a strict principle: **each milestone must leave the app in a better state than before, with zero regressions.**

### Why This Order

**M1 first (Security):** These are surgical fixes that close exploitable vulnerabilities. They don't change architecture, don't add new patterns, and don't touch existing working flows. A middleware check on admin routes and a one-line change in bet placement are the lowest-risk, highest-impact changes possible.

**M2 second (Infrastructure):** Adding Redis, Pino, and Sentry is purely additive. No existing code changes behavior. The logger replaces console.log but produces the same output. Redis client is created but not yet used by business logic. Sentry hooks into error boundaries silently.

**M3 third (Service Layer):** This is the highest-risk milestone because it refactors existing working code. However, it's done before M4-M7 so that all subsequent work builds on a clean architecture. The key safety measure: each service method should produce identical API responses to the current route handlers. Test by comparing responses.

**M4 fourth (Database):** Schema changes are done after the service layer exists, so new models can be immediately consumed by repositories. The data migration (User balance -> Wallet) is the riskiest single operation and is wrapped in a transaction with verification.

**M5 fifth (Caching & Jobs):** This replaces the fragile in-process systems with reliable infrastructure. It's safe because caching is write-through (reads fall back to DB on miss) and Inngest replaces cron without changing what jobs do.

**M6 parallel (UI Foundation):** This can start as soon as M2 is done because it's purely frontend. It doesn't depend on backend changes. The component library is installed, loading/error states are added, and mobile navigation is implemented. All additive.

**M7 seventh (Features):** New features are the safest to implement because they're additive. They don't modify existing code paths. New pages, new API routes, new services — all net-new.

**M8 last (Polish):** Testing, analytics, and documentation are done last because they validate the final state. Writing tests against the refactored code ensures correctness. CI/CD ensures future changes don't regress.

### Safety Guarantees at Each Milestone

| Milestone | Safety Check Before Deploy |
|-----------|---------------------------|
| M1 | Admin endpoint returns 403 for non-admins; bet placement reads odds from DB |
| M2 | App builds and runs identically; logs now structured; Sentry dashboard shows errors |
| M3 | All API responses identical to before; run `curl` tests against both old and new code paths |
| M4 | `prisma migrate status` shows all migrations applied; existing queries still work; balance sums match before/after |
| M5 | Cache miss falls back to DB; Inngest dashboard shows jobs running; settlement produces same results |
| M6 | All existing pages still render; loading skeletons appear; error boundaries catch thrown errors; mobile nav works |
| M7 | New features work independently; existing features unchanged |
| M8 | All tests pass; CI pipeline green; no Lighthouse regressions |

---

## Files Changed Per Milestone (Complete Inventory)

### M1: 5 files modified, 2 new
```
MODIFIED: prisma/schema.prisma, prisma/seed.ts, src/app/api/bets/route.ts,
          src/app/(dashboard)/admin/page.tsx, next.config.ts
NEW:      src/middleware.ts, src/lib/rateLimit.ts
```

### M2: 2 files modified, 4 new
```
MODIFIED: package.json, .env.example
NEW:      src/lib/redis.ts, src/lib/logger.ts, src/lib/sentry.ts, src/lib/errors.ts
          src/server/validators/common.validator.ts
          src/server/middleware/validation.middleware.ts
          src/server/middleware/error.middleware.ts
```

### M3: 13 files modified, ~25 new
```
MODIFIED: All 13 src/app/api/**/route.ts files
NEW:      14 service files, 8 repository files, 7 validator files
```

### M4: 2 files modified, 14+ new models
```
MODIFIED: prisma/schema.prisma, prisma/seed.ts
NEW:      prisma/migrations/ (multiple migration files)
```

### M5: 6 files modified, 6 new
```
MODIFIED: src/lib/data/engine/settlement.ts, orchestrator.ts, pipeline.ts,
          src/server/repositories/*.ts (caching), package.json, vercel.json
NEW:      src/lib/inngest.ts, src/app/api/inngest/route.ts,
          src/jobs/sync.jobs.ts, settlement.jobs.ts, leaderboard.jobs.ts,
          cleanup.jobs.ts, notification.jobs.ts, analytics.jobs.ts
DELETED:  src/lib/data/cron.ts
```

### M6: 3 files modified, ~30 new
```
MODIFIED: src/app/layout.tsx, src/app/(dashboard)/layout.tsx, package.json
NEW:      ~15 ui components, ~8 shared components, ~3 layout components,
          loading.tsx (3), error.tsx (4), not-found.tsx (1),
          RootProviders, MobileNavigation, DesktopNavigation,
          NotificationCenter, CommandPalette
```

### M7: ~10 files modified, ~50 new
```
MODIFIED: src/server/services/bet.service.ts, contest.service.ts,
          friendship.service.ts, src/app/(dashboard)/contests/**,
          src/app/(dashboard)/custom-bets/**
NEW:      ~40 feature components, ~8 new pages, ~10 new API routes,
          2 new services, 2 new repositories, search infrastructure
```

### M8: ~15 files modified, ~15 new
```
MODIFIED: package.json, next.config.ts, various page files
NEW:      vitest.config.ts, ~9 test files, e2e/ (2 spec files),
          src/lib/analytics.ts, .github/workflows/ci.yml,
          docs/api.md
```

---

*This roadmap is a living document. Reassess after each milestone. Adjust subsequent milestones based on lessons learned.*
