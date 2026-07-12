import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Users, UserPlus, Check, X } from "lucide-react";

export default async function FriendsPage() {
  const session = await auth();

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { initiatorId: session!.user!.id },
        { receiverId: session!.user!.id },
      ],
    },
    include: {
      initiator: { select: { id: true, username: true, name: true, balance: true } },
      receiver: { select: { id: true, username: true, name: true, balance: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const friends = friendships
    .filter((f) => f.status === "ACCEPTED")
    .map((f) =>
      f.initiatorId === session!.user!.id ? f.receiver : f.initiator
    );

  const pendingReceived = friendships.filter(
    (f) => f.status === "PENDING" && f.receiverId === session!.user!.id
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Amici</h1>
          <p className="text-gray-500">{friends.length} amici</p>
        </div>
      </div>

      {pendingReceived.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-400">
            Richieste in arrivo
          </h2>
          <div className="space-y-2">
            {pendingReceived.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-400">
                  {f.initiator.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{f.initiator.username}</p>
                  <p className="text-xs text-gray-500">Vuole essere tuo amico</p>
                </div>
                <div className="flex gap-2">
                  <form action="/api/friends" method="POST">
                    <input type="hidden" name="action" value="accept" />
                    <input type="hidden" name="friendshipId" value={f.id} />
                    <button className="rounded-lg bg-emerald-500 p-2 text-black hover:bg-emerald-400">
                      <Check className="h-4 w-4" />
                    </button>
                  </form>
                  <form action="/api/friends" method="POST">
                    <input type="hidden" name="action" value="decline" />
                    <input type="hidden" name="friendshipId" value={f.id} />
                    <button className="rounded-lg bg-gray-800 p-2 text-gray-400 hover:bg-gray-700">
                      <X className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-400">
          I tuoi amici
        </h2>
        {friends.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-600" />
            <p className="mt-4 text-gray-500">Nessun amico ancora</p>
            <p className="text-sm text-gray-600">
              Invita i tuoi amici a unirsi a SocialBets!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/50 p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                  {friend.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{friend.username}</p>
                  <p className="text-xs text-gray-500">{friend.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
