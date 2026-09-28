import { useState, useRef, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useGetTask,
  useGetMe,
  useCreateOffer,
  useAcceptOffer,
  useMarkTaskReady,
  useCompleteTask,
  useConfirmPayment,
  useCancelTask,
  useCreateReview,
  useListTaskMessages,
  useSendTaskMessage,
  getGetTaskQueryKey,
  getListTasksQueryKey,
  getListMyTasksQueryKey,
  getListMyJobsQueryKey,
  getGetWalletQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetRecentActivityQueryKey,
} from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { CategoryIcon } from "@/components/CategoryIcon";
import { UserBadge } from "@/components/UserBadge";
import { EscrowPanel } from "@/components/EscrowPanel";
import { RatingStars } from "@/components/RatingStars";
import { categoryLabels, statusLabels, formatTenge, formatDistance } from "@/lib/labels";
import { relativeTimeRu, formatDateRu } from "@/lib/format";
import { MapPin, Clock, ChevronLeft, Check, X, Star, ShieldCheck, MessageSquare, BellRing, Hourglass, Banknote, Copy, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const statusBadgeClass: Record<string, string> = {
  open: "bg-secondary/15 text-secondary border-secondary/30",
  in_progress: "bg-primary/15 text-primary border-primary/30",
  awaiting_payment: "bg-amber-100 text-amber-700 border-amber-300",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

export function TaskDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id!;
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { data: detail, isLoading } = useGetTask(id);
  const { data: me } = useGetMe();

  function invalidateAll() {
    qc.invalidateQueries({ queryKey: getGetTaskQueryKey(id) });
    qc.invalidateQueries({ queryKey: getListTasksQueryKey() });
    qc.invalidateQueries({ queryKey: getListMyTasksQueryKey() });
    qc.invalidateQueries({ queryKey: getListMyJobsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetWalletQueryKey() });
    qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    qc.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });
  }

  const acceptMut = useAcceptOffer({
    mutation: {
      onSuccess: () => { toast.success("Отклик принят, средства заморожены"); invalidateAll(); },
      onError: (e: unknown) => toast.error(`Ошибка: ${(e as Error).message}`),
    },
  });
  const completeMut = useCompleteTask({
    mutation: {
      onSuccess: () => { toast.success("Работа принята — переведите оплату исполнителю"); invalidateAll(); },
      onError: (e: unknown) => toast.error(`Ошибка: ${(e as Error).message}`),
    },
  });
  const confirmPayMut = useConfirmPayment({
    mutation: {
      onSuccess: () => { toast.success("Оплата подтверждена, задание завершено"); invalidateAll(); },
      onError: (e: unknown) => toast.error(`Ошибка: ${(e as Error).message}`),
    },
  });
  const readyMut = useMarkTaskReady({
    mutation: {
      onSuccess: () => { toast.success("Заказчику отправлено уведомление о выполнении"); invalidateAll(); },
      onError: (e: unknown) => toast.error(`Ошибка: ${(e as Error).message}`),
    },
  });
  const cancelMut = useCancelTask({
    mutation: {
      onSuccess: () => { toast.info("Задание отменено"); invalidateAll(); navigate("/"); },
      onError: (e: unknown) => toast.error(`Ошибка: ${(e as Error).message}`),
    },
  });

  if (isLoading || !detail) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const { task, offers, escrow } = detail;
  const isOwner = me?.id === task.owner.id;
  const isExecutor = me?.id === task.executor?.id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ChevronLeft className="h-4 w-4 mr-1" />
        К ленте заданий
      </Link>

      <Card className="p-6 sm:p-8 mb-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <CategoryIcon category={task.category} className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={cn(statusBadgeClass[task.status])}>
                {statusLabels[task.status]}
              </Badge>
              <Badge variant="secondary">{categoryLabels[task.category]}</Badge>
              {task.useEscrow && (
                <Badge variant="outline" className="text-secondary border-secondary/40 bg-secondary/5">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Безопасная сделка
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-3">{task.title}</h1>
            <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-bold text-primary">{formatTenge(task.priceTenge)}</div>
            <div className="text-xs text-muted-foreground mt-1">базовая цена</div>
          </div>
        </div>

        <Separator className="my-5" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <div>{task.address}</div>
              <div className="text-xs text-muted-foreground">{formatDistance(task.distanceMeters)} от вас</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <div>Опубликовано {relativeTimeRu(task.createdAt)}</div>
              {task.deadline && (
                <div className="text-xs text-muted-foreground">До {formatDateRu(task.deadline)}</div>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-5" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Заказчик</div>
            <UserBadge user={task.owner} showRating />
          </div>
          {task.executor && (
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Исполнитель</div>
              <UserBadge user={task.executor} showRating />
            </div>
          )}
        </div>
      </Card>

      <div className="mb-5">
        <EscrowPanel escrow={escrow} priceTenge={task.priceTenge} />
      </div>

      {isOwner && task.status === "in_progress" && (
        <Card
          className={cn(
            "p-5 mb-5",
            task.awaitingReview
              ? "border-secondary/40 bg-secondary/5"
              : "border-primary/30 bg-primary/5",
          )}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              {task.awaitingReview ? (
                <BellRing className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
              ) : null}
              <div>
                <h3 className="font-medium mb-0.5">
                  {task.awaitingReview
                    ? `${task.executor?.name ?? "Исполнитель"} отметил выполненным`
                    : "Задание в работе"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {task.awaitingReview
                    ? "Проверьте результат. Если всё хорошо — примите работу и перейдёте к оплате."
                    : `Когда ${task.executor?.name ?? "исполнитель"} закончит — он нажмёт «Я закончил» и вы получите уведомление.`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => cancelMut.mutate({ id })} disabled={cancelMut.isPending}>
                <X className="h-4 w-4 mr-2" />
                Отменить
              </Button>
              {task.awaitingReview && (
                <Button onClick={() => completeMut.mutate({ id })} disabled={completeMut.isPending}>
                  <Check className="h-4 w-4 mr-2" />
                  Работа принята
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {isOwner && task.status === "awaiting_payment" && (
        <Card className="p-5 mb-5 border-amber-300 bg-amber-50">
          <div className="flex items-start gap-3 mb-4">
            <Banknote className="h-5 w-5 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium mb-0.5 text-amber-900">Переведите оплату исполнителю</h3>
              <p className="text-sm text-amber-800">
                После вашего перевода нажмите кнопку ниже — задание закроется и откроется форма отзыва. Карма исполнителя обновится только после подтверждения.
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-amber-200 p-4 mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Сумма</span>
              <span className="text-lg font-bold text-primary">
                {task.paymentAmount ? formatTenge(task.paymentAmount) : formatTenge(task.priceTenge)}
              </span>
            </div>
            {task.paymentPhone ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">Номер телефона</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium">{task.paymentPhone}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      void navigator.clipboard.writeText(task.paymentPhone!);
                      toast.success("Номер скопирован");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-amber-700">
                Попросите исполнителя добавить номер телефона в профиль.
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {task.paymentPhone && (
              <Button
                variant="outline"
                className="border-amber-400 text-amber-800 hover:bg-amber-100"
                onClick={() => {
                  window.open(`https://kaspi.kz/pay`, "_blank");
                }}
              >
                Открыть Kaspi
              </Button>
            )}
            <Button
              onClick={() => confirmPayMut.mutate({ id })}
              disabled={confirmPayMut.isPending}
            >
              <Check className="h-4 w-4 mr-2" />
              Я оплатил через Kaspi / Halyk
            </Button>
          </div>
        </Card>
      )}

      {isExecutor && task.status === "awaiting_payment" && (
        <Card className="p-5 mb-5 border-amber-300 bg-amber-50">
          <div className="flex items-start gap-3">
            <Hourglass className="h-5 w-5 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-medium mb-0.5 text-amber-900">Ждём оплаты от заказчика</h3>
              <p className="text-sm text-amber-800">
                Заказчик принял вашу работу и должен перевести{" "}
                <b>{task.paymentAmount ? formatTenge(task.paymentAmount) : formatTenge(task.priceTenge)}</b>{" "}
                через Kaspi или Halyk Bank на ваш номер телефона.
                {!task.executor?.phone && " Добавьте номер в профиль — без него заказчик не сможет перевести деньги."}
              </p>
            </div>
          </div>
        </Card>
      )}

      {isExecutor && task.status === "in_progress" && (
        <Card
          className={cn(
            "p-5 mb-5",
            task.awaitingReview
              ? "border-secondary/40 bg-secondary/5"
              : "border-primary/30",
          )}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              {task.awaitingReview ? (
                <Hourglass className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
              ) : null}
              <div>
                <h3 className="font-medium mb-0.5">
                  {task.awaitingReview ? "Ждём проверки заказчика" : "Вы — исполнитель"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {task.awaitingReview
                    ? `Заказчику пришло уведомление. Как только ${task.owner.name} примет работу — придёт оплата через Kaspi/Halyk.`
                    : "Закончили? Отметьте задание выполненным — заказчик получит уведомление."}
                </p>
              </div>
            </div>
            {!task.awaitingReview && (
              <Button
                onClick={() => readyMut.mutate({ id })}
                disabled={readyMut.isPending}
              >
                <Check className="h-4 w-4 mr-2" />
                Я закончил, ждёт проверки
              </Button>
            )}
          </div>
        </Card>
      )}

      {isOwner && task.status === "open" && (
        <Card className="p-5 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Это ваше задание</h3>
              <p className="text-sm text-muted-foreground">Выберите подходящий отклик ниже.</p>
            </div>
            <Button variant="outline" onClick={() => cancelMut.mutate({ id })} disabled={cancelMut.isPending}>
              <X className="h-4 w-4 mr-2" />
              Снять с публикации
            </Button>
          </div>
        </Card>
      )}

      {!isOwner && task.status === "open" && (
        <OfferForm taskId={id} basePrice={task.priceTenge} />
      )}

      {isOwner && task.status === "completed" && task.executor && (
        <ReviewForm taskId={id} toUserId={task.executor.id} executorName={task.executor.name} />
      )}

      {(isOwner || isExecutor) && task.executor && task.status !== "cancelled" && me && (
        <TaskChat taskId={id} myId={me.id} />
      )}

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Отклики ({offers.length})
        </h2>
        {offers.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            Пока никто не откликнулся.
          </Card>
        ) : (
          <div className="space-y-3">
            {offers.map((o) => {
              const isAccepted = o.status === "accepted";
              const isDeclined = o.status === "declined";
              return (
                <Card key={o.id} className={cn("p-4", isAccepted && "border-primary/40 bg-primary/5", isDeclined && "opacity-60")}>
                  <div className="flex items-start justify-between gap-3">
                    <UserBadge user={o.executor} showRating />
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{formatTenge(o.priceTenge)}</div>
                      <div className="text-xs text-muted-foreground">{relativeTimeRu(o.createdAt)}</div>
                    </div>
                  </div>
                  {o.message && (
                    <p className="text-sm mt-2 text-muted-foreground">{o.message}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <Badge variant="outline" className="text-xs">
                      {o.status === "pending" && "Ожидает"}
                      {o.status === "accepted" && "Принят"}
                      {o.status === "declined" && "Отклонён"}
                    </Badge>
                    {isOwner && task.status === "open" && o.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => acceptMut.mutate({ id, data: { offerId: o.id } })}
                        disabled={acceptMut.isPending}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Принять
                      </Button>
                    )}
                    {isExecutor && o.status === "accepted" && (
                      <span className="text-xs text-secondary inline-flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Вы — исполнитель
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function TaskChat({ taskId, myId }: { taskId: string; myId: string }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, refetch } = useListTaskMessages(taskId);
  const messages = data?.messages ?? [];

  const { mutateAsync: sendMsg } = useSendTaskMessage();

  useEffect(() => {
    const iv = setInterval(() => { void refetch(); }, 5000);
    return () => clearInterval(iv);
  }, [refetch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await sendMsg({ id: taskId, data: { text: text.trim() } });
      setText("");
    } catch {
      toast.error("Не удалось отправить сообщение");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="mb-5 overflow-hidden">
      <div className="px-5 py-3 border-b flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-semibold text-sm">Чат</h2>
        <span className="text-xs text-muted-foreground">— только заказчик и исполнитель</span>
      </div>
      <div className="px-4 py-3 max-h-72 overflow-y-auto space-y-2">
        {messages.length === 0 ? (
          <p className="text-sm text-center text-muted-foreground py-4">
            Напишите первое сообщение, чтобы уточнить детали
          </p>
        ) : (
          messages.map((m) => {
            const isOwn = m.fromUserId === myId;
            return (
              <div key={m.id} className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
                {!isOwn && (
                  <span className="text-[11px] text-muted-foreground mb-0.5 ml-1">
                    {m.fromUserName}
                  </span>
                )}
                <div
                  className={cn(
                    "inline-block max-w-[78%] rounded-2xl px-3.5 py-2 text-sm break-words leading-snug",
                    isOwn
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm",
                  )}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5 mx-1">
                  {relativeTimeRu(m.createdAt)}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={(e) => { void handleSend(e); }}
        className="px-4 py-3 border-t flex gap-2 items-center"
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Сообщение..."
          className="flex-1"
          maxLength={2000}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend(e as unknown as React.FormEvent);
            }
          }}
        />
        <Button type="submit" size="icon" disabled={sending || !text.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}

function OfferForm({ taskId, basePrice }: { taskId: string; basePrice: number }) {
  const qc = useQueryClient();
  const [price, setPrice] = useState(String(basePrice));
  const [message, setMessage] = useState("");

  const { mutate, isPending } = useCreateOffer({
    mutation: {
      onSuccess: () => {
        toast.success("Отклик отправлен");
        setMessage("");
        qc.invalidateQueries({ queryKey: getGetTaskQueryKey(taskId) });
      },
      onError: (e: unknown) => toast.error(`Ошибка: ${(e as Error).message}`),
    },
  });

  return (
    <Card className="p-5 mb-5 border-primary/30">
      <h3 className="font-medium mb-3">Откликнуться на задание</h3>
      <div className="space-y-3">
        <div>
          <Label className="text-sm mb-1.5 block">Ваша цена, ₸</Label>
          <Input
            type="number"
            min={100}
            step={100}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div>
          <Label className="text-sm mb-1.5 block">Сообщение заказчику</Label>
          <Textarea
            rows={3}
            placeholder="Расскажите, как именно вы поможете и когда будете свободны."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <Button
          className="w-full"
          disabled={isPending || Number(price) < 100}
          onClick={() =>
            mutate({
              id: taskId,
              data: { priceTenge: Number(price), message: message || undefined },
            })
          }
        >
          {isPending ? "Отправляем..." : "Отправить отклик"}
        </Button>
      </div>
    </Card>
  );
}

function ReviewForm({
  taskId,
  toUserId,
  executorName,
}: {
  taskId: string;
  toUserId: string;
  executorName: string;
}) {
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { mutate, isPending, isSuccess } = useCreateReview({
    mutation: {
      onSuccess: () => {
        toast.success("Спасибо за отзыв");
        qc.invalidateQueries({ queryKey: getGetTaskQueryKey(taskId) });
      },
      onError: (e: unknown) => toast.error(`Ошибка: ${(e as Error).message}`),
    },
  });

  if (isSuccess) {
    return (
      <Card className="p-5 mb-5 border-secondary/30 bg-secondary/5">
        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-secondary" />
          Отзыв отправлен.
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 mb-5">
      <h3 className="font-medium mb-1">Оцените {executorName}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Ваш отзыв помогает соседям понимать, кому доверять.
      </p>
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)}>
            <Star
              className={cn(
                "h-7 w-7 transition-colors",
                n <= rating ? "text-primary" : "text-muted-foreground/30",
              )}
              fill="currentColor"
              strokeWidth={0}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          <RatingStars rating={rating} showValue size={14} />
        </span>
      </div>
      <Textarea
        rows={3}
        placeholder="Поделитесь впечатлением (необязательно)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="mb-3"
      />
      <Button
        onClick={() => mutate({ id: taskId, data: { toUserId, rating, comment: comment || undefined } })}
        disabled={isPending}
      >
        {isPending ? "Отправляем..." : "Оставить отзыв"}
      </Button>
    </Card>
  );
}
