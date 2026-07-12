import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { Trophy, Crown, Medal } from "lucide-react";
import { LeaderboardPeriodTabs, type LeaderboardPeriod } from "@/components/features/leaderboard/LeaderboardPeriodTabs";
import { LeaderboardPodium } from "@/components/features/leaderboard/LeaderboardPodium";
import { EmptyState } from "@/components/shared/EmptyState";

function getPeriodRange(period: LeaderboardPeriod): { start: Date; end: Date; label: string } {
  const now = new Date();
  if (period === "week") {
    const dayOfWeek = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    start.setHours(0, 0, 0, 0);
    return { start, end: now, label: "Questa settimana" };
  }
  if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end: now, label: "Questo mese" };
  }
  return { start: new Date(2024, 0, 1), end: now, label: "Tutti i tempi" };
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await auth();
  const { period: periodParam } = await searchParams;
  const period: LeaderboardPeriod = (periodParam as LeaderboardPeriod) || "week";

  const { start, end, label } = getPeriodRange(period);

  const entries = await prisma.leaderboardEntry.findMany({
    where: {
      period: { gte: start.toISOString().slice(0, 10), lte: end.toISOString().slice(0, 10) },
    },
    include: {
      user: {
        select: { id: true, username: true, name: true, avatarUrl: true },
      },
    },
    orderBy: { netProfit: "desc" },
    take: 50,
  });

  const topThree = entries.slice(0, 3).map((e, i) => ({
    ...e,
    rank: i + 1,
    netProfit: Number(e.netProfit),
  }));
  const rest = entries.slice(3);

  const myEntry = entries.find((e) => e.user.id === session!.user!.id);
  const myRank = entries.findIndex((e) => e.user.id === session!.user!.id) + 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Classifica</h1>
          <p className="text-muted-foreground">{label}</p>
        </div>
        <LeaderboardPeriodTabs
          active={period}
          onChange={(p) => {
            window.location.href = p === "week" ? "/leaderboard" : `/leaderboard?period=${p}`;
          }}
        />
      </div>

      {myEntry && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground mb-1">La tua posizione</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-primary">#{myRank}</span>
            <div>
              <p className="font-medium">{myEntry.user.name || myEntry.user.username}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(Number(myEntry.netProfit))} profitto netto
              </p>
            </div>
          </div>
        </div>
      )}

      {entries.length >= 3 && <LeaderboardPodium entries={topThree} />}

      <div className="space-y-2">
        {rest.map((entry, index) => {
          const isMe = entry.user.id === session!.user!.id;
          const rank = index + 4;
          return (
            <div
              key={entry.id}
              className={`flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors ${
                isMe ? "ring-1 ring-primary/50" : ""
              }`}
            >
              <div className="flex w-8 items-center justify-center">
                <span className="text-sm text-muted-foreground">{rank}</span>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                {(entry.user.username || "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {entry.user.username}
                  {isMe && <span className="ml-2 text-xs text-primary">(Tu)</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {entry.betCount} scommesse · {(entry.winRate * 100).toFixed(0)}% win
                </p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${Number(entry.netProfit) >= 0 ? "text-primary" : "text-destructive"}`}>
                  {Number(entry.netProfit) >= 0 ? "+" : ""}{formatCurrency(Number(entry.netProfit))}
                </p>
                <p className="text-xs text-muted-foreground">profitto</p>
              </div>
            </div>
          );
        })}
      </div>

      {entries.length === 0 && (
        <EmptyState
          icon={Trophy}
          title="Nessun utente in classifica"
          description="Sii il primo a piazzare una scommessa!"
        />
      )}
    </div>
  );
}
