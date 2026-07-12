import { prisma } from "@/lib/prisma";
import { createChildLogger } from "@/lib/logger";
import { SettlementResult } from "../types";
import { OddsEngine } from "./odds-engine";

const log = createChildLogger({ module: "settlement" });

/**
 * Settlement Engine - Automatically resolves bets when events finish.
 *
 * Flow:
 * 1. Detect finished events that haven't been settled
 * 2. Match outcomes to determine results
 * 3. Calculate payouts and update balances (atomic)
 * 4. Create transaction records with balance snapshots
 * 5. Update leaderboard
 */
export class SettlementEngine {
  private oddsEngine: OddsEngine;

  constructor() {
    this.oddsEngine = OddsEngine.getInstance();
  }

  async settleAllPending(): Promise<SettlementResult[]> {
    const results: SettlementResult[] = [];

    const finishedEvents = await prisma.event.findMany({
      where: {
        status: "FINISHED",
        bets: { some: { settled: false } },
      },
      include: {
        markets: {
          include: {
            outcomes: true,
            bets: {
              where: { settled: false },
              include: { outcome: true, market: true },
            },
          },
        },
      },
    });

    for (const event of finishedEvents) {
      for (const market of event.markets) {
        for (const bet of market.bets) {
          try {
            const result = await this.settleBet(bet, event);
            if (result) results.push(result);
          } catch (error) {
            log.error({ betId: bet.id, err: error }, "Error settling bet");
          }
        }
      }
    }

    if (results.length > 0) {
      await this.updateLeaderboard(results);
    }

    return results;
  }

  async settleBet(bet: any, event: any): Promise<SettlementResult | null> {
    if (bet.settled) return null;

    const won = this.determineResult(bet, event);
    const result: "WIN" | "LOSS" = won ? "WIN" : "LOSS";

    let payout = 0;
    let profit = 0;

    if (won) {
      payout = Number(bet.stake) * Number(bet.odds);
      profit = payout - Number(bet.stake);
    } else {
      payout = 0;
      profit = -Number(bet.stake);
    }

    // Atomic: update bet + wallet + transaction in a single transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update bet status
      await tx.bet.update({
        where: { id: bet.id },
        data: {
          status: won ? "WON" : "LOST",
          result,
          settled: true,
          settledAt: new Date(),
        },
      });

      // 2. Get current wallet for balance snapshot
      const wallet = await tx.wallet.findUnique({
        where: { userId: bet.userId },
      });
      const currentBalance = Number(wallet?.balance ?? 0);

      // 3. Update wallet balance
      if (won) {
        await tx.wallet.update({
          where: { userId: bet.userId },
          data: { balance: { increment: payout } },
        });
      }

      // 4. Create transaction record with accurate balance snapshot
      await tx.transaction.create({
        data: {
          userId: bet.userId,
          type: won ? "BET_WON" : "BET_LOST",
          amount: won ? payout : 0,
          balance: won ? currentBalance + payout : currentBalance,
          reference: won ? `Vincita scommessa #${bet.id}` : `Scommessa persa #${bet.id}`,
        },
      });
    });

    return { betId: bet.id, userId: bet.userId, stake: Number(bet.stake), odds: Number(bet.odds), result, payout, profit };
  }

  private determineResult(bet: any, event: any): boolean {
    const { scoreHome, scoreAway } = event;

    if (scoreHome === null || scoreAway === null) return false;

    const outcome = bet.outcome;
    if (!outcome) return false;

    const market = bet.market;
    if (!market) return false;

    switch (market.type) {
      case "MATCH_RESULT":
        return this.checkMatchResult(outcome.slug, scoreHome, scoreAway);
      case "OVER_UNDER": {
        const total = scoreHome + scoreAway;
        const line = this.extractLine(market.slug);
        if (outcome.slug === "over") return total > line;
        if (outcome.slug === "under") return total < line;
        return false;
      }
      case "BOTH_TEAMS_SCORE":
        if (outcome.slug === "yes") return scoreHome > 0 && scoreAway > 0;
        if (outcome.slug === "no") return scoreHome === 0 || scoreAway === 0;
        return false;
      case "DOUBLE_CHANCE": {
        const homeWin = scoreHome > scoreAway;
        const draw = scoreHome === scoreAway;
        const awayWin = scoreHome < scoreAway;
        if (outcome.slug === "1x") return homeWin || draw;
        if (outcome.slug === "x2") return draw || awayWin;
        if (outcome.slug === "12") return homeWin || awayWin;
        return false;
      }
      case "CORRECT_SCORE": {
        const expectedScore = outcome.slug;
        return `${scoreHome}-${scoreAway}` === expectedScore;
      }
      default:
        return false;
    }
  }

  private checkMatchResult(outcomeSlug: string, scoreHome: number, scoreAway: number): boolean {
    const homeWin = scoreHome > scoreAway;
    const draw = scoreHome === scoreAway;
    const awayWin = scoreHome < scoreAway;

    switch (outcomeSlug) {
      case "home": case "1": return homeWin;
      case "draw": case "x": return draw;
      case "away": case "2": return awayWin;
      default: return false;
    }
  }

  private extractLine(marketSlug: string): number {
    const match = marketSlug.match(/(\d+)[-_]?(\d+)?/);
    if (match) {
      const whole = parseInt(match[1]);
      const decimal = match[2] ? parseInt(match[2]) : 0;
      return whole + decimal / 10;
    }
    return 2.5;
  }

  private async updateLeaderboard(results: SettlementResult[]): Promise<void> {
    const period = this.getCurrentPeriod();

    const userStats = new Map<string, { won: number; lost: number; profit: number; bets: number }>();

    for (const r of results) {
      const existing = userStats.get(r.userId) || { won: 0, lost: 0, profit: 0, bets: 0 };
      existing.bets++;
      existing.profit += r.profit;
      if (r.result === "WIN") existing.won++;
      else existing.lost++;
      userStats.set(r.userId, existing);
    }

    for (const [userId, stats] of userStats) {
      const totalBets = stats.won + stats.lost;
      const winRate = totalBets > 0 ? stats.won / totalBets : 0;

      await prisma.leaderboardEntry.upsert({
        where: { userId_period: { userId, period } },
        update: {
          totalWon: { increment: stats.won },
          totalLost: { increment: stats.lost },
          netProfit: { increment: stats.profit },
          winRate,
          betCount: { increment: stats.bets },
        },
        create: {
          userId,
          period,
          totalWon: stats.won,
          totalLost: stats.lost,
          netProfit: stats.profit,
          winRate,
          betCount: stats.bets,
        },
      });
    }

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
  }

  private getCurrentPeriod(): string {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
  }
}
