import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  UPCOMING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  LIVE: "bg-red-500/10 text-red-400 border-red-500/20",
  FINISHED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  WON: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  LOST: "bg-red-500/10 text-red-400 border-red-500/20",
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  OPEN: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  LOCKED: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", statusColors[status] || "bg-gray-500/10 text-gray-400", className)}
    >
      {status}
    </Badge>
  );
}
