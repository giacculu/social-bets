-- AlterEnum
ALTER TYPE "BetStatus" ADD VALUE 'LOCKED' BEFORE 'WON';
ALTER TYPE "BetStatus" ADD VALUE 'VOID' BEFORE 'CASHED_OUT';

-- AlterEnum
ALTER TYPE "BetResult" ADD VALUE 'VOID';

-- AlterEnum
ALTER TYPE "CustomBetStatus" ADD VALUE 'DISPUTED';

-- AlterEnum
ALTER TYPE "ParticipantStatus" ADD VALUE 'DECLINED';

-- AlterEnum
ALTER TYPE "ParticipantResult" ADD VALUE 'DRAW';
ALTER TYPE "ParticipantResult" ADD VALUE 'NO_SHOW';

-- AlterEnum
ALTER TYPE "EntryStatus" ADD VALUE 'REGISTERED' BEFORE 'ACTIVE';
ALTER TYPE "EntryStatus" ADD VALUE 'CONFIRMED';
ALTER TYPE "EntryStatus" ADD VALUE 'DISQUALIFIED';

-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'BET_REFUND';
ALTER TYPE "TransactionType" ADD VALUE 'CHALLENGE_WON';
ALTER TYPE "TransactionType" ADD VALUE 'CHALLENGE_LOST';
ALTER TYPE "TransactionType" ADD VALUE 'CHALLENGE_REFUND';
ALTER TYPE "TransactionType" ADD VALUE 'ADMIN_ADJUSTMENT';

-- AlterEnum
ALTER TYPE "RealTransactionType" ADD VALUE 'ADMIN_ADJUSTMENT';

-- AlterEnum
ALTER TYPE "RealTxStatus" ADD VALUE 'CANCELLED';

-- CreateEnum
CREATE TYPE "ContestVisibility" AS ENUM ('PUBLIC', 'FRIENDS', 'PRIVATE');

-- CreateEnum
CREATE TYPE "PredictionStatus" AS ENUM ('ACTIVE', 'LOCKED', 'CORRECT', 'INCORRECT', 'VOID');

-- CreateEnum
CREATE TYPE "FeedVisibility" AS ENUM ('PUBLIC', 'FRIENDS', 'PRIVATE');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('PREDICTION', 'PREDICTION_RESULT', 'BET_PLACED', 'BET_WON', 'BET_LOST', 'CONTEST_CREATED', 'CONTEST_JOINED', 'CONTEST_WON', 'CHALLENGE_CREATED', 'CHALLENGE_ACCEPTED', 'CHALLENGE_WON', 'FRIEND_ADDED', 'ACHIEVEMENT_EARNED', 'STREAK_MILESTONE');

-- CreateEnum
CREATE TYPE "ActivityTarget" AS ENUM ('EVENT', 'CONTEST', 'CHALLENGE', 'USER', 'PREDICTION', 'BET');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BET_RESULT', 'CONTEST_UPDATE', 'CHALLENGE_REQUEST', 'FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'ACHIEVEMENT', 'LEADERBOARD_CHANGE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "CommentTarget" AS ENUM ('EVENT', 'CONTEST', 'CHALLENGE');

-- CreateEnum
CREATE TYPE "ReactionTarget" AS ENUM ('PREDICTION', 'COMMENT', 'ACTIVITY', 'EVENT');

-- CreateEnum
CREATE TYPE "SyncJobStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DataSource" AS ENUM ('THE_ODDS_API', 'FOOTBALL_DATA_ORG', 'MANUAL');

-- CreateEnum
CREATE TYPE "AchievementType" AS ENUM ('FIRST_PREDICTION', 'FIRST_WIN', 'WIN_STREAK_5', 'WIN_STREAK_10', 'WIN_STREAK_25', 'PERFECT_WEEK', 'ALL_CORRECT', 'CHALLENGE_WON_10', 'CONTEST_WINNER', 'SPORT_EXPERT', 'SOCIAL_BUTTERFLY', 'REFERRAL_MASTER', 'EARLY_ADOPTER');

-- AlterTable: User
ALTER TABLE "User" ADD COLUMN "emailVerified" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "preferredSports" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ADD COLUMN "timezone" TEXT DEFAULT 'UTC';
ALTER TABLE "User" ADD COLUMN "locale" TEXT DEFAULT 'en';
ALTER TABLE "User" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable: Event
ALTER TABLE "Event" ADD COLUMN "sportId" TEXT;
ALTER TABLE "Event" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable: Bet
ALTER TABLE "Bet" ADD COLUMN "confidence" INTEGER;
ALTER TABLE "Bet" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Bet" ADD COLUMN "lockedAt" TIMESTAMP(3);
ALTER TABLE "Bet" ADD COLUMN "settledAt" TIMESTAMP(3);
ALTER TABLE "Bet" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Bet" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable: Contest
ALTER TABLE "Contest" ADD COLUMN "visibility" "ContestVisibility" NOT NULL DEFAULT 'PUBLIC';
ALTER TABLE "Contest" ADD COLUMN "autoSettle" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Contest" ADD COLUMN "predictionsRequired" JSONB;
ALTER TABLE "Contest" ADD COLUMN "cancelledAt" TIMESTAMP(3);
ALTER TABLE "Contest" ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateTable: Wallet
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 10000,
    "frozenBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Wallet
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateTable: Prediction
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "outcomeId" TEXT NOT NULL,
    "confidence" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "score" DOUBLE PRECISION,
    "status" "PredictionStatus" NOT NULL DEFAULT 'ACTIVE',
    "settledAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Prediction
