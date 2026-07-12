"use client";

import Link from "next/link";
import { Trophy, Users, Clock, ArrowRight } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";

export function ContestCard({
  contest,
  isPlayer,
  onJoin,
  onLeave,
  actionLoading,
}: {
  contest: {
    id: string;
    title: string;
    description: string | null;
    entryFee: number;
    prizePool: number;
    maxPlayers: number;
    playerCount: number;
    status: string;
    startTime: string;
    creator: { username: string; name: string | null };
    event: { homeTeamName: string; awayTeamName: string; startTime: string } | null;
  };
  isPlayer: boolean;
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
  actionLoading: string | null;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-border/70">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Link href={`/contests/${contest.id}`} className="font-semibold hover:text-primary transition-colors">
              {contest.title}
            </Link>
            {isPlayer && (
              <span className="rounded bg-primary/20 px-2 py-0.5 text-xs text-primary">
                Iscritto
              </span>
            )}
            <StatusBadge status={contest.status} />
          </div>
          {contest.description && (
            <p className="mt-1 text-sm text-muted-foreground">{contest.description}</p>
          )}
          {contest.event && (
            <p className="mt-1 text-sm text-muted-foreground">
              {contest.event.homeTeamName} vs {contest.event.awayTeamName}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-1.5 text-primary">
          <Trophy className="h-4 w-4" />
          <span className="font-semibold">{formatCurrency(contest.prizePool)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{contest.playerCount}/{contest.maxPlayers}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{formatDate(new Date(contest.startTime))}</span>
        </div>
        <div className="text-muted-foreground">
          Entry: {formatCurrency(contest.entryFee)}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          di @{contest.creator.username}
        </p>
        <div className="flex gap-2">
          <Link
            href={`/contests/${contest.id}`}
            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            Dettagli <ArrowRight className="h-3 w-3" />
          </Link>
          {isPlayer ? (
            <button
              onClick={() => onLeave(contest.id)}
              disabled={actionLoading === contest.id}
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-1.5 text-sm text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
            >
              Esci
            </button>
          ) : contest.playerCount < contest.maxPlayers ? (
            <button
              onClick={() => onJoin(contest.id)}
              disabled={actionLoading === contest.id}
              className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {actionLoading === contest.id ? "..." : "Partecipa"}
            </button>
          ) : (
            <span className="rounded-lg bg-muted px-4 py-1.5 text-sm text-muted-foreground">
              Pieno
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
