import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Trophy, Users, Plus, Filter } from "lucide-react";
import { ContestsListClient } from "./ContestsListClient";

export default async function ContestsPage() {
  const session = await auth();

  const contests = await prisma.contest.findMany({
    where: {
      status: { in: ["OPEN", "LOCKED", "IN_PROGRESS"] },
    },
    include: {
      creator: { select: { username: true, name: true } },
      entries: { select: { userId: true } },
      event: { select: { homeTeamName: true, awayTeamName: true, startTime: true } },
    },
    orderBy: { startTime: "asc" },
    take: 50,
  });

  const userEntries = await prisma.contestEntry.findMany({
    where: { userId: session!.user!.id },
    select: { contestId: true },
  });
  const userContestIds = new Set(userEntries.map((e) => e.contestId));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contest</h1>
          <p className="text-gray-500">Competi con i tuoi amici per vincere soldi reali</p>
        </div>
        <Link
          href="/contests/new"
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Crea Contest
        </Link>
      </div>

      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 text-sm text-blue-300">
        <strong>Come funziona:</strong> Paga un&apos;entry fee per entrare in una contest.
        Il 90% va nel prize pool, il 10% alla piattaforma.
        Competi con le tue predizioni - i migliori vincono!
      </div>

      {contests.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center">
          <Trophy className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-4 text-gray-500">Nessuna contest attiva</p>
          <p className="text-sm text-gray-600">
            Crea la prima contest e invita i tuoi amici!
          </p>
        </div>
      ) : (
        <ContestsListClient
          contests={contests.map((c) => ({
            ...c,
            entryFee: Number(c.entryFee),
            prizePool: Number(c.prizePool),
            maxPlayers: c.maxPlayers,
            playerCount: c.entries.length,
            isPlayer: userContestIds.has(c.id),
            isCreator: c.creatorId === session!.user!.id,
            startTime: c.startTime.toISOString(),
            endTime: c.endTime.toISOString(),
            event: c.event
              ? { ...c.event, startTime: c.event.startTime.toISOString() }
              : null,
          }))}
          currentUserId={session!.user!.id}
        />
      )}
    </div>
  );
}
