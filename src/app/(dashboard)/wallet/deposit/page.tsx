"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Banknote, CreditCard } from "lucide-react";

export default function DepositPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const presets = [5, 10, 25, 50, 100];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const value = parseFloat(amount);
    if (value < 1 || value > 10000) {
      setError("Importo tra 1€ e 10.000€");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }
      router.push("/wallet");
      router.refresh();
    } catch {
      setError("Errore di connessione");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/wallet"
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Deposita Soldi Reali</h1>
          <p className="text-gray-500">Aggiungi fondi per partecipare alle Contest</p>
        </div>
      </div>

      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 text-sm text-yellow-300">
        <strong>Nota:</strong> In questa fase demo, i depositi sono simulati.
        Nessun soldo reale verrà addebitato.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Seleziona importo</label>
          <div className="flex gap-2">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(String(p))}
                className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                  amount === String(p)
                    ? "border-yellow-500 bg-yellow-500/10 text-yellow-400"
                    : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                }`}
              >
                {p}€
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Importo personalizzato</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-2xl font-bold text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
              min="1"
              max="10000"
              required
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-500">€</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Metodo di pagamento</p>
              <p className="text-xs text-gray-500">Simulato (demo)</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-yellow-500 py-3 text-sm font-semibold text-black hover:bg-yellow-400 disabled:opacity-50 transition-colors"
        >
          {loading ? "Elaborazione..." : `Deposita ${amount}€`}
        </button>
      </form>
    </div>
  );
}
