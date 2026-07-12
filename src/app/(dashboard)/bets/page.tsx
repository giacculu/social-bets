import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Trophy, Clock, CheckCircle, XCircle, Ban } from "lucide-react";

export default async function MyBetsPage() {
  const session = await auth();

  const bets = await prisma.bet.findMany({
    where: { userId: session!.user!.id },
    include: {
      event: true,
      market: true,
      outcome: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const stats = {
    total: bets.length,
    pending: bets.filter((b) => b.status === "PENDING").length,
    won: bets.filter((b) => b.status === "WON").length,
    lost: bets.filter((b) => b.status === "LOST").length,
    totalStaked: bets.reduce((acc, b) => acc + Number(b.stake), 0),
    totalWon: bets.filter((b) => b.status === "WON").reduce((acc, b) => acc + Number(b.potentialWin), 0),
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case "WON":
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case "LOST":
        return <XCircle className="h-4 w-4 text-red-400" />;
      case "CANCELLED":
        return <Ban className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "text-yellow-400";
      case "WON": return "text-emerald-400";
      case "LOST": return "text-red-400";
      case "CANCELLED": return "text-gray-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Le Mie Scommesse</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-gray-500">Totali</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          <p className="text-xs text-gray-500">In Attesa</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{stats.won}</p>
          <p className="text-xs text-gray-500">Vinte</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{stats.lost}</p>
          <p className="text-xs text-gray-500">Perse</p>
        </div>
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">
            {formatCurrency(stats.totalWon - stats.totalStaked)}
          </p>
          <p className="text-xs text-gray-500">Profitto</p>
        </div>
      </div>

      <div className="space-y-2">
        {bets.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center">
            <Trophy className="mx-auto h-12 w-12 text-gray-600" />
            <p className="mt-4 text-gray-500">Nessuna scommessa ancora</p>
            <p className="text-sm text-gray-600">
              Vai alla sezione sport per piazzare la tua prima scommessa!
            </p>
          </div>
        ) : (
          bets.map((bet) => (
            <div
              key={bet.id}
              className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/50 p-4"
            >
              {statusIcon(bet.status)}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {bet.event.homeTeamName} vs {bet.event.awayTeamName}
                </p>
                <p className="text-sm text-gray-500">
                  {bet.market.name} - {bet.outcome.name}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(Number(bet.stake))}</p>
                <p className="text-xs text-gray-500">@ {Number(bet.odds).toFixed(2)}</p>
              </div>
              <div className="text-right min-w-[80px]">
                <p className={`font-semibold ${statusColor(bet.status)}`}>
                  {bet.status === "WON"
                    ? `+${formatCurrency(Number(bet.potentialWin))}`
                    : bet.status === "LOST"
                    ? `-${formatCurrency(Number(bet.stake))}`
                    : formatCurrency(Number(bet.potentialWin))}
                </p>
                <p className="text-xs text-gray-500">{formatDate(bet.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
