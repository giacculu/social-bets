import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import { createChildLogger } from "@/lib/logger";

const log = createChildLogger({ module: "jobs:leaderboard" });

export const recalculateLeaderboardFn = inngest.createFunction(
  { id: "recalculate-leaderboard", name: "Recalculate Leaderboard", triggers: [{ cron: "0 2 * * 1" }] },
  async ({ event, step }) => {
    log.info("Recalculating leaderboard ranks");
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    const period = `${now.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;

    const entries = await prisma.leaderboardEntry.findMany({
      where: { period },
      orderBy: { netProfit: "desc" },
    });

    for (let i = 0; i < entries.length; i++) {
      await prisma.leaderboardEntry.update({
        where: { id: entries[i].id },
        data: { rank: i + 1 },
      });
    }

    log.info({ period, ranked: entries.length }, "Leaderboard recalculation done");
    return { period, ranked: entries.length };
  }
);
