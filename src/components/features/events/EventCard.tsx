"use client";

import Link from "next/link";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { OutcomeButton } from "./OutcomeButton";
import { StatusBadge } from "@/components/shared/StatusBadge";

export function EventCard({
  event,
  sportSlug,
  leagueSlug,
  compact = false,
  selected = false,
}: {
  event: {
    id: string;
    homeTeamName: string;
    awayTeamName: string;
    startTime: Date;
    status: string;
    scoreHome?: number | null;
    scoreAway?: number | null;
    markets: Array<{
      id: string;
      name: string;
      outcomes: Array<{
        id: string;
        name: string;
        odds: number | string;
      }>;
    }>;
  };
  sportSlug: string;
  leagueSlug: string;
  compact?: boolean;
  selected?: boolean;
}) {
  const isLive = event.status === "LIVE";
  const isFinished = event.status === "FINISHED";
  const hasScore = event.scoreHome !== null && event.scoreHome !== undefined;

  if (compact) {
    return (
      <Link
        href={`/sports/${sportSlug}/${leagueSlug}?event=${event.id}`}
        className="flex items-center justify-between rounded-xl border border-border bg-card p-3 hover:bg-accent/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">
            {event.homeTeamName} vs {event.awayTeamName}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(event.startTime)}
            {isLive && <StatusBadge status="LIVE" />}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </Link>
    );
  }

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        selected
          ? "border-primary/50 bg-primary/5"
          : "border-border bg-card hover:border-border/80"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {formatDate(event.startTime)}
          </span>
          {isLive && <StatusBadge status="LIVE" />}
          {isFinished && <StatusBadge status="FINISHED" />}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-lg font-semibold">{event.homeTeamName}</p>
        </div>
        {hasScore && (
          <div className="flex items-center gap-3 text-2xl font-bold">
            <span>{event.scoreHome}</span>
            <span className="text-muted-foreground">-</span>
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
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
  );
}
