import { Link } from "wouter";
import { useListMyTasks } from "@workspace/api-client-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/TaskCard";
import { EmptyState } from "@/components/EmptyState";
import { Inbox, PlusCircle } from "lucide-react";

export function MyTasks() {
  const { data: tasks, isLoading } = useListMyTasks();
  const active = (tasks ?? []).filter((t) => t.status === "open" || t.status === "in_progress");
  const finished = (tasks ?? []).filter((t) => t.status === "completed" || t.status === "cancelled");

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Мои задания</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Задания, которые вы опубликовали для соседей.
          </p>
        </div>
        <Link href="/tasks/new">
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Новое
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <Skeleton className="h-72" />
      ) : (
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Активные ({active.length})</TabsTrigger>
            <TabsTrigger value="finished">Завершённые ({finished.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-4">
            {active.length === 0 ? (
              <Card>
                <EmptyState
                  icon={Inbox}
                  title="Нет активных заданий"
                  description="Опубликуйте новое задание — соседи увидят его в ленте."
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
                {active.map((t) => (
                  <TaskCard key={t.id} task={t} showOwner={false} showExecutor />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="finished" className="mt-4">
            {finished.length === 0 ? (
              <Card>
                <EmptyState
                  icon={Inbox}
                  title="Здесь пока пусто"
                  description="Завершённые задания будут появляться в этой вкладке."
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {finished.map((t) => (
                  <TaskCard key={t.id} task={t} showOwner={false} showExecutor />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
