import { Link } from "wouter";
import { useGetWallet } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import { formatTenge, txKindLabels } from "@/lib/labels";
import { formatDateRu } from "@/lib/format";
import { Wallet as WalletIcon, ShieldCheck, ArrowUpRight, ArrowDownLeft, History } from "lucide-react";
import { cn } from "@/lib/utils";

export function Wallet() {
  const { data, isLoading } = useGetWallet();

  if (isLoading || !data) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Кошелёк</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Здесь видны все движения денег по вашим сделкам.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <WalletIcon className="h-4 w-4 text-primary" />
            Доступно
          </div>
          <div className="text-3xl font-bold">{formatTenge(data.balanceTenge)}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Можно использовать для оплаты новых заданий или вывести.
          </p>
        </Card>
        <Card className="p-6 bg-secondary/5 border-secondary/20">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <ShieldCheck className="h-4 w-4 text-secondary" />
            Заморожено в сделках
          </div>
          <div className="text-3xl font-bold">{formatTenge(data.heldTenge)}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Перейдут исполнителю, когда вы подтвердите выполнение.
          </p>
        </Card>
      </div>

      <Card>
        <div className="p-5 border-b flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">История операций</h2>
        </div>
        {data.transactions.length === 0 ? (
          <EmptyState
            icon={History}
            title="Операций пока нет"
            description="Как только вы создадите безопасную сделку или получите выплату — она появится здесь."
          />
        ) : (
          <ul className="divide-y">
            {data.transactions.map((tx) => {
              const positive = tx.amountTenge > 0;
              return (
                <li key={tx.id} className="p-4 flex items-center gap-4">
                  <div
                    className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
                      positive ? "bg-secondary/15 text-secondary" : "bg-primary/10 text-primary",
                    )}
                  >
                    {positive ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{txKindLabels[tx.kind]}</span>
                      {tx.taskId && (
                        <Link href={`/tasks/${tx.taskId}`}>
                          <Badge variant="outline" className="text-xs hover:bg-primary/5">
                            Задание
                          </Badge>
                        </Link>
                      )}
                    </div>
                    {tx.description && (
                      <p className="text-sm text-muted-foreground truncate">{tx.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDateRu(tx.createdAt)}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "text-base font-semibold shrink-0 tabular-nums",
                      positive ? "text-secondary" : "text-foreground",
                    )}
                  >
                    {positive ? "+" : ""}
                    {formatTenge(tx.amountTenge)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
