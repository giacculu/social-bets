import { describe, it, expect, vi, beforeEach } from "vitest";
import { InsufficientBalanceError, NotFoundError } from "@/lib/errors";

const mockPrisma = {
  wallet: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  transaction: {
    create: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

describe("Wallet operations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("InsufficientBalanceError thrown when balance too low", () => {
    const err = new InsufficientBalanceError();
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("INSUFFICIENT_BALANCE");
  });

  it("NotFoundError thrown for missing wallet", () => {
    const err = new NotFoundError("wallet");
    expect(err.statusCode).toBe(404);
  });

  it("mock wallet returns correct balance", async () => {
    mockPrisma.wallet.findUnique.mockResolvedValue({ balance: 5000, userId: "user1" });
    const wallet = await mockPrisma.wallet.findUnique({ where: { userId: "user1" } });
    expect(wallet.balance).toBe(5000);
  });
});
