import cron, { type ScheduledTask } from "node-cron";
import { getOrchestrator } from "./engine/orchestrator";

/**
 * Cron Scheduler - Manages all periodic data collection jobs
 * 
 * Schedule:
 * - Every 5 minutes: Live event status updates
 * - Every 30 minutes: Odds refresh for upcoming events
 * - Every 2 hours: Full sync from all sources
 * - Every 6 hours: Deep sync (all leagues, all sources)
 * - Every 12 hours: Settlement sweep
 * - Daily at 3 AM: Full reconciliation
 */

let isInitialized = false;
let jobs: ScheduledTask[] = [];

export function initCronJobs() {
  if (isInitialized) return;
  isInitialized = true;

  console.log("[Cron] Initializing data collection cron jobs...");

  // ─── Every 5 minutes: Quick status check for live events ───
  const liveUpdateJob = cron.schedule("*/5 * * * *", async () => {
    console.log("[Cron] Running live event status update...");
    try {
      const orchestrator = getOrchestrator();
      await orchestrator.syncSport("calcio");
      await orchestrator.syncSport("basketball");
    } catch (error) {
      console.error("[Cron] Live update failed:", error);
    }
  });

  // ─── Every 30 minutes: Odds refresh ───
  const oddsRefreshJob = cron.schedule("*/30 * * * *", async () => {
    console.log("[Cron] Running odds refresh...");
    try {
      const orchestrator = getOrchestrator();
      await orchestrator.syncSport("calcio");
      await orchestrator.syncSport("tennis");
      await orchestrator.syncSport("mma");
    } catch (error) {
      console.error("[Cron] Odds refresh failed:", error);
    }
  });

  // ─── Every 2 hours: Full sync ───
  const fullSyncJob = cron.schedule("0 */2 * * *", async () => {
    console.log("[Cron] Running full sync from all sources...");
    try {
      const orchestrator = getOrchestrator();
      const results = await orchestrator.syncAll();
      const totalEvents = results.reduce((s, r) => s + r.eventsCreated + r.eventsUpdated, 0);
      console.log(`[Cron] Full sync completed: ${totalEvents} events processed`);
    } catch (error) {
      console.error("[Cron] Full sync failed:", error);
    }
  });

  // ─── Every 6 hours: Deep sync ───
  const deepSyncJob = cron.schedule("0 */6 * * *", async () => {
    console.log("[Cron] Running deep sync...");
    try {
      const orchestrator = getOrchestrator();
      await orchestrator.syncAll();
    } catch (error) {
      console.error("[Cron] Deep sync failed:", error);
    }
  });

  // ─── Every 12 hours: Settlement sweep ───
  const settlementJob = cron.schedule("0 */12 * * *", async () => {
    console.log("[Cron] Running settlement sweep...");
    try {
      const orchestrator = getOrchestrator();
      const settlement = orchestrator.getSettlementEngine();
      const results = await settlement.settleAllPending();
      console.log(`[Cron] Settlement completed: ${results.length} bets settled`);
    } catch (error) {
      console.error("[Cron] Settlement failed:", error);
    }
  });

  // ─── Daily at 3 AM: Full reconciliation ───
  const reconciliationJob = cron.schedule("0 3 * * *", async () => {
    console.log("[Cron] Running daily reconciliation...");
    try {
      const orchestrator = getOrchestrator();
      await orchestrator.syncAll();
      const settlement = orchestrator.getSettlementEngine();
      await settlement.settleAllPending();
      console.log("[Cron] Daily reconciliation completed");
    } catch (error) {
      console.error("[Cron] Reconciliation failed:", error);
    }
  });

  jobs = [liveUpdateJob, oddsRefreshJob, fullSyncJob, deepSyncJob, settlementJob, reconciliationJob];

  console.log("[Cron] All jobs registered");
}

export function stopCronJobs() {
  jobs.forEach((job) => job.stop());
  jobs = [];
  isInitialized = false;
  console.log("[Cron] All jobs stopped");
}

export function getCronStatus() {
  return {
    initialized: isInitialized,
    activeJobs: jobs.length,
    schedule: {
      liveUpdate: "*/5 * * * * (every 5 min)",
      oddsRefresh: "*/30 * * * * (every 30 min)",
      fullSync: "0 */2 * * * (every 2h)",
      deepSync: "0 */6 * * * (every 6h)",
      settlement: "0 */12 * * * (every 12h)",
      reconciliation: "0 3 * * * (daily 3 AM)",
    },
  };
}