CREATE INDEX "Prediction_userId_settledAt_idx" ON "Prediction"("userId", "settledAt");
CREATE INDEX "Prediction_eventId_settledAt_idx" ON "Prediction"("eventId", "settledAt");
CREATE INDEX "Prediction_outcomeId_idx" ON "Prediction"("outcomeId");

-- CreateTable: Achievement
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AchievementType" NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Achievement
CREATE UNIQUE INDEX "Achievement_userId_type_key" ON "Achievement"("userId", "type");

-- CreateTable: Reputation
CREATE TABLE "Reputation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "predictions" INTEGER NOT NULL DEFAULT 0,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "winRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "bestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reputation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Reputation
CREATE UNIQUE INDEX "Reputation_userId_key" ON "Reputation"("userId");

-- CreateTable: ActivityFeedEntry
CREATE TABLE "ActivityFeedEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "targetType" "ActivityTarget" NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" JSONB,
    "visibility" "FeedVisibility" NOT NULL DEFAULT 'PUBLIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityFeedEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: ActivityFeedEntry
CREATE INDEX "ActivityFeedEntry_userId_createdAt_idx" ON "ActivityFeedEntry"("userId", "createdAt");
CREATE INDEX "ActivityFeedEntry_type_createdAt_idx" ON "ActivityFeedEntry"("type", "createdAt");

-- CreateTable: Notification
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "readAt" TIMESTAMP(3),
    "pushSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Notification
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateTable: Comment
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" "CommentTarget" NOT NULL,
    "targetId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Comment
CREATE INDEX "Comment_targetType_targetId_createdAt_idx" ON "Comment"("targetType", "targetId", "createdAt");

-- CreateTable: Reaction
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" "ReactionTarget" NOT NULL,
    "targetId" TEXT NOT NULL,
    "emoji" VARCHAR(4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Reaction
CREATE UNIQUE INDEX "Reaction_userId_targetType_targetId_emoji_key" ON "Reaction"("userId", "targetType", "targetId", "emoji");
CREATE INDEX "Reaction_targetType_targetId_idx" ON "Reaction"("targetType", "targetId");

-- CreateTable: UserStats
CREATE TABLE "UserStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalBets" INTEGER NOT NULL DEFAULT 0,
    "wonBets" INTEGER NOT NULL DEFAULT 0,
    "lostBets" INTEGER NOT NULL DEFAULT 0,
    "voidBets" INTEGER NOT NULL DEFAULT 0,
    "totalStaked" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalWon" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalLost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "netProfit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "winRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgOdds" DOUBLE PRECISION,
    "bestWinStreak" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "lastBetAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: UserStats
CREATE UNIQUE INDEX "UserStats_userId_key" ON "UserStats"("userId");

-- CreateTable: EventStats
CREATE TABLE "EventStats" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "totalBets" INTEGER NOT NULL DEFAULT 0,
    "totalPredictions" INTEGER NOT NULL DEFAULT 0,
    "totalStaked" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "uniqueUsers" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: EventStats
CREATE UNIQUE INDEX "EventStats_eventId_key" ON "EventStats"("eventId");

-- CreateTable: SyncJob
CREATE TABLE "SyncJob" (
    "id" TEXT NOT NULL,
    "source" "DataSource" NOT NULL,
    "status" "SyncJobStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "eventsProcessed" INTEGER,
    "error" TEXT,
    "metadata" JSONB,

    CONSTRAINT "SyncJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: SyncJob
CREATE INDEX "SyncJob_source_startedAt_idx" ON "SyncJob"("source", "startedAt");

-- AddForeignKey: Comment
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: Reaction
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: ActivityFeedEntry
ALTER TABLE "ActivityFeedEntry" ADD CONSTRAINT "ActivityFeedEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: Notification
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: Achievement
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: Reputation
ALTER TABLE "Reputation" ADD CONSTRAINT "Reputation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: UserStats
ALTER TABLE "UserStats" ADD CONSTRAINT "UserStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: EventStats
ALTER TABLE "EventStats" ADD CONSTRAINT "EventStats_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: Wallet
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: Prediction
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "Outcome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- New indexes
CREATE INDEX "Bet_userId_settledAt_idx" ON "Bet"("userId", "settled");
CREATE INDEX "User_role_deletedAt_idx" ON "User"("role", "deletedAt");
CREATE INDEX "Event_sportId_status_idx" ON "Event"("sportId", "status");
CREATE INDEX "Contest_status_startTime_idx" ON "Contest"("status", "startTime");
CREATE INDEX "Contest_creatorId_idx" ON "Contest"("creatorId");

-- Data migration: Create Wallet records for existing users
INSERT INTO "Wallet" ("id", "userId", "balance", "frozenBalance", "currency", "version", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  u."id",
  u."balance",
  u."realBalance",
  'EUR',
  1,
  NOW(),
  NOW()
FROM "User" u;
