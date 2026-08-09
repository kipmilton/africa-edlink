import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo.jpeg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { t } = useApp();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) throw new Error("Enter a valid email address");
      if (!password) throw new Error("Password is required");
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        toast.success(t("auth.toast.welcome"));
        navigate({ to: "/dashboard" });
      } else {
        if (password.length < 8) throw new Error("Password must be at least 8 characters");
        if (fullName.trim().length < 2) throw new Error("Enter your full name");
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
        toast.success(t("auth.toast.accountCreated"));
        setMode("signin");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] grid place-items-center bg-linear-to-br from-primary/5 via-background to-accent/5 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
        <Link to="/" className="mb-6 flex items-center justify-center">
          <img
            src={logo}
            alt="Serencog Technologies logo"
            className="h-16 w-auto max-w-full rounded-2xl object-contain shadow-sm sm:h-20"
          />
        </Link>
        <h1 className="mb-1 text-center text-2xl font-bold text-foreground">
          {mode === "signin" ? t("auth.title.signin") : t("auth.title.signup")}
        </h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? t("auth.subtitle.signin") : t("auth.subtitle.signup")}
        </p>
        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <Label htmlFor="fullName">{t("auth.fullName")}</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
          )}
          <div>
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="relative">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-2 top-[2.5rem] inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:text-foreground"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Button type="submit" disabled={busy} className="w-full">
            {busy
              ? t("auth.submit.busy")
              : mode === "signin"
                ? t("auth.submit.signin")
                : t("auth.submit.signup")}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? t("auth.switch.new") : t("auth.switch.existing")}{" "}
          <button
            type="button"
            className="font-semibold text-primary hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? t("auth.switch.create") : t("auth.switch.signin")}
          </button>
        </div>
      </div>
    </div>
  );
}