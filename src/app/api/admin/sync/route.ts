import { NextRequest, NextResponse } from "next/server";
import { getOrchestrator } from "@/lib/data/engine/orchestrator";
import { handleApiError } from "@/server/middleware/error.middleware";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sport } = body;
    const orchestrator = getOrchestrator();
    switch (action) {
      case "sync_all": {
        const results = await orchestrator.syncAll();
        return NextResponse.json({ success: true, results });
      }
      case "sync_sport": {
        if (!sport) return NextResponse.json({ error: "sport parameter required" }, { status: 400 });
        const results = await orchestrator.syncSport(sport);
        return NextResponse.json({ success: true, results });
      }
      case "settle": {
        const settlement = orchestrator.getSettlementEngine();
        const results = await settlement.settleAllPending();
        return NextResponse.json({ success: true, settled: results.length, results });
      }
      case "status": {
        const status = await orchestrator.getSystemStatus();
        return NextResponse.json(status);
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const orchestrator = getOrchestrator();
    const status = await orchestrator.getSystemStatus();
    return NextResponse.json(status);
  } catch (error) {
    return handleApiError(error);
  }
}
