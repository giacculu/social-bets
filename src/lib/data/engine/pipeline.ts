import { prisma } from "@/lib/prisma";
import { prisma as prismaClient } from "@/lib/prisma";
import {
  RawSportData,
  RawEventData,
  PipelineResult,
  DataSource,
} from "../types";
import { OddsEngine } from "./odds-engine";

/**
 * Core Data Pipeline - Normalizes, validates, deduplicates, and stores
 * data from any source into the database.
 */
export class DataPipeline {
  private oddsEngine: OddsEngine;

  constructor() {
    this.oddsEngine = OddsEngine.getInstance();
  }

  /**
   * Process raw data from any source into the database
   */
  async processRawData(data: RawSportData): Promise<PipelineResult> {
    const startTime = Date.now();
    const result: PipelineResult = {
      source: data.source,
      sport: data.sport,
      eventsFound: data.events.length,
      eventsCreated: 0,
      eventsUpdated: 0,
      marketsCreated: 0,
      outcomesCreated: 0,
      errors: [],
      duration: 0,
      timestamp: new Date(),
    };

    try {
      // 1. Ensure Sport exists
      const sport = await this.ensureSport(data.sport, data.sportSlug);

      // 2. Ensure League exists
      const league = await this.ensureLeague(
        sport.id,
        data.league,
        data.leagueSlug,
        data.country
      );

      // 3. Process each event
      for (const rawEvent of data.events) {
        try {
          const eventResult = await this.processEvent(
            league.id,
            rawEvent,
            data.source
          );

          if (eventResult.created) result.eventsCreated++;
          if (eventResult.updated) result.eventsUpdated++;
          result.marketsCreated += eventResult.markets;
          result.outcomesCreated += eventResult.outcomes;
        } catch (error) {
          const msg = `Event ${rawEvent.homeTeam} vs ${rawEvent.awayTeam}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`;
          result.errors.push(msg);
          console.error(`[Pipeline] ${msg}`);
        }
      }

      // 4. Update source sync metadata
      await this.updateSourceMetadata(data.source, result);
    } catch (error) {
      result.errors.push(
        `Pipeline error: ${error instanceof Error ? error.message : "Unknown"}`
      );
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  /**
   * Process a single event - create or update
   */
  private async processEvent(
    leagueId: string,
    raw: RawEventData,
    source: DataSource
  ): Promise<{ created: boolean; updated: boolean; markets: number; outcomes: number }> {
    const startTime = this.normalizeTime(raw.startTime);
    const status = this.normalizeStatus(raw.status);

    // Look for existing event by external ID or by team names + date
    const existing = await prismaClient.event.findFirst({
      where: {
        leagueId,
        OR: [
          { externalId: raw.externalId },
          {
            homeTeamName: raw.homeTeam,
            awayTeamName: raw.awayTeam,
            startTime: {
              gte: new Date(startTime.getTime() - 3600000),
              lte: new Date(startTime.getTime() + 3600000),
            },
          },
        ],
      },
      include: {
        markets: { include: { outcomes: true } },
      },
    });

    let event: any = existing;
    let created = false;
    let updated = false;

    if (existing) {
      // Update status and scores if changed
      const updates: Record<string, any> = {};
      if (existing.status !== status) updates.status = status;
      if (raw.score) {
        updates.scoreHome = raw.score.home;
        updates.scoreAway = raw.score.away;
      }
      if (Object.keys(updates).length > 0) {
        event = await prismaClient.event.update({
          where: { id: existing.id },
          data: updates,
          include: { markets: { include: { outcomes: true } } },
        });
        updated = true;
      }
    } else {
      event = await prismaClient.event.create({
        data: {
          leagueId,
          externalId: raw.externalId,
          homeTeamName: raw.homeTeam,
          awayTeamName: raw.awayTeam,
          startTime,
          status: status as any,
          scoreHome: raw.score?.home,
          scoreAway: raw.score?.away,
          metadata: raw.metadata || {},
        },
        include: { markets: { include: { outcomes: true } } },
      });
      created = true;
    }

    // Process markets
    let marketsCount = 0;
    let outcomesCount = 0;

    for (const rawMarket of raw.markets) {
      const marketResult = await this.processMarket(
        event.id,
        rawMarket,
        event.markets
      );
      if (marketResult.created) marketsCount++;
      outcomesCount += marketResult.outcomes;
    }

    return { created, updated, markets: marketsCount, outcomes: outcomesCount };
  }

  /**
   * Process a market - create or update outcomes
   */
  private async processMarket(
    eventId: string,
    raw: { name: string; slug: string; type: string; outcomes: any[] },
    existingMarkets: any[]
  ): Promise<{ created: boolean; outcomes: number }> {
    const existingMarket = existingMarkets.find((m) => m.slug === raw.slug);
    let outcomesCount = 0;

    if (existingMarket) {
      // Update odds for existing outcomes
      for (const rawOutcome of raw.outcomes) {
        const existingOutcome = existingMarket.outcomes.find(
          (o: any) => o.slug === rawOutcome.slug
        );

        if (existingOutcome) {
          const oldOdds = Number(existingOutcome.odds);
          const newOdds = rawOutcome.odds;

          // Only update if odds changed significantly (>1%)
          if (Math.abs(oldOdds - newOdds) / oldOdds > 0.01) {
            await prismaClient.outcome.update({
              where: { id: existingOutcome.id },
              data: { odds: newOdds, probability: 1 / newOdds },
            });
            outcomesCount++;
          }
        } else {
          await prismaClient.outcome.create({
            data: {
              marketId: existingMarket.id,
              name: rawOutcome.name,
              slug: rawOutcome.slug,
              odds: rawOutcome.odds,
              probability: rawOutcome.probability || 1 / rawOutcome.odds,
            },
          });
          outcomesCount++;
        }
      }

      return { created: false, outcomes: outcomesCount };
    }

    // Create new market with outcomes
    await prismaClient.market.create({
      data: {
        eventId,
        name: raw.name,
        slug: raw.slug,
        type: raw.type as any,
        status: "OPEN",
        outcomes: {
          create: raw.outcomes.map((o) => ({
            name: o.name,
            slug: o.slug,
            odds: o.odds,
            probability: o.probability || 1 / o.odds,
          })),
        },
      },
    });

    return { created: true, outcomes: raw.outcomes.length };
  }

  // ─── Helpers ─────────────────────────────────────────────

  private async ensureSport(name: string, slug: string) {
    let sport = await prismaClient.sport.findUnique({ where: { slug } });
    if (!sport) {
      sport = await prismaClient.sport.create({
        data: { name, slug, active: true },
      });
    }
    return sport;
  }

  private async ensureLeague(
    sportId: string,
    name: string,
    slug: string,
    country?: string
  ) {
    let league = await prismaClient.league.findFirst({
      where: { sportId, slug },
    });
    if (!league) {
      league = await prismaClient.league.create({
        data: { sportId, name, slug, country, active: true },
      });
    }
    return league;
  }

  private normalizeTime(date: Date): Date {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return new Date();
    }
    return date;
  }

  private normalizeStatus(status: string): string {
    const map: Record<string, string> = {
      upcoming: "UPCOMING",
      live: "LIVE",
      in_play: "LIVE",
      halftime: "LIVE",
      finished: "FINISHED",
      final: "FINISHED",
      cancelled: "CANCELLED",
      canceled: "CANCELLED",
      postponed: "POSTPONED",
      suspended: "CANCELLED",
    };
    return (map[status.toLowerCase()] || "UPCOMING") as any;
  }

  private async updateSourceMetadata(
    source: DataSource,
    result: PipelineResult
  ) {
    // Store sync log in a JSON metadata field on Sport (or a separate table)
    console.log(
      `[Pipeline] ${source}: ${result.eventsCreated} created, ${result.eventsUpdated} updated, ${result.marketsCreated} markets, ${result.outcomesCreated} outcomes in ${result.duration}ms`
    );
  }
}
