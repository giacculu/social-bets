import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Swords, Plus } from "lucide-react";
import Link from "next/link";

export default async function CustomBetsPage() {
  const session = await auth();

  const customBets = await prisma.customBet.findMany({
    where: {
      OR: [
        { creatorId: session!.user!.id },
        { participants: { some: { userId: session!.user!.id } } },
      ],
    },
    include: {
      creator: { select: { username: true } },
      participants: {
        include: { user: { select: { username: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const statusLabel = (status: string) => {
    switch (status) {
      case "PENDING": return "In attesa";
      case "ACCEPTED": return "Accettata";
      case "IN_PROGRESS": return "In corso";
      case "COMPLETED": return "Completata";
      case "CANCELLED": return "Annullata";
      default: return status;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "text-yellow-400 bg-yellow-400/10";
      case "ACCEPTED": return "text-blue-400 bg-blue-400/10";
      case "IN_PROGRESS": return "text-purple-400 bg-purple-400/10";
      case "COMPLETED": return "text-emerald-400 bg-emerald-400/10";
      case "CANCELLED": return "text-gray-400 bg-gray-400/10";
      default: return "text-gray-400 bg-gray-400/10";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sfide Custom</h1>
          <p className="text-gray-500">Crea sfide personalizzate con i tuoi amici</p>
        </div>
        <Link
          href="/custom-bets/new"
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuova Sfida
        </Link>
      </div>

      {customBets.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center">
          <Swords className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-4 text-gray-500">Nessuna sfida ancora</p>
          <p className="text-sm text-gray-600">
            Crea la tua prima sfida personalizzata con un amico!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {customBets.map((bet) => (
            <div
              key={bet.id}
              className="rounded-xl border border-gray-800 bg-gray-900/50 p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{bet.title}</h3>
                  {bet.description && (
                    <p className="text-sm text-gray-400 mt-1">{bet.description}</p>
                  )}
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(
                    bet.status
                  )}`}
                >
                  {statusLabel(bet.status)}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                <span>Creato da {bet.creator.username}</span>
                <span>·</span>
                <span>{bet.participants.length} partecipanti</span>
                <span>·</span>
                <span>
                  Scadenza:{" "}
                  {new Date(bet.deadline).toLocaleDateString("it-IT")}
                </span>
              </div>
              {bet.participants.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {bet.participants.map((p) => (
                    <span
                      key={p.id}
                      className="rounded-full bg-gray-800 px-2.5 py-1 text-xs"
                    >
                      {p.user.username}: {p.prediction}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
