import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { describeAuthError } from "@/lib/auth-errors";
import { ApplyPilotLogo } from "@/components/ApplyPilotLogo";

export const Route = createFileRoute("/forgot-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Forgot password · ApplyPilot" },
      {
        name: "description",
        content: "Request a password reset link for your ApplyPilot account.",
      },
      { property: "og:title", content: "Forgot password · ApplyPilot" },
      {
        property: "og:description",
        content: "Request a password reset link for your ApplyPilot account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) throw err;
      setSent(true);
      setCooldown(60);
      toast.success("Password reset email sent");
    } catch (err) {
      const info = describeAuthError(err);
      setError(info.message);
      if (info.retryAfter) setCooldown(info.retryAfter);
      toast.error(info.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <ApplyPilotLogo className="mb-2 justify-center" markClassName="h-9 w-9" />
          <CardTitle className="font-serif text-2xl">
            {sent ? "Check your email" : "Reset your password"}
          </CardTitle>
          <CardDescription>
            {sent
              ? `We sent a reset link to ${email}. Open it to choose a new password — it expires in about an hour.`
              : "Enter the email you signed up with and we'll send you a reset link."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!sent && (
            <form onSubmit={submit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={busy || cooldown > 0}>
                {busy
                  ? "Sending…"
                  : cooldown > 0
                    ? `Try again in ${cooldown}s`
                    : "Send reset link"}
              </Button>
            </form>
          )}

          {sent && (
            <Button
              variant="outline"
              className="w-full"
              disabled={busy || cooldown > 0}
              onClick={submit}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend reset link"}
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
