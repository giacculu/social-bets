import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { syncAllFn, syncSportFn, settlementSweepFn, cleanupIdempotencyKeysFn, recalculateLeaderboardFn } from "@/jobs";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [syncAllFn, syncSportFn, settlementSweepFn, cleanupIdempotencyKeysFn, recalculateLeaderboardFn],
});
