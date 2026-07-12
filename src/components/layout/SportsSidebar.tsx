"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Trophy, Dices, Swords, Users, BarChart3, Wallet, Shield } from "lucide-react";

interface Sport {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  leagues: { id: string; name: string; slug: string }[];
}

export function SportsSidebar({ sports }: { sports: Sport[] }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/sports", label: "Tutti gli Sport", icon: Dices },
    { href: "/bets", label: "Le Mie Scommesse", icon: Trophy },
    { href: "/custom-bets", label: "Sfide Custom", icon: Swords },
    { href: "/friends", label: "Amici", icon: Users },
    { href: "/leaderboard", label: "Classifica", icon: BarChart3 },
    { href: "/wallet", label: "Portafoglio", icon: Wallet },
    { href: "/admin", label: "Admin", icon: Shield },
  ];

  return (
    <nav className="space-y-6">
      <div>
        <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Navigazione
        </h3>
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sport
        </h3>
        <div className="space-y-1">
          {sports.map((sport) => (
            <Link
              key={sport.id}
              href={`/sports/${sport.slug}`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.includes(sport.slug)
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <span className="text-base">{sport.icon || "🏅"}</span>
              {sport.name}
              {sport.leagues.length > 0 && (
                <span className="ml-auto text-xs text-muted-foreground/50">
                  {sport.leagues.length}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
