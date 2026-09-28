import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useAdminListUsers,
  useAdminDeleteUser,
  useAdminUpdateUser,
  adminWalletCredit,
  getAdminListUsersQueryKey,
} from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Search,
  Star,
  ShieldCheck,
  Pencil,
  Trash2,
  Loader2,
  Wallet,
} from "lucide-react";
import { relativeTimeRu } from "@/lib/format";
import { Link } from "wouter";

function WalletCreditDialog({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountTenge = parseInt(amount, 10);
    if (!amountTenge || amountTenge === 0) {
      toast.error("Введите сумму");
      return;
    }
    setLoading(true);
    try {
      await adminWalletCredit({
        userId: user.id,
        amountTenge,
        description: desc.trim() || undefined,
      });
      toast.success(
        amountTenge > 0
          ? `Кошелёк пополнен на ${amountTenge.toLocaleString("ru-RU")} ₸`
          : `Списано ${Math.abs(amountTenge).toLocaleString("ru-RU")} ₸`
      );
      setOpen(false);
      setAmount("");
      setDesc("");
      void qc.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
    } catch (err) {
      const msg =
        err && typeof err === "object" && "data" in err
          ? ((err as { data: { error?: string } }).data?.error ?? "Ошибка")
          : "Ошибка";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Wallet className="h-3.5 w-3.5" />
          Кошелёк
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Кошелёк — {user.name}</DialogTitle>
        </DialogHeader>
        <div className="py-1">
          <p className="text-sm text-muted-foreground mb-4">
            Текущий баланс:{" "}
            <span className="font-semibold text-foreground">
              {(user.walletBalanceTenge ?? 0).toLocaleString("ru-RU")} ₸
            </span>
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="wc-amount">
                Сумма в ₸{" "}
                <span className="text-xs text-muted-foreground">(−  для списания)</span>
              </Label>
              <Input
                id="wc-amount"
                type="number"
                placeholder="5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wc-desc">
                Комментарий{" "}
                <span className="text-xs text-muted-foreground">(необязательно)</span>
              </Label>
              <Input
                id="wc-desc"
                placeholder="Kaspi, +77001234567"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Отмена
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Применить
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [address, setAddress] = useState(user.addressLine ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [isAdmin, setIsAdmin] = useState(user.isAdmin);
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const updateMut = useAdminUpdateUser({
    mutation: {
      onSuccess: () => {
        toast.success("Пользователь обновлён");
        setOpen(false);
        void qc.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
      },
      onError: (e: unknown) => toast.error((e as Error).message),
    },
  });

  function handleSave() {
    if (name.trim().length < 2) {
      toast.error("Имя должно быть не короче 2 символов");
      return;
    }
    if (password && password.length < 6) {
      toast.error("Пароль должен быть не короче 6 символов");
      return;
    }
    if (password && password !== confirmPwd) {
      toast.error("Пароли не совпадают");
      return;
    }

    const data: Record<string, unknown> = {
      name: name.trim(),
      username: username.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      addressLine: address.trim() || null,
      bio: bio.trim() || null,
      isAdmin,
    };
    if (password) data["password"] = password;

    updateMut.mutate({ id: user.id, data });
  }

  function handleOpen(v: boolean) {
    setOpen(v);
    if (v) {
      setName(user.name);
      setUsername(user.username ?? "");
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
      setAddress(user.addressLine ?? "");
      setBio(user.bio ?? "");
      setIsAdmin(user.isAdmin);
      setPassword("");
      setConfirmPwd("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Pencil className="h-3.5 w-3.5" />
          Изменить
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать пользователя</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="u-name">Имя</Label>
              <Input
                id="u-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Полное имя"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-username">Никнейм</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  @
                </span>
                <Input
                  id="u-username"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                    )
                  }
                  placeholder="username"
                  className="pl-7"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="u-email">Email</Label>
              <Input
                id="u-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-phone">Телефон</Label>
              <Input
                id="u-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 777 000 00 00"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="u-address">Адрес</Label>
            <Input
              id="u-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="ул. Абая, 10, кв. 25"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="u-bio">О себе</Label>
            <Textarea
              id="u-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Краткая информация..."
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/40">
            <div>
              <p className="text-sm font-medium">Права администратора</p>
              <p className="text-xs text-muted-foreground">
                Доступ к панели управления
              </p>
            </div>
            <Switch checked={isAdmin} onCheckedChange={setIsAdmin} />
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium mb-3">Сменить пароль</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="u-pwd">Новый пароль</Label>
                <Input
                  id="u-pwd"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Минимум 6 символов"
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="u-pwd2">Повторите</Label>
                <Input
                  id="u-pwd2"
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Повторите пароль"
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Отмена</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={updateMut.isPending}>
            {updateMut.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AdminUsers() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useAdminListUsers(
    query ? { search: query } : {},
  );

  const deleteMut = useAdminDeleteUser({
    mutation: {
      onSuccess: () => {
        toast.success("Пользователь удалён");
        void qc.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
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
        <h1 className="text-2xl font-bold">Пользователи</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Управление аккаунтами пользователей платформы
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <Input
          placeholder="Поиск по имени, email, телефону или никнейму..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
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

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Загрузка...</span>
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Пользователи не найдены
        </p>
      ) : (
        <div>
          <p className="text-xs text-muted-foreground mb-3">
            {users.length} пользователей
          </p>
          <div className="space-y-2">
            {users.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <Avatar className="h-10 w-10 border border-primary/20 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/users/${user.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {user.name}
                      </Link>
                      {user.username && (
                        <span className="text-xs text-muted-foreground font-mono">
                          @{user.username}
                        </span>
                      )}
                      {user.isAdmin && (
                        <Badge
                          variant="outline"
                          className="text-xs text-primary border-primary/40 bg-primary/5"
                        >
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Администратор
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                      {user.email && <span>{user.email}</span>}
                      {user.phone && <span>{user.phone}</span>}
                      {user.addressLine && (
                        <span className="truncate max-w-[200px]">
                          {user.addressLine}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-primary text-primary" />
                        {user.rating.toFixed(1)} · {user.completedJobs} выполн.
                      </span>
                      <span>Рег. {relativeTimeRu(user.joinedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                    <WalletCreditDialog user={user} />
                    <EditUserDialog user={user} />

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Аккаунт «{user.name}» будет удалён, а все его
                            активные задания — отменены. Это действие необратимо.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteMut.mutate({ id: user.id })}
                          >
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
