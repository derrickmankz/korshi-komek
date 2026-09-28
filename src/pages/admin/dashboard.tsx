import { useAdminGetStats } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  ListTodo,
  TrendingUp,
  Banknote,
  CheckCircle2,
  Clock,
  XCircle,
  Coins,
  UserPlus,
} from "lucide-react";
import { formatTenge } from "@/lib/labels";
import { cn } from "@/lib/utils";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
}) {
  const iconBg = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-green-100 text-green-600",
    warning: "bg-amber-100 text-amber-600",
    destructive: "bg-destructive/10 text-destructive",
  }[variant];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">
            {title}
          </p>
          <p className="text-2xl font-bold truncate">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

const STATUS_BARS = [
  { key: "open", label: "Открытые", color: "bg-sky-500" },
  { key: "in_progress", label: "В работе", color: "bg-primary" },
  { key: "awaiting_payment", label: "Ожидает оплаты", color: "bg-amber-500" },
  { key: "completed", label: "Выполненные", color: "bg-green-500" },
  { key: "cancelled", label: "Отменённые", color: "bg-destructive/60" },
] as const;

export function AdminDashboard() {
  const { data: stats, isLoading } = useAdminGetStats();

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <Skeleton className="h-7 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const activeTasks =
    stats.tasksByStatus.open +
    stats.tasksByStatus.in_progress +
    stats.tasksByStatus.awaiting_payment;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Дашборд</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ключевые показатели платформы
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <StatCard
          title="Пользователей"
          value={stats.totalUsers}
          subtitle={`+${stats.newUsersThisMonth} за этот месяц`}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Новые за месяц"
          value={stats.newUsersThisMonth}
          icon={UserPlus}
          variant="primary"
        />
        <StatCard
          title="Заданий всего"
          value={stats.totalTasks}
          icon={ListTodo}
        />
        <StatCard
          title="Активные"
          value={activeTasks}
          subtitle="открытые + в работе"
          icon={Clock}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Выполнено"
          value={stats.tasksByStatus.completed}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Отменено"
          value={stats.tasksByStatus.cancelled}
          icon={XCircle}
          variant="destructive"
        />
        <StatCard
          title="Заработано испол."
          value={formatTenge(stats.totalEarnedTenge)}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Комиссия платф."
          value={formatTenge(stats.totalCommissionTenge)}
          subtitle={`${stats.totalEscrowTasks} эскроу-сделок`}
          icon={Coins}
          variant="primary"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="font-semibold mb-4 text-sm">Статусы заданий</h2>
          <div className="space-y-3">
            {STATUS_BARS.map((item) => {
              const val = stats.tasksByStatus[item.key];
              const pct = stats.totalTasks > 0 ? (val / stats.totalTasks) * 100 : 0;
              return (
                <div key={item.key}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium tabular-nums">{val}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", item.color)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold mb-4 text-sm">Финансы</h2>
          <div className="space-y-3">
            {[
              {
                label: "Оборот (сумма выполненных)",
                value: formatTenge(stats.totalEarnedTenge),
                icon: TrendingUp,
              },
              {
                label: "Комиссия платформы (7%)",
                value: formatTenge(stats.totalCommissionTenge),
                icon: Coins,
              },
              {
                label: "Эскроу-сделок завершено",
                value: String(stats.totalEscrowTasks),
                icon: CheckCircle2,
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <row.icon className="h-4 w-4 shrink-0" />
                  {row.label}
                </div>
                <span className="font-semibold text-sm">{row.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
