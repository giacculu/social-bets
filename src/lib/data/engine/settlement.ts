import { prisma } from "@/lib/prisma";
import { prisma as prismaClient } from "@/lib/prisma";
import { SettlementResult } from "../types";
import { OddsEngine } from "./odds-engine";

/**
 * Settlement Engine - Automatically resolves bets when events finish.
 * 
 * Flow:
 * 1. Detect finished events that haven't been settled
 * 2. Match outcomes to determine results
 * 3. Calculate payouts and update balances
 * 4. Create transaction records
 * 5. Update leaderboard
 */
export class SettlementEngine {
  private oddsEngine: OddsEngine;

  constructor() {
    this.oddsEngine = OddsEngine.getInstance();
  }

  /**
   * Find and settle all pending bets for finished events
   */
  async settleAllPending(): Promise<SettlementResult[]> {
    const results: SettlementResult[] = [];

    // Find events that are FINISHED but have unsettled bets
    const finishedEvents = await prismaClient.event.findMany({
      where: {
        status: "FINISHED",
        bets: {
          some: { settled: false },
        },
      },
      include: {
        markets: {
          include: {
            outcomes: true,
            bets: {
              where: { settled: false },
              include: { user: true },
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
            console.error(
              `[Settlement] Error settling bet ${bet.id}:`,
              error
            );
          }
        }
      }

      // Mark all bets in this event as settled
      await prismaClient.bet.updateMany({
        where: {
          eventId: event.id,
          settled: false,
        },
        data: { settled: true },
      });
    }

    // Update leaderboard
    if (results.length > 0) {
      await this.updateLeaderboard(results);
    }

    return results;
  }

  /**
   * Settle a single bet
   */
  private async settleBet(
    bet: any,
    event: any
  ): Promise<SettlementResult | null> {
    if (bet.settled) return null;

    // Determine if this bet won based on event result
    const won = this.determineResult(bet, event);
    const result = won ? "WIN" : "LOSS" as const;

    let payout = 0;
    let profit = 0;

    if (won) {
      payout = Number(bet.stake) * Number(bet.odds);
      profit = payout - Number(bet.stake);
    } else {
      payout = 0;
      profit = -Number(bet.stake);
    }

    // Update bet status
    await prismaClient.bet.update({
      where: { id: bet.id },
      data: {
        status: won ? "WON" : "LOST",
        result: result,
      },
    });

    // Update user balance
    if (won) {
      await prismaClient.user.update({
        where: { id: bet.userId },
        data: { balance: { increment: payout } },
      });

      // Create winning transaction
      await prismaClient.transaction.create({
        data: {
          userId: bet.userId,
          type: "BET_WON",
          amount: payout,
          balance: 0, // Will be calculated
          reference: `Vincita scommessa #${bet.id}`,
        },
      });
    } else {
      // Create losing transaction (balance deduction was already made when bet was placed)
      await prismaClient.transaction.create({
        data: {
          userId: bet.userId,
          type: "BET_LOST",
          amount: 0,
          balance: 0,
          reference: `Scommessa persa #${bet.id}`,
        },
      });
    }

    return {
      betId: bet.id,
      userId: bet.userId,
      stake: Number(bet.stake),
      odds: Number(bet.odds),
      result,
      payout,
      profit,
    };
  }

  /**
   * Determine if a bet won based on the event's result
   */
  private determineResult(bet: any, event: any): boolean {
    // Get the winning outcome based on event result
    const { scoreHome, scoreAway, result: eventResult } = event;

    if (scoreHome === null || scoreAway === null) return false;

    // Get the outcome details
    const outcome = bet.outcome;
    if (!outcome) return false;

    const market = bet.market;
    if (!market) return false;

    // Different logic based on market type
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
        // For custom/unknown markets, check if the outcome name matches the result
        return false;
    }
  }

  private checkMatchResult(
    outcomeSlug: string,
    scoreHome: number,
    scoreAway: number
  ): boolean {
    const homeWin = scoreHome > scoreAway;
    const draw = scoreHome === scoreAway;
    const awayWin = scoreHome < scoreAway;

    switch (outcomeSlug) {
      case "home":
      case "1":
        return homeWin;
      case "draw":
      case "x":
        return draw;
      case "away":
      case "2":
        return awayWin;
      default:
        return false;
    }
  }

  private extractLine(marketSlug: string): number {
    // Extract numeric line from slug like "over-under-2-5" -> 2.5
    const match = marketSlug.match(/(\d+)[-_]?(\d+)?/);
    if (match) {
      const whole = parseInt(match[1]);
      const decimal = match[2] ? parseInt(match[2]) : 0;
      return whole + decimal / 10;
    }
    return 2.5; // Default line
  }

  /**
   * Update leaderboard after settlements
   */
  private async updateLeaderboard(results: SettlementResult[]): Promise<void> {
    const period = this.getCurrentPeriod();

    // Group results by user
    const userStats = new Map<
      string,
      { won: number; lost: number; profit: number; bets: number }
    >();

    for (const r of results) {
      const existing = userStats.get(r.userId) || {
        won: 0,
        lost: 0,
        profit: 0,
        bets: 0,
      };
      existing.bets++;
      existing.profit += r.profit;
      if (r.result === "WIN") existing.won++;
      else existing.lost++;
      userStats.set(r.userId, existing);
    }

    // Upsert leaderboard entries
    for (const [userId, stats] of userStats) {
      const totalBets = stats.won + stats.lost;
      const winRate = totalBets > 0 ? stats.won / totalBets : 0;

      await prismaClient.leaderboardEntry.upsert({
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

    // Recalculate ranks
    const entries = await prismaClient.leaderboardEntry.findMany({
      where: { period },
      orderBy: { netProfit: "desc" },
    });

    for (let i = 0; i < entries.length; i++) {
      await prismaClient.leaderboardEntry.update({
        where: { id: entries[i].id },
        data: { rank: i + 1 },
      });
    }
  }

  private getCurrentPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-W${Math.ceil(
      now.getDate() / 7
    )
      .toString()
      .padStart(2, "0")}`;
  }
}
