# SocialBets v2.0 — UX Design Specification

**Version:** 2.0.0
**Date:** 2026-07-12
**Status:** Draft
**Scope:** Complete UI/UX design specification for all platform pages and components

---

## Table of Contents

1. [Global Design System](#1-global-design-system)
2. [Layout & Navigation](#2-layout--navigation)
3. [Public Pages](#3-public-pages)
4. [Dashboard Pages](#4-dashboard-pages)
5. [Feature Pages](#5-feature-pages)
6. [Admin Pages](#6-admin-pages)
7. [Mobile-Specific Patterns](#7-mobile-specific-patterns)
8. [Desktop-Specific Patterns](#8-desktop-specific-patterns)
9. [Accessibility](#9-accessibility)
10. [Motion & Animation](#10-motion--animation)
11. [Empty & Error States](#11-empty--error-states)
12. [Appendix A: Component Props](#appendix-a-component-props)
13. [Appendix B: Responsive Breakpoints](#appendix-b-responsive-breakpoints)
14. [Appendix C: Typography Scale](#appendix-c-typography-scale)
15. [Appendix D: Color Tokens](#appendix-d-color-tokens)

---

## 1. Global Design System

### 1.1 Color Palette

**Dark Mode (Primary):**

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `hsl(222, 47%, 6%)` | Page background |
| `--bg-secondary` | `hsl(217, 33%, 10%)` | Card backgrounds |
| `--bg-tertiary` | `hsl(215, 25%, 14%)` | Elevated surfaces, hover states |
| `--bg-muted` | `hsl(215, 20%, 18%)` | Disabled backgrounds, inputs |
| `--border-primary` | `hsl(215, 20%, 20%)` | Card borders, dividers |
| `--border-focus` | `hsl(160, 84%, 39%)` | Focus rings, active states |
| `--text-primary` | `hsl(0, 0%, 100%)` | Headings, primary text |
| `--text-secondary` | `hsl(215, 20%, 65%)` | Body text, descriptions |
| `--text-muted` | `hsl(215, 15%, 45%)` | Timestamps, placeholders |
| `--accent-primary` | `hsl(160, 84%, 39%)` | CTAs, links, active states (emerald) |
| `--accent-primary-hover` | `hsl(160, 84%, 33%)` | Hover state for accent |
| `--accent-secondary` | `hsl(45, 93%, 47%)` | Gold, premium, highlights |
| `--accent-danger` | `hsl(0, 84%, 60%)` | Errors, destructive actions |
| `--accent-success` | `hsl(142, 71%, 45%)` | Win states, positive values |
| `--accent-warning` | `hsl(38, 92%, 50%)` | Caution, pending states |
| `--accent-info` | `hsl(217, 91%, 60%)` | Informational, links |

**Light Mode:**

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `hsl(0, 0%, 100%)` | Page background |
| `--bg-secondary` | `hsl(210, 20%, 97%)` | Card backgrounds |
| `--bg-tertiary` | `hsl(210, 16%, 93%)` | Elevated surfaces |
| `--text-primary` | `hsl(222, 47%, 6%)` | Headings, primary text |
| `--text-secondary` | `hsl(215, 15%, 35%)` | Body text |
| `--accent-primary` | `hsl(160, 84%, 33%)` | CTAs, links (deeper emerald for contrast) |

**Semantic Colors:**

| Token | Usage |
|-------|-------|
| `--color-bet-win` | `hsl(142, 71%, 45%)` + `bg-success/10` background |
| `--color-bet-loss` | `hsl(0, 84%, 60%)` + `bg-danger/10` background |
| `--color-bet-pending` | `hsl(38, 92%, 50%)` + `bg-warning/10` background |
| `--color-odds-positive` | `hsl(142, 71%, 45%)` — odds moving up |
| `--color-odds-negative` | `hsl(0, 84%, 60%)` — odds moving down |
| `--color-live` | `hsl(0, 84%, 60%)` with pulse animation |
| `--color-sport-calcio` | `hsl(142, 71%, 45%)` — green |
| `--color-sport-basket` | `hsl(25, 95%, 53%)` — orange |
| `--color-sport-tennis` | `hsl(45, 93%, 47%)` — yellow |
| `--color-sport-f1` | `hsl(0, 84%, 60%)` — red |
| `--color-sport-mma` | `hsl(280, 67%, 50%)` — purple |

### 1.2 Typography

**Font Stack:**
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

**Type Scale:**

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--text-4xl` | 2.25rem (36px) | 800 | 1.2 | Hero headings |
| `--text-3xl` | 1.875rem (30px) | 700 | 1.25 | Page titles |
| `--text-2xl` | 1.5rem (24px) | 700 | 1.3 | Section headings |
| `--text-xl` | 1.25rem (20px) | 600 | 1.4 | Card titles |
| `--text-lg` | 1.125rem (18px) | 600 | 1.5 | Subsection headings |
| `--text-base` | 1rem (16px) | 400 | 1.5 | Body text |
| `--text-sm` | 0.875rem (14px) | 400 | 1.5 | Secondary text |
| `--text-xs` | 0.75rem (12px) | 500 | 1.4 | Labels, badges, timestamps |

**Odds Display:**
- Font: `--font-mono`
- Weight: 700
- Size: `--text-lg` (card context) or `--text-base` (compact context)
- Format: Decimal (2.10, 1.85) — European standard

### 1.3 Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | 0px | — |
| `--space-1` | 4px | Tight inner spacing |
| `--space-2` | 8px | Compact spacing |
| `--space-3` | 12px | Default inner spacing |
| `--space-4` | 16px | Standard spacing |
| `--space-5` | 20px | Medium spacing |
| `--space-6` | 24px | Section spacing |
| `--space-8` | 32px | Large spacing |
| `--space-10` | 40px | XL spacing |
| `--space-12` | 48px | Section gaps |
| `--space-16` | 64px | Page section dividers |

### 1.4 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Badges, small elements |
| `--radius-md` | 8px | Buttons, inputs, cards |
| `--radius-lg` | 12px | Modals, large cards |
| `--radius-xl` | 16px | Bottom sheets, feature cards |
| `--radius-2xl` | 24px | Hero cards, avatars (full) |
| `--radius-full` | 9999px | Pills, circular elements |

### 1.5 Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | Subtle elevation |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.3)` | Card hover |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.3)` | Dropdown, popover |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.3)` | Modal, bottom sheet |

### 1.6 Component Primitives

**Button Variants:**

| Variant | Background | Text | Border | Hover |
|---------|-----------|------|--------|-------|
| `primary` | `--accent-primary` | white | none | `--accent-primary-hover` |
| `secondary` | transparent | `--text-primary` | `--border-primary` | `--bg-tertiary` |
| `ghost` | transparent | `--text-secondary` | none | `--bg-tertiary` |
| `danger` | `--accent-danger` | white | none | darken 10% |
| `link` | transparent | `--accent-primary` | none | underline |

**Button Sizes:**

| Size | Height | Padding | Font |
|------|--------|---------|------|
| `sm` | 32px | `--space-2 --space-3` | `--text-xs` |
| `md` | 40px | `--space-3 --space-4` | `--text-sm` |
| `lg` | 48px | `--space-4 --space-6` | `--text-base` |
| `xl` | 56px | `--space-5 --space-8` | `--text-lg` |

**Input States:**

| State | Border | Background | Ring |
|-------|--------|------------|------|
| Default | `--border-primary` | `--bg-muted` | none |
| Focus | `--accent-primary` | `--bg-muted` | `0 0 0 3px accent/20` |
| Error | `--accent-danger` | `--bg-muted` | `0 0 0 3px danger/20` |
| Disabled | `--border-primary` | `--bg-tertiary` | none |

**Card Variants:**

| Variant | Background | Border | Shadow | Padding |
|---------|-----------|--------|--------|---------|
| `default` | `--bg-secondary` | `--border-primary` | none | `--space-4` |
| `elevated` | `--bg-secondary` | none | `--shadow-md` | `--space-4` |
| `interactive` | `--bg-secondary` | `--border-primary` | none → `--shadow-md` on hover | `--space-4` |
| `accent` | `--accent-primary/10` | `--accent-primary/30` | none | `--space-4` |

### 1.7 Status Indicators

| Status | Badge Color | Text | Icon |
|--------|------------|------|------|
| `UPCOMING` | `--accent-info/15` + `--accent-info` text | "Upcoming" | Calendar |
| `LIVE` | `--accent-danger/15` + `--accent-danger` text + pulse | "Live" | Radio |
| `FINISHED` | `--bg-muted` + `--text-muted` text | "Finished" | Check |
| `LOCKED` | `--accent-warning/15` + `--accent-warning` text | "Locked" | Lock |
| `SETTLED` | `--accent-success/15` + `--accent-success` text | "Settled" | Trophy |
| `CANCELLED` | `--accent-danger/15` + `--accent-danger` text | "Cancelled" | X |

---

## 2. Layout & Navigation

### 2.1 Root Layout

```
<html lang="it" class="dark">
  <body class="bg-primary text-primary font-sans antialiased">
    <Providers>
      <SkipNavLink />                    <!-- Accessibility: skip to main -->
      <DesktopNav />                     <!-- Top bar, hidden < md -->
      <MobileNav />                      <!-- Bottom tabs, hidden >= md -->
      <NotificationCenter />             <!-- Slide-over panel -->
      <CommandPalette />                 <!-- Cmd+K overlay -->
      <Toaster />                        <!-- Toast notifications -->
      <main id="main-content" tabindex="-1">
        {children}
      </main>
    </Providers>
  </body>
</html>
```

### 2.2 Desktop Navigation

**Top Bar (h-16, fixed top, z-50):**

```
+--------------------------------------------------------------------------+
| [Logo 120px]  [Home] [Sports] [Contests] [Challenges] [Friends]         |
|                                                                  [🔔 3] |
|                                                     [€ 125.00] [Avatar] |
+--------------------------------------------------------------------------+
```

| Element | Width | Behavior |
|---------|-------|----------|
| Logo | 120px fixed | Links to `/home` |
| Nav links | Auto | Text, 14px, font-medium. Active: `--accent-primary` underline 2px. Hover: `--text-primary` |
| Notification bell | 40px hit target | Icon with count badge (red circle, white text, 18px). Opens slide-over |
| Wallet badge | Auto | Euro icon + balance. Click → `/wallet` |
| User avatar | 32px circle | Click → dropdown (Profile, Settings, Logout) |

**Left Sidebar (w-64, fixed left, below top bar, z-40):**

```
+------------------+
| SPORTS           |
| ⚽ Calcio        |
|   ├ Serie A      |
|   ├ Premier League|
|   ├ La Liga      |
|   └ Champions    |
| 🏀 Basket        |
|   ├ NBA          |
|   └ Serie A      |
| 🎾 Tennis        |
|   └ ATP          |
| 🏎️ F1            |
| 🥊 MMA           |
| ---------------- |
| QUICK LINKS      |
| 📊 Leaderboard   |
| 💰 Wallet        |
| ⚙️ Settings      |
+------------------+
```

- Width: 256px (expandable to 280px on hover)
- Sport items: icon + name, expand on click to show leagues
- Active sport/league: `--accent-primary` background tint
- Scrollable if content overflows

### 2.3 Mobile Navigation

**Bottom Tab Bar (h-16, fixed bottom, z-50):**

```
+---------------------------------------------------------------+
|  🏠 Home    ⚽ Sports   🏆 Contests   👥 Social   👤 Me     |
|    (2)                  (1)           (5)                    |
+---------------------------------------------------------------+
```

| Tab | Icon | Label | Badge | Route |
|-----|------|-------|-------|-------|
| Home | House | Home | Notification count | `/home` |
| Sports | Trophy | Sports | Live events count | `/sports` |
| Contests | Users | Contests | Active contest count | `/contests` |
| Social | UsersGroup | Social | Friend request count | `/friends` |
| Me | User | Me | none | `/profile` |

- Height: 64px (safe area aware on iOS)
- Active tab: `--accent-primary` icon + label
- Inactive: `--text-muted` icon + label
- Badge: red circle (16px) with white text, positioned top-right of icon
- Safe area padding: `env(safe-area-inset-bottom)`

### 2.4 Page Container

```
Max-width: 1280px
Padding: --space-6 (desktop), --space-4 (mobile)
Margin: auto
```

For full-width pages (leaderboard, admin): remove max-width constraint.

---

## 3. Public Pages

### 3.1 Landing Page (`/`)

**Route:** `/`
**Auth:** No
**Type:** Server component (static marketing)

**Layout:**
```
+------------------------------------------------------------------+
| PublicHeader (h-16, transparent → solid on scroll)               |
|   [Logo]                          [Login] [Registrati] (buttons) |
+------------------------------------------------------------------+
|                                                                   |
| HeroSection (min-h-[80vh])                                       |
|   +-- Left column (60%)                                          |
|   |   +-- Headline: "Dimostra che conosci più dei tuoi amici"    |
|   |   |   Font: --text-4xl, font-extrabold, tracking-tight       |
|   |   +-- Subheadline: "La piattaforma social per le             |
|   |   |   predizioni sportive"                                   |
|   |   |   Font: --text-xl, --text-secondary, max-w-lg            |
|   |   +-- CTA Row                                                |
|   |   |   +-- [Registrati Gratis] (primary, xl, h-14)            |
|   |   |   +-- [Scopri di più] (secondary, xl, h-14)              |
|   |   +-- Social proof bar                                        |
|   |       +-- "12,500+ predittori attivi"                        |
|   |       +-- "€45,000+ premi distribuiti"                       |
|   |       +-- "4.8 ★ rating"                                     |
|   +-- Right column (40%)                                         |
|       +-- HeroImage/AppMockup (max-h-[500px])                    |
|       +-- Floating stat cards (absolute positioned)              |
|           +-- "Milan vence 2-1" (prediction card, rotated -3deg) |
|           +-- "+€250 ganancia" (profit card, rotated 2deg)       |
|           +-- "#1 en el ranking" (ranking card)                  |
|                                                                   |
+------------------------------------------------------------------+
| HowItWorksSection (py-20, bg-secondary)                          |
|   +-- SectionTitle: "Come funziona" (centered, --text-3xl)       |
|   +-- 3-column grid (gap-8)                                      |
|       +-- Step 1                                                  |
|       |   +-- Icon (48px, --accent-primary)                      |
|       |   +-- "Scegli il tuo sport" (--text-xl, font-semibold)   |
|       |   +-- "Esplora eventi, leghe e mercati" (--text-base)    |
|       +-- Step 2                                                  |
|       |   +-- Icon                                                |
|       |   +-- "Fai la tua predizione"                             |
|       |   +-- "Scegli l'esito e la puntata"                      |
|       +-- Step 3                                                  |
|           +-- Icon                                                |
|           +-- "Competi con gli amici"                             |
|           +-- "Classifiche, contest e sfide"                     |
|                                                                   |
+------------------------------------------------------------------+
| StatsBar (py-12, bg-primary)                                     |
|   +-- 4-column grid                                               |
|       +-- Stat: "12,500+" / "Utenti attivi"                      |
|       +-- Stat: "89,000+" / "Predizioni totali"                  |
|       +-- Stat: "2,400+" / "Contest completati"                  |
|       +-- Stat: "€45,000+" / "Premi distribuiti"                 |
|   +-- Numbers: --text-3xl, font-bold, --accent-primary           |
|   +-- Labels: --text-base, --text-secondary                      |
|                                                                   |
+------------------------------------------------------------------+
| TestimonialsSection (py-20, bg-secondary)                         |
|   +-- SectionTitle: "Cosa dicono i nostri utenti"                |
|   +-- 3-column grid                                               |
|       +-- TestimonialCard                                         |
|           +-- Quote text (--text-lg, italic)                      |
|           +-- Avatar (48px circle)                                |
|           +-- Name + "@username" (--text-sm)                      |
|           +-- "Utente dal Gen 2026" (--text-xs, --text-muted)    |
|                                                                   |
+------------------------------------------------------------------+
| CTASection (py-20, bg-gradient from accent-primary to emerald-700)|
|   +-- Title: "Pronto a competere?" (--text-3xl, white)           |
|   +-- Subtitle: "Unisciti a migliaia di sportivi" (--text-xl)    |
|   +-- [Registrati Gratis] (white bg, text-emerald, xl)           |
|                                                                   |
+------------------------------------------------------------------+
| PublicFooter (py-12, bg-primary, border-t)                        |
|   +-- 4-column grid                                               |
|       +-- Col 1: Logo + description                               |
|       +-- Col 2: Piattaforma (Home, Sport, Contest)              |
|       +-- Col 3: Legale (Termini, Privacy, Cookie)               |
|       +-- Col 4: Social (Twitter, Instagram, Discord)            |
|   +-- Bottom row: © 2026 SocialBets. Tutti i diritti riservati.  |
+------------------------------------------------------------------+
```

**Scroll Behavior:**
- Header transitions from transparent to `bg-primary/95 backdrop-blur` after 50px scroll
- Smooth scroll to sections on anchor click
- Stats numbers animate on scroll into view (count-up animation)

### 3.2 Login Page (`/login`)

**Route:** `/login`
**Auth:** No
**Type:** Client component

**Layout:**
```
+------------------------------------------+
| AuthLayout (centered, min-h-screen)      |
|   +-- bg-primary                         |
|   +-- flex items-center justify-center   |
|   +-- p-4                                |
|                                          |
|   +-- Card (w-full max-w-md, p-8)        |
|       +-- Logo (h-10, mx-auto, mb-8)     |
|       +-- Title: "Accedi" (--text-2xl)   |
|       +-- Subtitle: "Bentornato!"        |
|       |   (--text-secondary)             |
|                                          |
|       +-- Form                           |
|           +-- FormField: Email            |
|           |   +-- Label: "Email"          |
|           |   +-- Input type="email"      |
|           |   +-- placeholder:            |
|           |       "nome@esempio.com"      |
|           |                              |
|           +-- FormField: Password         |
|           |   +-- Label: "Password"       |
|           |   +-- Input type="password"   |
|           |   +-- [👁] toggle visibility  |
|           |                              |
|           +-- Row:                        |
|           |   +-- [x] Ricordami          |
|           |   +-- "Password dimenticata?" |
|           |       (link, --accent-primary)|
|           |                              |
|           +-- [Accedi] (primary, w-full,  |
|               h-12, mt-4)                |
|                                          |
|           +-- Divider: "oppure"          |
|           |   (flex, line + text + line)  |
|                                          |
|           +-- [Continua con Google]       |
|               (secondary, w-full, h-12)  |
|               (disabled, "Coming soon")   |
|                                          |
|           +-- p: "Non hai un account?"   |
|               +-- [Registrati] (link)    |
+------------------------------------------+
```

**Validation:**
- Email: required, valid format
- Password: required, min 8 chars
- Errors appear below each field: `--text-danger`, `--text-sm`
- Submit button: loading spinner state during API call
- Rate limit message after 5 failed attempts

### 3.3 Register Page (`/register`)

**Route:** `/register`
**Auth:** No
**Type:** Client component

**Layout:**
```
+------------------------------------------+
| AuthLayout (centered, min-h-screen)      |
|                                          |
|   +-- Card (w-full max-w-md, p-8)        |
|       +-- Logo (h-10, mx-auto, mb-8)     |
|       +-- Title: "Crea il tuo account"   |
|       +-- Subtitle: "Inizia a competere" |
|                                          |
|       +-- Form                           |
|           +-- FormField: Name             |
|           |   +-- Label: "Nome"           |
|           |   +-- Input                   |
|           |   +-- placeholder: "Mario"    |
|           |                              |
|           +-- FormField: Username         |
|           |   +-- Label: "Username"       |
|           |   +-- Input + prefix "@"      |
|           |   +-- Availability check      |
|           |   |   (debounced 300ms)       |
|           |   +-- States:                 |
|           |       +-- Checking... (spinner)|
|           |       +-- ✓ Disponibile (green)|
|           |       +-- ✗ Non disponibile   |
|           |           (red)               |
|           |                              |
|           +-- FormField: Email            |
|           |   +-- Input type="email"      |
|           |                              |
|           +-- FormField: Password         |
|           |   +-- Input type="password"   |
|           |   +-- PasswordStrength        |
|           |       +-- Progress bar        |
|           |       +-- "Debole/Forte" text |
|           |       +-- Requirements list:  |
|           |           +-- ✓ 8+ caratteri  |
|           |           +-- ✓ Una maiuscola |
|           |           +-- ✓ Un numero     |
|           |           +-- ✓ Un simbolo    |
|           |                              |
|           +-- FormField: Confirm Password |
|           |   +-- Input type="password"   |
|           |   +-- Match indicator         |
|           |                              |
|           +-- FormField: Invite Code      |
|           |   +-- Label: "Codice invito   |
|           |   |   (opzionale)"            |
|           |   +-- Input                   |
|           |   +-- Pre-filled from ?ref=   |
|           |                              |
|           +-- [x] Accetto i Termini       |
|               di Servizio e la Privacy   |
|               Policy (linked)            |
|                                          |
|           +-- [Crea Account] (primary,    |
|               w-full, h-12, mt-4)        |
|                                          |
|           +-- p: "Hai già un account?"   |
|               +-- [Accedi] (link)        |
+------------------------------------------+
```

**Validation:**
- Name: required, 2-50 chars
- Username: required, 3-20 chars, alphanumeric + underscore, unique check
- Email: required, valid format, unique check
- Password: required, min 8 chars, strength indicator
- Confirm Password: must match
- Terms checkbox: required
- Submit: disabled until all valid + terms accepted

---

## 4. Dashboard Pages

### 4.1 Home Feed (`/home`)

**Route:** `/home`
**Auth:** Yes
**Type:** Server + Client

**Layout:**
```
PageContainer
+-- WelcomeHeader (mb-6)
|   +-- h1: "Ciao, {name}!" (--text-2xl, font-bold)
|   +-- p: "{date} — {sport} in evidenza" (--text-secondary)
|
+-- QuickActionsRow (mb-8, flex gap-3, overflow-x-auto mobile)
|   +-- ActionCard: "Nuova predizione"
|   |   +-- Icon: Target (24px, --accent-primary)
|   |   +-- Label: "Piazza una predizione"
|   |   +-- [Vai] (ghost, sm)
|   |   +-- bg: --accent-primary/5, border: --accent-primary/20
|   |   +-- Display condition: no predictions placed today
|   |
|   +-- ActionCard: "Unisciti a un contest"
|   |   +-- Icon: Trophy (24px, --accent-secondary)
|   |   +-- Label: "C'è un contest aperto"
|   |   +-- [Esplora] (ghost, sm)
|   |   +-- Display condition: no active contest entries
|   |
|   +-- ActionCard: "Sfida un amico"
|       +-- Icon: Swords (24px, --accent-info)
|       +-- Label: "Sfida qualcuno"
|       +-- [Sfida] (ghost, sm)
|
+-- TodaysEventsSection (mb-8)
|   +-- SectionHeader
|   |   +-- h2: "Oggi" (--text-xl, font-semibold)
|   |   +-- Badge: "{count} eventi" (sm, secondary)
|   |   +-- Link: "Vedi tutti →" (accent, sm, to="/sports")
|   |
|   +-- EventGrid (grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4)
|       +-- EventCard[] (interactive, see 4.2 for full spec)
|
+-- FriendsActivitySection (mb-8)
|   +-- SectionHeader
|   |   +-- h2: "Amici" (--text-xl)
|   |   +-- Link: "Vedi tutto →" (to="/feed")
|   |
|   +-- ActivityFeed (stack, gap-3)
|       +-- ActivityItem[] (max 5)
|           +-- Row: Avatar(32px) + Username + ActionText + TimeAgo
|           +-- Example: "[Avatar] Marco ha predetto Inter vince · 2h fa"
|           +-- Example: "[Avatar] Luca ha vinto un contest · 5h fa"
|           +-- ActionText: --text-secondary
|           +-- TimeAgo: --text-muted, --text-xs
|
+-- FeaturedContestsSection (mb-8)
|   +-- SectionHeader
|   |   +-- h2: "Contest in evidenza"
|   |   +-- Link: "Vedi tutti →" (to="/contests")
|   |
|   +-- ContestScroll (flex overflow-x-auto gap-4, snap-x, pb-2)
|       +-- ContestCard[] (min-w-[280px], snap-start, see 5.1)
|
+-- TrendingPredictionsSection
    +-- SectionHeader
    |   +-- h2: "Predizioni del momento"
    |   +-- Badge: "🔥 Trending"
    |
    +-- TrendingGrid (grid 1 md:2 cols, gap-4)
        +-- TrendingCard[]
            +-- EventInfo: "Inter vs Milan — Serie A"
            +-- Prediction: "Inter vince" + odds @ 2.10
            +-- PredictedBy: "342 persone"
            +-- YourFriends: "Marco, Luca, 3 altri"
```

### 4.2 Event Card (Used across pages)

```
EventCard (bg-secondary, border rounded-lg, hover:shadow-md transition)
+-- Top row (flex justify-between items-center)
|   +-- LeagueBadge
|   |   +-- LeagueLogo (16px)
|   |   +-- LeagueName (--text-xs, --text-secondary)
|   +-- StatusBadge
|       +-- "LIVE" (red, pulse animation)
|       +-- "Upcoming" (blue)
|       +-- "FT" (gray)
|
+-- Teams section (py-3)
|   +-- Row: TeamHome (font-semibold, --text-base)
|   |   +-- TeamLogo (20px)
|   |   +-- TeamName
|   |   +-- Score (if live/finished, --text-xl, font-bold)
|   +-- "vs" (--text-muted, --text-xs)
|   +-- Row: TeamAway
|
+-- Quick odds (flex gap-2, mb-3)
|   +-- OddsButton: "1" + odds (e.g., "2.10")
|   |   +-- bg: --bg-tertiary
|   |   +-- Active: bg: --accent-primary, text: white
|   |   +-- Hover: bg: --accent-primary/20
|   +-- OddsButton: "X" + odds
|   +-- OddsButton: "2" + odds
|
+-- Bottom row (flex justify-between items-center)
|   +-- TimeInfo
|   |   +-- If upcoming: "Oggi, 20:45" (--text-sm, --text-secondary)
|   |   +-- If live: "72'" (--text-danger, font-semibold)
|   |   +-- If finished: "Terminata" (--text-muted)
|   +-- FriendsPredicting
|       +-- "3 amici" (icon: Users, --text-xs, --text-secondary)
|
+-- Expandable (on click/tap)
    +-- MarketTabs: [Risultato] [O/U 2.5] [BTTS]
    +-- OutcomeButtons[] (full width, with odds)
    +-- [Dettagli] link to Event Detail
```

### 4.3 Sports Overview (`/sports`)

**Route:** `/sports`
**Auth:** Yes
**Type:** Server

**Layout:**
```
PageContainer
+-- SportsFilterTabs (mb-6, sticky top-16 z-30, bg-primary/95 backdrop-blur)
|   +-- Tabs: [Tutti] [⚽ Calcio] [🏀 Basket] [🎾 Tennis] [🏎️ F1] [🥊 MMA]
|   +-- Active: --accent-primary underline
|   +-- Horizontal scroll on mobile
|
+-- LeagueGrid (grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4)
    +-- LeagueCard[] (interactive)
        +-- Top: LeagueLogo (32px) + LeagueName (font-semibold) + Country flag
        +-- Middle: "{count} eventi" + UpcomingBadge "Prossimo: Oggi 20:45"
        +-- Bottom: [Esplora] ghost button
        +-- Click → /sports/{sport}/{league}
```

### 4.4 League Detail (`/sports/[sport]/[league]`)

**Route:** `/sports/[sport]/[league]`
**Auth:** Yes
**Type:** Server + Client

**Layout:**
```
PageContainer
+-- Breadcrumb: Home / Sports / {Sport} / {League}
+-- LeagueHeader (mb-6)
|   +-- LeagueLogo (48px) + LeagueName (--text-2xl) + Country + Season
|
+-- EventFilterTabs (mb-4, sticky top-16)
|   +-- [Prossimi] [In corso] [Terminati]
|
+-- TwoColumnLayout (lg:grid lg:grid-cols-[1fr_340px] gap-6)
|   +-- EventList (stack, gap-3)
|   |   +-- EventCard[] (full spec with odds buttons)
|   |   +-- LoadMore (at bottom, if paginated)
|   |   +-- EmptyState (if no events)
|   |
|   +-- BetSlipPanel (lg:sticky lg:top-20)
|       +-- Desktop: sticky sidebar (see 8.2)
|       +-- Mobile: bottom sheet (see 7.3)
```

### 4.5 Event Detail (`/sports/[sport]/[league]/[event]`)

**Route:** `/sports/[sport]/[league]/[event]`
**Auth:** Yes
**Type:** Server + Client

**Layout:**
```
PageContainer
+-- Breadcrumb: Home / Sports / {Sport} / {League} / {Event}
+-- EventHeader (mb-6, bg-secondary, rounded-lg, p-6)
|   +-- Row: StatusBadge + LeagueBadge
|   +-- Teams (flex items-center justify-center gap-8, py-4)
|   |   +-- TeamHome (stack items-center)
|   |   |   +-- TeamLogo (64px)
|   |   |   +-- TeamName (--text-lg, font-semibold)
|   |   +-- ScoreDisplay (if live/finished)
|   |   |   +-- Score: "{home} - {away}" (--text-4xl, font-bold, mono)
|   |   |   +-- "72'" (if live, --text-danger, animate-pulse)
|   |   |   +-- "Terminata" (if finished)
|   |   +-- TeamAway (stack items-center)
|   |       +-- TeamLogo (64px)
|   |       +-- TeamName
|   +-- EventMeta (flex justify-center gap-6, --text-sm, --text-secondary)
|       +-- "📅 15 Gen 2026"
|       +-- "🏟️ San Siro"
|       +-- "👥 847 predizioni"
|
+-- MarketsSection (mb-8)
|   +-- MarketTabs (horizontal scroll, gap-1)
|   |   +-- Tab: "Risultato Finale" (active)
|   |   +-- Tab: "Over/Under 2.5"
|   |   +-- Tab: "BTTS"
|   |   +-- Tab: "Handicap" (if available)
|   |   +-- Tab: "+ Altri" (expandable)
|   |
|   +-- ActiveMarketPanel (bg-secondary, rounded-lg, p-4)
|       +-- Market name as header
|       +-- OutcomeGrid (grid grid-cols-3 gap-3)
|           +-- OutcomeButton (full width)
|           |   +-- Team/Outcome name (centered)
|           |   +-- Odds: "@ 2.10" (mono, bold)
|           |   +-- Active: bg --accent-primary, text white
|           |   +-- Size: h-16
|
+-- FriendsPredictionsSection (mb-8)
|   +-- h3: "Cosa pensano i tuoi amici" (--text-lg, font-semibold)
|   +-- FriendsGrid (grid grid-cols-2 md:grid-cols-4 gap-3)
|       +-- FriendPredictionCard[]
|           +-- Avatar (32px) + Username
|           +-- Prediction: "Inter vince"
|           +-- Confidence: ●●●○○ (if set)
|           +-- Anonymized if before lock time
|
+-- StatsSection (mb-8, bg-secondary, rounded-lg, p-6)
|   +-- h3: "Statistiche"
|   +-- StatsGrid (grid grid-cols-2 md:grid-cols-4 gap-4)
|       +-- Stat: "Scontri diretti" / "5V - 3P - 2N"
|       +-- Stat: "Forma ultime 5" / "W-W-L-W-W"
|       +-- Stat: "Gol per partita" / "2.1"
|       +-- Stat: "BTTS %" / "65%"
|
+-- DiscussionSection (mb-8)
|   +-- h3: "Discussione" + CommentCount badge
|   +-- CommentInput (avatar + input + [Invia])
|   +-- CommentThread[] (stack, gap-4)
|       +-- Comment
|           +-- Avatar + Username + TimeAgo
|           +-- Comment text
|           +-- Reactions: [👍 12] [🔥 5]
|           +-- [Rispondi] (ghost, xs)
|
+-- BetSlipPanel (persistent, right sidebar on desktop)
```

### 4.6 My Predictions (`/predictions`)

**Route:** `/predictions`
**Auth:** Yes
**Type:** Server

**Layout:**
```
PageContainer
+-- PageHeader: "Le mie predizioni" (--text-2xl)
|
+-- Tabs (sticky top-16, bg-primary/95 backdrop-blur)
|   +-- [Attive ({count})] [Storico] [Statistiche]
|
+-- ActiveTab (if active)
|   +-- FilterBar (flex gap-3, mb-4)
|   |   +-- SportFilter: [Tutti] [Calcio] [Basket] ...
|   |   +-- DateRange: [Oggi] [Questa settimana] [Questo mese]
|   |
|   +-- PredictionCard[] (stack, gap-3)
|       +-- Row: EventInfo | Prediction | Stake | Status
|       +-- EventInfo: "Inter vs Milan — Serie A, Oggi 20:45"
|       +-- Prediction: "Inter vince @ 2.10"
|       +-- Stake: "€10 → Potenziale: €21"
|       +-- StatusBadge: "In attesa" (yellow) | "Bloccata" (gray)
|       +-- Confidence: ●●●○○ (if set, subtle bar)
|       +-- [Modifica] ghost button (only if editable)
|
+-- HistoryTab
|   +-- FilterBar
|   |   +-- ResultFilter: [Tutti] [Vinte ✓] [Perse ✗]
|   |   +-- DateRange picker
|   |   +-- SortBar: [Data] [Profitto] [Quote]
|   |
|   +-- SummaryCards (grid grid-cols-4 gap-3, mb-4)
|       +-- Card: "Vinte" / "42" (green)
|       +-- Card: "Win Rate" / "65%" (accent)
|       +-- Card: "ROI" / "+12.5%" (green)
|       +-- Card: "Profitto" / "+€340" (green)
|   |
|   +-- PredictionCard[] (settled, with result)
|       +-- ResultBadge: "✓ Vinta" (green) | "✗ Persa" (red)
|       +-- Settlement details
|
+-- StatsTab
    +-- SummaryCards (same as history)
    +-- ChartsGrid (grid grid-cols-1 md:grid-cols-2 gap-6)
        +-- WinRateChart (line chart, weekly)
        +-- ProfitChart (area chart, cumulative)
        +-- SportBreakdownChart (pie chart)
        +-- MarketBreakdownChart (bar chart: accuracy per market)
    +-- Insights (stack, gap-3)
        +-- InsightCard: "Il tuo sport migliore è Tennis (72% win rate)"
        +-- InsightCard: "Sei 3x più preciso su Risultato che O/U"
```

### 4.7 Notification Center (Slide-over)

```
NotificationCenter (fixed inset-y-0 right-0, w-96, z-50, bg-secondary)
+-- Backdrop (fixed inset-0, bg-black/50, fade-in)
+-- Panel (slide-in from right)
    +-- Header (flex justify-between items-center, p-4, border-b)
    |   +-- h2: "Notifiche" (--text-lg, font-semibold)
    |   +-- Button: "Segna tutte come lette" (ghost, sm)
    +-- NotificationList (overflow-y-auto, flex-1)
        +-- NotificationItem[] (p-4, border-b, hover:bg-tertiary)
            +-- Row: Icon | Content | TimeAgo
            +-- Icon: (16px, color by type)
            |   +-- 🔵 Bet result: blue
            |   +-- 🏆 Contest: gold
            |   +-- 👥 Friend: accent
            |   +-- 🎯 Achievement: purple
            +-- Content:
            |   +-- Title: "Hai vinto la scommessa!" (font-semibold)
            |   +-- Body: "Inter vince — hai guadagnato €21" (--text-sm)
            +-- TimeAgo: "2h fa" (--text-xs, --text-muted)
            +-- Unread indicator: accent-primary dot (8px)
        +-- EmptyState: "Nessuna notifica"
        +-- LoadMore (at bottom)
```

---

## 5. Feature Pages

### 5.1 Contests (`/contests`)

**Route:** `/contests`
**Auth:** Yes
**Type:** Server

**Layout:**
```
PageContainer
+-- PageHeader (flex justify-between items-center, mb-6)
|   +-- h1: "Contest" (--text-2xl)
|   +-- Button: "+ Crea Contest" (primary, md)
|
+-- Tabs (sticky top-16)
|   +-- [Aperti] [I miei contest] [Completati]
|
+-- FilterBar (flex gap-3, mb-4, overflow-x-auto mobile)
|   +-- SportFilter dropdown
|   +-- EntryFeeRange: slider [€1 — €500]
|   +-- TimeRemaining: [Oggi] [Questa settimana] [Tutto]
|   +-- SortBy: [Premio] [Tempo] [Partecipanti]
|
+-- ContestGrid (grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4)
    +-- ContestCard[] (interactive)
        +-- Header
        |   +-- StatusBadge: "APERTO" (green) | "IN CORSO" (blue) | "CHIUSO" (gray)
        |   +-- Creator: Avatar(24px) + "@username"
        |
        +-- Body
        |   +-- Title: "Serie A — Giornata 20" (font-semibold)
        |   +-- Description: "Predici 5 partite della Serie A" (--text-sm, --text-secondary, line-clamp-2)
        |   +-- LinkedEvents: "5 eventi collegati" (--text-xs, --text-muted)
        |
        +-- Stats (grid grid-cols-2 gap-2, my-3)
        |   +-- Stat: "€10" / "Entry"
        |   +-- Stat: "€90" / "Montepremi"
        |   +-- Stat: "8/10" / "Giocatori"
        |   +-- Stat: "2g 5h" / "Rimasto"
        |
        +-- PlayerBar (Progress bar, 4px height, accent-primary)
        |
        +-- Footer
            +-- [Unisciti] (primary, full width) if OPEN + not joined
            +-- [Entra] (accent, full width) if joined
            +-- [Pieno] (secondary, disabled) if full
            +-- [Risultati] (secondary, full width) if COMPLETED
```

### 5.2 Contest Detail (`/contests/[id]`)

**Route:** `/contests/[id]`
**Auth:** Yes
**Type:** Server + Client

**Layout:**
```
PageContainer
+-- Breadcrumb: Contest / {ContestTitle}
+-- ContestHeader (bg-secondary, rounded-lg, p-6, mb-6)
|   +-- Row: Title + StatusBadge
|   +-- Description (--text-secondary)
|   +-- StatsRow (grid grid-cols-4 gap-4, mt-4)
|   |   +-- "€10" / "Entry"
|   |   +-- "€90" / "Montepremi"
|   |   +-- "€10" / "Commissione (10%)"
|   |   +-- "2g 5h" / "Rimasto"
|   +-- Participants: "8/10 giocatori"
|   +-- Action: [Unisciti ora] (primary, lg) or [Tu partecipi ✓]
|
+-- Tabs: [Classifica] [Predizioni] [Discussione]
|
+-- StandingsTab
|   +-- Podium (flex justify-center gap-4, mb-6)
|   |   +-- #2 card (silver gradient, slightly smaller)
|   |   +-- #1 card (gold gradient, largest, center)
|   |   +-- #3 card (bronze gradient, smallest)
|   |   +-- Each: Avatar + Username + WinCount
|   |
|   +-- RankingTable
|       +-- Headers: # | Utente | Corrette | Totali | Win Rate
|       +-- Row[] (highlight current user row)
|       +-- Current user: bg-accent-primary/10, border-l-2 accent
|
+-- PredictionsTab
|   +-- ParticipantList (stack, gap-3)
|       +-- ParticipantCard[] (per participant)
|           +-- Header: Avatar + Username + CurrentRank
|           +-- Predictions: "Inter vince ✓ | O/U 2.5 Sì ✓ | BTTS No ✗"
|           +-- Score: "2/3 corrette"
|
+-- DiscussionTab
    +-- CommentThread[] (same pattern as Event Detail)
```

### 5.3 Create Contest (`/contests/new`)

**Route:** `/contests/new`
**Auth:** Yes
**Type:** Client

**Layout:**
```
PageContainer (max-w-2xl, mx-auto)
+-- PageHeader: "Crea un Contest"
+-- StepIndicator (flex justify-center gap-2, mb-8)
|   +-- Step 1: "Info" (circle: bg-accent-primary, text white)
|   +-- Step 2: "Regole" (circle: bg-muted)
|   +-- Step 3: "Eventi" (circle: bg-muted)
|   +-- Step 4: "Conferma" (circle: bg-muted)
|   +-- Lines connecting (2px, bg-muted or accent depending on completed)
|
+-- StepContent (bg-secondary, rounded-lg, p-6)
    +-- Step 1: BasicInfo
    |   +-- FormField: "Titolo" (required, 5-100 chars)
    |   +-- FormField: "Descrizione" (optional, 500 char max, textarea)
    |   +-- FormField: SportSelect
    |   |   +-- Dropdown: [Calcio] [Basket] [Tennis] [F1] [MMA]
    |   +-- [Avanti] (primary, full width, mt-4)
    |
    +-- Step 2: Rules
    |   +-- FormField: "Entry Fee"
    |   |   +-- Input: EUR amount
    |   |   +-- Quick presets: [€5] [€10] [€20] [€50] (flex gap-2)
    |   +-- FormField: "Max Giocatori"
    |   |   +-- Slider: 2-100, default 10
    |   |   +-- Display: "{value} giocatori"
    |   +-- FormField: "Predizioni richieste"
    |   |   +-- Checkbox list: [Risultato] [O/U 2.5] [BTTS] [+ Altri]
    |   +-- PrizePoolPreview (bg-accent-primary/5, rounded, p-4, mt-4)
    |   |   +-- "Entry: €{fee} x {players} = €{total}"
    |   |   +-- "Montepremi: €{pool} (90%)"
    |   |   +-- "Commissione: €{fee} (10%)"
    |   |   +-- Dynamic calculation, updates in real-time
    |   +-- [Avanti] (primary, full width)
    |
    +-- Step 3: Events
    |   +-- CalendarView (date picker, grid calendar)
    |   +-- EventList[] (scrollable, max-h-64)
    |   |   +-- Checkbox + EventCard (compact)
    |   |   +-- "Inter vs Milan — Serie A, 15 Gen"
    |   +-- SelectedEvents[] (flex flex-wrap gap-2)
    |   |   +-- Event chip: "Inter vs Milan ✕" (removable)
    |   +-- [Avanti] (primary, full width)
    |
    +-- Step 4: Confirmation
        +-- SummaryCard (stack, gap-3)
        |   +-- Row: "Titolo" / "{title}"
        |   +-- Row: "Sport" / "{sport}"
        |   +-- Row: "Entry Fee" / "€{fee}"
        |   +-- Row: "Max Giocatori" / "{max}"
        |   +-- Row: "Predizioni" / "{markets}"
        |   +-- Row: "Eventi" / "{eventCount} eventi"
        +-- FeeBreakdown (same as Step 2 preview)
        +-- Warning: "Dopo la creazione non potrai modificare le regole"
        +-- [Crea Contest] (primary, lg, full width)
        +-- [Indietro] (ghost, full width, mt-2)
```

### 5.4 Friends (`/friends`)

**Route:** `/friends`
**Auth:** Yes
**Type:** Server + Client

**Layout:**
```
PageContainer
+-- PageHeader: "Amici" (--text-2xl)
+-- Tabs
|   +-- [Amici ({count})] [Richieste ({pending})] [Trova]
|
+-- FriendsTab
|   +-- SearchInput (w-full, mb-4, placeholder: "Cerca amici...")
|   +-- FriendCard[] (stack, gap-3)
|       +-- Row: Avatar(40px) | Info | Actions
|       +-- Info:
|       |   +-- Username (font-semibold)
|       |   +-- Win rate badge: "58% vittorie" (xs, accent bg)
|       |   +-- "Attivo 2h fa" (--text-xs, --text-muted)
|       +-- Actions:
|           +-- [Sfida] (primary, sm)
|           +-- HeadToHead: "Tu 3 - 2 Lui" (--text-xs, --text-secondary)
|   +-- EmptyState: "Non hai ancora amici. Trova qualcuno!"
|
+-- RequestsTab
|   +-- IncomingSection (if any)
|   |   +-- h3: "In arrivo ({count})"
|   |   +-- RequestCard[] (stack, gap-3)
|   |       +-- Row: Avatar + Username + MutualFriends
|   |       +-- "3 amici in comune" (--text-xs)
|   |       +-- Row: [Accetta] (primary, sm) | [Rifiuta] (ghost, sm)
|   |
|   +-- OutgoingSection (if any)
|       +-- h3: "In invio ({count})"
|       +-- RequestCard[] (stack, gap-3)
|           +-- Row: Avatar + Username
|           +-- "In attesa..." (--text-muted, sm)
|           +-- [Annulla] (ghost, sm)
|
+-- FindTab
    +-- SearchInput (by username, with instant results)
    +-- SuggestedFriends[] (stack, gap-3)
    |   +-- "Persone che potresti conoscere"
    |   +-- SuggestionCard[]
    |       +-- Avatar + Username + DisplayName
    |       +-- "5 amici in comune" (if applicable)
    |       +-- [Aggiungi amico] (secondary, sm)
    +-- SearchResults[] (if searching)
        +-- UserCard[]
            +-- Avatar + Username + WinRate
            +-- [Aggiungi amico] or [Già amico] (disabled)
```

### 5.5 Leaderboard (`/leaderboard`)

**Route:** `/leaderboard`
**Auth:** Yes
**Type:** Server

**Layout:**
```
PageContainer (max-w-4xl, mx-auto)
+-- PageHeader: "Classifica" (--text-2xl)
+-- FilterBar (flex flex-wrap gap-3, mb-6)
|   +-- PeriodTabs: [Settimana] [Mese] [Stagione] [Tutto]
|   +-- SportFilter: [Tutti] [Calcio] [Basket] ...
|   +-- ScopeTabs: [Globale] [Solo Amici]
|
+-- TopThreePodium (flex justify-center items-end gap-4, mb-8, py-8)
|   +-- #2 Card (w-32, bg-gradient-to-b from-gray-300 to-gray-400, rounded-lg)
|   |   +-- Avatar (56px, border-4 border-gray-300)
|   |   +-- Username (font-semibold, text-sm)
|   |   +-- WinRate (text-xs, text-white/80)
|   |   +-- "#2" (text-2xl, font-bold, text-white)
|   |
|   +-- #1 Card (w-36, bg-gradient-to-b from-yellow-400 to-yellow-600, rounded-lg)
|   |   +-- Avatar (64px, border-4 border-yellow-300)
|   |   +-- "👑" crown icon above avatar
|   |   +-- Username
|   |   +-- WinRate
|   |   +-- "#1" (text-3xl, font-bold)
|   |
|   +-- #3 Card (w-28, bg-gradient-to-b from-orange-400 to-orange-600, rounded-lg)
|       +-- Avatar (48px, border-4 border-orange-300)
|       +-- Username
|       +-- WinRate
|       +-- "#3" (text-xl, font-bold)
|
+-- RankingTable (bg-secondary, rounded-lg, overflow-hidden)
|   +-- Header (grid grid-cols-[40px_1fr_80px_100px_80px_80px] px-4 py-3)
|   |   +-- "#" | "Utente" | "Win Rate" | "Profitto" | "Pred." | "Serie"
|   +-- Row[] (grid, same cols, border-t, hover:bg-tertiary, px-4 py-3)
|   |   +-- Rank number
|   |   +-- Avatar + Username (font-medium)
|   |   +-- WinRate: "65%" (color: green if >60%, red if <40%)
|   |   +-- Profit: "+€340" (green) or "-€50" (red)
|   |   +-- Predictions count
|   |   +-- Streak: "5🔥" (if >=3, fire emoji)
|   +-- CurrentUserRow (bg-accent-primary/10, border-l-2 accent)
|   +-- Pagination (at bottom, cursor-based)
|
+-- MyRankBar (sticky bottom, h-14, bg-secondary, border-t, px-4)
    +-- "Tu: #42" | "Win Rate: 58%" | "€+120"
    +-- [Vedi profilo] (ghost, sm)
```

### 5.6 Activity Feed (`/feed`)

**Route:** `/feed`
**Auth:** Yes
**Type:** Server + Client

**Layout:**
```
PageContainer (max-w-2xl, mx-auto)
+-- PageHeader: "Feed" (--text-2xl)
+-- ScopeTabs (mb-4)
|   +-- [Amici] [Globale] [⚽ Calcio] [🏀 Basket] ...
|
+-- FeedFilters (flex gap-2, mb-4, overflow-x-auto)
|   +-- Filter chip: "Tutti" (active)
|   +-- Filter chip: "Predizioni"
|   +-- Filter chip: "Contest"
|   +-- Filter chip: "Sfide"
|   +-- Filter chip: "Vittorie"
|
+-- FeedList (stack, gap-4)
    +-- FeedItem[] (bg-secondary, rounded-lg, p-4)
        +-- Header (flex items-center gap-3, mb-2)
        |   +-- Avatar (40px)
        |   +-- Username (font-semibold)
        |   +-- ActionText: "ha predetto Inter vince" (--text-secondary)
        |   +-- TimeAgo: "2h fa" (--text-xs, --text-muted)
        |
        +-- Content (depends on type)
        |   +-- PredictionItem:
        |   |   +-- Event: "Inter vs Milan"
        |   |   +-- Prediction: "Inter vince @ 2.10"
        |   |   +-- Result: "✓ Corretta" (green) or "In attesa" (yellow)
        |   |
        |   +-- ContestItem:
        |   |   +-- Contest: "Serie A Giornata 20"
        |   |   +-- Result: "2° posto — €15 vinti" or "5° posto"
        |   |
        |   +-- ChallengeItem:
        |   |   +-- Challenge: "Barcelona vs Real"
        |   |   +-- Result: "Hai vinto! +250 SocialCoins"
        |   |
        |   +-- WinItem:
        |       +-- "🎉 {username} ha vinto €{amount} nel contest {name}"
        |
        +-- Footer (flex items-center gap-4, mt-3, pt-3 border-t)
            +-- ReactionBar
            |   +-- [👍 {count}] [🔥 {count}] [😂 {count}]
            |   +-- Click to add reaction
            +-- Comments: "{count} commenti" (ghost, sm)
    |
    +-- InfiniteScroll (LoadMore at bottom)
    +-- EmptyState: "Nessuna attività. Aggiungi amici per vedere il feed!"
```

### 5.7 Wallet (`/wallet`)

**Route:** `/wallet`
**Auth:** Yes
**Type:** Server

**Layout:**
```
PageContainer
+-- PageHeader: "Portafoglio" (--text-2xl)
+-- BalanceCards (grid grid-cols-1 md:grid-cols-2 gap-4, mb-6)
|   +-- SocialCoinsCard (bg-gradient-to-br from-accent-primary/20 to-accent-primary/5,
|   |   border border-accent-primary/20, rounded-xl, p-6)
|   |   +-- Label: "SocialCoins" (--text-sm, --text-secondary)
|   |   +-- Balance: "1,250" (--text-4xl, font-bold, --accent-primary)
|   |   +-- Row: [BONUS GIORNALIERO] (secondary, sm) — if available
|   |   +-- "Guadagna coin: predizioni, contest, sfide" (--text-xs, --text-muted)
|   |
|   +-- RealBalanceCard (bg-gradient-to-br from-accent-secondary/20 to-accent-secondary/5,
|       border border-accent-secondary/20, rounded-xl, p-6)
|       +-- Label: "Saldo Reale" (--text-sm, --text-secondary)
|       +-- Balance: "€125.00" (--text-4xl, font-bold, --accent-secondary)
|       +-- Row: [Deposita] (primary, sm) | [Preleva] (secondary, sm)
|
+-- TransactionTabs: [Virtual] [Reale]
|
+-- TransactionList (stack, gap-0)
    +-- TransactionItem[] (flex items-center gap-3, py-3, border-b)
    |   +-- Icon: (32px circle, bg by type)
    |   |   +-- 💰 BET_WON: green circle
    |   |   +-- 📉 BET_LOST: red circle
    |   |   +-- 🏆 CONTEST_ENTRY: blue circle
    |   |   +-- 🎁 DAILY_BONUS: purple circle
    |   |   +-- 📥 DEPOSIT: green circle
    |   |   +-- 📤 WITHDRAWAL: orange circle
    |   +-- Info: Type + Description
    |   |   +-- "Predizione vinta — Inter vs Milan" (font-medium)
    |   |   +-- "15 Gen 2026, 21:30" (--text-xs, --text-muted)
    |   +-- Amount: "+€21.00" (green) or "-€10.00" (red) (font-mono, font-semibold)
    |   +-- BalanceAfter: "Saldo: €136" (--text-xs, --text-muted)
    |
    +-- Pagination (cursor-based, "Carica altro")
    +-- EmptyState: "Nessuna transazione"
```

### 5.8 Profile (`/profile`)

**Route:** `/profile`
**Auth:** Yes
**Type:** Server + Client

**Layout:**
```
PageContainer (max-w-3xl, mx-auto)
+-- ProfileHeader (bg-secondary, rounded-xl, p-6, mb-6)
|   +-- Row: Avatar(80px) | Info
|   |   +-- DisplayName (--text-2xl, font-bold)
|   |   +-- "@{username}" (--text-secondary)
|   |   +-- MemberSince: "Membro dal Gen 2026" (--text-xs, --text-muted)
|   +-- EditButton: [Modifica profilo] (ghost, sm) → opens edit mode
|
+-- StatsGrid (grid grid-cols-3 md:grid-cols-6 gap-3, mb-6)
|   +-- Stat: "Predizioni" / "156" (col-span-1)
|   +-- Stat: "Vinte" / "89" (col-span-1)
|   +-- Stat: "Win Rate" / "57%" (col-span-1, accent if >50%)
|   +-- Stat: "ROI" / "+12.5%" (col-span-1, green if positive)
|   +-- Stat: "Classifica" / "#42" (col-span-1)
|   +-- Stat: "Amici" / "23" (col-span-1)
|
+-- AchievementsSection (mb-6)
|   +-- SectionHeader: "Obiettivi" + "Vedi tutti"
|   +-- AchievementGrid (grid grid-cols-4 md:grid-cols-8 gap-3)
|       +-- AchievementBadge[]
|           +-- Icon (40px, bg-purple/10)
|           +-- "Prima Predizione" (text-xs, centered)
|           +-- Locked: grayscale, opacity-50
|           +-- Earned: full color, border-2 accent-secondary
|
+-- Tabs: [Predizioni] [Statistiche] [Amici]
|
+-- PredictionsTab
|   +-- PredictionCard[] (last 10, with [Vedi tutte] link)
|
+-- StatsTab (same as My Predictions > Stats tab)
|
+-- FriendsTab
    +-- FriendAvatar[] (flex flex-wrap gap-2)
        +-- Avatar(40px) + Username below
```

### 5.9 Settings (`/settings`)

**Route:** `/settings`
**Auth:** Yes
**Type:** Client

**Layout:**
```
PageContainer (max-w-2xl, mx-auto)
+-- PageHeader: "Impostazioni" (--text-2xl)
|
+-- SettingsSection: "Account" (bg-secondary, rounded-lg, p-6, mb-4)
|   +-- AvatarEditor: Avatar + [Cambia foto]
|   +-- FormField: "Nome visualizzato"
|   |   +-- Input with [Salva] button inline
|   +-- FormField: "Username"
|   |   +-- Input with availability check + [Cambia] button
|   |   +-- Warning: "Potrebbe volerci 24h per propagarsi"
|   +-- FormField: "Email"
|   |   +-- Display + [Cambia email] button
|   +-- FormField: "Password"
|       +-- [Cambia password] button → opens modal
|
+-- SettingsSection: "Notifiche" (bg-secondary, rounded-lg, p-6, mb-4)
|   +-- ToggleRow: "Notifiche push" (on/off)
|   +-- ToggleRow: "Notifiche email" (on/off)
|   +-- Divider
|   +-- Sub-toggles (indented, disabled if parent off):
|   |   +-- "Risultati predizioni"
|   |   +-- "Contest"
|   |   +-- "Richieste amicizia"
|   |   +-- "Sfide"
|   |   +-- "Classifica settimanale"
|   +-- QuietHours: "Orario silenzioso" toggle + time range picker
|
+-- SettingsSection: "Privacy" (bg-secondary, rounded-lg, p-6, mb-4)
|   +-- SelectField: "Visibilità profilo"
|   |   +-- Options: [Pubblico] [Solo amici] [Privato]
|   +-- ToggleRow: "Mostra predizioni nel profilo"
|   +-- ToggleRow: "Mostra statistiche nel profilo"
|
+-- SettingsSection: "Aspetto" (bg-secondary, rounded-lg, p-6, mb-4)
|   +-- ThemeSelect: [Dark] [Light] [Sistema]
|   +-- LanguageSelect: [Italiano] [English] (disabled, "Coming soon")
|
+-- SettingsSection: "Zona pericolosa" (bg-secondary, rounded-lg, p-6, mb-4,
|   border border-accent-danger/30)
|   +-- [Esporta i miei dati] (secondary, sm)
|   +-- [Elimina account] (danger, sm)
|       +-- Confirmation modal: "Sei sicuro? Questa azione è irreversibile."
|       +-- Must type username to confirm
|
+-- AppInfo (text-center, mt-8)
    +-- "SocialBets v2.0.0"
    +-- Links: [Termini] [Privacy] [Supporto]
