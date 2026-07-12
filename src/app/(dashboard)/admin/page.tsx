import { getOrchestrator } from "@/lib/data/engine/orchestrator";
import { requireAuth } from "@/lib/requireAuth";

export default async function AdminPage() {
  await requireAuth();

  const orchestrator = getOrchestrator();
  const status = await orchestrator.getSystemStatus();

  const formatTime = (iso: string | null) => {
    if (!iso) return "Mai";
    return new Date(iso).toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">Sistema di raccolta dati sportivi</p>
        </div>
        <div className="flex gap-2">
          <form action="/api/admin/sync" method="POST">
            <input type="hidden" name="action" value="sync_all" />
            <button className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400">
              Sync All
            </button>
          </form>
          <form action="/api/admin/sync" method="POST">
            <input type="hidden" name="action" value="settle" />
            <button className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400">
              Settle Bets
            </button>
          </form>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {[
          { label: "Eventi", value: status.stats.totalEvents, color: "text-white" },
          { label: "Mercati", value: status.stats.totalMarkets, color: "text-white" },
          { label: "Outcome", value: status.stats.totalOutcomes, color: "text-white" },
          { label: "Prossimi", value: status.stats.upcomingEvents, color: "text-yellow-400" },
          { label: "Live", value: status.stats.liveEvents, color: "text-red-400" },
          { label: "Scommesse Settled", value: status.stats.settledBets, color: "text-emerald-400" },
          { label: "Scommesse Pending", value: status.stats.pendingBets, color: "text-orange-400" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Data Sources */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Fonti Dati</h2>
        <div className="space-y-2">
          {status.sources.map((source) => (
            <div
              key={source.name}
              className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/50 p-4"
            >
              <div
                className={`h-3 w-3 rounded-full ${
                  source.healthy ? "bg-emerald-400" : "bg-red-400"
                }`}
              />
              <div className="flex-1">
                <p className="font-medium">{source.displayName}</p>
                <p className="text-xs text-gray-500">
                  Priority: {source.enabled ? "Alta" : "Bassa"} · Reliability:{" "}
                  {(source.reliability * 100).toFixed(0)}% · Errors:{" "}
                  {source.errorCount} · Syncs: {source.totalSyncs}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="text-gray-400">
                  {formatTime(source.lastSync)}
                </p>
                <p
                  className={`text-xs ${
                    source.enabled ? "text-emerald-400" : "text-gray-500"
                  }`}
                >
                  {source.enabled ? "Attiva" : "Disattiva"}
                </p>
              </div>
            </div>
          ))}
          {status.sources.length === 0 && (
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8 text-center">
              <p className="text-gray-500">
                Nessuna fonte configurata
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Aggiungi le API keys nelle env vars per attivare i sources
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Jobs */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Job Recenti</h2>
        <div className="space-y-1">
          {status.recentJobs.length === 0 ? (
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8 text-center">
              <p className="text-gray-500">Nessun job eseguito ancora</p>
            </div>
          ) : (
            status.recentJobs
              .slice()
              .reverse()
              .slice(0, 10)
              .map((job) => (
                <div
                  key={job.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-2 text-sm"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      job.status === "completed"
                        ? "bg-emerald-400"
                        : job.status === "failed"
                        ? "bg-red-400"
                        : job.status === "running"
                        ? "bg-yellow-400 animate-pulse"
                        : "bg-gray-500"
                    }`}
                  />
                  <span className="text-gray-400">{job.source}</span>
                  <span className="flex-1 text-gray-500">
                    {job.status}
                    {job.error && ` - ${job.error}`}
                  </span>
                  <span className="text-xs text-gray-600">
                    {job.startedAt
                      ? new Date(job.startedAt).toLocaleTimeString("it-IT")
                      : ""}
                  </span>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Cron Schedule Info */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Cron Jobs (Vercel)</h2>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-sm font-medium">Sync Quote</p>
              <p className="text-xs text-gray-500">Ogni 30 minuti</p>
              <p className="text-xs text-gray-600">/api/cron?job=sync</p>
            </div>
            <div>
              <p className="text-sm font-medium">Settlement</p>
              <p className="text-xs text-gray-500">Ogni 6 ore</p>
              <p className="text-xs text-gray-600">/api/cron?job=settle</p>
            </div>
            <div>
              <p className="text-sm font-medium">Full Reconciliation</p>
              <p className="text-xs text-gray-500">Giornaliero alle 3 AM</p>
              <p className="text-xs text-gray-600">/api/cron?job=full</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
