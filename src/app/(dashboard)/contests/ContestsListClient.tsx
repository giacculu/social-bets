"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { toast } from "sonner";
import { ContestCard } from "@/components/features/contests/ContestCard";
import { ContestTabs, type ContestTab } from "@/components/features/contests/ContestTabs";
import { EmptyState } from "@/components/shared/EmptyState";

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

export function ContestsListClient({
  contests,
  currentUserId,
  activeTab,
}: {
  contests: Contest[];
  currentUserId: string;
  activeTab: string;
}) {
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
        toast.error(data.error);
      }
      router.refresh();
    } catch {
      toast.error("Errore durante l'operazione");
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
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error);
      }
      router.refresh();
    } catch {
      toast.error("Errore durante l'operazione");
    }
    setActionLoading(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ContestTabs
          active={activeTab as ContestTab}
          onChange={(tab) => {
            window.location.href = tab === "open" ? "/contests" : `/contests?tab=${tab}`;
          }}
        />
      </div>

      {contests.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Nessuna contest"
          description={
            activeTab === "mine"
              ? "Non partecipi a nessuna contest. Esplora le contest aperte!"
              : activeTab === "completed"
              ? "Nessuna contest completata ancora."
              : "Nessuna contest aperta. Creane una nuova!"
          }
        />
      ) : (
        <div className="space-y-3">
          {contests.map((contest) => (
            <ContestCard
              key={contest.id}
              contest={contest}
              isPlayer={contest.isPlayer}
              onJoin={joinContest}
              onLeave={leaveContest}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
