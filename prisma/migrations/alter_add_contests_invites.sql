-- Migration: Add contests, invite system, real wallet
-- Run this SQL in Supabase SQL Editor

-- ─── New Enums ───────────────────────────────────────────────

CREATE TYPE "ContestStatus" AS ENUM ('DRAFT', 'OPEN', 'LOCKED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "EntryStatus" AS ENUM ('ACTIVE', 'WON', 'LOST', 'REFUNDED');
CREATE TYPE "RealTransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'CONTEST_ENTRY', 'CONTEST_WIN', 'CONTEST_REFUND', 'REFERRAL_BONUS');
CREATE TYPE "RealTxStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- ─── Alter User: add invite/real wallet columns ─────────────

ALTER TABLE "User" ADD COLUMN "realBalance" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "inviteCode" TEXT;
ALTER TABLE "User" ADD COLUMN "referredBy" TEXT;

-- Generate invite codes for existing users
UPDATE "User" SET "inviteCode" = UPPER("username") || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6));

-- Now make inviteCode required and unique
ALTER TABLE "User" ALTER COLUMN "inviteCode" SET NOT NULL;
CREATE UNIQUE INDEX "User_inviteCode_key" ON "User"("inviteCode");
ALTER TABLE "User" ADD CONSTRAINT "User_referredBy_fkey" FOREIGN KEY ("referredBy") REFERENCES "User"("inviteCode") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── Contest Table ──────────────────────────────────────────

CREATE TABLE "Contest" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "entryFee" DECIMAL(10,2) NOT NULL,
    "maxPlayers" INTEGER NOT NULL DEFAULT 10,
    "prizePool" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "platformFee" DECIMAL(4,3) NOT NULL DEFAULT 0.10,
    "status" "ContestStatus" NOT NULL DEFAULT 'OPEN',
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "result" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventId" TEXT,

    CONSTRAINT "Contest_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Contest" ADD CONSTRAINT "Contest_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Contest" ADD CONSTRAINT "Contest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "Contest_status_idx" ON "Contest"("status");
CREATE INDEX "Contest_startTime_idx" ON "Contest"("startTime");

-- ─── ContestEntry Table ─────────────────────────────────────

CREATE TABLE "ContestEntry" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "predictions" JSONB NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payout" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "EntryStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContestEntry_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ContestEntry" ADD CONSTRAINT "ContestEntry_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContestEntry" ADD CONSTRAINT "ContestEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE UNIQUE INDEX "ContestEntry_contestId_userId_key" ON "ContestEntry"("contestId", "userId");

-- ─── RealTransaction Table ──────────────────────────────────

CREATE TABLE "RealTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "RealTransactionType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL,
    "status" "RealTxStatus" NOT NULL DEFAULT 'COMPLETED',
    "reference" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RealTransaction_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "RealTransaction" ADD CONSTRAINT "RealTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "RealTransaction_userId_idx" ON "RealTransaction"("userId");
CREATE INDEX "RealTransaction_createdAt_idx" ON "RealTransaction"("createdAt");

-- ─── Add contests relation to Event ─────────────────────────
-- (No DB change needed, Prisma handles this via the schema)
