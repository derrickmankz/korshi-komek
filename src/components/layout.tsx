import { ReactNode, useEffect, useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useGetMe,
  useGetMyNotifications,
  authLogout,
  getGetMeQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Wallet,
  Briefcase,
  PlusCircle,
  User,
  Star,
  Menu,
  LogOut,
  ShieldCheck,
  Bell,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { countUnseen } from "@/lib/notifBadge";

function NotifBell() {
  const { data } = useGetMyNotifications();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const events = data?.events ?? [];
    setCount(countUnseen(events));
  }, [data]);

  useEffect(() => {
    const handler = () => setCount(0);
    window.addEventListener("notif-seen", handler);
    return () => window.removeEventListener("notif-seen", handler);
  }, []);

  return (
    <Link href="/notifications">
      <Button variant="ghost" size="icon" className="relative" title="Уведомления">
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center leading-none">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Button>
    </Link>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { data: me } = useGetMe();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await authLogout();
      await queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      toast.success("Вы вышли из аккаунта");
    } catch {
      toast.error("Не удалось выйти");
    }
  };

  const NavLinks = () => (
    <>
      <Link href="/tasks/new" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
        <PlusCircle className="h-4 w-4" />
        Новое задание
      </Link>
      <Link href="/my/tasks" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
        <Briefcase className="h-4 w-4" />
        Мои задания
      </Link>
      <Link href="/my/jobs" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
        <User className="h-4 w-4" />
        Мои подработки
      </Link>
      <Link href="/wallet" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        Кошелек
      </Link>
      {me?.isAdmin && (
        <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2 text-primary">
          <ShieldCheck className="h-4 w-4" />
          Администратор
        </Link>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col gap-6 w-64 pt-16">
                <NavLinks />
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex flex-col leading-tight">
              <span className="text-primary font-bold text-base sm:text-lg tracking-tight">Көрші көмек</span>
              <span className="text-primary font-bold text-base sm:text-lg tracking-tight">Помощь соседа</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 ml-6">
              <NavLinks />
            </nav>
          </div>

          {me && (
            <div className="flex items-center gap-1 sm:gap-2">
              <NotifBell />
              <div className="hidden sm:flex flex-col items-end ml-1">
                <span className="text-sm font-medium leading-none">{me.name}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  {me.rating.toFixed(1)}
                </span>
              </div>
              <Link href={`/users/${me.id}`}>
                <Avatar className="h-9 w-9 border border-primary/20 hover:border-primary/50 transition-colors cursor-pointer">
                  <AvatarImage src={me.avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">{me.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Выйти"
                aria-label="Выйти"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t py-8 bg-muted/20 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Көрші көмек · Помощь соседа. Локальные услуги.
        </div>
      </footer>
    </div>
  );
}
