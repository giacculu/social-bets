"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/sports", label: "Sport" },
  { href: "/contests", label: "Contest" },
  { href: "/predictions", label: "Previsioni" },
  { href: "/custom-bets", label: "Sfide" },
  { href: "/feed", label: "Feed" },
  { href: "/friends", label: "Amici" },
  { href: "/leaderboard", label: "Classifica" },
];

export function DesktopNavigation() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-1">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
