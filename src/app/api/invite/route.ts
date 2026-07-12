import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/requireAuth";
import { AuthService } from "@/server/services/auth.service";
import { redeemInviteSchema } from "@/server/validators/invite.validator";
import { handleApiError } from "@/server/middleware/error.middleware";

const authService = new AuthService();

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthApi();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    const result = await authService.getInviteCode(user.id);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthApi();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    const body = await request.json();
    const data = redeemInviteSchema.parse(body);
    const result = await authService.redeemInvite(user.id, data.inviteCode);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
