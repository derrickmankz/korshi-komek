import { useLocation } from "wouter";
import type { Task } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "./CategoryIcon";
import { UserBadge } from "./UserBadge";
import { categoryLabels, statusLabels, formatTenge, formatDistance } from "@/lib/labels";
import { relativeTimeRu } from "@/lib/format";
import { MapPin, Clock, ShieldCheck, MessageSquare, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  showOwner?: boolean;
  showExecutor?: boolean;
}

const statusBadgeClass: Record<string, string> = {
  open: "bg-secondary/15 text-secondary border-secondary/30",
  in_progress: "bg-primary/15 text-primary border-primary/30",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

export function TaskCard({ task, showOwner = true, showExecutor = false }: TaskCardProps) {
  const [, navigate] = useLocation();
  function open(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("a")) return;
    navigate(`/tasks/${task.id}`);
  }
  return (
    <div onClick={open} role="link" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && navigate(`/tasks/${task.id}`)}>
      <Card className="p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer h-full flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <CategoryIcon category={task.category} className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h3 className="font-semibold leading-snug line-clamp-2">{task.title}</h3>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <Badge variant="outline" className={cn(statusBadgeClass[task.status])}>
                  {statusLabels[task.status]}
                </Badge>
                {task.awaitingReview && task.status === "in_progress" && (
                  <Badge variant="outline" className="text-secondary border-secondary/40 bg-secondary/5">
                    <Hourglass className="h-3 w-3 mr-1" />
                    Ждёт проверки
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{categoryLabels[task.category]}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {task.address}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {relativeTimeRu(task.createdAt)}
          </span>
          <span>{formatDistance(task.distanceMeters)}</span>
          {task.offerCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {task.offerCount}
            </span>
          )}
        </div>

        <div className="mt-auto pt-2 flex items-center justify-between border-t border-dashed">
          {showOwner && task.owner && <UserBadge user={task.owner} size="sm" />}
          {showExecutor && task.executor && <UserBadge user={task.executor} size="sm" />}
          {!showOwner && !showExecutor && <span />}
          <div className="flex items-center gap-2">
            {task.useEscrow && (
              <Badge variant="outline" className="text-secondary border-secondary/40 bg-secondary/5">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Безопасная сделка
              </Badge>
            )}
            <span className="text-lg font-bold text-primary">{formatTenge(task.priceTenge)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
