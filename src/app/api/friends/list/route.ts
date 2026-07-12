import { NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireAuthApi();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { initiatorId: user.id },
        { receiverId: user.id },
      ],
    },
    include: {
      initiator: { select: { id: true, username: true, name: true, balance: true } },
      receiver: { select: { id: true, username: true, name: true, balance: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const friends = friendships
    .filter((f) => f.status === "ACCEPTED")
    .map((f) =>
      f.initiatorId === user.id ? f.receiver : f.initiator
    );

  const pendingReceived = friendships.filter(
    (f) => f.status === "PENDING" && f.receiverId === user.id
  );

  return NextResponse.json({ friends, pendingReceived });
}
