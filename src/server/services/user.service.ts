import { UserRepository } from "../repositories/user.repository";
import { NotFoundError } from "@/lib/errors";

export class UserService {
  private repo = new UserRepository();

  async getProfile(userId: string) {
    const user = await this.repo.findById(userId);
    if (!user) throw new NotFoundError("User");
    return { id: user.id, username: user.username, name: user.name, email: user.email, avatarUrl: user.avatarUrl, inviteCode: user.inviteCode, role: user.role, createdAt: user.createdAt };
  }

  async updateProfile(userId: string, data: { name?: string; avatarUrl?: string }) {
    return this.repo.update(userId, data);
  }

  async getStats(userId: string) {
    const { prisma } = await import("@/lib/prisma");
    const [betCount, wonCount, totalStaked] = await Promise.all([
      prisma.bet.count({ where: { userId } }),
      prisma.bet.count({ where: { userId, status: "WON" } }),
      prisma.bet.aggregate({ where: { userId }, _sum: { stake: true } }),
    ]);
    const winRate = betCount > 0 ? wonCount / betCount : 0;
    return { betCount, wonCount, lostCount: betCount - wonCount, winRate, totalStaked: Number(totalStaked._sum.stake ?? 0) };
  }
}
