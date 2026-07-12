import { cn } from "@/lib/utils";

export function LiveIndicator({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-1 rounded bg-destructive/20 px-2 py-0.5 text-xs font-medium text-destructive", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
      LIVE
    </span>
  );
}
