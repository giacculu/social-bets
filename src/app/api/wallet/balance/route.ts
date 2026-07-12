import { NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireAuthApi();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { balance: true, realBalance: true },
  });

  return NextResponse.json({
    balance: Number(dbUser?.balance ?? 0),
    realBalance: Number(dbUser?.realBalance ?? 0),
  });
}
