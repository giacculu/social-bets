"use client";

import { cn } from "@/lib/utils";

export function OutcomeButton({
  outcome,
  eventId,
  marketId,
  marketName,
  eventName,
  selected,
}: {
  outcome: { id: string; name: string; odds: number };
  eventId: string;
  marketId: string;
  marketName: string;
  eventName: string;
  selected?: boolean;
}) {
  return (
    <button
      className={cn(
        "rounded-lg border p-3 text-center transition-all group",
        selected
          ? "border-primary bg-primary/10 ring-1 ring-primary/30"
          : "border-border bg-muted hover:border-primary/50 hover:bg-primary/5"
      )}
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent("add-to-betslip", {
            detail: {
              outcomeId: outcome.id,
              outcomeName: outcome.name,
              odds: outcome.odds,
              eventId,
              marketId,
              marketName,
              eventName,
            },
          })
        );
      }}
    >
      <p className="text-xs text-muted-foreground group-hover:text-foreground/80">{outcome.name}</p>
      <p className="text-lg font-bold text-primary">{outcome.odds.toFixed(2)}</p>
    </button>
  );
}
