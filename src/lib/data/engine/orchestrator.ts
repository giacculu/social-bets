import { prisma } from "@/lib/prisma";
import { ISourceAdapter, PipelineResult, SyncJob, DataSource } from "../types";
import { DataPipeline } from "./pipeline";
import { OddsEngine } from "./odds-engine";
import { SettlementEngine } from "./settlement";
import { TheOddsApiAdapter } from "../sources/the-odds-api";
import { FootballDataAdapter } from "../sources/football-data";

/**
 * Data Orchestrator - Central brain that:
 * 1. Manages all source adapters
 * 2. Schedules sync jobs
 * 3. Handles fallbacks between sources
 * 4. Monitors health and performance
 * 5. Triggers settlement
 */
export class DataOrchestrator {
  private sources: Map<DataSource, ISourceAdapter> = new Map();
  private pipeline: DataPipeline;
  private oddsEngine: OddsEngine;
  private settlementEngine: SettlementEngine;
  private syncHistory: SyncJob[] = [];

  constructor() {
    this.pipeline = new DataPipeline();
    this.oddsEngine = OddsEngine.getInstance();
    this.settlementEngine = new SettlementEngine();
    this.registerDefaultSources();
  }

  /**
   * Register all available data sources
   */
  private registerDefaultSources() {
    // The Odds API - primary for odds
    const oddsApiKey = process.env.THE_ODDS_API_KEY;
    if (oddsApiKey) {
      this.sources.set(
        "the_odds_api",
        new TheOddsApiAdapter(oddsApiKey)
      );
    }

    // Football-Data.org - primary for results and fixtures
    const fdApiKey = process.env.FOOTBALL_DATA_API_KEY;
    if (fdApiKey) {
      this.sources.set(
        "football_data_org",
        new FootballDataAdapter(fdApiKey)
      );
    }

    // Always have internal as fallback
    // (manual data entry via admin)
  }

  /**
   * Full sync from all enabled sources
   */
  async syncAll(): Promise<PipelineResult[]> {
    const results: PipelineResult[] = [];

    console.log("[Orchestrator] Starting full sync...");

    // Sort sources by priority (highest first)
    const sortedSources = Array.from(this.sources.values())
      .filter((s) => s.config.enabled)
      .sort((a, b) => b.config.priority - a.config.priority);

    for (const source of sortedSources) {
      try {
        console.log(
          `[Orchestrator] Syncing ${source.config.displayName}...`
        );

        const job: SyncJob = {
          id: crypto.randomUUID(),
          source: source.config.name,
          status: "running",
          startedAt: new Date(),
        };
        this.syncHistory.push(job);

        const rawData = await source.fetchEvents();

        for (const data of rawData) {
          const result = await this.pipeline.processRawData(data);
          results.push(result);
          job.result = result;
        }

        job.status = "completed";
        job.completedAt = new Date();
        source.config.lastSync = new Date();
        source.config.totalSyncs++;

        console.log(
          `[Orchestrator] ${source.config.displayName} synced: ${
            rawData.length
          } batches`
        );
      } catch (error) {
        console.error(
          `[Orchestrator] ${source.config.displayName} failed:`,
          error
        );
        source.config.errorCount++;

        const job: SyncJob = {
          id: crypto.randomUUID(),
          source: source.config.name,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
          completedAt: new Date(),
        };
        this.syncHistory.push(job);
      }
    }

    // After sync, try to settle any finished bets
    try {
      await this.settlementEngine.settleAllPending();
      console.log("[Orchestrator] Settlement completed");
    } catch (error) {
      console.error("[Orchestrator] Settlement failed:", error);
    }

    console.log(
      `[Orchestrator] Full sync completed: ${results.length} batches processed`
    );

    return results;
  }

  /**
   * Sync a specific sport
   */
  async syncSport(sportSlug: string): Promise<PipelineResult[]> {
    const results: PipelineResult[] = [];

    for (const source of this.sources.values()) {
      if (!source.config.enabled) continue;
      if (
        source.config.sports.length > 0 &&
        !source.config.sports.includes(sportSlug)
      )
        continue;

      try {
        const rawData = await source.fetchEvents(sportSlug);
        for (const data of rawData) {
          const result = await this.pipeline.processRawData(data);
          results.push(result);
        }
      } catch (error) {
        console.error(
          `[Orchestrator] ${source.config.name} failed for ${sportSlug}:`,
          error
        );
      }
    }

    return results;
  }

  /**
   * Get odds from all sources and blend them
   */
  async getBlendedOdds(
    eventId: string,
    marketSlug: string
  ): Promise<
    { outcomeName: string; odds: number; sources: number }[] | null
  > {
    // Get current odds from database
    const market = await prisma.market.findFirst({
      where: { eventId, slug: marketSlug },
      include: { outcomes: true },
    });

    if (!market) return null;

    return market.outcomes.map((o) => ({
      outcomeName: o.name,
      odds: Number(o.odds),
      sources: 1, // TODO: track source count
    }));
  }

  /**
   * Get system health and status
   */
  async getSystemStatus(): Promise<{
    sources: {
      name: string;
      displayName: string;
      enabled: boolean;
      lastSync: string | null;
      errorCount: number;
      totalSyncs: number;
      reliability: number;
      healthy: boolean;
    }[];
    stats: {
      totalEvents: number;
      totalMarkets: number;
      totalOutcomes: number;
      upcomingEvents: number;
      liveEvents: number;
      settledBets: number;
      pendingBets: number;
    };
    recentJobs: SyncJob[];
  }> {
    const [
      totalEvents,
      totalMarkets,
      totalOutcomes,
      upcomingEvents,
      liveEvents,
      settledBets,
      pendingBets,
    ] = await Promise.all([
      prisma.event.count(),
      prisma.market.count(),
      prisma.outcome.count(),
      prisma.event.count({ where: { status: "UPCOMING" } }),
      prisma.event.count({ where: { status: "LIVE" } }),
      prisma.bet.count({ where: { settled: true } }),
      prisma.bet.count({ where: { settled: false } }),
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
      stats: {
        totalEvents,
        totalMarkets,
        totalOutcomes,
        upcomingEvents,
        liveEvents,
        settledBets,
        pendingBets,
      },
      recentJobs: this.syncHistory.slice(-20),
    };
  }

  /**
   * Force settlement of specific event
   */
  async forceSettleEvent(eventId: string): Promise<number> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        markets: {
          include: {
            bets: { where: { settled: false } },
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
        await prisma.bet.update({
          where: { id: bet.id },
          data: { settled: true, status: "PENDING" },
        });
        settled++;
      }
    }

    return settled;
  }

  /**
   * Add a custom/manual source adapter
   */
  registerSource(source: ISourceAdapter) {
    this.sources.set(source.config.name, source);
  }

  /**
   * Get odds engine for calculations
   */
  getOddsEngine(): OddsEngine {
    return this.oddsEngine;
  }

  /**
   * Get settlement engine
   */
  getSettlementEngine(): SettlementEngine {
    return this.settlementEngine;
  }
}

// Singleton
let orchestratorInstance: DataOrchestrator | null = null;

export function getOrchestrator(): DataOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new DataOrchestrator();
  }
  return orchestratorInstance;
}
