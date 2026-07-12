"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, ArrowLeft } from "lucide-react";

export default function NewContestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    entryFee: "5",
    maxPlayers: "10",
    startDate: "",
    endDate: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          title: form.title,
          description: form.description || undefined,
          entryFee: parseFloat(form.entryFee),
          maxPlayers: parseInt(form.maxPlayers),
          startTime: form.startDate,
          endTime: form.endDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      router.push("/contests");
    } catch {
      setError("Errore di connessione");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/contests"
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Crea Contest</h1>
          <p className="text-gray-500">Crea una competizione per i tuoi amici</p>
        </div>
      </div>

      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 text-sm text-blue-300">
        <strong>Info legali:</strong> Le contest sono competizioni di abilità, non scommesse.
        Gli utenti competono tra loro con le loro predizioni. La piattaforma prende una commissione
        fissa sulle entry fee (10%).
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Nome Contest</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            placeholder="es. Serie A - Giornata 10"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Descrizione (opzionale)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            placeholder="Descrivi la contest..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Entry Fee (€)</label>
            <input
              type="number"
              value={form.entryFee}
              onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
              min="1"
              max="1000"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Prize pool: {(parseFloat(form.entryFee) * 0.9 * parseInt(form.maxPlayers)).toFixed(0)}€
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Max Giocatori</label>
            <input
              type="number"
              value={form.maxPlayers}
              onChange={(e) => setForm({ ...form, maxPlayers: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
              min="2"
              max="100"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Inizio</label>
            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Fine</label>
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50 transition-colors"
        >
          {loading ? "Creazione..." : "Crea Contest"}
        </button>
      </form>
    </div>
  );
}
