"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Trophy, Users, Clock, ArrowRight, UserCheck } from "lucide-react";

type Contest = {
  id: string;
  title: string;
  description: string | null;
  entryFee: number;
  prizePool: number;
  maxPlayers: number;
  playerCount: number;
  startTime: string;
  endTime: string;
  status: string;
  isPlayer: boolean;
  isCreator: boolean;
  creator: { username: string; name: string | null };
  event: { homeTeamName: string; awayTeamName: string; startTime: string } | null;
};

export function ContestsListClient({ contests, currentUserId }: { contests: Contest[]; currentUserId: string }) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  async function joinContest(contestId: string) {
    setActionLoading(contestId);
    try {
      const res = await fetch("/api/contests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", contestId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
      }
      router.refresh();
    } catch {
      alert("Errore");
    }
    setActionLoading(null);
  }

  async function leaveContest(contestId: string) {
    setActionLoading(contestId);
    try {
      const res = await fetch("/api/contests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "leave", contestId }),
      });
      router.refresh();
    } catch {}
    setActionLoading(null);
  }

  return (
    <div className="space-y-3">
      {contests.map((contest) => (
        <div
          key={contest.id}
          className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 transition-colors hover:border-gray-700"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{contest.title}</h3>
                {contest.isPlayer && (
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                    Iscritto
                  </span>
                )}
                {contest.isCreator && (
                  <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">
                    Creatore
                  </span>
                )}
              </div>
              {contest.description && (
                <p className="mt-1 text-sm text-gray-400">{contest.description}</p>
              )}
              {contest.event && (
                <p className="mt-1 text-sm text-gray-500">
                  {contest.event.homeTeamName} vs {contest.event.awayTeamName}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Trophy className="h-4 w-4" />
              <span className="font-semibold">{formatCurrency(contest.prizePool)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Users className="h-4 w-4" />
              <span>{contest.playerCount}/{contest.maxPlayers}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock className="h-4 w-4" />
              <span>{formatDate(new Date(contest.startTime))}</span>
            </div>
            <div className="text-gray-500">
              Entry: {formatCurrency(contest.entryFee)}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              di @{contest.creator.username}
            </p>
            <div className="flex gap-2">
              {contest.isPlayer ? (
                <button
                  onClick={() => leaveContest(contest.id)}
                  disabled={actionLoading === contest.id}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  Esci
                </button>
              ) : contest.playerCount < contest.maxPlayers ? (
                <button
                  onClick={() => joinContest(contest.id)}
                  disabled={actionLoading === contest.id}
                  className="rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors disabled:opacity-50"
                >
                  {actionLoading === contest.id ? "..." : "Partecipa"}
                </button>
              ) : (
                <span className="rounded-lg bg-gray-800 px-4 py-1.5 text-sm text-gray-400">
                  Pieno
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
