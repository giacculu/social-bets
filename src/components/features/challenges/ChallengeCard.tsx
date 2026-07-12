"use client";

import Link from "next/link";
import { Swords, Users, Clock, ChevronRight } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";

export function ChallengeCard({
  challenge,
}: {
  challenge: {
    id: string;
    title: string;
    description: string | null;
    stake: number;
    status: string;
    deadline: string;
    creator: { username: string };
    participants: Array<{
      id: string;
      prediction: string;
      user: { username: string };
    }>;
  };
}) {
  return (
    <Link
      href={`/custom-bets/${challenge.id}`}
      className="block rounded-xl border border-border bg-card p-4 hover:bg-accent/30 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{challenge.title}</h3>
            <StatusBadge status={challenge.status} />
          </div>
          {challenge.description && (
            <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
        <span>di @{challenge.creator.username}</span>
        <span className="text-primary font-medium">{formatCurrency(challenge.stake)}</span>
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {challenge.participants.length}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDate(new Date(challenge.deadline))}
        </span>
      </div>
    </Link>
  );
}
