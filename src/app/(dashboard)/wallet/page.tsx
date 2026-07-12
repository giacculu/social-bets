import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { Wallet, ArrowUpRight, ArrowDownRight, Gift } from "lucide-react";

export default async function WalletPage() {
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 30,
      },
    },
  });

  if (!user) return null;

  const icon = (type: string) => {
    switch (type) {
      case "BET_WON":
        return <ArrowUpRight className="h-4 w-4 text-emerald-400" />;
      case "BET_PLACED":
      case "BET_LOST":
        return <ArrowDownRight className="h-4 w-4 text-red-400" />;
      case "DEPOSIT":
      case "DAILY_BONUS":
      case "REFERRAL_BONUS":
        return <Gift className="h-4 w-4 text-blue-400" />;
      default:
        return <ArrowDownRight className="h-4 w-4 text-gray-400" />;
    }
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case "DEPOSIT": return "Deposito";
      case "WITHDRAWAL": return "Prelievo";
      case "BET_PLACED": return "Scommessa";
      case "BET_WON": return "Vincita";
      case "BET_LOST": return "Scommessa persa";
      case "BET_CANCELLED": return "Scommessa annullata";
      case "DAILY_BONUS": return "Bonus giornaliero";
      case "REFERRAL_BONUS": return "Bonus referral";
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Portafoglio</h1>

      <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="h-5 w-5 text-emerald-400" />
          <span className="text-sm text-emerald-400">Saldo Disponibile</span>
        </div>
        <p className="text-4xl font-bold text-emerald-400">
          {formatCurrency(Number(user.balance))}
        </p>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Transazioni</h2>
        <div className="space-y-2">
          {user.transactions.length === 0 ? (
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center">
              <p className="text-gray-500">Nessuna transazione</p>
            </div>
          ) : (
            user.transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/50 p-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800">
                  {icon(tx.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{typeLabel(tx.type)}</p>
                  {tx.reference && (
                    <p className="text-xs text-gray-500">{tx.reference}</p>
                  )}
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      Number(tx.amount) >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {Number(tx.amount) >= 0 ? "+" : ""}
                    {formatCurrency(Number(tx.amount))}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.createdAt).toLocaleDateString("it-IT")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
