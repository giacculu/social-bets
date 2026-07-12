import { NextRequest, NextResponse } from "next/server";
import { getOrchestrator } from "@/lib/data/engine/orchestrator";

/**
 * Vercel Cron Job endpoint
 * Configured in vercel.json to run automatically
 * 
 * This triggers data sync and settlement on a schedule,
 * replacing the node-cron approach (which doesn't work on Vercel)
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const job = url.searchParams.get("job") || "sync";

  const orchestrator = getOrchestrator();

  try {
    switch (job) {
      case "sync": {
        const results = await orchestrator.syncAll();
        return NextResponse.json({
          job: "sync",
          success: true,
          batchesProcessed: results.length,
          events: results.reduce(
            (sum, r) => sum + r.eventsCreated + r.eventsUpdated,
            0
          ),
        });
      }

      case "settle": {
        const settlement = orchestrator.getSettlementEngine();
        const results = await settlement.settleAllPending();
        return NextResponse.json({
          job: "settle",
          success: true,
          betsSettled: results.length,
        });
      }

      case "full": {
        // Full sync + settlement
        const syncResults = await orchestrator.syncAll();
        const settlement = orchestrator.getSettlementEngine();
        const settleResults = await settlement.settleAllPending();
        return NextResponse.json({
          job: "full",
          success: true,
          batchesProcessed: syncResults.length,
          betsSettled: settleResults.length,
        });
      }

      default:
        return NextResponse.json({ error: "Unknown job" }, { status: 400 });
    }
  } catch (error) {
    console.error(`[Cron] Job ${job} failed:`, error);
    return NextResponse.json(
      {
        job,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
