import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useAdminListTasks,
  useAdminDeleteTask,
  getAdminListTasksQueryKey,
} from "@workspace/api-client-react";
import type { Task } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, Trash2, ChevronRight, Loader2 } from "lucide-react";
import { categoryLabels, statusLabels, formatTenge } from "@/lib/labels";
import { relativeTimeRu } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const statusBadgeClass: Record<string, string> = {
  open: "bg-sky-50 text-sky-700 border-sky-200",
  in_progress: "bg-primary/10 text-primary border-primary/30",
  awaiting_payment: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const STATUSES = [
  { value: "", label: "Все" },
  { value: "open", label: "Открытые" },
  { value: "in_progress", label: "В работе" },
  { value: "awaiting_payment", label: "Ожидает оплаты" },
  { value: "completed", label: "Выполненные" },
  { value: "cancelled", label: "Отменённые" },
];

export function AdminTasks() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const qc = useQueryClient();

  const params: Record<string, string> = {};
  if (query) params["search"] = query;
  if (statusFilter) params["status"] = statusFilter;

  const { data: tasks = [], isLoading } = useAdminListTasks(params);

  const deleteMut = useAdminDeleteTask({
    mutation: {
      onSuccess: () => {
        toast.success("Задание отменено");
        void qc.invalidateQueries({ queryKey: getAdminListTasksQueryKey() });
      },
      onError: (e: unknown) => toast.error((e as Error).message),
    },
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQuery(search);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Задания</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Все задания на платформе с управлением статусами
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Поиск по названию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setQuery("");
              }}
            >
              Сбросить
            </Button>
          )}
        </form>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-5">
        {STATUSES.map((s) => (
          <Button
            key={s.value}
            variant={statusFilter === s.value ? "default" : "outline"}
            size="sm"
            className="text-xs h-7"
            onClick={() => setStatusFilter(s.value)}
          >
            {s.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Загрузка...</span>
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Задания не найдены
        </p>
      ) : (
        <div>
          <p className="text-xs text-muted-foreground mb-3">
            {tasks.length} заданий
          </p>
          <div className="space-y-2">
            {tasks.map((task: Task) => (
              <Card key={task.id} className="p-4">
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          statusBadgeClass[task.status],
                        )}
                      >
                        {statusLabels[task.status]}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {categoryLabels[task.category]}
                      </Badge>
                      <span className="font-semibold text-primary text-sm">
                        {formatTenge(task.priceTenge)}
                      </span>
                      {task.useEscrow && (
                        <Badge
                          variant="outline"
                          className="text-xs text-amber-600 border-amber-200 bg-amber-50"
                        >
                          Эскроу
                        </Badge>
                      )}
                    </div>

                    <Link
                      href={`/tasks/${task.id}`}
                      className="font-medium hover:text-primary transition-colors flex items-center gap-1 mb-1"
                    >
                      {task.title}
                      <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                    </Link>

                    <div className="text-xs text-muted-foreground flex gap-3 flex-wrap">
                      <span>
                        Заказчик:{" "}
                        <Link
                          href={`/users/${task.owner.id}`}
                          className="hover:text-foreground transition-colors"
                        >
                          {task.owner.name}
                        </Link>
                      </span>
                      {task.executor && (
                        <span>
                          Исполнитель:{" "}
                          <Link
                            href={`/users/${task.executor.id}`}
                            className="hover:text-foreground transition-colors"
                          >
                            {task.executor.name}
                          </Link>
                        </span>
                      )}
                      <span>{relativeTimeRu(task.createdAt)}</span>
                      <span className="truncate max-w-[220px]">
                        {task.address}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {task.status !== "completed" &&
                      task.status !== "cancelled" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Отменить
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Отменить задание?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Задание «{task.title}» будет отменено. Эскроу
                                при наличии будет разморожен.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Назад</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() =>
                                  deleteMut.mutate({ id: task.id })
                                }
                              >
                                Отменить задание
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
