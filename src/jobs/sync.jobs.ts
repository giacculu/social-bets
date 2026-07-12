import { inngest } from "@/lib/inngest";
import { getOrchestrator } from "@/lib/data/engine/orchestrator";
import { createChildLogger } from "@/lib/logger";

const log = createChildLogger({ module: "jobs:sync" });

export const syncAllFn = inngest.createFunction(
  { id: "sync-all", name: "Full Data Sync", concurrency: 1, triggers: [{ cron: "0 */2 * * *" }] },
  async ({ event, step }) => {
    log.info("Starting full data sync");
    const orchestrator = getOrchestrator();
    const results = await orchestrator.syncAll();
    const totalEvents = results.reduce((s, r) => s + r.eventsCreated + r.eventsUpdated, 0);
    log.info({ eventsProcessed: totalEvents }, "Full sync completed");
    return { batchesProcessed: results.length, eventsProcessed: totalEvents };
  }
);

export const syncSportFn = inngest.createFunction(
  { id: "sync-sport", name: "Sport Sync", triggers: [{ event: "sync/sport.requested" }] },
  async ({ event, step }) => {
    const { sportSlug } = event.data;
    log.info({ sport: sportSlug }, "Syncing sport");
    const orchestrator = getOrchestrator();
    const results = await orchestrator.syncSport(sportSlug);
    return { sport: sportSlug, batches: results.length };
  }
);
