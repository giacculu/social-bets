import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/requireAuth";
import { WalletService } from "@/server/services/wallet.service";
import { withdrawSchema } from "@/server/validators/wallet.validator";
import { handleApiError } from "@/server/middleware/error.middleware";

const walletService = new WalletService();

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthApi();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    const body = await request.json();
    const { amount } = withdrawSchema.parse(body);
    const result = await walletService.withdraw(user.id, amount);
    return NextResponse.json({ success: true, balance: result.balance });
  } catch (error) {
    return handleApiError(error);
  }
}
