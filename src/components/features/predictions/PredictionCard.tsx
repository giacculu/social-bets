"use client";

import Link from "next/link";
import { Clock, CheckCircle, XCircle, Ban, ChevronRight } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { OddsDisplay } from "@/components/shared/OddsDisplay";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";

export function PredictionCard({
  bet,
}: {
  bet: {
    id: string;
    stake: number;
    odds: number;
    potentialWin: number;
    status: string;
    confidence?: number | null;
    createdAt: Date | string;
    event: {
      id: string;
      homeTeamName: string;
      awayTeamName: string;
      scoreHome?: number | null;
      scoreAway?: number | null;
      status: string;
      league: { sport: { icon?: string | null } };
    };
    market: { name: string };
    outcome: { name: string };
  };
}) {
  const isLive = bet.event.status === "LIVE";
  const isFinished = bet.event.status === "FINISHED";

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:bg-accent/30 transition-colors">
      <div className="flex-shrink-0">
        {bet.status === "WON" ? (
          <CheckCircle className="h-5 w-5 text-primary" />
        ) : bet.status === "LOST" ? (
          <XCircle className="h-5 w-5 text-destructive" />
        ) : bet.status === "CANCELLED" ? (
          <Ban className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Clock className="h-5 w-5 text-yellow-500" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span>{bet.event.league.sport.icon || "🏅"}</span>
          <p className="font-medium truncate">
            {bet.event.homeTeamName} vs {bet.event.awayTeamName}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{bet.market.name}</span>
          <span className="text-muted-foreground/50">-</span>
          <span className="font-medium text-foreground/80">{bet.outcome.name}</span>
          {isLive && <StatusBadge status="LIVE" />}
          {isFinished && <StatusBadge status="FINISHED" />}
        </div>
        {bet.confidence && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Confidenza: {bet.confidence}%
          </p>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-medium">{formatCurrency(bet.stake)}</p>
        <OddsDisplay odds={bet.odds} size="sm" />
      </div>

      <div className="text-right min-w-[90px] flex-shrink-0">
        <CurrencyDisplay
          amount={
            bet.status === "WON"
              ? bet.potentialWin
              : bet.status === "LOST"
              ? -bet.stake
              : 0
          }
          size="sm"
        />
        <p className="text-xs text-muted-foreground">{formatDate(bet.createdAt)}</p>
      </div>
    </div>
  );
}
