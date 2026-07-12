import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/requireAuth";
import { FriendshipService } from "@/server/services/friendship.service";
import { friendActionSchema } from "@/server/validators/friend.validator";
import { handleApiError } from "@/server/middleware/error.middleware";

const friendshipService = new FriendshipService();

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthApi();
    if (!user) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    const body = await request.json();
    const data = friendActionSchema.parse(body);
    switch (data.action) {
      case "add": {
        const result = await friendshipService.addFriend(user.id, data.username);
        return NextResponse.json(result);
      }
      case "accept": {
        const result = await friendshipService.acceptRequest(user.id, data.friendshipId);
        return NextResponse.json(result);
      }
      case "decline": {
        const result = await friendshipService.declineRequest(user.id, data.friendshipId);
        return NextResponse.json(result);
      }
    }
  } catch (error) {
    return handleApiError(error);
  }
}
