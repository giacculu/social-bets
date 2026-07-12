import bcrypt from "bcryptjs";
import { createChildLogger } from "@/lib/logger";
import { UserRepository } from "../repositories/user.repository";
import { FriendshipRepository } from "../repositories/friendship.repository";
import { WalletService } from "./wallet.service";
import { AppError, ConflictError } from "@/lib/errors";

const log = createChildLogger({ module: "auth-service" });

export class AuthService {
  private userRepo = new UserRepository();
  private friendshipRepo = new FriendshipRepository();
  private walletService = new WalletService();

  async register(data: { username: string; email: string; password: string; name?: string; inviteCode?: string }) {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) throw new ConflictError("Email already in use");
    const existingUsername = await this.userRepo.findByUsername(data.username);
    if (existingUsername) throw new ConflictError("Username already in use");

    const passwordHash = await bcrypt.hash(data.password, 12);
    const userInviteCode = data.username.toUpperCase() + Math.random().toString(36).slice(2, 8).toUpperCase();

    let referrerCode: string | null = null;
    if (data.inviteCode?.trim()) {
      const referrer = await this.userRepo.findByInviteCode(data.inviteCode.trim().toUpperCase());
      if (referrer) referrerCode = referrer.inviteCode;
    }

    const user = await this.userRepo.create({ username: data.username, email: data.email, passwordHash, name: data.name, inviteCode: userInviteCode, referredBy: referrerCode ?? undefined });

    await this.walletService.creditVirtualBalance(user.id, 10000, "DEPOSIT", "Welcome bonus");

    if (referrerCode) {
      const referrer = await this.userRepo.findByInviteCode(referrerCode);
      if (referrer) {
        await this.friendshipRepo.create(referrer.id, user.id, "ACCEPTED");
        await this.walletService.creditVirtualBalance(referrer.id, 500, "REFERRAL_BONUS", `Referral from @${data.username}`);
      }
    }

    log.info({ userId: user.id, username: data.username }, "User registered");
    return { success: true };
  }

  async redeemInvite(userId: string, inviteCode: string) {
    const referrer = await this.userRepo.findByInviteCode(inviteCode.trim().toUpperCase());
    if (!referrer) throw new AppError("Invalid code", 404, "INVALID_CODE");
    if (referrer.id === userId) throw new AppError("Cannot use your own code", 400, "SELF_REFERRAL");

    const currentUser = await this.userRepo.findById(userId);
    if (currentUser?.referredBy) throw new AppError("Already used a referral code", 400, "ALREADY_REFERRED");

    const existing = await this.friendshipRepo.findBetween(userId, referrer.id);
    if (!existing) await this.friendshipRepo.create(referrer.id, userId, "ACCEPTED");

    await this.userRepo.update(userId, { referredBy: referrer.inviteCode });
    await this.walletService.creditVirtualBalance(referrer.id, 500, "REFERRAL_BONUS", `Referral from @${currentUser?.username || "unknown"}`);

    log.info({ userId, referrerId: referrer.id }, "Invite redeemed");
    return { success: true, bonus: 500 };
  }

  async getInviteCode(userId: string) {
    const user = await this.userRepo.findById(userId);
    return { inviteCode: user?.inviteCode };
  }
}
