import { Link } from "wouter";
import { useListMyJobs } from "@workspace/api-client-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/TaskCard";
import { EmptyState } from "@/components/EmptyState";
import { Briefcase, Search } from "lucide-react";

export function MyJobs() {
  const { data: jobs, isLoading } = useListMyJobs();
  const active = (jobs ?? []).filter((t) => t.status === "in_progress");
  const finished = (jobs ?? []).filter((t) => t.status === "completed" || t.status === "cancelled");

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Мои подработки</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Задания, по которым вы — исполнитель.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-72" />
      ) : (
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">В работе ({active.length})</TabsTrigger>
            <TabsTrigger value="finished">История ({finished.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-4">
            {active.length === 0 ? (
              <Card>
                <EmptyState
                  icon={Briefcase}
                  title="Подработок пока нет"
                  description="Найдите задание в ленте и предложите свою цену."
                  action={
                    <Link href="/">
                      <Button>
                        <Search className="h-4 w-4 mr-2" />
                        Открыть ленту
                      </Button>
                    </Link>
                  }
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {active.map((t) => (
                  <TaskCard key={t.id} task={t} showOwner showExecutor={false} />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="finished" className="mt-4">
            {finished.length === 0 ? (
              <Card>
                <EmptyState
                  icon={Briefcase}
                  title="История пока пуста"
                  description="Завершённые подработки будут показаны здесь."
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {finished.map((t) => (
                  <TaskCard key={t.id} task={t} showOwner showExecutor={false} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
