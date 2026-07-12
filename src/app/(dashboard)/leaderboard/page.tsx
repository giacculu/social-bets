import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { Trophy, Medal, Crown } from "lucide-react";

export default async function LeaderboardPage() {
  const session = await auth();

  const entries = await prisma.leaderboardEntry.findMany({
    where: { period: getCurrentWeekPeriod() },
    include: {
      user: {
        select: { id: true, username: true, name: true, avatarUrl: true },
      },
    },
    orderBy: { netProfit: "desc" },
    take: 50,
  });

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="h-5 w-5 text-yellow-400" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-300" />;
    if (index === 2) return <Medal className="h-5 w-5 text-orange-400" />;
    return <span className="text-sm text-gray-500 w-5 text-center">{index + 1}</span>;
  };

  const getRankBg = (index: number) => {
    if (index === 0) return "bg-yellow-400/5 border-yellow-400/20";
    if (index === 1) return "bg-gray-300/5 border-gray-300/20";
    if (index === 2) return "bg-orange-400/5 border-orange-400/20";
    return "border-gray-800";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Classifica</h1>
        <p className="text-gray-500">I migliori scommettitori di SocialBets</p>
      </div>

      <div className="space-y-2">
        {entries.map((entry, index) => {
          const isMe = entry.user.id === session!.user!.id;
          return (
            <div
              key={entry.id}
              className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${getRankBg(index)} ${
                isMe ? "ring-1 ring-emerald-500/50" : ""
              }`}
            >
              <div className="flex w-8 items-center justify-center">
                {getRankIcon(index)}
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                {(entry.user.username || "U").charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {entry.user.username}
                  {isMe && (
                    <span className="ml-2 text-xs text-emerald-400">(Tu)</span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {entry.betCount} scommesse &middot; {(entry.winRate * 100).toFixed(0)}% win
                </p>
              </div>

              <div className="text-right">
                <p className={`text-lg font-bold ${Number(entry.netProfit) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {Number(entry.netProfit) >= 0 ? "+" : ""}{formatCurrency(Number(entry.netProfit))}
                </p>
                <p className="text-xs text-gray-500">net profit</p>
              </div>
            </div>
          );
        })}

        {entries.length === 0 && (
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center">
            <Trophy className="mx-auto h-12 w-12 text-gray-600" />
            <p className="mt-4 text-gray-500">Nessun utente nella classifica</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getCurrentWeekPeriod(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}
