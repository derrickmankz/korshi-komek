import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useCreateTask,
  useGetMe,
  TaskCategory,
  getListTasksQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetRecentActivityQueryKey,
  getListMyTasksQueryKey,
} from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { categoryLabels } from "@/lib/labels";
import { ChevronLeft, MapPin, ShieldCheck } from "lucide-react";
import { LocationPicker } from "@/components/LocationPicker";
import { cityCenter } from "@/lib/cities";

const formSchema = z.object({
  title: z.string().min(5, "Минимум 5 символов").max(120, "Слишком длинно"),
  description: z.string().min(10, "Опишите подробнее (минимум 10 символов)"),
  category: z.enum(Object.values(TaskCategory) as [string, ...string[]]),
  priceTenge: z.coerce.number().int("Только целые тенге").min(100, "Минимум 100 ₸").max(1_000_000, "Слишком много"),
  address: z.string().min(3, "Укажите адрес"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  deadline: z.string().optional(),
  useEscrow: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function NewTask() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { data: me } = useGetMe();

  const { register, handleSubmit, control, watch, setValue, getValues, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: TaskCategory.errand,
      priceTenge: 1500,
      address: "",
      latitude: 43.238,
      longitude: 76.889,
      deadline: "",
      useEscrow: true,
    },
  });

  // Pre-fill coordinates from user's saved city
  useEffect(() => {
    if (!me?.city) return;
    const c = cityCenter(me.city);
    if (c) {
      setValue("latitude", c[0]);
      setValue("longitude", c[1]);
    }
    if (!getValues("address")) {
      setValue("address", me.addressLine ?? me.city);
    }
  }, [getValues, me, setValue]);

  const lat = watch("latitude");
  const lng = watch("longitude");
  const userCityCenter = cityCenter(me?.city) ?? undefined;

  const { mutate, isPending } = useCreateTask({
    mutation: {
      onSuccess: (created) => {
        toast.success("Задание опубликовано");
        qc.invalidateQueries({ queryKey: getListTasksQueryKey() });
        qc.invalidateQueries({ queryKey: getListMyTasksQueryKey() });
        qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        qc.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });
        navigate(`/tasks/${created.id}`);
      },
      onError: (e: unknown) => {
        toast.error(`Не удалось опубликовать: ${(e as Error).message}`);
      },
    },
  });

  const onSubmit = handleSubmit((values) => {
    mutate({
      data: {
        title: values.title,
        description: values.description,
        category: values.category as (typeof TaskCategory)[keyof typeof TaskCategory],
        priceTenge: values.priceTenge,
        address: values.address,
        latitude: values.latitude,
        longitude: values.longitude,
        deadline: values.deadline ? new Date(values.deadline).toISOString() : undefined,
        useEscrow: values.useEscrow,
      },
    });
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ChevronLeft className="h-4 w-4 mr-1" />
        К ленте заданий
      </Link>

      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold mb-1">Новое задание</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Опишите, что нужно сделать. Соседи увидят его в ленте и предложат свою цену.
        </p>

        <form onSubmit={onSubmit} className="space-y-5">
          <Field label="Что нужно сделать" error={errors.title?.message}>
            <Input placeholder="Например: купить лекарство в аптеке" {...register("title")} />
          </Field>

          <Field label="Подробности" error={errors.description?.message}>
            <Textarea
              rows={4}
              placeholder="Опишите детали: где, когда, что именно нужно. Чем подробнее — тем выше шанс быстро найти помощника."
              {...register("description")}
            />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Категория" error={errors.category?.message}>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(TaskCategory).map((c) => (
                        <SelectItem key={c} value={c}>
                          {categoryLabels[c]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Цена, ₸" error={errors.priceTenge?.message}>
              <Input type="number" min={100} step={100} {...register("priceTenge")} />
            </Field>
          </div>

          <Field label="Адрес" error={errors.address?.message}>
            <Input placeholder="ул. Мендикулова 80, подъезд 2" {...register("address")} />
          </Field>

          <div>
            <Label className="text-sm mb-1.5 block flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Место на карте
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Кликните по карте или перетащите маркер, чтобы уточнить расположение задания.
            </p>
            <Controller
              control={control}
              name="latitude"
              render={() => (
                <LocationPicker
                  lat={lat}
                  lng={lng}
                  center={userCityCenter}
                  onChange={(newLat, newLng) => {
                    setValue("latitude", newLat, { shouldValidate: true });
                    setValue("longitude", newLng, { shouldValidate: true });
                  }}
                />
              )}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </p>
            {(errors.latitude?.message || errors.longitude?.message) && (
              <p className="text-xs text-destructive mt-1">{errors.latitude?.message || errors.longitude?.message}</p>
            )}
          </div>

          <Field label="Срок выполнения (необязательно)" error={errors.deadline?.message}>
            <Input type="datetime-local" {...register("deadline")} />
          </Field>

          <div className="rounded-xl border bg-secondary/5 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="escrow" className="font-medium cursor-pointer">
                    Безопасная сделка
                  </Label>
                  <Controller
                    control={control}
                    name="useEscrow"
                    render={({ field }) => (
                      <Switch id="escrow" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Деньги замораживаются на платформе и переводятся исполнителю только после выполнения. Комиссия 7% удерживается из выплаты.
                  Только такие сделки влияют на рейтинг.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Link href="/" className="flex-1">
              <Button type="button" variant="outline" className="w-full">Отмена</Button>
            </Link>
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "Публикуем..." : "Опубликовать"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-sm mb-1.5 block">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
