import { NextRequest, NextResponse } from "next/server";
import { requireAuthApi } from "@/lib/requireAuth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await requireAuthApi();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "OPEN";

  const contests = await prisma.contest.findMany({
    where: {
      status: status as any,
      ...(searchParams.get("mine") === "true"
        ? { OR: [{ creatorId: user.id }, { entries: { some: { userId: user.id } } }] }
        : {}),
    },
    include: {
      creator: { select: { username: true, name: true } },
      entries: { select: { userId: true } },
      event: { select: { homeTeamName: true, awayTeamName: true, startTime: true } },
    },
    orderBy: { startTime: "asc" },
    take: 50,
  });

  return NextResponse.json({
    contests: contests.map((c) => ({
      ...c,
      entryFee: Number(c.entryFee),
      prizePool: Number(c.prizePool),
      platformFee: Number(c.platformFee),
      playerCount: c.entries.length,
      isPlayer: c.entries.some((e) => e.userId === user.id),
      isCreator: c.creatorId === user.id,
      event: c.event,
    })),
  });
}

export async function POST(request: NextRequest) {
  const user = await requireAuthApi();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const body = await request.json();
  const { action } = body;

  if (action === "create") {
    const { title, description, entryFee, maxPlayers, startTime, endTime, eventId } = body;

    if (!title || !entryFee || !startTime || !endTime) {
      return NextResponse.json({ error: "Campi mancanti" }, { status: 400 });
    }

    const fee = parseFloat(entryFee);
    if (fee < 1) {
      return NextResponse.json({ error: "Entry fee minima: 1€" }, { status: 400 });
    }

    const contest = await prisma.contest.create({
      data: {
        creatorId: user.id,
        title,
        description,
        entryFee: fee,
        maxPlayers: maxPlayers || 10,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        eventId: eventId || null,
        status: "OPEN",
      },
    });

    return NextResponse.json({ success: true, contestId: contest.id });
  }

  if (action === "join") {
    const { contestId } = body;
    if (!contestId) {
      return NextResponse.json({ error: "Contest ID mancante" }, { status: 400 });
    }

    const contest = await prisma.contest.findUnique({
      where: { id: contestId },
      include: { entries: true },
    });

    if (!contest) {
      return NextResponse.json({ error: "Contest non trovato" }, { status: 404 });
    }

    if (contest.status !== "OPEN") {
      return NextResponse.json({ error: "Contest non più aperto" }, { status: 400 });
    }

    if (contest.entries.length >= contest.maxPlayers) {
      return NextResponse.json({ error: "Contest pieno" }, { status: 400 });
    }

    if (contest.entries.some((e) => e.userId === user.id)) {
      return NextResponse.json({ error: "Sei già iscritto" }, { status: 400 });
    }

    // Check real balance
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (Number(dbUser!.realBalance) < Number(contest.entryFee)) {
      return NextResponse.json({ error: "Saldo reale insufficiente" }, { status: 400 });
    }

    // Deduct entry fee and add to contest
    const newBalance = Number(dbUser!.realBalance) - Number(contest.entryFee);
    const newPrizePool = Number(contest.prizePool) + Number(contest.entryFee) * 0.9;

    await prisma.user.update({
      where: { id: user.id },
      data: { realBalance: newBalance },
    });

    await prisma.contest.update({
      where: { id: contestId },
      data: { prizePool: newPrizePool },
    });

    await prisma.contestEntry.create({
      data: {
        contestId,
        userId: user.id,
        predictions: {},
      },
    });

    await prisma.realTransaction.create({
      data: {
        userId: user.id,
        type: "CONTEST_ENTRY",
        amount: -Number(contest.entryFee),
        balance: newBalance,
        reference: contest.title,
        metadata: { contestId },
      },
    });

    return NextResponse.json({ success: true });
  }

  if (action === "leave") {
    const { contestId } = body;
    if (!contestId) {
      return NextResponse.json({ error: "Contest ID mancante" }, { status: 400 });
    }

    const entry = await prisma.contestEntry.findFirst({
      where: { contestId, userId: user.id },
    });

    if (!entry) {
      return NextResponse.json({ error: "Non iscritto" }, { status: 404 });
    }

    const contest = await prisma.contest.findUnique({ where: { id: contestId } });
    if (!contest || contest.status !== "OPEN") {
      return NextResponse.json({ error: "Contest non modificabile" }, { status: 400 });
    }

    // Refund
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    const newBalance = Number(dbUser!.realBalance) + Number(contest.entryFee);
    const newPrizePool = Number(contest.prizePool) - Number(contest.entryFee) * 0.9;

    await prisma.user.update({
      where: { id: user.id },
      data: { realBalance: newBalance },
    });

    await prisma.contest.update({
      where: { id: contestId },
      data: { prizePool: Math.max(0, newPrizePool) },
    });

    await prisma.contestEntry.delete({ where: { id: entry.id } });

    await prisma.realTransaction.create({
      data: {
        userId: user.id,
        type: "CONTEST_REFUND",
        amount: Number(contest.entryFee),
        balance: newBalance,
        reference: `Refund: ${contest.title}`,
        metadata: { contestId },
      },
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Azione non valida" }, { status: 400 });
}
