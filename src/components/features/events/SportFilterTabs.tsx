"use client";

import { cn } from "@/lib/utils";

export function SportFilterTabs({
  sports,
  activeSport,
  onChange,
}: {
  sports: Array<{ slug: string; name: string; icon?: string | null }>;
  activeSport: string | null;
  onChange: (slug: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={cn(
          "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          activeSport === null
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        Tutti
      </button>
      {sports.map((sport) => (
        <button
          key={sport.slug}
          onClick={() => onChange(sport.slug)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            activeSport === sport.slug
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <span>{sport.icon || "🏅"}</span>
          {sport.name}
        </button>
      ))}
    </div>
  );
}
