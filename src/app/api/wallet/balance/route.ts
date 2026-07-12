import { NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/requireAuth";
import { WalletService } from "@/server/services/wallet.service";
import { handleApiError } from "@/server/middleware/error.middleware";

const walletService = new WalletService();

export async function GET() {
  try {
    const user = await requireAuthApi();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    const balance = await walletService.getBalance(user.id);
    return NextResponse.json(balance);
  } catch (error) {
    return handleApiError(error);
  }
}
