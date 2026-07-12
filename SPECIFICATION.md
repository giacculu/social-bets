# SocialBets v2.0 — Product & Technical Specification

**Version:** 2.0.0
**Date:** 2026-07-12
**Status:** Draft
**Scope:** Complete platform redesign from MVP to production-grade social sports prediction platform

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Product Philosophy](#2-product-philosophy)
3. [User Personas](#3-user-personas)
4. [User Flows](#4-user-flows)
5. [Information Architecture](#5-information-architecture)
6. [Navigation](#6-navigation)
7. [Page Hierarchy](#7-page-hierarchy)
8. [Complete UI Hierarchy](#8-complete-ui-hierarchy)
9. [Component Hierarchy](#9-component-hierarchy)
10. [Database Redesign](#10-database-redesign)
11. [Prisma Schema Redesign](#11-prisma-schema-redesign)
12. [Backend Architecture](#12-backend-architecture)
13. [Frontend Architecture](#13-frontend-architecture)
14. [Feature Organization](#14-feature-organization)
15. [Services](#15-services)
16. [Repository Layer](#16-repository-layer)
17. [Provider Layer](#17-provider-layer)
18. [Background Jobs](#18-background-jobs)
19. [Scheduler Architecture](#19-scheduler-architecture)
20. [Sync Architecture](#20-sync-architecture)
21. [Caching Architecture](#21-caching-architecture)
22. [Notification System](#22-notification-system)
23. [Activity Feed](#23-activity-feed)
24. [Prediction Feed](#24-prediction-feed)
25. [Contest Redesign](#25-contest-redesign)
26. [Friends Redesign](#26-friends-redesign)
27. [Reputation System](#27-reputation-system)
28. [Achievement System](#28-achievement-system)
29. [Analytics](#29-analytics)
30. [Search](#30-search)
31. [Mobile UX](#31-mobile-ux)
32. [Desktop UX](#32-desktop-ux)
33. [Accessibility](#33-accessibility)
34. [Security](#34-security)
35. [Future Scalability](#35-future-scalability)

---

## 1. Product Vision

### 1.1 Vision Statement

SocialBets is the platform where sports fans prove they know more than their friends.

It is not a sportsbook. The platform never takes the other side of a bet. Users compete against each other in prediction skill, and the platform earns a fixed fee on contest entry. The social experience — seeing what friends predict, competing on leaderboards, sharing winning streaks — is the product. Odds are content. Predictions are the currency. Community is the moat.

### 1.2 Positioning

SocialBets sits at the intersection of five categories:

| Category | Example | What We Take |
|----------|---------|-------------|
| Fantasy Sports | ESPN Fantasy, Yahoo Fantasy | Contest structure, season-long competition |
| Prediction Markets | Polymarket, Kalshi | Outcome-based thinking, probability literacy |
| Social Sports | Strafe, BetBull | Community features, friend competition |
| Social Networks | Strava, Letterboxd | Activity feeds, public profiles, achievements |
| Discord/Reddit | Sports subreddits, Discord servers | Community texture, banter, shared experience |

We do NOT take from:
- Sportsbooks (DraftKings, Bet365): We have no house edge on odds, no in-play betting, no cashout mechanics
- Crypto prediction markets: We are fiat-native, regulation-friendly, skill-first

### 1.3 Core Metrics (North Star)

| Metric | Definition | Target (Year 1) |
|--------|-----------|-----------------|
| **Weekly Active Predictors** | Users who place >=1 prediction per week | 50,000 |
| **Social Density** | % of users with >=3 friends on platform | 40% |
| **Prediction Depth** | Avg predictions per user per event week | 8.5 |
| **Contest Participation** | % of WAU in at least 1 active contest | 25% |
| **D1/D7 Retention** | Day 1 / Day 7 return rate | 60% / 35% |

### 1.4 Revenue Model

| Stream | Mechanism | Margin |
|--------|-----------|--------|
| Contest Entry Fees | 10% platform fee on entry fee | Primary (~80%) |
| Premium Subscription (Future) | Ad-free, advanced stats, exclusive contests | Secondary (~15%) |
| Sponsored Contests (Future) | Brands create branded prediction contests | Tertiary (~5%) |

The platform fee is transparent and fixed. Users always see: "Entry: EUR 10 | Prize Pool: EUR 9 | Platform Fee: EUR 1 (10%)". This transparency is a trust differentiator.

### 1.5 Non-Goals (v2.0)

- Real-money sports betting (regulatory nightmare, not our model)
- Crypto/blockchain integration
- Live in-play predictions (deferred to v2.5 — requires real-time infrastructure)
- White-label solution for third parties
- AI-generated predictions (we surface human predictions, not replace them)

---

## 2. Product Philosophy

### 2.1 Principles

**1. Social First, Predictions Second**

Every feature must answer: "Does this make users interact with each other?" If a feature only serves individual prediction-making without a social dimension, it doesn't ship. The leaderboard is not a ranking — it's a conversation starter. The activity feed is not a log — it's a reason to come back.

**2. Skill Over Luck**

The platform must reward knowledge, research, and consistency — not gambling instincts. This means:
- No in-play/live betting (prevents impulse decisions)
- No "boosted odds" or promotional manipulation
- Contests reward sustained performance over single events
- Leaderboards use season-long metrics, not daily swings

**3. Transparency as Trust**

Every fee, every odds calculation, every settlement is visible to users. The platform fee is displayed before every contest entry. Odds show their source and confidence. Settlement explains why a prediction was correct or incorrect. Trust is earned through openness, not marketing.

**4. Community Over Content**

Reddit survives because of comments. Strava survives because of kudos. Letterboxd survives because of lists. SocialBets survives because of the prediction conversation. Users should be able to:
- See what friends are predicting before a match
- React to bold predictions
- Discuss why they think a team will win
- Celebrate or commiserate after results

**5. Mobile-First, Desktop-Complete**

The primary experience is a mobile app (eventual React Native). The web experience must be excellent on mobile browsers. Desktop is a power-user experience with more data density but never a requirement.

### 2.2 What We Are NOT

| We Are | We Are Not |
|--------|-----------|
| A game of skill | A casino |
| A social network about sports | A sports news site |
| A prediction community | A tipping service |
| A contest platform | A lottery |
| An odds comparison tool | A betting exchange |

### 2.3 Design Language

- **Color:** Dark mode primary (gray-950 background), emerald-500 accent for positive actions, amber-500 for warnings, red-500 for destructive/negative
- **Typography:** Inter for UI, JetBrains Mono for numbers/odds
- **Tone:** Confident but not arrogant. Knowledgeable but not elitist. Playful but not frivolous.
- **Motion:** Subtle. Balance changes animate. Bet slip slides in. Success states feel rewarding. No gratuitous animation.
- **Language:** Italian for Italian market. i18n-ready architecture for expansion.

---

## 3. User Personas

### 3.1 Marco — The Casual Fan

| Attribute | Detail |
|-----------|--------|
| Age | 28 |
| Occupation | Marketing manager |
| Sports knowledge | Watches Serie A on weekends, follows NBA casually |
| Platform usage | 3-4 sessions/week, mostly around matchdays |
| Motivation | Compete with friends, prove he knows football |
| Pain point | "I always say I should've predicted that" |
| Feature affinity | Quick predictions, leaderboard, friend challenges |
| Revenue potential | Enters 2-3 contests/month (EUR 5-10 entry) |

**Design implications:** Marco needs fast prediction flows (tap-tap-done), clear visual feedback, and social proof that his friends are also active. He won't read analytics dashboards. He will share a big win on Instagram.

### 3.2 Giulia — The Data Nerd

| Attribute | Detail |
|-----------|--------|
| Age | 32 |
| Occupation | Data analyst |
| Sports knowledge | Follows tennis and football deeply, reads stats |
| Platform usage | Daily during season, checks odds movements |
| Motivation | Prove her analytical approach beats gut feeling |
| Pain point | "Most platforms don't give me enough data to work with" |
| Feature affinity | Analytics dashboard, value bet detection, historical performance |
| Revenue potential | Higher contest entries (EUR 20-50), subscribes to premium |

**Design implications:** Giulia needs data density, charts, and the ability to filter/sort by any metric. She's the power user who validates the platform's credibility. If the data is good enough for Giulia, it's good enough for everyone.

### 3.3 Luca — The Social Butterfly

| Attribute | Detail |
|-----------|--------|
| Age | 24 |
| Occupation | University student |
| Sports knowledge | Surface-level, follows trending matches |
| Platform usage | Multiple times daily, very social |
| Motivation | Being part of the group, the banter, the shared experience |
| Pain point | "I just want to be in the group chat when results come in" |
| Feature affinity | Activity feed, friend challenges, chat/discussion, achievements |
| Revenue potential | Low individual spend but high viral coefficient (brings 5+ friends) |

**Design implications:** Luca is the growth engine. Every feature must be shareable. Notifications must bring him back. The friend onboarding flow must be frictionless. He doesn't care about odds — he cares about the group.

### 3.4 Alessandro — The Competitive Analyst

| Attribute | Detail |
|-----------|--------|
| Age | 35 |
| Occupation | Finance professional |
| Sports knowledge | Deep across multiple sports |
| Platform usage | Strategic, daily during active seasons |
| Motivation | Long-term ranking, reputation, being recognized as an expert |
| Pain point | "I want my track record to be visible and credible" |
| Feature affinity | Reputation system, season rankings, prediction history, analytics |
| Revenue potential | High contest entries, premium subscriber, brand ambassador |

**Design implications:** Alessandro needs a public profile that serves as a credential. His prediction history must be immutable and verifiable. He's the user who makes the leaderboard meaningful and attracts new users through reputation.

### 3.5 Maria — The Newcomer

| Attribute | Detail |
|-----------|--------|
| Age | 22 |
| Occupation | Recent graduate |
| Sports knowledge | Limited, learning |
| Platform usage | Infrequent at first, growing |
| Motivation | Friends are on it, wants to learn |
| Pain point | "I don't know enough to compete with experienced users" |
| Feature affinity | Guided predictions, beginner contests, educational content |
| Revenue potential | Low initially, high lifetime value if retained |

**Design implications:** Maria is the hardest user to retain. She needs:
- A beginner-friendly onboarding that doesn't assume knowledge
- Beginner-only contests where she won't get crushed
- Visual explanations of what odds mean
- A "learning mode" that shows her how she could have predicted better
- Social reinforcement from friends who are already active

---

## 4. User Flows

### 4.1 Registration & Onboarding

```
Landing Page
  +-- [Sign Up with Email]
  |     +-- Email + Password + Username
  |     +-- Optional: Enter referral code (from ?ref= URL param)
  |     +-- Welcome screen: "You received 10,000 SocialCoins!"
  |     +-- Sport selection: "Which sports do you follow?" (multi-select)
  |     +-- Suggested friends: "Find friends by username" (skip if no referrals)
  |     +-- First prediction: "Pick a match to predict!" (guided)
  |
  +-- [Sign Up with Google] (Future)
        +-- Auto-username from email, ask to customize
        +-- Continue as above

Key decisions:
- Referral code auto-adds friend relationship AND gives 500 bonus to referrer
- Sport selection personalizes the home feed (not the entire app)
- Guided first prediction reduces time-to-value to <60 seconds
- Skip is always available — never force completion
```

### 4.2 Daily Prediction Flow

```
Push Notification: "3 matches start in 2 hours — have you predicted?"
  |
  +-- Open App -> Home Feed
  |     +-- See today's events grouped by sport
  |     +-- See friends' predictions (anonymized until lock time)
  |     +-- Tap match -> Prediction Card
  |
  |   Prediction Card:
  |     +-- Market selector (Match Result / O/U / BTTS / etc.)
  |     +-- Outcome buttons with current odds
  |     +-- Confidence slider (optional, affects leaderboard weighting)
  |     +-- "Share Prediction" toggle (shows in friends' feed)
  |     +-- [Submit Prediction]
  |
  +-- Confirmation: "Prediction locked! Inter to win @ 2.10"
  |     +-- View in "My Predictions" tab
  |     +-- See friends' predictions for same match
  |
  +-- Post-match (automatic):
        +-- Push notification: "Inter won! Your prediction was correct!"
        +-- Balance updated, transaction recorded
        +-- Leaderboard position updated

Key decisions:
- Predictions are placed with virtual currency (SocialCoins), not real money
- Only contests involve real money
- Confidence slider adds strategic depth without complicating the core flow
- "Share Prediction" is opt-in to respect privacy
- Settlement is automatic — no manual action required
```

### 4.3 Contest Flow

```
Discovery:
  +-- Home feed shows "Featured Contests" section
  +-- Dedicated "Contests" tab with filters (sport, entry fee, time remaining)
  +-- Friend's contest entry appears in activity feed

Joining:
  +-- Tap contest -> See full details:
  |     +-- Title, description, rules
  |     +-- Entry fee (real money), prize pool breakdown
  |     +-- Current participants (avatars, count)
  |     +-- Start/end times
  |     +-- Predictions required (which matches, which markets)
  +-- [Join Contest] -> Confirm entry fee
  |     +-- "Entry: EUR 5 | Prize Pool: EUR 45 (9 players x EUR 5 x 90%) | Fee: EUR 5"
  |     +-- Real wallet deduction + transaction record
  +-- Contest dashboard shows:
        +-- My predictions vs. other participants
        +-- Live standings (ranking by correct predictions)
        +-- Chat/discussion for this contest

Completion:
  +-- Auto-settlement after last match in contest concludes
  +-- Prize distribution to top N participants
  +-- Results shared in activity feed
  +-- Winner announcement with stats

Key decisions:
- Contest entries use REAL money (separate from SocialCoins)
- Platform fee is transparent and shown before confirmation
- Predictions within contests are visible to all participants (transparency)
- Auto-settlement eliminates manual admin work
- Prize distribution uses atomic transactions
```

### 4.4 Custom Challenge Flow

```
Initiation:
  +-- User A creates challenge: "Barcelona vs Real Madrid — who wins?"
  |     +-- Title, description, deadline
  |     +-- Stake (SocialCoins): 500
  |     +-- Invite friends (search by username)
  |     +-- [Create Challenge]
  |
  +-- Invited friends receive push notification
  |     +-- "Marco challenged you: Barcelona vs Real Madrid"
  |     +-- See stake amount and deadline
  |     +-- [Accept] or [Decline]
  |
  +-- All participants submit predictions before deadline
  |     +-- Predictions are hidden until deadline (prevents copying)
  |     +-- Can modify prediction until deadline
  |
  +-- After match:
        +-- Predictions revealed to all participants
        +-- Winner determined (most accurate prediction)
        +-- Stake transferred from losers to winner
        +-- Results posted in friends' activity feed
        +-- Achievement: "Challenge Won" badge

Key decisions:
- Custom challenges use SocialCoins only (no real money between users)
- Predictions are locked and hidden until deadline (anti-copying)
- Stakes are deducted upfront and held in escrow
- Challenges are the viral mechanic — shareable, personal, competitive
```

### 4.5 Social Interaction Flow

```
Friend Discovery:
  +-- Search by username
  +-- Import contacts (future)
  +-- "People you may know" (based on mutual friends, shared sports)
  +-- QR code scan (mobile app, future)

Friend Request:
  +-- Send request -> Notification to recipient
  +-- Accept -> Both appear in each other's friend lists
  +-- Decline -> No notification to sender (prevents awkwardness)
  +-- Block -> Prevents all interaction, no notification

Social Feed:
  +-- See friends' predictions (anonymized before lock time)
  +-- See friends' contest entries
  +-- See friends' challenge activity
  +-- See big wins and streaks
  +-- React (emoji) to predictions and results

Profile:
  +-- Public prediction history (immutable)
  +-- Win rate, ROI, favorite sports
  +-- Achievements and badges
  +-- Head-to-head records vs. specific friends
  +-- "Follow" for public profiles (future)
```

---

## 5. Information Architecture

### 5.1 Site Map

```
SocialBets
+-- Public
|   +-- Landing / Marketing
|   +-- Login
|   +-- Register
|   +-- Forgot Password (future)
|   +-- Terms of Service
|   +-- Privacy Policy
|   +-- Sport Rules (per sport)
|
+-- Dashboard (Authenticated)
|   +-- Home Feed
|   |   +-- Today's Events
|   |   +-- Friends' Activity
|   |   +-- Featured Contests
|   |   +-- Trending Predictions
|   |
|   +-- Sports
|   |   +-- Sport Overview (Calcio, Basket, Tennis, F1, MMA)
|   |   +-- League Detail (Serie A, NBA, ATP, etc.)
|   |   +-- Event Detail
|   |       +-- Markets & Outcomes
|   |       +-- Predictions (public/anonymized)
|   |       +-- Statistics
|   |       +-- Discussion
|   |
|   +-- My Predictions
|   |   +-- Active (pending results)
|   |   +-- History (settled)
|   |   +-- Statistics (personal analytics)
|   |
|   +-- Contests
|   |   +-- Browse (open, upcoming, completed)
|   |   +-- My Contests (joined, created)
|   |   +-- Create Contest
|   |   +-- Contest Detail
|   |       +-- Standings
|   |       +-- Predictions
|   |       +-- Discussion
|   |
|   +-- Challenges (Custom Bets)
|   |   +-- Active Challenges
|   |   +-- Challenge History
|   |   +-- Create Challenge
|   |
|   +-- Friends
|   |   +-- Friends List
|   |   +-- Friend Requests
|   |   +-- Find Friends
|   |   +-- Friend Profile
|   |
|   +-- Leaderboard
|   |   +-- Global
|   |   +-- Friends Only
|   |   +-- By Sport
|   |   +-- By Period (week/month/season/all-time)
|   |
|   +-- Wallet
|   |   +-- SocialCoins Balance
|   |   +-- Real Balance
|   |   +-- Deposit
|   |   +-- Withdraw
|   |   +-- Transaction History
|   |
|   +-- Profile
|   |   +-- My Profile (editable)
|   |   +-- Prediction History
|   |   +-- Statistics & Analytics
|   |   +-- Achievements
|   |   +-- Settings
|   |
|   +-- Activity Feed
|   |   +-- Friends' Activity
|   |   +-- Global Trending
|   |   +-- Sport-specific Feed
|   |
|   +-- Notifications
|       +-- Push notification settings
|       +-- In-app notification center
|
+-- Admin
|   +-- Dashboard (system status)
|   +-- User Management
|   +-- Content Moderation
|   +-- Data Pipeline Control
|   +-- Settlement Management
|   +-- Analytics & Reports
|
+-- API
    +-- /api/v1/auth/*
    +-- /api/v1/predictions/*
    +-- /api/v1/contests/*
    +-- /api/v1/challenges/*
    +-- /api/v1/friends/*
    +-- /api/v1/wallet/*
    +-- /api/v1/leaderboard/*
    +-- /api/v1/feed/*
    +-- /api/v1/search/*
    +-- /api/v1/notifications/*
    +-- /api/v1/admin/*
    +-- /api/v1/webhooks/*
```

### 5.2 Content Hierarchy

```
Level 0: Platform
  +-- Level 1: Sport (Calcio, Basket, Tennis, F1, MMA)
    +-- Level 2: League (Serie A, NBA, ATP, etc.)
      +-- Level 3: Event (Inter vs Milan)
        +-- Level 4: Market (Match Result, O/U 2.5, BTTS)
          +-- Level 5: Outcome (Home, Draw, Away)

Cross-cutting:
  User -> Predictions (link to Event + Market + Outcome)
  User -> Contest Entries (link to Contest -> Events)
  User -> Challenges (link to other Users + Events)
  User -> Friends (graph)
  User -> Activity Feed Entries
  User -> Achievements
  User -> Leaderboard Entries (by period)
```

---

## 6. Navigation

### 6.1 Mobile Navigation (Primary)

**Bottom Tab Bar (5 tabs):**

```
+-------------------------------------------------------+
|  Home    Sports    Contests    Social    Profile       |
+-------------------------------------------------------+
```

| Tab | Label | Badge | Content |
|-----|-------|-------|---------|
| Home | Home | Unread notifications count | Today's events, friends' activity, featured contests |
| Sports | Sport | Live events count | Sports -> Leagues -> Events drill-down |
| Contests | Contests | Active contests count | Browse/My Contests, Create button |
| Social | Social | Friend requests count | Friends, Activity Feed, Challenges |
| Me | Profilo | — | Profile, Wallet, Settings, Achievements |

**Why this structure:**
- 5 tabs is the maximum for thumb-friendly navigation (Apple HIG, Material Design)
- "Home" is the catch-all for discovery — matches the behavior of checking the app
- "Social" combines friends, activity feed, and challenges — the social hub
- "Contests" gets its own tab because it's the primary revenue driver
- "Me" replaces a separate profile/settings/wallet flow — everything personal in one place
- Badges create urgency and drive re-engagement

### 6.2 Desktop Navigation

**Top Navigation Bar + Collapsible Left Sidebar:**

```
+------------------------------------------------------------------------+
| [Logo] [Home] [Sports] [Contests] [Challenges] [Friends]              |
|                                    [Notifications] [Wallet] [Profile]  |
+----------+-------------------------------------------------------------+
| Sidebar  |                                                             |
|          |                                                             |
| Sports   |              Main Content Area                              |
| + Calcio |                                                             |
| | + Ser.A|                                                             |
| | + PL   |                                                             |
| + Basket |                                                             |
| | + NBA  |                                                             |
| + Tennis |                                                             |
| + F1     |                                                             |
| + MMA    |                                                             |
|          |                                                             |
| -------- |                                                             |
| My Bets  |                                                             |
| Leaderbd |                                                             |
| Wallet   |                                                             |
| Settings |                                                             |
+----------+-------------------------------------------------------------+
```

**Why this structure:**
- Top nav handles primary navigation (same items as mobile tabs)
- Sidebar provides deep sport/league navigation without leaving current context
- Sidebar is persistent (no page reload to browse different sports)
- Wallet badge in header provides constant balance awareness
- Notification bell with count badge in header

### 6.3 Navigation Rules

1. **Back behavior:** Mobile uses native back gesture/button. Desktop uses breadcrumb trail.
2. **Active state:** Current section highlighted in both top nav and sidebar.
3. **Deep links:** Every page has a unique URL that can be shared and bookmarked.
4. **Keyboard navigation:** All interactive elements focusable via Tab. Keyboard shortcuts for power users (Cmd+K for search).
5. **Auth guard:** All routes except `/`, `/login`, `/register`, `/terms`, `/privacy` require authentication. Middleware enforces this.

---

## 7. Page Hierarchy

### 7.1 Page Inventory

| Page | Route | Auth | Type | Description |
|------|-------|------|------|-------------|
| Landing | `/` | No | Server | Marketing page with stats, CTA |
| Login | `/login` | No | Client | Email/password + OAuth |
| Register | `/register` | No | Client | Registration with referral |
| Terms | `/terms` | No | Static | Terms of service |
| Privacy | `/privacy` | No | Static | Privacy policy |
| **Home Feed** | `/home` | Yes | Server+Client | Today's events, activity, featured contests |
| **Sports Overview** | `/sports` | Yes | Server | All sports with leagues |
| League Detail | `/sports/[sport]/[league]` | Yes | Server+Client | Events, predictions, bet slip |
| Event Detail | `/sports/[sport]/[league]/[event]` | Yes | Server+Client | Full event page with all markets, stats, discussion |
| **My Predictions** | `/predictions` | Yes | Server | Active + history tabs |
| Prediction Stats | `/predictions/stats` | Yes | Server+Client | Personal analytics |
| **Contests** | `/contests` | Yes | Server | Browse all contests |
| My Contests | `/contests/mine` | Yes | Server | Joined + created |
| Create Contest | `/contests/new` | Yes | Client | Contest creation form |
| Contest Detail | `/contests/[id]` | Yes | Server+Client | Standings, predictions, discussion |
| **Challenges** | `/challenges` | Yes | Server | Active + history |
| Create Challenge | `/challenges/new` | Yes | Client | Challenge creation form |
| Challenge Detail | `/challenges/[id]` | Yes | Server+Client | Predictions, results, chat |
| **Friends** | `/friends` | Yes | Server+Client | Friends list, requests, search |
| Friend Profile | `/profile/[username]` | Yes | Server | Public profile of another user |
| **Leaderboard** | `/leaderboard` | Yes | Server | Global rankings with filters |
| **Activity Feed** | `/feed` | Yes | Server+Client | Friends' and global activity |
| **My Profile** | `/profile` | Yes | Server+Client | Edit profile, stats, achievements |
| **Wallet** | `/wallet` | Yes | Server | Balances, deposit, withdraw, history |
| Deposit | `/wallet/deposit` | Yes | Client | Deposit form |
| Withdraw | `/wallet/withdraw` | Yes | Client | Withdraw form |
| **Notifications** | `/notifications` | Yes | Server+Client | Notification center |
| Settings | `/settings` | Yes | Client | Account, notifications, privacy, theme |
| **Admin Dashboard** | `/admin` | Admin | Server | System status |
| Admin Users | `/admin/users` | Admin | Server+Client | User management |
| Admin Content | `/admin/content` | Admin | Server+Client | Moderation |
| Admin Pipeline | `/admin/pipeline` | Admin | Server+Client | Data sync control |
| Admin Settlement | `/admin/settlement` | Admin | Server+Client | Settlement management |
| Admin Analytics | `/admin/analytics` | Admin | Server+Client | Platform analytics |

### 7.2 Page Groups

**Public Group (no auth):**
Landing, Login, Register, Terms, Privacy

**Core Group (auth required):**
Home Feed, Sports, My Predictions, Leaderboard

**Social Group (auth required):**
Friends, Activity Feed, Challenges, Notifications

**Monetization Group (auth required):**
Contests, Wallet

**Personal Group (auth required):**
Profile, Settings

**Admin Group (admin role required):**
All `/admin/*` pages

---

## 8. Complete UI Hierarchy

### 8.1 Root Layout

```
<html lang="it" class="dark">
  <body>
    <Providers>                          <!-- Theme, Auth, Query, Toast, WebSocket -->
      <Toaster />                        <!-- Global toast notifications -->
      <DesktopNav />                     <!-- Top nav bar (hidden on mobile) -->
      <MobileNav />                      <!-- Bottom tab bar (hidden on desktop) -->
      <NotificationCenter />             <!-- Slide-over notification panel -->
      <CommandPalette />                 <!-- Cmd+K search overlay -->
      {children}
    </Providers>
  </body>
</html>
```

### 8.2 Public Pages

```
Landing Page (/)
+-- PublicHeader (logo, login/register buttons)
+-- HeroSection (headline, CTA, animated stats)
+-- HowItWorksSection (3-step explanation)
+-- StatsBar (users, predictions, contests — live from API)
+-- TestimonialsSection (social proof)
+-- SportsShowcase (popular sports/leagues)
+-- CTASection (final conversion push)
+-- PublicFooter (links, legal, social)

Login Page (/login)
+-- AuthLayout (centered card)
+-- Logo
+-- EmailInput
+-- PasswordInput
+-- RememberMe checkbox
+-- [Sign In] button
+-- "Forgot password?" link (future)
+-- Divider ("or")
+-- [Sign in with Google] button (future)
+-- "Don't have an account? Sign up" link

Register Page (/register)
+-- AuthLayout (centered card)
+-- Logo
+-- NameInput
+-- UsernameInput (with availability check)
+-- EmailInput
+-- PasswordInput (with strength indicator)
+-- ConfirmPasswordInput
+-- InviteCodeInput (pre-filled from ?ref= URL)
+-- [Create Account] button
+-- Terms acceptance checkbox
+-- "Already have an account? Sign in" link
```

### 8.3 Dashboard Pages

```
Home Feed (/home)
+-- WelcomeHeader ("Ciao, Marco!")
+-- QuickActionsRow
|   +-- [Place Prediction] CTA (if no predictions today)
|   +-- [Join Contest] CTA (if no active contests)
+-- TodaysEventsSection
|   +-- SectionHeader ("Oggi" + event count)
|   +-- EventCard[] (horizontal scroll on mobile, grid on desktop)
|       +-- LeagueBadge (logo + name)
|       +-- TeamNames + Score (if live/finished)
|       +-- StartTime
|       +-- OddsSnapshot (top market odds)
|       +-- FriendsPredicting count
|       +-- [Predict] button
+-- FriendsActivitySection
|   +-- SectionHeader ("Amici" + "Vedi tutto" link)
|   +-- ActivityItem[] (compact feed)
|       +-- Avatar + Username
|       +-- Action text ("ha predetto Inter vince")
|       +-- TimeAgo
|       +-- Reaction buttons
+-- FeaturedContestsSection
|   +-- SectionHeader ("Contest in evidenza")
|   +-- ContestCard[] (horizontal scroll)
|       +-- Title
|       +-- EntryFee + PrizePool
|       +-- PlayerCount/MaxPlayers
|       +-- TimeRemaining
|       +-- [Join] button
+-- TrendingPredictionsSection
    +-- SectionHeader ("Predizioni del momento")
    +-- TrendingCard[] (popular predictions across platform)

Sports Overview (/sports)
+-- SportsFilterTabs (Calcio | Basket | Tennis | F1 | MMA | All)
+-- LeagueGrid
|   +-- LeagueCard[] (grouped by sport)
|   |   +-- LeagueLogo + Name + Country
|   |   +-- EventCount ("8 eventi")
|   |   +-- UpcomingBadge (next event time)
|   +-- EmptyState (no events for this sport)
+-- QuickLinks ("Contests for this sport" -> filtered contests)

League Detail (/sports/[sport]/[league])
+-- LeagueHeader (logo, name, country, season)
+-- EventFilterTabs (Upcoming | Live | Finished)
+-- EventList
|   +-- EventCard[]
|   |   +-- StatusBadge (UPCOMING/LIVE/FINISHED)
|   |   +-- TeamHome + TeamAway (+ scores if applicable)
|   |   +-- StartTime
|   |   +-- MarketTabs (Match Result | O/U | BTTS)
|   |   +-- OutcomeButtons[] (with odds)
|   |   +-- FriendsPredicting count
|   |   +-- [Details] link -> Event Detail
|   +-- EmptyState
+-- BetSlipPanel (sticky sidebar on desktop, bottom sheet on mobile)

Event Detail (/sports/[sport]/[league]/[event])
+-- EventHeader
|   +-- StatusBadge
|   +-- TeamHome vs TeamAway
|   +-- Scores (if live/finished)
|   +-- StartTime
|   +-- Venue
+-- MarketTabs
|   +-- Match Result market
|   |   +-- OutcomeButton[] (Home/Draw/Away + odds)
|   +-- Over/Under market
|   |   +-- OutcomeButton[] (Over/Under + line + odds)
|   +-- BTTS market
|   |   +-- OutcomeButton[] (Yes/No + odds)
|   +-- More markets (expandable)
+-- FriendsPredictionsSection
|   +-- "What your friends think" header
|   +-- FriendPrediction[] (avatar + prediction, anonymized before lock)
+-- StatsSection
|   +-- Head-to-head record
|   +-- Recent form (last 5)
|   +-- Key stats
+-- DiscussionSection
|   +-- CommentInput
|   +-- CommentThread[]
+-- BetSlipPanel (persistent)

My Predictions (/predictions)
+-- Tabs: Active | History | Stats
+-- ActivePredictions
|   +-- FilterBar (sport, league, date range)
|   +-- PredictionCard[]
|       +-- Event (teams, time, status)
|       +-- Market + Outcome selected
|       +-- Stake + Potential Win
|       +-- Confidence (if set)
|       +-- Status (pending/locked/settled)
+-- PredictionHistory
|   +-- FilterBar (result: Won/Lost/All, date range)
|   +-- SortBar (date, profit, odds)
|   +-- PredictionCard[] (settled, with result)
+-- PredictionStats
    +-- SummaryCards (total, win rate, ROI, profit)
    +-- SportBreakdown chart
    +-- MarketBreakdown chart
    +-- WinRateOverTime chart
    +-- BestStreak / CurrentStreak
    +-- ValueBetsDetected count

Contests (/contests)
+-- Tabs: Open | My Contests | Completed
+-- FilterBar
|   +-- SportFilter
|   +-- EntryFeeRange (slider)
|   +-- TimeRemaining
|   +-- SortBy (prize pool, time, participants)
+-- ContestCardGrid
|   +-- ContestCard[]
|   |   +-- Title
|   |   +-- Description (truncated)
|   |   +-- EntryFee -> PrizePool breakdown
|   |   +-- PlayerCount/MaxPlayers + progress bar
|   |   +-- TimeRemaining countdown
|   |   +-- Creator avatar + name
|   |   +-- LinkedEvent (if any)
|   |   +-- StatusBadge (OPEN/LOCKED/IN_PROGRESS/COMPLETED)
|   |   +-- ActionButton (Join/View/Full)
|   +-- EmptyState ("No contests found. Create one!")
+-- [Create Contest] FAB (floating, mobile) / Button (desktop)
+-- CreateContestWizard (see 8.4)

Friends (/friends)
+-- Tabs: Friends | Requests | Find
+-- FriendsTab
|   +-- SearchInput
|   +-- FriendCard[]
|   |   +-- Avatar + Username
|   |   +-- Win rate badge
|   |   +-- Last active
|   |   +-- Head-to-head record
|   |   +-- [Challenge] button
|   +-- EmptyState
+-- RequestsTab
|   +-- IncomingRequest[]
|   |   +-- Avatar + Username + mutual friends
|   |   +-- [Accept] [Decline]
|   +-- OutgoingRequest[] (pending)
+-- FindTab
    +-- SearchInput (by username)
    +-- SuggestedFriends[] (mutual friends, shared sports)
    +-- QRCodeScanner (future)

Leaderboard (/leaderboard)
+-- PeriodTabs (This Week | This Month | Season | All Time)
+-- SportFilter (All | Calcio | Basket | Tennis | F1 | MMA)
+-- ScopeTabs (Global | Friends Only)
+-- TopThreePodium
|   +-- #2 Card (silver)
|   +-- #1 Card (gold, center, larger)
|   +-- #3 Card (bronze)
+-- RankingTable
|   +-- Rank | User | Win Rate | Profit | Predictions | Streak
|   +-- Current user highlighted row
|   +-- Pagination (cursor-based, 50 per page)
+-- MyRankBar (sticky bottom, shows current position)

Activity Feed (/feed)
+-- ScopeTabs (Friends | Global | Sport-specific)
+-- FeedFilters (Predictions | Contests | Challenges | Wins | All)
+-- FeedItem[]
|   +-- ItemHeader (avatar, username, action, time)
|   +-- ItemContent (prediction details, contest result, etc.)
|   +-- ItemFooter (reactions, comments count)
|   +-- ReactionBar (thumbs up, fire, laugh, wow + custom)
+-- InfiniteScroll / LoadMore

Wallet (/wallet)
+-- BalanceCards
|   +-- SocialCoinsCard (virtual currency)
|   |   +-- Balance
|   |   +-- [Get More] button (daily bonus, achievements)
|   |   +-- Recent change indicator
|   +-- RealBalanceCard (real money)
|       +-- Balance
|       +-- [Deposit] button
|       +-- [Withdraw] button
+-- TransactionTabs: Virtual | Real
+-- TransactionList
|   +-- TransactionItem[]
|   |   +-- TypeBadge (BET_WON, BET_LOST, CONTEST_ENTRY, etc.)
|   |   +-- Amount (+/-, color-coded)
|   |   +-- BalanceAfter
|   |   +-- Description
|   |   +-- Timestamp
|   +-- Pagination (cursor-based)
+-- InfoCard
+-- QuickActions (Deposit / Withdraw / Daily Bonus)

Settings (/settings)
+-- AccountSection
|   +-- ChangeAvatar
|   +-- ChangeDisplayName
|   +-- ChangeUsername (with confirmation)
|   +-- ChangeEmail
|   +-- ChangePassword
+-- NotificationPreferences
|   +-- PushNotifications toggle
|   +-- EmailNotifications toggle
|   +-- Per-type toggles (BetResults, Contests, Social, etc.)
|   +-- Quiet hours settings
+-- PrivacySettings
|   +-- ProfileVisibility (public/friends/private)
|   +-- ShowPredictions toggle
|   +-- ShowStatistics toggle
+-- Appearance
|   +-- Theme (Dark/Light/System)
|   +-- Language (Italian/English — future)
+-- DangerousZone
|   +-- [Export Data] button
|   +-- [Delete Account] button (with confirmation)
+-- AppInfo (version, terms, privacy, support)
```

### 8.4 Create Contest Wizard

```
Step 1: Basic Info
+-- TitleInput (required, 5-100 chars)
+-- DescriptionInput (optional, 500 char max)
+-- SportSelect (Calcio, Basket, etc.)
+-- [Next]

Step 2: Rules
+-- EntryFeeInput (EUR 1-500, with presets: EUR 5, EUR 10, EUR 20, EUR 50)
+-- MaxPlayersInput (2-100, default 10)
+-- PredictionsRequired (which markets, multi-select)
|   +-- Match Result
|   +-- Over/Under 2.5
|   +-- BTTS
|   +-- More (expandable)
+-- PrizePoolPreview (dynamic calculation)
|   +-- "Entry: EUR 10 x 10 players = EUR 100"
|   +-- "Prize Pool: EUR 90 (90%)"
|   +-- "Platform Fee: EUR 10 (10%)"
+-- [Next]

Step 3: Events
+-- EventSelector
|   +-- CalendarView (date picker)
|   +-- EventList[] (filterable by league)
|   +-- SelectedEvents[] (with remove button)
+-- StartTimeInput (auto-set to first event)
+-- EndTimeInput (auto-set to last event + 1h)
+-- [Create Contest]

Step 4: Confirmation
+-- SummaryCard (all details)
+-- FeeBreakdown
+-- [Confirm & Publish]
+-- ShareOptions (copy link, share to friends)
```

---

## 9. Component Hierarchy

### 9.1 Component Architecture Principles

1. **Atomic Design:** Primitive -> Compound -> Feature -> Page
2. **Server/Client Split:** Server components fetch data, client components handle interaction
3. **Composition over Configuration:** Prefer small composable components over large configurable ones
4. **Colocation:** Co-locate related components next to their page unless shared across 2+ pages
5. **No prop drilling > 2 levels:** Use React Context or composition patterns

### 9.2 Component Inventory

```
src/components/
+-- ui/                              # Design system primitives
|   +-- Button.tsx                   # Primary, Secondary, Ghost, Danger, sizes
|   +-- Input.tsx                    # Text, Number, Search, with validation state
|   +-- Select.tsx                   # Dropdown with search
|   +-- Badge.tsx                    # Status, Count, Sport
|   +-- Card.tsx                     # Container with optional header/footer
|   +-- Avatar.tsx                   # Image, initials, group stack
|   +-- Modal.tsx                    # Dialog, confirmation, bottom sheet (mobile)
|   +-- Toast.tsx                    # Success, error, info notifications
|   +-- Tabs.tsx                     # Tab group with active indicator
|   +-- Dropdown.tsx                 # Action menus
|   +-- Tooltip.tsx                  # Hover/focus information
|   +-- Skeleton.tsx                 # Loading placeholders
|   +-- Spinner.tsx                  # Inline loading indicator
|   +-- EmptyState.tsx               # No data placeholder
|   +-- ErrorState.tsx               # Error with retry
|   +-- Toggle.tsx                   # Switch control
|   +-- Slider.tsx                   # Range input
|   +-- DatePicker.tsx               # Date selection
|   +-- Progress.tsx                 # Linear/circular progress
|   +-- Separator.tsx                # Visual divider
|   +-- ScrollArea.tsx               # Custom scrollbar container
|   +-- Popover.tsx                  # Floating content anchor
|   +-- Command.tsx                  # Cmd+K command palette
|   +-- FormField.tsx                # Label + Input + Error + Helper text
|
+-- layout/                          # App shell components
|   +-- RootProviders.tsx            # All context providers
|   +-- DesktopNavigation.tsx        # Top nav bar
|   +-- MobileNavigation.tsx         # Bottom tab bar
|   +-- Sidebar.tsx                  # Sport/league navigation
|   +-- Header.tsx                   # Logo, nav, wallet, user menu
|   +-- Footer.tsx                   # Public page footer
|   +-- AuthGuard.tsx                # Route protection wrapper
|   +-- PageContainer.tsx            # Consistent page padding/width
|   +-- SectionHeader.tsx            # Section title + action link
|   +-- NotificationCenter.tsx       # Slide-over notification panel
|
+-- features/                        # Feature-specific components
|   +-- auth/
|   |   +-- LoginForm.tsx
|   |   +-- RegisterForm.tsx
|   |   +-- PasswordStrength.tsx
|   +-- events/
|   |   +-- EventCard.tsx
|   |   +-- EventDetail.tsx
|   |   +-- MarketGroup.tsx
|   |   +-- OutcomeButton.tsx
|   |   +-- LiveIndicator.tsx
|   |   +-- ScoreDisplay.tsx
|   |   +-- EventFilter.tsx
|   +-- predictions/
|   |   +-- PredictionCard.tsx
|   |   +-- PredictionForm.tsx
|   |   +-- PredictionStats.tsx
|   |   +-- ConfidenceSlider.tsx
|   |   +-- PredictionHistory.tsx
|   +-- betslip/
|   |   +-- BetSlip.tsx
|   |   +-- BetSlipItem.tsx
|   |   +-- BetSlipSummary.tsx
|   |   +-- BetSlipMobile.tsx        # Bottom sheet variant
|   +-- contests/
|   |   +-- ContestCard.tsx
|   |   +-- ContestDetail.tsx
|   |   +-- ContestForm.tsx          # Multi-step wizard
|   |   +-- ContestStandings.tsx
|   |   +-- ContestPredictions.tsx
|   |   +-- PrizePoolBreakdown.tsx
|   +-- challenges/
|   |   +-- ChallengeCard.tsx
|   |   +-- ChallengeForm.tsx
|   |   +-- ChallengeDetail.tsx
|   |   +-- ChallengeResult.tsx
|   +-- friends/
|   |   +-- FriendCard.tsx
|   |   +-- FriendList.tsx
|   |   +-- FriendRequest.tsx
|   |   +-- FriendSearch.tsx
|   |   +-- SuggestedFriends.tsx
|   |   +-- HeadToHead.tsx
|   +-- leaderboard/
|   |   +-- LeaderboardPodium.tsx
|   |   +-- LeaderboardTable.tsx
|   |   +-- LeaderboardRow.tsx
|   |   +-- LeaderboardFilters.tsx
|   +-- wallet/
|   |   +-- BalanceCard.tsx
|   |   +-- TransactionList.tsx
|   |   +-- TransactionItem.tsx
|   |   +-- DepositForm.tsx
|   |   +-- WithdrawForm.tsx
|   |   +-- DailyBonusCard.tsx
|   +-- feed/
|   |   +-- ActivityFeed.tsx
|   |   +-- FeedItem.tsx
|   |   +-- PredictionFeedItem.tsx
|   |   +-- ContestFeedItem.tsx
|   |   +-- ChallengeFeedItem.tsx
|   |   +-- WinFeedItem.tsx
|   |   +-- ReactionBar.tsx
|   +-- profile/
|   |   +-- ProfileHeader.tsx
|   |   +-- ProfileStats.tsx
|   |   +-- ProfileEditor.tsx
|   |   +-- AchievementGrid.tsx
|   +-- notifications/
|   |   +-- NotificationItem.tsx
|   |   +-- NotificationBadge.tsx
|   |   +-- PushNotificationManager.tsx
|   +-- search/
|   |   +-- SearchBar.tsx
|   |   +-- SearchResults.tsx
|   |   +-- CommandPalette.tsx
|   +-- admin/
|       +-- AdminStats.tsx
|       +-- SyncControl.tsx
|       +-- UserTable.tsx
|       +-- ContentModeration.tsx
|       +-- SystemStatus.tsx
|
+-- charts/                          # Data visualization
|   +-- WinRateChart.tsx
|   +-- ProfitChart.tsx
|   +-- OddsMovementChart.tsx
|   +-- SportBreakdownChart.tsx
|   +-- MarketBreakdownChart.tsx
|
+-- shared/                          # Cross-feature utilities
    +-- TimeAgo.tsx                  # Relative time display
    +-- CurrencyDisplay.tsx          # Formatted currency
    +-- OddsDisplay.tsx              # Formatted odds
    +-- SportIcon.tsx                # Sport-specific icon
    +-- LeagueBadge.tsx              # League logo + name
    +-- UserAvatar.tsx               # User avatar with status
    +-- StatusBadge.tsx              # Event/contest/bet status
    +-- ShareButton.tsx              # Social sharing
```

### 9.3 Component Patterns

**Server Component (data fetching):**
```
LeaguePage (server)
+-- LeagueHeader (server — receives data as props)
+-- EventFilter (client — handles URL state)
+-- EventList (server — iterates over events)
|   +-- EventCard (server — receives event data)
|       +-- OutcomeButton (client — dispatches betslip event)
+-- BetSlip (client — manages betslip state)
```

**Client Component (interactive):**
```
ContestForm (client)
+-- StepIndicator (server — static)
+-- FormStep1 (client — manages form state)
|   +-- FormField (shared)
|   |   +-- Input (ui)
|   +-- [Next] Button (ui)
+-- FormStep2 (client)
+-- FormStep3 (client)
+-- FormStep4 (server — renders confirmation)
```

---

## 10. Database Redesign

### 10.1 Design Principles

1. **Auditability:** Every financial mutation creates an immutable record with before/after balance snapshots.
2. **Idempotency:** Every write operation has an idempotency key to prevent duplicate processing.
3. **Soft deletes:** No hard deletes on any user-facing data. `deletedAt` timestamp pattern.
4. **Optimistic locking:** Version columns on hot rows (User balance, Contest state).
5. **Partitioning-ready:** Table design supports future partitioning by time or user.
6. **Denormalization where needed:** Pre-computed aggregates for performance-critical reads.

### 10.2 Schema Changes from v1

| Change | Reason |
|--------|--------|
| Add `role` enum to User | Admin authorization |
| Add `version` to User | Optimistic locking for balance operations |
| Add `deletedAt` to User, Event, Bet, Contest | Soft deletes for audit trail |
| Add `sportId` to Event | Direct Event->Sport query without League hop |
| Add `confidence` to Bet | Confidence weighting for leaderboard |
| Add `isPublic` to Bet | Privacy control for predictions |
| Add `Prediction` model (separate from Bet) | Predictions are free; Bets are stake-based |
| Add `ContestParticipant` replaces `ContestEntry` | Richer contest participation model |
| Add `Achievement` model | Gamification |
| Add `Reputation` model | Per-user, per-sport reputation scores |
| Add `ActivityFeedEntry` model | Structured social feed |
| Add `Notification` model | In-app notification center |
| Add `Comment` model | Discussion on events, contests, challenges |
| Add `Reaction` model | Social reactions on predictions, comments |
| Add `SyncJob` model | Persistent sync history |
| Add `IdempotencyKey` model | Prevent duplicate operations |
| Remove `LeaderboardEntry` | Replace with materialized view or computed table |
| Add `UserStats` model | Pre-computed user statistics |
| Add `EventStats` model | Pre-computed event statistics |

### 10.3 New Entity Relationships

```
User --< Prediction >-- Event --< Market --< Outcome
  |        |
  |        +-- isPublic, confidence
  |        +-- score (0-100 for leaderboard weighting)
  |
  +--< Bet >-- (same relationships as Prediction)
  |     |
  |     +-- stake, odds, potentialWin, settled, result
  |
  +--< Contest >--< ContestParticipant >-- Event
  |     |              |
  |     |              +-- predictions (JSON, validated)
  |     +-- entryFee, prizePool, platformFee
  |
  +--< Challenge >--< ChallengeParticipant >-- Event
  |     |              |
  |     |              +-- prediction, stake (SocialCoins)
  |     +-- deadline, result
  |
  +--< Friendship >-- User
  |     +-- status: PENDING | ACCEPTED | BLOCKED
  |
  +--< Transaction > (virtual currency ledger)
  +--< RealTransaction > (real money ledger)
  +--< Achievement >-- AchievementType
  +--< Reputation >-- Sport
  +--< UserStats > (pre-computed)
  +--< ActivityFeedEntry > (generated events)
  +--< Notification > (push + in-app)
  +--< Comment >-- Event | Contest | Challenge
  +--< Reaction >-- Prediction | Comment | ActivityFeedEntry
```

### 10.4 Key Data Patterns

**Balance Operations (Atomic):**
```
BEGIN TRANSACTION;
  -- Optimistic lock check
  SELECT balance, version FROM "User" WHERE id = ? AND version = ?;
  -- If version mismatch, retry (max 3 times)
  
  -- Deduct
  UPDATE "User" 
  SET balance = balance - ?, version = version + 1, updatedAt = NOW()
  WHERE id = ? AND balance >= ?;  -- CHECK constraint at DB level
  
  -- Record
  INSERT INTO "Transaction" (userId, type, amount, balance, reference, idempotencyKey)
  VALUES (?, 'BET_PLACED', ?, ?, ?, ?);
COMMIT;
```

**Settlement Flow (Idempotent):**
```
BEGIN TRANSACTION;
  -- Check if already settled
  SELECT settled FROM "Bet" WHERE id = ? FOR UPDATE;
  IF settled THEN ROLLBACK; RETURN;
  
  -- Update bet
  UPDATE "Bet" SET status = ?, result = ?, settled = TRUE WHERE id = ?;
  
  -- Update balance (atomic)
  UPDATE "User" SET balance = balance + ?, version = version + 1
  WHERE id = ? AND version = ?;
  
  -- Record transaction
  INSERT INTO "Transaction" (...) VALUES (...);
COMMIT;
```

---

## 11. Prisma Schema Redesign

### 11.1 Schema Organization

The schema will be split into logical files using Prisma's multi-file schema support:

```
prisma/
+-- schema.prisma          # Generator, datasource, imports
+-- models/
|   +-- user.prisma        # User, UserStats, Achievement, Reputation
|   +-- sport.prisma       # Sport, League, Team
|   +-- event.prisma       # Event, EventStats, Market, Outcome
|   +-- prediction.prisma  # Prediction (free picks)
|   +-- bet.prisma         # Bet (stake-based)
|   +-- contest.prisma     # Contest, ContestParticipant
|   +-- challenge.prisma   # Challenge, ChallengeParticipant
|   +-- social.prisma      # Friendship, Comment, Reaction, ActivityFeedEntry
|   +-- wallet.prisma      # Transaction, RealTransaction
|   +-- notification.prisma # Notification
|   +-- system.prisma      # SyncJob, IdempotencyKey
+-- enums.prisma           # All enums in one file
```

### 11.2 Key Model Changes

**User Model (enhanced):**
- Add `role: UserRole` (USER, ADMIN, MODERATOR)
- Add `version: Int` for optimistic locking
- Add `deletedAt: DateTime?` for soft delete
- Add `emailVerified: DateTime?` for email verification
- Add `onboardingCompleted: Boolean` for tracking onboarding state
- Add `preferredSports: String[]` for personalization
- Add `timezone: String` for internationalization
- Add `locale: String` for language preference
- Remove `balance` and `realBalance` from main model -> separate `Wallet` model

**Wallet Model (new):**
- Separate wallet entity allows for future multi-currency support
- `balance: Decimal` with `version: Int` for atomic operations
- `frozenBalance: Decimal` for contest/challenge escrow
- `currency: String` (default "EUR")

**Prediction Model (new, replaces Bet for free picks):**
- `userId`, `eventId`, `marketId`, `outcomeId`
- `confidence: Int?` (1-100, optional weighting factor)
- `isPublic: Boolean` (default true)
- `score: Float?` (computed after settlement: accuracy x confidence weight)
- `settledAt: DateTime?`

**Bet Model (stake-based only):**
- Same as v1 but with `idempotencyKey: String? @unique`
- `version: Int` for optimistic locking
- `lockedAt: DateTime` (when odds were locked)
- `settledAt: DateTime?`

**Contest Model (enhanced):**
- `predictionsRequired: Json` (validated: which markets, which events)
- `visibility: ContestVisibility` (PUBLIC, FRIENDS, PRIVATE)
- `autoSettle: Boolean` (default true)
- `cancelledAt: DateTime?`

**ActivityFeedEntry Model (new):**
- `userId` (actor)
- `type: ActivityType` (PREDICTION, CONTEST_JOIN, CHALLENGE_CREATED, WIN, ACHIEVEMENT, etc.)
- `targetType: ActivityTarget` (EVENT, CONTEST, CHALLENGE, USER, PREDICTION)
- `targetId: String`
- `metadata: Json` (flexible payload)
- `visibility: FeedVisibility` (PUBLIC, FRIENDS, PRIVATE)
- `createdAt: DateTime` (indexed for chronological queries)

**Notification Model (new):**
- `userId` (recipient)
- `type: NotificationType`
- `title: String`
- `body: String`
- `data: Json` (deep link payload)
- `readAt: DateTime?`
- `pushSentAt: DateTime?`

**Comment Model (new):**
- `userId`, `targetType: CommentTarget` (EVENT, CONTEST, CHALLENGE)
- `targetId: String`
- `content: String` (max 2000 chars)
- `parentId: String?` (for threaded replies)
- `deletedAt: DateTime?`

**Reaction Model (new):**
- `userId`, `targetType: ReactionTarget` (PREDICTION, COMMENT, ACTIVITY)
- `targetId: String`
- `emoji: String` (max 4 chars, validated against whitelist)
- Unique constraint: `(userId, targetType, targetId, emoji)`

**SyncJob Model (new, replaces in-memory syncHistory):**
- `id: String @id`
- `source: DataSource`
- `status: SyncJobStatus`
- `startedAt: DateTime`
- `completedAt: DateTime?`
- `eventsProcessed: Int?`
- `error: String?`
- `metadata: Json`

**IdempotencyKey Model (new):**
- `key: String @id` (UUID generated client-side)
- `userId: String`
- `operation: String`
- `result: Json`
- `createdAt: DateTime`
- TTL index: auto-cleanup after 24 hours

### 11.3 Index Strategy

| Table | Index | Purpose |
|-------|-------|---------|
| User | `username` unique | Login, search, profile URLs |
| User | `(role, deletedAt)` | Admin queries, soft-delete filter |
| Prediction | `(userId, settledAt)` | User's active/history predictions |
| Prediction | `(eventId, settledAt)` | Event's predictions for display |
| Prediction | `(outcomeId)` | Outcome popularity |
| Bet | `(userId, settledAt)` | User's active/history bets |
| Bet | `idempotencyKey` unique | Duplicate prevention |
| Event | `(sportId, status)` | Sport-filtered event queries |
| Event | `(leagueId, startTime)` | League event listings |
| Event | `(status, startTime)` | Live/upcoming event queries |
| Contest | `(status, startTime)` | Contest browsing |
| Contest | `(creatorId)` | User's created contests |
| ContestParticipant | `(userId, contestId)` unique | Prevent duplicate entries |
| ActivityFeedEntry | `(userId, createdAt)` | User's feed |
| ActivityFeedEntry | `(type, createdAt)` | Trending activity |
| Notification | `(userId, readAt)` | Unread count, notification list |
| Comment | `(targetType, targetId, createdAt)` | Threaded comments |
| Transaction | `(userId, createdAt)` | Transaction history |
| LeaderboardEntry | `(period, netProfit)` | Leaderboard queries |
| LeaderboardEntry | `(userId, period)` unique | User's rank lookup |
| SyncJob | `(source, startedAt)` | Sync history |
| IdempotencyKey | `createdAt` | TTL cleanup |

### 11.4 Enums (Complete)

```
UserRole: USER, ADMIN, MODERATOR
EventStatus: UPCOMING, LIVE, FINISHED, CANCELLED, POSTPONED
MarketType: MATCH_RESULT, OVER_UNDER, BOTH_TEAMS_SCORE, DOUBLE_CHANCE, CORRECT_SCORE, HANDICAP
MarketStatus: OPEN, SUSPENDED, CLOSED, SETTLED
BetStatus: PENDING, LOCKED, WON, LOST, VOID, CASHED_OUT
BetResult: WIN, LOSS, VOID
PredictionStatus: ACTIVE, LOCKED, CORRECT, INCORRECT, VOID
CustomBetStatus: PENDING, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED, DISPUTED
ParticipantStatus: PENDING, ACCEPTED, DECLINED
ParticipantResult: WIN, LOSS, DRAW, NO_SHOW
ContestStatus: DRAFT, OPEN, LOCKED, IN_PROGRESS, COMPLETED, CANCELLED
EntryStatus: REGISTERED, CONFIRMED, DISQUALIFIED, COMPLETED
FriendshipStatus: PENDING, ACCEPTED, BLOCKED
TransactionType: BET_PLACED, BET_WON, BET_LOST, BET_REFUND, DAILY_BONUS, ACHIEVEMENT_REWARD, CHALLENGE_WON, CHALLENGE_LOST, CHALLENGE_REFUND, WELCOME_BONUS, REFERRAL_BONUS, ADMIN_ADJUSTMENT
RealTransactionType: DEPOSIT, WITHDRAWAL, CONTEST_ENTRY, CONTEST_WIN, CONTEST_REFUND, ADMIN_ADJUSTMENT
RealTxStatus: PENDING, COMPLETED, FAILED, CANCELLED
ContestVisibility: PUBLIC, FRIENDS, PRIVATE
FeedVisibility: PUBLIC, FRIENDS, PRIVATE
ActivityType: PREDICTION, PREDICTION_RESULT, BET_PLACED, BET_WON, BET_LOST, CONTEST_CREATED, CONTEST_JOINED, CONTEST_WON, CHALLENGE_CREATED, CHALLENGE_ACCEPTED, CHALLENGE_WON, FRIEND_ADDED, ACHIEVEMENT_EARNED, STREAK_MILESTONE
ActivityTarget: EVENT, CONTEST, CHALLENGE, USER, PREDICTION, BET
NotificationType: BET_RESULT, CONTEST_UPDATE, CHALLENGE_REQUEST, FRIEND_REQUEST, FRIEND_ACCEPTED, ACHIEVEMENT, LEADERBOARD_CHANGE, SYSTEM
CommentTarget: EVENT, CONTEST, CHALLENGE
ReactionTarget: PREDICTION, COMMENT, ACTIVITY, EVENT
SyncJobStatus: RUNNING, COMPLETED, FAILED, CANCELLED
DataSource: THE_ODDS_API, FOOTBALL_DATA_ORG, MANUAL
AchievementType: FIRST_PREDICTION, FIRST_WIN, WIN_STREAK_5, WIN_STREAK_10, WIN_STREAK_25, PERFECT_WEEK, ALL_CORRECT, CHALLENGE_WON_10, CONTEST_WINNER, SPORT_EXPERT, SOCIAL_BUTTERFLY, REFERRAL_MASTER, EARLY_ADOPTER
```

---

## 12. Backend Architecture

### 12.1 Layered Architecture

```
+----------------------------------------------+
|                  API Layer                     |
|  Route Handlers / Server Actions / Middleware  |
+----------------------------------------------+
|              Validation Layer                  |
|  Zod Schemas (input) -> Typed Output (output) |
+----------------------------------------------+
|              Service Layer                     |
|  Business Logic / Domain Operations            |
+----------------------------------------------+
|              Repository Layer                  |
|  Database Queries / Prisma Operations          |
+----------------------------------------------+
|              Provider Layer                    |
|  External APIs / Cache / Queue / Events        |
+----------------------------------------------+
|              Infrastructure                    |
|  Prisma / Redis / Inngest / Sentry / Pino      |
+----------------------------------------------+
```

**Why this separation:**
- **API Layer** handles HTTP concerns only (request parsing, response formatting, status codes)
- **Service Layer** contains all business rules and can be tested independently of HTTP
- **Repository Layer** abstracts database access, enabling cache-first reads and eventual DB migration
- **Provider Layer** isolates external dependencies (APIs, queues, notifications) behind interfaces

### 12.2 Module Organization

```
src/
+-- server/
|   +-- api/                    # Route handlers (thin, delegate to services)
|   |   +-- auth/
|   |   +-- predictions/
|   |   +-- events/
|   |   +-- contests/
|   |   +-- challenges/
|   |   +-- friends/
|   |   +-- wallet/
|   |   +-- feed/
|   |   +-- notifications/
|   |   +-- search/
|   |   +-- admin/
|   |
|   +-- services/               # Business logic
|   |   +-- auth.service.ts
|   |   +-- user.service.ts
|   |   +-- prediction.service.ts
|   |   +-- bet.service.ts
|   |   +-- event.service.ts
|   |   +-- contest.service.ts
|   |   +-- challenge.service.ts
|   |   +-- friendship.service.ts
|   |   +-- wallet.service.ts
|   |   +-- leaderboard.service.ts
|   |   +-- feed.service.ts
|   |   +-- notification.service.ts
|   |   +-- search.service.ts
|   |   +-- admin.service.ts
|   |
|   +-- repositories/           # Database access
|   |   +-- user.repository.ts
|   |   +-- event.repository.ts
|   |   +-- prediction.repository.ts
|   |   +-- bet.repository.ts
|   |   +-- contest.repository.ts
|   |   +-- challenge.repository.ts
|   |   +-- friendship.repository.ts
|   |   +-- wallet.repository.ts
|   |   +-- leaderboard.repository.ts
|   |   +-- feed.repository.ts
|   |   +-- notification.repository.ts
|   |   +-- system.repository.ts
|   |
|   +-- providers/              # External integrations
|   |   +-- cache.provider.ts       # Redis interface
|   |   +-- queue.provider.ts       # Inngest interface
|   |   +-- email.provider.ts       # Email interface
|   |   +-- push.provider.ts        # Push notification interface
|   |   +-- storage.provider.ts     # File storage interface
|   |   +-- analytics.provider.ts   # Analytics interface
|   |
|   +-- validators/             # Zod schemas
|   |   +-- auth.validator.ts
|   |   +-- prediction.validator.ts
|   |   +-- bet.validator.ts
|   |   +-- contest.validator.ts
|   |   +-- challenge.validator.ts
|   |   +-- wallet.validator.ts
|   |   +-- comment.validator.ts
|   |   +-- common.validator.ts     # Shared schemas (pagination, IDs, etc.)
|   |
|   +-- middleware/             # Request middleware
|       +-- auth.middleware.ts
|       +-- rateLimit.middleware.ts
|       +-- validation.middleware.ts
|       +-- logging.middleware.ts
|       +-- error.middleware.ts
|
+-- lib/                        # Shared infrastructure
|   +-- prisma.ts               # Prisma client singleton
|   +-- redis.ts                # Redis client singleton
|   +-- auth.ts                 # NextAuth configuration
|   +-- logger.ts               # Pino logger setup
|   +-- errors.ts               # Custom error classes
|   +-- constants.ts            # App-wide constants
|   +-- utils.ts                # Pure utility functions
|
+-- data/                       # Data pipeline (keep existing structure, enhance)
|   +-- engine/
|   |   +-- orchestrator.ts
|   |   +-- pipeline.ts
|   |   +-- settlement.ts
|   |   +-- odds-engine.ts
|   +-- sources/
|   |   +-- base.ts
|   |   +-- the-odds-api.ts
|   |   +-- football-data.ts
|   +-- types.ts
|   +-- cron.ts (remove — replaced by Inngest)
|
+-- jobs/                       # Background job definitions
    +-- sync.jobs.ts
    +-- settlement.jobs.ts
    +-- leaderboard.jobs.ts
    +-- notification.jobs.ts
    +-- cleanup.jobs.ts
    +-- analytics.jobs.ts
```

### 12.3 Error Handling Strategy

**Custom Error Hierarchy:**
```
AppError (base)
+-- AuthError
|   +-- InvalidCredentials
|   +-- SessionExpired
|   +-- InsufficientPermissions
|   +-- AccountLocked
+-- ValidationError
|   +-- InvalidInput
|   +-- MissingField
|   +-- DuplicateEntry
|   +-- BusinessRuleViolation
+-- NotFoundError
|   +-- UserNotFound
|   +-- EventNotFound
|   +-- ContestNotFound
|   +-- ...
+-- ConflictError
|   +-- BalanceInsufficient
|   +-- ContestFull
|   +-- AlreadyPredicted
|   +-- OptimisticLockFailure
|   +-- ...
+-- ExternalServiceError
|   +-- OddsApiUnavailable
|   +-- FootballDataUnavailable
|   +-- PaymentProviderError
|   +-- ...
+-- InternalError
    +-- DatabaseError
    +-- CacheError
    +-- QueueError
```

**Error Response Format:**
```json
{
  "error": {
    "code": "CONTEST_FULL",
    "message": "Questo contest e pieno",
    "details": {
      "currentPlayers": 10,
      "maxPlayers": 10
    },
    "requestId": "req_abc123"
  }
}
```

**Error Handling Rules:**
1. All API errors return structured JSON with error code, user-facing message, and internal details
2. All errors include a `requestId` for correlation
3. Validation errors return field-level details
4. Auth errors never reveal whether the user exists
5. All unexpected errors are logged with full context (stack trace, request data, user ID)
6. Client-side errors are shown via toast notifications with retry where appropriate

### 12.4 Validation Strategy

**Zod schemas for every API input:**
- API routes validate request body, query params, and path params
- Service methods accept typed inputs (post-validation)
- Database queries use Prisma's type safety
- Client forms use the same Zod schemas (shared between client and server)

**Validation layers:**
1. **Schema validation** (Zod): Types, ranges, formats, required fields
2. **Business validation** (Service): Domain rules (e.g., "can't bet on finished event")
3. **Optimistic locking** (Repository): Version checks for concurrent operations
4. **Database constraints** (Prisma/PostgreSQL): Unique, foreign key, check constraints

---

## 13. Frontend Architecture

### 13.1 Rendering Strategy

| Page Type | Rendering | Cache | Revalidation |
|-----------|-----------|-------|-------------|
| Landing | SSR | ISR (1 hour) | On demand |
| Sports Overview | SSR | ISR (15 min) | On data change |
| League Detail | SSR | ISR (5 min) | On data change |
| Event Detail | SSR + Client hydration | ISR (1 min) | On data change |
| Home Feed | SSR | No cache | Fresh per request |
| My Predictions | SSR | No cache | Fresh per request |
| Contests | SSR | ISR (5 min) | On data change |
| Leaderboard | SSR | ISR (5 min) | On settlement |
| Activity Feed | SSR + Client polling | No cache | 30s client refresh |
| Profile | SSR | ISR (15 min) | On profile update |
| Wallet | SSR | No cache | Fresh per request |
| Settings | Client only | No cache | N/A |
| Admin | SSR | No cache | Fresh per request |

**Why this mix:**
- Static-ish data (sports, leagues, event listings) benefits from ISR — reduces DB load significantly
- Personal data (predictions, wallet, feed) must be fresh — no caching
- Event details with live odds benefit from short ISR windows with on-demand revalidation
- Activity feed uses client polling for near-real-time updates without WebSocket complexity

### 13.2 State Management

**Server State (React Server Components + ISR):**
- Sports, leagues, events, leaderboard data
- User profile, settings
- Contest listings

**URL State (nuqs or useSearchParams):**
- Filters (sport, league, status, date range)
- Sort order
- Active tab
- Search query
- Pagination cursor

**Client State (React Context + useReducer):**
- Bet slip state (selections, stake)
- Theme preference
- Notification panel open/close
- Command palette open/close

**Form State (React Hook Form + Zod):**
- Registration form
- Contest creation wizard
- Challenge creation form
- Profile edit form
- Deposit/withdraw forms

**Why NOT Redux/Zustand/other global state:**
- Server Components handle most data fetching
- URL state handles filter/sort state
- Bet slip is the only complex client state and fits a Context
- Global state libraries add bundle size and complexity without proportional benefit
- If real-time features grow, Inngest events + optimistic updates cover most needs

### 13.3 Data Fetching Patterns

**Server Components (primary):**
```
Page Component (async)
  +-- await service.method()  // Direct service call
        +-- repository.query()  // With cache lookup first
```

**Server Actions (mutations from Server Components):**
```
"use server"
export async function placePrediction(formData: FormData) {
  // 1. Validate input
  // 2. Call service
  // 3. Revalidate affected paths
  // 4. Return success/error
}
```

**Client-side Fetching (interactive data):**
```
useSWR or React Query
  +-- Optimistic updates for mutations
  +-- Automatic revalidation on focus/mount
  +-- Background refetching for near-real-time data
  +-- Error retry with exponential backoff
```

**Why use SWR/React Query for client fetching:**
- Server Components handle initial data load (fast, SEO-friendly)
- Client fetching handles interactive updates (bet slip, real-time odds, notifications)
- SWR provides caching, deduplication, and retry out of the box
- Optimistic updates make the UI feel instant

### 13.4 Real-time Strategy

**Phase 1 (v2.0):** Polling for critical data
- Bet results: Client polls `/api/v1/predictions/status` every 30 seconds during live events
- Notifications: Client polls `/api/v1/notifications/unread-count` every 60 seconds
- Leaderboard: Client polls on page load only (settlement-triggered revalidation)

**Phase 2 (v2.5):** Server-Sent Events (SSE)
- Live odds updates during events
- Live score updates
- Real-time notification delivery
- Live contest standings

**Phase 3 (v3.0):** WebSocket (Socket.io or Ably)
- Full bidirectional real-time
- Live chat on events/contests
- Real-time prediction reveals in challenges
- Collaborative features

**Why phased approach:**
- Polling is simple, works everywhere, and is sufficient for v2.0
- SSE is simpler than WebSockets and handles server-to-client well
- WebSockets add significant infrastructure complexity (sticky sessions, horizontal scaling)
- Each phase builds on the previous without requiring architectural rewrites

### 13.5 Component Library Choice: shadcn/ui

**Why shadcn/ui over alternatives:**

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **shadcn/ui** | Tailwind-native, fully customizable, copy-paste, no dependency lock-in | Must maintain copied components | **Selected** |
| Radix UI + Tailwind | Accessible primitives, unstyled | Need to build all components | Too much work |
| Headless UI | Official Tailwind companion | Limited component set | Too limited |
| MUI / Chakra | Full component sets | Opinionated styling, bundle size | Wrong aesthetic |
| Custom + Tailwind | Full control | Massive development time, inconsistency | Already tried (v1) |

---

## 14. Feature Organization

### 14.1 Feature Module Structure

Each feature is a self-contained module:

```
features/
+-- auth/
|   +-- api/                    # Route handlers
|   +-- auth.service.ts         # Business logic
|   +-- auth.validator.ts       # Zod schemas
|   +-- auth.types.ts           # TypeScript types
|   +-- components/             # UI components
|
+-- predictions/
|   +-- api/
|   +-- prediction.service.ts
|   +-- prediction.repository.ts
|   +-- prediction.validator.ts
|   +-- prediction.types.ts
|   +-- components/
|
+-- events/
|   +-- api/
|   +-- event.service.ts
|   +-- event.repository.ts
|   +-- event.validator.ts
|   +-- event.types.ts
|   +-- components/
|
+-- contests/
|   +-- api/
|   +-- contest.service.ts
|   +-- contest.repository.ts
|   +-- contest.validator.ts
|   +-- contest.types.ts
|   +-- components/
|
+-- challenges/
|   +-- api/
|   +-- challenge.service.ts
|   +-- challenge.repository.ts
|   +-- challenge.validator.ts
|   +-- challenge.types.ts
|   +-- components/
|
+-- friends/
|   +-- api/
|   +-- friendship.service.ts
|   +-- friendship.repository.ts
|   +-- friendship.validator.ts
|   +-- friendship.types.ts
|   +-- components/
|
+-- wallet/
|   +-- api/
|   +-- wallet.service.ts
|   +-- wallet.repository.ts
|   +-- wallet.validator.ts
|   +-- wallet.types.ts
|   +-- components/
|
+-- feed/
|   +-- api/
|   +-- feed.service.ts
|   +-- feed.repository.ts
|   +-- feed.validator.ts
|   +-- feed.types.ts
|   +-- components/
|
+-- notifications/
|   +-- api/
|   +-- notification.service.ts
|   +-- notification.repository.ts
|   +-- notification.validator.ts
|   +-- notification.types.ts
|   +-- components/
|
+-- search/
|   +-- api/
|   +-- search.service.ts
|   +-- search.types.ts
|   +-- components/
|
+-- leaderboard/
|   +-- api/
|   +-- leaderboard.service.ts
|   +-- leaderboard.repository.ts
|   +-- leaderboard.types.ts
|   +-- components/
|
+-- admin/
    +-- api/
    +-- admin.service.ts
    +-- admin.repository.ts
    +-- admin.validator.ts
    +-- admin.types.ts
    +-- components/
```

---

## 15. Services

### 15.1 Service Design Principles

1. **Services contain business logic only.** No HTTP concerns, no database queries (delegate to repositories).
2. **Services are stateless.** No singletons, no in-memory state.
3. **Services are synchronous by default.** Async operations (queues, notifications) are triggered after the service returns.
4. **Services throw typed errors.** Never raw strings or generic Error objects.
5. **Services are testable.** Dependencies are injected or importable.

### 15.2 Service Inventory

**AuthService:**
- `register(input)` -> Creates user, sends welcome notification, triggers referral bonus
- `login(email, password)` -> Validates credentials, returns session
- `getSession(userId)` -> Returns enriched session data (cached)
- `changePassword(userId, oldPass, newPass)` -> Validates, updates, invalidates sessions

**UserService:**
- `getProfile(userId)` -> Returns public profile with stats
- `updateProfile(userId, input)` -> Updates display name, bio, avatar
- `getStats(userId)` -> Returns pre-computed stats (cache-first)
- `searchUsers(query, currentUserId)` -> Searches by username/name

**PredictionService:**
- `createPrediction(userId, eventId, marketId, outcomeId, confidence?, isPublic?)` -> Creates prediction with validation
- `getEventPredictions(eventId, userId?)` -> Returns anonymized friends' predictions
- `getUserActivePredictions(userId)` -> Returns unsettled predictions
- `getPredictionStats(userId)` -> Returns aggregated stats

**BetService (stake-based, separate from free predictions):**
- `placeBet(userId, outcomeId, stake, oddsVersion?)` -> Atomic balance deduction + bet creation
- `getUserBets(userId, filters)` -> Paginated bet history

**EventService:**
- `getEvents(filters)` -> Paginated event listing with sport/league filters
- `getEvent(eventId)` -> Returns event with markets, outcomes, stats
- `getUpcomingEvents(sportId?, limit?)` -> Returns upcoming events

**ContestService:**
- `createContest(userId, input)` -> Creates contest with validation
- `joinContest(userId, contestId)` -> Atomic: deduct fee, create entry, update prize pool
- `leaveContest(userId, contestId)` -> Atomic: refund fee, remove entry, update prize pool
- `settleContest(contestId)` -> Auto-settle: calculate winners, distribute prizes

**ChallengeService:**
- `createChallenge(userId, input)` -> Creates challenge with stake escrow
- `acceptChallenge(userId, challengeId)` -> Validates, joins challenge
- `submitPrediction(userId, challengeId, prediction)` -> Submits/updates prediction
- `settleChallenge(challengeId)` -> Determines winner, transfers stake

**FriendshipService:**
- `sendRequest(fromUserId, toUsername)` -> Creates friend request
- `acceptRequest(userId, requestId)` -> Accepts, creates bidirectional friendship
- `getFriends(userId)` -> Returns friends list with stats
- `getSuggestions(userId)` -> Returns suggested friends

**WalletService:**
- `getBalance(userId)` -> Returns both balances (cache-first)
- `deposit(userId, amount, idempotencyKey)` -> Atomic deposit with idempotency
- `withdraw(userId, amount, idempotencyKey)` -> Atomic withdrawal with idempotency
- `dailyBonus(userId)` -> Checks eligibility, grants bonus

**LeaderboardService:**
- `getLeaderboard(period, sportId?, scope, userId?)` -> Returns leaderboard with user rank
- `recalculateLeaderboard(period)` -> Batch recalculate using window functions

**FeedService:**
- `getFeed(userId, scope, filters, pagination)` -> Returns activity feed
- `createActivityEntry(userId, type, target, metadata)` -> Generates feed entry
- `reactToEntry(userId, entryId, emoji)` -> Adds/removes reaction

**NotificationService:**
- `getNotifications(userId, pagination)` -> Returns notification list
- `getUnreadCount(userId)` -> Returns count (cached)
- `sendPush(userId, title, body, data)` -> Sends push notification
- `createNotification(userId, type, title, body, data)` -> Creates + triggers push

**SearchService:**
- `search(query, userId)` -> Global search across events, users, contests

**AdminService:**
- `getSystemStatus()` -> Returns pipeline status, stats
- `triggerSync(action, sport?)` -> Triggers data sync
- `triggerSettlement(eventId?)` -> Triggers settlement

---

## 16. Repository Layer

### 16.1 Repository Design

Repositories abstract database access behind typed interfaces. They:
1. Execute Prisma queries (no raw SQL unless performance-critical)
2. Implement cache-first reads for hot data
3. Handle pagination (cursor-based)
4. Apply soft-delete filters automatically
5. Never contain business logic

### 16.2 Repository Interface Pattern

Each repository implements a consistent interface:

```
IUserRepository:
  findById(id): User | null
  findByUsername(username): User | null
  findByEmail(email): User | null
  findMany(filters, pagination): PaginatedResult<User>
  create(data): User
  update(id, data, version?): User  // throws on version mismatch
  incrementBalance(id, amount, version?): void  // atomic
  decrementBalance(id, amount, version?): void  // atomic, checks >= 0
  softDelete(id): void
  count(filters): number

IPredictionRepository:
  findById(id): Prediction | null
  findByUser(userId, filters, pagination): PaginatedResult<Prediction>
  findByEvent(eventId, filters): Prediction[]
  create(data): Prediction
  update(id, data): Prediction
  bulkSettle(betIds, results): void  // atomic batch
  countByUser(userId): number
  getStats(userId): UserPredictionStats

IContestRepository:
  findById(id, include?): Contest | null
  findMany(filters, pagination): PaginatedResult<Contest>
  create(data): Contest
  join(contestId, userId, entryFee): void  // atomic
  leave(contestId, userId): void  // atomic
  updatePrizePool(contestId, delta): void
  getStandings(contestId): ContestStanding[]
```

### 16.3 Cache-First Read Pattern

```
Repository.findById(id):
  1. Check Redis cache (key: "{model}:{id}", TTL: varies)
  2. If cache hit -> return parsed data
  3. If cache miss -> query Prisma
  4. Store result in Redis
  5. Return data

Repository.update(id, data):
  1. Execute Prisma update
  2. Invalidate Redis cache
  3. Return updated data
```

**Cache TTLs:**
| Data | TTL | Reason |
|------|-----|--------|
| User profile | 15 minutes | Changes infrequently |
| User balance | 0 (no cache) | Must always be fresh |
| Event listing | 5 minutes | Changes with schedule |
| Event detail | 1 minute | Odds change frequently |
| Market outcomes | 30 seconds | Odds change during sync |
| Leaderboard | 5 minutes | Changes on settlement |
| Sport/League list | 1 hour | Almost never changes |
| Contest detail | 1 minute | Player count changes |
| Friend list | 5 minutes | Changes infrequently |
| Notification count | 30 seconds | Must feel real-time |

---

## 17. Provider Layer

### 17.1 Provider Interfaces

Providers encapsulate external dependencies behind clean interfaces, enabling:
- Swapping implementations (Redis -> Upstash, Sentry -> Logtail)
- Testing with mocks
- Graceful degradation when external services are down

**CacheProvider:**
- `get(key): Promise<string | null>`
- `set(key, value, ttl?): Promise<void>`
- `del(key): Promise<void>`
- `delPattern(pattern): Promise<void>` (for invalidating related keys)
- `incr(key): Promise<number>` (for rate limiting)

**QueueProvider:**
- `enqueue(functionName, data, options?): Promise<void>`
- `schedule(functionName, data, cron): Promise<void>`
- `cancel(jobId): Promise<void>`
- `getStatus(jobId): Promise<JobStatus>`

**PushProvider:**
- `send(userId, title, body, data?): Promise<void>`
- `sendBulk(userIds, title, body, data?): Promise<void>`
- `registerDevice(userId, token, platform): Promise<void>`

**EmailProvider:**
- `send(to, subject, html, text?): Promise<void>`

**StorageProvider:**
- `upload(key, file, contentType): Promise<string>` (returns URL)
- `delete(key): Promise<void>`
- `getSignedUrl(key, expiresIn?): Promise<string>`

**AnalyticsProvider:**
- `track(event, properties?, userId?): Promise<void>`
- `identify(userId, traits): Promise<void>`

### 17.2 Implementation Choices

| Provider | v2.0 Choice | Future Options | Why |
|----------|-------------|---------------|-----|
| Cache | Upstash Redis | Cloudflare KV, Vercel KV | Serverless-native, no cold start, generous free tier |
| Queue | Inngest | Trigger.dev, BullMQ, Temporal | Purpose-built for Next.js, handles cron + events + steps |
| Push | Web Push API | Firebase Cloud Messaging, OneSignal | Free, no vendor lock-in, works on web |
| Email | Resend | SendGrid, Postmark, AWS SES | Modern, simple API, good DX |
| Storage | Supabase Storage | Cloudflare R2, AWS S3 | Already using Supabase, zero additional setup |
| Analytics | PostHog | Mixpanel, Amplitude, Segment | Self-hostable, generous free tier, product analytics |
| Error Tracking | Sentry | Logtail, Datadog | Industry standard, excellent Next.js integration |
| Logging | Pino + Logtail | Winston, Datadog Logs | Fast, structured, free tier via Logtail |

---

## 18. Background Jobs

### 18.1 Job Categories

**Data Pipeline Jobs:**
- `syncAll`: Full sync from all sources (daily at 3:00 AM)
- `syncSport`: Sync specific sport (on-demand, every 2 hours)
- `syncOdds`: Refresh odds for upcoming events (every 30 minutes during active hours)
- `syncLiveScores`: Update live event scores (every 2 minutes during live events)

**Settlement Jobs:**
- `settleEvent`: Settle all bets for a finished event (triggered by score update)
- `settleContest`: Settle contest after all events conclude (triggered by event settlement)
- `settleChallenge`: Settle challenge after deadline passes and events conclude

**Leaderboard Jobs:**
- `recalculateLeaderboard`: Recalculate weekly/monthly leaderboard (triggered by settlement)
- `archiveLeaderboard`: Archive completed period, start new period (weekly)

**Notification Jobs:**
- `sendPushNotifications`: Process notification queue (triggered by events)
- `sendDigestEmail`: Daily digest of activity (daily at 8:00 AM)

**Analytics Jobs:**
- `computeUserStats`: Update pre-computed user statistics (after settlement)
- `computeEventStats`: Update pre-computed event statistics (after settlement)
- `computePlatformStats`: Update platform-wide analytics (daily)

**Cleanup Jobs:**
- `cleanupExpiredIdempotencyKeys`: Remove keys older than 24 hours (daily)
- `cleanupReadNotifications`: Archive read notifications older than 30 days (weekly)
- `cleanupSyncJobs`: Remove sync job records older than 90 days (weekly)

**Maintenance Jobs:**
- `refreshMaterializedViews`: Refresh materialized views for leaderboard/feed (every 5 minutes)
- `healthCheck`: Verify all services are operational (every minute)

### 18.2 Job Design Principles

1. **Idempotent:** Every job can run multiple times with the same result
2. **Atomic:** Jobs either complete fully or fail completely (no partial writes)
3. **Observable:** Every job logs start, progress, and completion with timing
4. **Retriable:** Failed jobs retry with exponential backoff (max 3 retries)
5. **Dead-lettered:** Jobs that fail all retries are logged for manual review
6. **Timeout-guarded:** Every job has a max execution time (prevents zombie jobs)

### 18.3 Job Flow Example: Event Settlement

```
Score Update (from sync pipeline)
  |
  +-- Event status set to FINISHED
  |
  +-- Inngest event: "event/settled" { eventId }
        |
        +-- settleEvent job:
        |     1. Fetch event with markets, outcomes, unsettled bets
        |     2. For each market:
        |        a. Determine winning outcome
        |        b. For each unsettled bet:
        |           - Determine result (WIN/LOSS/VOID)
        |           - If WIN: calculate payout
        |           - Atomic: update bet + update balance + create transaction
        |     3. If any bet has a linked contest:
        |        - Trigger settleContest job (if all events in contest are settled)
        |     4. Create activity feed entries for big wins
        |     5. Send push notifications to winners
        |     6. Update user stats (async)
        |     7. Trigger leaderboard recalculation (async)
        |
        +-- computeUserStats job (for each affected user):
        |     1. Recalculate win rate, ROI, streaks
        |     2. Update UserStats record
        |     3. Check achievement thresholds
        |     4. Award achievements if earned
        |
        +-- recalculateLeaderboard job:
              1. Fetch all users with settled bets in current period
              2. Calculate net profit, win rate, bet count
              3. Rank using SQL window function
              4. Batch upsert LeaderboardEntry records
              5. Invalidate leaderboard cache
```

---

## 19. Scheduler Architecture

### 19.1 Why Inngest Over Alternatives

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Inngest** | Native Next.js, event-driven, step functions, built-in retry, free tier | Vendor dependency, relatively new | **Selected** |
| Vercel Cron | Already available, no setup | Limited to 1/min granularity, no event-driven, no retry | Supplement only |
| node-cron | Simple, in-process | Lost in serverless, no retry, no observability | Remove |
| Trigger.dev | Self-hostable, good DX | More complex setup, heavier | Future alternative |
| BullMQ + Redis | Battle-tested, very flexible | Requires dedicated Redis, complex setup | Overkill for v2.0 |
| Temporal | Ultimate reliability | Massive complexity, overkill | Not needed |

### 19.2 Scheduler Configuration

```
Inngest Functions:

Cron Jobs (scheduled):
+-- "3:00 AM daily" -> syncAll
+-- "every 30 minutes" -> syncOdds (only during active hours: 8:00-23:00)
+-- "every 2 minutes" -> syncLiveScores (only if live events exist)
+-- "weekly Sunday 3:00 AM" -> archiveLeaderboard
+-- "daily 8:00 AM" -> sendDigestEmail
+-- "daily 4:00 AM" -> cleanupExpiredIdempotencyKeys
+-- "weekly Monday 4:00 AM" -> cleanupReadNotifications, cleanupSyncJobs
+-- "every 5 minutes" -> refreshMaterializedViews

Event-Driven Triggers:
+-- "event/score-updated" -> settleEvent (if event finished)
+-- "event/settled" -> settleContest (if contest events all settled)
+-- "event/settled" -> computeUserStats (for affected users)
+-- "event/settled" -> recalculateLeaderboard
+-- "bet/placed" -> createActivityEntry
+-- "contest/joined" -> createActivityEntry + sendNotification
+-- "challenge/created" -> sendNotification (to invited users)
+-- "prediction/settled" -> sendNotification (to predictor)
+-- "achievement/earned" -> sendNotification + createActivityEntry
+-- "friend/request-sent" -> sendNotification

On-Demand Triggers (API):
+-- POST /api/admin/sync -> syncAll or syncSport
+-- POST /api/admin/settle -> settleEvent or settleAll
+-- POST /api/admin/trigger -> any function by name
```

### 19.3 Vercel Cron vs Inngest

Vercel cron in `vercel.json` remains as a **fallback mechanism**:
- It sends a simple HTTP request to `/api/cron`
- The cron handler triggers Inngest events
- This provides redundancy: if Inngest's internal scheduler misses, Vercel cron catches it

---

## 20. Sync Architecture

### 20.1 Data Flow

```
External APIs                 Internal Pipeline
-------------------          --------------------

The Odds API --------+
                     +---> Source Adapter ---> Raw Data ---> Pipeline ---> Database
Football-Data.org ---+       (normalize)       (validate)   (dedup/store)
                                                        |
                                                        v
                                                   Odds Engine
                                                   (fair odds, value detection)
                                                        |
                                                        v
                                                   Cache Invalidation
                                                   (Redis keys)
                                                        |
                                                        v
                                                   Event: "odds/updated"
                                                   (triggers UI refresh)
```

### 20.2 Sync Modes

| Mode | Trigger | Scope | Frequency |
|------|---------|-------|-----------|
| Full Sync | Cron (daily 3:00 AM) | All sports, all sources | Once daily |
| Odds Refresh | Cron (every 30 min) | Upcoming events only | Continuous |
| Live Update | Cron (every 2 min) | LIVE events only | During matches |
| Sport Sync | On-demand (admin) | Specific sport | As needed |
| Event Sync | On-demand (admin) | Specific event | As needed |

### 20.3 Source Adapter Design

Each external API is wrapped in an adapter that:
1. **Normalizes** raw data into internal format
2. **Rate limits** requests (respects API quotas)
3. **Retries** failed requests (exponential backoff, max 3)
4. **Reports health** (success rate, latency, error count)
5. **Handles deduplication** (external ID mapping)

### 20.4 Pipeline Design

The pipeline processes raw data in these stages:

1. **Validate:** Check required fields, data types, ranges
2. **Normalize:** Map external sport/league names to internal IDs
3. **Deduplicate:** Match by external ID or (team names + date + league)
4. **Upsert:** Create or update events, markets, outcomes
5. **Calculate:** Run odds engine for fair odds, value detection
6. **Cache:** Invalidate relevant Redis keys
7. **Emit:** Trigger events for downstream consumers

### 20.5 Reconciliation

After each sync, a reconciliation step:
1. Counts expected events (from API response)
2. Counts stored events (from database)
3. Logs discrepancies
4. Alerts if sync completeness drops below 90%

---

## 21. Caching Architecture

### 21.1 Cache Layers

```
+-----------------------------------------------------+
|                    Browser Cache                      |
|  (HTTP Cache-Control headers, Service Worker)         |
+-----------------------------------------------------+
|                   CDN Cache (Vercel)                  |
|  (ISR pages, static assets, API response caching)    |
+-----------------------------------------------------+
|                   Redis Cache (Upstash)               |
|  (Application-level: user data, leaderboard, feed)   |
+-----------------------------------------------------+
|                  Prisma Query Cache                   |
|  (None by default — every query hits the DB)         |
+-----------------------------------------------------+
|                  PostgreSQL Cache                     |
|  (Materialized views, connection pooling)            |
+-----------------------------------------------------+
```

### 21.2 Cache Strategy by Data Type

| Data | Layer | TTL | Invalidation |
|------|-------|-----|-------------|
| Sports/Leagues | Redis + CDN | 1 hour | On admin change |
| Event listings | Redis + ISR | 5 minutes | On sync |
| Event detail | Redis + ISR | 1 minute | On sync, on score update |
| Odds (outcomes) | Redis | 30 seconds | On sync |
| User profile | Redis | 15 minutes | On profile update |
| User balance | No cache | — | Never (always fresh) |
| Leaderboard | Redis | 5 minutes | On settlement |
| Friend list | Redis | 5 minutes | On friendship change |
| Notification count | Redis | 30 seconds | On notification create/read |
| Activity feed | Redis | 1 minute | On new activity |
| Search results | Redis | 5 minutes | On data change |
| Contest detail | Redis | 1 minute | On join/leave |
| User stats | Redis | 15 minutes | On settlement |

### 21.3 Cache Invalidation Patterns

**Write-through invalidation:**
When a mutation occurs, the repository explicitly invalidates related cache keys:

```
Prediction created -> invalidate:
  - event:{eventId}:predictions
  - user:{userId}:active-predictions
  - user:{userId}:stats

Bet settled -> invalidate:
  - user:{userId}:balance
  - user:{userId}:stats
  - leaderboard:{period}
  - event:{eventId}:predictions

Friend added -> invalidate:
  - user:{userId}:friends
  - user:{friendId}:friends
  - user:{userId}:suggestions
```

**Pattern invalidation:**
For related key groups:
```
delPattern("event:*")           # After full sync
delPattern("leaderboard:*")     # After leaderboard recalculation
delPattern("user:{id}:*")       # After user deletion/update
```

### 21.4 Cache Stampede Prevention

For high-traffic cache misses (e.g., popular event detail):
1. **Singleflight:** Only one request regenerates the cache; others wait
2. **Stale-while-revalidate:** Serve stale data while refreshing in background
3. **Lock-based regeneration:** Redis SETNX prevents concurrent regeneration

---

## 22. Notification System

### 22.1 Notification Types

| Type | Trigger | Channel | Priority |
|------|---------|---------|----------|
| Bet Result | Settlement completes | Push + In-app | High |
| Challenge Request | Friend creates challenge | Push + In-app | High |
| Challenge Result | Challenge settles | Push + In-app | Medium |
| Friend Request | Friend sends request | Push + In-app | High |
| Friend Accept | Friend accepts request | In-app | Low |
| Contest Starting | Contest status changes to IN_PROGRESS | Push + In-app | Medium |
| Contest Result | Contest settles | Push + In-app | Medium |
| Achievement Earned | Achievement unlocked | Push + In-app | Medium |
| Leaderboard Change | Rank changes by >=5 positions | In-app | Low |
| Daily Digest | Scheduled daily | Email | Low |
| System Announcement | Admin broadcasts | Push + In-app | High |

### 22.2 Notification Delivery Flow

```
Event Occurs (e.g., bet settled)
  |
  +-- NotificationService.createNotification(userId, type, title, body, data)
        |
        +-- Insert into Notification table
        |
        +-- Invalidate notification count cache
        |
        +-- If push enabled for this type:
              |
              +-- Enqueue push notification job
              |     |
              |     +-- Check user's notification preferences
              |     +-- Check device tokens
              |     +-- Send via PushProvider (Web Push API)
              |
              +-- Mark pushSentAt timestamp
```

### 22.3 Push Notification Infrastructure

**v2.0: Web Push API**
- Service Worker registered in browser
- Push subscription stored per device
- VAPID keys for authentication
- No external service needed (free, self-hosted)

**v2.5+: Firebase Cloud Messaging (FCM)**
- Required for native mobile apps
- Unified push for web + iOS + Android
- Rich notifications, topics, segments

### 22.4 Notification Preferences

Users can control:
- **Global:** Enable/disable push notifications
- **Per-type:** Enable/disable each notification type
- **Quiet hours:** No notifications between specified times
- **Digest mode:** Instead of individual push, send daily digest email

---

## 23. Activity Feed

### 23.1 Feed Types

**Friends Feed (default):**
Shows activity from the user's friends only. Primary feed — high relevance, high engagement.

**Global Feed:**
Shows all public activity on the platform. Used for discovery.

**Sport-specific Feed:**
Shows all activity for a specific sport. Useful during major events.

### 23.2 Activity Types

| Activity | Actor | Content | Visibility |
|----------|-------|---------|-----------|
| Prediction Placed | User | "Marco ha predetto Inter vince vs Milan @ 2.10" | Public (if isPublic) |
| Prediction Correct | System | "Giulia ha indovinato! Arsenal vince" | Public |
| Contest Joined | User | "Alessandro si e iscritto a Serie A Showdown" | Public |
| Contest Won | System | "Marco ha vinto Serie A Showdown!" | Public |
| Challenge Created | User | "Luca ha sfidato Giulia: Roma vs Lazio" | Friends |
| Challenge Won | System | "Giulia ha vinto la sfida vs Luca!" | Friends |
| Achievement Earned | System | "Marco ha ottenuto Prima Vittoria" | Public |
| Streak Milestone | System | "Giulia e in una serie di 10 vittorie consecutive!" | Public |

### 23.3 Feed Algorithm

**Friends Feed (chronological with relevance boost):**

```
1. Fetch all activity from friends (last 48 hours)
2. Score each item:
   - Base score: recency (exponential decay over 48h)
   - Boost: +50 if item is a win/streak/achievement
   - Boost: +30 if item has reactions from other friends
   - Boost: +20 if item is related to an event user also predicted
   - Penalty: -20 if user has already seen this item
3. Sort by score
4. Paginate (20 items per page)
```

### 23.4 Feed Performance

| Metric | Target | Strategy |
|--------|--------|---------|
| Feed load time | <200ms | Redis-cached pre-computed feed |
| New item latency | <5 seconds | Event-driven generation + client polling |
| Feed storage | Bounded | Archive entries older than 30 days |

---

## 24. Prediction Feed

### 24.1 Concept

The Prediction Feed is a specialized view showing predictions for upcoming events. Content-focused — helps users discover what to predict next.

### 24.2 Prediction Feed Sections

**Section 1: "Da Predire" (To Predict)**
- Events starting in the next 6 hours where the user hasn't predicted
- Sorted by: event importance (league tier) x time proximity

**Section 2: "Predizioni degli Amici" (Friends' Predictions)**
- Upcoming events where friends have already predicted
- Shows: anonymized friend prediction counts ("67% think Inter wins")

**Section 3: "Tendenza" (Trending)**
- Events with the most predictions across the platform
- Shows: total prediction count, odds movement, popular outcome

**Section 4: "Value" (Value Opportunities)**
- Events where the odds engine detects value
- Shows: value indicator, suggested stake, confidence level

---

## 25. Contest Redesign

### 25.1 Contest Types

| Type | Entry Fee | Prize Pool | Predictions Required | Duration |
|------|-----------|------------|---------------------|----------|
| **Quick** | EUR 1-10 | 90% of entries | 1-3 matches | Single matchday |
| **Weekly** | EUR 5-50 | 90% of entries | All matches in a week | 7 days |
| **Season** | EUR 20-100 | 90% of entries | All matches in a season | Months |
| **Head-to-Head** | EUR 5-25 | 90% of entries | Specific match | Single match |
| **Private** | Custom | Custom | Custom | Custom |

### 25.2 Contest Lifecycle

```
DRAFT (creator building)
  | [Creator publishes]
  v
OPEN (accepting entries)
  | [Start time reached OR max players]
  v
LOCKED (no new entries, predictions being finalized)
  | [First event in contest starts]
  v
IN_PROGRESS (events being played)
  | [Last event in contest finishes]
  v
COMPLETED (results calculated, prizes distributed)
  | [30 days after completion]
  v
ARCHIVED (read-only, visible in history)
```

### 25.3 Contest Predictions

Unlike v1 (where contests just tracked entry), v2.0 requires explicit predictions:

1. **Entry Phase:** User joins contest, selects predictions for each required market/event
2. **Lock Phase:** At contest start time, all predictions are locked
3. **Settlement Phase:** As events finish, predictions are scored in real-time
4. **Results Phase:** Final standings calculated, prizes distributed

### 25.4 Prize Distribution

```
Example: 10-player contest, EUR 10 entry fee
  Total collected: EUR 100
  Platform fee (10%): EUR 10
  Prize pool: EUR 90

Distribution:
  1st place: EUR 40 (44.4%)
  2nd place: EUR 25 (27.8%)
  3rd place: EUR 15 (16.7%)
  4th place: EUR 10 (11.1%)
```

### 25.5 Anti-Fraud Measures

1. **Prediction locking:** No changes after deadline
2. **IP monitoring:** Flag accounts sharing IPs in same contest
3. **Behavioral analysis:** Detect pattern betting (all same predictions)
4. **Velocity limits:** Max contests joined per day
5. **Review queue:** Large wins trigger manual review before payout

---

## 26. Friends Redesign

### 26.1 Friendship Model

| Type | Bidirectional | Visibility | Interaction |
|------|--------------|------------|-------------|
| Friend | Yes | Full profile, predictions, stats | Challenge, react, comment |
| Follower | No | Public profile only | None (v2.0) |
| Blocked | One-way | Invisible | None |

**Why not follower model in v2.0:** Follower models create asymmetric social dynamics that conflict with the "friends competing equally" philosophy. SocialBets is closer to a group of friends playing a game than an influencer platform.

### 26.2 Friend Discovery

| Method | Implementation | Priority |
|--------|---------------|----------|
| Username search | Direct DB query | v2.0 |
| Referral link | URL with invite code | v2.0 |
| Mutual friends | Graph query | v2.0 |
| Suggested friends | Algorithm (shared sports, mutual friends) | v2.0 |
| Contact import | Phone contacts -> match by email/phone | v2.5 |
| QR code | Generate/scan QR for profile link | v2.5 |

### 26.3 Suggestion Algorithm

```
Score each non-friend user:
  +30 for each mutual friend
  +20 for each shared preferred sport
  +10 for same city/region
  +5 for similar win rate (within 10%)
  -50 if user has blocked you
  -20 if user has declined a previous friend request

Sort by score descending, return top 20
```

### 26.4 Head-to-Head Records

For each friend pair, pre-compute:
- Total head-to-head predictions
- Win/loss/draw record
- Favorite head-to-head sport
- Biggest win/loss
- Current streak

---

## 27. Reputation System

### 27.1 Purpose

Reputation quantifies a user's prediction skill and trustworthiness. It influences:
- Leaderboard ranking
- Contest matchmaking
- Social proof (displayed on profile)
- Suggestion algorithm

### 27.2 Reputation Dimensions

| Dimension | Metric | Calculation |
|-----------|--------|-------------|
| **Accuracy** | Win rate across all predictions | (correct / total) x 100 |
| **Volume** | Total predictions placed | Raw count |
| **Consistency** | Standard deviation of weekly win rates | Lower = more consistent |
| **Value** | ROI compared to implied odds | (actual return / expected return) x 100 |
| **Specialization** | Win rate per sport | Higher in focused sports |

### 27.3 Reputation Tiers

| Tier | Score | Badge | Perks |
|------|-------|-------|-------|
| Newcomer | 0-20 | Seedling | Access to beginner contests |
| Predictor | 21-40 | Chart | Standard features |
| Expert | 41-60 | Target | Can create premium contests |
| Master | 61-80 | Trophy | Featured in suggestions, custom badge color |
| Legend | 81-100 | Crown | Platform ambassador, beta features |

### 27.4 Reputation Decay

- Score decays 2% per week of inactivity
- Minimum score is 10 (never fully resets)
- Re-activation restores 50% of decayed score

---

## 28. Achievement System

### 28.1 Achievement Categories

**Prediction Achievements:**
| Achievement | Condition | Points |
|-------------|-----------|--------|
| First Prediction | Place first prediction | 10 |
| On a Roll | 5 correct in a row | 25 |
| On Fire | 10 correct in a row | 50 |
| Unstoppable | 25 correct in a row | 100 |
| Perfect Day | All correct in a single day | 30 |
| Perfect Week | All correct in a single week | 100 |
| Century | Place 100 predictions | 20 |
| Sharpshooter | Win rate >70% over 50+ predictions | 75 |

**Social Achievements:**
| Achievement | Condition | Points |
|-------------|-----------|--------|
| First Friend | Add first friend | 10 |
| Social Butterfly | Add 10 friends | 25 |
| Popular | Add 50 friends | 50 |
| Challenge Champion | Win 10 challenges | 50 |
| Referral Rockstar | 5 friends join via your code | 75 |

**Contest Achievements:**
| Achievement | Condition | Points |
|-------------|-----------|--------|
| First Contest | Join first contest | 10 |
| Winner | Win a contest | 50 |
| Triple Crown | Win 3 contests | 100 |
| High Roller | Join contest with EUR 50+ entry | 30 |

### 28.2 Achievement Engine

Achievements are checked asynchronously after relevant events:
1. User places prediction -> check prediction achievements
2. Prediction settles -> check streak/accuracy achievements
3. Friend added -> check social achievements
4. Contest joins/wins -> check contest achievements

### 28.3 Achievement Display

- **Profile grid:** Shows all earned achievements as a visual collection
- **Notification:** Push + in-app notification when earned
- **Activity feed:** Achievement appears in friends' feeds
- **Badges:** Top 3 achievements displayed next to username
- **Progress:** For un-earned achievements, show progress bar

---

## 29. Analytics

### 29.1 User Analytics (Personal Dashboard)

**Overview Cards:**
- Total predictions placed
- Win rate (%)
- ROI (%)
- Net profit (SocialCoins)
- Current streak / Best streak
- Global rank / Friends rank

**Charts:**
- Win rate over time (line chart, weekly)
- Profit over time (area chart, cumulative)
- Sport breakdown (pie chart)
- Market breakdown (bar chart: accuracy per market type)
- Activity heatmap (GitHub-style)

**Insights:**
- "Your best sport is Tennis (72% win rate)"
- "You're 3x more accurate on Match Result than Over/Under"
- "Your ROI has improved 15% this month"

### 29.2 Platform Analytics (Admin Dashboard)

**Key Metrics:**
- Daily/weekly/monthly active users
- New registrations
- Predictions per day
- Contest entries per day
- Revenue (platform fees)
- DAU/MAU ratio
- Retention cohorts (D1, D7, D30)

**Operational Metrics:**
- Sync success rate
- Average settlement time
- API response times (p50, p95, p99)
- Error rates by endpoint
- Cache hit rates

**Revenue Metrics:**
- Gross contest entry volume
- Platform fee collected
- Average entry fee
- Revenue per user

### 29.3 Analytics Implementation

**Phase 1 (v2.0): PostHog**
- Free tier: 1M events/month
- Product analytics, session recording, feature flags

**Phase 2 (v2.5): Custom Analytics**
- Pre-computed dashboards using materialized views
- Real-time metrics via Redis counters

**Phase 3 (v3.0): Data Warehouse**
- Export to BigQuery/Snowflake
- A/B testing framework
- Predictive analytics (user churn prediction)

---

## 30. Search

### 30.1 Search Scope

| Entity | Searchable Fields | Weight |
|--------|------------------|--------|
| Events | Team names, league name | High |
| Users | Username, display name | Medium |
| Contests | Title, description | Medium |
| Sports | Name | Low |
| Leagues | Name, country | Low |

### 30.2 Search Implementation

**v2.0: Database Full-Text Search (PostgreSQL)**
- Add generated `tsvector` columns to searchable tables
- Create GIN indexes for fast lookups
- Use `ts_rank` for relevance scoring
- Italian language configuration

**Why not Elasticsearch/Meilisearch in v2.0:** PostgreSQL FTS is sufficient for <100K entities. Adds no infrastructure complexity.

**v2.5: Meilisearch (if needed)**
- Typo tolerance, instant search (<50ms), faceted search

### 30.3 Search UX

**Global Search (Cmd+K):**
- Opens command palette overlay
- Instant results as user types (debounced 200ms)
- Results grouped by entity type
- Keyboard navigation

### 30.4 Search Ranking

```
Score = (text_relevance x 0.5) + (recency x 0.3) + (popularity x 0.2)
```

---

## 31. Mobile UX

### 31.1 Design Principles

1. **Thumb-zone optimization:** Primary actions within bottom 40% of screen
2. **One-hand operation:** All critical flows completable with one hand
3. **Offline-aware:** Show cached data when offline, queue actions
4. **Haptic feedback:** Vibration on prediction confirmation, achievement unlock
5. **Gesture navigation:** Swipe to go back, pull to refresh, long-press for quick actions

### 31.2 Mobile-Specific Components

**Bottom Sheet (replaces modals):**
- Bet slip, prediction confirmation, contest join confirmation

**Bottom Tab Bar:**
- 5 tabs (Home, Sports, Contests, Social, Me)
- Active tab highlighted with emerald accent

**Pull to Refresh:**
- Available on all scrollable pages

**Swipe Actions:**
- Prediction cards: swipe left to share, swipe right to react

### 31.3 Mobile Bet Slip

The bet slip transforms from a sidebar (desktop) to a bottom sheet (mobile):

```
Bottom Sheet (collapsed):
+-----------------------------+
| Bet Slip (3) | EUR 20 total |
+-----------------------------+

Bottom Sheet (expanded):
+-----------------------------+
| (drag handle)               |
|                             |
| Inter vence    @ 2.10  [x] |
| Over 2.5       @ 1.85  [x] |
| BTTS Yes       @ 1.72  [x] |
|                             |
| Stake: [EUR___]             |
| +-- [EUR5] [EUR10] [EUR20]  |
|                             |
| Odds total: 6.80            |
| Potential win: EUR 136.00   |
|                             |
| [Place Predictions]         |
+-----------------------------+
```

### 31.4 Offline Support

**Cached Data (available offline):**
- Sports/leagues structure, event listings, user's predictions, leaderboard

**Queued Actions (synced when online):**
- Place prediction, react to feed item, accept friend request

### 31.5 Performance Targets

| Metric | Target | Strategy |
|--------|--------|---------|
| First Contentful Paint | <1.5s | Server components, streaming SSR |
| Largest Contentful Paint | <2.5s | ISR, image optimization |
| Time to Interactive | <3.5s | Minimal client JS, code splitting |
| Cumulative Layout Shift | <0.1 | Skeleton loading, fixed dimensions |

---

## 32. Desktop UX

### 32.1 Desktop-Specific Features

**Multi-column Layout:**
- Event listing with persistent bet slip sidebar
- Split view: event detail + friend predictions side by side

**Data Density:**
- More information per screen than mobile
- Detailed statistics tables
- Multiple market views simultaneously

**Keyboard Shortcuts:**
- `Cmd+K`: Open search/command palette
- `Cmd+1-5`: Switch between main tabs
- `Cmd+B`: Toggle bet slip
- `Esc`: Close modals/overlays
- `Enter`: Submit active form

**Right-Click Context Menus:**
- Quick-predict on event cards
- Quick-challenge from friend cards
- Copy prediction details

### 32.2 Desktop Bet Slip

Persistent sidebar on the right side of the screen:

```
+---------------------------+------------------+
|                           | Bet Slip         |
| Main Content Area         | +--------------+ |
|                           | | Selection 1  | |
|                           | +--------------+ |
|                           | | Selection 2  | |
|                           | +--------------+ |
|                           | | Stake: ___   | |
|                           | | Total: 6.80  | |
|                           | | Win: 136.00  | |
|                           | +--------------+ |
|                           | | [Place]      | |
|                           | +--------------+ |
+---------------------------+------------------+
```

### 32.3 Desktop Notifications

- Toast notifications for bet results (bottom-right corner)
- Notification panel (slide-over from right)
- Browser notification API for background alerts

---

## 33. Accessibility

### 33.1 WCAG 2.1 AA Compliance

**Target:** Full WCAG 2.1 AA compliance

**Key Requirements:**
- All interactive elements keyboard-accessible
- Color contrast ratio >= 4.5:1 for text
- Color contrast ratio >= 3:1 for large text and UI components
- All images have alt text
- Form inputs have associated labels
- Error messages are announced to screen readers
- Focus indicators visible on all interactive elements
- Skip navigation link
- ARIA landmarks on page regions
- Reduced motion support (`prefers-reduced-motion`)

### 33.2 Accessibility Features

**Screen Reader Support:**
- Semantic HTML (headings, landmarks, lists)
- ARIA labels on icon-only buttons
- Live regions for dynamic content (bet slip updates, notifications)
- Announce bet placement success/failure

**Keyboard Navigation:**
- Tab order follows visual layout
- Focus trap in modals
- Arrow keys in menus and lists
- Escape to close overlays

**Visual Accessibility:**
- High contrast mode (future)
- Font size adjustment (future)
- Don't rely solely on color to convey information (use icons + text)
- Odds displayed with both color AND icon (green checkmark for winning)

### 33.3 Performance Accessibility

- Slow network support: skeleton states, progressive loading
- Large text mode: UI scales without breaking layout
- Motion sensitivity: all animations respect `prefers-reduced-motion`

---

## 34. Security

### 34.1 Authentication Security

| Measure | Implementation | Why |
|---------|---------------|-----|
| Password hashing | bcrypt, 12 salt rounds | Industry standard, GPU-resistant |
| JWT sessions | Short-lived access tokens (15 min), refresh tokens (7 days) | Limits exposure window |
| Rate limiting | 5 attempts per minute per IP on login | Prevents brute-force |
| Account lockout | 10 failed attempts -> 15 min lock | Prevents targeted attacks |
| Email verification | Required for full account activation | Prevents fake accounts |
| OAuth (future) | Google, Apple sign-in | Reduces password reuse |
| CSRF protection | SameSite cookies + Origin header validation | Prevents cross-site attacks |

### 34.2 Authorization Security

| Measure | Implementation | Why |
|---------|---------------|-----|
| Role-based access | Middleware checks `role` on every request | Enforces admin restrictions |
| Resource ownership | Services verify `userId` matches resource owner | Prevents unauthorized access |
| Input validation | Zod schemas on every API endpoint | Prevents injection attacks |
| Output sanitization | No sensitive data in responses (password hashes, internal IDs) | Prevents data leakage |
| Rate limiting | Per-user and per-IP limits on all endpoints | Prevents abuse |

### 34.3 Financial Security

| Measure | Implementation | Why |
|---------|---------------|-----|
| Atomic transactions | All balance operations in DB transactions | Prevents double-spend |
| Optimistic locking | Version column on User/Wallet | Prevents race conditions |
| Idempotency keys | Unique constraint on operation keys | Prevents duplicate charges |
| Balance validation | `CHECK (balance >= 0)` at DB level | Prevents negative balances |
| Audit trail | Every financial mutation recorded with before/after | Enables reconciliation |
| Fraud detection | Velocity limits, IP monitoring, behavioral analysis | Prevents abuse |

### 34.4 Infrastructure Security

| Measure | Implementation | Why |
|---------|---------------|-----|
| HTTPS everywhere | Vercel automatic SSL | Encrypts all traffic |
| Security headers | CSP, X-Frame-Options, HSTS, etc. | Prevents common attacks |
| Environment variables | Never committed to git, validated at startup | Prevents secret leakage |
| Database access | Connection pooling, IP allowlisting (Supabase) | Limits attack surface |
| Admin endpoints | Require ADMIN role + separate auth check | Prevents unauthorized admin access |
| API versioning | `/api/v1/` prefix | Enables breaking changes safely |
| Request logging | All requests logged with IDs | Enables forensics |

### 34.5 Security Headers Configuration

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.upstash.io
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-DNS-Prefetch-Control: on
```

---

## 35. Future Scalability

### 35.1 Scale Projections

| Milestone | Users | DAU | Concurrent | Key Requirement |
|-----------|-------|-----|------------|----------------|
| Launch | 1K | 200 | 50 | Current architecture sufficient |
| Growth | 10K | 2K | 500 | Add Redis caching, optimize queries |
| Scale | 50K | 10K | 2K | Add CDN, optimize settlement pipeline |
| Maturity | 100K | 20K | 3K | Add read replicas, optimize feed |
| Enterprise | 500K | 50K | 5K | Add sharding, dedicated workers |

### 35.2 Scaling Strategy by Layer

**Database Scaling:**
1. **Read replicas:** Supabase supports read replicas. Route read-heavy queries (leaderboard, feed, search) to replicas.
2. **Connection pooling:** PgBouncer with transaction-mode pooling. Max 100 connections.
3. **Partitioning:** Partition `Transaction`, `Bet`, `Prediction` tables by time (monthly) at 100K+ users.
4. **Sharding:** At 500K users, shard by user ID for write-heavy tables.
5. **Materialized views:** Pre-compute leaderboard, feed aggregates, user stats.

**Application Scaling:**
1. **Serverless (Vercel):** Auto-scales to handle traffic spikes. No manual intervention.
2. **Edge functions:** Move auth middleware and rate limiting to edge for <10ms latency.
3. **Background workers:** Inngest handles job scaling automatically.

**Cache Scaling:**
1. **Upstash Redis:** Auto-scales, pay-per-request. Sufficient for most workloads.
2. **CDN (Vercel):** ISR pages cached at edge. Reduces origin load.
3. **Client-side caching:** SWR/React Query cache reduces repeat requests.

**Real-time Scaling:**
1. **v2.0:** Polling (simple, works everywhere)
2. **v2.5:** SSE (server-sent events, one-way push)
3. **v3.0:** WebSocket with sticky sessions (Ably or Socket.io)
4. **v3.5:** Dedicated real-time service (separate from Next.js app)

### 35.3 Geographic Expansion

| Phase | Markets | Requirements |
|-------|---------|-------------|
| v2.0 | Italy | Italian language, EUR currency, Italian sports focus |
| v2.5 | Italy + Spain | Spanish language, La Liga focus, EUR |
| v3.0 | EU (DE, FR, UK) | Multi-language, multi-currency, GDPR compliance |
| v3.5 | Global | Multi-timezone, regulatory compliance per jurisdiction |

**Architecture for i18n:**
- All UI strings in translation files (next-intl)
- Currency formatting per locale
- Date/time formatting per timezone
- Sport naming localized (Calcio/Futbol/Football)

### 35.4 Technology Evolution Roadmap

| Version | Timeline | Key Changes |
|---------|----------|-------------|
| v2.0 | Q3 2026 | Service layer, Redis cache, Inngest jobs, shadcn/ui, admin security fix |
| v2.1 | Q4 2026 | Push notifications, activity feed, reputation system |
| v2.5 | Q1 2027 | Real-time odds (SSE), premium subscription, OAuth, contact import |
| v3.0 | Q2 2027 | WebSocket real-time, mobile app (React Native), live predictions |
| v3.5 | Q3 2027 | EU expansion, multi-currency, data warehouse, A/B testing |

### 35.5 Migration Strategy (v1 -> v2)

The migration from v1 to v2 should be done incrementally:

1. **Phase 1: Infrastructure** (non-breaking)
   - Add Redis, Inngest, Sentry, Pino
   - Add middleware.ts with auth + rate limiting
   - Add admin role to User model
   - Fix security vulnerabilities (admin endpoint, odds-from-client)

2. **Phase 2: Backend refactor** (internal)
   - Create service layer (wrap existing business logic)
   - Create repository layer (wrap existing Prisma queries)
   - Create provider layer (wrap existing integrations)
   - Add Zod validation schemas
   - Split API routes into versioned endpoints (`/api/v1/`)

3. **Phase 3: Database evolution** (migration-based)
   - Add new models (Prediction, Achievement, Notification, etc.)
   - Add version columns to existing models
   - Add soft delete columns
   - Migrate existing data (Bet -> Prediction for free picks)
   - Add indexes

4. **Phase 4: Frontend rebuild** (page-by-page)
   - Install shadcn/ui
   - Rebuild pages one at a time (new components, same functionality)
   - Add loading.tsx, error.tsx to all routes
   - Add mobile navigation
   - Add toast notifications

5. **Phase 5: New features** (additive)
   - Activity feed
   - Notification system
   - Achievement system
   - Reputation system
   - Search
   - Analytics dashboard

**Estimated timeline:** 8-12 weeks for full migration, with incremental releases every 2 weeks.

---

*This specification is a living document. It should be reviewed and updated as the product evolves. All architectural decisions should be traceable back to this document.*
