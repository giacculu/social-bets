"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Banknote } from "lucide-react";
import { useEffect } from "react";

export default function WithdrawPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/wallet/balance")
      .then((r) => r.json())
      .then((d) => setBalance(d.realBalance || 0));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const value = parseFloat(amount);
    if (value < 1) {
      setError("Importo minimo: 1€");
      setLoading(false);
      return;
    }
    if (value > balance) {
      setError("Saldo insufficiente");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/wallet/withdraw", {
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
      setSuccess(true);
      setBalance((b) => b - value);
      setLoading(false);
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
          <h1 className="text-2xl font-bold">Prelieva</h1>
          <p className="text-gray-500">Saldo disponibile: {balance.toFixed(2)}€</p>
        </div>
      </div>

      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 text-sm text-blue-300">
        <strong>Nota:</strong> In questa fase demo, i prelievi sono simulati.
        Verranno processati manualmente dall&apos;amministratore.
      </div>

      {success ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
          <Banknote className="mx-auto h-12 w-12 text-emerald-400" />
          <p className="mt-4 text-lg font-semibold text-emerald-400">Richiesta inviata!</p>
          <p className="text-sm text-gray-500">Riceverai i fondi a breve</p>
          <Link
            href="/wallet"
            className="mt-4 inline-block rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-black hover:bg-emerald-400"
          >
            Torna al portafoglio
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">Importo</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-2xl font-bold text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
                min="1"
                max={balance}
                placeholder="0"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-gray-500">€</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || balance <= 0}
            className="w-full rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50 transition-colors"
          >
            {loading ? "Elaborazione..." : "Prelieva"}
          </button>
        </form>
      )}
    </div>
  );
}
