import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const user = await requireAuthApi();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const body = await request.json();
  const { action, username, friendshipId } = body;

  if (action === "add") {
    if (!username) {
      return NextResponse.json({ error: "Username mancante" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { username },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
    }

    if (targetUser.id === user.id) {
      return NextResponse.json({ error: "Non puoi aggiungere te stesso" }, { status: 400 });
    }

    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { initiatorId: user.id, receiverId: targetUser.id },
          { initiatorId: targetUser.id, receiverId: user.id },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Richiesta già esistente" }, { status: 409 });
    }

    await prisma.friendship.create({
      data: {
        initiatorId: user.id,
        receiverId: targetUser.id,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true });
  }

  if (action === "accept" || action === "decline") {
    if (!friendshipId) {
      return NextResponse.json({ error: "ID mancante" }, { status: 400 });
    }

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship || friendship.receiverId !== user.id) {
      return NextResponse.json({ error: "Richiesta non valida" }, { status: 404 });
    }

    await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: action === "accept" ? "ACCEPTED" : "BLOCKED" },
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Azione non valida" }, { status: 400 });
}
