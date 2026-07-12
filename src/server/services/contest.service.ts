import { createChildLogger } from "@/lib/logger";
import { ContestRepository } from "../repositories/contest.repository";
import { WalletService } from "./wallet.service";
import { NotFoundError, AppError } from "@/lib/errors";

const log = createChildLogger({ module: "contest-service" });

export class ContestService {
  private repo = new ContestRepository();
  private walletService = new WalletService();

  async list(userId: string, status?: string, mine?: boolean) {
    return this.repo.findMany({ status, userId: mine ? userId : undefined });
  }

  async create(userId: string, data: { title: string; description?: string; entryFee: number; maxPlayers?: number; startTime: string; endTime: string; eventId?: string }) {
    const contest = await this.repo.create({ creatorId: userId, title: data.title, description: data.description, entryFee: data.entryFee, maxPlayers: data.maxPlayers ?? 10, startTime: new Date(data.startTime), endTime: new Date(data.endTime), eventId: data.eventId ?? null, status: "OPEN" });
    log.info({ userId, contestId: contest.id }, "Contest created");
    return { contestId: contest.id };
  }

  async join(userId: string, contestId: string) {
    const contest = await this.repo.findById(contestId);
    if (!contest) throw new NotFoundError("Contest");
    if (contest.status !== "OPEN") throw new AppError("Contest no longer open", 400, "CONTEST_CLOSED");
    if (contest.entries.length >= contest.maxPlayers) throw new AppError("Contest full", 400, "CONTEST_FULL");
    if (contest.entries.some(e => e.userId === userId)) throw new AppError("Already joined", 400, "ALREADY_JOINED");

    const fee = Number(contest.entryFee);
    await this.walletService.deductRealBalance(userId, fee, "CONTEST_ENTRY", contest.title, { contestId });
    const newPrizePool = Number(contest.prizePool) + fee * 0.9;
    await this.repo.updatePrizePool(contestId, newPrizePool);
    await this.repo.addEntry(contestId, userId);
    log.info({ userId, contestId }, "Joined contest");
    return { success: true };
  }

  async leave(userId: string, contestId: string) {
    const entry = await this.repo.findEntry(contestId, userId);
    if (!entry) throw new NotFoundError("Contest entry");
    const contest = await this.repo.findById(contestId);
    if (!contest || contest.status !== "OPEN") throw new AppError("Contest not modifiable", 400, "CONTEST_NOT_MODIFIABLE");

    const fee = Number(contest.entryFee);
    await this.walletService.creditRealBalance(userId, fee, "CONTEST_REFUND", `Refund: ${contest.title}`, { contestId });
    const newPrizePool = Math.max(0, Number(contest.prizePool) - fee * 0.9);
    await this.repo.updatePrizePool(contestId, newPrizePool);
    await this.repo.removeEntry(entry.id);
    log.info({ userId, contestId }, "Left contest");
    return { success: true };
  }
}
