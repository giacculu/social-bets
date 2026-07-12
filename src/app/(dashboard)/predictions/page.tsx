import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Trophy } from "lucide-react";
import { PredictionCard } from "@/components/features/predictions/PredictionCard";
import { PredictionStats } from "@/components/features/predictions/PredictionStats";
import { PredictionFilters, type PredictionFilter } from "@/components/features/predictions/PredictionFilters";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function PredictionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  const { tab } = await searchParams;
  const filter: PredictionFilter = (tab as PredictionFilter) || "active";

  const bets = await prisma.bet.findMany({
    where: {
      userId: session!.user!.id,
      ...(filter === "active" ? { status: "PENDING" } : {}),
      ...(filter === "won" ? { status: "WON" } : {}),
      ...(filter === "lost" ? { status: "LOST" } : {}),
    },
    include: {
      event: {
        include: {
          league: { include: { sport: true } },
        },
      },
      market: true,
      outcome: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const allBets = await prisma.bet.findMany({
    where: { userId: session!.user!.id },
    select: { status: true, stake: true, potentialWin: true, odds: true },
  });

  const stats = {
    total: allBets.length,
    pending: allBets.filter((b) => b.status === "PENDING").length,
    won: allBets.filter((b) => b.status === "WON").length,
    lost: allBets.filter((b) => b.status === "LOST").length,
    winRate: allBets.length > 0 ? (allBets.filter((b) => b.status === "WON").length / allBets.length) * 100 : 0,
    totalStaked: allBets.reduce((acc, b) => acc + Number(b.stake), 0),
    totalWon: allBets.filter((b) => b.status === "WON").reduce((acc, b) => acc + Number(b.potentialWin), 0),
    profit: allBets.filter((b) => b.status === "WON").reduce((acc, b) => acc + Number(b.potentialWin), 0) - allBets.reduce((acc, b) => acc + Number(b.stake), 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Le Mie Previsioni</h1>
        <p className="text-muted-foreground">Gestisci e monitora le tue scommesse</p>
      </div>

      <PredictionStats stats={stats} />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {filter === "active" ? "Previsioni Attive" : filter === "won" ? "Previsioni Vinte" : filter === "lost" ? "Previsioni Perse" : "Tutte le Previsioni"}
        </h2>
        <PredictionFilters
          active={filter}
          onChange={(f) => {
            window.location.href = f === "active" ? "/predictions" : `/predictions?tab=${f}`;
          }}
        />
      </div>

      {bets.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Nessuna previsione"
          description={
            filter === "active"
              ? "Non hai previsioni attive. Vai alla sezione sport per piazzare una scommessa!"
              : "Nessuna previsione in questa categoria."
          }
        />
      ) : (
        <div className="space-y-2">
          {bets.map((bet) => (
            <PredictionCard
              key={bet.id}
              bet={{
                ...bet,
                stake: Number(bet.stake),
                odds: Number(bet.odds),
                potentialWin: Number(bet.potentialWin),
                event: {
                  ...bet.event,
                  scoreHome: bet.event.scoreHome,
                  scoreAway: bet.event.scoreAway,
                },
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
