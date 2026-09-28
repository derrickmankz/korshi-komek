import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  authLogin,
  authRegister,
  authDemo,
  resendVerification,
  getGetMeQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { CITIES, CUSTOM_CITY_VALUE } from "@/lib/cities";

function extractMessage(err: unknown): string | null {
  if (err && typeof err === "object" && "data" in err) {
    const data = (err as { data: unknown }).data;
    if (data && typeof data === "object" && "error" in data) {
      const msg = (data as { error: unknown }).error;
      if (typeof msg === "string") return msg;
    }
  }
  if (err instanceof Error) return err.message;
  return null;
}

type Tab = "login" | "register";

function LoginForm({ onSuccess }: { onSuccess: () => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await authLogin({ email: email.trim(), password });
      toast.success("Добро пожаловать!");
      await onSuccess();
    } catch (err) {
      toast.error(extractMessage(err) ?? "Неверный логин или пароль");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          autoFocus
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="login-password">Пароль</Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="············"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Войти
      </Button>
    </form>
  );
}

function RegisterForm({ onRegistered }: { onRegistered: (email: string) => void }) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [showAddress, setShowAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const cityName = city === CUSTOM_CITY_VALUE ? customCity.trim() : city.trim();
    if (!cityName) {
      toast.error("Выберите город");
      return;
    }
    if (!email.trim()) {
      toast.error("Укажите email");
      return;
    }
    setSubmitting(true);
    try {
      await authRegister({
        name: name.trim(),
        city: cityName,
        email: email.trim(),
        password,
        addressLine: address.trim() || undefined,
      });
      onRegistered(email.trim().toLowerCase());
    } catch (err) {
      if (
        err &&
        typeof err === "object" &&
        "data" in err &&
        (err as { data?: { emailVerificationRequired?: boolean } }).data
          ?.emailVerificationRequired
      ) {
        onRegistered(email.trim().toLowerCase());
      }
      toast.error(extractMessage(err) ?? "Не удалось зарегистрироваться");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="reg-name">Имя</Label>
        <Input
          id="reg-name"
          autoFocus
          autoComplete="name"
          placeholder="Алия Жумабай"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reg-city">Город</Label>
        <select
          id="reg-city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">— выберите город —</option>
          {CITIES.map((c) => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
          <option value={CUSTOM_CITY_VALUE}>— моего города нет в списке —</option>
        </select>
      </div>

      {city === CUSTOM_CITY_VALUE && (
        <div className="space-y-1.5">
          <Label htmlFor="reg-custom-city">Название города</Label>
          <Input
            id="reg-custom-city"
            placeholder="Например, Риддер"
            value={customCity}
            onChange={(e) => setCustomCity(e.target.value)}
            required
            maxLength={100}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="reg-email">Email</Label>
        <Input
          id="reg-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reg-password">Пароль</Label>
        <Input
          id="reg-password"
          type="password"
          autoComplete="new-password"
          placeholder="не короче 6 символов"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>

      {!showAddress ? (
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setShowAddress(true)}
        >
          + Добавить адрес дома
        </button>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="reg-address">Адрес дома</Label>
          <Input
            id="reg-address"
            autoComplete="street-address"
            placeholder="мкр. Самал-2, д. 33"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Создать аккаунт
      </Button>
    </form>
  );
}

function VerificationNotice({
  email,
  onBack,
}: {
  email: string;
  onBack: () => void;
}) {
  const [resending, setResending] = useState(false);

  const resend = async () => {
    if (resending) return;
    setResending(true);
    try {
      const result = await resendVerification({ email });
      toast.success(result.message);
    } catch (err) {
      toast.error(extractMessage(err) ?? "Не удалось отправить письмо повторно");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-5 text-center">
      <div>
        <h2 className="text-lg font-semibold">Проверьте почту</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Мы отправили ссылку для подтверждения на{" "}
          <span className="font-medium text-foreground break-all">{email}</span>.
          После подтверждения можно войти в аккаунт.
        </p>
      </div>
      <div className="space-y-2">
        <Button type="button" className="w-full" onClick={resend} disabled={resending}>
          {resending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Отправить письмо ещё раз
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
          Вернуться к регистрации
        </Button>
      </div>
    </div>
  );
}

function DemoButton({ onSuccess }: { onSuccess: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await authDemo();
      toast.success("Вы вошли как демо-пользователь");
      await onSuccess();
    } catch (err) {
      toast.error(extractMessage(err) ?? "Не удалось войти");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button variant="outline" className="w-full" onClick={handle} disabled={loading}>
      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
      Войти как демо-пользователь
    </Button>
  );
}

export function AuthScreen() {
  const [tab, setTab] = useState<Tab>("login");
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const qc = useQueryClient();

  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("email_verified");
    if (status === "success") {
      toast.success("Email подтверждён. Теперь можно войти.");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (status === "invalid") {
      toast.error("Ссылка подтверждения недействительна или устарела.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const onSuccess = async () => {
    await qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-primary font-bold text-2xl leading-tight">
            Көрші көмек
            <br />
            Помощь соседа
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Соседская помощь рядом с домом
          </p>
        </div>

        <div className="bg-background rounded-2xl shadow-sm border p-6">
          <div className="flex rounded-lg bg-muted/50 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setVerificationEmail(null);
              }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === "login"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Войти
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setVerificationEmail(null);
              }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                tab === "register"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Регистрация
            </button>
          </div>

          {tab === "login" ? (
            <LoginForm onSuccess={onSuccess} />
          ) : verificationEmail ? (
            <VerificationNotice
              email={verificationEmail}
              onBack={() => setVerificationEmail(null)}
            />
          ) : (
            <RegisterForm onRegistered={setVerificationEmail} />
          )}

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground bg-background px-2">
              или
            </div>
          </div>

          <DemoButton onSuccess={onSuccess} />
        </div>
      </div>
    </div>
  );
}
