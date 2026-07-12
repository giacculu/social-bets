import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const user = await requireAuthApi();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, stake, deadline, participantUsernames } = body;

  if (!title || !stake || !deadline || !participantUsernames?.length) {
    return NextResponse.json({ error: "Parametri mancanti" }, { status: 400 });
  }

  const stakeNum = parseFloat(stake);
  if (stakeNum <= 0) {
    return NextResponse.json({ error: "Importo non valido" }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser || Number(dbUser.balance) < stakeNum * participantUsernames.length) {
    return NextResponse.json({ error: "Saldo insufficiente" }, { status: 400 });
  }

  const participants = await prisma.user.findMany({
    where: { username: { in: participantUsernames } },
  });

  if (participants.length !== participantUsernames.length) {
    return NextResponse.json({ error: "Alcuni utenti non trovati" }, { status: 404 });
  }

  const totalCost = stakeNum * participants.length;

  const customBet = await prisma.customBet.create({
    data: {
      creatorId: user.id,
      title,
      description,
      stake: stakeNum,
      deadline: new Date(deadline),
      status: "PENDING",
      participants: {
        create: participants.map((p) => ({ userId: p.id, prediction: "" })),
      },
    },
  });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { balance: { decrement: totalCost } },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: "CUSTOM_BET_ENTRY",
        amount: -totalCost,
        balance: Number(dbUser.balance) - totalCost,
        reference: `Sfida: ${title}`,
      },
    }),
  ]);

  return NextResponse.json({ success: true, betId: customBet.id });
}
