import { inngest } from "@/lib/inngest";
import { getOrchestrator } from "@/lib/data/engine/orchestrator";
import { createChildLogger } from "@/lib/logger";

const log = createChildLogger({ module: "jobs:settlement" });

export const settlementSweepFn = inngest.createFunction(
  { id: "settlement-sweep", name: "Settlement Sweep", concurrency: 1, triggers: [{ cron: "0 */12 * * *" }] },
  async ({ event, step }) => {
    log.info("Starting settlement sweep");
    const orchestrator = getOrchestrator();
    const settlement = orchestrator.getSettlementEngine();
    const results = await settlement.settleAllPending();
    log.info({ betsSettled: results.length }, "Settlement completed");
    return { betsSettled: results.length };
  }
);
