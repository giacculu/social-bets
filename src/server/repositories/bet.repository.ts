import { prisma } from "@/lib/prisma";

export class BetRepository {
  async create(data: { userId: string; eventId: string; marketId: string; outcomeId: string; stake: number; odds: number; potentialWin: number }) {
    return prisma.bet.create({ data: { ...data, status: "PENDING" as any } });
  }

  async findById(id: string) {
    return prisma.bet.findUnique({ where: { id }, include: { event: true, market: true, outcome: true, user: true } });
  }

  async findPendingByEvent(eventId: string) {
    return prisma.bet.findMany({ where: { eventId, settled: false }, include: { user: true, outcome: true, market: true } });
  }

  async settle(id: string, status: "WON" | "LOST", result: "WIN" | "LOSS") {
    return prisma.bet.update({ where: { id }, data: { status, result, settled: true } });
  }
}
