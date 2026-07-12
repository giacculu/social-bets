import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";
import { BetSlip } from "@/components/bets/BetSlip";

export default async function LeaguePage({
  params,
  searchParams,
}: {
  params: Promise<{ sport: string; league: string }>;
  searchParams: Promise<{ event?: string }>;
}) {
  const { sport: sportSlug, league: leagueSlug } = await params;
  const { event: eventId } = await searchParams;

  const league = await prisma.league.findFirst({
    where: {
      slug: leagueSlug,
      sport: { slug: sportSlug },
    },
    include: {
      sport: true,
      events: {
        where: { status: { in: ["UPCOMING", "FINISHED"] } },
        include: {
          markets: {
            include: {
              outcomes: true,
            },
          },
        },
        orderBy: { startTime: "asc" },
      },
    },
  });

  if (!league) notFound();

  const selectedEvent = eventId
    ? league.events.find((e) => e.id === eventId)
    : league.events[0];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{league.sport.icon || "🏅"}</span>
          <span>{league.sport.name}</span>
          <span>/</span>
          <span>{league.name}</span>
        </div>
        <h1 className="text-2xl font-bold mt-1">{league.name}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <div className="space-y-3">
          {league.events.map((event) => (
            <div
              key={event.id}
              className={`rounded-xl border p-4 transition-colors ${
                selectedEvent?.id === event.id
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-gray-800 bg-gray-900/50 hover:border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-400">
                    {formatDate(event.startTime)}
                  </span>
                  {event.status === "LIVE" && (
                    <span className="flex items-center gap-1 rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                      LIVE
                    </span>
                  )}
                  {event.status === "FINISHED" && (
                    <span className="rounded bg-gray-700/50 px-2 py-0.5 text-xs text-gray-400">
                      FINITO
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-lg font-semibold">{event.homeTeamName}</p>
                </div>
                {event.scoreHome !== null && event.scoreAway !== null && (
                  <div className="flex items-center gap-3 text-2xl font-bold">
                    <span>{event.scoreHome}</span>
                    <span className="text-gray-600">-</span>
                    <span>{event.scoreAway}</span>
                  </div>
                )}
                <div className="flex-1 text-right">
                  <p className="text-lg font-semibold">{event.awayTeamName}</p>
                </div>
              </div>

              {event.markets.length > 0 && (
                <div className="mt-4 space-y-3">
                  {event.markets.map((market) => (
                    <div key={market.id}>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                        {market.name}
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {market.outcomes.map((outcome) => (
                          <OutcomeButton
                            key={outcome.id}
                            outcome={{
                              id: outcome.id,
                              name: outcome.name,
                              odds: Number(outcome.odds),
                            }}
                            eventId={event.id}
                            marketId={market.id}
                            marketName={market.name}
                            eventName={`${event.homeTeamName} vs ${event.awayTeamName}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {league.events.length === 0 && (
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center">
              <Clock className="mx-auto h-12 w-12 text-gray-600" />
              <p className="mt-4 text-gray-500">Nessun evento disponibile</p>
              <p className="text-sm text-gray-600">
                Controlla più tardi per nuove partite
              </p>
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

function OutcomeButton({
  outcome,
  eventId,
  marketId,
  marketName,
  eventName,
}: {
  outcome: { id: string; name: string; odds: number };
  eventId: string;
  marketId: string;
  marketName: string;
  eventName: string;
}) {
  return (
    <button
      className="rounded-lg border border-gray-700 bg-gray-800 p-3 text-center transition-colors hover:border-emerald-500 hover:bg-emerald-500/10 group"
      onClick={() => {
        const event = new CustomEvent("add-to-betslip", {
          detail: {
            outcomeId: outcome.id,
            outcomeName: outcome.name,
            odds: outcome.odds,
            eventId,
            marketId,
            marketName,
            eventName,
          },
        });
        window.dispatchEvent(event);
      }}
    >
      <p className="text-xs text-gray-400 group-hover:text-gray-300">{outcome.name}</p>
      <p className="text-lg font-bold text-emerald-400">{outcome.odds.toFixed(2)}</p>
    </button>
  );
}
