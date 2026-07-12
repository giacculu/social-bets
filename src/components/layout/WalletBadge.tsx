import Link from "next/link";
import { Wallet, Banknote } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function WalletBadge({ balance, realBalance }: { balance: number; realBalance?: number }) {
  return (
    <Link
      href="/wallet"
      className="flex items-center gap-3"
    >
      <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors">
        <Wallet className="h-3.5 w-3.5" />
        {formatCurrency(balance)}
      </div>
      {realBalance !== undefined && realBalance > 0 && (
        <div className="flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-sm font-medium text-yellow-400">
          <Banknote className="h-3.5 w-3.5" />
          {formatCurrency(realBalance)}
        </div>
      )}
    </Link>
  );
}
