import { useState } from "react";
import {
  useGetTelegramStatus,
  useCreateTelegramLinkToken,
  useUnlinkTelegram,
  getGetTelegramStatusQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, CheckCircle2, Copy, RotateCw } from "lucide-react";
import { toast } from "sonner";

export function TelegramLinkCard() {
  const qc = useQueryClient();
  const { data, isLoading } = useGetTelegramStatus();
  const createToken = useCreateTelegramLinkToken();
  const unlink = useUnlinkTelegram();
  const [polling, setPolling] = useState(false);

  function refresh() {
    void qc.invalidateQueries({ queryKey: getGetTelegramStatusQueryKey() });
  }

  async function handleGenerate() {
    await createToken.mutateAsync();
    refresh();
    setPolling(true);
    const interval = setInterval(() => {
      refresh();
    }, 3000);
    setTimeout(() => {
      clearInterval(interval);
      setPolling(false);
    }, 120_000);
  }

  async function handleUnlink() {
    await unlink.mutateAsync();
    refresh();
    toast.success("Telegram отвязан");
  }

  function copyToken(token: string) {
    void navigator.clipboard.writeText(token);
    toast.success("Код скопирован");
  }

  if (isLoading || !data) {
    return (
      <Card className="p-5">
        <Skeleton className="h-32" />
      </Card>
    );
  }

  if (!data.configured) {
    return null;
  }

  if (data.linked) {
    return (
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
            <Send className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold">Telegram привязан</h3>
              <span className="inline-flex items-center gap-1 text-xs text-secondary">
                <CheckCircle2 className="h-3.5 w-3.5" />
                уведомления включены
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Бот @{data.botUsername} будет писать вам про новые отклики, принятые
              сделки и отзывы.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={handleUnlink}
              disabled={unlink.isPending}
            >
              Отвязать Telegram
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Send className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold">Получать уведомления в Telegram</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Бот @{data.botUsername} будет писать в Telegram про новые отклики на
            ваши задания, принятые сделки и отзывы.
          </p>

          {!data.linkToken ? (
            <Button
              className="mt-3"
              onClick={handleGenerate}
              disabled={createToken.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              Привязать Telegram
            </Button>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Шаг 1. Откройте бота
                </p>
                <a
                  href={data.linkUrl ?? `https://t.me/${data.botUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  <Send className="h-4 w-4" />
                  Открыть @{data.botUsername} в Telegram
                </a>
                <p className="text-xs text-muted-foreground mt-3 mb-2 uppercase tracking-wide">
                  Шаг 2. Если код не подставился — отправьте боту
                </p>
                <div className="flex items-center gap-2">
                  <code className="px-3 py-2 rounded-md bg-background border font-mono text-sm flex-1">
                    /start {data.linkToken}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToken(`/start ${data.linkToken}`)}
                    title="Скопировать"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {polling ? (
                  <span className="inline-flex items-center gap-2">
                    <RotateCw className="h-3.5 w-3.5 animate-spin" />
                    Ждём подтверждения от Telegram…
                  </span>
                ) : (
                  <Button variant="ghost" size="sm" onClick={refresh}>
                    <RotateCw className="h-3.5 w-3.5 mr-2" />
                    Я уже нажал Start
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
