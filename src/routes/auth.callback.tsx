import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { completeAuthCallback, readAuthLinkFromUrl } from "@/lib/auth-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Signing you in · ApplyPilot" },
      { name: "description", content: "Finalizing your ApplyPilot sign-in." },
      { property: "og:title", content: "Signing you in · ApplyPilot" },
      { property: "og:description", content: "Finalizing your ApplyPilot sign-in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthCallback,
});

/** Auth errors arrive either in the query string or in the URL hash. */
function readLinkError(): string | null {
  if (typeof window === "undefined") return null;
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const get = (key: string) => query.get(key) ?? hash.get(key);

  const code = get("error_code");
  const raw = get("error_description")?.replace(/\+/g, " ");
  const error = get("error");
  if (!code && !raw && !error) return null;

  if (code === "otp_expired")
    return "This link has expired. Request a new confirmation or reset email and open it right away.";
  if (error === "access_denied")
    return "This link is no longer valid — it may already have been used. Request a new one.";
  return raw || error || "This link could not be verified.";
}

function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const linkError = readLinkError();
    if (linkError) {
      setError(linkError);
      return;
    }

    let cancelled = false;
    const finish = async () => {
      const { type } = readAuthLinkFromUrl();
      const result = await completeAuthCallback();
      if (cancelled) return;
      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.navigate({ to: type === "recovery" ? "/reset-password" : "/" });
    };
    // Without this the user would sit on "Signing you in…" forever if the probe throws.
    finish().catch((e) => {
      if (!cancelled) setError(e instanceof Error ? e.message : "Sign-in could not be completed.");
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">Sign-in link problem</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.navigate({ to: "/auth" })}>
              Back to sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  );
}
