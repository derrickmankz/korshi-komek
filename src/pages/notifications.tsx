import { useEffect } from "react";
import { Link } from "wouter";
import { useGetMyNotifications } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, CheckCircle2, Star, Zap, Clock, Info } from "lucide-react";
import { relativeTimeRu } from "@/lib/format";
import { NOTIF_LAST_SEEN_KEY } from "@/lib/notifBadge";

const kindIcon: Record<string, React.ReactNode> = {
  task_created: <Zap className="h-4 w-4 text-secondary" />,
  task_accepted: <CheckCircle2 className="h-4 w-4 text-primary" />,
  task_ready: <Clock className="h-4 w-4 text-amber-500" />,
  task_completed: <CheckCircle2 className="h-4 w-4 text-primary" />,
  task_cancelled: <Info className="h-4 w-4 text-destructive" />,
  review_posted: <Star className="h-4 w-4 text-primary fill-primary" />,
};

export function Notifications() {
  const { data, isLoading } = useGetMyNotifications();
  const events = data?.events ?? [];

  useEffect(() => {
    localStorage.setItem(NOTIF_LAST_SEEN_KEY, new Date().toISOString());
    window.dispatchEvent(new Event("notif-seen"));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Уведомления</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        События по заданиям, в которых вы участвуете.
      </p>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          <Info className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
          Пока нет уведомлений. Создайте задание или откликнитесь на чужое.
        </Card>
      ) : (
        <div className="space-y-2">
          {events.map((e) => (
            <Card key={e.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {kindIcon[e.kind] ?? <Info className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  {e.taskId ? (
                    <Link
                      href={`/tasks/${e.taskId}`}
                      className="text-sm hover:text-primary transition-colors"
                    >
                      {e.message}
                    </Link>
                  ) : (
                    <p className="text-sm">{e.message}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                  {relativeTimeRu(e.createdAt)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
