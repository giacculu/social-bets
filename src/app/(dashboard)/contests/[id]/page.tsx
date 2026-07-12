import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Trophy, Users, Clock, ArrowLeft, Target } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";

export const dynamic = "force-dynamic";

export default async function ContestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const contest = await prisma.contest.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, username: true, name: true, avatarUrl: true } },
      entries: {
        include: {
          user: { select: { id: true, username: true, name: true, avatarUrl: true } },
        },
        orderBy: { score: "desc" },
      },
      event: true,
    },
  });

  if (!contest) notFound();

  const isParticipant = contest.entries.some((e) => e.userId === session!.user!.id);
  const isCreator = contest.creatorId === session!.user!.id;

  return (
    <div className="space-y-6">
      <Link
        href="/contests"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Contest
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{contest.title}</h1>
          <StatusBadge status={contest.status} />
        </div>
        {contest.description && (
          <p className="mt-1 text-muted-foreground">{contest.description}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Trophy className="mx-auto h-5 w-5 text-primary mb-1" />
          <p className="text-xl font-bold text-primary">{formatCurrency(Number(contest.prizePool))}</p>
          <p className="text-xs text-muted-foreground">Prize Pool</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Users className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
          <p className="text-xl font-bold">{contest.entries.length}/{contest.maxPlayers}</p>
          <p className="text-xs text-muted-foreground">Giocatori</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Target className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
          <p className="text-xl font-bold">{formatCurrency(Number(contest.entryFee))}</p>
          <p className="text-xs text-muted-foreground">Entry Fee</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Clock className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
          <p className="text-sm font-medium">{formatDate(contest.startTime)}</p>
          <p className="text-xs text-muted-foreground">Inizio</p>
        </div>
      </div>

      {contest.event && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground mb-1">Evento Associato</p>
          <p className="font-medium">
            {contest.event.homeTeamName} vs {contest.event.awayTeamName}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDate(contest.event.startTime)}
          </p>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Classifica</h2>
        {contest.entries.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">Nessun partecipante ancora</p>
          </div>
        ) : (
          <div className="space-y-2">
            {contest.entries.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center gap-4 rounded-xl border border-border bg-card p-4 ${
                  index === 0 ? "border-primary/30 bg-primary/5" : ""
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {entry.user.name || entry.user.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{entry.user.username}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{entry.score} pts</p>
                  <p className="text-xs text-muted-foreground">
                    {Array.isArray(entry.predictions) ? entry.predictions.length : 0} predizioni
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
