import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Bell, Trophy, Swords, Target, UserPlus, Check } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/shared/EmptyState";
import { TimeAgo } from "@/components/shared/TimeAgo";

const notifIcons: Record<string, typeof Bell> = {
  BET_WON: Trophy,
  BET_SETTLED: Target,
  CHALLENGE_INVITE: Swords,
  CHALLENGE_RESULT: Swords,
  FRIEND_REQUEST: UserPlus,
  CONTEST_RESULT: Trophy,
};

export default async function NotificationsPage() {
  const session = await auth();

  const notifications = await prisma.notification.findMany({
    where: { userId: session!.user!.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifiche</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} non lette` : "Tutte lette"}
          </p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Nessuna notifica"
          description="Le tue notifiche appariranno qui."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = notifIcons[notif.type] || Bell;
            return (
              <div
                key={notif.id}
                className={`flex items-start gap-3 rounded-xl border border-border p-4 transition-colors ${
                  notif.readAt ? "bg-card" : "bg-primary/5 border-primary/20"
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  notif.readAt ? "bg-muted text-muted-foreground" : "bg-primary/20 text-primary"
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{notif.title}</p>
                  <p className="text-sm text-muted-foreground">{notif.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <TimeAgo date={notif.createdAt} />
                  </p>
                </div>
                {!notif.readAt && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
