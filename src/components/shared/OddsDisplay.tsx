import { formatOdds } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function OddsDisplay({
  odds,
  className,
  size = "md",
}: {
  odds: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm font-medium",
    lg: "text-lg font-bold",
  };

  const color = odds < 2.0 ? "text-emerald-400" : odds < 3.0 ? "text-yellow-400" : "text-red-400";

  return (
    <span className={cn(sizeClasses[size], color, className)}>
      {formatOdds(odds)}
    </span>
  );
}
