import { prisma } from "@/lib/prisma";

export class WalletRepository {
  async findByUserId(userId: string) {
    return prisma.wallet.findUnique({ where: { userId } });
  }

  async decrementBalance(userId: string, amount: number, tx?: any) {
    const client = tx ?? prisma;
    const rows = await client.$queryRaw<{ userId: string; balance: { toString(): string } }[]>`
      SELECT "userId", balance FROM "Wallet" WHERE "userId" = ${userId} FOR UPDATE
    `;
    const wallet = rows[0];
    if (!wallet) throw new Error("Wallet not found");
    const currentBalance = Number(wallet.balance);
    if (currentBalance < amount) throw new Error("INSUFFICIENT_BALANCE");
    const newBalance = currentBalance - amount;
    await client.$executeRaw`UPDATE "Wallet" SET balance = ${newBalance}, "updatedAt" = NOW() WHERE "userId" = ${userId}`;
    return { userId, balance: newBalance };
  }

  async incrementBalance(userId: string, amount: number, tx?: any) {
    const client = tx ?? prisma;
    await client.wallet.update({ where: { userId }, data: { balance: { increment: amount } } });
    const wallet = await client.wallet.findUnique({ where: { userId } });
    return { userId, balance: Number(wallet!.balance) };
  }

  async decrementRealBalance(userId: string, amount: number) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new Error("Wallet not found");
    if (Number(wallet.balance) < amount) throw new Error("INSUFFICIENT_REAL_BALANCE");
    const newBalance = Number(wallet.balance) - amount;
    await prisma.wallet.update({ where: { userId }, data: { balance: newBalance } });
    return { userId, balance: newBalance };
  }

  async incrementRealBalance(userId: string, amount: number) {
    await prisma.wallet.update({ where: { userId }, data: { balance: { increment: amount } } });
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    return { userId, balance: Number(wallet!.balance) };
  }

  async createTransaction(data: { userId: string; type: string; amount: number; balance: number; reference: string; metadata?: any }) {
    return prisma.transaction.create({ data: { ...data, type: data.type as any } });
  }

  async createRealTransaction(data: { userId: string; type: string; amount: number; balance: number; reference: string; metadata?: any }) {
    return prisma.realTransaction.create({ data: { ...data, type: data.type as any } });
  }
}
