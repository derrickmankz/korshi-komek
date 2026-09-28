import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetUser,
  useGetMe,
  useUpdateMe,
  getGetMeQueryKey,
  getGetUserQueryKey,
} from "@workspace/api-client-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RatingStars } from "@/components/RatingStars";
import { EmptyState } from "@/components/EmptyState";
import { TelegramLinkCard } from "@/components/TelegramLinkCard";
import { pluralRu, relativeTimeRu, formatDateRu } from "@/lib/format";
import { CITIES, CUSTOM_CITY_VALUE, isKnownCity } from "@/lib/cities";
import {
  MessageSquare,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  Pencil,
  X,
  Loader2,
} from "lucide-react";

export function Profile() {
  const params = useParams<{ id: string }>();
  const id = params.id!;
  const { data, isLoading } = useGetUser(id);
  const { data: me } = useGetMe();
  const isOwn = me?.id === id;
  const [editing, setEditing] = useState(false);

  if (isLoading || !data) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-44 mb-4" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  const { user, recentReviews } = data;
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Назад
      </Link>

      <Card className="p-6 sm:p-8 mb-5">
        {editing && isOwn ? (
          <EditForm user={user} onClose={() => setEditing(false)} />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <Avatar className="h-20 w-20 border-2 border-primary/20">
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                  </div>
                  {isOwn && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(true)}
                      className="shrink-0"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      Изменить
                    </Button>
                  )}
                </div>
                {(user.city || user.district) && (
                  <p className="text-sm text-muted-foreground inline-flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {[user.city, user.district].filter(Boolean).join(", ")}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <RatingStars rating={user.rating} size={16} showValue reviewCount={user.reviewCount} />
                  <Badge variant="outline" className="bg-secondary/5 text-secondary border-secondary/30">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {user.completedJobs} {pluralRu(user.completedJobs, ["сделка", "сделки", "сделок"])}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    На платформе с {formatDateRu(user.joinedAt).split(" ").slice(1, 3).join(" ")}
                  </span>
                </div>
              </div>
            </div>
            {user.bio && (
              <p className="text-muted-foreground mt-5 pt-5 border-t">{user.bio}</p>
            )}
          </>
        )}
      </Card>

      {isOwn && (
        <div className="mb-5">
          <TelegramLinkCard />
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Отзывы
        </h2>
        {recentReviews.length === 0 ? (
          <Card>
            <EmptyState
              icon={MessageSquare}
              title="Отзывов пока нет"
              description="Отзывы появляются после выполненных безопасных сделок."
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {recentReviews.map((r) => (
              <Card key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <Link
                    href={`/users/${r.fromUser.id}`}
                    className="text-sm font-medium hover:text-primary"
                  >
                    {r.fromUser.name}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {relativeTimeRu(r.createdAt)}
                  </span>
                </div>
                <RatingStars rating={r.rating} size={14} />
                {r.comment && (
                  <p className="text-sm text-muted-foreground mt-2">{r.comment}</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

type EditableUser = {
  id: string;
  name: string;
  bio?: string | null;
  phone?: string | null;
  city?: string | null;
  addressLine?: string | null;
  district?: string | null;
};

function EditForm({
  user,
  onClose,
}: {
  user: EditableUser;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const updateMe = useUpdateMe();

  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [city, setCity] = useState(
    user.city && !isKnownCity(user.city) ? CUSTOM_CITY_VALUE : user.city ?? "",
  );
  const [customCity, setCustomCity] = useState(
    user.city && !isKnownCity(user.city) ? user.city : "",
  );
  const [address, setAddress] = useState(user.addressLine ?? user.district ?? "");

  const saving = updateMe.isPending;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const cityName = city === CUSTOM_CITY_VALUE ? customCity.trim() : city.trim();
    if (city === CUSTOM_CITY_VALUE && !cityName) {
      toast.error("Укажите название города");
      return;
    }
    try {
      await updateMe.mutateAsync({
        data: {
          name: name.trim(),
          bio: bio.trim() || null,
          phone: phone.trim() || null,
          city: cityName || null,
          addressLine: address.trim() || null,
        },
      });
      await qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
      await qc.invalidateQueries({ queryKey: getGetUserQueryKey(user.id) });
      toast.success("Профиль обновлён");
      onClose();
    } catch (err: unknown) {
      const msg = (err as { data?: { error?: string } })?.data?.error;
      toast.error(msg ?? "Не удалось сохранить изменения");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold text-base">Редактирование профиля</h2>
        <Button type="button" variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-name">Имя</Label>
        <Input
          id="edit-name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-bio">О себе</Label>
        <Textarea
          id="edit-bio"
          placeholder="Несколько слов о себе или своих навыках..."
          className="resize-none"
          rows={3}
          maxLength={500}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-city">Город</Label>
        <select
          id="edit-city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">— не указан —</option>
          {CITIES.map((c) => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
          <option value={CUSTOM_CITY_VALUE}>— моего города нет в списке —</option>
        </select>
      </div>
      {city === CUSTOM_CITY_VALUE && (
        <div className="space-y-1.5">
          <Label htmlFor="edit-custom-city">Название города</Label>
          <Input
            id="edit-custom-city"
            placeholder="Например, Риддер"
            value={customCity}
            onChange={(e) => setCustomCity(e.target.value)}
            required
            maxLength={100}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="edit-phone">Телефон</Label>
          <Input
            id="edit-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+77001234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="edit-address">Адрес дома</Label>
          <Input
            id="edit-address"
            autoComplete="street-address"
            placeholder="мкр. Самал-2, д. 33"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Сохранить
        </Button>
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
