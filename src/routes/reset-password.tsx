import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { authErrorMessage } from "@/lib/auth-errors";
import { ApplyPilotLogo } from "@/components/ApplyPilotLogo";


export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset password · ApplyPilot" },
      { name: "description", content: "Choose a new password for your ApplyPilot account." },
      { property: "og:title", content: "Reset password · ApplyPilot" },
      { property: "og:description", content: "Choose a new password for your ApplyPilot account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      for (let i = 0; i < 20 && !cancelled; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setReady(true);
          return;
        }
        await new Promise((r) => setTimeout(r, 150));
      }
      if (!cancelled) setError("This reset link is invalid or has expired. Request a new one.");
    };
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      toast.success("Password updated");
      router.navigate({ to: "/" });
    } catch (err) {
      const msg = authErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <ApplyPilotLogo className="mb-2 justify-center" markClassName="h-9 w-9" />
          <CardTitle className="font-serif text-2xl">Set a new password</CardTitle>
          <CardDescription>Choose a password you haven't used before.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={busy || !ready}>
              {busy ? "Updating…" : "Update password"}
            </Button>
          </form>
          {!ready && error && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.navigate({ to: "/forgot-password" })}
            >
              Request a new reset link
            </Button>
          )}

          <button
            type="button"
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
            onClick={() => router.navigate({ to: "/auth" })}
          >
            Back to sign in
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
