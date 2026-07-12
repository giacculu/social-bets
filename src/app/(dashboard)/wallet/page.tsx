import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { Wallet, ArrowUpRight, ArrowDownRight, Gift, Banknote, Plus, Minus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function WalletPage() {
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    include: {
      wallet: true,
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 30,
      },
      realTransactions: {
        orderBy: { createdAt: "desc" },
        take: 30,
      },
    },
  });

  if (!user) return null;

  const icon = (type: string) => {
    switch (type) {
      case "BET_WON":
        return <ArrowUpRight className="h-4 w-4 text-primary" />;
      case "BET_PLACED":
      case "BET_LOST":
        return <ArrowDownRight className="h-4 w-4 text-destructive" />;
      case "DEPOSIT":
      case "DAILY_BONUS":
      case "REFERRAL_BONUS":
        return <Gift className="h-4 w-4 text-blue-400" />;
      default:
        return <ArrowDownRight className="h-4 w-4 text-muted-foreground" />;
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
      case "CUSTOM_BET_ENTRY": return "Sfida";
      case "CUSTOM_BET_WON": return "Sfida vinta";
      default: return type;
    }
  };

  const realTypeLabel = (type: string) => {
    switch (type) {
      case "DEPOSIT": return "Deposito";
      case "WITHDRAWAL": return "Prelievo";
      case "CONTEST_ENTRY": return "Entry contest";
      case "CONTEST_WIN": return "Vincita contest";
      case "CONTEST_REFUND": return "Refund contest";
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
          <span className="text-sm text-emerald-400">Saldo</span>
        </div>
        <p className="text-4xl font-bold text-emerald-400">
          {formatCurrency(Number(user?.wallet?.balance ?? 0))}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">Saldo disponibile per scommesse</p>
        <div className="mt-3 flex gap-2">
          <Link
            href="/wallet/deposit"
            className="flex items-center gap-1 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/30 transition-colors"
          >
            <Plus className="h-3 w-3" /> Deposita
          </Link>
          <Link
            href="/wallet/withdraw"
            className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
          >
            <Minus className="h-3 w-3" /> Prelieva
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 text-sm text-blue-300">
        <strong>Soldi Reali:</strong> Usati per partecipare alle Contest.
        Il 90% va nel prize pool, il 10% alla piattaforma.
        Competi con i tuoi amici e vinci premi in soldi veri!
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-400" />
            Transazioni Virtuali
          </h2>
          <div className="space-y-2">
            {user.transactions.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <p className="text-muted-foreground">Nessuna transazione</p>
              </div>
            ) : (
              user.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    {icon(tx.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{typeLabel(tx.type)}</p>
                    {tx.reference && (
                      <p className="text-xs text-muted-foreground">{tx.reference}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        Number(tx.amount) >= 0 ? "text-primary" : "text-destructive"
                      }`}
                    >
                      {Number(tx.amount) >= 0 ? "+" : ""}
                      {formatCurrency(Number(tx.amount))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString("it-IT")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Banknote className="h-5 w-5 text-yellow-400" />
            Transazioni Reali
          </h2>
          <div className="space-y-2">
            {user.realTransactions.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <p className="text-muted-foreground">Nessuna transazione</p>
              </div>
            ) : (
              user.realTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    {Number(tx.amount) >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-primary" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{realTypeLabel(tx.type)}</p>
                    {tx.reference && (
                      <p className="text-xs text-muted-foreground">{tx.reference}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        Number(tx.amount) >= 0 ? "text-primary" : "text-destructive"
                      }`}
                    >
                      {Number(tx.amount) >= 0 ? "+" : ""}
                      {formatCurrency(Number(tx.amount))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString("it-IT")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
