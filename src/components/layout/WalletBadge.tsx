import Link from "next/link";
import { Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function WalletBadge({ balance }: { balance: number }) {
  return (
    <Link
      href="/wallet"
      className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
    >
      <Wallet className="h-3.5 w-3.5" />
      {formatCurrency(balance)}
    </Link>
  );
}
