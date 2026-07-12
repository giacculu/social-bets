import { prisma } from "@/lib/prisma";

export class ContestRepository {
  async findById(id: string) {
    return prisma.contest.findUnique({ where: { id }, include: { creator: true, entries: true, event: true } });
  }

  async findMany(filter: { status?: string; userId?: string; limit?: number }) {
    const where: any = {};
    if (filter.status) where.status = filter.status;
    if (filter.userId) where.OR = [{ creatorId: filter.userId }, { entries: { some: { userId: filter.userId } } }];
    return prisma.contest.findMany({ where, include: { creator: { select: { username: true, name: true } }, entries: { select: { userId: true } }, event: { select: { homeTeamName: true, awayTeamName: true, startTime: true } } }, orderBy: { startTime: "asc" }, take: filter.limit ?? 50 });
  }

  async create(data: any) {
    return prisma.contest.create({ data });
  }

  async updatePrizePool(id: string, prizePool: number) {
    return prisma.contest.update({ where: { id }, data: { prizePool } });
  }

  async addEntry(contestId: string, userId: string) {
    return prisma.contestEntry.create({ data: { contestId, userId, predictions: {} } });
  }

  async removeEntry(entryId: string) {
    return prisma.contestEntry.delete({ where: { id: entryId } });
  }

  async findEntry(contestId: string, userId: string) {
    return prisma.contestEntry.findFirst({ where: { contestId, userId } });
  }
}
