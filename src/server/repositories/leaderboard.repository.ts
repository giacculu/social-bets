import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from "@/lib/redis";

export class LeaderboardRepository {
  async getCurrentPeriod(period: string) {
    const cached = await cacheGet(`leaderboard:${period}`);
    if (cached) return cached;
    const entries = await prisma.leaderboardEntry.findMany({ where: { period }, orderBy: { netProfit: "desc" }, include: { user: { select: { username: true, name: true, avatarUrl: true } } } });
    await cacheSet(`leaderboard:${period}`, entries, 60);
    return entries;
  }

  async getUserRank(userId: string, period: string) {
    const cached = await cacheGet(`leaderboard:rank:${userId}:${period}`);
    if (cached) return cached;
    const entry = await prisma.leaderboardEntry.findUnique({ where: { userId_period: { userId, period } }, include: { user: { select: { username: true, name: true, avatarUrl: true } } } });
    if (entry) await cacheSet(`leaderboard:rank:${userId}:${period}`, entry, 60);
    return entry;
  }

  async upsert(data: { userId: string; period: string; won: number; lost: number; profit: number; bets: number }) {
    const winRate = data.bets > 0 ? data.won / data.bets : 0;
    const result = await prisma.leaderboardEntry.upsert({
      where: { userId_period: { userId: data.userId, period: data.period } },
      update: { totalWon: { increment: data.won }, totalLost: { increment: data.lost }, netProfit: { increment: data.profit }, winRate, betCount: { increment: data.bets } },
      create: { userId: data.userId, period: data.period, totalWon: data.won, totalLost: data.lost, netProfit: data.profit, winRate, betCount: data.bets },
    });
    await cacheDelPattern("leaderboard:*");
    return result;
  }

  async findTop(period: string, limit = 50) {
    const cached = await cacheGet(`leaderboard:${period}`);
    if (cached) return (cached as any[]).slice(0, limit);
    const entries = await prisma.leaderboardEntry.findMany({ where: { period }, orderBy: { netProfit: "desc" }, take: limit, include: { user: { select: { username: true, name: true, avatarUrl: true } } } });
    await cacheSet(`leaderboard:${period}`, entries, 60);
    return entries;
  }

  async recalculateRanks(period: string) {
    const entries = await prisma.leaderboardEntry.findMany({ where: { period }, orderBy: { netProfit: "desc" } });
    for (let i = 0; i < entries.length; i++) {
      await prisma.leaderboardEntry.update({ where: { id: entries[i].id }, data: { rank: i + 1 } });
    }
    await cacheDelPattern("leaderboard:*");
    return entries.length;
  }
}
