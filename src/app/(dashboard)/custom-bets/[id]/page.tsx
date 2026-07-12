import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ArrowLeft, Swords, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";

export const dynamic = "force-dynamic";

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const challenge = await prisma.customBet.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, username: true, name: true } },
      participants: {
        include: {
          user: { select: { id: true, username: true, name: true } },
        },
      },
    },
  });

  if (!challenge) notFound();

  const isCreator = challenge.creatorId === session!.user!.id;
  const isParticipant = challenge.participants.some((p) => p.userId === session!.user!.id);
  const myParticipation = challenge.participants.find((p) => p.userId === session!.user!.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/custom-bets"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Sfide
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{challenge.title}</h1>
          <StatusBadge status={challenge.status} />
        </div>
        {challenge.description && (
          <p className="mt-1 text-muted-foreground">{challenge.description}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Swords className="mx-auto h-5 w-5 text-primary mb-1" />
          <p className="text-xl font-bold text-primary">{formatCurrency(Number(challenge.stake))}</p>
          <p className="text-xs text-muted-foreground">Puntata</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Users className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
          <p className="text-xl font-bold">{challenge.participants.length + 1}</p>
          <p className="text-xs text-muted-foreground">Partecipanti</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Clock className="mx-auto h-5 w-5 text-muted-foreground mb-1" />
          <p className="text-sm font-medium">{formatDate(challenge.deadline)}</p>
          <p className="text-xs text-muted-foreground">Scadenza</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Partecipanti</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
              {challenge.creator.name?.[0] || challenge.creator.username[0]}
            </div>
            <div className="flex-1">
              <p className="font-medium">{challenge.creator.name || challenge.creator.username}</p>
              <p className="text-xs text-muted-foreground">@{challenge.creator.username} ( Creatore)</p>
            </div>
          </div>
          {challenge.participants.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                {p.user.name?.[0] || p.user.username[0]}
              </div>
              <div className="flex-1">
                <p className="font-medium">{p.user.name || p.user.username}</p>
                <p className="text-xs text-muted-foreground">@{p.user.username}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{p.prediction}</p>
                <StatusBadge status={challenge.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {challenge.status === "COMPLETED" && challenge.result && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">Risultato</p>
          <p className="text-xl font-bold">{challenge.result}</p>
        </div>
      )}
    </div>
  );
}
