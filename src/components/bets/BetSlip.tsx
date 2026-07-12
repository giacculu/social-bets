"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Trash2 } from "lucide-react";

interface BetSelection {
  outcomeId: string;
  outcomeName: string;
  odds: number;
  eventId: string;
  marketId: string;
  marketName: string;
  eventName: string;
}

export function BetSlip() {
  const router = useRouter();
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [stake, setStake] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    function handleAdd(e: Event) {
      const detail = (e as CustomEvent).detail as BetSelection;
      setSelections((prev) => {
        const exists = prev.find((s) => s.outcomeId === detail.outcomeId);
        if (exists) return prev.filter((s) => s.outcomeId !== detail.outcomeId);
        const withoutSameMarket = prev.filter((s) => s.marketId !== detail.marketId);
        return [...withoutSameMarket, detail];
      });
    }
    window.addEventListener("add-to-betslip", handleAdd);
    return () => window.removeEventListener("add-to-betslip", handleAdd);
  }, []);

  function removeSelection(outcomeId: string) {
    setSelections((prev) => prev.filter((s) => s.outcomeId !== outcomeId));
  }

  const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1);
  const stakeNum = parseFloat(stake) || 0;
  const potentialWin = stakeNum * totalOdds;

  async function placeBet() {
    if (selections.length === 0 || stakeNum <= 0) return;
    setLoading(true);
    setMessage(null);

    try {
      const results = await Promise.all(
        selections.map((s) =>
          fetch("/api/bets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventId: s.eventId,
              marketId: s.marketId,
              outcomeId: s.outcomeId,
              stake: stakeNum / selections.length,
            }),
          }).then((r) => r.json())
        )
      );

      const errors = results.filter((r) => r.error);
      if (errors.length > 0) {
        setMessage({ type: "error", text: errors[0].error });
      } else {
        setMessage({ type: "success", text: "Scommessa piazzata!" });
        setSelections([]);
        setStake("");
        router.refresh();
      }
    } catch {
      setMessage({ type: "error", text: "Errore nel piazzamento della scommessa" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <h3 className="mb-3 font-semibold">
        Schedina
        {selections.length > 0 && (
          <span className="ml-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs text-black font-bold">
            {selections.length}
          </span>
        )}
      </h3>

      {selections.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">
          Clicca sulle quote per aggiungere alla schedina
        </p>
      ) : (
        <>
          <div className="space-y-2">
            {selections.map((s) => (
              <div
                key={s.outcomeId}
                className="flex items-center justify-between rounded-lg bg-gray-800 p-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.eventName}</p>
                  <p className="text-xs text-gray-500">
                    {s.marketName} - {s.outcomeName}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-sm font-bold text-emerald-400">
                    {s.odds.toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeSelection(s.outcomeId)}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs text-gray-500">
                Importo (€)
              </label>
              <input
                type="number"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                min="1"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                placeholder="0.00"
              />
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Quota totale</span>
              <span className="font-bold">{totalOdds.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Vincita potenziale</span>
              <span className="font-bold text-emerald-400">
                €{potentialWin.toFixed(2)}
              </span>
            </div>

            {message && (
              <div
                className={`rounded-lg p-2 text-sm text-center ${
                  message.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              onClick={placeBet}
              disabled={loading || stakeNum <= 0}
              className="w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50 transition-colors"
            >
              {loading ? "Piazzamento..." : "Piazza Scommessa"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
