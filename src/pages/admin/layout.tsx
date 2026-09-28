import { ReactNode, useEffect } from "react";
import { Link, useLocation, Redirect } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useGetMe,
  authLogout,
  getGetMeQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Loader2, LayoutDashboard, Users, ListTodo, ChevronLeft, ShieldCheck, Menu, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {label}
      </div>
    </Link>
  );
}

function SidebarContent() {
  const [location] = useLocation();
  const { data: me } = useGetMe();
  const qc = useQueryClient();

  const handleLogout = async () => {
    try {
      await authLogout();
      await qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
      toast.success("Вы вышли из аккаунта");
    } catch {
      toast.error("Не удалось выйти");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-4 py-5 border-b">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">Администратор</p>
          <p className="text-xs text-muted-foreground mt-0.5">Панель управления</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <NavItem
          href="/admin"
          icon={LayoutDashboard}
          label="Дашборд"
          active={location === "/admin"}
        />
        <NavItem
          href="/admin/users"
          icon={Users}
          label="Пользователи"
          active={location.startsWith("/admin/users")}
        />
        <NavItem
          href="/admin/tasks"
          icon={ListTodo}
          label="Задания"
          active={location.startsWith("/admin/tasks")}
        />
      </nav>

      <div className="p-3 border-t space-y-1">
        <Link href="/">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
            <ChevronLeft className="h-4 w-4" />
            В приложение
          </div>
        </Link>
        {me && (
          <button
            onClick={() => void handleLogout()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        )}
      </div>
    </div>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const { data: me, isLoading } = useGetMe();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!me?.isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex bg-muted/20">
      <aside className="hidden md:flex flex-col w-56 bg-background border-r shrink-0 fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b h-14 flex items-center px-4 gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Панель администратора</span>
        </div>
      </div>

      <main className="flex-1 md:ml-56 pt-14 md:pt-0 min-w-0">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
