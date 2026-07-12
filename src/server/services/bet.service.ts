import { createChildLogger } from "@/lib/logger";
import { BetRepository } from "../repositories/bet.repository";
import { WalletService } from "./wallet.service";
import { NotFoundError, AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

const log = createChildLogger({ module: "bet-service" });

export class BetService {
  private betRepo = new BetRepository();
  private walletService = new WalletService();

  async placeBet(userId: string, eventId: string, marketId: string, outcomeId: string, stake: number) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.status !== "UPCOMING") throw new AppError("Event not available", 400, "EVENT_UNAVAILABLE");

    const market = await prisma.market.findUnique({ where: { id: marketId } });
    if (!market || market.status !== "OPEN") throw new AppError("Market closed", 400, "MARKET_CLOSED");

    const outcome = await prisma.outcome.findUnique({ where: { id: outcomeId } });
    if (!outcome || outcome.marketId !== marketId) throw new AppError("Invalid outcome", 400, "INVALID_OUTCOME");

    const serverOdds = Number(outcome.odds);
    const potentialWin = stake * serverOdds;

    const result = await prisma.$transaction(async (tx) => {
      const lockedRows = await tx.$queryRaw<{ id: string; balance: { toString(): string } }[]>`
        SELECT id, balance FROM "User" WHERE id = ${userId} FOR UPDATE
      `;
      const lockedUser = lockedRows[0];
      if (!lockedUser) throw new NotFoundError("User");
      if (Number(lockedUser.balance) < stake) throw new AppError("Insufficient balance", 400, "INSUFFICIENT_BALANCE");

      const bet = await tx.bet.create({ data: { userId, eventId, marketId, outcomeId, stake, odds: serverOdds, potentialWin, status: "PENDING" } });
      const newBalance = Number(lockedUser.balance) - stake;
      await tx.$executeRaw`UPDATE "User" SET balance = ${newBalance}, "updatedAt" = NOW() WHERE id = ${userId}`;
      await tx.transaction.create({ data: { userId, type: "BET_PLACED", amount: -stake, balance: newBalance, reference: `Bet #${bet.id}` } });
      return { betId: bet.id };
    });

    log.info({ userId, betId: result.betId, stake }, "Bet placed");
    return result;
  }
}
