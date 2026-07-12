# SocialBets API Reference

Base URL: `/api`

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/signin` | Sign in (NextAuth) |
| POST | `/api/auth/signout` | Sign out |

## Bets

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bets` | Place a bet (atomic with balance check) |
| GET | `/api/bets` | List user's bets |

## Contests

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contests` | List contests (OPEN/LOCKED/IN_PROGRESS) |
| POST | `/api/contests` | Join/leave a contest |

## Custom Bets (Challenges)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/custom-bets` | List user's challenges |
| POST | `/api/custom-bets` | Create a new challenge |

## Friends

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/friends` | List friends |
| POST | `/api/friends` | Send/accept/decline friend request |
| GET | `/api/friends/list` | List friends (simplified) |

## Invite

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invite` | Get invite code + stats |
| POST | `/api/invite` | Redeem invite code |

## Wallet

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet/balance` | Get current balance |
| POST | `/api/wallet/deposit` | Deposit virtual coins (demo) |
| POST | `/api/wallet/withdraw` | Withdraw virtual coins (demo) |

## Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search?q=` | Search users, events, contests |

## Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/sync` | Trigger data sync (admin only) |

## Cron

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cron` | Vercel cron trigger (sync/settle/full) |

## Inngest

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/inngest` | Inngest serve endpoint |

## Response Format

All endpoints return JSON with the following structure:

```json
{
  "success": true,
  "data": {},
  "error": "string (if error)"
}
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INTERNAL_ERROR` | 500 | Server error |
| `NOT_FOUND` | 404 | Resource not found |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Not authorized |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `CONFLICT` | 409 | Resource already exists |
| `INSUFFICIENT_BALANCE` | 402 | Not enough balance |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
