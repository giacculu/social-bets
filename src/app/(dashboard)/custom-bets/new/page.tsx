"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Swords } from "lucide-react";
import Link from "next/link";

export default function NewCustomBetPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    stake: "",
    deadline: "",
    participants: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/custom-bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          stake: parseFloat(form.stake),
          participantUsernames: form.participants
            .split(",")
            .map((u) => u.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Errore");
        setLoading(false);
        return;
      }

      router.push("/custom-bets");
    } catch {
      setError("Errore di connessione");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link
        href="/custom-bets"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Indietro
      </Link>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Swords className="h-6 w-6 text-emerald-400" />
          Nuova Sfida
        </h1>
        <p className="text-gray-500">Crea una sfida personalizzata con i tuoi amici</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Titolo della sfida
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            placeholder="Es: Chi vince la Champions League?"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Descrizione (opzionale)
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            rows={3}
            placeholder="Aggiungi dettagli..."
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Puntata per persona (€)
          </label>
          <input
            type="number"
            value={form.stake}
            onChange={(e) => setForm({ ...form, stake: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            placeholder="100"
            min="1"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Scadenza
          </label>
          <input
            type="datetime-local"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Amici (separa con virgola)
          </label>
          <input
            type="text"
            value={form.participants}
            onChange={(e) => setForm({ ...form, participants: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            placeholder="mario, luca, giulia"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Inserisci gli username separati da virgole
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50 transition-colors"
        >
          {loading ? "Creazione..." : "Crea Sfida"}
        </button>
      </form>
    </div>
  );
}
