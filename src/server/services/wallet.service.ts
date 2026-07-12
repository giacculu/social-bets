import { createChildLogger } from "@/lib/logger";
import { WalletRepository } from "../repositories/wallet.repository";
import { AppError, InsufficientBalanceError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

const log = createChildLogger({ module: "wallet-service" });

export class WalletService {
  private repo = new WalletRepository();

  async getBalance(userId: string) {
    const wallet = await this.repo.findByUserId(userId);
    if (!wallet) throw new NotFoundError("Wallet");
    return { balance: Number(wallet.balance), realBalance: Number(wallet.balance) };
  }

  async deposit(userId: string, amount: number) {
    if (amount < 1 || amount > 10000) throw new AppError("Invalid amount (1-10000)", 400, "INVALID_AMOUNT");
    const result = await this.repo.incrementRealBalance(userId, amount);
    await this.repo.createRealTransaction({ userId, type: "DEPOSIT", amount, balance: result.balance, reference: "Simulated deposit" });
    log.info({ userId, amount }, "Deposit completed");
    return { balance: result.balance };
  }

  async withdraw(userId: string, amount: number) {
    if (amount < 1) throw new AppError("Invalid amount", 400, "INVALID_AMOUNT");
    const result = await this.repo.decrementRealBalance(userId, amount);
    await this.repo.createRealTransaction({ userId, type: "WITHDRAWAL", amount: -amount, balance: result.balance, reference: "Withdrawal request" });
    log.info({ userId, amount }, "Withdrawal completed");
    return { balance: result.balance };
  }

  async deductVirtualBalance(userId: string, amount: number, reference: string) {
    const result = await this.repo.decrementBalance(userId, amount);
    await this.repo.createTransaction({ userId, type: "BET_PLACED", amount: -amount, balance: result.balance, reference });
    return result;
  }

  async creditVirtualBalance(userId: string, amount: number, type: string, reference: string) {
    const result = await this.repo.incrementBalance(userId, amount);
    await this.repo.createTransaction({ userId, type, amount, balance: result.balance, reference });
    return result;
  }

  async deductRealBalance(userId: string, amount: number, type: string, reference: string, metadata?: any) {
    const result = await this.repo.decrementRealBalance(userId, amount);
    await this.repo.createRealTransaction({ userId, type, amount: -amount, balance: result.balance, reference, metadata });
    return result;
  }

  async creditRealBalance(userId: string, amount: number, type: string, reference: string, metadata?: any) {
    const result = await this.repo.incrementRealBalance(userId, amount);
    await this.repo.createRealTransaction({ userId, type, amount, balance: result.balance, reference, metadata });
    return result;
  }
}
