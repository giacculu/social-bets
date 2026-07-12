import { createChildLogger } from "@/lib/logger";
import { FriendshipRepository } from "../repositories/friendship.repository";
import { UserRepository } from "../repositories/user.repository";
import { NotFoundError, AppError, ConflictError } from "@/lib/errors";

const log = createChildLogger({ module: "friendship-service" });

export class FriendshipService {
  private friendshipRepo = new FriendshipRepository();
  private userRepo = new UserRepository();

  async addFriend(userId: string, targetUsername: string) {
    const target = await this.userRepo.findByUsername(targetUsername);
    if (!target) throw new NotFoundError("User");
    if (target.id === userId) throw new AppError("Cannot add yourself", 400, "SELF_ADD");
    const existing = await this.friendshipRepo.findBetween(userId, target.id);
    if (existing) throw new ConflictError("Friend request already exists");
    await this.friendshipRepo.create(userId, target.id);
    log.info({ userId, targetId: target.id }, "Friend request sent");
    return { success: true };
  }

  async acceptRequest(userId: string, friendshipId: string) {
    const friendship = await this.friendshipRepo.findBetween(userId, friendshipId) ?? await (async () => {
      const { prisma } = await import("@/lib/prisma");
      return prisma.friendship.findUnique({ where: { id: friendshipId } });
    })();
    if (!friendship || friendship.receiverId !== userId) throw new NotFoundError("Friend request");
    await this.friendshipRepo.updateStatus(friendshipId, "ACCEPTED");
    log.info({ userId, friendshipId }, "Friend request accepted");
    return { success: true };
  }

  async declineRequest(userId: string, friendshipId: string) {
    const { prisma } = await import("@/lib/prisma");
    const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
    if (!friendship || friendship.receiverId !== userId) throw new NotFoundError("Friend request");
    await this.friendshipRepo.updateStatus(friendshipId, "BLOCKED");
    log.info({ userId, friendshipId }, "Friend request declined");
    return { success: true };
  }

  async getFriends(userId: string) {
    const friends = await this.friendshipRepo.getFriends(userId);
    const pendingReceived = await this.friendshipRepo.getPendingReceived(userId);
    return { friends, pendingReceived };
  }
}
