import { prisma } from "@/lib/prisma";

export class FriendshipRepository {
  async findBetween(userId1: string, userId2: string) {
    return prisma.friendship.findFirst({ where: { OR: [{ initiatorId: userId1, receiverId: userId2 }, { initiatorId: userId2, receiverId: userId1 }] } });
  }

  async create(initiatorId: string, receiverId: string, status: "PENDING" | "ACCEPTED" = "PENDING") {
    return prisma.friendship.create({ data: { initiatorId, receiverId, status } });
  }

  async updateStatus(id: string, status: "ACCEPTED" | "BLOCKED") {
    return prisma.friendship.update({ where: { id }, data: { status } });
  }

  async findForUser(userId: string) {
    return prisma.friendship.findMany({ where: { OR: [{ initiatorId: userId }, { receiverId: userId }] }, include: { initiator: { select: { id: true, username: true, name: true } }, receiver: { select: { id: true, username: true, name: true } } }, orderBy: { createdAt: "desc" } });
  }

  async getFriends(userId: string) {
    const all = await this.findForUser(userId);
    return all.filter(f => f.status === "ACCEPTED").map(f => f.initiatorId === userId ? f.receiver : f.initiator);
  }

  async getPendingReceived(userId: string) {
    const all = await this.findForUser(userId);
    return all.filter(f => f.status === "PENDING" && f.receiverId === userId);
  }
}
