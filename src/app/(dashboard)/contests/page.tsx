import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Trophy, Plus } from "lucide-react";
import Link from "next/link";
import { ContestsListClient } from "./ContestsListClient";

export const dynamic = "force-dynamic";

export default async function ContestsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  const { tab } = await searchParams;
  const activeTab = (tab as string) || "open";

  const contests = await prisma.contest.findMany({
    where: {
      ...(activeTab === "open" ? { status: { in: ["OPEN", "LOCKED"] } } : {}),
      ...(activeTab === "mine" ? { entries: { some: { userId: session!.user!.id } } } : {}),
      ...(activeTab === "completed" ? { status: "COMPLETED" } : {}),
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
          <p className="text-muted-foreground">Competi con i tuoi amici</p>
        </div>
        <Link
          href="/contests/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Crea Contest
        </Link>
      </div>

      <ContestsListClient
        contests={contests.map((c) => {
          const { entries, creator, event: contestEvent, entryFee, prizePool, ...rest } = c;
          return {
            ...rest,
            entryFee: Number(entryFee),
            prizePool: Number(prizePool),
            creator,
            playerCount: entries.length,
            isPlayer: userContestIds.has(c.id),
            isCreator: c.creatorId === session!.user!.id,
            startTime: c.startTime.toISOString(),
            endTime: c.endTime.toISOString(),
            event: contestEvent
              ? { ...contestEvent, startTime: contestEvent.startTime.toISOString() }
              : null,
          };
        })}
        currentUserId={session!.user!.id}
        activeTab={activeTab}
      />
    </div>
  );
}
