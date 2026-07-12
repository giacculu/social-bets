import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await requireAuthApi();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { inviteCode: true },
  });

  return NextResponse.json({ inviteCode: dbUser?.inviteCode });
}

export async function POST(request: NextRequest) {
  const user = await requireAuthApi();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const body = await request.json();
  const { action, inviteCode } = body;

  if (action === "redeem") {
    if (!inviteCode) {
      return NextResponse.json({ error: "Codice mancante" }, { status: 400 });
    }

    const referrer = await prisma.user.findFirst({
      where: { inviteCode: inviteCode.trim().toUpperCase() },
    });

    if (!referrer) {
      return NextResponse.json({ error: "Codice non valido" }, { status: 404 });
    }

    if (referrer.id === user.id) {
      return NextResponse.json({ error: "Non puoi usare il tuo codice" }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (currentUser?.referredBy) {
      return NextResponse.json({ error: "Hai già usato un codice referral" }, { status: 400 });
    }

    // Check if already friends
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { initiatorId: user.id, receiverId: referrer.id },
          { initiatorId: referrer.id, receiverId: user.id },
        ],
      },
    });

    // Auto-add as friends
    if (!existing) {
      await prisma.friendship.create({
        data: {
          initiatorId: referrer.id,
          receiverId: user.id,
          status: "ACCEPTED",
        },
      });
    }

    // Set referral and bonus
    const bonus = 500;
    await prisma.user.update({
      where: { id: user.id },
      data: { referredBy: referrer.inviteCode },
    });

    await prisma.user.update({
      where: { id: referrer.id },
      data: { balance: { increment: bonus } },
    });

    const referrerBalance = await prisma.user.findUnique({
      where: { id: referrer.id },
      select: { balance: true },
    });

    await prisma.transaction.create({
      data: {
        userId: referrer.id,
        type: "REFERRAL_BONUS",
        amount: bonus,
        balance: referrerBalance!.balance,
        reference: `Referral da @${currentUser?.username || "unknown"}`,
      },
    });

    return NextResponse.json({ success: true, bonus });
  }

  return NextResponse.json({ error: "Azione non valida" }, { status: 400 });
}
