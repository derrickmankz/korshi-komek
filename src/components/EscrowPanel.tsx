import type { Escrow } from "@workspace/api-client-react";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { formatTenge } from "@/lib/labels";

const escrowStatusLabels: Record<string, string> = {
  none: "Ожидание исполнителя",
  held: "Деньги заморожены",
  released: "Деньги переведены исполнителю",
  refunded: "Деньги возвращены",
};

interface EscrowPanelProps {
  escrow: Escrow | null;
  priceTenge: number;
}

export function EscrowPanel({ escrow, priceTenge }: EscrowPanelProps) {
  if (!escrow) {
    return (
      <div className="rounded-xl border border-amber-300/60 bg-amber-50/70 dark:bg-amber-900/10 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
              Без безопасной сделки
            </h4>
            <p className="text-sm text-amber-900/80 dark:text-amber-100/80">
              Расчёт напрямую между соседями. Платформа не удерживает деньги и не учитывает рейтинг по этой сделке.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const amount = escrow.amountTenge ?? priceTenge;
  const commission = escrow.commissionTenge ?? Math.round((amount * escrow.commissionPercent) / 100);
  const payout = escrow.payoutTenge ?? amount - commission;

  return (
    <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-5">
      <div className="flex items-start gap-3 mb-4">
        <ShieldCheck className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium mb-0.5">Безопасная сделка</h4>
          <p className="text-sm text-muted-foreground">
            {(escrow.status && escrowStatusLabels[escrow.status]) ?? escrow.status ?? "—"}
          </p>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Сумма заказа</span>
          <span className="font-medium">{formatTenge(amount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            Комиссия платформы ({escrow.commissionPercent}%)
          </span>
          <span className="font-medium">−{formatTenge(commission)}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-secondary/20">
          <span className="font-medium">К выплате исполнителю</span>
          <span className="font-bold text-secondary">{formatTenge(payout)}</span>
        </div>
      </div>
    </div>
  );
}
