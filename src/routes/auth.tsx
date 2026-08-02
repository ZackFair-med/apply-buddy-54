import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { describeAuthError } from "@/lib/auth-errors";
import { processAuthLinkFromUrl, readAuthLinkFromUrl } from "@/lib/auth-link";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in · ApplyPilot" },
      { name: "description", content: "Sign in to ApplyPilot to track your job applications, CVs, and AI-tailored cover letters." },
      { property: "og:title", content: "Sign in · ApplyPilot" },
      { property: "og:description", content: "Sign in to ApplyPilot." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const probe = async () => {
      const target = await processAuthLinkFromUrl();
      if (target) {
        router.navigate({ to: target });
        return;
      }

      const { type } = readAuthLinkFromUrl();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        router.navigate({ to: type === "recovery" ? "/reset-password" : "/" });
      }
    };

    probe().catch((e) => console.error("[auth] session probe failed:", e));
  }, [router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const fail = (err: unknown) => {
    const info = describeAuthError(err);
    setError(info.message);
    if (info.retryAfter) setCooldown(info.retryAfter);
    if (info.kind === "rate_limit") setCooldown(60);
    toast.error(info.message);
    return info;
  };

  const switchMode = (next: "signin" | "signup") => {
    setMode(next);
    setError(null);
    setNotice(null);
    setSent(false);
    setPassword("");
    setConfirmPassword("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (mode === "signup") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords don't match.");
        return;
      }
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const display = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              first_name: firstName.trim() || null,
              last_name: lastName.trim() || null,
              display_name: display || null,
            },
          },
        });
        if (err) throw err;
        if (data.session) {
          toast.success("Account created");
          router.navigate({ to: "/" });
          return;
        }
        // Supabase returns a user with no identities when the email already exists.
        if (data.user && data.user.identities?.length === 0) {
          setError("That email already has an account. Sign in instead, or reset your password.");
          return;
        }
        setSent(true);
        setCooldown(60);
        toast.success("Confirmation email sent");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
        toast.success("Welcome back");
        router.navigate({ to: "/" });
      }
    } catch (err) {
      const info = fail(err);
      if (info.kind === "unconfirmed") setSent(true);
    } finally {
      setBusy(false);
    }
  };

  const resendConfirmation = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const { error: err } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (err) throw err;
      setCooldown(60);
      setNotice("Confirmation email sent again.");
      toast.success("Confirmation email sent");
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) {
      fail(err);
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">Confirm your email</CardTitle>
            <CardDescription>
              We sent a confirmation link to {email || "your inbox"}. Open it to activate your
              account, then sign in. Check your spam folder if it hasn't arrived in a few minutes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
            <Button
              className="w-full"
              onClick={resendConfirmation}
              disabled={busy || cooldown > 0 || !email.trim()}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend confirmation email"}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => switchMode("signin")}>
              Back to sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {mode === "signup"
              ? "Start tracking jobs and tailoring CVs in minutes."
              : "Sign in to continue to ApplyPilot."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-border p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <Button variant="outline" className="w-full" onClick={google} disabled={busy}>
            Continue with Google
          </Button>
          <div className="relative text-center text-xs text-muted-foreground">
            <span className="bg-card px-2 relative z-10">or</span>
            <div className="absolute inset-x-0 top-1/2 -z-0 h-px bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              {mode === "signup" && (
                <p className="text-xs text-muted-foreground">At least 6 characters.</p>
              )}
            </div>
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={busy || cooldown > 0}>
              {busy
                ? "Please wait…"
                : cooldown > 0
                  ? `Try again in ${cooldown}s`
                  : mode === "signup"
                    ? "Create account"
                    : "Sign in"}
            </Button>
          </form>

          {mode === "signin" && (
            <button
              type="button"
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              onClick={() => router.navigate({ to: "/forgot-password" })}
            >
              Forgot your password?
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
