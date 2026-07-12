import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/requireAuth";
import { BetService } from "@/server/services/bet.service";
import { placeBetSchema } from "@/server/validators/bet.validator";
import { handleApiError } from "@/server/middleware/error.middleware";

const betService = new BetService();

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthApi();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    const body = await request.json();
    const data = placeBetSchema.parse(body);
    const result = await betService.placeBet(user.id, data.eventId, data.marketId, data.outcomeId, data.stake);
    return NextResponse.json({ success: true, betId: result.betId });
  } catch (error) {
    return handleApiError(error);
  }
}
