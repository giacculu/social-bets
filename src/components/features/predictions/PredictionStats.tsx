import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PredictionStats({
  stats,
}: {
  stats: {
    total: number;
    pending: number;
    won: number;
    lost: number;
    winRate: number;
    totalStaked: number;
    totalWon: number;
    profit: number;
  };
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-muted-foreground">Totale</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-muted-foreground">{stats.winRate.toFixed(0)}% win rate</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-muted-foreground">In Attesa</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-muted-foreground">Vinte</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-primary">{stats.won}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs text-muted-foreground">Profitto</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${stats.profit >= 0 ? "text-primary" : "text-destructive"}`}>
            {formatCurrency(stats.profit)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
