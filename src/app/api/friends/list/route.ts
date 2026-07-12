import { NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/requireAuth";
import { FriendshipService } from "@/server/services/friendship.service";
import { handleApiError } from "@/server/middleware/error.middleware";

const friendshipService = new FriendshipService();

export async function GET() {
  try {
    const user = await requireAuthApi();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    const result = await friendshipService.getFriends(user.id);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
