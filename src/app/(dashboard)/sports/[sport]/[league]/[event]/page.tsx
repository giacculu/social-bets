import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate, formatOdds } from "@/lib/utils";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BetSlip } from "@/components/bets/BetSlip";
import { StatusBadge } from "@/components/shared/StatusBadge";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ sport: string; league: string; event: string }>;
}) {
  const { sport: sportSlug, league: leagueSlug, event: eventId } = await params;

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      league: {
        slug: leagueSlug,
        sport: { slug: sportSlug },
      },
    },
    include: {
      league: { include: { sport: true } },
      markets: {
        include: { outcomes: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!event) notFound();

  const recentEvents = await prisma.event.findMany({
    where: {
      league: { slug: leagueSlug },
      status: "FINISHED",
      id: { not: eventId },
    },
    orderBy: { startTime: "desc" },
    take: 5,
    include: {
      markets: {
        include: { outcomes: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/sports/${sportSlug}/${leagueSlug}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          {event.league.name}
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">
            {event.homeTeamName} vs {event.awayTeamName}
          </h1>
          <StatusBadge status={event.status} />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <Calendar className="h-4 w-4" />
          {formatDate(event.startTime)}
          <span className="text-muted-foreground/50">|</span>
          <span>{event.league.sport.name} - {event.league.name}</span>
        </div>
      </div>

      {event.scoreHome !== null && event.scoreAway !== null && (
        <div className="flex items-center justify-center gap-6 rounded-xl border border-border bg-card p-6">
          <div className="text-center">
            <p className="text-lg font-semibold">{event.homeTeamName}</p>
          </div>
          <div className="flex items-center gap-3 text-4xl font-bold">
            <span>{event.scoreHome}</span>
            <span className="text-muted-foreground">-</span>
            <span>{event.scoreAway}</span>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{event.awayTeamName}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <div className="space-y-6">
          {event.markets.length > 0 ? (
            event.markets.map((market) => (
              <div key={market.id} className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {market.name}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {market.outcomes.map((outcome) => (
                    <button
                      key={outcome.id}
                      className="rounded-lg border border-border bg-muted p-3 text-center transition-all hover:border-primary/50 hover:bg-primary/5 group"
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent("add-to-betslip", {
                            detail: {
                              outcomeId: outcome.id,
                              outcomeName: outcome.name,
                              odds: Number(outcome.odds),
                              eventId: event.id,
                              marketId: market.id,
                              marketName: market.name,
                              eventName: `${event.homeTeamName} vs ${event.awayTeamName}`,
                            },
                          })
                        );
                      }}
                    >
                      <p className="text-xs text-muted-foreground group-hover:text-foreground/80">{outcome.name}</p>
                      <p className="text-lg font-bold text-primary">{formatOdds(Number(outcome.odds))}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">Nessuna quotazione disponibile</p>
            </div>
          )}

          {recentEvents.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold">Risultati Recenti</h3>
              <div className="space-y-2">
                {recentEvents.map((re) => (
                  <div
                    key={re.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{re.homeTeamName} vs {re.awayTeamName}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(re.startTime)}</p>
                    </div>
                    {re.scoreHome !== null && re.scoreAway !== null && (
                      <p className="text-lg font-bold">{re.scoreHome} - {re.scoreAway}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-20 lg:h-fit">
          <BetSlip />
        </div>
      </div>
    </div>
  );
}
