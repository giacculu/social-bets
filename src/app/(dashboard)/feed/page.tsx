import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Activity, Trophy, Swords, Target, UserPlus, Zap } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { TimeAgo } from "@/components/shared/TimeAgo";

export const dynamic = "force-dynamic";

const activityIcons: Record<string, typeof Activity> = {
  BET_PLACED: Target,
  BET_WON: Trophy,
  BET_LOST: Target,
  CHALLENGE_CREATED: Swords,
  CHALLENGE_ACCEPTED: Swords,
  CONTEST_JOINED: Trophy,
  FRIEND_ADDED: UserPlus,
  ACHIEVEMENT_EARNED: Zap,
};

function formatActivityDescription(type: string, metadata: Record<string, unknown> | null): string {
  switch (type) {
    case "BET_PLACED":
      return `ha piazzato una scommessa`;
    case "BET_WON":
      return `ha vinto una scommessa!`;
    case "BET_LOST":
      return `ha perso una scommessa`;
    case "CHALLENGE_CREATED":
      return `ha creato una sfida`;
    case "CHALLENGE_ACCEPTED":
      return `ha accettato una sfida`;
    case "CONTEST_JOINED":
      return `si è unito a un contest`;
    case "FRIEND_ADDED":
      return `ha aggiunto un amico`;
    case "ACHIEVEMENT_EARNED":
      return `ha sbloccato un achievement`;
    default:
      return `ha effettuato un'azione`;
  }
}

export default async function FeedPage() {
  const session = await auth();

  const activities = await prisma.activityFeedEntry.findMany({
    where: { visibility: "PUBLIC" },
    include: {
      user: { select: { id: true, username: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Feed Attività</h1>
        <p className="text-muted-foreground">Cosa stanno facendo i tuoi amici</p>
      </div>

      {activities.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Nessuna attività"
          description="Il feed è vuoto. Piazza una scommessa o crea una sfida per iniziare!"
        />
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type] || Activity;
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p>
                    <span className="font-medium">{activity.user.name || activity.user.username}</span>
                    {" "}
                    <span className="text-muted-foreground">
                      {formatActivityDescription(activity.type, activity.metadata as Record<string, unknown> | null)}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <TimeAgo date={activity.createdAt} />
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
