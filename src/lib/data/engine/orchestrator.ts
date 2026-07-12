import { prisma } from "@/lib/prisma";
import { createChildLogger } from "@/lib/logger";
import { ISourceAdapter, PipelineResult, DataSource } from "../types";
import { DataPipeline } from "./pipeline";
import { OddsEngine } from "./odds-engine";
import { SettlementEngine } from "./settlement";
import { TheOddsApiAdapter } from "../sources/the-odds-api";
import { FootballDataAdapter } from "../sources/football-data";

const log = createChildLogger({ module: "orchestrator" });

/**
 * Data Orchestrator - Central brain that:
 * 1. Manages all source adapters
 * 2. Schedules sync jobs (persisted to DB)
 * 3. Handles fallbacks between sources
 * 4. Monitors health and performance
 * 5. Triggers settlement
 */
export class DataOrchestrator {
  private sources: Map<DataSource, ISourceAdapter> = new Map();
  private pipeline: DataPipeline;
  private oddsEngine: OddsEngine;
  private settlementEngine: SettlementEngine;

  constructor() {
    this.pipeline = new DataPipeline();
    this.oddsEngine = OddsEngine.getInstance();
    this.settlementEngine = new SettlementEngine();
    this.registerDefaultSources();
  }

  private registerDefaultSources() {
    const oddsApiKey = process.env.THE_ODDS_API_KEY;
    if (oddsApiKey) {
      this.sources.set("the_odds_api", new TheOddsApiAdapter(oddsApiKey));
    }

    const fdApiKey = process.env.FOOTBALL_DATA_API_KEY;
    if (fdApiKey) {
      this.sources.set("football_data_org", new FootballDataAdapter(fdApiKey));
    }
  }

  async syncAll(): Promise<PipelineResult[]> {
    const results: PipelineResult[] = [];

    log.info("Starting full sync");

    const sortedSources = Array.from(this.sources.values())
      .filter((s) => s.config.enabled)
      .sort((a, b) => b.config.priority - a.config.priority);

    for (const source of sortedSources) {
      const syncJob = await prisma.syncJob.create({
        data: { source: source.config.name as any, status: "RUNNING" },
      });

      try {
        log.info({ source: source.config.displayName }, "Syncing source");

        const rawData = await source.fetchEvents();
        let eventsProcessed = 0;

        for (const data of rawData) {
          const result = await this.pipeline.processRawData(data);
          results.push(result);
          eventsProcessed += result.eventsCreated + result.eventsUpdated;
        }

        await prisma.syncJob.update({
          where: { id: syncJob.id },
          data: { status: "COMPLETED", completedAt: new Date(), eventsProcessed },
        });

        source.config.lastSync = new Date();
        source.config.totalSyncs++;

        log.info({ source: source.config.displayName, batches: rawData.length }, "Source synced");
      } catch (error) {
        log.error({ source: source.config.displayName, err: error }, "Source sync failed");
        source.config.errorCount++;

        await prisma.syncJob.update({
          where: { id: syncJob.id },
          data: {
            status: "FAILED",
            completedAt: new Date(),
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
      }
    }

    try {
      await this.settlementEngine.settleAllPending();
      log.info("Settlement completed");
    } catch (error) {
      log.error({ err: error }, "Settlement failed");
    }

    log.info({ batches: results.length }, "Full sync completed");
    return results;
  }

  async syncSport(sportSlug: string): Promise<PipelineResult[]> {
    const results: PipelineResult[] = [];

    for (const source of this.sources.values()) {
      if (!source.config.enabled) continue;
      if (source.config.sports.length > 0 && !source.config.sports.includes(sportSlug)) continue;

      try {
        const rawData = await source.fetchEvents(sportSlug);
        for (const data of rawData) {
          const result = await this.pipeline.processRawData(data);
          results.push(result);
        }
      } catch (error) {
        log.error({ source: source.config.name, sport: sportSlug, err: error }, "Sport sync failed");
      }
    }

    return results;
  }

  async getBlendedOdds(eventId: string, marketSlug: string) {
    const market = await prisma.market.findFirst({
      where: { eventId, slug: marketSlug },
      include: { outcomes: true },
    });

    if (!market) return null;

    return market.outcomes.map((o) => ({
      outcomeName: o.name,
      odds: Number(o.odds),
      sources: 1,
    }));
  }

  async getSystemStatus() {
    const [totalEvents, totalMarkets, totalOutcomes, upcomingEvents, liveEvents, settledBets, pendingBets, recentJobs] = await Promise.all([
      prisma.event.count(),
      prisma.market.count(),
      prisma.outcome.count(),
      prisma.event.count({ where: { status: "UPCOMING" } }),
      prisma.event.count({ where: { status: "LIVE" } }),
      prisma.bet.count({ where: { settled: true } }),
      prisma.bet.count({ where: { settled: false } }),
      prisma.syncJob.findMany({ orderBy: { startedAt: "desc" }, take: 20 }),
    ]);

    const sources = Array.from(this.sources.values()).map((s) => ({
      name: s.config.name,
      displayName: s.config.displayName,
      enabled: s.config.enabled,
      lastSync: s.config.lastSync?.toISOString() || null,
      errorCount: s.config.errorCount,
      totalSyncs: s.config.totalSyncs,
      reliability: s.config.reliability,
      healthy: s.config.errorCount < 5,
    }));

    return {
      sources,
      stats: { totalEvents, totalMarkets, totalOutcomes, upcomingEvents, liveEvents, settledBets, pendingBets },
      recentJobs: recentJobs.map((j) => ({
        id: j.id,
        source: j.source,
        status: j.status.toLowerCase(),
        startedAt: j.startedAt,
        completedAt: j.completedAt,
        eventsProcessed: j.eventsProcessed,
        error: j.error,
      })),
    };
  }

  async forceSettleEvent(eventId: string): Promise<number> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        markets: {
          include: {
            bets: { where: { settled: false }, include: { outcome: true, market: true } },
          },
        },
      },
    });

    if (!event || event.status !== "FINISHED") {
      throw new Error("Event not found or not finished");
    }

    let settled = 0;
    for (const market of event.markets) {
      for (const bet of market.bets) {
        try {
          await this.settlementEngine.settleBet(bet, event);
          settled++;
        } catch (error) {
          log.error({ betId: bet.id, err: error }, "Error force-settling bet");
        }
      }
    }

    return settled;
  }

  registerSource(source: ISourceAdapter) {
    this.sources.set(source.config.name, source);
  }

  getOddsEngine(): OddsEngine {
    return this.oddsEngine;
  }

  getSettlementEngine(): SettlementEngine {
    return this.settlementEngine;
  }
}

let orchestratorInstance: DataOrchestrator | null = null;

export function getOrchestrator(): DataOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new DataOrchestrator();
  }
  return orchestratorInstance;
}
