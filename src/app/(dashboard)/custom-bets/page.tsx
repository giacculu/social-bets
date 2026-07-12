import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Swords, Plus } from "lucide-react";
import Link from "next/link";
import { ChallengeCard } from "@/components/features/challenges/ChallengeCard";
import { ChallengeTabs } from "@/components/features/challenges/ChallengeTabs";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function CustomBetsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  const { tab } = await searchParams;
  const activeTab = (tab as string) || "active";

  const customBets = await prisma.customBet.findMany({
    where: {
      OR: [
        { creatorId: session!.user!.id },
        { participants: { some: { userId: session!.user!.id } } },
      ],
      ...(activeTab === "active" ? { status: { in: ["ACCEPTED", "IN_PROGRESS"] } } : {}),
      ...(activeTab === "pending" ? { status: "PENDING" } : {}),
      ...(activeTab === "completed" ? { status: { in: ["COMPLETED", "CANCELLED"] } } : {}),
    },
    include: {
      creator: { select: { username: true } },
      participants: {
        include: { user: { select: { username: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sfide</h1>
          <p className="text-muted-foreground">Crea sfide personalizzate con i tuoi amici</p>
        </div>
        <Link
          href="/custom-bets/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuova Sfida
        </Link>
      </div>

      <ChallengeTabs
        active={activeTab as any}
        onChange={(t) => {
          window.location.href = t === "active" ? "/custom-bets" : `/custom-bets?tab=${t}`;
        }}
      />

      {customBets.length === 0 ? (
        <EmptyState
          icon={Swords}
          title="Nessuna sfida"
          description={
            activeTab === "pending"
              ? "Non hai sfide in attesa di risposta."
              : activeTab === "completed"
              ? "Nessuna sfida completata ancora."
              : "Crea la tua prima sfida personalizzata con un amico!"
          }
        />
      ) : (
        <div className="space-y-3">
          {customBets.map((bet) => (
            <ChallengeCard
              key={bet.id}
              challenge={{
                ...bet,
                stake: Number(bet.stake),
                deadline: bet.deadline.toISOString(),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
