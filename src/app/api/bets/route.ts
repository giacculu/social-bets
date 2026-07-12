import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const user = await requireAuthApi();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const body = await request.json();
  const { eventId, marketId, outcomeId, stake, odds } = body;

  if (!eventId || !marketId || !outcomeId || !stake || !odds) {
    return NextResponse.json({ error: "Parametri mancanti" }, { status: 400 });
  }

  const stakeNum = parseFloat(stake);
  if (stakeNum <= 0 || stakeNum > 100000) {
    return NextResponse.json({ error: "Importo non valido" }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  }

  if (Number(dbUser.balance) < stakeNum) {
    return NextResponse.json({ error: "Saldo insufficiente" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.status !== "UPCOMING") {
    return NextResponse.json({ error: "Evento non disponibile" }, { status: 400 });
  }

  const market = await prisma.market.findUnique({ where: { id: marketId } });
  if (!market || market.status !== "OPEN") {
    return NextResponse.json({ error: "Mercato chiuso" }, { status: 400 });
  }

  const outcome = await prisma.outcome.findUnique({ where: { id: outcomeId } });
  if (!outcome) {
    return NextResponse.json({ error: "Esito non valido" }, { status: 400 });
  }

  const potentialWin = stakeNum * parseFloat(odds);

  const bet = await prisma.bet.create({
    data: {
      userId: user.id,
      eventId,
      marketId,
      outcomeId,
      stake: stakeNum,
      odds: parseFloat(odds),
      potentialWin,
      status: "PENDING",
    },
  });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { balance: { decrement: stakeNum } },
    }),
    prisma.transaction.create({
      data: {
        userId: user.id,
        type: "BET_PLACED",
        amount: -stakeNum,
        balance: Number(dbUser.balance) - stakeNum,
        reference: `Scommessa #${bet.id}`,
      },
    }),
  ]);

  return NextResponse.json({ success: true, betId: bet.id });
}
