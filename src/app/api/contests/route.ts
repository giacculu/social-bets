import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/requireAuth";
import { ContestService } from "@/server/services/contest.service";
import { contestActionSchema } from "@/server/validators/contest.validator";
import { handleApiError } from "@/server/middleware/error.middleware";

const contestService = new ContestService();

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthApi();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "OPEN";
    const mine = searchParams.get("mine") === "true";
    const contests = await contestService.list(user.id, status, mine);
    return NextResponse.json({ contests: contests.map((c: any) => ({ ...c, entryFee: Number(c.entryFee), prizePool: Number(c.prizePool), platformFee: Number(c.platformFee), playerCount: c.entries.length, isPlayer: c.entries.some((e: any) => e.userId === user.id), isCreator: c.creatorId === user.id })) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthApi();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    const body = await request.json();
    const data = contestActionSchema.parse(body);
    switch (data.action) {
      case "create": {
        const result = await contestService.create(user.id, data);
        return NextResponse.json(result);
      }
      case "join": {
        const result = await contestService.join(user.id, data.contestId);
        return NextResponse.json(result);
      }
      case "leave": {
        const result = await contestService.leave(user.id, data.contestId);
        return NextResponse.json(result);
      }
    }
  } catch (error) {
    return handleApiError(error);
  }
}
