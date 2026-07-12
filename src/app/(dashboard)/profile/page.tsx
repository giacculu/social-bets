import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/utils";
import { User, Calendar, MapPin, Trophy, Target, TrendingUp } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    include: {
      wallet: true,
      userStats: true,
      _count: {
        select: { bets: true, friendshipsSent: true, friendshipsReceived: true },
      },
    },
  });

  if (!user) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
            {(user.username || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
            <p className="text-muted-foreground">@{user.username}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Membro dal {formatDate(user.createdAt)}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Target className="mx-auto h-5 w-5 text-primary mb-1" />
          <p className="text-2xl font-bold">{user._count.bets}</p>
          <p className="text-xs text-muted-foreground">Scommesse</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Trophy className="mx-auto h-5 w-5 text-primary mb-1" />
          <p className="text-2xl font-bold">{user.userStats?.winRate ? (user.userStats.winRate * 100).toFixed(0) : 0}%</p>
          <p className="text-xs text-muted-foreground">Win Rate</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <TrendingUp className="mx-auto h-5 w-5 text-primary mb-1" />
          <p className={`text-2xl font-bold ${Number(user.userStats?.netProfit ?? 0) >= 0 ? "text-primary" : "text-destructive"}`}>
            {formatCurrency(Number(user.userStats?.netProfit ?? 0))}
          </p>
          <p className="text-xs text-muted-foreground">Profitto Netto</p>
        </div>
      </div>

      {user.userStats && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Statistiche Dettagliate</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Vinte / Perse</p>
              <p className="font-medium">{user.userStats.wonBets} / {user.userStats.lostBets}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Streak Migliore</p>
              <p className="font-medium">{user.userStats.bestWinStreak}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quote Medie</p>
              <p className="font-medium">{user.userStats.avgOdds?.toFixed(2) ?? "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ultima Scommessa</p>
              <p className="font-medium">{user.userStats.lastBetAt ? formatDate(user.userStats.lastBetAt) : "Mai"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
