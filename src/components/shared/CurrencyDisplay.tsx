import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function CurrencyDisplay({
  amount,
  className,
  size = "md",
}: {
  amount: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl font-bold",
  };

  return (
    <span className={cn(sizeClasses[size], amount >= 0 ? "text-emerald-400" : "text-red-400", className)}>
      {amount >= 0 ? "+" : ""}{formatCurrency(amount)}
    </span>
  );
}
