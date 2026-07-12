import { Crown, Medal } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function LeaderboardPodium({
  entries,
}: {
  entries: Array<{
    id: string;
    rank: number;
    netProfit: number;
    betCount: number;
    winRate: number;
    user: { username: string; name?: string | null };
  }>;
}) {
  if (entries.length < 3) return null;

  const [first, second, third] = entries;

  return (
    <div className="flex items-end justify-center gap-4 py-6">
      {/* 2nd place */}
      <div className="flex flex-col items-center gap-2 w-28">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-bold">
          {second.user.username[0].toUpperCase()}
        </div>
        <p className="text-sm font-medium truncate w-full text-center">{second.user.name || second.user.username}</p>
        <p className="text-xs text-muted-foreground">{formatCurrency(second.netProfit)}</p>
        <div className="flex h-16 w-full items-center justify-center rounded-t-lg bg-muted border border-border border-b-0">
          <Medal className="h-6 w-6 text-foreground/50" />
        </div>
        <p className="text-lg font-bold">2</p>
      </div>

      {/* 1st place */}
      <div className="flex flex-col items-center gap-2 w-32">
        <Crown className="h-6 w-6 text-yellow-400" />
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-xl font-bold text-primary">
          {first.user.username[0].toUpperCase()}
        </div>
        <p className="text-sm font-medium truncate w-full text-center">{first.user.name || first.user.username}</p>
        <p className="text-xs text-primary">{formatCurrency(first.netProfit)}</p>
        <div className="flex h-24 w-full items-center justify-center rounded-t-lg bg-primary/10 border border-primary/20 border-b-0">
          <Crown className="h-8 w-8 text-primary" />
        </div>
        <p className="text-xl font-bold text-primary">1</p>
      </div>

      {/* 3rd place */}
      <div className="flex flex-col items-center gap-2 w-28">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-bold">
          {third.user.username[0].toUpperCase()}
        </div>
        <p className="text-sm font-medium truncate w-full text-center">{third.user.name || third.user.username}</p>
        <p className="text-xs text-muted-foreground">{formatCurrency(third.netProfit)}</p>
        <div className="flex h-12 w-full items-center justify-center rounded-t-lg bg-muted border border-border border-b-0">
          <Medal className="h-5 w-5 text-orange-400" />
        </div>
        <p className="text-lg font-bold">3</p>
      </div>
    </div>
  );
}
