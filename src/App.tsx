import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGetMe } from "@workspace/api-client-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Layout } from "@/components/layout";
import { Home } from "@/pages/home";
import { NewTask } from "@/pages/new-task";
import { TaskDetail } from "@/pages/task-detail";
import { MyTasks } from "@/pages/my-tasks";
import { MyJobs } from "@/pages/my-jobs";
import { Wallet } from "@/pages/wallet";
import { Profile } from "@/pages/profile";
import { AuthScreen } from "@/pages/auth";
import { AdminLayout } from "@/pages/admin/layout";
import { AdminDashboard } from "@/pages/admin/dashboard";
import { AdminUsers } from "@/pages/admin/users";
import { AdminTasks } from "@/pages/admin/tasks";
import { Notifications } from "@/pages/notifications";
import { Loader2 } from "lucide-react";

function statusOf(err: unknown): number | null {
  if (err && typeof err === "object" && "status" in err) {
    const value = (err as { status: unknown }).status;
    return typeof value === "number" ? value : null;
  }
  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (statusOf(error) === 401) return false;
        return failureCount < 2;
      },
    },
  },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const { data: me, isLoading, error } = useGetMe();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!me || statusOf(error) === 401) {
    return <AuthScreen />;
  }

  return <>{children}</>;
}

function Router() {
  const [location] = useLocation();
  const isAdminRoute =
    location === "/admin" || location.startsWith("/admin/");

  if (isAdminRoute) {
    return (
      <AdminLayout>
        <Switch>
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/tasks" component={AdminTasks} />
          <Route component={NotFound} />
        </Switch>
      </AdminLayout>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/tasks/new" component={NewTask} />
        <Route path="/tasks/:id" component={TaskDetail} />
        <Route path="/my/tasks" component={MyTasks} />
        <Route path="/my/jobs" component={MyJobs} />
        <Route path="/wallet" component={Wallet} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/users/:id" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthGate>
            <Router />
          </AuthGate>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
