import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function SportsPage() {
  const sports = await prisma.sport.findMany({
    where: { active: true },
    include: {
      leagues: {
        where: { active: true },
        include: {
          events: {
            where: { status: "UPCOMING" },
            orderBy: { startTime: "asc" },
            take: 3,
          },
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sport</h1>
        <p className="text-gray-500">Sfoglia tutti gli eventi disponibili</p>
      </div>

      {sports.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center">
          <p className="text-gray-500">Nessuno sport disponibile al momento</p>
          <p className="mt-2 text-sm text-gray-600">
            Torna presto - stiamo aggiungendo nuovi sport ogni giorno!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sports.map((sport) => (
            <div key={sport.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{sport.icon || "🏅"}</span>
                  <h2 className="text-xl font-semibold">{sport.name}</h2>
                </div>
                <Link
                  href={`/sports/${sport.slug}`}
                  className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300"
                >
                  Vedi tutto <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {sport.leagues.map((league) => (
                <div
                  key={league.id}
                  className="rounded-xl border border-gray-800 bg-gray-900/50"
                >
                  <Link
                    href={`/sports/${sport.slug}/${league.slug}`}
                    className="flex items-center justify-between border-b border-gray-800 px-4 py-3 hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {league.logoUrl && (
                        <img
                          src={league.logoUrl}
                          alt=""
                          className="h-5 w-5 rounded"
                        />
                      )}
                      <span className="font-medium">{league.name}</span>
                      {league.country && (
                        <span className="text-xs text-gray-500">
                          {league.country}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  </Link>

                  {league.events.length > 0 && (
                    <div className="divide-y divide-gray-800">
                      {league.events.map((event) => (
                        <Link
                          key={event.id}
                          href={`/sports/${sport.slug}/${league.slug}?event=${event.id}`}
                          className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/30 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium">
                              {event.homeTeamName} vs {event.awayTeamName}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {formatDate(event.startTime)}
                              {event.status === "LIVE" && (
                                <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-400">
                                  LIVE
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
