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

  if (!amount || amount < 1 || amount > 10000) {
    return NextResponse.json({ error: "Importo non valido (1-10.000€)" }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const newBalance = Number(dbUser!.realBalance) + amount;

  await prisma.user.update({
    where: { id: user.id },
    data: { realBalance: newBalance },
  });

  await prisma.realTransaction.create({
    data: {
      userId: user.id,
      type: "DEPOSIT",
      amount,
      balance: newBalance,
      reference: `Deposito simulato`,
    },
  });

  return NextResponse.json({ success: true, balance: newBalance });
}
