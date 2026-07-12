import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/requireAuth";
import { createChildLogger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { createCustomBetSchema } from "@/server/validators/custom-bet.validator";
import { handleApiError } from "@/server/middleware/error.middleware";
import { NotFoundError, AppError } from "@/lib/errors";

const log = createChildLogger({ module: "api:custom-bets" });

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthApi();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    const body = await request.json();
    const data = createCustomBetSchema.parse(body);

    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet || Number(wallet.balance) < data.stake * data.participantUsernames.length) {
      throw new AppError("Insufficient balance", 400, "INSUFFICIENT_BALANCE");
    }

    const participants = await prisma.user.findMany({ where: { username: { in: data.participantUsernames } } });
    if (participants.length !== data.participantUsernames.length) throw new NotFoundError("Some users");

    const totalCost = data.stake * participants.length;
    const customBet = await prisma.customBet.create({ data: { creatorId: user.id, title: data.title, description: data.description, stake: data.stake, deadline: new Date(data.deadline), status: "PENDING", participants: { create: participants.map(p => ({ userId: p.id, prediction: "" })) } } });

    await prisma.$transaction([prisma.wallet.update({ where: { userId: user.id }, data: { balance: { decrement: totalCost } } }), prisma.transaction.create({ data: { userId: user.id, type: "CUSTOM_BET_ENTRY", amount: -totalCost, balance: Number(wallet.balance) - totalCost, reference: `Challenge: ${data.title}` } })]);

    log.info({ userId: user.id, customBetId: customBet.id }, "Custom bet created");
    return NextResponse.json({ success: true, betId: customBet.id });
  } catch (error) {
    return handleApiError(error);
  }
}
