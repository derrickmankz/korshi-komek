import { useMemo, useState, useEffect } from "react";
import { Link } from "wouter";
import {
  useGetMe,
  useListTasks,
  useGetDashboardSummary,
  useGetRecentActivity,
  useGetTopHelpers,
  TaskCategory,
} from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { TaskCard } from "@/components/TaskCard";
import { TaskMap } from "@/components/TaskMap";
import { CategoryIcon } from "@/components/CategoryIcon";
import { UserBadge } from "@/components/UserBadge";
import { EmptyState } from "@/components/EmptyState";
import { categoryLabels, formatTenge } from "@/lib/labels";
import { relativeTimeRu, pluralRu } from "@/lib/format";
import {
  Search,
  PlusCircle,
  Inbox,
  Clock,
  CheckCircle2,
  Wallet as WalletIcon,
  Activity,
  Trophy,
  ShieldCheck,
  List,
  Map,
} from "lucide-react";

import { CITIES, cityCenter } from "@/lib/cities";

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const activityDot: Record<string, string> = {
  task_created: "bg-secondary",
  task_accepted: "bg-primary",
  task_completed: "bg-primary",
  review_posted: "bg-secondary",
};

export function Home() {
  const { data: me } = useGetMe();
  const [search, setSearch] = useState("");
  const [escrowOnly, setEscrowOnly] = useState(false);
  const [activeCats, setActiveCats] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [mapCenter, setMapCenter] = useState<[number, number]>([43.238, 76.889]);
  const [radiusKm, setRadiusKm] = useState(0);

  useEffect(() => {
    const c = cityCenter(me?.city);
    if (c) setMapCenter(c);
  }, [me?.city]);

  const { data: summary } = useGetDashboardSummary();
  const { data: tasks, isLoading: tasksLoading } = useListTasks();
  const { data: activity } = useGetRecentActivity();
  const { data: topHelpers } = useGetTopHelpers();

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((t) => {
      if (activeCats.size > 0 && !activeCats.has(t.category)) return false;
      if (escrowOnly && !t.useEscrow) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (
          !t.title.toLowerCase().includes(q) &&
          !t.description.toLowerCase().includes(q) &&
          !(t.address ?? "").toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, activeCats, escrowOnly, search]);

  const mapTasks = useMemo(() => {
    if (radiusKm === 0) return filteredTasks.filter((t) => t.latitude != null && t.longitude != null);
    return filteredTasks.filter(
      (t) => t.latitude != null && t.longitude != null &&
        haversineKm(mapCenter[0], mapCenter[1], t.latitude, t.longitude) <= radiusKm
    );
  }, [filteredTasks, mapCenter, radiusKm]);

  function toggleCat(c: string) {
    setActiveCats((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  const allCategories = Object.values(TaskCategory);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <section className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Здравствуйте, {me?.name?.split(" ")[0] ?? "сосед"}
        </h1>
        <p className="text-muted-foreground text-lg">
          Что-то нужно сделать в {me?.city ?? me?.district ?? "вашем районе"}? Соседи помогут.
        </p>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard
          icon={<Inbox className="h-4 w-4" />}
          label="Открытых заданий"
          value={summary?.openTasksCount}
          loading={!summary}
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="В работе сейчас"
          value={summary?.inProgressCount}
          loading={!summary}
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Выполнено за сутки"
          value={summary?.completedTodayCount}
          loading={!summary}
        />
        <StatCard
          icon={<WalletIcon className="h-4 w-4" />}
          label="Средняя цена"
          value={summary ? formatTenge(summary.averagePriceTenge) : undefined}
          loading={!summary}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-5">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию, описанию или адресу..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 px-2">
                <Switch id="escrow-only" checked={escrowOnly} onCheckedChange={setEscrowOnly} />
                <Label htmlFor="escrow-only" className="text-sm cursor-pointer flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-secondary" />
                  Только безопасная сделка
                </Label>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
              {allCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCat(c)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    activeCats.has(c)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted border-border text-muted-foreground"
                  }`}
                >
                  <CategoryIcon category={c} className="h-3.5 w-3.5" />
                  {categoryLabels[c]}
                </button>
              ))}
            </div>
          </Card>

          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold shrink-0">
              {filteredTasks.length} {pluralRu(filteredTasks.length, ["задание", "задания", "заданий"])}
            </h2>
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex rounded-lg border overflow-hidden">
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted text-muted-foreground"}`}
                >
                  <List className="h-3.5 w-3.5" />
                  Список
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors border-l ${viewMode === "map" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted text-muted-foreground"}`}
                >
                  <Map className="h-3.5 w-3.5" />
                  Карта
                </button>
              </div>
              <Link href="/tasks/new">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Создать
                </Button>
              </Link>
            </div>
          </div>

          {viewMode === "map" && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {CITIES.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => setMapCenter(city.center)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      mapCenter[0] === city.center[0] && mapCenter[1] === city.center[1]
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted border-border text-muted-foreground"
                    }`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground shrink-0">
                  Радиус: {radiusKm === 0 ? "все" : `${radiusKm} км`}
                </span>
                <Slider
                  min={0}
                  max={20}
                  step={1}
                  value={[radiusKm]}
                  onValueChange={([v]) => setRadiusKm(v)}
                  className="flex-1"
                />
                {radiusKm > 0 && (
                  <button
                    onClick={() => setRadiusKm(0)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    Сбросить
                  </button>
                )}
              </div>
            </div>
          )}

          {viewMode === "map" ? (
            tasksLoading ? (
              <Skeleton className="h-[520px] w-full rounded-xl" />
            ) : mapTasks.length === 0 ? (
              <Card>
                <EmptyState
                  icon={Inbox}
                  title="Заданий не нашлось"
                  description={radiusKm > 0 ? `В радиусе ${radiusKm} км заданий нет. Увеличьте радиус.` : "Попробуйте сбросить фильтры."}
                />
              </Card>
            ) : (
              <TaskMap tasks={mapTasks} center={mapCenter} radiusKm={radiusKm} />
            )
          ) : tasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <Card>
              <EmptyState
                icon={Inbox}
                title="Заданий не нашлось"
                description="Попробуйте сбросить фильтры или создать первое задание сами."
                action={
                  <Link href="/tasks/new">
                    <Button>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Создать задание
                    </Button>
                  </Link>
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredTasks.map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-5">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Лента района</h3>
            </div>
            <ul className="space-y-3">
              {(activity ?? []).slice(0, 8).map((a) => (
                <li key={a.id} className="flex gap-3 text-sm">
                  <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${activityDot[a.kind] ?? "bg-muted-foreground"}`} />
                  <div className="flex-1">
                    {a.taskId ? (
                      <Link href={`/tasks/${a.taskId}`} className="hover:text-primary transition-colors">
                        {a.message}
                      </Link>
                    ) : (
                      <span>{a.message}</span>
                    )}
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {relativeTimeRu(a.createdAt)}
                    </div>
                  </div>
                </li>
              ))}
              {(!activity || activity.length === 0) && (
                <li className="text-sm text-muted-foreground">Пока тихо в районе.</li>
              )}
            </ul>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Топ соседей</h3>
            </div>
            <ul className="space-y-3">
              {(topHelpers ?? []).map((u) => (
                <li key={u.id} className="flex items-center justify-between">
                  <UserBadge user={u} showRating showDistrict />
                  <Badge variant="outline" className="text-xs">
                    {u.completedJobs} {pluralRu(u.completedJobs, ["сделка", "сделки", "сделок"])}
                  </Badge>
                </li>
              ))}
              {(!topHelpers || topHelpers.length === 0) && (
                <li className="text-sm text-muted-foreground">Скоро здесь появятся помощники.</li>
              )}
            </ul>
          </Card>

          {summary && (
            <Card className="p-5 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium mb-1">Безопасная сделка</div>
                  <p className="text-muted-foreground">
                    Сейчас на платформе заморожено {formatTenge(summary.totalEscrowHeldTenge)}.
                    Комиссия {summary.commissionPercent}% удерживается только при выплате — это плата за защиту обеих сторон.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string | undefined;
  loading?: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
        {icon}
        <span>{label}</span>
      </div>
      {loading ? (
        <Skeleton className="h-7 w-16" />
      ) : (
        <div className="text-2xl font-bold">{value ?? 0}</div>
      )}
    </Card>
  );
}
