import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const user = await requireAuthApi();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const body = await request.json();
  const { amount } = body;

  if (!amount || amount < 1) {
    return NextResponse.json({ error: "Importo non valido" }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (Number(dbUser!.realBalance) < amount) {
    return NextResponse.json({ error: "Saldo insufficiente" }, { status: 400 });
  }

  const newBalance = Number(dbUser!.realBalance) - amount;

  await prisma.user.update({
    where: { id: user.id },
    data: { realBalance: newBalance },
  });

  await prisma.realTransaction.create({
    data: {
      userId: user.id,
      type: "WITHDRAWAL",
      amount: -amount,
      balance: newBalance,
      reference: "Richiesta prelievo",
    },
  });

  return NextResponse.json({ success: true, balance: newBalance });
}
