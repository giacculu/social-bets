"use client";

import { cn } from "@/lib/utils";

const tabs = [
  { id: "open", label: "Aperte" },
  { id: "mine", label: "Le Mie" },
  { id: "completed", label: "Completate" },
] as const;

export type ContestTab = (typeof tabs)[number]["id"];

export function ContestTabs({
  active,
  onChange,
}: {
  active: ContestTab;
  onChange: (tab: ContestTab) => void;
}) {
  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            active === tab.id
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
