"use client";

import { cn } from "@/lib/utils";

const periods = [
  { id: "week", label: "Settimana" },
  { id: "month", label: "Mese" },
  { id: "all", label: "Tutti" },
] as const;

export type LeaderboardPeriod = (typeof periods)[number]["id"];

export function LeaderboardPeriodTabs({
  active,
  onChange,
}: {
  active: LeaderboardPeriod;
  onChange: (period: LeaderboardPeriod) => void;
}) {
  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1">
      {periods.map((period) => (
        <button
          key={period.id}
          onClick={() => onChange(period.id)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            active === period.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
